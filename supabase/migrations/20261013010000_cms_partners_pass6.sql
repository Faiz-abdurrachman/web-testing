-- CMS pass 6: Partners content only; counts/icons/artwork remain local.
-- Additive seed; reruns preserve existing content. Unicode limits match Zod codepoints.
begin;

create or replace function private.cms_partners_items_valid(items jsonb, kind text)
returns boolean language plpgsql immutable
set search_path = pg_catalog
as $$
declare
  item jsonb;
  field text;
  fields text[];
  expected_count integer;
begin
  if kind = 'category' then
    fields := array['label']; expected_count := 3;
  elsif kind = 'why' then
    fields := array['description','title']; expected_count := 4;
  else return false;
  end if;
  if items is null then return false; end if;
  if jsonb_typeof(items) <> 'array' then return false; end if;
  if jsonb_array_length(items) <> expected_count then return false; end if;
  for item in select value from jsonb_array_elements(items) loop
    if jsonb_typeof(item) <> 'object' then return false; end if;
    if (select array_agg(key order by key) from jsonb_object_keys(item) as keys(key)) is distinct from fields then return false; end if;
    foreach field in array fields loop
      if jsonb_typeof(item -> field) <> 'string' then return false; end if;
      if char_length(item ->> field) not between 1 and 20000 then return false; end if;
    end loop;
  end loop;
  return true;
end;
$$;
revoke all on function private.cms_partners_items_valid(jsonb,text) from public, anon, authenticated, service_role;

create or replace function private.cms_partners_logo_valid(value text)
returns boolean language sql immutable
set search_path = pg_catalog
as $$
  select coalesce(value ~ '^/images/[a-zA-Z0-9_./-]+$'
    and value !~ '[^a-zA-Z0-9_./-]' and strpos(value, '..') = 0, false);
$$;
revoke all on function private.cms_partners_logo_valid(text) from public, anon, authenticated, service_role;

create table if not exists private.cms_partners (
  id smallint primary key check (id = 1),
  partner_categories jsonb not null check (private.cms_partners_items_valid(partner_categories, 'category') is true),
  partner_logo text not null check (private.cms_partners_logo_valid(partner_logo) is true),
  why_partners jsonb not null check (private.cms_partners_items_valid(why_partners, 'why') is true),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table private.cms_partners enable row level security;
revoke all on private.cms_partners from public, anon, authenticated, service_role;
drop policy if exists cms_partners_deny on private.cms_partners;
create policy cms_partners_deny on private.cms_partners for all using (false) with check (false);

create or replace function private.cms_load_partners()
returns jsonb language sql stable security definer
set search_path = pg_catalog
as $$
  select jsonb_build_object('partners', (select jsonb_build_object(
    'partnerCategories', partner_categories, 'partnerLogo', partner_logo,
    'whyPartners', why_partners
  ) from private.cms_partners where id = 1));
$$;
revoke all on function private.cms_load_partners() from public, anon, authenticated, service_role;

create or replace function public.cms_load_partners()
returns jsonb language sql stable security definer
set search_path = pg_catalog
as $$ select private.cms_load_partners(); $$;
revoke all on function public.cms_load_partners() from public, anon, authenticated, service_role;
grant execute on function public.cms_load_partners() to anon, service_role;

insert into private.cms_partners (id, partner_categories, partner_logo, why_partners)
values (1, '[{"label":"Industry"},{"label":"Academia"},{"label":"Community"}]'::jsonb,
  '/images/partners/partner-logo.webp',
  '[{"title":"Talent","description":"Access to emerging AI & Data talent."},{"title":"Research","description":"Collaborate on meaningful research."},{"title":"Innovation","description":"Explore new technologies and ideas."},{"title":"Community","description":"Reach a growing technology community."}]'::jsonb)
on conflict (id) do nothing;

commit;
