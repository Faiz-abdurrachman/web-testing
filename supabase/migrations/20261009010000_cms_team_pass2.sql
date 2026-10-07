-- CMS pass 2 — team migration: GAS/Sheets/Drive → Supabase Postgres + Storage
--
-- Scope:
--   1. Create private.cms_team_members table
--   2. Create private.cms_team_state table (revision + publication tracking)
--   3. RLS: revoke anon/authenticated, defense-in-depth policies
--   4. Read functions: private + public wrapper (anon SELECT, service_role write)
--   5. Write functions: save/add/delete member (revision guard)
--   6. Storage policies for team media bucket
--   7. Seed data from canonical snapshot
--
-- Security model:
--   * anon: SELECT only via public.cms_load_team (SECURITY DEFINER)
--   * service_role: write via public.cms_save/add/delete_member
--   * No direct table access — private schema USAGE revoked
--
-- This is pass 2 of 6 (projects, team, roles, domains, hods, partners).

-- =============================================
-- 1. Tables
-- =============================================

create table if not exists private.cms_team_members (
  id         text primary key,
  group_id   text not null check (
    group_id in ('leader', 'data', 'core', 'language', 'vision', 'product', 'growth')
  ),
  name       text not null,
  role       text not null,
  photo      text not null,
  position   smallint not null default 1 check (position between 1 and 8),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table private.cms_team_members enable row level security;

create table if not exists private.cms_team_state (
  id                 int primary key default 1,
  revision           text not null default '',
  publication_pending boolean not null default false,
  updated_at         timestamptz not null default now(),
  constraint single_row check (id = 1)
);

alter table private.cms_team_state enable row level security;

-- =============================================
-- 2. RLS
-- =============================================

revoke all on table private.cms_team_members from public, anon, authenticated;
revoke all on table private.cms_team_state from public, anon, authenticated;

-- Defense-in-depth: explicit deny policies
drop policy if exists cms_team_members_insert on private.cms_team_members;
drop policy if exists cms_team_members_update on private.cms_team_members;
drop policy if exists cms_team_members_delete on private.cms_team_members;

create policy cms_team_members_insert on private.cms_team_members
  for insert with check (false);
create policy cms_team_members_update on private.cms_team_members
  for update using (false) with check (false);
create policy cms_team_members_delete on private.cms_team_members
  for delete using (false);

-- =============================================
-- 3. Read functions (private)
-- =============================================

-- Revision helper: deterministic sha256 ordered by group_id, position, id
create or replace function private.cms_team_revision()
returns text language sql stable
set search_path = private, pg_catalog
as $$
  select encode(
    sha256(
      string_agg(
        id || group_id || name || role || photo || position::text,
        '|' order by group_id, position, id
      )::bytea
    ),
    'hex'
  )
  from private.cms_team_members;
$$;

-- Load full state: members + groups + revision + photoPresets + constraints
-- Output shape matches what server/cms-admin.mjs sanitize() expects.
create or replace function private.cms_load_team()
returns jsonb language plpgsql security definer
set search_path = private, pg_catalog
as $$
  declare
    v_members  jsonb;
    v_state    private.cms_team_state%rowtype;
    v_presets  jsonb;
  begin
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'id',      id,
        'group',   group_id,
        'name',    name,
        'role',    role,
        'photo',   photo,
        'order',   position
      ) order by group_id, position, id
    ), '[]'::jsonb) into v_members
    from private.cms_team_members;

    select * into v_state from private.cms_team_state;

    select coalesce(jsonb_agg(distinct photo), '[]'::jsonb) into v_presets
    from private.cms_team_members;

    return jsonb_build_object(
      'members',          v_members,
      'groups',           jsonb_build_array(
        jsonb_build_object('id', 'leader', 'title', ''),
        jsonb_build_object('id', 'data', 'title', 'Data Intelligence'),
        jsonb_build_object('id', 'core', 'title', 'Core AI & Engineering'),
        jsonb_build_object('id', 'language', 'title', 'Language & Reasoning'),
        jsonb_build_object('id', 'vision', 'title', 'Vision & Multimodal'),
        jsonb_build_object('id', 'product', 'title', 'Product & Software'),
        jsonb_build_object('id', 'growth', 'title', 'Growth & Community')
      ),
      'revision',          coalesce(v_state.revision, ''),
      'photoPresets',      v_presets,
      'minMembers',        1,
      'maxMembers',        8,
      'minGroups',         7,
      'publicationPending', coalesce(v_state.publication_pending, false),
      'affectedId',        null
    );
  end;
$$;

-- =============================================
-- 4. Write functions (private)
-- =============================================

