-- The public bucket needs a read policy of its own.
--
-- A public bucket serves downloads without consulting RLS, which made it look as
-- though reads were already covered and no SELECT policy was written for it.
-- They are not the same thing: an authenticated request through the storage API
-- still evaluates RLS on storage.objects, so anything that needs to read a row
-- was refused. An upsert is an insert-or-update and must read the row first to
-- decide which, so every admin upload failed while a plain insert of the same
-- file into the same bucket succeeded.
--
-- The client no longer upserts, so this is not what unblocks uploading. It is
-- here because a bucket that refuses to let a signed-in admin read its own
-- contents is wrong on its own terms, and the next thing that needs to read
-- one — a listing in the admin, a move, a rename — would hit it again.
--
-- Nothing is exposed by this: the bucket is public, so its contents are already
-- readable by anyone with the address.

drop policy if exists issues_read on storage.objects;

create policy issues_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'issues');
