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

// ── Auth email/password reset helpers ─────────────────────────────────────────

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

export async function requestPasswordReset(email, redirectTo = getResetPasswordRedirectUrl()) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  const res = await fetch(`${SB_URL}/auth/v1/recover`, {
    method: "POST",
    headers: SB_HEADERS,
    body: JSON.stringify({
      email: cleanEmail,
      redirect_to: redirectTo,
    }),
  });

  if (!res.ok) {
    throw new Error(await readAuthError(res, "Password reset email could not be sent."));
  }

  return true;
}

export async function updatePasswordWithAccessToken(accessToken, password) {
  const token = String(accessToken || "").trim();
  const nextPassword = String(password || "");

  if (!token) throw new Error("Reset link is missing or expired.");
  if (nextPassword.length < 6) throw new Error("Password must be at least 6 characters.");

  const res = await fetch(`${SB_URL}/auth/v1/user`, {
    method: "PUT",
    headers: {
      ...SB_HEADERS,
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ password: nextPassword }),
  });

  if (!res.ok) {
    throw new Error(await readAuthError(res, "Password could not be updated."));
  }

  return res.json().catch(() => ({}));
}

export function getRecoveryAccessTokenFromUrl() {
  if (typeof window === "undefined") return "";

  const hash = new URLSearchParams(String(window.location.hash || "").replace(/^#/, ""));
  const search = new URLSearchParams(window.location.search || "");

  return (
    hash.get("access_token") ||
    search.get("access_token") ||
    ""
  );
}

export function isRecoveryLink() {
  if (typeof window === "undefined") return false;

  const hash = new URLSearchParams(String(window.location.hash || "").replace(/^#/, ""));
  const search = new URLSearchParams(window.location.search || "");

  return (
    hash.get("type") === "recovery" ||
    search.get("type") === "recovery" ||
    Boolean(getRecoveryAccessTokenFromUrl())
  );
}

// ── Tables reference ──────────────────────────────────────────────────────────
// clubs            — code, name, location, emoji
// game_history     — player_id, played_at, mode, section_id, iq_score, rating, time_secs, day_seed
// daily_results    — player_id, day_seed, iq_score, rating, time_secs, streak, club_code, rack_json, scorecard_json
// profiles         — player_id, name, club_code, email, streak, rounds_played, best_iq, password_hash
// leaderboard      — club_code, day_seed, player_id, iq_score, name, time_secs
// club_share_events — club_code, day_seed, player_id, player_name, shared_at
