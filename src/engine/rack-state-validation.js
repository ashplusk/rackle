/* global process */
// Rackle rack state validation.
// Run with:
//   npm run validate:rack-state

import {
  dealDailyRack,
  dealPracticeRack,
  getIncomingTiles,
} from './game.js';

const DAILY_GAMES = Number(process.env.RACKLE_RACK_STATE_DAILY_GAMES || 500);
const PRACTICE_GAMES = Number(process.env.RACKLE_RACK_STATE_PRACTICE_GAMES || 500);
const PASSES_PER_GAME = 3;
const TILES_PER_PASS = 3;

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

function tileLabel(tile) {
  if (!tile) return 'missing';
  if (tile.t === 's') return `${tile.n}${tile.s[0]}`;
  if (tile.t === 'w') return `${tile.v}W`;
  if (tile.t === 'd') return `${tile.v}D`;
  if (tile.t === 'f') return 'F';
  if (tile.t === 'j') return 'J';
  return JSON.stringify(tile);
}

function rackLabel(rack = []) {
  return rack.map(tileLabel).join(' ');
}

function legalMaxForKey(key) {
  if (key.startsWith('s-')) return 4;
  if (key.startsWith('w-')) return 4;
  if (key.startsWith('d-')) return 4;
  if (key === 'flower') return 8;
  if (key === 'joker') return 8;
  return 0;
}

