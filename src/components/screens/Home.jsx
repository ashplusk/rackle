// ─── Rackle v2 · Home ─────────────────────────────────────────────────────────
// Premium homepage — daily ritual, social energy, club identity, return loop.

import { useState, useEffect, useCallback } from "react";
import {
  fetchGlobalLeaderboard,
  fetchDailyStats,
  fetchClubLeaderboard,
  fetchClubShareCount,
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
  getStreak,
  getHistory,
  getDayNum,
  getDailySeed,
  getPlayerId,
  getLeaderboardDisplayName,
} from "../../engine/storage.js";
import { buildShareText, buildClubInviteText, getIQTier, withIQStyle, scoreRevealFrame } from "../../engine/scoring.js";
import { trackRackleEvent, getScoreBand, getClubState } from "../../engine/analytics.js";

// ── Hero preview rack ─────────────────────────────────────────────────────────
const HERO_TILES = [
  { t: "s", s: "bam",  n: 2 },
  { t: "s", s: "crak", n: 5 },
  { t: "s", s: "dot",  n: 8 },
  { t: "d", v: "Red"        },
  { t: "w", v: "E"          },
  { t: "f"                   },
];

const SCORE_SIDE_TILES = {
  left: [
    { t: "s", s: "bam", n: 8 },
    { t: "d", v: "Red" },
    { t: "s", s: "crak", n: 2 },
  ],
  right: [
    { t: "f" },
    { t: "w", v: "E" },
    { t: "s", s: "dot", n: 9 },
  ],
};

const SCORE_TILE_POSES = {
  left: [
    { r: -12, y: 10 },
    { r: -3, y: -4 },
    { r: 7, y: 7 },
  ],
  right: [
    { r: -7, y: 7 },
    { r: 3, y: -4 },
    { r: 12, y: 10 },
  ],
};

const STREAK_EMOJIS = {
  1: "🌱",
  2: "✨",
  3: "🀄",
  4: "🏮",
  5: "🔥",
  6: "💎",
  7: "👑",
};

function getHomepageStreakEmoji(streak = 0) {
  const count = Number(streak || 0);
  if (STREAK_EMOJIS[count]) return STREAK_EMOJIS[count];
  if (count >= 30) return "👑";
  if (count >= 14) return "💎";
  if (count >= 8) return "🏮";
  return "🀄";
}

const TILE_CURVE = [
  { y: 12, r: -9 },
  { y: 4,  r: -5 },
  { y: 0,  r: -2 },
  { y: 0,  r: 2  },
  { y: 4,  r: 5  },
  { y: 12, r: 9  },
];

const HERO_TILE_LABELS = {
  bam: "BAM",
  crak: "CRK",
  dot: "DOT",
  Red: "RED",
  E: "WIND",
  f: "FLOWER",
};

const HERO_TILE_COLORS = {
  bam: "#176B42",
  crak: "#A7272F",
  dot: "#1D5DAA",
  Red: "#A7272F",
  E: "#4F4941",
  f: "#C84F92",
};

const PRACTICE_READS = [
  {
    label: "Fresh rack",
    title: "See the rack before the pressure starts",
    note: "A new practice rack opens instantly so you can test your first instinct.",
    tiles: [
      { t: "s", s: "bam", n: 2 },
      { t: "s", s: "bam", n: 7 },
      { t: "s", s: "crak", n: 5 },
      { t: "w", v: "E" },
    ],
  },
  {
    label: "Make your passes",
    title: "Experiment with risky or disciplined Charleston choices",
    note: "Send tiles, see what comes back, and sharpen what you protect.",
    tiles: [
      { t: "s", s: "dot", n: 1 },
      { t: "s", s: "crak", n: 4 },
      { t: "f" },
      { t: "d", v: "Red" },
    ],
  },
  {
    label: "Read the table",
    title: "Practice spotting shape, density, and likely directions",
    note: "Every round gives you another chance to read the board earlier.",
    tiles: [
      { t: "s", s: "bam", n: 3 },
      { t: "s", s: "dot", n: 6 },
      { t: "s", s: "dot", n: 9 },
      { t: "d", v: "Red" },
    ],
  },
];

// ── Countdown to midnight ─────────────────────────────────────────────────────
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

// ── Web Share / clipboard ─────────────────────────────────────────────────────
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

// ── Leaderboard row helpers support snake_case and camelCase ──────────────────
function rowScore(row) {
  return Number(row?.iqScore ?? row?.iq_score ?? row?.score ?? 0);
}

function rowName(row) {
  return safeLeaderboardName(row);
}

