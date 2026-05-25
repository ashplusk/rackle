// ─── Rackle v2 · Supabase client & query helpers ─────────────────────────────
// All DB calls live here. Screen components never import from Supabase directly.

const SB_URL = import.meta.env.VITE_SUPABASE_URL || "https://kkyhrwryhebpnbbffmfq.supabase.co";
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

export const SB_HEADERS = {
  "Content-Type": "application/json",
  "apikey": SB_KEY,
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
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Supabase POST ${path} → ${res.status}`);
  return res;
}

export async function sbPatch(path, body, prefer = "") {
  const headers = { ...SB_HEADERS };
  if (prefer) headers["Prefer"] = prefer;
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Supabase PATCH ${path} → ${res.status}`);
  return res;
}

export async function sbDelete(path) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method: "DELETE",
    headers: SB_HEADERS,
  });
  if (!res.ok) throw new Error(`Supabase DELETE ${path} → ${res.status}`);
  return res;
}

// ── Auth helpers ──────────────────────────────────────────────────────────────
function getOrigin() {
  if (typeof window === "undefined") return "https://playrackle.com";
  return window.location.origin || "https://playrackle.com";
}

export function getResetPasswordRedirectUrl() {
  return `${getOrigin()}/reset-password`;
}

async function readAuthError(res, fallback) {
  try {
    const payload = await res.json();
    return payload?.msg || payload?.message || payload?.error_description || payload?.error || fallback;
  } catch {
    return fallback;
  }
}

function normalizeAuthUser(payload) {
  return payload?.user || payload || null;
}

export async function signUpWithPassword({ email, password, metadata = {}, redirectTo = getOrigin() }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPassword = String(password || "");
  if (!cleanEmail || !cleanEmail.includes("@")) throw new Error("Enter a valid email address.");
  if (cleanPassword.length < 6) throw new Error("Password must be at least 6 characters.");

  const res = await fetch(`${SB_URL}/auth/v1/signup?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: "POST",
    headers: SB_HEADERS,
    body: JSON.stringify({ email: cleanEmail, password: cleanPassword, data: metadata }),
  });

  if (!res.ok) throw new Error(await readAuthError(res, "Account could not be created."));
  const payload = await res.json().catch(() => ({}));
  return { ...payload, user: normalizeAuthUser(payload) };
}

export async function signInWithPassword({ email, password }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPassword = String(password || "");
  if (!cleanEmail || !cleanEmail.includes("@")) throw new Error("Enter a valid email address.");
  if (!cleanPassword) throw new Error("Enter your password.");

  const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: SB_HEADERS,
    body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
  });

  if (!res.ok) throw new Error(await readAuthError(res, "That login did not work."));
  const payload = await res.json().catch(() => ({}));
  return { ...payload, user: normalizeAuthUser(payload) };
}

export async function upsertProfile(profile = {}) {
  const playerId = String(profile.playerId || profile.player_id || "").trim();
  if (!playerId) return null;

  const body = {
    player_id: playerId,
    name: profile.name || profile.displayName || profile.display_name || "Rackle Player",
    email: String(profile.email || "").trim().toLowerCase() || null,
    club_code: profile.clubCode || profile.club_code || null,
    streak: Number(profile.streak || 0),
    rounds_played: Number(profile.roundsPlayed || profile.rounds_played || 0),
    best_iq: profile.bestIQ || profile.best_iq || null,
  };

  const res = await sbPost("profiles?on_conflict=player_id", body, "resolution=merge-duplicates,return=representation");
  return res.json().catch(() => null);
}

export async function requestPasswordReset(email, redirectTo = getResetPasswordRedirectUrl()) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  const res = await fetch(`${SB_URL}/auth/v1/recover`, {
    method: "POST",
    headers: SB_HEADERS,
    body: JSON.stringify({ email: cleanEmail, redirect_to: redirectTo }),
  });

  if (!res.ok) throw new Error(await readAuthError(res, "Password reset email could not be sent."));
  return true;
}

export async function updatePasswordWithAccessToken(accessToken, password) {
  const token = String(accessToken || "").trim();
  const nextPassword = String(password || "");

  if (!token) throw new Error("Reset link is missing or expired.");
  if (nextPassword.length < 6) throw new Error("Password must be at least 6 characters.");

  const res = await fetch(`${SB_URL}/auth/v1/user`, {
    method: "PUT",
    headers: { ...SB_HEADERS, "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ password: nextPassword }),
  });

  if (!res.ok) throw new Error(await readAuthError(res, "Password could not be updated."));
  return res.json().catch(() => ({}));
}

export function getRecoveryAccessTokenFromUrl() {
  if (typeof window === "undefined") return "";

  const hash = new URLSearchParams(String(window.location.hash || "").replace(/^#/, ""));
  const search = new URLSearchParams(window.location.search || "");

  return hash.get("access_token") || search.get("access_token") || "";
}

export function isRecoveryLink() {
  if (typeof window === "undefined") return false;

  const hash = new URLSearchParams(String(window.location.hash || "").replace(/^#/, ""));
  const search = new URLSearchParams(window.location.search || "");

  return hash.get("type") === "recovery" || search.get("type") === "recovery" || Boolean(getRecoveryAccessTokenFromUrl());
}

// ── Tables reference ──────────────────────────────────────────────────────────
// clubs             — code, name, location, emoji
// game_history      — player_id, played_at, mode, section_id, iq_score, rating, time_secs, day_seed
// daily_results     — player_id, day_seed, iq_score, rating, time_secs, streak, club_code, rack_json, scorecard_json
// profiles          — player_id, name, club_code, email, streak, rounds_played, best_iq, password_hash
// leaderboard       — club_code, day_seed, player_id, iq_score, name, time_secs
// club_share_events — club_code, day_seed, player_id, player_name, shared_at
