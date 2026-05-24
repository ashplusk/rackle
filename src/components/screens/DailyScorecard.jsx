// ─── Rackle v2 · Daily Scorecard ─────────────────────────────────────────────
// Staged reveal: IQ count-up → archetype → headline → breakdown → insights → share
// Works for both "daily" and "practice" modes.

import { useState, useEffect, useRef } from "react";
import PremiumMahjongTile from "../shared/PremiumMahjongTile.jsx";
import RackleState from "../shared/RackleState.jsx";
import {
  getIQTier, withIQStyle, scoreRevealFrame, buildShareText,
} from "../../engine/scoring.js";
import {
  getDayNum, getProfile, getClubCode, getStreak, getPlayerId, getLeaderboardDisplayName, hasValidSession,
} from "../../engine/storage.js";
import {
  fetchGlobalLeaderboard, fetchClubLeaderboard, rankOfCurrent, mergeCurrentScore,
} from "../../engine/leaderboard.js";
import { trackRackleEvent, getScoreBand, getClubState } from "../../engine/analytics.js";

// ── Reveal phases ────────────────────────────────────────────────────────────
const PHASE = {
  COUNTING:  0,  // IQ counts up
  ARCHETYPE: 1,  // archetype badge appears
  HEADLINE:  2,  // headline + copy appear
  BREAKDOWN: 3,  // score bars animate in
  INSIGHTS:  4,  // pass insights + sections
  FULL:      5,  // everything visible + share CTA
};

// ── Score bar metadata ───────────────────────────────────────────────────────
const BAR_META = [
  { key: "directionScore",    label: "Direction",     max: 40, desc: "How focused was your rack after all 3 passes?" },
  { key: "tileStrengthScore", label: "Tile Strength", max: 25, desc: "Quality and density of the tiles you kept." },
  { key: "passQualityScore",  label: "Pass Quality",  max: 25, desc: "Did you pass the right tiles at the right time?" },
  { key: "timingScore",       label: "Timing",        max: 10, desc: "How decisively did you move through the Charleston?" },
];

// ── Section labels ────────────────────────────────────────────────────────────
const SECTION_LABELS = {
  "2026": "2026",
  consec: "Consecutive Run",
  like:   "Any Like Numbers",
  evens:  "2-4-6-8",
  odds:   "1-3-5-7-9",
  threeSixNine: "3-6-9",
  quints: "Quints",
  wd:     "Winds & Dragons",
  suited: "Single Suit",
  pairs:  "Singles & Pairs",
};