function rowPlayerId(row) {
  return row?.playerId || row?.player_id || row?.id || null;
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

function getPlayerArchetype({ score, avg, streak, hasPlayed }) {
  const base = score || avg || 0;
  if (!hasPlayed) return { name: "Table Scout", detail: "Your first daily read unlocks your style." };
  if (streak >= 7) return { name: "Streak Keeper", detail: "You keep showing up when the rack gets tricky." };
  if (base >= 88) return { name: "Rack Whisperer", detail: "Clean reads. Fast decisions. Strong table feel." };
  if (base >= 76) return { name: "Charleston Climber", detail: "Your decisions are trending sharper." };
  if (base >= 64) return { name: "Pattern Finder", detail: "You are spotting useful shape earlier." };
  return { name: "Table Builder", detail: "You are learning what to keep and what to release." };
}

function globalPercentile(rank, total) {
  if (!rank || !total || total < rank) return null;
  const pct = Math.max(1, Math.round((1 - (rank - 1) / total) * 100));
  return `Top ${100 - pct + 1}%`;
}


function heroTileFace(tile) {
  if (tile.t === "s") {
    return {
      main: tile.n,
      corner: tile.n,
      mark: tile.s === "bam" ? "B" : tile.s === "crak" ? "C" : "D",
      label: HERO_TILE_LABELS[tile.s],
      color: HERO_TILE_COLORS[tile.s],
      tone: tile.s,
    };
  }

  if (tile.t === "d") {
    return {
      main: "中",
      corner: "D",
      mark: "",
      label: HERO_TILE_LABELS[tile.v],
      color: HERO_TILE_COLORS[tile.v],
      tone: "dragon",
    };
  }

  if (tile.t === "w") {
    return {
      main: tile.v,
      corner: tile.v,
      mark: "",
      label: HERO_TILE_LABELS[tile.v],
      color: HERO_TILE_COLORS[tile.v],
      tone: "wind",
    };
  }

  return {
    main: "✿",
    corner: "F",
    mark: "",
    label: HERO_TILE_LABELS.f,
    color: HERO_TILE_COLORS.f,
    tone: "flower",
  };
}

function TileMotif({ tone }) {
  const marks = tone === "dot" ? 5 : tone === "crak" ? 4 : tone === "flower" ? 5 : 3;

  return (
    <span className={`rk-premium-hero-tile__motif rk-premium-hero-tile__motif--${tone}`} aria-hidden="true">
      {Array.from({ length: marks }).map((_, i) => <i key={i} />)}
    </span>
  );
}

function HeroMahjongTile({ tile }) {
  const face = heroTileFace(tile);

  return (
    <div
      className={`rk-premium-hero-tile rk-premium-hero-tile--${face.tone}`}
      style={{ "--hero-tile-color": face.color }}
      aria-label={`${face.main} ${face.label} tile`}
    >
      <span className="rk-premium-hero-tile__edge" aria-hidden="true" />
      <span className="rk-premium-hero-tile__shine" aria-hidden="true" />
      <span className="rk-premium-hero-tile__corner rk-premium-hero-tile__corner--left">{face.corner}</span>
      <span className="rk-premium-hero-tile__corner rk-premium-hero-tile__corner--right">{face.corner}</span>
      <span className="rk-premium-hero-tile__inner">
        <span className="rk-premium-hero-tile__face">
          <span className="rk-premium-hero-tile__main">{face.main}</span>
          <TileMotif tone={face.tone} />
        </span>
        <span className="rk-premium-hero-tile__label">{face.label}</span>
      </span>
    </div>
  );
}

// ── Components ────────────────────────────────────────────────────────────────
function HomeStatusBar({ profile, playedToday, globalRank, clubRank, setScreen }) {
  const isGuest = !profile?.name && !profile?.email;
  const playerName = getLeaderboardDisplayName(profile);
  const hasRankContext = playedToday && (globalRank || clubRank);
  const statusLine = isGuest
    ? "Your first table is ready."
    : playedToday
      ? "Today’s score is locked. Your streak is protected."
      : "Your daily rack is waiting. Protect your streak and climb the board.";

  return (
    <section className={`rk-home-status ${isGuest ? "rk-home-status--guest" : ""}`} aria-label="Player status">
      <div className="rk-home-status__inner">
        <div className="rk-home-status__identity">
          <p className="rk-home-status__eyebrow">Today at the table</p>
          <h1 className="rk-home-status__name">{playerName}</h1>
          {isGuest ? (
            <div className="rk-home-status__guest-copy" role="text" aria-label="Your first table is ready. Join to save your streak, or play now.">
              <span className="rk-home-status__guest-line">{statusLine}</span>
              <span className="rk-home-status__guest-line rk-home-status__guest-line--secondary">Join to save your streak, or play now.</span>
            </div>
          ) : (
            <p className="rk-home-status__guest-copy">{statusLine}</p>
          )}
        </div>

        {hasRankContext && (
          <div className="rk-home-status__chips rk-home-status__chips--rank-only">
            {globalRank && <span>Global #{globalRank}</span>}
            {clubRank && <span>Club #{clubRank}</span>}
          </div>
        )}

        {isGuest && (
          <div className="rk-home-status__actions" aria-label="Guest actions">
            <button type="button" className="rk-home-status__join" onClick={() => setScreen?.("signup")}>
              Join Rackle
            </button>
            <button type="button" className="rk-home-status__play" onClick={() => setScreen?.(playedToday ? "scorecard" : "game")}>
              {playedToday ? "See today’s score" : "Just play"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}


function FirstTimeExplainer() {
  return (
    <div className="rk-first-read-card" aria-label="How Rackle works">
      <div className="rk-first-read-card__copy">
        <p className="rk-first-read-card__eyebrow">First table read</p>
        <h3>Read the rack. Make your passes. See where you land.</h3>
        <p>
          Every player gets the same daily 13-tile rack. Your job is to make the strongest Charleston decisions and compare your read with your club.
        </p>
      </div>
      <div className="rk-first-read-card__steps" aria-label="Rackle steps">
        <span><b>1</b> Open the rack</span>
        <span><b>2</b> Pass three tiles</span>
        <span><b>3</b> Get your Rackle IQ</span>
      </div>
    </div>
  );
}

function UnplayedDailyHero({ isNewPlayer, dayNum, globalRows, dailyStats, streak, timeLeft, setScreen }) {
  const postedCount = dailyStats?.total || globalRows.length || 0;
  const socialLine = postedCount > 0
    ? `${postedCount} players have posted today.`
    : "The table is open. First scores are waiting.";

  return (
    <section className="rk-hero rk-hero--daily-open">
      <div className="rk-daily-hero-card">
        <div className="rk-daily-hero-card__glow" aria-hidden="true" />

        <div className="rk-daily-hero-card__topline">
          <span className="rk-daily-pill"><span /> Daily Rackle · #{dayNum}</span>
          <span className="rk-daily-countdown">closes in {timeLeft}</span>
        </div>

        <div className="rk-hero-table" aria-label="Today's Rackle tiles">
          <div className="rk-hero-table__rail" />
          <div className="rk-hero-table__tiles">
            {HERO_TILES.map((tile, i) => (
              <div
                key={`${tile.t}-${tile.s || tile.v || "flower"}-${tile.n || i}`}
                className="rk-hero-table__tile"
                style={{
                  "--tile-y": `${TILE_CURVE[i]?.y ?? 0}px`,
                  "--tile-r": `${TILE_CURVE[i]?.r ?? 0}deg`,
                  "--tile-delay": `${i * 65}ms`,
                }}
              >
                <HeroMahjongTile tile={tile} />
              </div>
            ))}
          </div>
        </div>

        <div className="rk-daily-hero-card__copy">
          <p className="rk-daily-hero-card__kicker">Your daily table is open.</p>
          <h2 className="rk-daily-hero-card__title">The Fresh Rack, New Charleston.</h2>
          <p className="rk-daily-hero-card__sub">See how your table reads it.</p>
          <p className="rk-daily-hero-card__support">Same rack for everyone. One score to chase.</p>
        </div>

        {isNewPlayer && <FirstTimeExplainer />}

        <div className="rk-daily-hero-card__signals">
          <span>{socialLine}</span>
          <span>{streak > 0 ? `${streak}-day streak on the line` : "Start your first streak"}</span>
        </div>

        <button
          className="rk-btn rk-btn--primary rk-btn--full rk-btn--play rk-daily-hero-card__cta"
          onClick={() => {
            try { localStorage.setItem("rackleHasSeenIntro", "true"); } catch {}
            setScreen?.("game");
          }}
        >
          <span className="rk-btn__dot" />
          Play Today’s Rackle
        </button>
        <p className="rk-daily-hero-card__button-note">Same rack for everyone. One table read to chase.</p>

        {isNewPlayer && (
          <button
            className="rk-daily-hero-card__quiet-link"
            onClick={() => setScreen?.("tutorial")}
          >
            New to Rackle? Learn the table flow →
          </button>
        )}
      </div>
    </section>
  );
}

function PlayedDailyHero({ todayResult, dayNum, iqTier, globalRank, clubRank, profile, streak, handleShare, setScreen }) {
  const scored = withIQStyle(todayResult || {});
  const frame = scoreRevealFrame(scored.iqScore || scored.totalScore || 0, {}, scored, "daily");
  const scoreTitle = iqTier?.level || frame.headline || "Table Read";
  const copyParts = String(frame.copy || "").split(/\.\s+/, 2);
  const scoreCopyLead = copyParts[0] ? `${copyParts[0]}.` : "";
  const scoreCopyTail = copyParts[1] || "";

  return (
    <section className="rk-hero rk-hero--complete">
      <div className="rk-played-hero-card rk-played-hero-card--feature">
        <div className="rk-daily-pill rk-daily-pill--inverse"><span /> Today’s Table Read · #{dayNum}</div>

        <div className="rk-played-score rk-played-score--with-tiles">
          <div className="rk-played-score__tiles rk-played-score__tiles--left" aria-hidden="true">
            {SCORE_SIDE_TILES.left.map((tile, i) => (
              <span
                key={`score-left-${tile.t}-${tile.s || tile.v || "flower"}-${tile.n || i}`}
                className="rk-played-score__tile"
                style={{
                  "--score-tile-r": `${SCORE_TILE_POSES.left[i]?.r ?? 0}deg`,
                  "--score-tile-y": `${SCORE_TILE_POSES.left[i]?.y ?? 0}px`,
                }}
              >
                <HeroMahjongTile tile={tile} />
              </span>
            ))}
          </div>

          <div className="rk-played-score__main">
            <div className="rk-played-score__num rk-played-score__num--bright">
              {todayResult.iqScore}
            </div>
            <div className="rk-played-score__label">Rackle IQ</div>
          </div>

          <div className="rk-played-score__tiles rk-played-score__tiles--right" aria-hidden="true">
            {SCORE_SIDE_TILES.right.map((tile, i) => (
              <span
                key={`score-right-${tile.t}-${tile.s || tile.v || "flower"}-${tile.n || i}`}
                className="rk-played-score__tile"
                style={{
                  "--score-tile-r": `${SCORE_TILE_POSES.right[i]?.r ?? 0}deg`,
                  "--score-tile-y": `${SCORE_TILE_POSES.right[i]?.y ?? 0}px`,
                }}
              >
                <HeroMahjongTile tile={tile} />
              </span>
            ))}
          </div>
        </div>

        <div className="rk-played-hero-card__headline-wrap">
          <h3 className="rk-played-hero-card__headline">{scoreTitle}</h3>
          <p className="rk-played-hero-card__copy">
            <span className="rk-played-hero-card__copy-line">{scoreCopyLead}</span>
            {scoreCopyTail && <span className="rk-played-hero-card__copy-line">{scoreCopyTail}</span>}
          </p>
        </div>

        <div className="rk-played-hero-card__boards">
          {globalRank && (
            <button className="rk-played-hero-card__board" onClick={() => setScreen?.("leaderboard")}>
              <span className="rk-played-hero-card__board-label">Global room</span>
              <strong>#{globalRank}</strong>
              <small>View global</small>
            </button>
          )}
          {clubRank && (
            <button className="rk-played-hero-card__board rk-played-hero-card__board--club" onClick={() => setScreen?.("clubRoom")}>
              <span className="rk-played-hero-card__board-label">{profile?.clubName || "Club room"}</span>
              <strong>#{clubRank}</strong>
              <small>View club</small>
            </button>
          )}
        </div>

        <div className={`rk-played-hero-card__ranks ${streak > 0 ? "" : "rk-played-hero-card__ranks--solo"}`}>
          {streak > 0 && (
            <span className="rk-played-streak-badge">
              <i aria-hidden="true">{getHomepageStreakEmoji(streak)}</i>
              <b>{streak}-day streak</b>
            </span>
          )}
          <button
            type="button"
            className="rk-played-hero-card__scorecard-btn"
            onClick={() => setScreen?.("scorecard")}
          >
            <b>View full scorecard</b>
            <i aria-hidden="true">→</i>
          </button>
        </div>

        <div className="rk-played-hero-card__share-shell">
          <div className="rk-played-share-card rk-played-share-card--fused">
            <div className="rk-played-share-card__icon">✦</div>
            <div className="rk-played-share-card__copy">
              <strong>Share Your Score</strong>
              <span>Drop it in the group chat and pull your table into the chase.</span>
            </div>
            <button className="rk-played-share-card__btn" onClick={handleShare}>Share</button>
          </div>
        </div>
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
  const boardPill = leaderboardError
    ? "Quiet"
    : activeCount > 0
      ? activeLabel
      : "Quiet";

  const currentInTopRows = topRows.some((row) => row?.isYou || rowPlayerId(row) === getPlayerId());
  const showCurrentRow = completedToday && currentScore && activeRank && !currentInTopRows;
  const currentDescriptor = currentScore ? getIQTier(currentScore)?.level || "Table read" : "Table read";

  const statusCopy = completedToday
    ? activeRank
      ? boardRoom === "club"
        ? `You’re sitting ${ordinal(activeRank)} in your club today.`
        : `You’re sitting ${ordinal(activeRank)} globally today.`
      : "Your score is posted."
    : "The room is quiet.";

  const scoreLine = completedToday && currentScore
    ? `${currentScore} Rackle IQ · ${currentDescriptor}`
    : "Play today’s Rackle to take your seat.";

  const emptyTitle = boardRoom === "club" ? "Your club board is quiet." : "No scores yet today.";
  const emptyBody = boardRoom === "club" ? "Play today’s rack or invite your table." : "Be the first to wake the room.";
  const emptyCta = "Play today’s Rackle";

  const handleSecondary = () => {
    if (completedToday && handleShare) {
      handleShare();
      return;
    }
    if (!hasClub) {
      trackRackleEvent("browse_clubs_clicked", { source: "homepage_table_board", hasClub: false, clubState: "none" });
      setScreen?.("clubDirectory");
      return;
    }
    setScreen?.("game");
  };

  return (
    <section className="rk-table-board" aria-label="Today’s table board">
      <div className="rk-table-board__inner">
        <div className="rk-table-board__card">
          <div className="rk-table-board__card-intro">
            <p className="rk-table-board__eyebrow">Daily table</p>
            <h2 className="rk-section-title rk-table-board__title">Today’s table board</h2>
            <p className="rk-table-board__subcopy">See how your daily read stacks up.</p>
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
              <button
                type="button"
                className={activeRoom === "global" ? "is-active" : ""}
                onClick={() => setActiveRoom("global")}
              >
                Global
              </button>
              <button
                type="button"
                className={activeRoom === "club" ? "is-active" : ""}
                onClick={() => setActiveRoom("club")}
              >
                Club
              </button>
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
              <button type="button" className="rk-btn rk-btn--primary" onClick={() => setScreen?.("game")}>{emptyCta}</button>
            </div>
          )}

          {showCurrentRow && (
            <div className="rk-table-board__current">
              <span>Your table read</span>
              <strong>#{activeRank} · {currentScore} Rackle IQ</strong>
            </div>
          )}

          {!hasClub && (
            <div className="rk-table-board__club-nudge">
              <p>Want to compare with your Mahjong group?</p>
              <button type="button" onClick={() => { trackRackleEvent("browse_clubs_clicked", { source: "homepage_table_board", hasClub: false, clubState: "none" }); setScreen?.("clubDirectory"); }}>Browse clubs</button>
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
              onClick={handleSecondary}
            >
              {completedToday ? "Share your score" : !hasClub ? "Browse clubs" : "Play today’s Rackle"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
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

function PlayerIdentity({ archetype, avg, best, streak, playedToday, todayResult, clubAverage }) {
  const aboveClub = playedToday && todayResult && clubAverage ? todayResult.iqScore >= clubAverage : false;
  const identityContext = playedToday
    ? "Your daily decisions are shaping a real table profile. Keep showing up and the pattern gets sharper."
    : "Play today’s Rackle to unlock your first read, build your trend line, and reveal how you play the rack.";

  const spotlight = playedToday
    ? aboveClub
      ? "You finished above your club average today. Protect that standard tomorrow."
      : clubAverage
        ? `Your club average is ${clubAverage}. One stronger read puts you right in that mix.`
        : "Your table identity updates with every daily read you post."
    : streak > 0
      ? `${streak}-day streak in play. One daily read keeps the rhythm going.`
      : "Your first daily read unlocks your player identity card.";

  const factCards = [
    {
      label: "Today",
      value: playedToday && todayResult ? todayResult.iqScore : "—",
      note: playedToday ? "today's read" : "not posted yet",
    },
    {
      label: "Average IQ",
      value: avg ?? "—",
      note: avg ? "across your reads" : "build this over time",
    },
    {
      label: "Best",
      value: best ?? "—",
      note: best ? "personal high" : "best score pending",
    },
    {
      label: "Streak",
      value: streak > 0 ? `${streak}` : "—",
      note: streak > 0 ? "days live" : "start one today",
    },
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
            <p className="rk-player-identity__context">{identityContext}</p>
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

function ScorecardPreview({ playedToday, todayResult, globalRank, clubRank, archetype, setScreen }) {
  return (
    <section className="rk-score-preview">
      <div className={`rk-score-preview__card ${playedToday ? "is-unlocked" : "is-locked"}`}>
        <div className="rk-score-preview__shine" aria-hidden="true" />
        <div className="rk-score-preview__header">
          <p className="rk-room-pill rk-room-pill--score"><span /> Scorecard preview</p>
          <span>{playedToday ? "Unlocked" : "Locked until you play"}</span>
        </div>

        <div className="rk-score-preview__artifact">
          <div className="rk-score-preview__score">{playedToday ? todayResult?.iqScore : "?"}</div>
          <div>
            <p>Rackle IQ</p>
            <strong>{playedToday ? archetype.name : "Reveal your table read"}</strong>
            <small>{playedToday ? "Ready to share with your club." : "Your score, rank, and archetype unlock after the daily."}</small>
          </div>
        </div>

        <div className="rk-score-preview__meta">
          <span>{globalRank ? `Global #${globalRank}` : "Global rank hidden"}</span>
          <span>{clubRank ? `Club #${clubRank}` : "Club rank hidden"}</span>
          <span>{playedToday ? "Share-ready" : "Share card locked"}</span>
        </div>

        <button
          className="rk-score-preview__button"
          onClick={() => setScreen?.(playedToday ? "scorecard" : "game")}
        >
          {playedToday ? "Open full scorecard →" : "Play to reveal →"}
        </button>
      </div>
    </section>
  );
}

function ClubExperience({ clubCode, profile, clubRows, shareCount, handleClubInvite, setScreen }) {
  const clubName = profile?.clubName || profile?.club_name || "Your Club";
  const previewRows = (clubRows || []).slice(0, 3);
  const initials = (name) => String(name || "R")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join("")
    .toUpperCase();

  return (
    <section className="rk-club-experience rk-club-experience--refresh">
      <div className="rk-club-experience__shell">
        <div className="rk-club-experience__head">
          <p className="rk-room-pill rk-room-pill--club"><span /> Club Room</p>
          <h2 className="rk-section-title">{clubCode ? clubName : "Bring your table into Rackle"}</h2>
          <p className="rk-club-experience__subline">
            {clubCode
              ? "The daily rack gets better when your own table is in the room."
              : "Bring your Mahjong group to the daily table. Invite your players, track the board, and build your own daily chase."}
          </p>
        </div>

        {clubCode ? (
          <>
            <div className="rk-club-experience__social-hub">
              <div className="rk-club-experience__avatars" aria-hidden="true">
                {previewRows.length ? previewRows.map((row, i) => (
                  <span key={`${rowPlayerId(row) || rowName(row)}-${i}`}>{initials(rowName(row))}</span>
                )) : ["A", "R", "K"].map((i) => <span key={i}>{i}</span>)}
              </div>

              <div className="rk-club-experience__social-copy">
                <span className="rk-club-experience__hero-label">Table nudge</span>
                <strong>Get your table into today’s rack.</strong>
                <p>Send the same Charleston decision to your group chat and see who reads it cleanest.</p>
              </div>
            </div>

            <div className="rk-club-experience__mission-grid">
              <div className="rk-club-experience__mission-card">
                <span>Today’s table goal</span>
                <strong>{previewRows.length >= 3 ? 'Room is moving' : `${Math.max(0, 3 - previewRows.length)} more names`}</strong>
                <p>{previewRows.length >= 3 ? 'Your club has a real chase going.' : 'Three players makes the board feel alive.'}</p>
              </div>

              <div className="rk-club-experience__mission-card">
                <span>Club code</span>
                <strong>{clubCode}</strong>
                <p>Share this with your regular table.</p>
              </div>
            </div>

            <div className="rk-club-experience__prompt-card">
              <span>Group chat prompt</span>
              <p>Who made the sharper first Charleston read today?</p>
            </div>

            <div className="rk-club-experience__footer-actions">
              <div className="rk-club-experience__footer-copy">
                <strong>{shareCount > 0 ? `${shareCount} invite${shareCount === 1 ? '' : 's'} sent today` : 'Want more names on the board?'}</strong>
                <span>{shareCount > 0 ? 'Keep the table moving.' : 'Invite your table and make today’s rack a club conversation.'}</span>
              </div>
              <div className="rk-club-experience__buttons">
                <button className="rk-btn rk-btn--secondary rk-club-experience__invite" onClick={handleClubInvite}>Invite your table</button>
                <button className="rk-btn rk-btn--ghost rk-practice-card__button rk-club-experience__open" onClick={() => setScreen?.("clubRoom")}>Open club board</button>
              </div>
            </div>
          </>
        ) : (
          <div className="rk-club-experience__join-card">
            <div className="rk-club-experience__join-copy">
              <strong>Make it social.</strong>
              <p>Set up a founding club room so your own table can play the same rack, compare reads, and chase the board together.</p>
              <div className="rk-club-experience__join-points">
                <span>Private club board</span>
                <span>Invite your table</span>
                <span>Daily rivalries</span>
              </div>
            </div>
            <div className="rk-club-experience__buttons rk-club-experience__buttons--stack">
              <button className="rk-btn rk-btn--ghost rk-practice-card__button rk-club-experience__open" onClick={() => { trackRackleEvent("browse_clubs_clicked", { source: "homepage_club_section", hasClub: false, clubState: "none" }); setScreen?.("clubDirectory"); }}>Find your club</button>
              <button className="rk-btn rk-btn--secondary rk-club-experience__invite" onClick={() => setScreen?.("foundingClubs")}>Start a founding club</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function GlobalCompetition({ globalRows, globalRank, dailyStats, playedToday, setScreen }) {
  const total = dailyStats?.total || globalRows.length || 0;
  const percentile = playedToday ? globalPercentile(globalRank, total) : null;

  return (
    <section className="rk-global-competition">
      <div className="rk-global-competition__head">
        <p className="rk-room-pill rk-room-pill--global"><span /> Global room</p>
        <h2 className="rk-section-title">Beyond your club</h2>
        <p className="rk-global-competition__sub">
          {playedToday && percentile
            ? `${percentile} today. Keep an eye on late scores.`
            : "Every club is playing the same rack. The board changes all day."}
        </p>
      </div>

      <div className="rk-global-competition__podium">
        {globalRows.slice(0, 3).map((row, i) => (
          <div key={`${rowPlayerId(row) || i}-${i}`}>
            <span>#{i + 1}</span>
            <strong>{rowName(row)}</strong>
            <em>{rowScore(row)}</em>
          </div>
        ))}
        {!globalRows.length && <p>No global scores yet today.</p>}
      </div>

      <button onClick={() => setScreen?.("leaderboard")}>See global leaderboard →</button>
    </section>
  );
}

function PracticeRoomSection({ setScreen }) {
  const [activeRead, setActiveRead] = useState(0);

  const current = PRACTICE_READS[activeRead];
  const steps = ["Fresh rack", "Make your passes", "Read the table"];

  return (
    <section className="rk-practice-card rk-practice-card--v2">
      <div className="rk-practice-card__inner">
        <div className="rk-practice-card__copy">
          <p className="rk-room-pill rk-room-pill--practice"><span /> Practice Room</p>
          <h2 className="rk-practice-card__title">Build your read before the real board moves</h2>
          <p className="rk-practice-card__sub">
            Open a fresh rack, make your passes, and read the table without touching today’s live score.
          </p>

          <div className="rk-practice-card__steps" aria-label="Practice flow">
            {steps.map((step, i) => (
              <button
                key={step}
                type="button"
                className={`rk-practice-card__step ${i === activeRead ? "is-active" : ""}`}
                onClick={() => setActiveRead(i)}
                aria-pressed={i === activeRead}
              >
                {step}
              </button>
            ))}
          </div>

          <div className="rk-practice-card__feature">
            <div className="rk-practice-card__feature-copy">
              <span className="rk-practice-card__feature-kicker">{current.label}</span>
              <strong className="rk-practice-card__feature-title">{current.title}</strong>
              <p className="rk-practice-card__feature-note">{current.note}</p>
            </div>
            <div className="rk-practice-card__mini-table" aria-label="Rotating practice preview">
              <div className="rk-practice-card__mini-rail" />
              <div className="rk-practice-card__mini-tiles">
                {current.tiles.map((tile, i) => (
                  <div
                    key={`${current.label}-${i}-${tile.t}-${tile.s || tile.v || tile.n}`}
                    className="rk-practice-card__mini-tile"
                    style={{ '--tile-y': `${(i % 2) * 6}px`, '--tile-r': `${[-5, -2, 2, 5][i] || 0}deg` }}
                  >
                    <HeroMahjongTile tile={tile} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rk-practice-card__actions">
          <button className="rk-btn rk-btn--ghost rk-practice-card__button" onClick={() => setScreen?.('practice')}>Open Practice Room →</button>
          <p className="rk-practice-card__meta">Unlimited reps. No score pressure. Just sharper decisions.</p>
        </div>
      </div>
    </section>
  );
}

function ReturnLoop({ playedToday, hasntPlayed, dayNum, timeLeft, streak }) {
  const supportCopy = playedToday
    ? `Rackle #${dayNum + 1} drops at midnight.`
    : hasntPlayed && streak > 0
      ? `${streak}-day streak still in play.`
      : "One new rack lands at midnight.";

  return (
    <section className="rk-return-loop rk-return-loop--simple">
      <div className="rk-return-loop__glow" aria-hidden="true" />
      <p className="rk-room-pill rk-room-pill--ritual"><span /> Next Ritual</p>
      <p className="rk-return-loop__eyebrow">{playedToday ? "Fresh rack at midnight" : "Today’s rack closes at midnight"}</p>
      <p className="rk-return-loop__countdown">{timeLeft}</p>
      <p className="rk-return-loop__support">{supportCopy}</p>
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
          <p className="rk-club-directory-preview__sub">
            Discover clubs playing the same daily rack, compare table reads, and bring your Mahjong community into the ritual.
          </p>
        </div>

        <div className="rk-club-directory-preview__stats" aria-label="Rackle club network stats">
          <span>{clubCountLabel}</span>
          <span>Club directory live</span>
          <span>New clubs joining weekly</span>
        </div>

        <div className="rk-club-directory-preview__rail" aria-label="Club preview cards">
          {clubCards.length ? clubCards.map((club) => (
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
            onClick={() => { trackRackleEvent("browse_clubs_clicked", { source: "homepage_club_directory_preview", hasClub: Boolean(getClubCode()), clubState: getClubState({ hasClub: Boolean(getClubCode()) }) }); setScreen?.("clubDirectory"); }}
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

// ── Main component ────────────────────────────────────────────────────────────
export default function Home({ setScreen }) {
  const profile = getProfile();
  const clubCode = getClubCode();
  const streak = getStreak();
  const dayNum = getDayNum();
  const seed = getDailySeed();
  const history = getHistory();
  const doneToday = isDailyResultForToday(getTodayDailyResult());
  const todayResult = getTodayDailyResult();
  const hasPlayed = history.length > 0;

  const [globalRows, setGlobalRows] = useState([]);
  const [clubRows, setClubRows] = useState([]);
  const [dailyStats, setDailyStats] = useState(null);
  const [shareCount, setShareCount] = useState(0);
  const [leaderboardError, setLeaderboardError] = useState(false);

  const timeLeft = useCountdown();
  const hasCompletedFirstDaily = (() => {
    try { return localStorage.getItem("rackleHasCompletedFirstDaily") === "true"; } catch { return false; }
  })();
  const isNewPlayer = !hasCompletedFirstDaily && history.length === 0 && !doneToday;
  const hasntPlayed = !doneToday;
  const playedToday = doneToday && todayResult;

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
      const [stats, global, club, shares] = await Promise.all([
        fetchDailyStats(seed),
        fetchGlobalLeaderboard(seed),
        clubCode ? fetchClubLeaderboard(clubCode, seed) : Promise.resolve([]),
        clubCode ? fetchClubShareCount(clubCode, seed) : Promise.resolve(0),
      ]);

      setDailyStats(stats);
      setGlobalRows(global || []);
      setClubRows(club || []);
      setShareCount(shares || 0);
      setLeaderboardError(false);
    } catch (error) {
      if (import.meta.env?.DEV) console.warn("Rackle leaderboard preview failed", error);
      setDailyStats({ total: 0, topScore: null });
      setGlobalRows([]);
      setClubRows([]);
      setShareCount(0);
      setLeaderboardError(true);
    }
  }, [seed, clubCode]);

  useEffect(() => {
    let alive = true;

    async function load() {
      await loadLeaderboardPreview();
    }

    if (alive) load();
    return () => { alive = false; };
  }, [loadLeaderboardPreview]);

  const playerId = getPlayerId();
  const playerName = getLeaderboardDisplayName(profile);
  const currentScore = todayResult?.iqScore ?? todayResult?.totalScore ?? null;
  const currentTime = todayResult?.time ?? todayResult?.timeSecs ?? todayResult?.time_secs ?? null;

  // Everyone belongs on the Global Chase by default. Club rows only receive
  // the current score when a real club affiliation exists.
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
  const iqTier = playedToday ? getIQTier(currentScore) : null;
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

  const handleClubInvite = useCallback(async () => {
    if (!clubCode || !profile?.clubName) return;

    const text = buildClubInviteText({
      clubName: profile.clubName,
      clubUrl: `https://playrackle.com/clubs/${clubCode}`,
    });

    const method = await share(text);
    if (method === "copy") trackRackleEvent("club_invite_copy_clicked", { source: "homepage", copyType: "club_invite" });
  }, [clubCode, profile]);

  return (
    <div className="rk-home rk-home--v2">
      {playedToday ? (
        <PlayedDailyHero
          todayResult={todayResult}
          dayNum={dayNum}
          iqTier={iqTier}
          globalRank={globalRank}
          clubRank={clubRank}
          profile={profile}
          streak={streak}
          handleShare={handleShare}
          setScreen={setScreen}
        />
      ) : (
        <UnplayedDailyHero
          isNewPlayer={isNewPlayer}
          dayNum={dayNum}
          globalRows={globalRowsWithMe}
          dailyStats={dailyStatsWithMe}
          streak={streak}
          timeLeft={timeLeft}
          setScreen={setScreen}
        />
      )}

      <SocialEnergy
        globalRows={globalRowsWithMe}
        clubRows={clubRowsWithMe}
        dailyStats={dailyStatsWithMe}
        clubName={profile?.clubName || profile?.club_name || null}
        hasntPlayed={hasntPlayed}
        setScreen={setScreen}
        profile={profile}
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
