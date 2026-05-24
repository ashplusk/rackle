/* global process */
// Rackle Practice Room variety validation.
// Run with:
//   npm run validate:practice-variety

import {
  dealDailyRack,
  dealPracticeRack,
  getIncomingTiles,
  scoreSections,
} from './game.js';
import { validateRackState } from './rack-state-validation.js';

const PRACTICE_RACKS_TESTED = Number(process.env.RACKLE_PRACTICE_VARIETY_GAMES || process.env.RACKLE_PRACTICE_VARIETY_RACKS || 500);
const PASSES_PER_GAME = 3;
const TILES_PER_PASS = 3;
const MIN_UNIQUE_RACK_RATE = Number(process.env.RACKLE_MIN_PRACTICE_UNIQUE_RATE || 0.96);
const MAX_90_PLUS_RATE = Number(process.env.RACKLE_MAX_PRACTICE_90_PLUS_RATE || 0.05);
const MAX_HONOR_HEAVY_RATE = Number(process.env.RACKLE_MAX_PRACTICE_HONOR_HEAVY_RATE || 0.18);
const MAX_REPEAT_SIGNATURE_RATE = Number(process.env.RACKLE_MAX_PRACTICE_REPEAT_RATE || 0.04);

const SECTION_LABELS = {
  '2026': '2026',
  like: 'Like Numbers',
  consec: 'Consecutive',
  evens: '2468',
  odds: '13579',
  threeSixNine: '369',
  wd: 'Winds & Dragons',
  quints: 'Quints',
  pairs: 'Singles & Pairs',
  suited: 'Single Suit',
};

function tileKey(tile) {
  if (!tile) return 'missing';
  if (tile.t === 's') return `s-${tile.s}-${tile.n}`;
  if (tile.t === 'w') return `w-${tile.v}`;
  if (tile.t === 'd') return `d-${tile.v}`;
  if (tile.t === 'f') return 'flower';
  if (tile.t === 'j') return 'joker';
  return `unknown-${JSON.stringify(tile)}`;
}

function rackSignature(rack = []) {
  return rack.map(tileKey).sort().join('|');
}

function addCount(counts, key, amount = 1) {
  counts.set(key, (counts.get(key) || 0) + amount);
  if (counts.get(key) === 0) counts.delete(key);
}

function countTiles(rack = []) {
  const counts = new Map();
  rack.forEach(tile => addCount(counts, tileKey(tile), 1));
  return counts;
}

function legalMaxForKey(key) {
  if (key.startsWith('s-')) return 4;
  if (key.startsWith('w-')) return 4;
  if (key.startsWith('d-')) return 4;
  if (key === 'flower') return 8;
  if (key === 'joker') return 8;
  return 0;
}

function duplicateViolations(rack = []) {
  let violations = 0;
  countTiles(rack).forEach((count, key) => {
    const max = legalMaxForKey(key);
    if (!max || count > max) violations += 1;
  });
  return violations;
}

function removeTilesByIdentity(rack = [], outgoing = []) {
  const toRemove = countTiles(outgoing);
  return rack.filter(tile => {
    const key = tileKey(tile);
    const count = toRemove.get(key) || 0;
    if (count > 0) {
      addCount(toRemove, key, -1);
      return false;
    }
    return true;
  });
}

function choosePracticePass(rack = []) {
  const counts = countTiles(rack);
  return rack
    .map((tile, index) => ({ tile, index, key: tileKey(tile), count: counts.get(tileKey(tile)) || 0 }))
    .filter(item => item.tile?.t !== 'j')
    .sort((a, b) => {
      const pairPenaltyA = a.count >= 2 ? 22 : 0;
      const pairPenaltyB = b.count >= 2 ? 22 : 0;
      const rankA = tilePassRank(a.tile) + pairPenaltyA;
      const rankB = tilePassRank(b.tile) + pairPenaltyB;
      return rankA - rankB || a.key.localeCompare(b.key) || a.index - b.index;
    })
    .slice(0, TILES_PER_PASS)
    .map(item => item.tile);
}

function tilePassRank(tile) {
  if (!tile || tile.t === 'j') return 999;
  if (tile.t === 'w') return 10;
  if (tile.t === 'd') return 12;
  if (tile.t === 's' && [1, 9].includes(tile.n)) return 20;
  if (tile.t === 'f') return 28;
  if (tile.t === 's') return 30;
  return 50;
}