-- Save member (update existing)
create or replace function private.cms_save_member(
  p_payload jsonb
) returns jsonb language plpgsql security definer
set search_path = private, pg_catalog
as $$
  declare
    v_revision text;
    v_member   jsonb := p_payload -> 'member';
    v_id       text  := v_member ->> 'id';
    v_group    text  := v_member ->> 'group';
    v_name     text  := v_member ->> 'name';
    v_role     text  := v_member ->> 'role';
    v_photo    text  := v_member ->> 'photo';
    v_order    int   := (v_member ->> 'order')::int;
    v_old_group text;
    v_old_order int;
    v_count    smallint;
  begin
    select revision into v_revision from private.cms_team_state for update;
    if (p_payload ->> 'revision') is null
       or v_revision is distinct from (p_payload ->> 'revision') then
      return jsonb_build_object('error', jsonb_build_object('code', 'CONFLICT'));
    end if;

    if not exists (select 1 from private.cms_team_members where id = v_id) then
      return jsonb_build_object('error', jsonb_build_object('code', 'NOT_FOUND'));
    end if;

    -- Check min per group if moving out
    select group_id, position into v_old_group, v_old_order
    from private.cms_team_members where id = v_id;

    if v_group != v_old_group then
      select count(*)::smallint into v_count
      from private.cms_team_members
      where group_id = v_old_group and id != v_id;
      if v_count < 1 then
        return jsonb_build_object('error', jsonb_build_object('code', 'MINIMUM'));
      end if;
    end if;

    update private.cms_team_members
      set group_id=v_group, name=v_name, role=v_role, photo=v_photo,
          position=v_order, updated_at=now()
      where id=v_id;

    update private.cms_team_state
      set revision = private.cms_team_revision(),
          publication_pending = true,
          updated_at = now();

    select revision into v_revision from private.cms_team_state;
    return private.cms_load_team() ||
      jsonb_build_object('affectedId', v_id, 'revision', v_revision, 'saved', true);
  end;
$$;

-- Add member (UUID server-side)
create or replace function private.cms_add_member(
  p_payload jsonb
) returns jsonb language plpgsql security definer
set search_path = private, pg_catalog
as $$
  declare
    v_revision text;
    v_member   jsonb := p_payload -> 'member';
    v_id       text  := 'member-' || gen_random_uuid()::text;
    v_group    text  := v_member ->> 'group';
    v_name     text  := v_member ->> 'name';
    v_role     text  := v_member ->> 'role';
    v_photo    text  := v_member ->> 'photo';
    v_order    int   := (v_member ->> 'order')::int;
    v_count    smallint;
  begin
    select revision into v_revision from private.cms_team_state for update;
    if (p_payload ->> 'revision') is null
       or v_revision is distinct from (p_payload ->> 'revision') then
      return jsonb_build_object('error', jsonb_build_object('code', 'CONFLICT'));
    end if;

    select count(*)::smallint into v_count
    from private.cms_team_members where group_id = v_group;
    if v_count >= 8 then
      return jsonb_build_object('error', jsonb_build_object('code', 'LIMIT'));
    end if;

    if exists (select 1 from private.cms_team_members where id = v_id) then
      return jsonb_build_object('error', jsonb_build_object('code', 'COLLISION'));
    end if;

    if v_name is null or v_name = '' or v_role is null or v_role = '' then
      return jsonb_build_object('error', jsonb_build_object('code', 'INVALID_INPUT'));
    end if;

    insert into private.cms_team_members (id, group_id, name, role, photo, position)
    values (v_id, v_group, v_name, v_role, v_photo, v_order);

    update private.cms_team_state
      set revision = private.cms_team_revision(),
          publication_pending = true,
          updated_at = now();

    select revision into v_revision from private.cms_team_state;
    return private.cms_load_team() ||
      jsonb_build_object('affectedId', v_id, 'revision', v_revision, 'saved', true);
  end;
$$;

-- Delete member
create or replace function private.cms_delete_member(
  p_payload jsonb
) returns jsonb language plpgsql security definer
set search_path = private, pg_catalog
as $$
  declare
    v_revision text;
    v_id       text := p_payload ->> 'id';
    v_group    text;
    v_count    smallint;
  begin
    select revision into v_revision from private.cms_team_state for update;
    if (p_payload ->> 'revision') is null
       or v_revision is distinct from (p_payload ->> 'revision') then
      return jsonb_build_object('error', jsonb_build_object('code', 'CONFLICT'));
    end if;

    select group_id into v_group from private.cms_team_members where id = v_id;
    if not found then
      return jsonb_build_object('error', jsonb_build_object('code', 'NOT_FOUND'));
    end if;

    select count(*)::smallint into v_count
    from private.cms_team_members where group_id = v_group;
    if v_count <= 1 then
      return jsonb_build_object('error', jsonb_build_object('code', 'MINIMUM'));
    end if;

    delete from private.cms_team_members where id = v_id;

    update private.cms_team_state
      set revision = private.cms_team_revision(),
          publication_pending = true,
          updated_at = now();

    select revision into v_revision from private.cms_team_state;
    return private.cms_load_team() ||
      jsonb_build_object('affectedId', v_id, 'revision', v_revision, 'saved', true);
  end;