// ── Count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1400) {
  const [display, setDisplay] = useState(0);
  const frame = useRef(null);

  useEffect(() => {
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(eased * target));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    }
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return display;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DailyScorecard({ result, mode = "daily", setScreen }) {
  const profile  = getProfile();
  const leaderboardPlayerName = getLeaderboardDisplayName(profile);
  const dayNum   = getDayNum();
  const streak   = getStreak();
  const clubCode = getClubCode();

  // Enrich result with style
  const iq       = withIQStyle(result || {});
  const score    = Number(iq?.totalScore || iq?.iqScore || 0);
  const tier     = getIQTier(score);
  const frame    = scoreRevealFrame(score, {}, iq, mode);
  const passLog  = iq?.passLog || [];
  const allSec   = iq?.allSections || [];
  const chosen   = iq?.chosenSection;
  const finalRack = iq?.finalRack || [];
  const startingRack = iq?.startingRack || result?.startingRack || [];
  const playerNotes = iq?.playerNotes || "";
  const bestPaths = iq?.bestPaths || [];
  const whatHeldYouBack = iq?.whatHeldYouBack || [];
  const coachGuidance = iq?.coachGuidance || iq?.styleNote || "";
  const passAnalysis = iq?.passAnalysis || [];
  const confidence = iq?.confidenceRating || iq?.confidence?.rating || null;
  const confidenceNote = iq?.confidence?.explanation || "";
  const expertTableRead = iq?.expertTableRead || iq?.tableReadSummary || "";
  const luckSplitNote = iq?.luckSplitNote || "";
  const nearMisses = iq?.nearMisses || [];
  const alternatives = iq?.defensibleAlternatives || [];
  const exposureRealism = iq?.exposureRealism || null;
  const [rackView, setRackView] = useState("final");
  const [showFirstScoreHelp, setShowFirstScoreHelp] = useState(() => {
    if (mode !== "daily") return false;
    try { return localStorage.getItem("rackleHasSeenScoreExplainer") !== "true"; } catch { return true; }
  });
  const [tileSizeSetting] = useState(() => {
    try { return localStorage.getItem("rackleTileSize") || "regular"; } catch { return "regular"; }
  });
  const handTileSize = tileSizeSetting === "large" ? "md" : tileSizeSetting === "small" ? "xs" : "sm";
  const passTileSize = tileSizeSetting === "large" ? "sm" : "xs";

  // Leaderboard state
  const [globalRank,  setGlobalRank]  = useState(null);
  const [clubRank,    setClubRank]    = useState(null);
  const [globalCount, setGlobalCount] = useState(null);

  useEffect(() => {
    if (mode !== "daily" || !result) return;
    const playerId = getPlayerId();
    const playerName = leaderboardPlayerName;
    const timeSecs = result?.timeSecs || result?.time_secs || result?.time || null;

    fetchGlobalLeaderboard()
      .then(rows => {
        const rowsWithMe = mergeCurrentScore(rows || [], score, timeSecs, playerId, playerName, { clubCode: "__global__" });
        setGlobalCount(rowsWithMe.length);
        setGlobalRank(rankOfCurrent(rowsWithMe, score, playerId));
      })
      .catch(() => {});
    if (clubCode) {
      fetchClubLeaderboard(clubCode)
        .then(rows => {
          const rowsWithMe = mergeCurrentScore(rows || [], score, timeSecs, playerId, playerName, { clubCode });
          setClubRank(rankOfCurrent(rowsWithMe, score, playerId));
        })
        .catch(() => {});
    }
  }, [mode, score, clubCode, leaderboardPlayerName, result]);

  // ── Staged reveal ────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState(PHASE.COUNTING);

  useEffect(() => {
    // Cumulative delays: count-up runs for 1600ms, then each phase steps in
    const delays = [1600, 700, 700, 800, 600];
    let acc = 0;
    const ids = delays.map((d, i) => {
      acc += d;
      return setTimeout(() => setPhase(i + 1), acc);
    });
    return () => ids.forEach(clearTimeout);
  }, []);

  const displayScore = useCountUp(score, 1400);
  const topPath = bestPaths[0] || null;
  const chosenLabel = chosen ? (SECTION_LABELS[chosen] || chosen) : "Unsure";
  const topPathLabel = topPath?.section || "an open table read";
  const handLeanCopy = topPath
    ? (chosen && topPathLabel !== chosenLabel
        ? `You selected ${chosenLabel}, but the hand leaned toward ${topPathLabel}.`
        : `Your hand leaned toward ${topPathLabel}.`)
    : "Your hand was still open after the Charleston.";
  const activeRack = rackView === "starting" && startingRack.length ? startingRack : finalRack;
  const activeRackLabel = rackView === "starting" ? "Starting hand" : "Final hand";
  const decisionQuality = Math.round(iq?.decisionQuality || iq?.decisionScore || iq?.decisionScoreRaw || 0);
  const receiveLuck = Math.round(iq?.receiveLuck || 0);
  const finalRackQuality = Math.round(iq?.finalRackQuality || iq?.outcomeScore || 0);
  const luckAdjustedScore = Math.round(iq?.luckAdjustedScore || score);
  const selectedMatchesBest = !chosen || !topPath?.sectionId || chosen === topPath.sectionId;
  const readingStatus = selectedMatchesBest
    ? "Your read matched the strongest lane."
    : alternatives.some(alt => alt.section === chosenLabel)
      ? "Your read was defensible, but not the cleanest lane."
      : "The stronger line was elsewhere.";

  // ── Share ────────────────────────────────────────────────────────────────────
  const [shareStatus, setShareStatus] = useState("");
  const [fallbackShareText, setFallbackShareText] = useState("");
  const isGuestPlayer = !hasValidSession();
  const clubName = profile?.clubName || profile?.club_name || null;
  const shareArchetype = iq?.archetype || iq?.styleName || tier.level;
  const playUrl = "https://playrackle.com";

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

  function buildSharePayload() {
    return buildShareText({
      score,
      dayNum,
      globalRank,
      clubRank,
      clubName: mode === "daily" ? clubName : null,
      streak,
      url: playUrl,
      mode,
      archetype: shareArchetype,
      headline: frame?.headline,
    });
  }

  function resetShareStatus(nextStatus) {
    setShareStatus(nextStatus);
    if (nextStatus !== "copy-failed") {
      setTimeout(() => setShareStatus(""), 2800);
    }
  }

  async function copyShareText(text) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      resetShareStatus("copied");
      return true;
    } catch {
      setFallbackShareText(text);
      resetShareStatus("copy-failed");
      return false;
    }
  }

  async function handleShare(forceCopy = false) {
    const text = buildSharePayload();
    setFallbackShareText(text);

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

    if (forceCopy) {
      trackRackleEvent("share_copy_clicked", { ...basePayload, shareMethod: "copy" });
      const copied = await copyShareText(text);
      if (copied) trackRackleEvent("score_shared", { ...basePayload, shareMethod: "copy" });
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: mode === "practice" ? "Rackle practice score" : "Today’s Rackle score",
          text,
          url: playUrl,
        });
        resetShareStatus("shared");
        trackRackleEvent("score_shared", { ...basePayload, shareMethod: "native" });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    trackRackleEvent("share_copy_clicked", { ...basePayload, shareMethod: "copy" });
    const copied = await copyShareText(text);
    if (copied) trackRackleEvent("score_shared", { ...basePayload, shareMethod: "copy" });
  }

  function dismissFirstScoreHelp() {
    try {
      localStorage.setItem("rackleHasSeenScoreExplainer", "true");
    } catch {
      // Ignore localStorage failures.
    }
    setShowFirstScoreHelp(false);
  }

  // Tier-aware hero color class
  const tierSlug = tier.level
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  // ── Render ───────────────────────────────────────────────────────────────────
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

  return (
    <div className="rk-sc-page">

      <div className="rk-sc-feature-card">
      {/* ── Hero — deep emerald ────────────────────────────────────────────── */}
      <div className={`rk-sc-hero rk-sc-hero--${tierSlug}`}>

        {/* Day / mode pill */}
        <div className="rk-sc-hero__pill">
          {mode === "practice" ? "Practice Round" : `Rackle #${dayNum}`}
        </div>

        {/* IQ ring */}
        <div className="rk-sc-score-ring">
          <span className="rk-sc-score-ring__num">{displayScore}</span>
          <span className="rk-sc-score-ring__label">IQ Score</span>
        </div>

        {/* Archetype */}
        {phase >= PHASE.ARCHETYPE && (
          <div className="rk-sc-archetype rk-sc-archetype--in">
            <span className="rk-sc-archetype__name">
              {iq?.styleName || "Table Reader"}
            </span>
          </div>
        )}

        {/* Tier label */}
        {phase >= PHASE.ARCHETYPE && (
          <p className="rk-sc-hero__tier rk-sc-hero__tier--in">
            {tier.level}
          </p>
        )}
      </div>

      {/* ── Headline ─────────────────────────────────────────────────────── */}
      {phase >= PHASE.HEADLINE && (
        <div className="rk-sc-headline rk-sc-headline--in">
          <h2 className="rk-sc-headline__h">{frame.headline}</h2>
          <p className="rk-sc-headline__copy">{frame.copy}</p>
          {frame.tag && (
            <span className="rk-sc-headline__tag">{frame.tag}</span>
          )}
        </div>
      )}



      {phase >= PHASE.HEADLINE && mode === "daily" && showFirstScoreHelp && (
        <div className="rk-sc-first-score-note rk-sc-section--in">
          <details open>
            <summary>What your Rackle IQ means</summary>
            <p>Your Rackle IQ measures how well you read the rack through the Charleston, not just how lucky the final rack was.</p>
            <button type="button" onClick={dismissFirstScoreHelp}>Got it</button>
          </details>
        </div>
      )}

      {phase >= PHASE.HEADLINE && mode === "daily" && !clubCode && (
        <div className="rk-sc-club-nudge rk-sc-section--in">
          <div>
            <h3>Playing with friends?</h3>
            <p>Join or create a club to compare daily reads with your Mahjong table.</p>
          </div>
          <button type="button" className="rk-sc-club-nudge__button" onClick={() => setScreen?.("clubDirectory")}>
            Find your club
          </button>
        </div>
      )}

      {phase >= PHASE.HEADLINE && mode === "daily" && (
        <p className="rk-sc-return-nudge rk-sc-section--in">Come back tomorrow. New rack, new table read.</p>
      )}
      </div>

      {/* ── Hand snapshot ─────────────────────────────────────────────────── */}
      {phase >= PHASE.INSIGHTS && finalRack.length > 0 && (
        <div className="rk-sc-section rk-sc-section--in rk-sc-hand-section">
          <div className="rk-sc-section__head-row">
            <div>
              <h3 className="rk-sc-section__h">Your hand</h3>
              <p className="rk-sc-section__subcopy">Toggle between where you started and where the Charleston left you.</p>
            </div>
            {startingRack.length > 0 && (
              <div className="rk-sc-hand-toggle" role="group" aria-label="Toggle starting or final hand">
                <button
                  type="button"
                  className={`rk-sc-hand-toggle__btn ${rackView === "final" ? "is-active" : ""}`}
                  onClick={() => setRackView("final")}
                >
                  Final hand
                </button>
                <button
                  type="button"
                  className={`rk-sc-hand-toggle__btn ${rackView === "starting" ? "is-active" : ""}`}
                  onClick={() => setRackView("starting")}
                >
                  Starting hand
                </button>
              </div>
            )}
          </div>
          <div className="rk-sc-hand-card">
            <div className="rk-sc-hand-card__topline">
              <span>{activeRackLabel}</span>
              <strong>{topPathLabel}</strong>
            </div>
            <div className="rk-sc-final-rack rk-sc-final-rack--premium">
              {activeRack.map((tile, i) => (
                <PremiumMahjongTile key={`${rackView}-${i}`} tile={tile} size={handTileSize} />
              ))}
            </div>
            <p className="rk-sc-hand-card__lean">{handLeanCopy}</p>
          </div>
        </div>
      )}

      {/* ── Score breakdown ───────────────────────────────────────────────── */}
      {phase >= PHASE.BREAKDOWN && (
        <div className="rk-sc-section rk-sc-section--in rk-sc-premium-panel">
          <h3 className="rk-sc-section__h">Scoring breakdown</h3>
          <p className="rk-sc-breakdown-intro">Rackle IQ rewards the table read, not just the final rack.</p>
          <div className="rk-sc-ranks rk-sc-ranks--compact rk-sc-control-split">
            <div className="rk-sc-rank-card"><span className="rk-sc-rank-card__label">Decision quality</span><span className="rk-sc-rank-card__val">{decisionQuality}</span></div>
            <div className="rk-sc-rank-card"><span className="rk-sc-rank-card__label">Receive luck</span><span className="rk-sc-rank-card__val">{receiveLuck}</span></div>
            <div className="rk-sc-rank-card"><span className="rk-sc-rank-card__label">Final rack</span><span className="rk-sc-rank-card__val">{finalRackQuality}</span></div>
            <div className="rk-sc-rank-card rk-sc-rank-card--accent"><span className="rk-sc-rank-card__label">Luck adjusted</span><span className="rk-sc-rank-card__val">{luckAdjustedScore}</span></div>
          </div>
          <div className="rk-sc-bars rk-sc-bars--supporting">
            {BAR_META.map(({ key, label, max, desc }, idx) => {
              const val = Number(iq?.[key] || 0);
              const pct = Math.round((val / max) * 100);
              return (
                <div key={key} className="rk-sc__bar rk-sc__bar--animate" style={{ animationDelay: `${idx * 80}ms` }}>
                  <div className="rk-sc__bar-header">
                    <span className="rk-sc__bar-label">{label}</span>
                    <span className="rk-sc__bar-val">{val}<span className="rk-sc__bar-max">/{max}</span></span>
                  </div>
                  <div className="rk-sc__bar-track">
                    <div className="rk-sc__bar-fill rk-sc__bar-fill--animate" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="rk-sc__bar-desc">{desc}</p>
                </div>
              );
            })}
          </div>
          {luckSplitNote && <p className="rk-sc-direction__note rk-sc-path-note" style={{ fontStyle: "normal" }}>{luckSplitNote}</p>}
        </div>
      )}

      {/* ── What you were reading ─────────────────────────────────────────── */}
      {phase >= PHASE.INSIGHTS && chosen && (
        <div className="rk-sc-section rk-sc-section--in">
          <h3 className="rk-sc-section__h">What you were reading</h3>
          <div className="rk-sc-direction rk-sc-direction--featured">
            <div className="rk-sc-direction__badge">
              <span className="rk-sc-direction__label">
                {chosenLabel}
              </span>
              {(() => {
                const match = allSec.find(s => s.id === chosen);
                return match ? (
                  <span className="rk-sc-direction__score">
                    Fit score: {Math.round(match.score)}
                  </span>
                ) : null;
              })()}
            </div>
            <p className="rk-sc-direction__note rk-sc-reading-status" style={{ fontStyle: "normal" }}>{readingStatus}</p>
            <p className="rk-sc-direction__note" style={{ fontStyle: "normal" }}>{handLeanCopy}</p>
            {iq?.styleNote && (
              <p className="rk-sc-direction__note">{iq.styleNote}</p>
            )}
            {alternatives.length > 0 && (
              <div className="rk-sc-mini-list">
                <p className="rk-sc-sections-list__eyebrow">Defensible alternatives</p>
                {alternatives.slice(0, 2).map((alt, i) => (
                  <p key={`alt-${i}`} className="rk-sc-direction__note" style={{ fontStyle: "normal" }}>
                    {alt.section}: {alt.whyDefensible} {alt.whyNotBest}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Expert table read ─────────────────────────────────────────────── */}
      {phase >= PHASE.INSIGHTS && expertTableRead && (
        <div className="rk-sc-section rk-sc-section--in rk-sc-premium-panel">
          <h3 className="rk-sc-section__h">Expert table read</h3>
          <div className="rk-sc-direction rk-sc-direction--featured">
            <p className="rk-sc-direction__note" style={{ fontStyle: "normal" }}>{expertTableRead}</p>
            {confidence && (
              <p className="rk-sc-direction__note" style={{ fontStyle: "normal" }}>
                {confidence}. {confidenceNote}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Best realistic paths ─────────────────────────────────────────── */}
      {phase >= PHASE.INSIGHTS && bestPaths.length > 0 && (
        <div className="rk-sc-section rk-sc-section--in">
          <h3 className="rk-sc-section__h">Best realistic paths</h3>
          <div className="rk-sc-sections-list rk-sc-sections-list--premium">
            {bestPaths.slice(0, 3).map((path, i) => (
              <div key={`${path.sectionId || path.section}-${i}`} className="rk-sc-sec-row rk-sc-sec-row--detailed">
                <div className="rk-sc-sec-row__top">
                  <span className="rk-sc-sec-row__rank">#{i + 1}</span>
                  <span className="rk-sc-sec-row__name">{path.section}</span>
                  <span className="rk-sc-sec-row__confidence">{path.confidence || "medium"}</span>
                </div>
                <div className="rk-sc-sec-row__bar">
                  <div className="rk-sc-sec-row__fill" style={{ width: `${Math.min(100, Math.round(path.fitScore || 0))}%` }} />
                </div>
                <div className="rk-sc-sec-row__details">
                  {path.supportingTiles?.length > 0 && <p><strong>Support:</strong> {path.supportingTiles.slice(0, 5).join(", ")}</p>}
                  {path.missingNeeds?.length > 0 && <p><strong>Needs:</strong> {path.missingNeeds.slice(0, 2).join(", ")}</p>}
                  {path.risk && <p><strong>Risk:</strong> {path.risk}</p>}
                </div>
              </div>
            ))}
          </div>
          <p className="rk-sc-direction__note rk-sc-path-note" style={{ fontStyle: "normal" }}>
            {bestPaths[0]?.explanation}
          </p>
          {exposureRealism?.explanation && (
            <p className="rk-sc-direction__note rk-sc-path-note" style={{ fontStyle: "normal" }}>
              {exposureRealism.explanation}
            </p>
          )}
        </div>
      )}

      {/* ── Coaching read ────────────────────────────────────────────────── */}
      {phase >= PHASE.INSIGHTS && (whatHeldYouBack.length > 0 || coachGuidance) && (
        <div className="rk-sc-section rk-sc-section--in">
          <h3 className="rk-sc-section__h">
            {mode === "practice" ? "Coach read" : "What shaped the read"}
          </h3>
          <div className="rk-sc-direction">
            {whatHeldYouBack.length > 0 && (
              <>
                <p className="rk-sc-sections-list__eyebrow">What held you back</p>
                {whatHeldYouBack.slice(0, 3).map((line, i) => (
                  <p key={`held-${i}`} className="rk-sc-direction__note" style={{ fontStyle: "normal" }}>{line}</p>
                ))}
              </>
            )}
            {nearMisses.length > 0 && (
              <>
                <p className="rk-sc-sections-list__eyebrow">Near misses</p>
                {nearMisses.slice(0, 2).map((miss, i) => (
                  <p key={`near-${i}`} className="rk-sc-direction__note" style={{ fontStyle: "normal" }}>
                    {miss.section}: {miss.reason} {miss.keyMistake}
                  </p>
                ))}
              </>
            )}
            {coachGuidance && (
              <p className="rk-sc-direction__note" style={{ fontStyle: "normal" }}>{coachGuidance}</p>
            )}
          </div>
        </div>
      )}

      {/* ── Pass coaching replay ──────────────────────────────────────────── */}
      {phase >= PHASE.INSIGHTS && passLog.length > 0 && (
        <details className="rk-sc-section rk-sc-section--in rk-sc-pass-replay rk-sc-pass-master">
          <summary className="rk-sc-pass-master__summary">
            <span className="rk-sc-pass-master__copy">
              <span className="rk-sc-section__h rk-sc-pass-master__title">
                {mode === "practice" ? "Your Charleston" : "Pass by pass"}
              </span>
              <span className="rk-sc-pass-master__hint">Tap to review your 3 passes</span>
            </span>
          </summary>
          <div className="rk-sc-pass-master__body">
            <p className="rk-sc-pass-replay__intro">Open each pass to review what left your rack and what came back.</p>
            <div className="rk-sc-passes">
              {passLog.map((entry, i) => {
                const analysis = passAnalysis[i] || {};
                return (
                <details key={i} className="rk-sc-pass rk-sc-pass--dropdown">
                  <summary className="rk-sc-pass__summary">
                    <span className="rk-sc-pass__label">{entry.label || analysis.label || `Pass ${i + 1}`}</span>
                    <span className="rk-sc-pass__summary-meta">
                      {analysis.passQualityLabel ? `${analysis.passQualityLabel} · ` : ""}{(entry.out || []).length} passed · {(entry.in || []).length} received
                    </span>
                  </summary>
                  <div className="rk-sc-pass__cols">
                    <div className="rk-sc-pass__col">
                      <p className="rk-sc-pass__col-label">Passed</p>
                      <div className="rk-sc-pass__tiles">
                        {(entry.out || []).map((tile, j) => (
                          <PremiumMahjongTile key={j} tile={tile} size={passTileSize} dim />
                        ))}
                      </div>
                    </div>
                    <div className="rk-sc-pass__divider">→</div>
                    <div className="rk-sc-pass__col">
                      <p className="rk-sc-pass__col-label">Received</p>
                      <div className="rk-sc-pass__tiles">
                        {(entry.in || []).map((tile, j) => (
                          <PremiumMahjongTile key={j} tile={tile} size={passTileSize} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {(analysis.explanation || analysis.betterPassCandidate?.length > 0) && (
                    <div className="rk-sc-pass__coach">
                      {analysis.explanation && <p>{analysis.explanation}</p>}
                      {analysis.betterPassCandidate?.length > 0 && (
                        <p>Expert alternative: {analysis.betterPassCandidate.join(", ")}</p>
                      )}
                      {analysis.tilesYouProtectedWell?.length > 0 && (
                        <p>Protected well: {analysis.tilesYouProtectedWell.join(", ")}</p>
                      )}
                      {analysis.questionableKeep?.length > 0 && (
                        <p>Questionable keep: {analysis.questionableKeep.join(", ")}</p>
                      )}
                    </div>
                  )}
                </details>
                );
              })}
            </div>
          </div>
        </details>
      )}

      {phase >= PHASE.INSIGHTS && playerNotes && (
        <div className="rk-sc-section rk-sc-section--in">
          <h3 className="rk-sc-section__h">Your table notes</h3>
          <div className="rk-sc-direction">
            <p className="rk-sc-direction__note" style={{ fontStyle: "normal" }}>{playerNotes}</p>
          </div>
        </div>
      )}

      {/* ── Rankings ──────────────────────────────────────────────────────── */}
      {phase >= PHASE.FULL && mode === "daily" && (globalRank || clubRank) && (
        <div className="rk-sc-section rk-sc-section--in">
          <h3 className="rk-sc-section__h">Strongest reads today</h3>
          <div className="rk-sc-ranks">
            {globalRank && (
              <div className="rk-sc-rank-card">
                <span className="rk-sc-rank-card__label">Global</span>
                <span className="rk-sc-rank-card__val">#{globalRank}</span>
                {globalCount && (
                  <span className="rk-sc-rank-card__of">
                    of {globalCount.toLocaleString()}
                  </span>
                )}
              </div>
            )}
            {clubRank && (
              <div className="rk-sc-rank-card rk-sc-rank-card--club">
                <span className="rk-sc-rank-card__label">Club</span>
                <span className="rk-sc-rank-card__val">#{clubRank}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Streak ────────────────────────────────────────────────────────── */}
      {phase >= PHASE.FULL && mode === "daily" && streak > 1 && (
        <div className="rk-sc-streak">
          <span className="rk-sc-streak__icon">🔥</span>
          <span className="rk-sc-streak__text">{streak}-day streak</span>
        </div>
      )}

      {/* ── Share and CTA ─────────────────────────────────────────────────── */}
      {phase >= PHASE.FULL && (
        <>
          <section className="rk-sc-share-card rk-sc-section--in" aria-label="Share your Rackle score">
            <div className="rk-sc-share-card__eyebrow">{mode === "practice" ? "Practice table read" : "Daily table read"}</div>
            <div className="rk-sc-share-card__header">
              <div>
                <h3>{mode === "practice" ? "Share this practice hand" : "Share today’s table read"}</h3>
                <p>{mode === "practice" ? "Send this practice rack to a friend without adding it to the leaderboard." : "Challenge your Mahjong group to beat your Rackle IQ."}</p>
              </div>
              <div className="rk-sc-share-card__score" aria-label={`Rackle IQ ${score}`}>
                <strong>{score}</strong>
                <span>Rackle IQ</span>
              </div>
            </div>

            <div className="rk-sc-share-card__meta" aria-label="Share context">
              <span>{shareArchetype}</span>
              {mode === "daily" && globalRank && <span>Global #{globalRank}</span>}
              {mode === "daily" && clubRank && <span>Club #{clubRank}</span>}
              {mode === "daily" && clubName && <span>{clubName}</span>}
            </div>

            <div className="rk-sc-share-card__actions">
              <button type="button" className="rk-btn rk-btn--primary" onClick={() => handleShare(false)}>
                Share score
              </button>
              <button type="button" className="rk-btn rk-btn--secondary" onClick={() => handleShare(true)}>
                Copy result
              </button>
              {mode === "daily" && clubCode && (
                <button type="button" className="rk-btn rk-btn--ghost" onClick={() => handleShare(false)}>
                  Challenge your club
                </button>
              )}
            </div>

            {shareStatus === "shared" && <p className="rk-sc-share-card__toast">Shared. Let the table chase begin.</p>}
            {shareStatus === "copied" && <p className="rk-sc-share-card__toast">Score copied. Send it to your table.</p>}
            {shareStatus === "copy-failed" && (
              <div className="rk-sc-share-card__fallback">
                <strong>Share copy is ready.</strong>
                <span>Copy the text below and send it to your Mahjong group.</span>
                <textarea readOnly value={fallbackShareText} onFocus={(e) => e.target.select()} />
              </div>
            )}

            {isGuestPlayer && (
              <div className="rk-sc-share-card__guest">
                <span>Want to save your streak and table reads?</span>
                <button type="button" onClick={() => setScreen?.("signup")}>Join Rackle</button>
              </div>
            )}
          </section>

          <div className="rk-sc-cta rk-sc-cta--in">
            {mode === "daily" && (
              <button
                className="rk-btn rk-btn--secondary rk-btn--full"
                onClick={() => setScreen?.("leaderboard")}
              >
                Today's leaders →
              </button>
            )}

            {mode === "practice" ? (
              <button
                className="rk-btn rk-btn--primary rk-btn--full"
                onClick={() => setScreen?.("practice")}
              >
                Try another rack
              </button>
            ) : (
              <button
                className="rk-btn rk-btn--ghost"
                onClick={() => setScreen?.("home")}
              >
                Back to home
              </button>
            )}
          </div>
        </>
      )}

    </div>
  );
}
