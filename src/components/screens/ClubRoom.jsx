// ─── Rackle v2 · ClubRoom ────────────────────────────────────────────────────
// Club-specific leaderboard, activity, and invite surface.

import { useState, useEffect } from "react";
import {
  fetchClubLeaderboard, fetchClubShareCount, getClubs, safeLeaderboardName,
  mergeCurrentScore, rankOfCurrent, exposeLeaderboardDebug,
} from "../../engine/leaderboard.js";
import {
  getDailySeed, getDayNum, getProfile, getClubCode, getTodayDailyResult, getPlayerId, getLeaderboardDisplayName,
} from "../../engine/storage.js";
import { getIQTier, buildClubInviteText } from "../../engine/scoring.js";
import { trackRackleEvent, getClubState } from "../../engine/analytics.js";

async function share(text) {
  if (navigator.share) { try { await navigator.share({ text }); return "native"; } catch { /* use clipboard fallback */ } }
  try {
    await navigator.clipboard.writeText(text);
    alert("Invite link copied!");
    return "copy";
  } catch {
    return "copy-failed";
  }
}

function formatTime(seconds) {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (!mins) return `${secs}s`;
  return `${mins}m ${String(secs).padStart(2, "0")}s`;
}

function getInitials(name = "Guest Rackler") {
  const parts = String(name || "Guest Rackler").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "R";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function rankTone(rank) {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return "default";
}

export default function ClubRoom({ setScreen }) {
  const seed       = getDailySeed();
  const dayNum     = getDayNum();
  const profile    = getProfile();
  const clubCode   = getClubCode();
  const playerId   = getPlayerId();
  const myResult   = getTodayDailyResult();
  const myIQ       = myResult?.iqScore ?? myResult?.totalScore ?? null;
  const clubs      = getClubs();
  const clubInfo   = clubCode ? clubs[clubCode] : null;

  const [rows,       setRows]       = useState([]);
  const [shareCount, setShareCount] = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [loadError,  setLoadError]  = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    trackRackleEvent("club_leaderboard_opened", {
      source: "club_room",
      activeTab: "club",
      hasClub: Boolean(clubCode),
      isGuest: !profile?.email,
      clubState: getClubState({ hasClub: Boolean(clubCode) }),
    });
  }, [clubCode, profile?.email]);

  useEffect(() => {
    if (!clubCode) return;
    let alive = true;
    async function load() {
      setLoading(true);
      setLoadError(false);
      try {
        const [r, s] = await Promise.all([
          fetchClubLeaderboard(clubCode, seed, { throwOnError: true }),
          fetchClubShareCount(clubCode, seed),
        ]);
        if (!alive) return;
        setRows(r || []);
        setShareCount(s || 0);
      } catch (err) {
        if (import.meta.env.DEV) console.warn("club leaderboard load failed", err);
        if (!alive) return;
        setRows([]);
        setShareCount(0);
        setLoadError(true);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [clubCode, seed, refreshKey]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
  const clubName   = clubInfo?.name ?? profile?.clubName ?? "Your Club";
  const location   = clubInfo?.location ?? profile?.clubLocation ?? "Club Room";
  const playerName = getLeaderboardDisplayName(profile);
  const myTime = myResult?.time ?? myResult?.timeSecs ?? myResult?.time_secs ?? null;
  const rowsWithMe = myIQ && clubCode
    ? mergeCurrentScore(rows, myIQ, myTime, playerId, playerName, { seed, clubCode })
    : rows;
  const topScore   = rowsWithMe[0]?.iq_score ?? null;
  const totalReads = rowsWithMe.length;
  const avg        = rowsWithMe.length
    ? Math.round(rowsWithMe.reduce((s, r) => s + (r.iq_score || 0), 0) / rowsWithMe.length)
    : null;
  const myRank = myIQ && rowsWithMe.length ? rankOfCurrent(rowsWithMe, myIQ, playerId) : null;
  const gapToLead = myIQ && topScore ? Math.max(0, Math.round(topScore - myIQ)) : null;

  useEffect(() => {
    exposeLeaderboardDebug({
      rawRows: rows,
      dedupedRows: rows,
      mergedRows: rowsWithMe,
      currentPlayerRow: rowsWithMe.find(r => String(r?.player_id || r?.playerId || "") === String(playerId)) || null,
      clubCount: rowsWithMe.length,
      activeDailyRackleId: seed,
      activeGuestId: String(playerId || "").startsWith("guest-") ? playerId : null,
      activeUserId: String(playerId || "").startsWith("guest-") ? null : playerId,
      activeClubId: clubCode || null,
    });
  }, [rows, rowsWithMe, playerId, seed, clubCode]);

  function refreshBoard() {
    trackRackleEvent("leaderboard_refresh_clicked", {
      source: "club_room",
      activeTab: "club",
      hasClub: Boolean(clubCode),
      clubState: getClubState({ hasClub: Boolean(clubCode) }),
    });
    setRefreshKey(value => value + 1);
  }

  if (!clubCode) {
    return (
      <div className="rk-lb-screen">
        <section className="rk-lb__hero" aria-labelledby="club-empty-title">
          <div className="rk-lb__hero-top">
            <span className="rk-lb__hero-pill">Club Room</span>
            <span className="rk-lb__date">Private table</span>
          </div>
          <div className="rk-lb__hero-copy">
            <p className="rk-lb__eyebrow">No club joined yet.</p>
            <h1 id="club-empty-title" className="rk-lb__title">Start A Club Board</h1>
            <p className="rk-lb__subtitle">Join a club to compare daily reads with your Mahjong group.</p>
          </div>
          <div className="rk-lb__status-card">
            <div>
              <p className="rk-lb__status-label">Find your table</p>
              <p className="rk-lb__status-copy">Club boards help your Mahjong group chase the same daily rack.</p>
            </div>
            <button className="rk-lb__mini-cta" onClick={() => { trackRackleEvent("browse_clubs_clicked", { source: "club_room", hasClub: false, clubState: "none" }); setScreen?.("clubDirectory"); }}>Browse clubs</button>
          </div>
        </section>
      </div>
    );
  }

  const boardMessage = loading
    ? "Opening the room."
    : loadError
      ? "Try again in a moment."
      : rowsWithMe.length
        ? `${totalReads} ${totalReads === 1 ? "player" : "players"} on the board today. ${topScore ? `${Math.round(topScore)} is leading ${clubName}.` : ""}`
        : "Your club board is quiet.";

  async function handleInvite() {
    const text = buildClubInviteText({
      clubName,
      clubUrl:  "https://playrackle.com",
    });
    const method = await share(text);
    trackRackleEvent("club_invite_copy_clicked", {
      source: "club_room",
      shareMethod: method || "unknown",
      copyType: "club_invite",
      hasClub: Boolean(clubCode),
      clubState: getClubState({ hasClub: Boolean(clubCode) }),
    });
  }

  return (
    <div className="rk-lb-screen rk-club-room--board">
      <section className="rk-lb__hero" aria-labelledby="club-room-title">
        <div className="rk-lb__hero-top">
          <span className="rk-lb__hero-pill">Daily Rackle · #{dayNum}</span>
          <span className="rk-lb__date">{today}</span>
        </div>

        <div className="rk-lb__hero-copy">
          <p className="rk-lb__eyebrow">{location}</p>
          <h1 id="club-room-title" className="rk-lb__title">{clubName}</h1>
          <p className="rk-lb__subtitle">Same rack. Your table’s board. One score to catch.</p>
        </div>

        {!loading && !loadError && (
          <div className="rk-lb__stats" aria-label="Club room stats">
            <div className="rk-lb__stat">
              <span className="rk-lb__stat-val">{totalReads}</span>
              <span className="rk-lb__stat-key">players on board</span>
            </div>
            <div className="rk-lb__stat">
              <span className="rk-lb__stat-val rk-lb__stat-val--gold">{topScore ? Math.round(topScore) : "—"}</span>
              <span className="rk-lb__stat-key">top read</span>
            </div>
            <div className="rk-lb__stat">
              <span className="rk-lb__stat-val">{avg ?? "—"}</span>
              <span className="rk-lb__stat-key">room avg</span>
            </div>
          </div>
        )}

        <div className="rk-lb__status-card">
          <div>
            <p className="rk-lb__status-label">The Board Is Moving</p>
            <p className="rk-lb__status-copy">{boardMessage}</p>
          </div>
          {myRank && myIQ ? (
            <div className="rk-lb__my-rank">
              <span>#{myRank}</span>
              <small>{gapToLead ? `${gapToLead} off first` : "holding first"}</small>
            </div>
          ) : loadError ? (
            <button className="rk-lb__mini-cta" onClick={refreshBoard}>Refresh</button>
          ) : (
            <button className="rk-lb__mini-cta" onClick={() => setScreen?.("game")}>Play</button>
          )}
        </div>
      </section>

      <section className="rk-lb__board" aria-label="Club leaderboard list">
        <div className="rk-lb__board-head">
          <div>
            <p className="rk-lb__board-kicker">Live board</p>
            <h2 className="rk-lb__board-title">Club Leaders</h2>
          </div>
          {rowsWithMe.length > 0 && <span className="rk-lb__board-count">Top {Math.min(rowsWithMe.length, 10)}</span>}
        </div>

        {loading ? (
          <div className="rk-lb__loading"><div className="rk-spinner" /><p>Loading scores…</p></div>
        ) : loadError ? (
          <div className="rk-lb__empty">
            <p className="rk-lb__empty-h">The board is warming up.</p>
            <p className="rk-lb__empty-sub">Try again in a moment.</p>
            <button className="rk-btn rk-btn--primary" onClick={refreshBoard}>Refresh board</button>
          </div>
        ) : rowsWithMe.length === 0 ? (
          <div className="rk-lb__empty">
            <p className="rk-lb__empty-h">Your club board is quiet.</p>
            <p className="rk-lb__empty-sub">Play today’s rack or invite your table.</p>
            <button className="rk-btn rk-btn--primary" onClick={() => setScreen?.("game")}>
              Play today’s Rackle
            </button>
          </div>
        ) : (
          <ol className="rk-lb__list">
            {rowsWithMe.map((row, i) => {
              const rank   = i + 1;
              const score  = Math.round(row.iq_score || 0);
              const name   = safeLeaderboardName(row);
              const isMe   = row.isYou || String(row.player_id || row.playerId || "") === String(playerId);
              const tier   = getIQTier(score);
              const tone   = rankTone(rank);
              const time   = formatTime(row.time_secs);
              const detail = rank === 1
                ? "Top club read"
                : isMe
                  ? "Your read"
                  : tier.level;

              return (
                <li key={row.player_id || `${name}-${rank}`} className={`rk-lb__row ${isMe ? "rk-lb__row--me" : ""}`}>
                  <span className={`rk-lb__row-rank rk-lb__row-rank--${tone}`}>#{rank}</span>
                  <span className="rk-lb__avatar" aria-hidden="true">{getInitials(name)}</span>
                  <span className="rk-lb__row-main">
                    <span className="rk-lb__row-name">
                      {name}
                      {isMe && <span className="rk-lb__you">You</span>}
                    </span>
                    <span className="rk-lb__row-detail">
                      {detail}{time ? ` · ${time}` : ""}
                    </span>
                  </span>
                  <span className="rk-lb__row-score" style={{ color: tier.color }}>
                    {score}
                    <small>IQ</small>
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className="rk-lb__join-club rk-club-room__invite-card">
        <p className="rk-lb__join-kicker">Bring your table in</p>
        <h2>Make this a club ritual</h2>
        <p className="rk-lb__join-copy">
          Invite players to chase the same rack and keep your table leaderboard alive.
        </p>
        <div className="rk-club-room__invite-actions">
          <button className="rk-btn rk-btn--secondary" onClick={handleInvite}>Invite your table</button>
          <button className="rk-btn rk-btn--ghost" onClick={() => setScreen?.("leaderboard")}>See Global Room →</button>
        </div>
        {shareCount > 0 && <p className="rk-club-room__share-note">{shareCount} shared today</p>}
      </section>
    </div>
  );
}
