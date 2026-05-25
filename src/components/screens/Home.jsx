// ─── Rackle v2 · Home ─────────────────────────────────────────────────────────
// Simple above-the-fold homepage: Daily Rackle + Open Play first.

import { useState, useEffect, useCallback } from "react";
import {
  fetchGlobalLeaderboard,
  fetchDailyStats,
  fetchClubLeaderboard,
  fetchClubs,
  getClubs,
  rankOfCurrent,
  mergeCurrentScore,
  safeLeaderboardName,
} from "../../engine/leaderboard.js";
import {
  getProfile,
  getClubCode,
  getTodayDailyResult,
  isDailyResultForToday,
  saveDailyResult,
  getStreak,
  getHistory,
  getDayNum,
  getDailySeed,
  getPlayerId,
  getLeaderboardDisplayName,
} from "../../engine/storage.js";
import { fetchTodayDailyResult as fetchSupabaseTodayDailyResult } from "../../engine/supabase.js";
import { buildShareText, getIQTier } from "../../engine/scoring.js";
import { trackRackleEvent, getScoreBand, getClubState } from "../../engine/analytics.js";
import "../../design/home-hero-v2.css";

const STREAK_EMOJIS = {
  1: "🌱",
  2: "✨",
  3: "🀄",
  4: "🏮",
  5: "🔥",
  6: "💎",
  7: "👑",
};

const HERO_TILES = [
  { value: "8", suit: "DOT", color: "blue", detail: "••••" },
  { value: "7", suit: "BAM", color: "green", detail: "|||" },
  { value: "5", suit: "CRK", color: "red", detail: "◆◆◆" },
  { value: "白", suit: "SOAP", color: "slate", detail: "— — —" },
  { value: "6", suit: "BAM", color: "green", detail: "|||" },
];

function getHomepageStreakEmoji(streak = 0) {
  const count = Number(streak || 0);
  if (STREAK_EMOJIS[count]) return STREAK_EMOJIS[count];
  if (count >= 30) return "👑";
  if (count >= 14) return "💎";
  if (count >= 8) return "🏮";
  return "🀄";
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function calc() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

async function share(text) {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return "native";
    } catch {
      // Fall through to clipboard.
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
    return "copy";
  } catch {
    return "copy-failed";
  }
}

function rowScore(row) {
  return Number(row?.iqScore ?? row?.iq_score ?? row?.score ?? 0);
}

function rowName(row) {
  return safeLeaderboardName(row);
}

function rowPlayerId(row) {
  return row?.playerId || row?.player_id || row?.user_id || row?.id || null;
}

