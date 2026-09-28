import { supabase } from './supabase';

// Access is given, not taken.
//
// There is no sign-up call in this file, and that is deliberate rather than an
// omission: public sign-up is disabled on the project, so the only way to an
// account is an invitation issued by an admin. Every social provider is off for
// the same reason. A client has an account because someone at the firm decided
// they should.

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data ? data.session : null;
}

export async function isAuthenticated() {
  return Boolean(await getSession());
}

// The signed-in person, with their role attached. Returns null when signed out,
// which is an ordinary state here, not an error.
export async function me() {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData ? userData.user : null;
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    fullName: (profile && profile.full_name) || '',
    // Absent a profile row, the safe assumption is the lesser privilege.
    role: (profile && profile.role) || 'user',
  };
}

export async function isAdmin() {
  const user = await me();
  return Boolean(user && user.role === 'admin');
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: (email || '').trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

// Sends the email that lets someone choose a password. Used both by a person who
// has forgotten theirs and by one setting theirs for the first time from an
// invitation: Supabase treats both as a recovery link.
export async function requestPasswordReset(email, redirectTo) {
  const { error } = await supabase.auth.resetPasswordForEmail(
    (email || '').trim().toLowerCase(),
    { redirectTo: redirectTo || `${window.location.origin}/activate` }
  );
  if (error) throw error;
}

// Completes the link above. The session already exists by the time this runs,
// recovered from the URL the person landed on.
export async function setPassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

// Watches for sign-in and sign-out, so a page can react without polling.
export function onAuthChange(handler) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    handler(Boolean(session));
  });
  return () => {
    if (data && data.subscription) data.subscription.unsubscribe();
  };
}
