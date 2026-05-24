// ─── Rackle v2 · Scoring engine ───────────────────────────────────────────────
// IQ tiers, play styles, score reveal frames, and trust read.
// Pure JS — no React, no DOM dependencies.

// ── IQ tier definitions ───────────────────────────────────────────────────────

export const IQ_TIERS = [
  { min: 90, max: 100, range: "90-100", level: "Elite table read", color: "#A07828", notes: ["Elite table read. Clean shape, clear direction, and real Charleston discipline."] },
  { min: 80, max: 89,  range: "80-89",  level: "Strong read", color: "#F7F0DF", notes: ["Strong read. A believable lane with enough structure to defend."] },
  { min: 70, max: 79,  range: "70-79",  level: "Solid read", color: "#176B42", notes: ["Solid read. The rack had a real idea, with a few choices still to clean up."] },
  { min: 60, max: 69,  range: "60-69",  level: "Playable read", color: "#2460A8", notes: ["Playable read. The hand stayed alive, but needed sharper convergence."] },
  { min: 50, max: 59,  range: "50-59",  level: "Mixed read", color: "#A07828", notes: ["Mixed read. Some structure was there, but too much noise stayed in the rack."] },
  { min: 40, max: 49,  range: "40-49",  level: "Weak read", color: "#B02A2A", notes: ["Weak read. The rack needed cleaner passing and stronger commitment."] },
  { min: 30, max: 39,  range: "30-39",  level: "Very scattered", color: "#B02A2A", notes: ["Very scattered. Too many disconnected ideas stayed alive."] },
  { min: 0,  max: 29,  range: "0-29",   level: "Chaotic read", color: "#B02A2A", notes: ["Chaotic read. Protect pairs, cut noise, and wait for a cleaner signal."] },
];

// ── IQ play styles ────────────────────────────────────────────────────────────

export const IQ_STYLES = [
  { key: "aggressive",   name: "Aggressive Builder", notes: ["You pushed the rack forward. Good when the lane is real, costly when the shape is thin.", "You were willing to commit. The question is whether the rack had earned it.", "Sharp tempo. Make sure the speed is backed by density."] },
  { key: "flexible",     name: "Flexible Watcher",   notes: ["You kept lanes alive, but flexibility only helps when the shared core is strong.", "You protected options. Now the rack needs sharper convergence.", "Good patience. Just do not let medium paths crowd the best one."] },
  { key: "disciplined",  name: "Disciplined Passer", notes: ["You cut dead weight cleanly.", "Your passes protected the best lane without babysitting weak tiles.", "Controlled Charleston. The rack stayed readable."] },
  { key: "adaptive",     name: "Table Reader",        notes: ["You adjusted without panicking.", "You let the rack tell you where to go.", "Good table sense. The next step is committing when the lane earns it."] },
  { key: "defensive",    name: "Cautious Holder",    notes: ["You protected the rack, but may have held safety too long.", "You avoided disaster. Now look for the moment to cut harder.", "Safe Charleston. It needed more bite."] },
  { key: "fastReader",   name: "Fast Reader",        notes: ["You saw the lane early.", "Quick read. Strong when backed by clean shape.", "You did not overthink the first signal."] },
  { key: "latePivot",    name: "Late Pivot",         notes: ["The hand drifted early, then found a better lane.", "You recovered, but the rack spent time sideways.", "Good adjustment. Earlier discipline would have helped."] },
  { key: "chaos",        name: "Scattered Watcher",  notes: ["Too many medium-strength paths stayed alive.", "The rack looked flexible but lacked true acceleration.", "You had options, but not enough compression."] },
  { key: "smoothPasser", name: "Clean Passer",       notes: ["You moved through the Charleston cleanly.", "Good pass rhythm. Low noise, clear choices.", "Your passes did not fight the rack."] },
];

// ── Utilities ─────────────────────────────────────────────────────────────────

function pickNote(notes, seed = 0) {
  if (!notes?.length) return "";
  return notes[Math.abs(Math.round(seed)) % notes.length];
}

export function getIQTier(score) {
  const s = Math.max(0, Math.min(100, Math.round(score || 0)));
  return IQ_TIERS.find(t => s >= t.min && s <= t.max) || IQ_TIERS[IQ_TIERS.length - 1];
}

export function getIQStyle(score, directionScore, tileStrengthScore, passQualityScore, timingScore) {
  const dr  = directionScore    / 40;
  const tr  = tileStrengthScore / 25;
  const pr  = passQualityScore  / 25;
  const tmr = timingScore       / 10;
  const find = k => IQ_STYLES.find(s => s.key === k) || IQ_STYLES.find(s => s.key === "adaptive");

  let style;
  if      (dr >= 0.82 && tr >= 0.62 && pr < 0.78) style = find("aggressive");
  else if (pr >= 0.86 && dr >= 0.72)               style = find("disciplined");
  else if (tmr >= 0.85 && dr >= 0.72)              style = find("fastReader");
  else if (pr >= 0.82)                              style = find("smoothPasser");
  else if (dr >= 0.55 && dr < 0.78 && tr >= 0.68)  style = find("flexible");
  else if (dr < 0.55 && tr >= 0.62)                style = find("latePivot");
  else if (dr < 0.50 && pr >= 0.62)                style = find("defensive");
  else if (dr < 0.48 && pr < 0.55)                 style = find("chaos");
  else                                              style = find("adaptive");

  return { ...style, note: pickNote(style.notes, score + directionScore + passQualityScore) };
}

