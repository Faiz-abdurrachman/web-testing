-- Recruitment intake — pass 1 (Supabase Postgres).
--
-- Scope: store the public application form submissions from the website API.
-- No CMS, auth, storage, or admin read surface. Recruitment stays closed until
-- RECRUITMENT_OPEN=true in the Vercel server env.
--
-- Security model (review):
--   * The table and the real logic live in the `private` schema, which is NOT
--     exposed by PostgREST.
--   * The only exposed entrypoint is public.submit_recruitment_application, a
--     thin SECURITY DEFINER wrapper with EXECUTE granted to service_role only.
--   * anon/authenticated have no EXECUTE, no table access, and no USAGE on the
--     private schema, so they cannot read or write applicant data directly.
--
-- This migration assumes the standard Supabase roles anon, authenticated and
-- service_role exist (they always do on a Supabase project). A local test
-- cluster must create them before applying this file.

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

comment on schema private is
  'Internal objects not exposed by PostgREST. No access for anon/authenticated.';

create table if not exists private.recruitment_applications (
  receipt        uuid primary key,
  content_hash   text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  received_at    timestamptz not null default now(),
  schema_version integer not null default 1 check (schema_version >= 1),
  fields         jsonb not null check (jsonb_typeof(fields) = 'object')
);

comment on table private.recruitment_applications is
  'Applicant records (PII). Server-role only; never exposed to anon/authenticated.';

create index if not exists recruitment_applications_received_at_idx
  on private.recruitment_applications (received_at desc);

create index if not exists recruitment_applications_content_hash_idx
  on private.recruitment_applications (content_hash);

-- Defense-in-depth: RLS on with no policies denies every non-owner role. The
-- SECURITY DEFINER functions run as the table owner and bypass RLS.
alter table private.recruitment_applications enable row level security;

revoke all on table private.recruitment_applications
  from public, anon, authenticated;

-- Real logic: idempotent insert keyed by the client receipt.
--   inserted  -> first time for this receipt
--   duplicate -> same receipt and identical canonical content hash
--   ID_CONFLICT (P0001) -> same receipt but different content
create or replace function private.recruitment_submit_intake(
  p_receipt uuid,
  p_hash    text,
  p_fields  jsonb
) returns jsonb
language plpgsql
security definer
set search_path = private, pg_catalog
as $$
declare
  v_inserted      uuid;
  v_existing_hash text;
begin
  insert into private.recruitment_applications (receipt, content_hash, fields)
  values (p_receipt, p_hash, p_fields)
  on conflict (receipt) do nothing
  returning receipt into v_inserted;

  if v_inserted is not null then
    return jsonb_build_object('receipt', p_receipt, 'status', 'inserted');
  end if;

  select content_hash
    into v_existing_hash
    from private.recruitment_applications
   where receipt = p_receipt;

  if v_existing_hash is not distinct from p_hash then
    return jsonb_build_object('receipt', p_receipt, 'status', 'duplicate');
  end if;

  raise exception 'ID_CONFLICT' using errcode = 'P0001';
end;
$$;

revoke all on function private.recruitment_submit_intake(uuid, text, jsonb)
  from public, anon, authenticated;

-- Exposed wrapper (schema public is the PostgREST-exposed schema). Thin only:
-- it forwards to the private function. EXECUTE is granted to service_role only.
create or replace function public.submit_recruitment_application(
  p_receipt uuid,
  p_hash    text,
  p_fields  jsonb
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  return private.recruitment_submit_intake(p_receipt, p_hash, p_fields);
end;
$$;

revoke all on function public.submit_recruitment_application(uuid, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.submit_recruitment_application(uuid, text, jsonb)
  to service_role;