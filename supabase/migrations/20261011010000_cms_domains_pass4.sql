-- CMS pass 4: fixed public Domains; no editor, writes, state or Storage.
-- Seed is additive: reruns preserve existing content.
begin;

-- JavaScript/Zod string lengths count UTF-16 code units, including surrogate pairs.
create or replace function private.cms_domains_utf16_length(value text)
returns integer language sql immutable strict
set search_path = pg_catalog
as $$
  select coalesce(sum(case when ascii(substr(value, i, 1)) > 65535 then 2 else 1 end), 0)::integer
  from generate_series(1, char_length(value)) as units(i);
$$;
revoke all on function private.cms_domains_utf16_length(text) from public, anon, authenticated;

create or replace function private.cms_domains_labels_valid(domain_id text, labels jsonb)
returns boolean language plpgsql immutable
set search_path = pg_catalog
as $$
declare
  mask jsonb;
  row_value jsonb;
  slot_value jsonb;
  slot_text text;
  r integer;
  s integer;
begin
  mask := case domain_id
    when 'data' then '[[false,true,false,false],[true,true],[false,true,false]]'::jsonb
    when 'core' then '[[false,true,false,false],[true,true],[false,true,false]]'::jsonb
    when 'language' then '[[false,true,false,false],[true,true,false],[false,true,true]]'::jsonb
    when 'vision' then '[[false,true,false,false],[true,true,false],[false,true,false]]'::jsonb
    when 'product' then '[[false,true,false,false],[false,true,true,false],[false,true,true,false]]'::jsonb
    when 'growth' then '[[false,true,false,false],[false,true,false],[false,true,false]]'::jsonb
    else null end;
  if mask is null or labels is null then return false; end if;
  if jsonb_typeof(labels) <> 'array' then return false; end if;
  if jsonb_array_length(labels) <> 3 then return false; end if;
  for r in 0..2 loop
    row_value := labels -> r;
    if jsonb_typeof(row_value) <> 'array' then return false; end if;
    if jsonb_array_length(row_value) <> jsonb_array_length(mask -> r) then return false; end if;
    for s in 0..jsonb_array_length(mask -> r)-1 loop
      slot_value := row_value -> s;
      if jsonb_typeof(slot_value) <> 'string' then return false; end if;
      slot_text := row_value ->> s;
      if private.cms_domains_utf16_length(slot_text) > 256 then return false; end if;
      if (slot_text <> '') <> ((mask -> r ->> s)::boolean) then return false; end if;
    end loop;
  end loop;
  return true;
end;
$$;
revoke all on function private.cms_domains_labels_valid(text, jsonb) from public, anon, authenticated;

create table if not exists private.cms_domains (
  id text primary key check (id in ('data', 'core', 'language', 'vision', 'product', 'growth')),
  title text not null check (private.cms_domains_utf16_length(title) between 1 and 20000),
  description text not null check (private.cms_domains_utf16_length(description) between 1 and 20000),
  labels jsonb not null,
  position smallint not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cms_domains_fixed_position check (position = case id
    when 'data' then 1 when 'core' then 2 when 'language' then 3
    when 'vision' then 4 when 'product' then 5 when 'growth' then 6 end),
  constraint cms_domains_label_slots check (private.cms_domains_labels_valid(id, labels) is true)
);
alter table private.cms_domains enable row level security;
revoke all on private.cms_domains from public, anon, authenticated;
drop policy if exists cms_domains_deny on private.cms_domains;
create policy cms_domains_deny on private.cms_domains for all using (false) with check (false);

create or replace function private.cms_load_domains()
returns jsonb language sql stable security definer
set search_path = pg_catalog
as $$
  select jsonb_build_object('domains', coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'title', title, 'description', description, 'labels', labels
  ) order by position), '[]'::jsonb)) from private.cms_domains;
$$;
revoke all on function private.cms_load_domains() from public, anon, authenticated;

create or replace function public.cms_load_domains()
returns jsonb language sql stable security definer
set search_path = pg_catalog
as $$ select private.cms_load_domains(); $$;
revoke all on function public.cms_load_domains() from public, anon, authenticated;
grant execute on function public.cms_load_domains() to anon, service_role;

insert into private.cms_domains (id, title, description, labels, position)
values
  ('data', 'Data Intelligence', 'Transform raw data into actionable insights through robust pipelines.', '[["", "Data Infrastructure", "", ""], [" Data Science", "Data Analytics"], ["", "Data Engineering", ""]]'::jsonb, 1),
  ('core', 'Core AI & Engineering', 'Develop foundational models and scalable engineering for robust AI.', '[["", "Machine Learning", "", ""], ["Deep Learning", "AI Engineering"], ["", "MLOps", ""]]'::jsonb, 2),
  ('language', 'Language & Reasoning', 'Enable systems to understand, generate, and reason with language.', '[["", "NLP", "", ""], ["Generative AI", "AI Agents", ""], ["", "LLM & RAG", "Reasoning"]]'::jsonb, 3),
  ('vision', 'Vision & Multimodal', 'Empower machines to perceive and interpret multimodal visual data.', '[["", "Computer Vision", "", ""], ["ORC", "Video Understanding", ""], ["", "Multimodal AI", ""]]'::jsonb, 4),
  ('product', 'Product & Software', 'Turn ideas into impactful digital products through research, design, and development.', '[["", "UX Research", "", ""], ["", "UI Design", "Front-end", ""], ["", "Backend", "DevOps", ""]]'::jsonb, 5),
  ('growth', 'Growth & Community', 'Grow together through creativity, meaningful connections, and community collaboration.', '[["", "Public relations", "", ""], ["", "Creative", ""], ["", "Community & Partnership", ""]]'::jsonb, 6)
on conflict (id) do nothing;

commit;
