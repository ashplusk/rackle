// ─── Rackle v2 · Storage engine ──────────────────────────────────────────────
// Local storage with in-memory fallback. Single key prefix "rk-".
// All state that persists between sessions lives here.

const mem = {};

export const ST = {
  get(k, d) {
    try {
      const v = JSON.parse(localStorage.getItem("rk-" + k));
      return v !== null ? v : d;
    } catch {
      return mem[k] !== undefined ? mem[k] : d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem("rk-" + k, JSON.stringify(v));
    } catch (e) {
      mem[k] = v;
      if (e.name === "QuotaExceededError") console.warn("localStorage full");
    }
  },
  remove(k) {
    try { localStorage.removeItem("rk-" + k); } catch { delete mem[k]; }
  },
};

// ── Day / seed utilities ──────────────────────────────────────────────────────

/** Today's numeric seed: YYYYMMDD */
export function getDailySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/** Day number since launch (April 25 2026 = day 1) */
export function getDayNum() {
  return Math.floor((new Date() - new Date(2026, 3, 25)) / 86400000) + 1;
}

/** Local date key "YYYY-MM-DD" */
export function localDateKey(value = Date.now()) {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayDateKey() { return localDateKey(Date.now()); }

function sameLocalDay(ts1, ts2) {
  return localDateKey(ts1) === localDateKey(ts2);
}

// ── Session ───────────────────────────────────────────────────────────────────

const SESSION_DAYS = 30;
const SESSION_VERSION = "v1";

export function readSession() {
  const s = ST.get("session_v1", null) || ST.get("session", null);
  if (!s || !s.expiresAt) return null;
  if (Number(s.expiresAt) <= Date.now()) return null;
  if (s.authVersion && s.authVersion !== SESSION_VERSION) return null;
  return s;
}

export function writeSession(profile = {}) {
  const playerId = String(profile.playerId || profile.player_id || ST.get("playerId", "") || "").trim();
  const email    = String(profile.email || "").trim().toLowerCase();
  if (!playerId || !email) return null;
  const session = {
    playerId,
    email,
    name:        profile.name || "",
    club:        profile.clubCode || profile.club_code || ST.get("clubCode", null) || null,
    avatar:      profile.avatarUrl || profile.avatar_url || null,
    streak:      Number(profile.streak || ST.get("str", 0) || 0),
    expiresAt:   Date.now() + SESSION_DAYS * 86400000,
    authVersion: SESSION_VERSION,
  };
  ST.set("session_v1", session);
  ST.set("isAuthenticated", true);
  ST.set("authPlayerId", playerId);
  return session;
}

export function clearSession() {
  ST.set("session_v1", null);
  ST.set("isAuthenticated", false);
  ST.set("authPlayerId", null);
}

export function hasValidSession() { return !!readSession(); }

export function logout() {
  clearSession();
  ST.set("profile", null);
  ST.set("authPlayerId", null);
}

// ── Profile ───────────────────────────────────────────────────────────────────

export function getProfile() { return ST.get("profile", null); }

export function setProfile(p) {
  if (!p) { ST.set("profile", null); return; }
  const cleaned = { ...p };
  delete cleaned["nick" + "name"];
  ST.set("profile", cleaned);
}

export function getClubCode() {
  const profile = ST.get("profile", null);
  const code    = String(profile?.clubCode || profile?.club_code || "").trim();
  if (code && code !== "__global__") { ST.set("clubCode", code); return code; }
  const stored  = String(ST.get("clubCode", null) || "").trim();
  if (stored && stored !== "__global__") return stored;
  return null;
}

export function setClubCode(code) { ST.set("clubCode", code || null); }

export function getPlayerId() {
  const authId = ST.get("authPlayerId", null);
  if (authId) return authId;

  let playerId = ST.get("playerId", null);
  if (playerId) return playerId;

  const suffix =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  playerId = `guest-${suffix}`;
  ST.set("playerId", playerId);
  return playerId;
}


// ── Player display helpers ───────────────────────────────────────────────────

export function isLeaderboardNameVisible() {
  try {
    const raw = localStorage.getItem("rackleShowNameOnLeaderboard");
    if (raw === null) return true;
    return JSON.parse(raw) !== false;
  } catch { return true; }
}

function cleanLeaderboardNameCandidate(value) {
  const name = String(value || "").replace(/\s+/g, " ").trim();
  if (!name) return "";
  if (/^rackler$/i.test(name)) return "";
  if (/^guest\s*\d+$/i.test(name)) return "";
  if (/^player\d+$/i.test(name)) return "";
  if (/^anonymous[_\s-]?user$/i.test(name)) return "";
  if (/^(undefined|null|nan)$/i.test(name)) return "";
  if (/^test\s*user$/i.test(name)) return "";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(name)) return "";
  return name;
}

