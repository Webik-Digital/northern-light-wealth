-- Run this AFTER the three people have accepted their invitations.
--
-- A profile row only exists once someone has actually signed in, so this cannot
-- be folded into the initial migration. Everyone arrives as 'user'; these three
-- are the accounts that were admins on Base44.
--
-- Anyone not listed here stays a plain user, which is what a client should be.

update public.profiles
set role = 'admin'
where email in (
  'pryce@webikdigital.com',
  'pryceresma2@gmail.com',
  'michael@zillamedia.co'
);

-- Check it took. Expect exactly three rows, all 'admin'.
select email, role, created_at
from public.profiles
order by role, email;
