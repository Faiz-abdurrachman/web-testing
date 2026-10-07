-- Recruitment pass 2 — derived columns, admin read, and audit log.
--
-- Scope:
--   1. Add stored generated columns to private.recruitment_applications so that
--      common queryable fields are indexable without unpacking jsonb.
--   2. Create private.recruitment_audit_log for every admin read action.
--   3. Create private read functions + public wrappers, EXECUTE only to service_role.
--   4. Create private.cms_admin_users allowlist table.
--
-- Security model:
--   * anon/authenticated have no EXECUTE on the public wrapper, no USAGE on
--     the private schema, and no table access — same as pass 1.
--   * service_role can EXECUTE wrappers. Vercel Function holds the service key.
--   * Admin identity is verified from the Supabase Auth JWT (Google provider)
--     then matched against cms_admin_users. The DB only validates the lookup.
--
-- This migration depends on pass 1 migration
-- (20261006120000_recruitment_intake_pass1.sql) having been applied first.

-- =============================================
-- 1. Generated (stored) columns on existing table
-- =============================================
-- These derive from the canonical fields jsonb. They are STORED (computed on
-- write) so they are always consistent and queryable without unpacking.

alter table private.recruitment_applications
  add column if not exists email         text generated always as (fields ->> 'email') stored,
  add column if not exists whatsapp      text generated always as (fields ->> 'whatsapp') stored,
  add column if not exists full_name     text generated always as (fields ->> 'full_name') stored,
  add column if not exists primary_hods  text generated always as (fields ->> 'primary_hods') stored,
  add column if not exists agreement_1   boolean generated always as ((fields ->> 'agreement_1') = 'on') stored,
  add column if not exists agreement_2   boolean generated always as ((fields ->> 'agreement_2') = 'on') stored,
  add column if not exists agreement_3   boolean generated always as ((fields ->> 'agreement_3') = 'on') stored,
  add column if not exists team_comfort  smallint generated always as (
    case (fields ->> 'team_comfort')
      when '1' then 1 when '2' then 2 when '3' then 3 when '4' then 4 when '5' then 5
      else null
    end
  ) stored;

comment on column private.recruitment_applications.email is 'Derived generated column for queryable email';
comment on column private.recruitment_applications.full_name is 'Derived generated column for queryable name';
comment on column private.recruitment_applications.primary_hods is 'Derived generated column for queryable domain filter';

create index if not exists recruitment_apps_email_idx
  on private.recruitment_applications (email);
create index if not exists recruitment_apps_primary_hods_idx
  on private.recruitment_applications (primary_hods);
create index if not exists recruitment_apps_full_name_idx
  on private.recruitment_applications (full_name);

-- =============================================
-- 2. Audit log
-- =============================================

