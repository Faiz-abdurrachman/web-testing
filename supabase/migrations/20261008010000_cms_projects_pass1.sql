-- CMS pass 1 — projects migration: GAS/Sheets/Drive → Supabase Postgres + Storage
--
-- Scope:
--   1. Create private.cms_projects table (data projects)
--   2. Create private.cms_projects_state table (revision + publication tracking)
--   3. RLS: revoke anon/authenticated, defense-in-depth policies
--   4. Read functions: private + public wrapper (anon SELECT, service_role write)
--   5. Write functions: save/add/delete (revision guard, deploy hooks called by server)
--   6. Seed data from canonical snapshot
--
-- Security model:
--   * anon: SELECT only via public.cms_load_projects (SECURITY DEFINER)
--   * service_role: write via public.cms_save/add/delete_project
--   * No direct table access — private schema USAGE revoked
--
-- This is pass 1 of 6 (projects, team, roles, domains, hods, partners).

-- =============================================
-- 1. Tables
-- =============================================

create table if not exists private.cms_projects (
  id          text primary key,
  title       text not null,
  tags        jsonb not null default '[]'::jsonb,
  description text not null,
  image       text not null,
  position    smallint not null default 1 check (position between 1 and 8),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table private.cms_projects enable row level security;

create table if not exists private.cms_projects_state (
  id                 int primary key default 1,
  revision           text not null default '',
  publication_pending boolean not null default false,
  updated_at         timestamptz not null default now(),
  constraint single_row check (id = 1)
);

alter table private.cms_projects_state enable row level security;

-- =============================================
-- 2. RLS
-- =============================================

revoke all on table private.cms_projects from public, anon, authenticated;
revoke all on table private.cms_projects_state from public, anon, authenticated;

-- Defense-in-depth: explicit deny policies
drop policy if exists cms_projects_insert on private.cms_projects;
drop policy if exists cms_projects_update on private.cms_projects;
drop policy if exists cms_projects_delete on private.cms_projects;

create policy cms_projects_insert on private.cms_projects
  for insert with check (false);
create policy cms_projects_update on private.cms_projects
  for update using (false) with check (false);
create policy cms_projects_delete on private.cms_projects
  for delete using (false);

-- =============================================
-- 3. Read functions (private)
-- =============================================

-- Revision helper: deterministic sha256 of record set ordered by position, id
create or replace function private.cms_projects_revision()
returns text language sql stable
set search_path = private, pg_catalog
as $$
  select encode(
    sha256(
      string_agg(
        id || title || tags::text || description || image || position::text,
        '|' order by position, id
      )::bytea
    ),
    'hex'
  )
  from private.cms_projects;
$$;

-- Load full state: projects + revision + imagePresets + constraints
create or replace function private.cms_load_projects()
returns jsonb language plpgsql security definer
set search_path = private, pg_catalog
as $$
  declare
    v_records  jsonb;
    v_state    private.cms_projects_state%rowtype;
    v_images   jsonb;
  begin
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'id',          id,
        'title',       title,
        'tags',        tags,
        'description', description,
        'image',       image
      ) order by position, id
    ), '[]'::jsonb) into v_records
    from private.cms_projects;

    select * into v_state from private.cms_projects_state;

    select coalesce(jsonb_agg(distinct image), '[]'::jsonb) into v_images
    from private.cms_projects;

    return jsonb_build_object(
      'projects',          v_records,
      'revision',          coalesce(v_state.revision, ''),
      'imagePresets',      v_images,
      'minProjects',       1,
      'maxProjects',       8,
      'publicationPending', coalesce(v_state.publication_pending, false),
      'affectedId',        null
    );
  end;
$$;

-- =============================================
-- 4. Write functions (private)
-- =============================================

-- Save project (upsert existing)
create or replace function private.cms_save_project(
  p_payload jsonb
) returns jsonb language plpgsql security definer
set search_path = private, pg_catalog
as $$
  declare
    v_revision text;
    v_project  jsonb := p_payload -> 'project';
    v_id       text  := v_project ->> 'id';
    v_title    text  := v_project ->> 'title';
    v_tags     jsonb := v_project -> 'tags';
    v_desc     text  := v_project ->> 'description';
    v_image    text  := v_project ->> 'image';
  begin
    select revision into v_revision from private.cms_projects_state for update;
    if (p_payload ->> 'revision') is null
       or v_revision is distinct from (p_payload ->> 'revision') then
      return jsonb_build_object('error', jsonb_build_object('code', 'CONFLICT'));
    end if;

    if not exists (select 1 from private.cms_projects where id = v_id) then
      return jsonb_build_object('error', jsonb_build_object('code', 'NOT_FOUND'));
    end if;

    if v_image is null or v_image = '' then
      return jsonb_build_object('error', jsonb_build_object('code', 'INVALID_INPUT'));
    end if;

    update private.cms_projects
      set title=v_title, tags=v_tags, description=v_desc, image=v_image,
          updated_at=now()
      where id=v_id;

    update private.cms_projects_state
      set revision = private.cms_projects_revision(),
          publication_pending = true,
          updated_at = now();

    select revision into v_revision from private.cms_projects_state;
    return private.cms_load_projects() ||
      jsonb_build_object('affectedId', v_id, 'revision', v_revision, 'saved', true);
  end;
$$;