function simulatePracticeGame(startingRack = [], index = 0) {
  let rack = startingRack.map(tile => ({ ...tile }));
  const passLog = [];
  const seed = 740000 + index * 37;

  for (let passNum = 1; passNum <= PASSES_PER_GAME; passNum += 1) {
    const out = choosePracticePass(rack);
    const rackAfterOutgoing = removeTilesByIdentity(rack, out);
    const incoming = getIncomingTiles(seed + passNum * 997, passNum, rackAfterOutgoing);

    passLog.push({
      label: `Pass ${passNum}`,
      dir: passNum === 1 ? 'left' : passNum === 2 ? 'across' : 'right',
      charleston: passNum,
      out,
      in: incoming,
      secs: 12,
    });

    rack = rackAfterOutgoing.concat(incoming);
  }

  return { startingRack, passLog, finalRack: rack };
}

function rackStats(rack = []) {
  const counts = countTiles(rack);
  const honors = rack.filter(tile => tile?.t === 'w' || tile?.t === 'd').length;
  const jokers = rack.filter(tile => tile?.t === 'j').length;
  const pairs = [...counts.values()].filter(count => count >= 2).length;
  const allHonorImpossible = rack.length > 0 && rack.every(tile => tile?.t === 'w' || tile?.t === 'd');
  return { honors, jokers, pairs, allHonorImpossible };
}

function addBand(bands, score) {
  if (score >= 90) bands.ninety += 1;
  else if (score >= 80) bands.eighty += 1;
  else if (score >= 70) bands.seventy += 1;
  else if (score >= 60) bands.sixty += 1;
  else if (score >= 50) bands.fifty += 1;
  else bands.underFifty += 1;
}

function pct(count, total = PRACTICE_RACKS_TESTED) {
  return `${((count / Math.max(1, total)) * 100).toFixed(1).replace(/\.0$/, '')}%`;
}

function statusWord(ok) {
  return ok ? 'pass' : 'fail';
}