export function getLocalPlayerName() {
  const profile = ST.get("profile", null) || {};
  const session = readSession();
  const candidates = [
    profile.displayName,
    profile.name,
    session?.name,
    ST.get("playerName", ""),
    ST.get("displayName", ""),
  ];
  const found = candidates
    .map(cleanLeaderboardNameCandidate)
    .find(Boolean);
  return found || "Guest Rackler";
}

export function getLeaderboardDisplayName(profile = null) {
  if (!isLeaderboardNameVisible()) return "Guest Rackler";
  const candidates = [
    profile?.displayName,
    profile?.name,
    getProfile()?.displayName,
    getProfile()?.name,
    readSession()?.name,
    ST.get("playerName", ""),
    ST.get("displayName", ""),
  ];
  const found = candidates
    .map(cleanLeaderboardNameCandidate)
    .find(Boolean);
  return found || "Guest Rackler";
}

// ── History & stats ───────────────────────────────────────────────────────────

export function addHistory(entry) {
  const h = ST.get("hist", []);
  h.push({ ...entry, ts: Date.now() });
  ST.set("hist", h.slice(-100));
}

export function getHistory() { return ST.get("hist", []); }

export function getBestIQ() {
  const h = getHistory().filter(e => e.iqScore > 0);
  if (!h.length) return null;
  return Math.max(...h.map(e => e.iqScore));
}

export function getStreak() { return ST.get("str", 0); }

export function setStreak(n) { ST.set("str", n); }

// ── Daily result helpers ──────────────────────────────────────────────────────

export function isDailyResultForToday(result) {
  if (!result) return false;
  const today      = getDailySeed();
  const resultSeed = Number(result?.daySeed || result?.day_seed || 0) || null;
  const completedDate = result.completedDate || result.rkCompletedDate || null;
  const playedToday   = completedDate
    ? completedDate === todayDateKey()
    : sameLocalDay(result?.ts || 0, Date.now());
  if (resultSeed) return resultSeed === today && playedToday;
  return ST.get("dd", null) === today && playedToday;
}

export function getTodayDailyResult() {
  const today  = getDailySeed();
  const stored = ST.get("dres", null);
  if (ST.get("dd", null) === today && isDailyResultForToday(stored)) return stored;
  return null;
}

export function saveDailyResult(result) {
  const seed = result?.daySeed || result?.day_seed || getDailySeed();
  ST.set("dd", seed);
  ST.set("dres", result);
  ST.set("hadFirstDaily", true);
}

export function clearStaleDailyResult() {
  const today  = getDailySeed();
  const stored = ST.get("dres", null);
  if (ST.get("dd", null) !== today) ST.set("dd", null);
  if (stored && !isDailyResultForToday(stored)) ST.set("dres", null);
}

// ── Streak badges ─────────────────────────────────────────────────────────────

const STREAK_BADGES = [
  { days: 3,   badge: "⚡",  title: "Sparked",           desc: "3-day streak"   },
  { days: 5,   badge: "🎲",  title: "Feeling Lucky",     desc: "5-day streak"   },
  { days: 7,   badge: "🎯",  title: "Week Warrior",      desc: "7-day streak"   },
  { days: 9,   badge: "🌱",  title: "Taking Root",       desc: "9-day streak"   },
  { days: 11,  badge: "🎸",  title: "On A Roll",         desc: "11-day streak"  },
  { days: 14,  badge: "🧠",  title: "Sharp Mind",        desc: "14-day streak"  },
  { days: 21,  badge: "🌙",  title: "Three Weeks",       desc: "21-day streak"  },
  { days: 30,  badge: "💎",  title: "Monthly Master",    desc: "30-day streak"  },
  { days: 50,  badge: "🌟",  title: "Half Century",      desc: "50-day streak"  },
  { days: 60,  badge: "🏯",  title: "The Regular",       desc: "60-day streak"  },
  { days: 90,  badge: "🧬",  title: "In The DNA",        desc: "90-day streak"  },
  { days: 100, badge: "🏆",  title: "Century",           desc: "100-day streak" },
  { days: 150, badge: "👑",  title: "Royalty",           desc: "150-day streak" },
  { days: 200, badge: "🐐",  title: "Greatest",          desc: "200-day streak" },
];

export function getStreakBadge(streak) {
  return [...STREAK_BADGES].reverse().find(b => streak >= b.days) || null;
}
