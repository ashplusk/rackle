/* global process */
// Rackle incoming-tile distribution validation.
// Run with:
//   npm run validate:incoming

import { dealDailyRack, getIncomingTiles } from './game.js';

const SAMPLE_SIZE = Number(process.env.RACKLE_INCOMING_SEEDS || 500);
const PASSES_PER_GAME = 3;
const TILES_PER_PASS = 3;

const THRESHOLDS = {
  suitedMin: 60,
  suitedMax: 85,
  honorsMin: 10,
  honorsMax: 30,
  windsMin: 5,
  windsMax: 22,
  dragonsMin: 3,
  dragonsMax: 14,
  flowersMin: 1,
  flowersMax: 8,
  jokersExact: 0,
  maxHonorsPerGame: 6,
  maxAllHonorReceives: 2,
};

function dailySeedFromOffset(offset) {
  // Deterministic YYYYMMDD-style seeds across a launch-safe sample window.
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
  if (tile.t === 's') return `${tile.n} ${tile.s}`;
  if (tile.t === 'w') return `${tile.v} wind`;
  if (tile.t === 'd') return `${tile.v} dragon`;
  if (tile.t === 'f') return 'flower';
  if (tile.t === 'j') return 'joker';
  return JSON.stringify(tile);
}

function tileType(tile) {
  if (tile?.t === 's') return 'suited';
  if (tile?.t === 'w') return 'winds';
  if (tile?.t === 'd') return 'dragons';
  if (tile?.t === 'f') return 'flowers';
  if (tile?.t === 'j') return 'jokers';
  return 'unknown';
}

function legalMaxForTile(tile) {
  if (tile?.t === 's') return 4;
  if (tile?.t === 'w') return 4;
  if (tile?.t === 'd') return 4;
  if (tile?.t === 'f') return 8;
  if (tile?.t === 'j') return 8;
  return 0;
}

function pct(value, total) {
  return Number(((value / Math.max(1, total)) * 100).toFixed(1));
}

function inRange(value, min, max) {
  return value >= min && value <= max;
}

