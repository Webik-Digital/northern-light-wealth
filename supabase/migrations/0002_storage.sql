-- Storage buckets and their policies.
--
-- Split out of 0001 because these statements touch the `storage` schema, which
-- Supabase owns. If the initial migration reported an error it was almost
-- certainly here, and everything above it still committed — the SQL editor runs
-- statements in sequence rather than as one transaction.
--
-- If this file errors on the policies, create the two buckets in the dashboard
-- instead (Storage -> New bucket) with `issues` public and `resources` private,
-- and add the policies through Storage -> Policies. The end state is the same.

-- ---------------------------------------------------------------------------
-- buckets
-- ---------------------------------------------------------------------------
--   issues    public  — the Four Turnings. Meant to be read by anyone, served
--                       straight from the CDN with no signing.
--   resources private — the client library, the covers, and the PDF backups.
--                       Reachable only through an expiring link.

insert into storage.buckets (id, name, public)
values ('issues', 'issues', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('resources', 'resources', false)
on conflict (id) do update set public = excluded.public;


-- ---------------------------------------------------------------------------
-- policies
-- ---------------------------------------------------------------------------
-- Dropped first so this file can be re-run without colliding with itself.

drop policy if exists issues_write_admin on storage.objects;
drop policy if exists issues_update_admin on storage.objects;
drop policy if exists issues_delete_admin on storage.objects;
drop policy if exists resources_read_authenticated on storage.objects;
drop policy if exists resources_write_admin on storage.objects;
drop policy if exists resources_update_admin on storage.objects;
drop policy if exists resources_delete_admin on storage.objects;

-- Anyone may READ the issues bucket: that is what public means, and it is
-- handled by the bucket flag rather than a policy. Only an admin may put
-- anything into it.
create policy issues_write_admin on storage.objects
  for insert to authenticated
  with check (bucket_id = 'issues' and public.is_admin());

create policy issues_update_admin on storage.objects
  for update to authenticated
  using (bucket_id = 'issues' and public.is_admin());

create policy issues_delete_admin on storage.objects
  for delete to authenticated
  using (bucket_id = 'issues' and public.is_admin());

-- The private bucket. Links are normally minted server-side, but a signed-in
-- person is still the floor: two locks rather than one.
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


-- Confirm. Expect two rows: issues public = true, resources public = false.
select id, name, public from storage.buckets order by id;
