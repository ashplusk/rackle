// ─── Rackle v2 · Daily Scorecard ─────────────────────────────────────────────
// Simplified scorecard: score, hands, coaching, share, and practice.

import { useEffect, useMemo, useState } from "react";
import PremiumMahjongTile from "../shared/PremiumMahjongTile.jsx";
import RackleState from "../shared/RackleState.jsx";
import {
  getIQTier,
  withIQStyle,
  scoreRevealFrame,
  buildShareText,
} from "../../engine/scoring.js";
import {
  getDayNum,
  getProfile,
  getClubCode,
  getStreak,
  getPlayerId,
  getLeaderboardDisplayName,
  hasValidSession,
} from "../../engine/storage.js";
import {
  fetchGlobalLeaderboard,
  fetchClubLeaderboard,
  rankOfCurrent,
  mergeCurrentScore,
} from "../../engine/leaderboard.js";
import { trackRackleEvent, getScoreBand, getClubState } from "../../engine/analytics.js";
import "../../design/scorecard-viewport-fix.css";
import "../../design/scorecard-simple-v2.css";

const SECTION_LABELS = {
  "2026": "2026",
  consec: "Consecutive Run",
  like: "Any Like Numbers",
  evens: "2-4-6-8",
  odds: "1-3-5-7-9",
  threeSixNine: "3-6-9",
  quints: "Quints",
  wd: "Winds & Dragons",
  suited: "Single Suit",
  pairs: "Singles & Pairs",
};

function safeArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === "") return [];
  return [value];
}

function safeText(value, fallback = "") {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function sectionLabel(idOrName) {
  return SECTION_LABELS[idOrName] || idOrName || "Open read";
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function shareText(text, title = "Rackle score") {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: "https://playrackle.com" });
      return "native";
    } catch (error) {
      if (error?.name === "AbortError") return "cancelled";
    }
  }

  const copied = await copyText(text);
  return copied ? "copy" : "copy-failed";
}

function TileRack({ tiles, size = "sm" }) {
  return (
    <div className="rk-sc-final-rack rk-sc-final-rack--premium">
      {safeArray(tiles).map((tile, index) => (
        <PremiumMahjongTile key={`${index}-${tile?.t || tile?.id || "tile"}`} tile={tile} size={size} />
      ))}
    </div>
  );
}

function buildCoachLine({ topPathLabel, chosenLabel, finalRack, startingRack, fallback }) {
  if (topPathLabel && chosenLabel && topPathLabel !== chosenLabel) {
    return `You kept the hand alive, but it looked a little stronger leaning toward ${topPathLabel} than ${chosenLabel}.`;
  }

  if (topPathLabel) {
    return `Your read had a clear lane toward ${topPathLabel}. The next step is tightening the tiles that do not support that direction.`;
  }

  if (finalRack.length || startingRack.length) {
    return "Your hand stayed flexible. The next step is choosing one cleaner lane earlier so the rack has less noise after the Charleston.";
  }

  return fallback || "Your score reflects how playable the hand looked after your Charleston decisions.";
}

