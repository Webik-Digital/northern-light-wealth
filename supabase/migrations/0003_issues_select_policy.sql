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
-- NOT REQUIRED TODAY. Nothing reads this bucket: the public address is built
-- as a string without a database call, and the upload no longer upserts, which
-- was the only thing that needed a read. Run it if something later needs to
-- list, move or rename a file in there; until then it changes nothing.
--
-- Nothing is exposed by this: the bucket is public, so its contents are already
-- readable by anyone with the address.

drop policy if exists issues_read on storage.objects;

create policy issues_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'issues');