create table if not exists private.recruitment_audit_log (
  id          bigserial primary key,
  action      text not null check (action in (
    'admin_read_list', 'admin_read_detail', 'admin_export', 'admin_stats'
  )),
  actor_id    text not null,           -- Supabase Auth user ID
  actor_email text not null default '', -- email from the JWT
  target_id   uuid,                    -- receipt, null for list/stats
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

comment on table private.recruitment_audit_log is
  'Every admin read action on applicant data is logged here (who, when, what).';

create index if not exists recruitment_audit_actor_idx
  on private.recruitment_audit_log (actor_id);
create index if not exists recruitment_audit_created_idx
  on private.recruitment_audit_log (created_at desc);

alter table private.recruitment_audit_log enable row level security;
revoke all on table private.recruitment_audit_log
  from public, anon, authenticated;

-- =============================================
-- 3. Admin allowlist
-- =============================================

create table if not exists private.cms_admin_users (
  id         serial primary key,
  auth_id    text not null unique,     -- Supabase Auth user ID (sub from JWT)
  email      text not null,
  created_at timestamptz not null default now(),
  active     boolean not null default true
);

comment on table private.cms_admin_users is
  'Allowlist of Supabase Auth user IDs permitted to access admin routes.';

alter table private.cms_admin_users enable row level security;
revoke all on table private.cms_admin_users
  from public, anon, authenticated;

-- =============================================
-- 4. Audit log write function (private)
-- =============================================

create or replace function private.recruitment_audit_write(
  p_action     text,
  p_actor_id   text,
  p_actor_email text default '',
  p_target_id  uuid default null,
  p_details    jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = private, pg_catalog
as $$
begin
  insert into private.recruitment_audit_log
    (action, actor_id, actor_email, target_id, details)
  values
    (p_action, p_actor_id, p_actor_email, p_target_id, p_details);
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function private.recruitment_audit_write(text, text, text, uuid, jsonb)
  from public, anon, authenticated;

-- =============================================
-- 5. Admin read functions (private)
-- =============================================

-- List applications with optional filters.
-- p_filters can contain: search (text), primary_hods (text),
-- since (timestamptz), until (timestamptz), limit (int, max 200), offset (int).
create or replace function private.recruitment_list_applications(
  p_filters jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = private, pg_catalog
as $$
declare
  v_search    text := p_filters ->> 'search';
  v_hods      text := p_filters ->> 'primary_hods';
  v_since     timestamptz := (p_filters ->> 'since')::timestamptz;
  v_until     timestamptz := (p_filters ->> 'until')::timestamptz;
  v_limit     int := least(coalesce((p_filters ->> 'limit')::int, 50), 200);
  v_offset    int := coalesce((p_filters ->> 'offset')::int, 0);
  v_result    jsonb;
begin
  select jsonb_agg(
    jsonb_build_object(
      'receipt',       receipt,
      'full_name',     full_name,
      'email',         email,
      'whatsapp',      whatsapp,
      'primary_hods',  primary_hods,
      'received_at',   received_at,
      'schema_version', schema_version
    ) order by received_at desc
  ) into v_result
  from private.recruitment_applications
  where (v_search is null or v_search = ''
      or full_name ilike '%' || v_search || '%'
      or email ilike '%' || v_search || '%')
    and (v_hods is null or v_hods = '' or primary_hods = v_hods)
    and (v_since is null or received_at >= v_since)
    and (v_until is null or received_at <= v_until);

  return jsonb_build_object(
    'applications', coalesce(v_result, '[]'::jsonb),
    'total',        coalesce((select count(*)::int from private.recruitment_applications), 0),
    'filtered',     coalesce(jsonb_array_length(v_result), 0)
  );
end;
$$;

revoke all on function private.recruitment_list_applications(jsonb)
  from public, anon, authenticated;

-- Get a single application by receipt.
create or replace function private.recruitment_get_application(
  p_receipt uuid
) returns jsonb
language plpgsql
security definer
set search_path = private, pg_catalog
as $$
declare
  v_row private.recruitment_applications%rowtype;
begin
  select * into v_row
    from private.recruitment_applications
    where receipt = p_receipt;

  if not found then
    return jsonb_build_object('found', false);
  end if;

  return jsonb_build_object(
    'found',          true,
    'receipt',        v_row.receipt,
    'content_hash',   v_row.content_hash,
    'received_at',    v_row.received_at,
    'schema_version', v_row.schema_version,
    'fields',         v_row.fields,
    'email',          v_row.email,
    'whatsapp',       v_row.whatsapp,
    'full_name',      v_row.full_name,
    'primary_hods',   v_row.primary_hods,
    'agreement_1',    v_row.agreement_1,
    'agreement_2',    v_row.agreement_2,
    'agreement_3',    v_row.agreement_3,
    'team_comfort',   v_row.team_comfort
  );
end;
$$;

revoke all on function private.recruitment_get_application(uuid)
  from public, anon, authenticated;

-- Stats: counts by primary_hods.
create or replace function private.recruitment_get_stats()
returns jsonb
language plpgsql
security definer
set search_path = private, pg_catalog
as $$
declare
  v_by_hods jsonb;
  v_total   int;
begin
  select jsonb_agg(
    jsonb_build_object(
      'hods',  primary_hods,
      'count', cnt
    ) order by cnt desc
  ), sum(cnt)::int
  into v_by_hods, v_total
  from (
    select primary_hods, count(*)::int as cnt
      from private.recruitment_applications
      group by primary_hods
  ) t;

  return jsonb_build_object(
    'total',   v_total,
    'by_hods', coalesce(v_by_hods, '[]'::jsonb)
  );
end;
$$;

revoke all on function private.recruitment_get_stats()
  from public, anon, authenticated;

-- Verify admin identity: lookup auth_id in allowlist.
create or replace function private.recruitment_verify_admin(
  p_auth_id text
) returns jsonb
language plpgsql
security definer
set search_path = private, pg_catalog
as $$
declare
  v_row private.cms_admin_users%rowtype;
begin
  select * into v_row
    from private.cms_admin_users
    where auth_id = p_auth_id and active = true;

  if not found then
    return jsonb_build_object('ok', false);
  end if;

  return jsonb_build_object('ok', true, 'email', v_row.email);
end;
$$;

revoke all on function private.recruitment_verify_admin(text)
  from public, anon, authenticated;

-- =============================================
-- 6. Public wrappers (schema "public", exposed by PostgREST)
-- =============================================

create or replace function public.admin_list_applications(
  p_filters jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  return private.recruitment_list_applications(p_filters);
end;
$$;

revoke all on function public.admin_list_applications(jsonb)
  from public, anon, authenticated;
grant execute on function public.admin_list_applications(jsonb)
  to service_role;

create or replace function public.admin_get_application(
  p_receipt uuid
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  return private.recruitment_get_application(p_receipt);
end;
$$;

revoke all on function public.admin_get_application(uuid)
  from public, anon, authenticated;
grant execute on function public.admin_get_application(uuid)
  to service_role;

create or replace function public.admin_get_stats()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  return private.recruitment_get_stats();
end;
$$;

revoke all on function public.admin_get_stats()
  from public, anon, authenticated;
grant execute on function public.admin_get_stats()
  to service_role;

create or replace function public.admin_verify_identity(
  p_auth_id text
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  return private.recruitment_verify_admin(p_auth_id);
end;
$$;

revoke all on function public.admin_verify_identity(text)
  from public, anon, authenticated;
grant execute on function public.admin_verify_identity(text)
  to service_role;

-- Audit write wrapper (called by the Vercel Function after every admin read).
create or replace function public.admin_audit_write(
  p_action       text,
  p_actor_id     text,
  p_actor_email  text default '',
  p_target_id    uuid default null,
  p_details      jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  return private.recruitment_audit_write(p_action, p_actor_id, p_actor_email, p_target_id, p_details);
end;
$$;

revoke all on function public.admin_audit_write(text, text, text, uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.admin_audit_write(text, text, text, uuid, jsonb)
  to service_role;