-- Add project (UUID server-side)
create or replace function private.cms_add_project(
  p_payload jsonb
) returns jsonb language plpgsql security definer
set search_path = private, pg_catalog
as $$
  declare
    v_revision text;
    v_project  jsonb := p_payload -> 'project';
    v_id       text  := 'project-' || gen_random_uuid()::text;
    v_title    text  := v_project ->> 'title';
    v_tags     jsonb := v_project -> 'tags';
    v_desc     text  := v_project ->> 'description';
    v_image    text  := v_project ->> 'image';
    v_count    smallint;
  begin
    select revision into v_revision from private.cms_projects_state for update;
    if (p_payload ->> 'revision') is null
       or v_revision is distinct from (p_payload ->> 'revision') then
      return jsonb_build_object('error', jsonb_build_object('code', 'CONFLICT'));
    end if;

    select count(*)::smallint into v_count from private.cms_projects;
    if v_count >= 8 then
      return jsonb_build_object('error', jsonb_build_object('code', 'LIMIT'));
    end if;

    if exists (select 1 from private.cms_projects where id = v_id) then
      return jsonb_build_object('error', jsonb_build_object('code', 'COLLISION'));
    end if;

    if v_image is null or v_image = '' or v_title is null or v_title = '' then
      return jsonb_build_object('error', jsonb_build_object('code', 'INVALID_INPUT'));
    end if;

    insert into private.cms_projects (id, title, tags, description, image, position)
    values (v_id, v_title, v_tags, v_desc, v_image, v_count + 1);

    update private.cms_projects_state
      set revision = private.cms_projects_revision(),
          publication_pending = true,
          updated_at = now();

    select revision into v_revision from private.cms_projects_state;
    return private.cms_load_projects() ||
      jsonb_build_object('affectedId', v_id, 'revision', v_revision, 'saved', true);
  end;
$$;

-- Delete project
create or replace function private.cms_delete_project(
  p_payload jsonb
) returns jsonb language plpgsql security definer
set search_path = private, pg_catalog
as $$
  declare
    v_revision text;
    v_id       text := p_payload ->> 'id';
    v_count    smallint;
  begin
    select revision into v_revision from private.cms_projects_state for update;
    if (p_payload ->> 'revision') is null
       or v_revision is distinct from (p_payload ->> 'revision') then
      return jsonb_build_object('error', jsonb_build_object('code', 'CONFLICT'));
    end if;

    select count(*)::smallint into v_count from private.cms_projects;
    if v_count <= 1 then
      return jsonb_build_object('error', jsonb_build_object('code', 'MINIMUM'));
    end if;

    delete from private.cms_projects where id = v_id;
    if not found then
      return jsonb_build_object('error', jsonb_build_object('code', 'NOT_FOUND'));
    end if;

    update private.cms_projects
      set position = row_number() over (order by position, id)
      where true;

    update private.cms_projects_state
      set revision = private.cms_projects_revision(),
          publication_pending = true,
          updated_at = now();

    select revision into v_revision from private.cms_projects_state;
    return private.cms_load_projects() ||
      jsonb_build_object('affectedId', v_id, 'revision', v_revision, 'saved', true);
  end;
$$;

-- =============================================
-- 5. Public wrapper functions
-- =============================================

-- READ: grant to anon + service_role
create or replace function public.cms_load_projects()
returns jsonb language plpgsql security definer
set search_path = pg_catalog
as $$
  begin
    return private.cms_load_projects();
  end;
$$;

revoke all on function public.cms_load_projects() from public, anon, authenticated;
grant execute on function public.cms_load_projects() to anon, service_role;

-- WRITE: grant ONLY to service_role
create or replace function public.cms_save_project(p_payload jsonb)
returns jsonb language plpgsql security definer
set search_path = pg_catalog
as $$
  begin
    return private.cms_save_project(p_payload);
  end;
$$;

revoke all on function public.cms_save_project(jsonb) from public, anon, authenticated;
grant execute on function public.cms_save_project(jsonb) to service_role;

create or replace function public.cms_add_project(p_payload jsonb)
returns jsonb language plpgsql security definer
set search_path = pg_catalog
as $$
  begin
    return private.cms_add_project(p_payload);
  end;
$$;

revoke all on function public.cms_add_project(jsonb) from public, anon, authenticated;
grant execute on function public.cms_add_project(jsonb) to service_role;

create or replace function public.cms_delete_project(p_payload jsonb)
returns jsonb language plpgsql security definer
set search_path = pg_catalog
as $$
  begin
    return private.cms_delete_project(p_payload);
  end;
$$;

revoke all on function public.cms_delete_project(jsonb) from public, anon, authenticated;
grant execute on function public.cms_delete_project(jsonb) to service_role;

-- =============================================
-- 6. Seed data
-- =============================================

insert into private.cms_projects (id, title, tags, description, image, position) values
  ('arutala', 'Arutala Aksara', '["HoDS Apa","Lomba/research"]'::jsonb, 'Lorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum', '/images/projects/arutala-aksara.webp', 1),
  ('nusantara-ocr', 'Nusantara OCR', '["HoDS Vision","Open Source"]'::jsonb, 'Lorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum', '/images/projects/arutala-aksara.webp', 2),
  ('pralaya', 'Pralaya Predictor', '["HoDS Data","Research"]'::jsonb, 'Lorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum', '/images/projects/arutala-aksara.webp', 3),
  ('kriya', 'Kriya Design System', '["HoDS Product","Community"]'::jsonb, 'Lorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum', '/images/projects/arutala-aksara.webp', 4)
on conflict (id) do nothing;

insert into private.cms_projects_state (id, revision)
values (1, (select private.cms_projects_revision()))
on conflict (id) do update set revision = (select private.cms_projects_revision());
