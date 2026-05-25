// ─── Rackle v2 · Leaderboard engine ──────────────────────────────────────────
// All leaderboard fetching, posting, ranking, dedupe, and club queries.

import { sbFetch, sbPost, sbDelete, sbPatch } from './supabase.js';
import { getDailySeed, getLeaderboardDisplayName, getLocalPlayerName } from './storage.js';

// ── Clubs ─────────────────────────────────────────────────────────────────────

const CLUBS_SEED = { "1873": { name: "Apex Mahjong Club", emoji: "", location: "Apex, NC" } };
let CLUBS = { ...CLUBS_SEED };

export async function fetchClubs() {
  try {
    const rows = await sbFetch("clubs?select=code,name,location,emoji&order=name.asc");
    if (!rows?.length) return CLUBS;
    const map = {};
    rows.forEach(r => { map[r.code] = { name: r.name, location: r.location || "", emoji: r.emoji || "" }; });
    CLUBS = map;
    return CLUBS;
  } catch { return CLUBS; }
}

export function getClubs() { return CLUBS; }

export function getClubByCode(code) {
  return code ? CLUBS[String(code).trim()] || null : null;
}

export function clubSlug(name) {
  return String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Shared row helpers ────────────────────────────────────────────────────────

function isDev() {
  return import.meta.env.DEV;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function rowScore(row) {
  return Number(row?.iq_score ?? row?.iqScore ?? row?.score ?? 0) || 0;
}

function rowTime(row) {
  return Number(row?.time_secs ?? row?.timeSecs ?? row?.time ?? 999999) || 999999;
}

function rowCompletedAt(row) {
  const raw = row?.completed_at || row?.played_at || row?.created_at || row?.submitted_at || row?.updated_at || null;
  return raw ? (new Date(raw).getTime() || 0) : 0;
}

function userIdFrom(row) {
  return String(row?.user_id || row?.userId || "").trim();
}

function playerIdFrom(row) {
  return String(row?.player_id || row?.playerId || row?.user_id || row?.userId || "").trim();
}

function boardCodeFrom(row) {
  const value = String(row?.club_code || row?.clubCode || "__global__").trim();
  return value || "__global__";
}

function seedFrom(row) {
  return String(row?.day_seed || row?.daySeed || getDailySeed()).trim();
}

function isBadGeneratedName(value) {
  const name = String(value || "").trim();
  if (!name) return true;
  if (/^rackler$/i.test(name)) return true;
  if (/^guest\s*rackler$/i.test(name)) return false;
  if (/^guest\s*\d+$/i.test(name)) return true;
  if (/^player\d+$/i.test(name)) return true;
  if (/^anonymous[_\s-]?user$/i.test(name)) return true;
  if (/^(undefined|null|nan)$/i.test(name)) return true;
  if (/^test\s*user$/i.test(name)) return true;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(name)) return true;
  return false;
}

function cleanCandidate(value) {
  const name = String(value || "").replace(/\s+/g, " ").trim();
  if (isBadGeneratedName(name)) return "";
  return name;
}

export function resolveLeaderboardName({
  profileDisplayName,
  profileName,
  localPlayerName,
  guestName,
  fallback = "Guest Rackler",
} = {}) {
  const candidates = [profileDisplayName, profileName, localPlayerName, guestName];
  for (const candidate of candidates) {
    const cleaned = cleanCandidate(candidate);
    if (cleaned) return cleaned;
  }
  return cleanCandidate(fallback) || "Guest Rackler";
}

function isGuestId(id) {
  const value = String(id || "").toLowerCase();
  return value.startsWith("guest-") || value === "paiybtquq";
}

function isAnonymousName(name) {
  const value = String(name || "").trim();
  return !value || isBadGeneratedName(value) || /^guest\s*rackler$/i.test(value);
}

function dedupeKey(row) {
  const uid = userIdFrom(row);
  const id = playerIdFrom(row);
  const seed = seedFrom(row);
  const board = boardCodeFrom(row);

  if (uid) return `${board}:${seed}:user:${uid}`;
  if (id) return `${board}:${seed}:player:${id}`;

  if (isAnonymousName(row?.name)) return `${board}:${seed}:legacy-guest:${Math.round(rowScore(row))}`;

  return `${board}:${seed}:name:${resolveLeaderboardName({ localPlayerName: row?.name }).toLowerCase()}`;
}

function normalizeRow(row) {
  const id = playerIdFrom(row);
  const uid = userIdFrom(row);
  const safeName = resolveLeaderboardName({
    profileDisplayName: row?.profile_display_name || row?.display_name,
    profileName: row?.profile_name,
    localPlayerName: row?.name || row?.player_name,
    guestName: isGuestId(id) ? "Guest Rackler" : null,
  });

  return {
    ...row,
    user_id: uid || row?.user_id || null,
    player_id: id || row?.player_id,
    club_code: boardCodeFrom(row),
    day_seed: row?.day_seed ?? row?.daySeed ?? getDailySeed(),
    iq_score: rowScore(row),
    time_secs: row?.time_secs ?? row?.timeSecs ?? row?.time ?? null,
    name: isGuestId(id) ? "Guest Rackler" : safeName,
  };
}

function dedupeWinner(next, current) {
  const nextCompleted = rowCompletedAt(next);
  const currentCompleted = rowCompletedAt(current);

  if (nextCompleted && currentCompleted && nextCompleted !== currentCompleted) {
    return nextCompleted > currentCompleted ? next : current;
  }

  if (rowScore(next) !== rowScore(current)) return rowScore(next) > rowScore(current) ? next : current;
  if (rowTime(next) !== rowTime(current)) return rowTime(next) < rowTime(current) ? next : current;
  return next;
}

function compareLeaderboardRows(a, b) {
  const scoreDiff = rowScore(b) - rowScore(a);
  if (scoreDiff) return scoreDiff;

  const aCompleted = rowCompletedAt(a);
  const bCompleted = rowCompletedAt(b);
  if (aCompleted && bCompleted && aCompleted !== bCompleted) return aCompleted - bCompleted;

  const timeDiff = rowTime(a) - rowTime(b);
  if (timeDiff) return timeDiff;

  return resolveLeaderboardName({ localPlayerName: a?.name }).localeCompare(resolveLeaderboardName({ localPlayerName: b?.name }));
}

export function normalizeLeaderboardRows(rows = []) {
  const byKey = new Map();
  rows.forEach(rawRow => {
    if (!rawRow) return;
    const row = normalizeRow(rawRow);
    const key = dedupeKey(row);
    const current = byKey.get(key);
    byKey.set(key, current ? dedupeWinner(row, current) : row);
  });
  return [...byKey.values()].sort(compareLeaderboardRows);
}

export function exposeLeaderboardDebug(payload = {}) {
  if (!isDev() || typeof window === "undefined") return;
  window.__rackleLeaderboardDebug = { updatedAt: new Date().toISOString(), ...payload };
}

function handleFetchError(err, throwOnError) {
  if (throwOnError) throw err;
  if (isDev()) console.warn("leaderboard fetch failed", err);
  return [];
}

// ── Global leaderboard ────────────────────────────────────────────────────────

export async function fetchGlobalLeaderboard(seed = getDailySeed(), options = {}) {
  try {
    const rows = await sbFetch(`leaderboard?club_code=eq.__global__&day_seed=eq.${encodeURIComponent(seed)}&order=iq_score.desc&limit=1000`);
    return normalizeLeaderboardRows(rows || []);
  } catch (err) { return handleFetchError(err, options.throwOnError); }
}

export async function fetchDailyStats(seed = getDailySeed(), options = {}) {
  try {
    const rows = await fetchGlobalLeaderboard(seed, options);
    return { total: rows.length, topScore: rows[0]?.iq_score || null };
  } catch (err) {
    if (options.throwOnError) throw err;
    return { total: 0, topScore: null };
  }
}

// ── Club leaderboard ──────────────────────────────────────────────────────────

export async function fetchClubLeaderboard(clubCode, seed = getDailySeed(), options = {}) {
  if (!clubCode) return [];
  try {
    const rows = await sbFetch(`leaderboard?club_code=eq.${encodeURIComponent(clubCode)}&day_seed=eq.${encodeURIComponent(seed)}&order=iq_score.desc&limit=500`);
    return normalizeLeaderboardRows(rows || []);
  } catch (err) { return handleFetchError(err, options.throwOnError); }
}

export async function fetchClubShareCount(clubCode, seed = getDailySeed()) {
  if (!clubCode) return 0;
  try {
    const rows = await sbFetch(`club_share_events?club_code=eq.${encodeURIComponent(clubCode)}&day_seed=eq.${encodeURIComponent(seed)}&select=player_id`);
    return new Set((rows || []).map(r => String(r?.player_id || "").trim()).filter(Boolean)).size || 0;
  } catch { return 0; }
}

// ── Score posting ─────────────────────────────────────────────────────────────

async function upsertLeaderboardRow(row) {
  const identityFilter = row.user_id
    ? `user_id=eq.${encodeURIComponent(row.user_id)}`
    : `player_id=eq.${encodeURIComponent(row.player_id)}`;
  const query = `leaderboard?club_code=eq.${encodeURIComponent(row.club_code)}&day_seed=eq.${encodeURIComponent(row.day_seed)}&${identityFilter}`;
  const patchBody = {
    user_id: row.user_id || null,
    player_id: row.player_id,
    name: row.name,
    iq_score: row.iq_score,
    time_secs: row.time_secs,
  };

  const existing = await sbFetch(`${query}&select=id&limit=1`).catch(() => []);
  if (existing?.length) {
    try {
      await sbPatch(query, patchBody, "return=minimal");
      return;
    } catch {
      await sbDelete(query).catch(() => {});
    }
  }

  await sbPost("leaderboard", row, "return=minimal");
}

export async function postScore({ playerId, name, iqScore, timeSecs, clubCode, seed = getDailySeed(), profile = null }) {
  if (!playerId || iqScore === null || iqScore === undefined) return false;

  const stablePlayerId = String(playerId).trim();
  if (!stablePlayerId) return false;

  const authUserId = isUuid(stablePlayerId) ? stablePlayerId : (isUuid(profile?.id) ? profile.id : null);
  const cleanClubCode = clubCode && clubCode !== "__global__" ? String(clubCode).trim() : null;
  const displayName = resolveLeaderboardName({
    profileDisplayName: profile?.displayName || profile?.display_name,
    profileName: profile?.name || profile?.fullName || profile?.full_name,
    localPlayerName: name || getLeaderboardDisplayName(profile) || getLocalPlayerName(),
    guestName: isGuestId(stablePlayerId) ? "Guest Rackler" : null,
  });

  const body = {
    player_id: stablePlayerId,
    user_id: authUserId,
    name: isGuestId(stablePlayerId) ? "Guest Rackler" : displayName,
    iq_score: Number(iqScore),
    time_secs: timeSecs || null,
    day_seed: seed,
    club_code: "__global__",
  };

  try {
    await upsertLeaderboardRow(body);
    if (cleanClubCode) await upsertLeaderboardRow({ ...body, club_code: cleanClubCode });
    return true;
  } catch (err) {
    if (isDev()) console.warn("postScore failed", err);
    return false;
  }
}

export async function removeLeaderboardScore({ playerId, seed = getDailySeed(), clubCode = "__global__" } = {}) {
  const stablePlayerId = String(playerId || "").trim();
  if (!stablePlayerId) return false;

  const boardCode = clubCode && clubCode !== "__global__" ? String(clubCode).trim() : "__global__";
  const identityFilter = isUuid(stablePlayerId)
    ? `user_id=eq.${encodeURIComponent(stablePlayerId)}`
    : `player_id=eq.${encodeURIComponent(stablePlayerId)}`;
  const query = `leaderboard?club_code=eq.${encodeURIComponent(boardCode)}&day_seed=eq.${encodeURIComponent(seed)}&${identityFilter}`;

  try {
    await sbDelete(query);
    return true;
  } catch (err) {
    if (isDev()) console.warn("removeLeaderboardScore failed", err);
    return false;
  }
}

export async function migrateDailyLeaderboardIdentity({ fromPlayerId, toPlayerId, name, iqScore, timeSecs, clubCode, seed = getDailySeed(), profile = null } = {}) {
  const fromId = String(fromPlayerId || "").trim();
  const toId = String(toPlayerId || "").trim();
  if (!toId || iqScore === null || iqScore === undefined) return false;

  const posted = await postScore({ playerId: toId, name, iqScore, timeSecs, clubCode, seed, profile });

  if (posted && fromId && fromId !== toId && isGuestId(fromId)) {
    await removeLeaderboardScore({ playerId: fromId, seed, clubCode: "__global__" });
    if (clubCode && clubCode !== "__global__") await removeLeaderboardScore({ playerId: fromId, seed, clubCode });
  }

  return posted;
}

export async function recordShareEvent({ clubCode, playerId, playerName, seed = getDailySeed() }) {
  if (!clubCode || !playerId) return;
  try {
    await sbPost("club_share_events", {
      club_code: clubCode,
      day_seed: seed,
      player_id: playerId,
      player_name: resolveLeaderboardName({ localPlayerName: playerName || getLeaderboardDisplayName() }),
      shared_at: new Date().toISOString(),
    }, "resolution=merge-duplicates");
  } catch {}
}

// ── Rank utilities ────────────────────────────────────────────────────────────

export function mergeCurrentScore(rows, currentScore, currentTimeSecs, playerId, name = "You", options = {}) {
  if (currentScore === null || currentScore === undefined || !playerId) return normalizeLeaderboardRows(rows || []);

  const currentId = String(playerId).trim();
  const boardCode = options.clubCode || rows?.[0]?.club_code || "__global__";
  const daySeed = options.seed || rows?.[0]?.day_seed || getDailySeed();
  const entry = {
    player_id: currentId,
    user_id: isUuid(currentId) ? currentId : null,
    iq_score: Number(currentScore),
    time_secs: currentTimeSecs || null,
    name: resolveLeaderboardName({ localPlayerName: name, guestName: isGuestId(currentId) ? "Guest Rackler" : null }),
    isYou: true,
    day_seed: daySeed,
    club_code: boardCode,
  };

  const filtered = (rows || []).filter(r => playerIdFrom(r) !== currentId && userIdFrom(r) !== currentId);
  return normalizeLeaderboardRows([...filtered, entry]);
}

export function rankOfCurrent(rows, currentScore, playerId = null) {
  if (currentScore === null || currentScore === undefined || !rows?.length) return null;
  const sorted = normalizeLeaderboardRows(rows || []);
  let idx = -1;

  if (playerId) {
    const currentId = String(playerId).trim();
    idx = sorted.findIndex(r => playerIdFrom(r) === currentId || userIdFrom(r) === currentId);
  }

  if (idx < 0) idx = sorted.findIndex(r => r.isYou);
  return idx >= 0 ? idx + 1 : null;
}

export function safeLeaderboardName(row, fallback = "Guest Rackler") {
  return resolveLeaderboardName({ localPlayerName: row?.name || row?.player_name, fallback });
}