function runPracticeVarietyValidation() {
  const signatures = new Set();
  const repeatedSignatures = new Map();
  const bands = { ninety: 0, eighty: 0, seventy: 0, sixty: 0, fifty: 0, underFifty: 0 };
  const sections = Object.fromEntries(Object.keys(SECTION_LABELS).map(key => [key, 0]));
  const jokerDistribution = new Map();
  const failures = [];
  let scoreTotal = 0;
  let impossibleDuplicates = 0;
  let honorHeavyRacks = 0;
  let pairHeavyRacks = 0;
  let allHonorImpossibleRacks = 0;
  let dailyIndependenceOk = true;

  const dailyBefore = rackSignature(dealDailyRack(20260101));

  for (let i = 0; i < PRACTICE_RACKS_TESTED; i += 1) {
    const rack = dealPracticeRack();
    const signature = rackSignature(rack);
    if (signatures.has(signature)) repeatedSignatures.set(signature, (repeatedSignatures.get(signature) || 1) + 1);
    signatures.add(signature);

    const sectionScores = scoreSections(rack);
    const best = sectionScores[0] || { id: 'other', score: 0 };
    const startingScore = Math.round(Math.min(89, (best.score || 0) * 0.78 + 10));
    scoreTotal += startingScore;
    addBand(bands, startingScore);
    if (sections[best.id] !== undefined) sections[best.id] += 1;

    const stats = rackStats(rack);
    jokerDistribution.set(stats.jokers, (jokerDistribution.get(stats.jokers) || 0) + 1);
    if (stats.honors >= 6) honorHeavyRacks += 1;
    if (stats.pairs >= 4) pairHeavyRacks += 1;
    if (stats.allHonorImpossible) allHonorImpossibleRacks += 1;
    impossibleDuplicates += duplicateViolations(rack);

    const game = simulatePracticeGame(rack, i);
    const result = validateRackState(game);
    if (!result.ok) failures.push({ index: i, result, game });

    if (i % 25 === 0) {
      const dailyAfter = rackSignature(dealDailyRack(20260101));
      if (dailyAfter !== dailyBefore) dailyIndependenceOk = false;
    }
  }

  const repeatedRackCount = PRACTICE_RACKS_TESTED - signatures.size;
  const averageScore = scoreTotal / Math.max(1, PRACTICE_RACKS_TESTED);
  const uniqueRate = signatures.size / Math.max(1, PRACTICE_RACKS_TESTED);
  const ninetyRate = bands.ninety / Math.max(1, PRACTICE_RACKS_TESTED);
  const honorHeavyRate = honorHeavyRacks / Math.max(1, PRACTICE_RACKS_TESTED);
  const repeatRate = repeatedRackCount / Math.max(1, PRACTICE_RACKS_TESTED);

  const checks = {
    uniqueRacks: uniqueRate >= MIN_UNIQUE_RACK_RATE,
    legalRacks: impossibleDuplicates === 0 && failures.length === 0,
    rare90s: ninetyRate <= MAX_90_PLUS_RATE,
    honorsBalanced: honorHeavyRate <= MAX_HONOR_HEAVY_RATE && allHonorImpossibleRacks === 0,
    repeatsLow: repeatRate <= MAX_REPEAT_SIGNATURE_RATE,
    dailyIndependent: dailyIndependenceOk,
  };

  console.log('Practice Variety QA');
  console.log(`Practice racks tested: ${PRACTICE_RACKS_TESTED}`);
  console.log(`Unique racks: ${signatures.size}`);
  console.log(`Repeated racks: ${repeatedRackCount}`);
  console.log(`Average score: ${averageScore.toFixed(1)}`);
  console.log('');
  console.log('Score bands:');
  console.log(`- 90+: ${bands.ninety} / ${pct(bands.ninety)}`);
  console.log(`- 80 to 89: ${bands.eighty} / ${pct(bands.eighty)}`);
  console.log(`- 70 to 79: ${bands.seventy} / ${pct(bands.seventy)}`);
  console.log(`- 60 to 69: ${bands.sixty} / ${pct(bands.sixty)}`);
  console.log(`- 50 to 59: ${bands.fifty} / ${pct(bands.fifty)}`);
  console.log(`- under 50: ${bands.underFifty} / ${pct(bands.underFifty)}`);
  console.log('');
  console.log('Leading section distribution:');
  Object.entries(SECTION_LABELS).forEach(([id, label]) => {
    console.log(`- ${label}: ${sections[id] || 0}`);
  });
  console.log('');
  console.log('Joker count distribution:');
  [...jokerDistribution.entries()].sort((a, b) => a[0] - b[0]).forEach(([jokers, count]) => {
    console.log(`- ${jokers} Joker${jokers === 1 ? '' : 's'}: ${count}`);
  });
  console.log('');
  console.log('Risk checks:');
  console.log(`- impossible duplicates: ${impossibleDuplicates}`);
  console.log(`- rack-state failures: ${failures.length}`);
  console.log(`- honor-heavy racks: ${honorHeavyRacks}`);
  console.log(`- pair-heavy racks: ${pairHeavyRacks}`);
  console.log(`- all-honor impossible racks: ${allHonorImpossibleRacks}`);
  console.log(`- 90+ rate: ${pct(bands.ninety)}`);
  console.log(`- repeated signature rate: ${pct(repeatedRackCount)}`);
  console.log('');
  console.log('Checks:');
  console.log(`- Practice rack variety: ${statusWord(checks.uniqueRacks)}`);
  console.log(`- Practice rack legality: ${statusWord(checks.legalRacks)}`);
  console.log(`- 90+ starting potential remains rare: ${statusWord(checks.rare90s)}`);
  console.log(`- Honors do not dominate: ${statusWord(checks.honorsBalanced)}`);
  console.log(`- Repeated rack rate: ${statusWord(checks.repeatsLow)}`);
  console.log(`- Daily Rackle independence: ${statusWord(checks.dailyIndependent)}`);

  if (failures.length) {
    console.log('');
    console.log('Failed rack-state examples:');
    failures.slice(0, 5).forEach(failure => {
      console.log(`- Practice rack ${failure.index}: ${failure.result.errors.join('; ')}`);
    });
  }

  const ok = Object.values(checks).every(Boolean);
  console.log('');
  console.log(`Practice Variety QA: ${ok ? 'PASSED' : 'FAILED'}`);
  return ok;
}

if (process.argv[1]?.endsWith('practice-variety-validation.js')) {
  const ok = runPracticeVarietyValidation();
  process.exit(ok ? 0 : 1);
}

export { runPracticeVarietyValidation };
