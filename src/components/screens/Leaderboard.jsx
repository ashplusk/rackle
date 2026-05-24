// ─── Rackle v2 · Rack Leaders ────────────────────────────────────────────────
// Daily leaderboard for global and club rooms.

import { useState, useEffect } from "react";
import {
  fetchGlobalLeaderboard,
  fetchClubLeaderboard,
  mergeCurrentScore,
  rankOfCurrent,
  safeLeaderboardName,
  exposeLeaderboardDebug,
} from "../../engine/leaderboard.js";
import {
  getDailySeed, getDayNum, getProfile, getClubCode, getTodayDailyResult, getPlayerId, getLeaderboardDisplayName,
} from "../../engine/storage.js";
import { getIQTier } from "../../engine/scoring.js";
import { trackRackleEvent, getClubState } from "../../engine/analytics.js";

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

function EmptyBoard({ tab, setScreen }) {
  if (tab === "club") {
    return (
      <div className="rk-lb__empty">
        <p className="rk-lb__empty-h">Your club board is quiet.</p>
        <p className="rk-lb__empty-sub">Play today’s rack or invite your table.</p>
        <button className="rk-btn rk-btn--primary" onClick={() => setScreen?.("game")}>Play today’s Rackle</button>
      </div>
    );
  }

  return (
    <div className="rk-lb__empty">
      <p className="rk-lb__empty-h">No scores yet today.</p>
      <p className="rk-lb__empty-sub">Be the first to wake the room.</p>
      <button className="rk-btn rk-btn--primary" onClick={() => setScreen?.("game")}>Play today’s Rackle</button>
    </div>
  );
}