export default function DailyScorecard({ result, mode = "daily", setScreen }) {
  const profile = getProfile();
  const leaderboardPlayerName = getLeaderboardDisplayName(profile);
  const dayNum = getDayNum();
  const streak = getStreak();
  const clubCode = getClubCode();
  const isGuestPlayer = !hasValidSession();

  const iq = useMemo(() => withIQStyle(result || {}), [result]);
  const score = Number(iq?.totalScore || iq?.iqScore || 0);
  const tier = getIQTier(score);
  const frame = scoreRevealFrame(score, {}, iq, mode);

  const chosen = iq?.chosenSection;
  const chosenLabel = sectionLabel(chosen);
  const finalRack = safeArray(iq?.finalRack || result?.finalRack || result?.rack || result?.tiles);
  const startingRack = safeArray(iq?.startingRack || result?.startingRack);
  const bestPaths = safeArray(iq?.bestPaths);
  const topPath = bestPaths[0] || null;
  const topPathLabel = sectionLabel(topPath?.section || topPath?.sectionId);
  const whatHeldYouBack = safeArray(iq?.whatHeldYouBack);
  const expertTableRead = safeText(iq?.expertTableRead || iq?.tableReadSummary);
  const coachGuidance = safeText(iq?.coachGuidance || iq?.styleNote);

  const [rackView, setRackView] = useState("final");
  const [globalRank, setGlobalRank] = useState(null);
  const [clubRank, setClubRank] = useState(null);
  const [shareStatus, setShareStatus] = useState("");
  const [fallbackShareText, setFallbackShareText] = useState("");

  const activeRack = rackView === "starting" && startingRack.length ? startingRack : finalRack;
  const activeRackLabel = rackView === "starting" ? "Starting hand" : "Final hand";

  const mainTakeaway = whatHeldYouBack[0]
    || coachGuidance
    || expertTableRead
    || frame.copy
    || "Your score reflects how playable the final rack became after the Charleston.";

  const coachingLine = buildCoachLine({
    topPathLabel,
    chosenLabel,
    finalRack,
    startingRack,
    fallback: mainTakeaway,
  });

  const nextRepLine = score >= 80
    ? "Run another practice rack and see if you can keep the same discipline without overcommitting too early."
    : score >= 65
      ? "In practice, try making your next pass around one clear lane instead of keeping every possible option alive."
      : "Use Open Play to practice trimming the rack sooner. The goal is fewer maybe-tiles and a cleaner direction.";

  useEffect(() => {
    if (mode !== "daily" || !result) return;

    const playerId = getPlayerId();
    const timeSecs = result?.timeSecs || result?.time_secs || result?.time || null;

    fetchGlobalLeaderboard()
      .then((rows) => {
        const rowsWithMe = mergeCurrentScore(rows || [], score, timeSecs, playerId, leaderboardPlayerName, { clubCode: "__global__" });
        setGlobalRank(rankOfCurrent(rowsWithMe, score, playerId));
      })
      .catch(() => {});

    if (clubCode) {
      fetchClubLeaderboard(clubCode)
        .then((rows) => {
          const rowsWithMe = mergeCurrentScore(rows || [], score, timeSecs, playerId, leaderboardPlayerName, { clubCode });
          setClubRank(rankOfCurrent(rowsWithMe, score, playerId));
        })
        .catch(() => {});
    }
  }, [mode, result, score, clubCode, leaderboardPlayerName]);

  useEffect(() => {
    if (!result) return;
    trackRackleEvent("scorecard_viewed", {
      mode,
      source: "scorecard",
      scoreBand: getScoreBand(score),
      hasClub: Boolean(clubCode),
      isGuest: isGuestPlayer,
      clubState: getClubState({ hasClub: Boolean(clubCode) }),
    });
  }, [result, mode, score, clubCode, isGuestPlayer]);

  if (!result) {
    return (
      <div className="rk-sc-page">
        <RackleState
          eyebrow="Table read"
          title="Scorecard not found."
          body="That table read may have expired or failed to save."
          primaryLabel="Back home"
          onPrimary={() => setScreen?.("home")}
          secondaryLabel="Send feedback"
          onSecondary={() => setScreen?.("feedback")}
          className="rk-sc-missing-state"
        />
      </div>
    );
  }

  const sharePayload = buildShareText({
    score,
    dayNum,
    globalRank,
    clubRank,
    clubName: mode === "daily" ? (profile?.clubName || profile?.club_name || null) : null,
    streak,
    url: "https://playrackle.com",
    mode,
    archetype: iq?.archetype || iq?.styleName || tier.level,
    headline: frame?.headline,
  });

  async function handleShare(forceCopy = false) {
    setFallbackShareText(sharePayload);

    const basePayload = {
      source: "scorecard",
      mode,
      scoreBand: getScoreBand(score),
      hasClub: Boolean(clubCode),
      isGuest: isGuestPlayer,
      hasGlobalRank: Boolean(globalRank),
      hasClubRank: Boolean(clubRank),
      clubState: getClubState({ hasClub: Boolean(clubCode) }),
    };

    const method = forceCopy ? (await copyText(sharePayload) ? "copy" : "copy-failed") : await shareText(sharePayload, "Today’s Rackle score");

    if (method === "cancelled") return;
    if (method === "copy-failed") {
      setShareStatus("copy-failed");
      return;
    }

    setShareStatus(method === "native" ? "shared" : "copied");
    trackRackleEvent("score_shared", { ...basePayload, shareMethod: method });
    setTimeout(() => setShareStatus(""), 2600);
  }

  return (
    <div className="rk-sc-page rk-sc-page--simple-v2">
      <section className="rk-simple-scorecard" aria-label={`Rackle score ${score}`}>
        <div className="rk-simple-scorecard__pill">
          {mode === "practice" ? "Practice read" : `Rackle #${dayNum}`}
        </div>

        <div className="rk-simple-scorecard__score-wrap">
          <span className="rk-simple-scorecard__score">{score}</span>
          <span className="rk-simple-scorecard__score-label">Rackle IQ</span>
        </div>

        <span className="rk-simple-scorecard__style">{iq?.styleName || tier.level || "Table Reader"}</span>

        <div className="rk-simple-scorecard__copy">
          <h1>{frame.headline}</h1>
          <p>{frame.copy}</p>
        </div>

        <div className="rk-simple-scorecard__meta">
          {globalRank && <span>Global #{globalRank}</span>}
          {clubRank && <span>Club #{clubRank}</span>}
          {streak > 0 && mode === "daily" && <span>{streak}-day streak</span>}
        </div>
      </section>

      {(finalRack.length > 0 || startingRack.length > 0) && (
        <section className="rk-simple-panel">
          <div className="rk-simple-panel__head">
            <div>
              <h2>Your hand</h2>
              <p>Start with where you ended. Toggle back to see the hand you began with.</p>
            </div>

            {startingRack.length > 0 && finalRack.length > 0 && (
              <div className="rk-simple-hand-toggle" role="group" aria-label="Toggle starting or final hand">
                <button
                  type="button"
                  className={rackView === "final" ? "is-active" : ""}
                  onClick={() => setRackView("final")}
                >
                  Final
                </button>
                <button
                  type="button"
                  className={rackView === "starting" ? "is-active" : ""}
                  onClick={() => setRackView("starting")}
                >
                  Start
                </button>
              </div>
            )}
          </div>

          <div className="rk-simple-hand-card">
            <span className="rk-simple-hand-card__label">{activeRackLabel}</span>
            <TileRack tiles={activeRack} />
            {topPathLabel && <p className="rk-simple-panel__copy">Best lane: {topPathLabel}</p>}
          </div>
        </section>
      )}

      <section className="rk-simple-panel">
        <div className="rk-simple-panel__head">
          <div>
            <h2>Coach note</h2>
            <p>A simple read on what happened and what to try next.</p>
          </div>
        </div>

        <div className="rk-simple-coach-list">
          <div className="rk-simple-coach-item">
            <span>What happened</span>
            <p>{coachingLine}</p>
          </div>

          <div className="rk-simple-coach-item">
            <span>What to practice</span>
            <p>{nextRepLine}</p>
          </div>

          {mainTakeaway && mainTakeaway !== coachingLine && (
            <div className="rk-simple-coach-item">
              <span>Table read</span>
              <p>{mainTakeaway}</p>
            </div>
          )}
        </div>
      </section>

      <section className="rk-simple-panel rk-simple-share">
        <div>
          <h2>Share your table read</h2>
          <p className="rk-simple-panel__copy">Post your score and bring your Mahjong group into today’s board.</p>
        </div>

        <div className="rk-simple-share__actions">
          <button className="rk-btn rk-btn--primary rk-btn--full" onClick={() => handleShare(false)}>
            Share score
          </button>
          <button className="rk-btn rk-btn--secondary rk-btn--full" onClick={() => handleShare(true)}>
            Copy result
          </button>
        </div>

        {shareStatus === "shared" && <p className="rk-simple-share__status">Shared.</p>}
        {shareStatus === "copied" && <p className="rk-simple-share__status">Copied.</p>}
        {shareStatus === "copy-failed" && (
          <div className="rk-simple-share__fallback">
            <p className="rk-simple-panel__copy">Copy this result:</p>
            <textarea readOnly value={fallbackShareText} />
          </div>
        )}
      </section>

      <div className="rk-simple-footer-actions">
        <button className="rk-btn rk-btn--primary rk-btn--full" onClick={() => setScreen?.("game", { mode: "practice" })}>
          Practice another rack
        </button>
        <button className="rk-btn rk-btn--ghost rk-btn--full" onClick={() => setScreen?.("home")}>
          Back to home
        </button>
      </div>
    </div>
  );
}
