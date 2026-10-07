-- CMS auth pass 7: isolated CMS admin permission allowlist + CMS login rate limit.
--
-- Scope:
--   1. private.cms_admin_permissions — CMS owner allowlist keyed by the trusted
--      Supabase Auth user id (auth.users.id is uuid; recruitment's
--      private.cms_admin_users.auth_id is text and stays untouched).
--   2. private.cms_rate_limit — CMS-specific login rate limit, separate from
--      private.recruitment_rate_limit.
--   3. SECURITY DEFINER helpers + public wrappers, EXECUTE only to service_role.
--
-- Security model (additive, deny by default):
--   * No anon/authenticated table access; no direct CMS writes for authenticated.
--   * Vercel Function verifies a trusted Auth identity per request, then calls
--     cms_verify_admin with service_role.
--   * No owner email/uid/secret is hardcoded here; grants are provisioned
--     privately after identity mapping is approved.

begin;

-- =============================================
-- 1. CMS admin permission allowlist
-- =============================================

create table if not exists private.cms_admin_permissions (
  auth_id    uuid primary key,
  email      text not null default '',
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table private.cms_admin_permissions is
  'CMS owner allowlist keyed by trusted Supabase Auth user id. Separate from recruitment.';

alter table private.cms_admin_permissions enable row level security;
revoke all on table private.cms_admin_permissions
  from public, anon, authenticated, service_role;
drop policy if exists cms_admin_permissions_deny on private.cms_admin_permissions;
create policy cms_admin_permissions_deny on private.cms_admin_permissions
  for all using (false) with check (false);

-- =============================================
-- 2. CMS login rate limit (separate from recruitment)
-- =============================================

create table if not exists private.cms_rate_limit (
  id           bigserial primary key,
  ip_address   text not null,
  email        text not null,
  attempted_at timestamptz not null default now()
);

comment on table private.cms_rate_limit is
  'CMS login rate limit tracking. Separate from recruitment.';

create index if not exists cms_rate_limit_lookup_idx
  on private.cms_rate_limit (ip_address, email, attempted_at desc);
create index if not exists cms_rate_limit_cleanup_idx
  on private.cms_rate_limit (attempted_at);

alter table private.cms_rate_limit enable row level security;
revoke all on table private.cms_rate_limit
  from public, anon, authenticated, service_role;
drop policy if exists cms_rate_limit_deny on private.cms_rate_limit;
create policy cms_rate_limit_deny on private.cms_rate_limit
  for all using (false) with check (false);

-- =============================================
-- 3. Private helpers
-- =============================================

create or replace function private.cms_verify_admin(
  p_auth_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_row private.cms_admin_permissions%rowtype;
begin
  if p_auth_id is null then
    return jsonb_build_object('ok', false);
  end if;

  select * into v_row
    from private.cms_admin_permissions
    where auth_id = p_auth_id and active = true;

  if not found then
    return jsonb_build_object('ok', false);
  end if;

  return jsonb_build_object('ok', true, 'email', v_row.email);
end;
$$;
revoke all on function private.cms_verify_admin(uuid)
  from public, anon, authenticated, service_role;

create or replace function private.cms_rate_limit_check(
  p_ip     text,
  p_email  text,
  p_max    int default 5,
  p_window int default 60
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_count int;
begin
  delete from private.cms_rate_limit
    where attempted_at < now() - (p_window || ' seconds')::interval;

  select count(*) into v_count
    from private.cms_rate_limit
    where ip_address = p_ip
      and email = p_email
      and attempted_at > now() - (p_window || ' seconds')::interval;

  if v_count >= p_max then
    return jsonb_build_object('ok', false, 'limited', true);
  end if;

  insert into private.cms_rate_limit (ip_address, email)
    values (p_ip, p_email);

  return jsonb_build_object('ok', true, 'limited', false);
end;
$$;
revoke all on function private.cms_rate_limit_check(text, text, int, int)
  from public, anon, authenticated, service_role;

create or replace function private.cms_rate_limit_reset(
  p_ip    text,
  p_email text
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  delete from private.cms_rate_limit
    where ip_address = p_ip and email = p_email;
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function private.cms_rate_limit_reset(text, text)
  from public, anon, authenticated, service_role;

-- =============================================
-- 4. Public wrappers (service_role only)
-- =============================================

create or replace function public.cms_verify_admin(
  p_auth_id uuid
) returns jsonb
language sql
security definer
set search_path = pg_catalog
as $$ select private.cms_verify_admin(p_auth_id); $$;
revoke all on function public.cms_verify_admin(uuid)
  from public, anon, authenticated;
grant execute on function public.cms_verify_admin(uuid)
  to service_role;

create or replace function public.cms_rate_limit_check(
  p_ip     text,
  p_email  text,
  p_max    int default 5,
  p_window int default 60
) returns jsonb
language sql
security definer
set search_path = pg_catalog
as $$ select private.cms_rate_limit_check(p_ip, p_email, p_max, p_window); $$;
revoke all on function public.cms_rate_limit_check(text, text, int, int)
  from public, anon, authenticated;
grant execute on function public.cms_rate_limit_check(text, text, int, int)
  to service_role;

create or replace function public.cms_rate_limit_reset(
  p_ip    text,
  p_email text
) returns jsonb
language sql
security definer
set search_path = pg_catalog
as $$ select private.cms_rate_limit_reset(p_ip, p_email); $$;
revoke all on function public.cms_rate_limit_reset(text, text)
  from public, anon, authenticated;
grant execute on function public.cms_rate_limit_reset(text, text)
  to service_role;

commit;