$$;

-- =============================================
-- 5. Public wrapper functions
-- =============================================

-- READ: grant to anon + service_role
create or replace function public.cms_load_team()
returns jsonb language plpgsql security definer
set search_path = pg_catalog
as $$
  begin
    return private.cms_load_team();
  end;
$$;

revoke all on function public.cms_load_team() from public, anon, authenticated;
grant execute on function public.cms_load_team() to anon, service_role;

-- WRITE: grant ONLY to service_role
create or replace function public.cms_save_member(p_payload jsonb)
returns jsonb language plpgsql security definer
set search_path = pg_catalog
as $$
  begin
    return private.cms_save_member(p_payload);
  end;
$$;

revoke all on function public.cms_save_member(jsonb) from public, anon, authenticated;
grant execute on function public.cms_save_member(jsonb) to service_role;

create or replace function public.cms_add_member(p_payload jsonb)
returns jsonb language plpgsql security definer
set search_path = pg_catalog
as $$
  begin
    return private.cms_add_member(p_payload);
  end;
$$;

revoke all on function public.cms_add_member(jsonb) from public, anon, authenticated;
grant execute on function public.cms_add_member(jsonb) to service_role;

create or replace function public.cms_delete_member(p_payload jsonb)
returns jsonb language plpgsql security definer
set search_path = pg_catalog
as $$
  begin
    return private.cms_delete_member(p_payload);
  end;
$$;

revoke all on function public.cms_delete_member(jsonb) from public, anon, authenticated;
grant execute on function public.cms_delete_member(jsonb) to service_role;

-- =============================================
-- 6. Storage: team path in cms-media bucket
-- =============================================

drop policy if exists cms_media_team_insert on storage.objects;
drop policy if exists cms_media_team_select on storage.objects;
drop policy if exists cms_media_team_delete on storage.objects;

create policy cms_media_team_select
  on storage.objects for select using (
    bucket_id = 'cms-media'
    and storage.foldername(name) = array['team']
    and auth.role() = 'service_role'
  );

create policy cms_media_team_insert
  on storage.objects for insert with check (
    bucket_id = 'cms-media'
    and storage.foldername(name) = array['team']
    and auth.role() = 'service_role'
  );

create policy cms_media_team_delete
  on storage.objects for delete using (
    bucket_id = 'cms-media'
    and storage.foldername(name) = array['team']
    and auth.role() = 'service_role'
  );

-- =============================================
-- 7. Seed data
-- =============================================

-- Leader team
insert into private.cms_team_members (id, group_id, name, role, photo, position) values
  ('leader-1', 'leader', 'Marchel Shevchenko', 'Founder', 'marchel', 1),
  ('leader-2', 'leader', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 2)
on conflict (id) do nothing;

-- Data Intelligence
insert into private.cms_team_members (id, group_id, name, role, photo, position) values
  ('data-1', 'data', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 1),
  ('data-2', 'data', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 2),
  ('data-3', 'data', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 3),
  ('data-4', 'data', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 4)
on conflict (id) do nothing;

-- Core AI & Engineering
insert into private.cms_team_members (id, group_id, name, role, photo, position) values
  ('core-1', 'core', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 1),
  ('core-2', 'core', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 2),
  ('core-3', 'core', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 3),
  ('core-4', 'core', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 4)
on conflict (id) do nothing;

-- Language & Reasoning
insert into private.cms_team_members (id, group_id, name, role, photo, position) values
  ('language-1', 'language', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 1),
  ('language-2', 'language', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 2),
  ('language-3', 'language', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 3),
  ('language-4', 'language', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 4)
on conflict (id) do nothing;

-- Vision & Multimodal
insert into private.cms_team_members (id, group_id, name, role, photo, position) values
  ('vision-1', 'vision', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 1),
  ('vision-2', 'vision', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 2),
  ('vision-3', 'vision', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 3),
  ('vision-4', 'vision', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 4)
on conflict (id) do nothing;

-- Product & Software
insert into private.cms_team_members (id, group_id, name, role, photo, position) values
  ('product-1', 'product', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 1),
  ('product-2', 'product', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 2),
  ('product-3', 'product', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 3),
  ('product-4', 'product', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 4)
on conflict (id) do nothing;

-- Growth & Community
insert into private.cms_team_members (id, group_id, name, role, photo, position) values
  ('growth-1', 'growth', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 1),
  ('growth-2', 'growth', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 2),
  ('growth-3', 'growth', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 3)
on conflict (id) do nothing;

-- Revision from canonical hash
insert into private.cms_team_state (id, revision)
values (1, (select private.cms_team_revision()))
on conflict (id) do update set revision = (select private.cms_team_revision());
