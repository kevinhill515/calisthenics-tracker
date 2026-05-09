// Tiny Supabase REST wrapper. We use the publishable (anon) key — safe
// because the only table we touch (`calis_users`) has RLS policies that
// restrict writes to rows where `name in ('kevin','bucky')`.

const URL = import.meta.env.VITE_SUPABASE_URL || '';
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const SUPA_CONFIGURED = !!(URL && KEY);

const baseHeaders = () => ({
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
});

export async function fetchUser(name) {
  if (!SUPA_CONFIGURED) return null;
  try {
    const r = await fetch(
      `${URL}/rest/v1/calis_users?select=name,data,updated_at&name=eq.${encodeURIComponent(name)}`,
      { headers: { ...baseHeaders(), Accept: 'application/vnd.pgrst.object+json' } }
    );
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export async function fetchAllUsers() {
  if (!SUPA_CONFIGURED) return [];
  try {
    const r = await fetch(`${URL}/rest/v1/calis_users?select=name,data,updated_at`, {
      headers: baseHeaders(),
    });
    if (!r.ok) return [];
    return await r.json();
  } catch {
    return [];
  }
}

export async function upsertUser(name, data) {
  if (!SUPA_CONFIGURED) return false;
  try {
    const r = await fetch(`${URL}/rest/v1/calis_users`, {
      method: 'POST',
      headers: {
        ...baseHeaders(),
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({ name, data, updated_at: new Date().toISOString() }),
    });
    return r.ok;
  } catch {
    return false;
  }
}