export default function Leaderboard({ setScreen }) {
  const seed       = getDailySeed();
  const dayNum     = getDayNum();
  const profile    = getProfile();
  const clubCode   = getClubCode();
  const playerId   = getPlayerId();
  const myResult   = getTodayDailyResult();
  const myIQ       = myResult?.iqScore ?? myResult?.totalScore ?? null;

  const hasClub    = !!clubCode;
  const [tab, setTab] = useState(hasClub ? "club" : "global");

  const [globalRows, setGlobalRows] = useState([]);
  const [clubRows,   setClubRows]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [loadError,  setLoadError]  = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    trackRackleEvent("leaderboard_opened", {
      source: "leaderboard",
      activeTab: hasClub ? tab : "global",
      hasClub,
      isGuest: !profile?.email,
      clubState: getClubState({ hasClub }),
    });
  }, []);

  useEffect(() => {
    if (hasClub && tab === "club") {
      trackRackleEvent("club_leaderboard_opened", {
        source: "leaderboard",
        activeTab: "club",
        hasClub: true,
        isGuest: !profile?.email,
        clubState: "joined",
      });
    }
  }, [hasClub, tab, profile?.email]);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setLoadError(false);
      try {
        const [g, c] = await Promise.all([
          fetchGlobalLeaderboard(seed, { throwOnError: true }),
          hasClub ? fetchClubLeaderboard(clubCode, seed, { throwOnError: true }) : Promise.resolve([]),
        ]);
        if (!alive) return;
        setGlobalRows(g || []);
        setClubRows(c || []);
      } catch (err) {
        if (import.meta.env.DEV) console.warn("leaderboard load failed", err);
        if (!alive) return;
        setGlobalRows([]);
        setClubRows([]);
        setLoadError(true);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [seed, clubCode, hasClub, refreshKey]);

  const playerName  = getLeaderboardDisplayName(profile);
  const myTime      = myResult?.time ?? myResult?.timeSecs ?? myResult?.time_secs ?? null;
  const globalRowsWithMe = myIQ
    ? mergeCurrentScore(globalRows, myIQ, myTime, playerId, playerName, { seed, clubCode: "__global__" })
    : globalRows;
  const clubRowsWithMe = myIQ && clubCode
    ? mergeCurrentScore(clubRows, myIQ, myTime, playerId, playerName, { seed, clubCode })
    : clubRows;

  const activeTab   = hasClub ? tab : "global";
  const rows        = activeTab === "club" ? clubRowsWithMe : globalRowsWithMe;
  const roomLabel   = activeTab === "club" ? (profile?.clubName ?? "Your Table") : "Global Room";
  const topScore    = rows[0]?.iq_score ?? null;
  const totalReads  = rows.length;
  const avg         = rows.length
    ? Math.round(rows.reduce((s, r) => s + (r.iq_score || 0), 0) / rows.length)
    : null;
  const myRank      = myIQ && rows.length ? rankOfCurrent(rows, myIQ, playerId) : null;
  const gapToLead   = myIQ && topScore ? Math.max(0, Math.round(topScore - myIQ)) : null;

  useEffect(() => {
    exposeLeaderboardDebug({
      rawRows: activeTab === "club" ? clubRows : globalRows,
      dedupedRows: activeTab === "club" ? clubRows : globalRows,
      mergedRows: rows,
      currentPlayerRow: rows.find(r => String(r?.player_id || r?.playerId || "") === String(playerId)) || null,
      globalCount: globalRowsWithMe.length,
      clubCount: clubRowsWithMe.length,
      activeDailyRackleId: seed,
      activeGuestId: String(playerId || "").startsWith("guest-") ? playerId : null,
      activeUserId: String(playerId || "").startsWith("guest-") ? null : playerId,
      activeClubId: clubCode || null,
    });
  }, [activeTab, rows, globalRows, clubRows, globalRowsWithMe.length, clubRowsWithMe.length, playerId, seed, clubCode]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  const boardMessage = loading
    ? "Opening the room."
    : loadError
      ? "Try again in a moment."
      : rows.length
        ? `${totalReads} ${totalReads === 1 ? "player" : "players"} on the board today. ${topScore ? `${Math.round(topScore)} is leading.` : ""}`
        : activeTab === "club"
          ? "Your club board is quiet."
          : "No scores yet today.";

  function refreshBoard() {
    trackRackleEvent("leaderboard_refresh_clicked", {
      source: activeTab === "club" ? "club_leaderboard" : "leaderboard",
      activeTab,
      hasClub,
      clubState: getClubState({ hasClub }),
    });
    setRefreshKey(value => value + 1);
  }

  return (
    <div className="rk-lb-screen">
      <section className="rk-lb__hero" aria-labelledby="leaderboard-title">
        <div className="rk-lb__hero-top">
          <span className="rk-lb__hero-pill">Daily Rackle · #{dayNum}</span>
          <span className="rk-lb__date">{today}</span>
        </div>

        {hasClub && (
          <div className="rk-lb__tabs" aria-label="Leaderboard room">
            <button
              className={`rk-lb__tab ${tab === "club" ? "rk-lb__tab--active" : ""}`}
              onClick={() => setTab("club")}
            >
              Club Room
            </button>
            <button
              className={`rk-lb__tab ${tab === "global" ? "rk-lb__tab--active" : ""}`}
              onClick={() => setTab("global")}
            >
              Global Room
            </button>
          </div>
        )}

        <div className="rk-lb__hero-copy">
          <p className="rk-lb__eyebrow">{roomLabel}</p>
          <h1 id="leaderboard-title" className="rk-lb__title">Strongest Reads Today</h1>
          <p className="rk-lb__subtitle">Same rack. Same Charleston. One board to climb.</p>
        </div>

        {!loading && !loadError && (
          <div className="rk-lb__stats" aria-label="Today's leaderboard stats">
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

      <section className="rk-lb__board" aria-label="Leaderboard list">
        <div className="rk-lb__board-head">
          <div>
            <p className="rk-lb__board-kicker">Live board</p>
            <h2 className="rk-lb__board-title">{activeTab === "club" ? "Club Leaders" : "Global Leaders"}</h2>
          </div>
          {rows.length > 0 && <span className="rk-lb__board-count">Top {Math.min(rows.length, 10)}</span>}
        </div>

        {loading ? (
          <div className="rk-lb__loading">
            <div className="rk-spinner" />
            <p>Loading scores…</p>
          </div>
        ) : loadError ? (
          <div className="rk-lb__empty">
            <p className="rk-lb__empty-h">The board is warming up.</p>
            <p className="rk-lb__empty-sub">Try again in a moment.</p>
            <button className="rk-btn rk-btn--primary" onClick={refreshBoard}>Refresh board</button>
          </div>
        ) : rows.length === 0 ? (
          <EmptyBoard tab={activeTab} setScreen={setScreen} />
        ) : (
          <ol className="rk-lb__list">
            {rows.map((row, i) => {
              const rank   = i + 1;
              const score  = Math.round(row.iq_score || 0);
              const name   = safeLeaderboardName(row);
              const rowId  = String(row.player_id || row.playerId || "");
              const isMe   = row.isYou || rowId === String(playerId);
              const tier   = getIQTier(score);
              const tone   = rankTone(rank);
              const time   = formatTime(row.time_secs);
              const detail = rank === 1
                ? "Top table read"
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

      {!hasClub && (
        <section className="rk-lb__join-club">
          <p className="rk-lb__join-kicker">No club joined yet.</p>
          <h2>Compare daily reads with your Mahjong group.</h2>
          <p className="rk-lb__join-copy">
            Join a club to compare daily reads with your Mahjong group.
          </p>
          <button className="rk-btn rk-btn--secondary" onClick={() => { trackRackleEvent("browse_clubs_clicked", { source: "leaderboard", hasClub: false, clubState: "none" }); setScreen?.("clubDirectory"); }}>Browse clubs</button>
        </section>
      )}
    </div>
  );
}
