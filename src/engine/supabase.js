// ─── Rackle v2 · Supabase client & query helpers ─────────────────────────────
// All DB calls live here. Screen components never import from Supabase directly.

const SB_URL = "https://kkyhrwryhebpnbbffmfq.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtreWhyd3J5aGVicG5iYmZmbWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1OTM0MjAsImV4cCI6MjA5MzE2OTQyMH0.h_aEOEGfhh8h9iPGwkwzOzh6H7BCAefM6g20gW6IhWE";

export const SB_HEADERS = {
  "Content-Type":  "application/json",
  "apikey":        SB_KEY,
  "Authorization": `Bearer ${SB_KEY}`,
};

// ── Core fetch helper ─────────────────────────────────────────────────────────
export async function sbFetch(path, options = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: SB_HEADERS,
    ...options,
  });
  if (!res.ok) throw new Error(`Supabase ${options.method || "GET"} ${path} → ${res.status}`);
  return res.json();
}

export async function sbPost(path, body, prefer = "") {
  const headers = { ...SB_HEADERS };
  if (prefer) headers["Prefer"] = prefer;
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method:  "POST",
    headers,
    body:    JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Supabase POST ${path} → ${res.status}`);
  return res;
}

export async function sbPatch(path, body, prefer = "") {
  const headers = { ...SB_HEADERS };
  if (prefer) headers["Prefer"] = prefer;
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method:  "PATCH",
    headers,
    body:    JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Supabase PATCH ${path} → ${res.status}`);
  return res;
}

export async function sbDelete(path) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method:  "DELETE",
    headers: SB_HEADERS,
  });
  if (!res.ok) throw new Error(`Supabase DELETE ${path} → ${res.status}`);
  return res;
}

// ── Tables reference ──────────────────────────────────────────────────────────
// clubs            — code, name, location, emoji
// game_history     — player_id, played_at, mode, section_id, iq_score, rating, time_secs, day_seed
// daily_results    — player_id, day_seed, iq_score, rating, time_secs, streak, club_code, rack_json, scorecard_json
// profiles         — player_id, name, club_code, email, streak, rounds_played, best_iq, password_hash
// leaderboard      — club_code, day_seed, player_id, iq_score, name, time_secs
// club_share_events — club_code, day_seed, player_id, player_name, shared_at
