-- Northern Light Wealth — initial schema
--
-- Ported from the Base44 entities, keeping the three access behaviours that were
-- verified against the old platform with live probes:
--
--   1. The Four Turnings is public. Anyone may read an issue.
--   2. The client library is not. Only a signed-in person may read a row, and the
--      files themselves are reachable only through an expiring link.
--   3. A brochure outline is invisible until it is published, and that is the
--      database's rule, not the page's, so a draft awaiting compliance is not
--      served to anyone who asks for it.
--
-- Contact enquiries and mailing-list addresses may be WRITTEN by anyone, because
-- the forms are public, and read by nobody but an admin. A name, a way to reach
-- someone and whatever they chose to tell us is not a public record.
--
-- Every table below has RLS enabled. A table with RLS left off is readable by
-- anyone holding the anon key, which is shipped in the browser bundle.

-- ---------------------------------------------------------------------------
-- extensions and helpers
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- Keeps updated_at honest without the application having to remember.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ---------------------------------------------------------------------------
-- profiles: the role that every policy below turns on
-- ---------------------------------------------------------------------------
-- Supabase owns auth.users. Roles live here, alongside it, because auth.users
-- is not ours to add columns to.

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'user' check (role in ('admin', 'user')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- A profile appears the moment an invited person accepts. Without this, an
-- invited user signs in and has no row, so is_admin() sees nothing and every
-- admin policy silently denies.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- SECURITY DEFINER on purpose. A policy on profiles that reads profiles would
-- recurse forever; running as owner steps outside RLS and breaks the loop.
-- search_path is pinned so the function cannot be redirected at a shadow table.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- A person sees their own profile; an admin sees everyone. Nobody changes their
-- own role: privilege is granted, not claimed.
create policy profiles_select_self_or_admin on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy profiles_delete_admin on public.profiles
  for delete to authenticated
  using (public.is_admin());


-- ---------------------------------------------------------------------------
-- turnings: the seasonal letter. public.
-- ---------------------------------------------------------------------------
-- 'fall' is kept as the stored value rather than 'autumn'. The word is only
-- ever shown through a label map in the front end, and it is also an asset key
-- and a CSS selector in a dozen files; renaming the data would buy nothing
-- visible and break all of them.

create table public.turnings (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  season        text not null check (season in ('spring', 'summer', 'fall', 'winter')),
  year          integer not null,
  marker        text,
  slug          text not null unique,
  dek           text,
  body          text,
  html_path     text,   -- the issue as a web page: what a reader is given
  pdf_path      text,   -- the same issue as a PDF, kept as a backup
  published_at  timestamptz,
  is_featured   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.turnings enable row level security;

create trigger turnings_touch
  before update on public.turnings
  for each row execute function public.touch_updated_at();

create index turnings_published_idx on public.turnings (published_at desc);

-- Published issues are readable by anyone, signed in or not. An unpublished or
-- future-dated issue is an admin's business only.
create policy turnings_select_public on public.turnings
  for select to anon, authenticated
  using (published_at is not null and published_at <= now());

create policy turnings_select_admin on public.turnings
  for select to authenticated
  using (public.is_admin());

create policy turnings_write_admin on public.turnings
  for insert to authenticated with check (public.is_admin());

create policy turnings_update_admin on public.turnings
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy turnings_delete_admin on public.turnings
  for delete to authenticated using (public.is_admin());


-- ---------------------------------------------------------------------------
-- resources: the client library. not public.
-- ---------------------------------------------------------------------------
-- There is no "open" item here and so no flag offering one. Anything meant for
-- everyone belongs in turnings. html_path is what a client is given; pdf_path
-- is the same document kept as an admin's backup and never handed out.

create table public.resources (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  category        text not null,
  description     text,
  html_path       text,
  pdf_path        text,
  thumbnail_path  text,
  sort_order      integer not null default 0,   -- "order" is reserved in SQL
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.resources enable row level security;

create trigger resources_touch
  before update on public.resources
  for each row execute function public.touch_updated_at();

create index resources_order_idx on public.resources (sort_order, created_at);

-- Signed in is the whole test. There is deliberately no anon policy: with none,
-- an anonymous request returns nothing at all rather than relying on the page
-- to hide it.
create policy resources_select_authenticated on public.resources
  for select to authenticated
  using (true);

create policy resources_insert_admin on public.resources
  for insert to authenticated with check (public.is_admin());

create policy resources_update_admin on public.resources
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy resources_delete_admin on public.resources
  for delete to authenticated using (public.is_admin());


-- ---------------------------------------------------------------------------
-- brochure_outlines: what a private brochure covers, said in public
-- ---------------------------------------------------------------------------
-- One row per pathway. Public, but only once published — the brochure itself
-- stays in the library.

create table public.brochure_outlines (
  id              uuid primary key default gen_random_uuid(),
  pathway         text not null unique
                  check (pathway in ('estate-ready', 'sale-ready', 'harvest-share')),
  brochure_title  text,
  blurb           text,
  sections        jsonb not null default '[]'::jsonb,
  pages           integer,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.brochure_outlines enable row level security;

create trigger brochure_outlines_touch
  before update on public.brochure_outlines
  for each row execute function public.touch_updated_at();

create policy outlines_select_published on public.brochure_outlines
  for select to anon, authenticated
  using (is_published);

create policy outlines_select_admin on public.brochure_outlines
  for select to authenticated
  using (public.is_admin());

create policy outlines_insert_admin on public.brochure_outlines
  for insert to authenticated with check (public.is_admin());

create policy outlines_update_admin on public.brochure_outlines
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy outlines_delete_admin on public.brochure_outlines
  for delete to authenticated using (public.is_admin());


-- ---------------------------------------------------------------------------
-- contact_submissions: anyone may write, only an admin may read
-- ---------------------------------------------------------------------------
-- `source` records which form it came from, so a Request Info on the SaleReady
-- page is distinguishable from a general enquiry.

create table public.contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  contact     text not null,
  message     text,
  source      text not null default 'contact',
  created_at  timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

create index contact_submissions_created_idx on public.contact_submissions (created_at desc);

create policy contact_insert_anyone on public.contact_submissions
  for insert to anon, authenticated with check (true);

create policy contact_select_admin on public.contact_submissions
  for select to authenticated using (public.is_admin());

create policy contact_delete_admin on public.contact_submissions
  for delete to authenticated using (public.is_admin());


-- ---------------------------------------------------------------------------
-- subscribers: the mailing list. same shape.
-- ---------------------------------------------------------------------------

create table public.subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  source      text not null default 'the-four-turnings',
  created_at  timestamptz not null default now()
);

alter table public.subscribers enable row level security;

create policy subscribers_insert_anyone on public.subscribers
  for insert to anon, authenticated with check (true);

create policy subscribers_select_admin on public.subscribers
  for select to authenticated using (public.is_admin());

create policy subscribers_delete_admin on public.subscribers
  for delete to authenticated using (public.is_admin());


-- ---------------------------------------------------------------------------
-- storage
-- ---------------------------------------------------------------------------
-- Two buckets, because the site has two halves.
--
--   issues    public  — the Four Turnings as web pages. Served straight from
--                       the CDN: no signing, cacheable, and they are meant to
--                       be read by anyone.
--   resources private — the client library, the brochure covers, and the PDF
--                       backups. Reachable only through an expiring link.

insert into storage.buckets (id, name, public)
values ('issues', 'issues', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('resources', 'resources', false)
on conflict (id) do update set public = false;

-- Only an admin puts anything into either bucket.
create policy issues_write_admin on storage.objects
  for insert to authenticated
  with check (bucket_id = 'issues' and public.is_admin());

create policy issues_update_admin on storage.objects
  for update to authenticated
  using (bucket_id = 'issues' and public.is_admin());

create policy issues_delete_admin on storage.objects
  for delete to authenticated
  using (bucket_id = 'issues' and public.is_admin());

-- Reading a private object still requires being signed in, even though links
-- are normally minted server-side. Two locks are better than one.
create policy resources_read_authenticated on storage.objects
  for select to authenticated
  using (bucket_id = 'resources');

create policy resources_write_admin on storage.objects
  for insert to authenticated
  with check (bucket_id = 'resources' and public.is_admin());

create policy resources_update_admin on storage.objects
  for update to authenticated
  using (bucket_id = 'resources' and public.is_admin());

create policy resources_delete_admin on storage.objects
  for delete to authenticated
  using (bucket_id = 'resources' and public.is_admin());
