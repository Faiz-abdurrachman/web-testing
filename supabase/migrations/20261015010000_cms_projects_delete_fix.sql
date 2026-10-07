-- Fix Projects delete reindexing; existing tables/data/ACL remain intact.
-- Apply once only after explicit approval and live function/catalog inspection.
-- PostgreSQL prohibits window functions directly in UPDATE SET.
begin;
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

    with ranked as (
      select id, row_number() over (order by position, id)::smallint as position
      from private.cms_projects
    )
    update private.cms_projects as project
      set position = ranked.position
      from ranked
      where project.id = ranked.id;

    update private.cms_projects_state
      set revision = private.cms_projects_revision(),
          publication_pending = true,
          updated_at = now();

    select revision into v_revision from private.cms_projects_state;
    return private.cms_load_projects() ||
      jsonb_build_object('affectedId', v_id, 'revision', v_revision, 'saved', true);
  end;
$$;
commit;
