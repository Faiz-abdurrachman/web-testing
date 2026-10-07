-- Recruitment pass 3 — rate limit login + refresh token.
--
-- Scope:
--   1. Create private.recruitment_rate_limit table for shared rate limit
--      tracking across Vercel serverless instances.
--   2. Function to check & increment rate limit attempts.
--   3. Function to reset rate limit on successful login.
--   4. Periodic cleanup of expired rows.
--
-- Rate limit policy:
--   * 5 attempts per IP + email combination per sliding 60-second window.
--   * Response 429 with LIMIT code, no detail about which limit triggered.
--   * Cleanup removes rows older than 5 minutes (keeps table small).
--
-- Security model:
--   * Table in private schema, no anon/authenticated access.
--   * Functions are SECURITY DEFINER, EXECUTE only to service_role.
--   * Public wrappers for rate_limit_check + rate_limit_reset.

-- =============================================
-- 1. Rate limit table
-- =============================================

create table if not exists private.recruitment_rate_limit (
  id          bigserial primary key,
  ip_address  text not null,
  email       text not null,
  attempted_at timestamptz not null default now()
);

comment on table private.recruitment_rate_limit is
  'Login rate limit tracking. Rows older than 5 min are cleaned periodically.';

create index if not exists recruitment_rate_limit_lookup_idx
  on private.recruitment_rate_limit (ip_address, email, attempted_at desc);

create index if not exists recruitment_rate_limit_cleanup_idx
  on private.recruitment_rate_limit (attempted_at);

alter table private.recruitment_rate_limit enable row level security;
revoke all on table private.recruitment_rate_limit
  from public, anon, authenticated;

-- =============================================
-- 2. Rate limit check + increment function
-- =============================================

create or replace function private.recruitment_rate_limit_check(
  p_ip      text,
  p_email   text,
  p_max     int default 5,
  p_window  int default 60  -- seconds
) returns jsonb
language plpgsql
security definer
set search_path = private, pg_catalog
as $$
declare
  v_count int;
begin
  -- Delete expired rows first (lightweight cleanup on every check)
  delete from private.recruitment_rate_limit
    where attempted_at < now() - (p_window || ' seconds')::interval;

  -- Count attempts within the window for this IP + email
  select count(*) into v_count
    from private.recruitment_rate_limit
    where ip_address = p_ip
      and email = p_email
      and attempted_at > now() - (p_window || ' seconds')::interval;

  if v_count >= p_max then
    return jsonb_build_object('ok', false, 'limited', true);
  end if;

  -- Insert this attempt
  insert into private.recruitment_rate_limit
    (ip_address, email)
  values (p_ip, p_email);

  return jsonb_build_object('ok', true, 'limited', false);
end;
$$;

revoke all on function private.recruitment_rate_limit_check(text, text, int, int)
  from public, anon, authenticated;

-- =============================================
-- 3. Reset rate limit on successful login
-- =============================================

create or replace function private.recruitment_rate_limit_reset(
  p_ip    text,
  p_email text
) returns jsonb
language plpgsql
security definer
set search_path = private, pg_catalog
as $$
begin
  delete from private.recruitment_rate_limit
    where ip_address = p_ip
      and email = p_email;
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function private.recruitment_rate_limit_reset(text, text)
  from public, anon, authenticated;

-- =============================================
-- 4. Manual cleanup for expired rows (can be called on schedule)
-- =============================================

create or replace function private.recruitment_rate_limit_cleanup(
  p_age_minutes int default 5
) returns jsonb
language plpgsql
security definer
set search_path = private, pg_catalog
as $$
declare
  v_deleted int;
begin
  delete from private.recruitment_rate_limit
    where attempted_at < now() - (p_age_minutes || ' minutes')::interval;
  get diagnostics v_deleted = row_count;
  return jsonb_build_object('ok', true, 'deleted', v_deleted);
end;
$$;

revoke all on function private.recruitment_rate_limit_cleanup(int)
  from public, anon, authenticated;

-- =============================================
-- 5. Public wrappers
-- =============================================

create or replace function public.admin_rate_limit_check(
  p_ip      text,
  p_email   text,
  p_max     int default 5,
  p_window  int default 60
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  return private.recruitment_rate_limit_check(p_ip, p_email, p_max, p_window);
end;
$$;

revoke all on function public.admin_rate_limit_check(text, text, int, int)
  from public, anon, authenticated;
grant execute on function public.admin_rate_limit_check(text, text, int, int)
  to service_role;

create or replace function public.admin_rate_limit_reset(
  p_ip    text,
  p_email text
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  return private.recruitment_rate_limit_reset(p_ip, p_email);
end;
$$;

revoke all on function public.admin_rate_limit_reset(text, text)
  from public, anon, authenticated;
grant execute on function public.admin_rate_limit_reset(text, text)
  to service_role;

create or replace function public.admin_rate_limit_cleanup(
  p_age_minutes int default 5
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  return private.recruitment_rate_limit_cleanup(p_age_minutes);
end;
$$;

revoke all on function public.admin_rate_limit_cleanup(int)
  from public, anon, authenticated;
grant execute on function public.admin_rate_limit_cleanup(int)
  to service_role;