export function withIQStyle(iq) {
  if (!iq) return iq;
  if (iq.styleName && iq.styleNote) return iq;
  const style = getIQStyle(
    iq.totalScore       || 0,
    iq.directionScore   || 0,
    iq.tileStrengthScore|| 0,
    iq.passQualityScore || 0,
    iq.timingScore      || 0,
  );
  return { ...iq, style, styleName: style?.name, styleNote: style?.note };
}

// ── Trust read ────────────────────────────────────────────────────────────────

export function scorecardTrustRead(iq = {}) {
  const best  = iq.bestDirection || iq.strategicRead?.bestDirection || iq.topSection || null;
  const score = Number(iq.totalScore || 0);
  const tier  = getIQTier(score);
  return { best, tier, score };
}

// ── Score reveal frame ────────────────────────────────────────────────────────

export function scoreRevealFrame(score, trustRead = {}, iq = {}, mode = "daily") {
  if (iq?.headline || iq?.summary) {
    return {
      status: mode === "practice" ? "Practice Charleston complete" : "Today's Charleston complete",
      headline: iq.headline || "Table read complete.",
      copy: iq.summary || iq.coachGuidance || "",
      tag: iq.bestPaths?.[0]?.section || iq.bestSectionName || "Table Read",
    };
  }
  const n         = Number(score || 0);
  const factors   = iq?.expertFactors || iq?.expertRead?.factors || {};
  const best      = trustRead?.best || iq?.bestDirection || iq?.strategicRead?.bestDirection || "your best lane";
  const compression  = Number(factors.efficiency    || factors.compression || 0);
  const acceleration = Number(factors.acceleration  || 0);
  const convergence  = Number(factors.convergence   || 0);
  const deadness     = Number(factors.deadnessRisk  || 0);
  const prefix       = mode === "practice" ? "Practice Charleston complete" : "Today's Charleston complete";

  if (n >= 90) return { status: prefix, headline: "Elite compression.",       copy: `Clean density, clear direction, real speed. ${best} was worth defending.`,                                             tag: "Rare table read" };
  if (n >= 84) return { status: prefix, headline: acceleration >= 72 ? "Fast rack. High pressure." : "Sharp Charleston.", copy: `Strong shape after the Charleston. You had enough structure to cut harder and make the table chase you.`,                           tag: "Strong reveal"  };
  if (n >= 76) return { status: prefix, headline: compression  >= 68 ? "Clean convergence."       : "Strong table read.", copy: `You found a believable lane. ${best} had shape, but the next few tiles still mattered.`,                                        tag: "Good pressure"  };
  if (n >= 68) return { status: prefix, headline: "Good rack. Not automatic.",     copy: `The lane was there, but the rack still needed cleaner speed before it became dangerous.`,                             tag: "Still in play"  };
  if (n >= 58) return { status: prefix, headline: convergence < 58 ? "Dangerously flexible." : "Playable, but drifting.", copy: `You kept the hand alive, but too many medium-strength paths were still asking for space.`,                                        tag: "Drift watch"    };
  if (n >= 45) return { status: prefix, headline: "Thin speed.",                   copy: `Some tiles worked together, but the rack never fully compressed after the Charleston.`,                               tag: "Needs cleanup"  };
  return        { status: prefix, headline: "Tough table read.",                   copy: deadness >= 60 ? `Too much dead weight survived. The right play was cleanup, not optimism.` : `This rack needed patience. Protect structure and wait for a cleaner signal.`, tag: "Hard rack"      };
}

// ── Share text builder ────────────────────────────────────────────────────────

export function buildShareText({
  score,
  dayNum,
  globalRank,
  clubRank,
  clubName,
  streak,
  url,
  mode = "daily",
  archetype,
  headline,
} = {}) {
  const n = Number(score || 0);
  const tier = archetype || getIQTier(n)?.level || "Table read";
  const playUrl = url || "https://playrackle.com";
  const isPractice = mode === "practice";
  const lines = [];

  if (isPractice) {
    lines.push(`I just played a Rackle practice hand and scored ${n}.`);
    lines.push("");
    lines.push(headline || `${tier}.`);
    lines.push("Try a practice rack:");
    lines.push(playUrl);
    return lines.join("\n");
  }

  const dailyLabel = dayNum ? `today’s Rackle #${dayNum}` : "today’s Rackle";
  if (clubName) lines.push(`I scored ${n} on ${dailyLabel} for ${clubName}.`);
  else lines.push(`I scored ${n} on ${dailyLabel}.`);

  lines.push("");
  lines.push(`Charleston read: ${tier}.`);

  if (globalRank) lines.push(`Global rank: #${globalRank}.`);
  if (clubRank && clubName) lines.push(`Current club rank: #${clubRank}.`);
  else if (clubRank) lines.push(`Club rank: #${clubRank}.`);
  if (streak > 1) lines.push(`${streak}-day streak.`);

  lines.push("");
  lines.push(globalRank ? "Can you beat my Charleston read?" : "Can you beat my table read?");
  lines.push("");
  lines.push("Play today’s Rackle:");
  lines.push(playUrl);
  return lines.join("\n");
}

export function buildClubInviteText({ clubName, clubUrl }) {
  return [
    `Our Mahjong group${clubName ? ` at ${clubName}` : ""} is trying Rackle, a daily Charleston challenge.`,
    ``,
    `Play today’s rack and compare your table read:`,
    clubUrl || "https://playrackle.com",
  ].join("\n");
}