function countTiles(tiles = []) {
  const counts = new Map();
  tiles.forEach(tile => {
    const key = tileKey(tile);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return counts;
}

function cloneCounts(counts = new Map()) {
  return new Map([...counts.entries()]);
}

function addCount(counts, key, amount = 1) {
  counts.set(key, (counts.get(key) || 0) + amount);
  if (counts.get(key) === 0) counts.delete(key);
}

function countsEqual(a = new Map(), b = new Map()) {
  const keys = new Set([...a.keys(), ...b.keys()]);
  for (const key of keys) {
    if ((a.get(key) || 0) !== (b.get(key) || 0)) return false;
  }
  return true;
}

function countDuplicateViolations(counts = new Map()) {
  let violations = 0;
  counts.forEach((count, key) => {
    const max = legalMaxForKey(key);
    if (!max || count > max) violations += 1;
  });
  return violations;
}

function legalLimitErrors(counts = new Map(), label = 'rack') {
  const errors = [];
  counts.forEach((count, key) => {
    const max = legalMaxForKey(key);
    if (!max) errors.push(`${label} has unknown tile key ${key}`);
    else if (count > max) errors.push(`${label} has ${count} copies of ${key}, max is ${max}`);
  });
  return errors;
}

function duplicateHeavyWarnings(finalCounts = new Map()) {
  const warnings = [];
  const suitedQuads = [...finalCounts.entries()].filter(([key, count]) => key.startsWith('s-') && count === 4);
  const honorQuads = [...finalCounts.entries()].filter(([key, count]) => (key.startsWith('w-') || key.startsWith('d-')) && count === 4);
  const flowerCount = finalCounts.get('flower') || 0;

  if (suitedQuads.length >= 2) warnings.push(`final rack has ${suitedQuads.length} suited quads`);
  if (honorQuads.length >= 2) warnings.push(`final rack has ${honorQuads.length} honor quads`);
  if (flowerCount >= 6) warnings.push(`final rack has ${flowerCount} flowers`);

  return warnings;
}

function isJoker(tile) {
  return tile?.t === 'j';
}

export function validateRackState({ startingRack = [], passLog = [], finalRack = [], inProgress = false } = {}) {
  const errors = [];
  const warnings = [];
  const realPasses = (passLog || []).filter(pass => pass?.dir !== 'courtesy');
  const startingCounts = countTiles(startingRack);
  const finalCounts = countTiles(finalRack);
  const runningCounts = cloneCounts(startingCounts);
  let outgoingTileCount = 0;
  let incomingTileCount = 0;
  let maxDuplicateViolations = countDuplicateViolations(startingCounts);

  if ((startingRack || []).length !== 13) errors.push(`starting rack has ${(startingRack || []).length} tiles, expected 13`);
  if (!inProgress && (finalRack || []).length !== 13) errors.push(`final rack has ${(finalRack || []).length} tiles, expected 13`);

  if (!inProgress && realPasses.length !== PASSES_PER_GAME) {
    errors.push(`complete game has ${realPasses.length} Charleston passes, expected ${PASSES_PER_GAME}`);
  }

  errors.push(...legalLimitErrors(startingCounts, 'starting rack'));

  realPasses.forEach((pass, index) => {
    const out = Array.isArray(pass.out) ? pass.out : [];
    const incoming = Array.isArray(pass.in) ? pass.in : [];
    const passLabel = pass.label || `pass ${index + 1}`;

    outgoingTileCount += out.length;
    incomingTileCount += incoming.length;

    if (out.length !== TILES_PER_PASS) errors.push(`${passLabel} sends ${out.length} tiles, expected 3`);
    if (incoming.length !== TILES_PER_PASS) errors.push(`${passLabel} receives ${incoming.length} tiles, expected 3`);
    if (out.some(isJoker)) errors.push(`${passLabel} sends a Joker`);
    if (incoming.some(isJoker)) errors.push(`${passLabel} receives a Joker`);

    out.forEach(tile => {
      const key = tileKey(tile);
      const current = runningCounts.get(key) || 0;
      if (current <= 0) errors.push(`${passLabel} sends unavailable tile ${key}`);
      else addCount(runningCounts, key, -1);
    });

    incoming.forEach(tile => {
      const key = tileKey(tile);
      addCount(runningCounts, key, 1);
    });

    maxDuplicateViolations = Math.max(maxDuplicateViolations, countDuplicateViolations(runningCounts));
    errors.push(...legalLimitErrors(runningCounts, `rack after ${passLabel}`));

    const runningTileCount = [...runningCounts.values()].reduce((sum, count) => sum + count, 0);
    if (runningTileCount !== 13) errors.push(`rack after ${passLabel} has ${runningTileCount} tiles, expected 13`);
  });

  errors.push(...legalLimitErrors(finalCounts, 'final rack'));
  warnings.push(...duplicateHeavyWarnings(finalCounts));

  if (!inProgress && !countsEqual(runningCounts, finalCounts)) {
    errors.push('final rack does not equal starting rack minus outgoing tiles plus incoming tiles');
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    summary: {
      startingTileCount: (startingRack || []).length,
      finalTileCount: (finalRack || []).length,
      passCount: realPasses.length,
      outgoingTileCount,
      incomingTileCount,
      maxDuplicateViolations,
    },
  };
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

function simplePassValue(tile) {
  if (!tile || tile.t === 'j') return 999;
  if (tile.t === 'w') return 18;
  if (tile.t === 'd') return 20;
  if (tile.t === 'f') return 28;
  const edgePenalty = tile.n === 1 || tile.n === 9 ? 0 : 6;
  return 30 + edgePenalty;
}

function chooseLegalPass(rack = []) {
  const counts = countTiles(rack);
  return rack
    .map((tile, index) => ({ tile, index, key: tileKey(tile), count: counts.get(tileKey(tile)) || 0 }))
    .filter(item => item.tile?.t !== 'j')
    .sort((a, b) => {
      const pairPenaltyA = a.count >= 2 ? 18 : 0;
      const pairPenaltyB = b.count >= 2 ? 18 : 0;
      return (simplePassValue(a.tile) + pairPenaltyA) - (simplePassValue(b.tile) + pairPenaltyB) || a.index - b.index;
    })
    .slice(0, TILES_PER_PASS)
    .map(item => item.tile);
}

function simulateCompleteGame({ mode, index }) {
  const seed = mode === 'daily' ? dailySeedFromOffset(index) : 930000 + index * 17;
  const startingRack = mode === 'daily'
    ? dealDailyRack(seed)
    : dealPracticeRack();
  let rack = [...startingRack];
  const passLog = [];

  for (let passNum = 1; passNum <= PASSES_PER_GAME; passNum += 1) {
    const out = chooseLegalPass(rack);
    const rackAfterOutgoing = removeTilesByIdentity(rack, out);
    const incomingSeed = mode === 'daily' ? seed : seed + passNum * 997;
    const incoming = getIncomingTiles(incomingSeed, passNum, rackAfterOutgoing);

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

  return { mode, seed, startingRack, passLog, finalRack: rack };
}

function updateCheckStatus(status, result) {
  status.startingRackCount = status.startingRackCount && result.summary.startingTileCount === 13;
  status.finalRackCount = status.finalRackCount && result.summary.finalTileCount === 13;
  status.passSizes = status.passSizes && result.summary.passCount === PASSES_PER_GAME && result.summary.outgoingTileCount === 9 && result.summary.incomingTileCount === 9;
  status.legalDuplicateLimits = status.legalDuplicateLimits && result.summary.maxDuplicateViolations === 0;

  const allErrors = result.errors.join('\n');
  status.jokerOutgoing = status.jokerOutgoing && !allErrors.includes('sends a Joker');
  status.jokerIncoming = status.jokerIncoming && !allErrors.includes('receives a Joker');
  status.rackAccounting = status.rackAccounting && !allErrors.includes('final rack does not equal');
}

function statusWord(ok) {
  return ok ? 'pass' : 'fail';
}

function runRackStateValidation() {
  const failures = [];
  const warningRows = [];
  const status = {
    startingRackCount: true,
    finalRackCount: true,
    passSizes: true,
    jokerOutgoing: true,
    jokerIncoming: true,
    legalDuplicateLimits: true,
    rackAccounting: true,
  };

  for (let i = 0; i < DAILY_GAMES; i += 1) {
    const game = simulateCompleteGame({ mode: 'daily', index: i });
    const result = validateRackState(game);
    updateCheckStatus(status, result);
    if (!result.ok) failures.push({ ...game, result });
    if (result.warnings.length) warningRows.push({ ...game, result });
  }

  for (let i = 0; i < PRACTICE_GAMES; i += 1) {
    const game = simulateCompleteGame({ mode: 'practice', index: i });
    const result = validateRackState(game);
    updateCheckStatus(status, result);
    if (!result.ok) failures.push({ ...game, result });
    if (result.warnings.length) warningRows.push({ ...game, result });
  }

  console.log('Rack State QA');
  console.log(`Daily games tested: ${DAILY_GAMES}`);
  console.log(`Practice games tested: ${PRACTICE_GAMES}`);
  console.log(`Failures: ${failures.length}`);
  console.log(`Warnings: ${warningRows.length}`);
  console.log('');
  console.log('Checks:');
  console.log(`- Starting rack count: ${statusWord(status.startingRackCount)}`);
  console.log(`- Final rack count: ${statusWord(status.finalRackCount)}`);
  console.log(`- Pass sizes: ${statusWord(status.passSizes)}`);
  console.log(`- Joker outgoing: ${statusWord(status.jokerOutgoing)}`);
  console.log(`- Joker incoming: ${statusWord(status.jokerIncoming)}`);
  console.log(`- Legal duplicate limits: ${statusWord(status.legalDuplicateLimits)}`);
  console.log(`- Rack accounting: ${statusWord(status.rackAccounting)}`);

  if (failures.length) {
    console.log('');
    console.log('Failed examples:');
    failures.slice(0, 10).forEach((failure, index) => {
      console.log(`\n${index + 1}. ${failure.mode} seed ${failure.seed}`);
      console.log(`Starting rack: ${rackLabel(failure.startingRack)}`);
      failure.passLog.forEach(pass => {
        console.log(`${pass.label} out: ${rackLabel(pass.out)} | in: ${rackLabel(pass.in)}`);
      });
      console.log(`Final rack: ${rackLabel(failure.finalRack)}`);
      console.log(`Errors: ${failure.result.errors.join('; ')}`);
    });
  }

  if (!failures.length) {
    console.log('');
    console.log('Rack State QA: PASSED');
    return true;
  }

  console.log('');
  console.log('Rack State QA: FAILED');
  return false;
}

if (process.argv[1]?.endsWith('rack-state-validation.js')) {
  const ok = runRackStateValidation();
  process.exit(ok ? 0 : 1);
}

export { runRackStateValidation };
