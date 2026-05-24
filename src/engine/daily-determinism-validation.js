/* global process */
// Rackle Daily determinism validation.
// Run with:
//   npm run validate:daily-determinism

import {
  dealDailyRack,
  dealPracticeRack,
  getIncomingTiles,
} from './game.js';

const DATES_TESTED = Number(process.env.RACKLE_DAILY_DETERMINISM_DATES || 100);
const PRACTICE_RACKS_TESTED = Number(process.env.RACKLE_PRACTICE_VARIETY_RACKS || 100);
const PASSES_PER_GAME = 3;
const TILES_PER_PASS = 3;
const MIN_UNIQUE_PRACTICE_RACKS = Number(process.env.RACKLE_MIN_UNIQUE_PRACTICE_RACKS || 90);
const MAX_DUPLICATE_DAILY_RACKS = Number(process.env.RACKLE_MAX_DUPLICATE_DAILY_RACKS || 1);

function testDateFromOffset(offset) {
  const date = new Date(Date.UTC(2026, 0, 1));
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
}

function seedFromDate(date) {
  return date.getUTCFullYear() * 10000 + (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
}

function dateLabel(date) {
  return date.toISOString().slice(0, 10);
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

function rackSignature(rack = []) {
  return rack.map(tileKey).join('|');
}

function incomingSignature(incomingByPass = []) {
  return incomingByPass
    .map((tiles, index) => `p${index + 1}:${rackSignature(tiles)}`)
    .join('||');
}

function addCount(counts, key, amount = 1) {
  counts.set(key, (counts.get(key) || 0) + amount);
  if (counts.get(key) === 0) counts.delete(key);
}

function removeTilesByIdentity(rack = [], outgoing = []) {
  const toRemove = new Map();
  outgoing.forEach(tile => addCount(toRemove, tileKey(tile), 1));

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

function chooseDeterministicOutgoing(rack = [], passNum = 1) {
  const legalTiles = rack
    .map((tile, index) => ({ tile, index, key: tileKey(tile) }))
    .filter(item => item.tile?.t !== 'j')
    .sort((a, b) => {
      const typeRank = tileTypeRank(a.tile) - tileTypeRank(b.tile);
      if (typeRank !== 0) return typeRank;
      const keyRank = a.key.localeCompare(b.key);
      if (keyRank !== 0) return keyRank;
      return a.index - b.index;
    });

  const rotation = legalTiles.length ? ((passNum - 1) * TILES_PER_PASS) % legalTiles.length : 0;
  const rotated = legalTiles.slice(rotation).concat(legalTiles.slice(0, rotation));
  return rotated.slice(0, TILES_PER_PASS).map(item => item.tile);
}

function tileTypeRank(tile) {
  if (!tile) return 99;
  if (tile.t === 'w') return 1;
  if (tile.t === 'd') return 2;
  if (tile.t === 's') return 3;
  if (tile.t === 'f') return 4;
  if (tile.t === 'j') return 99;
  return 98;
}

function simulateIncomingSequence(seed) {
  let rack = dealDailyRack(seed).map(tile => ({ ...tile }));
  const incomingByPass = [];

  for (let passNum = 1; passNum <= PASSES_PER_GAME; passNum += 1) {
    const outgoing = chooseDeterministicOutgoing(rack, passNum);
    const rackAfterOutgoing = removeTilesByIdentity(rack, outgoing);
    const incoming = getIncomingTiles(seed, passNum, rackAfterOutgoing);
    incomingByPass.push(incoming);
    rack = rackAfterOutgoing.concat(incoming);
  }

  return incomingByPass;
}

function statusWord(ok) {
  return ok ? 'pass' : 'fail';
}

function findDuplicateCount(values = []) {
  const seen = new Set();
  let duplicates = 0;
  values.forEach(value => {
    if (seen.has(value)) duplicates += 1;
    else seen.add(value);
  });
  return duplicates;
}

function runDailyDeterminismValidation() {
  const failures = [];
  const dailySignatures = [];

  let sameDateRackStability = true;
  let sameDateIncomingStability = true;
  let differentDateVariety = true;
  let practiceIndependence = true;
  let practiceVariety = true;
  let mutationSafety = true;

  for (let i = 0; i < DATES_TESTED; i += 1) {
    const date = testDateFromOffset(i);
    const seed = seedFromDate(date);
    const label = dateLabel(date);

    const firstRack = dealDailyRack(seed);
    const secondRack = dealDailyRack(seed);
    const firstSignature = rackSignature(firstRack);
    const secondSignature = rackSignature(secondRack);
    dailySignatures.push(firstSignature);

    if (firstSignature !== secondSignature) {
      sameDateRackStability = false;
      failures.push({ check: 'same-date rack stability', date: label, seed });
    }

    const firstIncoming = incomingSignature(simulateIncomingSequence(seed));
    const secondIncoming = incomingSignature(simulateIncomingSequence(seed));
    if (firstIncoming !== secondIncoming) {
      sameDateIncomingStability = false;
      failures.push({ check: 'same-date incoming stability', date: label, seed });
    }

    const nextDate = testDateFromOffset(i + 1);
    const nextSeed = seedFromDate(nextDate);
    const nextSignature = rackSignature(dealDailyRack(nextSeed));
    if (firstSignature === nextSignature) {
      differentDateVariety = false;
      failures.push({ check: 'different-date variety', date: label, seed, comparedTo: dateLabel(nextDate) });
    }

    const dailyBeforePractice = rackSignature(dealDailyRack(seed));
    for (let practiceIndex = 0; practiceIndex < 5; practiceIndex += 1) {
      dealPracticeRack();
    }
    const dailyAfterPractice = rackSignature(dealDailyRack(seed));
    if (dailyBeforePractice !== dailyAfterPractice) {
      practiceIndependence = false;
      failures.push({ check: 'practice independence', date: label, seed });
    }

    const mutationRack = dealDailyRack(seed);
    const mutationBefore = rackSignature(mutationRack);
    const outgoing = chooseDeterministicOutgoing(mutationRack, 1);
    const rackAfterOutgoing = removeTilesByIdentity(mutationRack, outgoing);
    getIncomingTiles(seed, 1, rackAfterOutgoing);
    const mutationAfterSameArray = rackSignature(mutationRack);
    const mutationRegenerated = rackSignature(dealDailyRack(seed));

    if (mutationBefore !== mutationAfterSameArray || mutationBefore !== mutationRegenerated) {
      mutationSafety = false;
      failures.push({ check: 'mutation safety', date: label, seed });
    }
  }

  const duplicateDailyRackCount = findDuplicateCount(dailySignatures);
  if (duplicateDailyRackCount > MAX_DUPLICATE_DAILY_RACKS) {
    differentDateVariety = false;
    failures.push({
      check: 'duplicate daily rack count across date sample',
      duplicates: duplicateDailyRackCount,
      maxAllowed: MAX_DUPLICATE_DAILY_RACKS,
    });
  }

  const practiceSignatures = [];
  for (let i = 0; i < PRACTICE_RACKS_TESTED; i += 1) {
    practiceSignatures.push(rackSignature(dealPracticeRack()));
  }
  const uniquePracticeRackCount = new Set(practiceSignatures).size;
  if (uniquePracticeRackCount < MIN_UNIQUE_PRACTICE_RACKS) {
    practiceVariety = false;
    failures.push({
      check: 'practice variety',
      uniquePracticeRackCount,
      minRequired: MIN_UNIQUE_PRACTICE_RACKS,
    });
  }

  console.log('Daily Determinism QA');
  console.log(`Dates tested: ${DATES_TESTED}`);
  console.log(`Same-date rack stability: ${statusWord(sameDateRackStability)}`);
  console.log(`Same-date incoming stability: ${statusWord(sameDateIncomingStability)}`);
  console.log(`Different-date variety: ${statusWord(differentDateVariety)}`);
  console.log(`Practice independence: ${statusWord(practiceIndependence)}`);
  console.log(`Practice variety: ${statusWord(practiceVariety)}`);
  console.log(`Mutation safety: ${statusWord(mutationSafety)}`);
  console.log('');
  console.log('Details:');
  console.log(`- Duplicate daily rack count across dates: ${duplicateDailyRackCount}`);
  console.log(`- Unique practice rack count: ${uniquePracticeRackCount} / ${PRACTICE_RACKS_TESTED}`);

  if (failures.length) {
    console.log('');
    console.log('Failed date seeds:');
    failures.slice(0, 20).forEach((failure, index) => {
      const datePart = failure.date ? ` ${failure.date}` : '';
      const seedPart = failure.seed ? ` seed ${failure.seed}` : '';
      const extra = failure.comparedTo ? ` compared to ${failure.comparedTo}` : '';
      console.log(`${index + 1}. ${failure.check}${datePart}${seedPart}${extra}`);
    });
  }

  const ok = failures.length === 0;
  console.log('');
  console.log(`Daily Determinism QA: ${ok ? 'PASSED' : 'FAILED'}`);
  return ok;
}

if (process.argv[1]?.endsWith('daily-determinism-validation.js')) {
  const ok = runDailyDeterminismValidation();
  process.exit(ok ? 0 : 1);
}

export { runDailyDeterminismValidation };