function countTiles(tiles) {
  return tiles.reduce((acc, tile) => {
    const key = tileKey(tile);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function findImpossibleTileCounts(tiles) {
  const counts = countTiles(tiles);
  const exampleTileByKey = new Map();

  tiles.forEach(tile => {
    exampleTileByKey.set(tileKey(tile), tile);
  });

  return Object.entries(counts)
    .map(([key, count]) => {
      const tile = exampleTileByKey.get(key);
      const max = legalMaxForTile(tile);
      return { key, count, max, label: tileLabel(tile) };
    })
    .filter(item => item.count > item.max);
}

function formatPercent(count, total) {
  return `${count} / ${pct(count, total)}%`;
}

const counts = {
  suited: 0,
  winds: 0,
  dragons: 0,
  flowers: 0,
  jokers: 0,
  unknown: 0,
  total: 0,
};

const passWarnings = {
  duplicateHeavyReceives: [],
  honorHeavyReceives: [],
  allHonorReceives: [],
  repeatedWindDragonDominance: [],
  jokerIncoming: [],
  impossibleTileCounts: [],
  missingReceivedTiles: [],
  wrongPassSize: [],
};

const perGameStats = [];

for (let i = 0; i < SAMPLE_SIZE; i += 1) {
  const seed = dailySeedFromOffset(i);
  const startingRack = dealDailyRack(seed);
  const incomingTilesForGame = [];

  let gameHonors = 0;
  let gameWinds = 0;
  let gameDragons = 0;
  let gameFlowers = 0;
  let gameJokers = 0;

  for (let passNum = 1; passNum <= PASSES_PER_GAME; passNum += 1) {
    const tiles = getIncomingTiles(seed, passNum) || [];
    const passCounts = countTiles(tiles);
    let passHonors = 0;
    let passWinds = 0;
    let passDragons = 0;
    let passJokers = 0;

    if (tiles.length !== TILES_PER_PASS) {
      passWarnings.wrongPassSize.push({
        seed,
        passNum,
        expected: TILES_PER_PASS,
        actual: tiles.length,
        tiles: tiles.map(tileLabel),
      });
    }

    if (tiles.some(tile => !tile)) {
      passWarnings.missingReceivedTiles.push({ seed, passNum, tiles: tiles.map(tileLabel) });
    }

    tiles.forEach(tile => {
      const type = tileType(tile);
      counts[type] = (counts[type] || 0) + 1;
      counts.total += 1;
      incomingTilesForGame.push(tile);

      if (tile?.t === 'w') {
        passHonors += 1;
        passWinds += 1;
      }
      if (tile?.t === 'd') {
        passHonors += 1;
        passDragons += 1;
      }
      if (tile?.t === 'j') {
        passJokers += 1;
        passWarnings.jokerIncoming.push({ seed, passNum, tile: tileLabel(tile) });
      }
    });

    gameHonors += passHonors;
    gameWinds += passWinds;
    gameDragons += passDragons;
    gameFlowers += tiles.filter(tile => tile?.t === 'f').length;
    gameJokers += passJokers;

    if (Object.values(passCounts).some(count => count >= 2)) {
      passWarnings.duplicateHeavyReceives.push({ seed, passNum, tiles: tiles.map(tileLabel) });
    }
    if (passHonors >= 2) {
      passWarnings.honorHeavyReceives.push({ seed, passNum, honors: passHonors, tiles: tiles.map(tileLabel) });
    }
    if (passHonors === TILES_PER_PASS) {
      passWarnings.allHonorReceives.push({ seed, passNum, tiles: tiles.map(tileLabel) });
    }
  }

  const impossibleCounts = findImpossibleTileCounts([...startingRack, ...incomingTilesForGame]);
  if (impossibleCounts.length) {
    passWarnings.impossibleTileCounts.push({ seed, issues: impossibleCounts });
  }

  if (gameHonors >= 5 || gameWinds >= 5 || gameDragons >= 4) {
    passWarnings.repeatedWindDragonDominance.push({
      seed,
      honors: gameHonors,
      winds: gameWinds,
      dragons: gameDragons,
      incoming: incomingTilesForGame.map(tileLabel),
    });
  }

  perGameStats.push({
    seed,
    honors: gameHonors,
    winds: gameWinds,
    dragons: gameDragons,
    flowers: gameFlowers,
    jokers: gameJokers,
  });
}

const honorTotal = counts.winds + counts.dragons;
const distribution = {
  suited: pct(counts.suited, counts.total),
  winds: pct(counts.winds, counts.total),
  dragons: pct(counts.dragons, counts.total),
  honors: pct(honorTotal, counts.total),
  flowers: pct(counts.flowers, counts.total),
  jokers: pct(counts.jokers, counts.total),
};

const maxHonorsInOneGame = Math.max(...perGameStats.map(game => game.honors));
const maxWindsInOneGame = Math.max(...perGameStats.map(game => game.winds));
const maxDragonsInOneGame = Math.max(...perGameStats.map(game => game.dragons));

const failures = [];
const warnings = [];
const expectedTotal = SAMPLE_SIZE * PASSES_PER_GAME * TILES_PER_PASS;

if (counts.total !== expectedTotal) failures.push(`Expected ${expectedTotal} incoming tiles, received ${counts.total}.`);
if (counts.jokers !== THRESHOLDS.jokersExact) failures.push('Incoming Charleston tiles included Jokers.');
if (!inRange(distribution.suited, THRESHOLDS.suitedMin, THRESHOLDS.suitedMax)) failures.push(`Suited tiles outside target range: ${distribution.suited}%.`);
if (!inRange(distribution.honors, THRESHOLDS.honorsMin, THRESHOLDS.honorsMax)) failures.push(`Honors outside target range: ${distribution.honors}%.`);
if (!inRange(distribution.winds, THRESHOLDS.windsMin, THRESHOLDS.windsMax)) failures.push(`Winds outside target range: ${distribution.winds}%.`);
if (!inRange(distribution.dragons, THRESHOLDS.dragonsMin, THRESHOLDS.dragonsMax)) failures.push(`Dragons outside target range: ${distribution.dragons}%.`);
if (!inRange(distribution.flowers, THRESHOLDS.flowersMin, THRESHOLDS.flowersMax)) failures.push(`Flowers outside target range: ${distribution.flowers}%.`);
if (maxHonorsInOneGame > THRESHOLDS.maxHonorsPerGame) failures.push(`A game received ${maxHonorsInOneGame} honors across 9 incoming tiles.`);
if (passWarnings.wrongPassSize.length) failures.push(`${passWarnings.wrongPassSize.length} passes returned the wrong number of tiles.`);
if (passWarnings.missingReceivedTiles.length) failures.push(`${passWarnings.missingReceivedTiles.length} passes included missing tiles.`);
if (passWarnings.impossibleTileCounts.length) failures.push(`${passWarnings.impossibleTileCounts.length} games exceeded legal tile count limits.`);

if (passWarnings.allHonorReceives.length > THRESHOLDS.maxAllHonorReceives) {
  warnings.push(`${passWarnings.allHonorReceives.length} all-honor receives found. Review if this climbs over time.`);
}
if (passWarnings.repeatedWindDragonDominance.length) {
  warnings.push(`${passWarnings.repeatedWindDragonDominance.length} games had repeated wind/dragon dominance.`);
}

console.log('\nIncoming Tile Distribution QA');
console.log(`Seeds tested: ${SAMPLE_SIZE}`);
console.log(`Total incoming tiles: ${counts.total}`);

console.log('\nDistribution:');
console.log(`- Suited: ${formatPercent(counts.suited, counts.total)}`);
console.log(`- Winds: ${formatPercent(counts.winds, counts.total)}`);
console.log(`- Dragons: ${formatPercent(counts.dragons, counts.total)}`);
console.log(`- Honors total: ${formatPercent(honorTotal, counts.total)}`);
console.log(`- Flowers: ${formatPercent(counts.flowers, counts.total)}`);
console.log(`- Jokers: ${formatPercent(counts.jokers, counts.total)}`);

console.log('\nRisk checks:');
console.log(`- Joker incoming count: ${counts.jokers}`);
console.log(`- Honor-heavy receives: ${passWarnings.honorHeavyReceives.length}`);
console.log(`- All-honor receives: ${passWarnings.allHonorReceives.length}`);
console.log(`- Duplicate-heavy receives: ${passWarnings.duplicateHeavyReceives.length}`);
console.log(`- Repeated wind/dragon dominance: ${passWarnings.repeatedWindDragonDominance.length}`);
console.log(`- Impossible tile count games: ${passWarnings.impossibleTileCounts.length}`);
console.log(`- Missing received tile passes: ${passWarnings.missingReceivedTiles.length}`);
console.log(`- Wrong-size receive passes: ${passWarnings.wrongPassSize.length}`);
console.log(`- Max honors in one game: ${maxHonorsInOneGame} of 9`);
console.log(`- Max dragons in one game: ${maxDragonsInOneGame} of 9`);
console.log(`- Max winds in one game: ${maxWindsInOneGame} of 9`);

console.log('\nThresholds:');
console.log(`- Suited: ${THRESHOLDS.suitedMin}% to ${THRESHOLDS.suitedMax}%`);
console.log(`- Honors total: ${THRESHOLDS.honorsMin}% to ${THRESHOLDS.honorsMax}%`);
console.log(`- Winds: ${THRESHOLDS.windsMin}% to ${THRESHOLDS.windsMax}%`);
console.log(`- Dragons: ${THRESHOLDS.dragonsMin}% to ${THRESHOLDS.dragonsMax}%`);
console.log(`- Flowers: ${THRESHOLDS.flowersMin}% to ${THRESHOLDS.flowersMax}%`);
console.log('- Jokers: 0%');
console.log(`- Max honors in one game: ${THRESHOLDS.maxHonorsPerGame} of 9`);

if (warnings.length) {
  console.warn('\nWarnings:');
  warnings.forEach(warning => console.warn(`- ${warning}`));
}

if (failures.length) {
  console.error('\nIncoming Tile Distribution QA: FAILED');
  failures.forEach(failure => console.error(`- ${failure}`));

  const firstIssue =
    passWarnings.jokerIncoming[0] ||
    passWarnings.wrongPassSize[0] ||
    passWarnings.impossibleTileCounts[0] ||
    passWarnings.repeatedWindDragonDominance[0] ||
    passWarnings.honorHeavyReceives[0];

  if (firstIssue) {
    console.error('\nFirst issue sample:');
    console.error(JSON.stringify(firstIssue, null, 2));
  }

  process.exit(1);
}

console.log('\nIncoming Tile Distribution QA: PASSED');
console.log('Receives are Joker-free, suited tiles remain the majority, and honors do not dominate the Charleston sample.');
