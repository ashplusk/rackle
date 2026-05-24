/* global process */
// Rackle score distribution validation.
// Run with:
//   npm run validate:score-distribution

import {
  calculateIQCore,
  dealDailyRack,
  getIncomingTiles,
  scoreSections,
  analyzeRackSignals,
  seededShuffle,
} from './game.js';

const GAMES_PER_MODE = Number(process.env.RACKLE_SCORE_DISTRIBUTION_GAMES || 25);
const WORKER_CHUNK_SIZE = Number(process.env.RACKLE_SCORE_DISTRIBUTION_CHUNK || 1000);
const PASSES_PER_GAME = 3;
const TILES_PER_PASS = 3;

const MODE_CONFIGS = [
  { id: 'random', label: 'Random legal pass', randomWeight: 1 },
  { id: 'expert', label: 'Expert-ish pass', randomWeight: 0 },
  { id: 'mixed', label: 'Mixed pass', randomWeight: 0.5 },
];

const GUARDRAILS = {
  random: { max90Plus: 2, max80Plus: 15 },
  expert: { max90Plus: 5, max80Plus: 35 },
  mixed: { max90Plus: 3, max80Plus: 25 },
  randomHighConfidenceMax: 35,
};

function lcg(seed) {
  let state = Math.max(1, Math.abs(Math.floor(Number(seed) || 1)) % 2147483647);
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function dailySeedFromOffset(offset) {
  const base = new Date(Date.UTC(2026, 0, 1));
  base.setUTCDate(base.getUTCDate() + offset);
  return base.getUTCFullYear() * 10000 + (base.getUTCMonth() + 1) * 100 + base.getUTCDate();
}

function tileKey(tile) {
  if (!tile) return 'missing';
  if (tile.t === 's') return `s-${tile.s}-${tile.n}`;
  if (tile.t === 'w') return `w-${tile.v}`;
  if (tile.t === 'd') return `d-${tile.v}`;
  if (tile.t === 'f') return 'flower';
  if (tile.t === 'j') return 'joker';
  return `unknown-${JSON.stringify(tile)}`;
}

function freqMap(rack = []) {
  return rack.reduce((acc, tile) => {
    const key = tileKey(tile);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function pct(count, total) {
  return Number(((count / Math.max(1, total)) * 100).toFixed(1));
}

function median(values = []) {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1));
}

function removeTilesByIdentity(rack = [], outgoing = []) {
  const toRemove = new Map();
  outgoing.forEach(tile => {
    const key = tileKey(tile);
    toRemove.set(key, (toRemove.get(key) || 0) + 1);
  });

  return rack.filter(tile => {
    const key = tileKey(tile);
    const count = toRemove.get(key) || 0;
    if (count > 0) {
      toRemove.set(key, count - 1);
      return false;
    }
    return true;
  });
}

function supportTileForSection(tile, sectionId, rack = [], sig = analyzeRackSignals(rack)) {
  if (!tile) return false;
  if (tile.t === 'j') return sectionId !== 'pairs';
  if (sectionId === '2026') return tile.t === 'f' || (tile.t === 'd' && tile.v === 'Soap') || (tile.t === 's' && [2, 6].includes(tile.n));
  if (sectionId === 'evens') return tile.t === 's' && [2, 4, 6, 8].includes(tile.n);
  if (sectionId === 'odds') return (tile.t === 's' && [1, 3, 5, 7, 9].includes(tile.n)) || tile.t === 'f';
  if (sectionId === 'threeSixNine') return (tile.t === 's' && [3, 6, 9].includes(tile.n)) || tile.t === 'd';
  if (sectionId === 'wd') return tile.t === 'w' || tile.t === 'd' || (tile.t === 'f' && sig.flowers >= 2);
  if (sectionId === 'suited') return (tile.t === 's' && tile.s === sig.dominantSuit) || tile.t === 'f';
  if (sectionId === 'like') return tile.t === 's' && tile.n === sig.bestLikeNumber;
  if (sectionId === 'consec') {
    if (tile.t !== 's') return false;
    const suited = rack.filter(t => t?.t === 's');
    let bestSuit = sig.dominantSuit;
    let bestStart = null;
    let bestCount = -1;
    ['bam', 'crak', 'dot'].forEach(suit => {
      for (let start = 1; start <= 7; start += 1) {
        const total = suited.filter(t => t.s === suit && t.n >= start && t.n <= start + 2).length;
        if (total > bestCount) {
          bestCount = total;
          bestSuit = suit;
          bestStart = start;
        }
      }
    });
    return tile.s === bestSuit && bestStart && tile.n >= bestStart && tile.n <= bestStart + 2;
  }
  if (sectionId === 'quints') return (freqMap(rack)[tileKey(tile)] || 0) >= 2;
  if (sectionId === 'pairs') return (freqMap(rack)[tileKey(tile)] || 0) >= 2 || tile.t === 'f';
  return false;
}

function tileValueForExpertPass(tile, rack = []) {
  if (!tile) return 999;
  if (tile.t === 'j') return 999;

  const sections = scoreSections(rack).slice(0, 3);
  const topTwo = sections.slice(0, 2);
  const sig = analyzeRackSignals(rack);
  const freq = freqMap(rack);
  const count = freq[tileKey(tile)] || 0;
  const supports = topTwo.filter(section => supportTileForSection(tile, section.id, rack, sig));
  const supportsPrimary = supports.some(section => section.id === topTwo[0]?.id);
  const supportsAny = supports.length > 0;

  let value = 20;

  if (supportsPrimary) value += 34;
  else if (supportsAny) value += 18;

  if (count >= 4) value += 42;
  else if (count >= 3) value += 34;
  else if (count >= 2) value += supportsAny ? 30 : 12;

  if (tile.t === 'f') {
    value += ['2026', 'pairs'].some(id => topTwo.some(section => section.id === id)) ? 26 : 4;
  }

  if (tile.t === 'd' && tile.v === 'Soap') {
    value += topTwo.some(section => section.id === '2026') ? 30 : 2;
  }

  if (tile.t === 'w' || tile.t === 'd') {
    if (topTwo.some(section => section.id === 'wd')) value += 28;
    if (count <= 1 && !supportsAny) value -= 14;
  }

  if (tile.t === 's') {
    if (tile.s === sig.dominantSuit && sig.dominantSuitCount >= 6) value += 10;
    if (!supportsAny && count <= 1 && tile.s !== sig.dominantSuit) value -= 6;
  }

  return value;
}

function chooseRandomLegalPass(rack = [], rng) {
  const legal = rack.filter(tile => tile?.t !== 'j');
  const shuffled = [...legal];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, TILES_PER_PASS);
}

function chooseExpertishPass(rack = [], seed) {
  const ranked = rack
    .filter(tile => tile?.t !== 'j')
    .map((tile, index) => ({ tile, index, value: tileValueForExpertPass(tile, rack) }))
    .sort((a, b) => (a.value - b.value) || (a.index - b.index));

  // Use seeded shuffle only as a stable tie-breaker among equally weak tiles.
  const tieSeed = Math.max(1, Number(seed) || 1);
  const groups = new Map();
  ranked.forEach(item => {
    const key = Math.round(item.value / 4) * 4;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });

  const stableRanked = [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .flatMap(([key, items]) => seededShuffle(items, tieSeed + key).map(item => item));

  return stableRanked.slice(0, TILES_PER_PASS).map(item => item.tile);
}

function choosePassForMode(modeConfig, rack, seed, passNum) {
  const rng = lcg(seed + passNum * 131 + modeConfig.id.length * 97);
  if (modeConfig.randomWeight === 1) return chooseRandomLegalPass(rack, rng);
  if (modeConfig.randomWeight === 0) return chooseExpertishPass(rack, seed + passNum * 1009);
  if (modeConfig.id === 'mixed') {
    return ((seed + passNum * 17) % 2 === 0)
      ? chooseRandomLegalPass(rack, rng)
      : chooseExpertishPass(rack, seed + passNum * 1009);
  }
  return rng() < modeConfig.randomWeight
    ? chooseRandomLegalPass(rack, rng)
    : chooseExpertishPass(rack, seed + passNum * 1009);
}

function scoreBand(score) {
  if (score >= 90) return '90Plus';
  if (score >= 80) return '80to89';
  if (score >= 70) return '70to79';
  if (score >= 60) return '60to69';
  if (score >= 50) return '50to59';
  return 'under50';
}

function normalizeConfidence(value = '') {
  const v = String(value).toLowerCase();
  if (v.includes('high')) return 'high';
  if (v.includes('medium')) return 'medium';
  if (v.includes('low')) return 'low';
  return 'unknown';
}

function passQualityAverage(result = {}) {
  const scores = (result.passAnalysis || []).map(pass => Number(pass.score || pass.passQualityScore || 0)).filter(Number.isFinite);
  if (!scores.length) return Number(result.passQuality ?? result.passQualityScore ?? 0);
  return Number((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(1));
}

function passQualityBucket(result = {}) {
  const score = passQualityAverage(result);
  if (score >= 80) return 'strong';
  if (score >= 64) return 'mixed';
  return 'weak';
}

function simulateGame(modeConfig, index) {
  const seed = dailySeedFromOffset(index);
  const startingRack = dealDailyRack(seed);
  let rack = [...startingRack];
  const passLog = [];

  for (let passNum = 1; passNum <= PASSES_PER_GAME; passNum += 1) {
    const out = choosePassForMode(modeConfig, rack, seed, passNum);
    const rackAfterOutgoing = removeTilesByIdentity(rack, out);
    const incoming = getIncomingTiles(seed, passNum, rackAfterOutgoing) || [];
    passLog.push({
      label: `Pass ${passNum}`,
      dir: passNum === 1 ? 'left' : passNum === 2 ? 'across' : 'right',
      charleston: passNum,
      out,
      in: incoming,
      secs: modeConfig.id === 'expert' ? 18 : modeConfig.id === 'mixed' ? 14 : 9,
    });
    rack = rackAfterOutgoing.concat(incoming.filter(tile => tile?.t !== 'j'));
  }

  const chosenSection = scoreSections(startingRack)[0]?.id || null;
  const result = calculateIQCore(startingRack, passLog, rack, chosenSection);
  const score = Number(result.rackleIQ ?? result.totalScore ?? result.iqScore ?? 0);

  return {
    seed,
    score,
    confidence: normalizeConfidence(result.confidenceRating || result.confidence?.rating),
    confidenceRating: result.confidenceRating || result.confidence?.rating || 'Unknown',
    chosenSection,
    bestPath: result.bestPaths?.[0]?.sectionId || result.bestPaths?.[0]?.section || chosenSection,
    cap: result.scoreCeiling,
    receiveLuck: result.receiveLuck,
    highReceiveLuck: Number(result.receiveLuck || 0) >= 70,
    passQuality: passQualityBucket(result),
    passQualityScore: passQualityAverage(result),
    decisionScore: Number(result.decisionScore ?? 0),
    outcomeScore: Number(result.outcomeScore ?? 0),
    outgoingHadJoker: passLog.some(pass => pass.out.some(tile => tile?.t === 'j')),
  };
}

function summarizeMode(modeConfig, startIndex = 0, count = GAMES_PER_MODE) {
  const rows = [];
  const bands = { '90Plus': 0, '80to89': 0, '70to79': 0, '60to69': 0, '50to59': 0, under50: 0 };
  const confidence = { high: 0, medium: 0, low: 0, unknown: 0 };
  const passQuality = { strong: 0, mixed: 0, weak: 0 };
  let highReceiveLuck = 0;
  let outgoingJokers = 0;

  for (let offset = 0; offset < count; offset += 1) {
    const row = simulateGame(modeConfig, startIndex + offset);
    rows.push(row);
    bands[scoreBand(row.score)] += 1;
    confidence[row.confidence] = (confidence[row.confidence] || 0) + 1;
    passQuality[row.passQuality] = (passQuality[row.passQuality] || 0) + 1;
    if (row.highReceiveLuck) highReceiveLuck += 1;
    if (row.outgoingHadJoker) outgoingJokers += 1;
  }

  const scores = rows.map(row => row.score);
  const average = Number((scores.reduce((sum, value) => sum + value, 0) / Math.max(1, scores.length)).toFixed(1));
  const bandPct = Object.fromEntries(Object.entries(bands).map(([key, value]) => [key, pct(value, rows.length)]));

  return {
    mode: modeConfig.id,
    label: modeConfig.label,
    sampleSize: rows.length,
    rows,
    bands,
    bandPct,
    confidence,
    confidencePct: Object.fromEntries(Object.entries(confidence).map(([key, value]) => [key, pct(value, rows.length)])),
    passQuality,
    passQualityPct: Object.fromEntries(Object.entries(passQuality).map(([key, value]) => [key, pct(value, rows.length)])),
    average,
    median: median(scores),
    highReceiveLuck,
    outgoingJokers,
    eightyPlusRate: pct(bands['90Plus'] + bands['80to89'], rows.length),
    ninetyPlusRate: pct(bands['90Plus'], rows.length),
  };
}

function formatCountPercent(count, total) {
  return `${count} / ${pct(count, total)}%`;
}

function printModeSummary(summary) {
  console.log(`\n${summary.label}:`);
  console.log(`- 90+: ${formatCountPercent(summary.bands['90Plus'], GAMES_PER_MODE)}`);
  console.log(`- 80 to 89: ${formatCountPercent(summary.bands['80to89'], GAMES_PER_MODE)}`);
  console.log(`- 70 to 79: ${formatCountPercent(summary.bands['70to79'], GAMES_PER_MODE)}`);
  console.log(`- 60 to 69: ${formatCountPercent(summary.bands['60to69'], GAMES_PER_MODE)}`);
  console.log(`- 50 to 59: ${formatCountPercent(summary.bands['50to59'], GAMES_PER_MODE)}`);
  console.log(`- under 50: ${formatCountPercent(summary.bands.under50, GAMES_PER_MODE)}`);
  console.log(`- average score: ${summary.average}`);
  console.log(`- median score: ${summary.median}`);
  console.log(`- high confidence: ${formatCountPercent(summary.confidence.high, GAMES_PER_MODE)}`);
  console.log(`- medium confidence: ${formatCountPercent(summary.confidence.medium, GAMES_PER_MODE)}`);
  console.log(`- low confidence: ${formatCountPercent(summary.confidence.low, GAMES_PER_MODE)}`);
  console.log(`- high receive luck: ${formatCountPercent(summary.highReceiveLuck, GAMES_PER_MODE)}`);
  console.log(`- strong pass quality: ${formatCountPercent(summary.passQuality.strong, GAMES_PER_MODE)}`);
  console.log(`- mixed pass quality: ${formatCountPercent(summary.passQuality.mixed, GAMES_PER_MODE)}`);
  console.log(`- weak pass quality: ${formatCountPercent(summary.passQuality.weak, GAMES_PER_MODE)}`);
}

function runReport(summaries) {
  const byMode = Object.fromEntries(summaries.map(summary => [summary.mode, summary]));
  const failures = [];
  const warnings = [];

  Object.values(byMode).forEach(summary => {
    const guardrail = GUARDRAILS[summary.mode];
    if (summary.ninetyPlusRate > guardrail.max90Plus) {
      failures.push(`${summary.label} 90+ rate is inflated: ${summary.ninetyPlusRate}% > ${guardrail.max90Plus}%.`);
    }
    if (summary.eightyPlusRate > guardrail.max80Plus) {
      failures.push(`${summary.label} 80+ rate is inflated: ${summary.eightyPlusRate}% > ${guardrail.max80Plus}%.`);
    }
    if (summary.outgoingJokers > 0) {
      failures.push(`${summary.label} passed ${summary.outgoingJokers} Jokers. Jokers must never be passed.`);
    }
  });

  if (byMode.random.confidencePct.high > GUARDRAILS.randomHighConfidenceMax) {
    failures.push(`High confidence dominates random mode: ${byMode.random.confidencePct.high}% > ${GUARDRAILS.randomHighConfidenceMax}%.`);
  }

  if (byMode.expert.average <= byMode.random.average) {
    failures.push(`Expert-ish average score (${byMode.expert.average}) did not beat random average (${byMode.random.average}).`);
  }

  const mixedBetween = byMode.mixed.average >= Math.min(byMode.random.average, byMode.expert.average) - 1 &&
    byMode.mixed.average <= Math.max(byMode.random.average, byMode.expert.average) + 1;
  if (!mixedBetween) {
    warnings.push(`Mixed average score (${byMode.mixed.average}) did not sit cleanly between random (${byMode.random.average}) and expert-ish (${byMode.expert.average}).`);
  }

  if (byMode.random.confidencePct.medium < 20) {
    warnings.push(`Medium confidence is uncommon in random mode: ${byMode.random.confidencePct.medium}%.`);
  }
  if (byMode.random.confidence.low === 0) {
    warnings.push('Low confidence did not appear in random mode. Review scattered/wrong-direction sensitivity if this persists.');
  }

  console.log('\nScore Distribution QA');
  console.log(`Games per mode: ${GAMES_PER_MODE}`);
  summaries.forEach(printModeSummary);

  console.log('\nInflation checks:');
  console.log(`- Random 90+ rate: ${byMode.random.ninetyPlusRate}% / max ${GUARDRAILS.random.max90Plus}% ${byMode.random.ninetyPlusRate <= GUARDRAILS.random.max90Plus ? 'pass' : 'fail'}`);
  console.log(`- Expert 90+ rate: ${byMode.expert.ninetyPlusRate}% / max ${GUARDRAILS.expert.max90Plus}% ${byMode.expert.ninetyPlusRate <= GUARDRAILS.expert.max90Plus ? 'pass' : 'fail'}`);
  console.log(`- Mixed 90+ rate: ${byMode.mixed.ninetyPlusRate}% / max ${GUARDRAILS.mixed.max90Plus}% ${byMode.mixed.ninetyPlusRate <= GUARDRAILS.mixed.max90Plus ? 'pass' : 'fail'}`);
  console.log(`- Random 80+ rate: ${byMode.random.eightyPlusRate}% / max ${GUARDRAILS.random.max80Plus}% ${byMode.random.eightyPlusRate <= GUARDRAILS.random.max80Plus ? 'pass' : 'fail'}`);
  console.log(`- Expert 80+ rate: ${byMode.expert.eightyPlusRate}% / max ${GUARDRAILS.expert.max80Plus}% ${byMode.expert.eightyPlusRate <= GUARDRAILS.expert.max80Plus ? 'pass' : 'fail'}`);
  console.log(`- Mixed 80+ rate: ${byMode.mixed.eightyPlusRate}% / max ${GUARDRAILS.mixed.max80Plus}% ${byMode.mixed.eightyPlusRate <= GUARDRAILS.mixed.max80Plus ? 'pass' : 'fail'}`);

  console.log('\nConfidence checks:');
  console.log(`- Random high confidence: ${byMode.random.confidencePct.high}% / max ${GUARDRAILS.randomHighConfidenceMax}% ${byMode.random.confidencePct.high <= GUARDRAILS.randomHighConfidenceMax ? 'pass' : 'fail'}`);
  console.log(`- Random medium confidence: ${byMode.random.confidencePct.medium}%`);
  console.log(`- Random low confidence: ${byMode.random.confidencePct.low}%`);

  if (warnings.length) {
    console.warn('\nWarnings:');
    warnings.forEach(warning => console.warn(`- ${warning}`));
  }

  if (failures.length) {
    console.error('\nScore Distribution QA: FAILED');
    failures.forEach(failure => console.error(`- ${failure}`));

    const largestScores = Object.values(byMode)
      .flatMap(summary => summary.rows.map(row => ({ ...row, mode: summary.label })))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(row => ({
        mode: row.mode,
        seed: row.seed,
        score: row.score,
        confidence: row.confidenceRating,
        chosenSection: row.chosenSection,
        bestPath: row.bestPath,
        decisionScore: row.decisionScore,
        outcomeScore: row.outcomeScore,
        receiveLuck: row.receiveLuck,
        passQualityScore: row.passQualityScore,
        cap: row.cap,
      }));

    console.error('\nHighest score samples:');
    console.error(JSON.stringify(largestScores, null, 2));
    return false;
  }

  console.log('\nScore Distribution QA: PASSED');
  console.log('90+ scores remain rare, 80+ scores do not dominate, and expert-ish passing beats random passing without inflating the top bands.');
  return true;
}

function mergeModeSummaries(modeConfig, chunks = []) {
  const rows = chunks.flatMap(chunk => chunk.rows || []);
  const bands = { '90Plus': 0, '80to89': 0, '70to79': 0, '60to69': 0, '50to59': 0, under50: 0 };
  const confidence = { high: 0, medium: 0, low: 0, unknown: 0 };
  const passQuality = { strong: 0, mixed: 0, weak: 0 };
  let highReceiveLuck = 0;
  let outgoingJokers = 0;

  chunks.forEach(chunk => {
    Object.keys(bands).forEach(key => { bands[key] += chunk.bands?.[key] || 0; });
    Object.keys(confidence).forEach(key => { confidence[key] += chunk.confidence?.[key] || 0; });
    Object.keys(passQuality).forEach(key => { passQuality[key] += chunk.passQuality?.[key] || 0; });
    highReceiveLuck += chunk.highReceiveLuck || 0;
    outgoingJokers += chunk.outgoingJokers || 0;
  });

  const scores = rows.map(row => row.score);
  const average = Number((scores.reduce((sum, value) => sum + value, 0) / Math.max(1, scores.length)).toFixed(1));

  return {
    mode: modeConfig.id,
    label: modeConfig.label,
    sampleSize: rows.length,
    rows,
    bands,
    bandPct: Object.fromEntries(Object.entries(bands).map(([key, value]) => [key, pct(value, rows.length)])),
    confidence,
    confidencePct: Object.fromEntries(Object.entries(confidence).map(([key, value]) => [key, pct(value, rows.length)])),
    passQuality,
    passQualityPct: Object.fromEntries(Object.entries(passQuality).map(([key, value]) => [key, pct(value, rows.length)])),
    average,
    median: median(scores),
    highReceiveLuck,
    outgoingJokers,
    eightyPlusRate: pct(bands['90Plus'] + bands['80to89'], rows.length),
    ninetyPlusRate: pct(bands['90Plus'], rows.length),
  };
}

function runModeSequential(modeConfig) {
  const chunks = [];
  for (let startIndex = 0; startIndex < GAMES_PER_MODE; startIndex += WORKER_CHUNK_SIZE) {
    chunks.push(summarizeMode(modeConfig, startIndex, Math.min(WORKER_CHUNK_SIZE, GAMES_PER_MODE - startIndex)));
  }
  return mergeModeSummaries(modeConfig, chunks);
}

export function runScoreDistributionValidation() {
  const summaries = MODE_CONFIGS.map(runModeSequential);
  const orderedSummaries = MODE_CONFIGS.map(mode => summaries.find(summary => summary.mode === mode.id));
  return runReport(orderedSummaries);
}

if (process.argv[1]?.endsWith('score-distribution-validation.js')) {
  const ok = runScoreDistributionValidation();
  process.exit(ok ? 0 : 1);
}