function averageScore(history) {
  if (!history?.length) return null;
  const scores = history.map(rowScore).filter(Boolean);
  if (!scores.length) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function bestScore(history) {
  if (!history?.length) return null;
  const scores = history.map(rowScore).filter(Boolean);
  return scores.length ? Math.max(...scores) : null;
}

function ordinal(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n}st`;
  if (mod10 === 2 && mod100 !== 12) return `${n}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${n}rd`;
  return `${n}th`;
}

function getPlayerArchetype({ score, avg, streak, hasPlayed }) {
  const base = score || avg || 0;
  if (!hasPlayed) return { name: "Table Scout", detail: "Your first daily read unlocks your style." };
  if (streak >= 7) return { name: "Streak Keeper", detail: "You keep showing up when the rack gets tricky." };
  if (base >= 88) return { name: "Rack Whisperer", detail: "Clean reads. Fast decisions. Strong table feel." };
  if (base >= 76) return { name: "Charleston Climber", detail: "Your decisions are trending sharper." };
  if (base >= 64) return { name: "Pattern Finder", detail: "You are spotting useful shape earlier." };
  return { name: "Table Builder", detail: "You are learning what to keep and what to release." };
}

function buildResultFromLeaderboardRow(row, seed) {
  if (!row) return null;
  const score = rowScore(row);
  if (!score) return null;
  return {
    mode: "daily",
    daySeed: seed,
    day_seed: seed,
    iqScore: score,
    totalScore: score,
    time: row?.time_secs ?? row?.timeSecs ?? row?.time ?? null,
    timeSecs: row?.time_secs ?? row?.timeSecs ?? row?.time ?? null,
    rating: row?.rating || "Table read complete",
    completedDate: new Date().toISOString().slice(0, 10),
    ts: Date.now(),
    source: "leaderboard",
  };
}

function findCurrentPlayerRow(rows = [], playerId) {
  const currentId = String(playerId || "").trim();
  if (!currentId) return null;
  return (rows || []).find(row => {
    const rowPid = String(row?.player_id || row?.playerId || "").trim();
    const rowUid = String(row?.user_id || row?.userId || "").trim();
    return rowPid === currentId || rowUid === currentId;
  }) || null;
}

function HomeHeroTile({ tile, index }) {
  return (
    <span className={`rk-home-hero-v2__tile rk-home-hero-v2__tile--${tile.color} rk-home-hero-v2__tile--${index + 1}`} aria-hidden="true">
      <span className="rk-home-hero-v2__tile-corner rk-home-hero-v2__tile-corner--tl">{tile.value}</span>
      <span className="rk-home-hero-v2__tile-corner rk-home-hero-v2__tile-corner--tr">{tile.value}</span>
      <span className="rk-home-hero-v2__tile-value">{tile.value}</span>
      <span className="rk-home-hero-v2__tile-detail">{tile.detail}</span>
      <span className="rk-home-hero-v2__tile-suit">{tile.suit}</span>
    </span>
  );
}

function SimpleActionHero({
  profile,
  playedToday,
  todayResult,
  dayNum,
  globalRank,
  clubRank,
  streak,
  timeLeft,
  setScreen,
  handleShare,
}) {
  const playerName = getLeaderboardDisplayName(profile);
  const isGuest = !profile?.name && !profile?.email;
  const score = todayResult?.iqScore ?? todayResult?.totalScore ?? null;
  const tier = score ? getIQTier(score) : null;
  const heroTitle = playedToday ? "Today’s read is in." : "Fresh rack,\nnew Charleston.";
  const heroSubcopy = playedToday ? "Review the full scorecard or practice another rack." : "Play the daily, then compare your read with the table.";

  return (
    <section className="rk-home-hero-v2" aria-label="Start playing Rackle">
      <div className="rk-home-hero-v2__card">
        <div className="rk-home-hero-v2__glow" aria-hidden="true" />

        <div className="rk-home-hero-v2__top">
          <span className="rk-home-hero-v2__pill"><span /> Daily Rackle · #{dayNum}</span>
          <span className="rk-home-hero-v2__countdown">{playedToday ? "score posted" : `closes in ${timeLeft}`}</span>
        </div>

        {playedToday && score ? (
          <div className="rk-home-hero-v2__score" aria-label={`Today’s score ${score} Rackle IQ`}>
            <span>{score}</span>
            <small>Rackle IQ</small>
          </div>
        ) : (
          <div className="rk-home-hero-v2__tile-row" aria-hidden="true">
            {HERO_TILES.map((tile, index) => (
              <HomeHeroTile key={`${tile.value}-${tile.suit}-${index}`} tile={tile} index={index} />
            ))}
          </div>
        )}

        <div className="rk-home-hero-v2__copy">
          <p className="rk-home-hero-v2__kicker">
            {playedToday ? tier?.level || "Table read complete" : "Fresh rack"}
          </p>
          <h1 className="rk-home-hero-v2__title">{heroTitle}</h1>
          <p className="rk-home-hero-v2__subcopy">{heroSubcopy}</p>
        </div>

        <div className="rk-home-hero-v2__actions">
          <button
            className="rk-home-hero-v2__cta rk-home-hero-v2__cta--primary"
            onClick={() => {
              try { localStorage.setItem("rackleHasSeenIntro", "true"); } catch {}
              setScreen?.(playedToday ? "scorecard" : "game");
            }}
          >
            <span className="rk-home-hero-v2__cta-dot" />
            {playedToday ? "View Scorecard" : "Play Today’s Rackle"}
          </button>

          <button
            className="rk-home-hero-v2__cta rk-home-hero-v2__cta--secondary"
            onClick={() => setScreen?.("practice")}
          >
            Free Play
          </button>
        </div>

        <div className="rk-home-hero-v2__signals">
          {globalRank && <span>Global #{globalRank}</span>}
          {clubRank && <span>Club #{clubRank}</span>}
          {streak > 0 && <span>{getHomepageStreakEmoji(streak)} {streak}-day streak</span>}
          {!playedToday && <span>{isGuest ? "Guest table ready" : `Welcome back, ${playerName}`}</span>}
        </div>

        {playedToday && (
          <button type="button" className="rk-home-hero-v2__share" onClick={handleShare}>
            Share your score →
          </button>
        )}
      </div>
    </section>
  );
}

function SocialEnergy({
  globalRows,
  clubRows,
  dailyStats,
  clubName,
  setScreen,
  todayResult,
  globalRank,
  clubRank,
  leaderboardError,
  onRefreshLeaderboard,
  handleShare,
}) {
  const hasClub = Boolean(clubName);
  const [activeRoom, setActiveRoom] = useState(hasClub ? "club" : "global");
  const boardRoom = hasClub ? activeRoom : "global";

  const completedToday = Boolean(todayResult);
  const currentScore = todayResult?.iqScore ?? todayResult?.totalScore ?? null;
  const activeRows = (boardRoom === "club" ? clubRows : globalRows) || [];
  const topRows = activeRows.slice(0, 3);
  const activeRank = boardRoom === "club" ? clubRank : globalRank;
  const activeLabel = boardRoom === "club" ? "Club" : "Global";
  const activeCount = activeRows.length || (boardRoom === "global" ? dailyStats?.total || 0 : 0);
  const boardPill = leaderboardError ? "Quiet" : activeCount > 0 ? activeLabel : "Quiet";
  const currentInTopRows = topRows.some((row) => row?.isYou || rowPlayerId(row) === getPlayerId());
  const showCurrentRow = completedToday && currentScore && activeRank && !currentInTopRows;
  const currentDescriptor = currentScore ? getIQTier(currentScore)?.level || "Table read" : "Table read";

  const statusCopy = completedToday
    ? activeRank
      ? boardRoom === "club"
        ? `You’re sitting ${ordinal(activeRank)} in your club today.`
        : `You’re sitting ${ordinal(activeRank)} globally today.`
      : "Your score is posted."
    : "Play the daily to take your seat.";

  const scoreLine = completedToday && currentScore
    ? `${currentScore} Rackle IQ · ${currentDescriptor}`
    : "The leaderboard opens after your daily read.";

  const emptyTitle = boardRoom === "club" ? "Your club board is quiet." : "No scores yet today.";
  const emptyBody = boardRoom === "club" ? "Play today’s rack or invite your table." : "Be the first to wake the room.";

  return (
    <section className="rk-table-board" aria-label="Today’s table board">
      <div className="rk-table-board__inner">
        <div className="rk-table-board__card">
          <div className="rk-table-board__card-intro">
            <p className="rk-table-board__eyebrow">Daily table</p>
            <h2 className="rk-section-title rk-table-board__title">Today’s table board</h2>
            <p className="rk-table-board__subcopy">See how your daily read stacks up after you play.</p>
          </div>

          <div className="rk-table-board__card-head">
            <div>
              <strong>{statusCopy}</strong>
              {scoreLine && <p>{scoreLine}</p>}
            </div>
            <span className={`rk-table-board__pill rk-table-board__pill--${boardPill.toLowerCase()}`}>{boardPill}</span>
          </div>

          {hasClub && (
            <div className="rk-table-board__tabs" role="tablist" aria-label="Choose leaderboard room">
              <button type="button" className={activeRoom === "global" ? "is-active" : ""} onClick={() => setActiveRoom("global")}>Global</button>
              <button type="button" className={activeRoom === "club" ? "is-active" : ""} onClick={() => setActiveRoom("club")}>Club</button>
            </div>
          )}

          {leaderboardError ? (
            <div className="rk-table-board__state" role="status">
              <h3>The board is warming up.</h3>
              <p>Try again in a moment.</p>
              <button type="button" className="rk-btn rk-btn--secondary" onClick={onRefreshLeaderboard}>Refresh board</button>
            </div>
          ) : topRows.length ? (
            <div className="rk-table-board__rows" aria-label={`${activeLabel} top scores`}>
              {topRows.map((row, i) => {
                const score = rowScore(row);
                const descriptor = getIQTier(score)?.level || "Table read";
                const isCurrent = !!row.isYou;
                const isTopScore = i === 0;
                const rowClass = [
                  "rk-table-board-row",
                  isTopScore ? "is-top-score" : "",
                  isCurrent ? "is-current" : "",
                ].filter(Boolean).join(" ");

                return (
                  <div className={rowClass} key={`${rowPlayerId(row) || rowName(row)}-${boardRoom}-${i}`}>
                    <span className="rk-table-board-row__rank">{i + 1}</span>
                    <div className="rk-table-board-row__player">
                      <strong>{rowName(row)}</strong>
                      <small>{isTopScore ? `Top table read · ${descriptor}` : descriptor}</small>
                    </div>
                    <em>{score}</em>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rk-table-board__state" role="status">
              <h3>{emptyTitle}</h3>
              <p>{emptyBody}</p>
              <button type="button" className="rk-btn rk-btn--primary" onClick={() => setScreen?.("game")}>Play today’s Rackle</button>
            </div>
          )}

          {showCurrentRow && (
            <div className="rk-table-board__current">
              <span>Your table read</span>
              <strong>#{activeRank} · {currentScore} Rackle IQ</strong>
            </div>
          )}

          <div className="rk-table-board__actions">
            <button
              type="button"
              className="rk-btn rk-btn--primary rk-table-board__primary"
              onClick={() => setScreen?.(boardRoom === "club" && hasClub ? "clubRoom" : "leaderboard")}
            >
              View full board
            </button>
            <button
              type="button"
              className="rk-btn rk-btn--ghost rk-table-board__secondary"
              onClick={() => completedToday ? handleShare?.() : setScreen?.("game")}
            >
              {completedToday ? "Share your score" : "Play daily"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PracticeRoomSection({ setScreen }) {
  return (
    <section className="rk-practice-card rk-practice-card--v2">
      <div className="rk-practice-card__inner">
        <div className="rk-practice-card__copy">
          <p className="rk-room-pill rk-room-pill--practice"><span /> Open Play</p>
          <h2 className="rk-practice-card__title">Practice without touching today’s score</h2>
          <p className="rk-practice-card__sub">Use Open Play for reps, experiments, and sharper Charleston decisions.</p>
        </div>

        <div className="rk-practice-card__actions">
          <button className="rk-btn rk-btn--ghost rk-practice-card__button" onClick={() => setScreen?.("practice")}>Open Play →</button>
          <p className="rk-practice-card__meta">Unlimited reps. No leaderboard pressure.</p>
        </div>
      </div>
    </section>
  );
}

function PlayerIdentity({ archetype, avg, best, streak, playedToday, todayResult, clubAverage }) {
  const aboveClub = playedToday && todayResult && clubAverage ? todayResult.iqScore >= clubAverage : false;
  const spotlight = playedToday
    ? aboveClub
      ? "You finished above your club average today."
      : clubAverage
        ? `Your club average is ${clubAverage}. One stronger read puts you right in that mix.`
        : "Your table identity updates with every daily read."
    : streak > 0
      ? `${streak}-day streak in play. One daily read keeps the rhythm going.`
      : "Your first daily read unlocks your player identity card.";

  const factCards = [
    { label: "Today", value: playedToday && todayResult ? todayResult.iqScore : "—", note: playedToday ? "today’s read" : "not posted yet" },
    { label: "Average IQ", value: avg ?? "—", note: avg ? "across your reads" : "build this over time" },
    { label: "Best", value: best ?? "—", note: best ? "personal high" : "best score pending" },
    { label: "Streak", value: streak > 0 ? `${streak}` : "—", note: streak > 0 ? "days live" : "start one today" },
  ];

  return (
    <section className="rk-player-identity">
      <div className="rk-player-identity__shell">
        <div className="rk-player-identity__header">
          <div className="rk-player-identity__title-wrap">
            <p className="rk-room-pill rk-room-pill--identity"><span /> Player Identity</p>
            <p className="rk-player-identity__eyebrow">Your Rackle Style</p>
            <h2 className="rk-player-identity__title">{archetype.name}</h2>
            <p className="rk-player-identity__sub">{archetype.detail}</p>
          </div>

          <div className="rk-player-identity__spotlight">
            <span className="rk-player-identity__spotlight-label">Identity Signal</span>
            <strong className="rk-player-identity__spotlight-value">{playedToday && todayResult ? `${todayResult.iqScore} IQ Today` : "First Read Pending"}</strong>
            <p className="rk-player-identity__spotlight-copy">{spotlight}</p>
          </div>
        </div>

        <div className="rk-player-identity__facts-grid">
          {factCards.map((fact) => (
            <div key={fact.label} className="rk-player-identity__fact-card">
              <span className="rk-player-identity__fact-label">{fact.label}</span>
              <strong className="rk-player-identity__fact-value">{fact.value}</strong>
              <small className="rk-player-identity__fact-note">{fact.note}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClubDirectoryPreview({ setScreen }) {
  const [clubs, setClubs] = useState(() => getClubs());

  useEffect(() => {
    let alive = true;
    fetchClubs()
      .then((nextClubs) => {
        if (alive) setClubs(nextClubs || {});
      })
      .catch(() => {
        if (alive) setClubs(getClubs() || {});
      });

    return () => { alive = false; };
  }, []);

  const clubCards = Object.entries(clubs || {}).map(([code, club]) => {
    const initials = String(club?.name || "RC")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "RC";

    return {
      code,
      name: club?.name || "Rackle Club",
      location: club?.location || "Club directory",
      badge: club?.emoji || initials,
    };
  });

  const clubCountLabel = `${clubCards.length} ${clubCards.length === 1 ? "club" : "clubs"} listed`;

  return (
    <section className="rk-club-directory-preview" aria-label="Rackle club directory preview">
      <div className="rk-club-directory-preview__shell">
        <div className="rk-club-directory-preview__glow" aria-hidden="true" />

        <div className="rk-club-directory-preview__intro">
          <p className="rk-room-pill rk-room-pill--club-directory"><span /> Rackle Clubs</p>
          <h2 className="rk-club-directory-preview__title">Mahjong clubs are gathering around Rackle.</h2>
          <p className="rk-club-directory-preview__sub">Discover clubs playing the same daily rack and bring your Mahjong community into the ritual.</p>
        </div>

        <div className="rk-club-directory-preview__stats" aria-label="Rackle club network stats">
          <span>{clubCountLabel}</span>
          <span>Club directory live</span>
          <span>New clubs joining weekly</span>
        </div>

        <div className="rk-club-directory-preview__rail" aria-label="Club preview cards">
          {clubCards.length ? clubCards.slice(0, 4).map((club) => (
            <article className="rk-club-directory-preview__card" key={club.code}>
              <div className="rk-club-directory-preview__badge">{club.badge}</div>
              <div>
                <h3>{club.name}</h3>
                <p>{club.location}</p>
              </div>
              <div className="rk-club-directory-preview__meta">
                <span>Club code {club.code}</span>
                <span>In the directory</span>
              </div>
            </article>
          )) : (
            <article className="rk-club-directory-preview__card rk-club-directory-preview__card--empty">
              <div className="rk-club-directory-preview__badge">RC</div>
              <div>
                <h3>Club directory opening soon.</h3>
                <p>Be the first table to join Rackle.</p>
              </div>
            </article>
          )}
        </div>

        <div className="rk-club-directory-preview__actions">
          <button
            type="button"
            className="rk-btn rk-btn--primary rk-club-directory-preview__primary"
            onClick={() => {
              trackRackleEvent("browse_clubs_clicked", {
                source: "homepage_club_directory_preview",
                hasClub: Boolean(getClubCode()),
                clubState: getClubState({ hasClub: Boolean(getClubCode()) }),
              });
              setScreen?.("clubDirectory");
            }}
          >
            Explore Club Directory
          </button>
          <div className="rk-club-directory-preview__owner-cta">
            <span>Own a Mahjong club?</span>
            <button type="button" onClick={() => setScreen?.("foundingClubs")}>Start A Founding Club</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home({ setScreen }) {
  const profile = getProfile();
  const clubCode = getClubCode();
  const streak = getStreak();
  const dayNum = getDayNum();
  const seed = getDailySeed();
  const history = getHistory();
  const localTodayResult = getTodayDailyResult();
  const localDoneToday = isDailyResultForToday(localTodayResult);
  const hasPlayed = history.length > 0;
  const playerId = getPlayerId();
  const playerName = getLeaderboardDisplayName(profile);

  const [globalRows, setGlobalRows] = useState([]);
  const [clubRows, setClubRows] = useState([]);
  const [dailyStats, setDailyStats] = useState(null);
  const [leaderboardError, setLeaderboardError] = useState(false);
  const [dbTodayResult, setDbTodayResult] = useState(null);

  const timeLeft = useCountdown();
  const todayResult = localDoneToday && localTodayResult ? localTodayResult : dbTodayResult;
  const playedToday = Boolean(todayResult);

  useEffect(() => {
    trackRackleEvent("homepage_viewed", {
      source: "home",
      hasClub: Boolean(clubCode),
      isGuest: !profile?.email,
      clubState: getClubState({ hasClub: Boolean(clubCode) }),
      dailyState: playedToday ? "completed" : "open",
    });
  }, [clubCode, profile?.email, playedToday]);

  const loadLeaderboardPreview = useCallback(async () => {
    try {
      const [stats, global, club, savedDaily] = await Promise.all([
        fetchDailyStats(seed),
        fetchGlobalLeaderboard(seed),
        clubCode ? fetchClubLeaderboard(clubCode, seed) : Promise.resolve([]),
        playerId ? fetchSupabaseTodayDailyResult(playerId, seed) : Promise.resolve(null),
      ]);

      const currentRow = findCurrentPlayerRow(global || [], playerId) || findCurrentPlayerRow(club || [], playerId);
      const hydratedResult = savedDaily || buildResultFromLeaderboardRow(currentRow, seed);

      if (hydratedResult) {
        setDbTodayResult(hydratedResult);
        saveDailyResult(hydratedResult);
        try { localStorage.setItem("rackleHasCompletedFirstDaily", "true"); } catch {}
      }

      setDailyStats(stats);
      setGlobalRows(global || []);
      setClubRows(club || []);
      setLeaderboardError(false);
    } catch (error) {
      if (import.meta.env?.DEV) console.warn("Rackle leaderboard preview failed", error);
      setDailyStats({ total: 0, topScore: null });
      setGlobalRows([]);
      setClubRows([]);
      setLeaderboardError(true);
    }
  }, [seed, clubCode, playerId]);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!alive) return;
      await loadLeaderboardPreview();
    }

    load();
    return () => { alive = false; };
  }, [loadLeaderboardPreview]);

  const currentScore = todayResult?.iqScore ?? todayResult?.totalScore ?? null;
  const currentTime = todayResult?.time ?? todayResult?.timeSecs ?? todayResult?.time_secs ?? null;

  const globalRowsWithMe = playedToday
    ? mergeCurrentScore(globalRows, currentScore, currentTime, playerId, playerName, { seed, clubCode: "__global__" })
    : globalRows;
  const clubRowsWithMe = playedToday && clubCode
    ? mergeCurrentScore(clubRows, currentScore, currentTime, playerId, playerName, { seed, clubCode })
    : clubRows;
  const dailyStatsWithMe = playedToday
    ? { total: globalRowsWithMe.length, topScore: globalRowsWithMe[0]?.iq_score ?? dailyStats?.topScore ?? null }
    : dailyStats;

  const globalRank = playedToday ? rankOfCurrent(globalRowsWithMe, currentScore, playerId) : null;
  const clubRank = playedToday && clubCode ? rankOfCurrent(clubRowsWithMe, currentScore, playerId) : null;
  const avg = averageScore(history);
  const best = bestScore(history);
  const clubAverage = clubRows.length
    ? Math.round(clubRows.reduce((sum, row) => sum + rowScore(row), 0) / clubRows.length)
    : null;
  const archetype = getPlayerArchetype({
    score: todayResult?.iqScore,
    avg,
    streak,
    hasPlayed: hasPlayed || playedToday,
  });

  const handleShare = useCallback(async () => {
    if (!todayResult) return;

    const text = buildShareText({
      score: todayResult.iqScore,
      dayNum,
      globalRank,
      clubRank,
      clubName: profile?.clubName ?? null,
      streak,
      url: `https://playrackle.com/daily/${dayNum}`,
    });

    const method = await share(text);
    if (method === "copy") trackRackleEvent("share_copy_clicked", { source: "homepage", mode: "daily", shareMethod: "copy" });
    if (method !== "copy-failed") {
      trackRackleEvent("score_shared", {
        source: "homepage",
        mode: "daily",
        shareMethod: method || "unknown",
        scoreBand: getScoreBand(todayResult.iqScore),
        hasClub: Boolean(profile?.clubName),
        isGuest: !profile?.email,
        hasGlobalRank: Boolean(globalRank),
        hasClubRank: Boolean(clubRank),
      });
    }
  }, [todayResult, dayNum, globalRank, clubRank, profile, streak]);

  return (
    <div className="rk-home rk-home--v2">
      <SimpleActionHero
        profile={profile}
        playedToday={!!playedToday}
        todayResult={todayResult}
        dayNum={dayNum}
        globalRank={globalRank}
        clubRank={clubRank}
        streak={streak}
        timeLeft={timeLeft}
        setScreen={setScreen}
        handleShare={handleShare}
      />

      <SocialEnergy
        globalRows={globalRowsWithMe}
        clubRows={clubRowsWithMe}
        dailyStats={dailyStatsWithMe}
        clubName={profile?.clubName || profile?.club_name || null}
        setScreen={setScreen}
        todayResult={todayResult}
        globalRank={globalRank}
        clubRank={clubRank}
        leaderboardError={leaderboardError}
        onRefreshLeaderboard={loadLeaderboardPreview}
        handleShare={handleShare}
      />

      <PracticeRoomSection setScreen={setScreen} />

      <PlayerIdentity
        archetype={archetype}
        avg={avg}
        best={best}
        streak={streak}
        playedToday={!!playedToday}
        todayResult={todayResult}
        clubAverage={clubAverage}
      />

      <ClubDirectoryPreview setScreen={setScreen} />
    </div>
  );
}
