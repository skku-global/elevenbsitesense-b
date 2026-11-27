begin;

create table if not exists public.site_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create table if not exists public.enquiries (
  id uuid primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) between 3 and 254),
  phone text not null default '' check (char_length(phone) <= 30),
  service text not null check (char_length(service) between 1 and 150),
  message text not null check (char_length(message) between 20 and 3000),
  status text not null default 'new' check (status in ('new', 'in_progress', 'closed')),
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'sent', 'failed'))
);
create index if not exists enquiries_created_at_id_idx on public.enquiries (created_at desc, id desc);

alter table public.site_admins enable row level security;
alter table public.enquiries enable row level security;

revoke all on public.site_admins, public.enquiries from public, anon, authenticated, service_role;
grant select (user_id) on public.site_admins to authenticated;
grant select on public.enquiries to authenticated;
grant update (status) on public.enquiries to authenticated;
grant insert (id, name, email, phone, service, message), select (id, delivery_status),
  update (delivery_status) on public.enquiries to service_role;

drop policy if exists site_admins_read_self on public.site_admins;
create policy site_admins_read_self on public.site_admins for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.is_site_admin() returns boolean
language sql stable security invoker set search_path = ''
as $$
  select exists (select 1 from public.site_admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_site_admin() from public, anon, authenticated, service_role;
grant execute on function public.is_site_admin() to authenticated;

drop policy if exists enquiries_owner_read on public.enquiries;
create policy enquiries_owner_read on public.enquiries for select to authenticated
  using ((select public.is_site_admin()));
drop policy if exists enquiries_owner_status on public.enquiries;
create policy enquiries_owner_status on public.enquiries for update to authenticated
  using ((select public.is_site_admin())) with check ((select public.is_site_admin()));

-- Rows and counters come from the same database snapshot.
create or replace function public.site_admin_inbox(page_number integer default 1) returns jsonb
language plpgsql stable security invoker set search_path = ''
as $$
begin
  if not public.is_site_admin() then
    raise sqlstate '42501' using message = 'Owner access required';
  end if;
  if page_number is null or page_number < 1 then
    raise sqlstate 'PT400' using message = 'Invalid page';
  end if;
  return (
    select jsonb_build_object(
      'enquiries', (
        select coalesce(jsonb_agg(to_jsonb(item) order by item.created_at desc, item.id desc), '[]'::jsonb)
        from (
          select id, name, email, phone, service, message, created_at, status, delivery_status
          from public.enquiries order by created_at desc, id desc
          limit 20 offset ((page_number::bigint - 1) * 20)
        ) as item
      ),
      'total', count(*),
      'counts', jsonb_build_object(
        'new', count(*) filter (where status = 'new'),
        'in_progress', count(*) filter (where status = 'in_progress'),
        'closed', count(*) filter (where status = 'closed')
      ),
      'page', page_number, 'pageSize', 20
    ) from public.enquiries
  );
end;
$$;

create or replace function public.site_admin_set_status(enquiry_id uuid, new_status text) returns jsonb
language plpgsql security invoker set search_path = ''
as $$
begin
  if not public.is_site_admin() then
    raise sqlstate '42501' using message = 'Owner access required';
  end if;
  if new_status is null or new_status not in ('new', 'in_progress', 'closed') then
    raise sqlstate 'PT400' using message = 'Invalid status';
  end if;
  update public.enquiries set status = new_status where id = enquiry_id;
  if not found then
    raise sqlstate 'PT404' using message = 'Enquiry not found';
  end if;
  return jsonb_build_object('id', enquiry_id, 'status', new_status);
end;
$$;

revoke all on function public.site_admin_inbox(integer), public.site_admin_set_status(uuid, text)
  from public, anon, authenticated, service_role;
grant execute on function public.site_admin_inbox(integer), public.site_admin_set_status(uuid, text)
  to authenticated;

-- One counter per public page per UTC day. Visitor identifiers are not collected.
create table if not exists public.site_daily_views (
  day date not null,
  path text not null check (char_length(path) <= 128),
  views bigint not null check (views >= 0),
  primary key (day, path)
);
alter table public.site_daily_views enable row level security;
revoke all on public.site_daily_views from public, anon, authenticated, service_role;
grant select on public.site_daily_views to authenticated;
grant insert, select, update (views) on public.site_daily_views to service_role;
drop policy if exists site_views_owner_read on public.site_daily_views;
create policy site_views_owner_read on public.site_daily_views for select to authenticated
  using ((select public.is_site_admin()));

create or replace function public.site_record_page_view(page_path text) returns void
language sql volatile security invoker set search_path = ''
as $$
  insert into public.site_daily_views (day, path, views)
    values ((now() at time zone 'UTC')::date, page_path, 1)
  on conflict (day, path) do update set views = public.site_daily_views.views + 1;
$$;
revoke all on function public.site_record_page_view(text) from public, anon, authenticated, service_role;
grant execute on function public.site_record_page_view(text) to service_role;

create or replace function public.site_admin_activity() returns jsonb
language plpgsql stable security invoker set search_path = ''
as $$
declare
  today date := (now() at time zone 'UTC')::date;
begin
  if not public.is_site_admin() then
    raise sqlstate '42501' using message = 'Owner access required';
  end if;
  return (
    with week as (
      select day, path, views from public.site_daily_views where day between today - 6 and today
    ), days as (
      select today - i as day from generate_series(0, 6) as d(i)
    ), daily_totals as (
      select days.day, coalesce(sum(week.views), 0) as views
      from days left join week using(day) group by days.day
    ), top_pages as (
      select path, sum(views) as views from week group by path order by views desc, path limit 5
    )
    select jsonb_build_object(
      'days', (select jsonb_agg(jsonb_build_object('date', day, 'views', views) order by day) from daily_totals),
      'pages', coalesce((select jsonb_agg(to_jsonb(top_pages) order by views desc, path) from top_pages), '[]'::jsonb)
    )
  );
end;
$$;
revoke all on function public.site_admin_activity() from public, anon, authenticated, service_role;
grant execute on function public.site_admin_activity() to authenticated;

commit;

-- After creating the owner's account in Supabase Authentication, copy its User UID.
-- Run the following separately in the SQL Editor with that account's actual UUID.
-- insert into public.site_admins (user_id) values ('OWNER-USER-UUID') on conflict do nothing;
