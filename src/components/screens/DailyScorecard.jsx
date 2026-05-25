// ─── Rackle v2 · Daily Scorecard ─────────────────────────────────────────────
// Simplified scorecard: premium share card first, quick insight, hand, compact
// score breakdown, one coach note, then optional advanced review.

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

const BAR_META = [
  { key: "decisionQuality", fallback: "decisionScore", label: "Decision Quality", desc: "How strong your Charleston choices were." },
  { key: "receiveLuck", fallback: null, label: "Receive Luck", desc: "How helpful the returned tiles were." },
  { key: "finalRackQuality", fallback: "outcomeScore", label: "Final Rack", desc: "How playable the rack looked after passing." },
  { key: "luckAdjustedScore", fallback: null, label: "Luck Adjusted", desc: "Your read with luck smoothed out." },
];

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

function firstFiniteNumber(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) return number;
  }
  return null;
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

function ScoreStat({ label, value, desc, accent = false }) {
  const numericValue = Number(value);
  const hasValue = Number.isFinite(numericValue) && numericValue > 0;

  return (
    <div className={`rk-sc-rank-card ${accent ? "rk-sc-rank-card--accent" : ""}`}>
      <span className="rk-sc-rank-card__label">{label}</span>
      <span className={`rk-sc-rank-card__val ${!hasValue ? "rk-sc-rank-card__val--empty" : ""}`}>
        {hasValue ? Math.round(numericValue) : "—"}
      </span>
      {desc && <small className="rk-sc-rank-card__note">{desc}</small>}
    </div>
  );
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

  const passLog = safeArray(iq?.passLog);
  const passAnalysis = safeArray(iq?.passAnalysis);
  const allSections = safeArray(iq?.allSections);
  const chosen = iq?.chosenSection;
  const chosenLabel = sectionLabel(chosen);
  const finalRack = safeArray(iq?.finalRack || result?.finalRack || result?.rack || result?.tiles);
  const startingRack = safeArray(iq?.startingRack || result?.startingRack);
  const bestPaths = safeArray(iq?.bestPaths);
  const topPath = bestPaths[0] || null;
  const topPathLabel = sectionLabel(topPath?.section || topPath?.sectionId);
  const whatHeldYouBack = safeArray(iq?.whatHeldYouBack);
  const nearMisses = safeArray(iq?.nearMisses);
  const alternatives = safeArray(iq?.defensibleAlternatives);
  const expertTableRead = safeText(iq?.expertTableRead || iq?.tableReadSummary);
  const coachGuidance = safeText(iq?.coachGuidance || iq?.styleNote);
  const luckSplitNote = safeText(iq?.luckSplitNote);
  const confidence = iq?.confidenceRating || iq?.confidence?.rating || null;
  const confidenceNote = safeText(iq?.confidence?.explanation);
  const exposureRealism = iq?.exposureRealism || null;

  const [rackView, setRackView] = useState("final");
  const [globalRank, setGlobalRank] = useState(null);
  const [clubRank, setClubRank] = useState(null);
  const [globalCount, setGlobalCount] = useState(null);
  const [shareStatus, setShareStatus] = useState("");
  const [fallbackShareText, setFallbackShareText] = useState("");

  const activeRack = rackView === "starting" && startingRack.length ? startingRack : finalRack;
  const activeRackLabel = rackView === "starting" ? "Starting hand" : "Final hand";

  const handLeanCopy = topPath
    ? (chosen && topPathLabel !== chosenLabel
      ? `You selected ${chosenLabel}, but the hand leaned toward ${topPathLabel}.`
      : `Your hand leaned toward ${topPathLabel}.`)
    : "Your hand was still open after the Charleston.";

  const mainTakeaway = whatHeldYouBack[0]
    || coachGuidance
    || expertTableRead
    || frame.copy
    || "The score reflects your Charleston read, tile direction, and how playable the final rack became.";

  const quickReadStatus = chosen && topPathLabel !== chosenLabel
    ? "Different best lane"
    : "Best lane matched";

  useEffect(() => {
    if (mode !== "daily" || !result) return;

    const playerId = getPlayerId();
    const timeSecs = result?.timeSecs || result?.time_secs || result?.time || null;

    fetchGlobalLeaderboard()
      .then((rows) => {
        const rowsWithMe = mergeCurrentScore(rows || [], score, timeSecs, playerId, leaderboardPlayerName, { clubCode: "__global__" });
        setGlobalCount(rowsWithMe.length);
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
    <div className="rk-sc-page rk-sc-page--simplified">
      <div className="rk-sc-feature-card rk-sc-feature-card--shareable">
        <div className={`rk-sc-hero rk-sc-hero--${tier.level.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`}>
          <div className="rk-sc-hero__pill">
            {mode === "practice" ? "Practice Round" : `Rackle #${dayNum}`}
          </div>

          <div className="rk-sc-score-ring">
            <span className="rk-sc-score-ring__num">{score}</span>
            <span className="rk-sc-score-ring__label">IQ Score</span>
          </div>

          <div className="rk-sc-archetype rk-sc-archetype--in">
            <span className="rk-sc-archetype__name">{iq?.styleName || "Table Reader"}</span>
          </div>

          <p className="rk-sc-hero__tier rk-sc-hero__tier--in">{tier.level}</p>
        </div>

        <div className="rk-sc-headline rk-sc-headline--in">
          <h2 className="rk-sc-headline__h">{frame.headline}</h2>
          <p className="rk-sc-headline__copy">{frame.copy}</p>
          {frame.tag && <span className="rk-sc-headline__tag">{frame.tag}</span>}
        </div>

        {mode === "daily" && (
          <p className="rk-sc-return-nudge rk-sc-section--in">
            Come back tomorrow. New rack, new table read.
          </p>
        )}
      </div>

      {activeRack.length > 0 && (
        <section className="rk-sc-section rk-sc-section--in rk-sc-hand-section">
          <div className="rk-sc-section__head-row">
            <div>
              <h3 className="rk-sc-section__h">Your hand</h3>
              <p className="rk-sc-section__subcopy">Start with the final rack. Toggle if you want to compare where you began.</p>
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
            <TileRack tiles={activeRack} />
            <p className="rk-sc-hand-card__lean">{handLeanCopy}</p>
          </div>
        </section>
      )}

      <section className="rk-sc-section rk-sc-section--in rk-sc-premium-panel rk-sc-quick-read">
        <h3 className="rk-sc-section__h">Quick read</h3>
        <div className="rk-sc-direction rk-sc-direction--featured">
          <div className="rk-sc-direction__badge">
            <span className="rk-sc-direction__label">Best lane</span>
            <span className="rk-sc-direction__score">{topPathLabel}</span>
          </div>

          <div className="rk-sc-mini-list">
            <p className="rk-sc-direction__note" style={{ fontStyle: "normal" }}>
              <strong>Your read:</strong> {chosenLabel}
            </p>
            <p className="rk-sc-direction__note" style={{ fontStyle: "normal" }}>
              <strong>Status:</strong> {quickReadStatus}
            </p>
            <p className="rk-sc-direction__note" style={{ fontStyle: "normal" }}>
              <strong>Main takeaway:</strong> {mainTakeaway}
            </p>
          </div>
        </div>
      </section>

      <section className="rk-sc-section rk-sc-section--in rk-sc-premium-panel">
        <h3 className="rk-sc-section__h">Score breakdown</h3>
        <p className="rk-sc-breakdown-intro">A quick view of what shaped your Rackle IQ.</p>

        <div className="rk-sc-ranks rk-sc-ranks--compact rk-sc-control-split">
          {BAR_META.map((meta, index) => {
            const rawValue = firstFiniteNumber(
              iq?.[meta.key],
              meta.fallback ? iq?.[meta.fallback] : null,
              meta.key === "luckAdjustedScore" ? score : null
            );
            return (
              <ScoreStat
                key={meta.key}
                label={meta.label}
                value={rawValue}
                desc={meta.desc}
                accent={index === BAR_META.length - 1}
              />
            );
          })}
        </div>

        {luckSplitNote && <p className="rk-sc-direction__note rk-sc-path-note" style={{ fontStyle: "normal" }}>{luckSplitNote}</p>}
      </section>

      <section className="rk-sc-section rk-sc-section--in">
        <h3 className="rk-sc-section__h">Coach note</h3>
        <div className="rk-sc-direction">
          <p className="rk-sc-direction__note" style={{ fontStyle: "normal" }}>{mainTakeaway}</p>
        </div>
      </section>

      <details className="rk-sc-section rk-sc-section--in rk-sc-pass-replay rk-sc-pass-master">
        <summary className="rk-sc-pass-master__summary">
          <span className="rk-sc-pass-master__copy">
            <span className="rk-sc-section__h rk-sc-pass-master__title">Advanced review</span>
            <span className="rk-sc-pass-master__hint">Tap for pass-by-pass, near misses, and full expert notes</span>
          </span>
        </summary>

        <div className="rk-sc-pass-master__body">
          {expertTableRead && (
            <div className="rk-sc-direction rk-sc-direction--featured">
              <p className="rk-sc-sections-list__eyebrow">Expert table read</p>
              <p className="rk-sc-direction__note" style={{ fontStyle: "normal" }}>{expertTableRead}</p>
              {confidence && (
                <p className="rk-sc-direction__note" style={{ fontStyle: "normal" }}>
                  {confidence}. {confidenceNote}
                </p>
              )}
            </div>
          )}

          {bestPaths.length > 0 && (
            <div className="rk-sc-sections-list rk-sc-sections-list--premium">
              <p className="rk-sc-sections-list__eyebrow">Best realistic paths</p>
              {bestPaths.slice(0, 3).map((path, index) => (
                <div key={`${path.sectionId || path.section}-${index}`} className="rk-sc-sec-row rk-sc-sec-row--detailed">
                  <div className="rk-sc-sec-row__top">
                    <span className="rk-sc-sec-row__rank">#{index + 1}</span>
                    <span className="rk-sc-sec-row__name">{sectionLabel(path.section || path.sectionId)}</span>
                    <span className="rk-sc-sec-row__confidence">{path.confidence || "medium"}</span>
                  </div>
                  <div className="rk-sc-sec-row__bar">
                    <div className="rk-sc-sec-row__fill" style={{ width: `${Math.min(100, Math.round(Number(path.fitScore || 0)))}%` }} />
                  </div>
                  <div className="rk-sc-sec-row__details">
                    {safeArray(path.supportingTiles).length > 0 && <p><strong>Support:</strong> {safeArray(path.supportingTiles).slice(0, 5).join(", ")}</p>}
                    {safeArray(path.missingNeeds).length > 0 && <p><strong>Needs:</strong> {safeArray(path.missingNeeds).slice(0, 2).join(", ")}</p>}
                    {path.risk && <p><strong>Risk:</strong> {path.risk}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {allSections.length > 0 && (
            <div className="rk-sc-sections-list rk-sc-sections-list--premium">
              <p className="rk-sc-sections-list__eyebrow">Section fit</p>
              {allSections.slice(0, 5).map((section, index) => (
                <div key={`${section.id || section.name}-${index}`} className="rk-sc-sec-row">
                  <span className="rk-sc-sec-row__name">{sectionLabel(section.id || section.name)}</span>
                  <span className="rk-sc-sec-row__confidence">{Math.round(Number(section.score || 0))}</span>
                </div>
              ))}
            </div>
          )}

          {(alternatives.length > 0 || nearMisses.length > 0 || whatHeldYouBack.length > 0 || exposureRealism?.explanation) && (
            <div className="rk-sc-direction">
              {whatHeldYouBack.length > 0 && (
                <>
                  <p className="rk-sc-sections-list__eyebrow">What held you back</p>
                  {whatHeldYouBack.slice(0, 3).map((line, index) => (
                    <p key={`held-${index}`} className="rk-sc-direction__note" style={{ fontStyle: "normal" }}>{line}</p>
                  ))}
                </>
              )}

              {alternatives.length > 0 && (
                <>
                  <p className="rk-sc-sections-list__eyebrow">Defensible alternatives</p>
                  {alternatives.slice(0, 3).map((alt, index) => (
                    <p key={`alt-${index}`} className="rk-sc-direction__note" style={{ fontStyle: "normal" }}>
                      {sectionLabel(alt.section)}: {alt.whyDefensible} {alt.whyNotBest}
                    </p>
                  ))}
                </>
              )}

              {nearMisses.length > 0 && (
                <>
                  <p className="rk-sc-sections-list__eyebrow">Near misses</p>
                  {nearMisses.slice(0, 3).map((miss, index) => (
                    <p key={`miss-${index}`} className="rk-sc-direction__note" style={{ fontStyle: "normal" }}>
                      {sectionLabel(miss.section)}: {miss.reason} {miss.keyMistake}
                    </p>
                  ))}
                </>
              )}

              {exposureRealism?.explanation && (
                <>
                  <p className="rk-sc-sections-list__eyebrow">Exposure realism</p>
                  <p className="rk-sc-direction__note" style={{ fontStyle: "normal" }}>{exposureRealism.explanation}</p>
                </>
              )}
            </div>
          )}

          {passLog.length > 0 && (
            <div className="rk-sc-passes">
              <p className="rk-sc-sections-list__eyebrow">Pass by pass</p>
              {passLog.map((entry, index) => {
                const analysis = passAnalysis[index] || {};
                return (
                  <details key={`pass-${index}`} className="rk-sc-pass rk-sc-pass--dropdown">
                    <summary className="rk-sc-pass__summary">
                      <span className="rk-sc-pass__label">{entry.label || analysis.label || `Pass ${index + 1}`}</span>
                      <span className="rk-sc-pass__summary-meta">
                        {analysis.passQualityLabel ? `${analysis.passQualityLabel} · ` : ""}{safeArray(entry.out).length} passed · {safeArray(entry.in).length} received
                      </span>
                    </summary>

                    <div className="rk-sc-pass__cols">
                      <div className="rk-sc-pass__col">
                        <p className="rk-sc-pass__col-label">Passed</p>
                        <div className="rk-sc-pass__tiles">
                          {safeArray(entry.out).map((tile, tileIndex) => (
                            <PremiumMahjongTile key={`out-${tileIndex}`} tile={tile} size="xs" dim />
                          ))}
                        </div>
                      </div>

                      <div className="rk-sc-pass__divider">→</div>

                      <div className="rk-sc-pass__col">
                        <p className="rk-sc-pass__col-label">Received</p>
                        <div className="rk-sc-pass__tiles">
                          {safeArray(entry.in).map((tile, tileIndex) => (
                            <PremiumMahjongTile key={`in-${tileIndex}`} tile={tile} size="xs" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {(analysis.explanation || safeArray(analysis.betterPassCandidate).length > 0) && (
                      <div className="rk-sc-pass__coach">
                        {analysis.explanation && <p>{analysis.explanation}</p>}
                        {safeArray(analysis.betterPassCandidate).length > 0 && (
                          <p><strong>Better pass:</strong> {safeArray(analysis.betterPassCandidate).join(", ")}</p>
                        )}
                      </div>
                    )}
                  </details>
                );
              })}
            </div>
          )}
        </div>
      </details>

      <section className="rk-sc-share-card rk-sc-section--in">
        <div className="rk-sc-share-card__copy">
          <h3>Share your table read</h3>
          <p>Post your Rackle IQ and bring your Mahjong group into today’s board.</p>
        </div>

        <div className="rk-sc-share-card__actions">
          <button className="rk-btn rk-btn--primary rk-btn--full" onClick={() => handleShare(false)}>
            Share score
          </button>
          <button className="rk-btn rk-btn--secondary rk-btn--full" onClick={() => handleShare(true)}>
            Copy result
          </button>
        </div>

        {shareStatus === "shared" && <p className="rk-sc-share-card__status">Shared.</p>}
        {shareStatus === "copied" && <p className="rk-sc-share-card__status">Copied.</p>}
        {shareStatus === "copy-failed" && (
          <div className="rk-sc-share-card__fallback">
            <p>Copy this result:</p>
            <textarea readOnly value={fallbackShareText} />
          </div>
        )}
      </section>

      {mode === "daily" && (
        <section className="rk-sc-section rk-sc-section--in rk-sc-premium-panel">
          <h3 className="rk-sc-section__h">Today’s board</h3>
          <div className="rk-sc-ranks rk-sc-ranks--compact">
            <div className="rk-sc-rank-card">
              <span className="rk-sc-rank-card__label">Global rank</span>
              <span className="rk-sc-rank-card__val">{globalRank ? `#${globalRank}` : "—"}</span>
            </div>
            <div className="rk-sc-rank-card">
              <span className="rk-sc-rank-card__label">Club rank</span>
              <span className="rk-sc-rank-card__val">{clubRank ? `#${clubRank}` : "—"}</span>
            </div>
            <div className="rk-sc-rank-card">
              <span className="rk-sc-rank-card__label">Scores posted</span>
              <span className="rk-sc-rank-card__val">{globalCount || "—"}</span>
            </div>
          </div>
          <button className="rk-btn rk-btn--ghost rk-btn--full" onClick={() => setScreen?.("leaderboard")}>
            View leaderboard
          </button>
        </section>
      )}

      <div className="rk-sc__footer-ctas">
        <button className="rk-btn rk-btn--secondary rk-btn--full" onClick={() => setScreen?.("game", { mode: "practice" })}>
          Practice another rack
        </button>
        <button className="rk-btn rk-btn--ghost rk-btn--full" onClick={() => setScreen?.("home")}>
          Back to home
        </button>
      </div>
    </div>
  );
}
