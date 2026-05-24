/* global process */
// Rackle parent game-engine validation runner.
// Fast launch check:
//   npm run validate:game-engine
// Deep launch check:
//   npm run validate:game-engine:deep

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../..');
const packageJson = JSON.parse(readFileSync(resolve(projectRoot, 'package.json'), 'utf8'));
const scripts = packageJson.scripts || {};

const isDeepRun = process.argv.includes('--deep') || process.env.RACKLE_GAME_ENGINE_DEEP === '1';

const FAST_DEFAULTS = {
  RACKLE_INCOMING_SEEDS: '250',
  RACKLE_PRACTICE_VARIETY_GAMES: '100',
  RACKLE_PRACTICE_VARIETY_RACKS: '100',
  RACKLE_SCORE_DISTRIBUTION_GAMES: '25',
};

const DEEP_DEFAULTS = {
  RACKLE_INCOMING_SEEDS: '500',
  RACKLE_PRACTICE_VARIETY_GAMES: '500',
  RACKLE_PRACTICE_VARIETY_RACKS: '500',
  RACKLE_SCORE_DISTRIBUTION_GAMES: '1000',
};

const CHECKS = [
  { label: 'Rack State QA', script: 'validate:rack-state', timeoutMs: 90000 },
  { label: 'Daily Determinism QA', script: 'validate:daily-determinism', timeoutMs: 90000 },
  { label: 'Incoming Tile QA', script: 'validate:incoming', timeoutMs: 90000 },
  { label: 'Pass Recommendation QA', script: 'validate:passes', timeoutMs: 60000 },
  { label: 'Card-Line Database QA', script: 'validate:card-lines', timeoutMs: 60000, optional: true },
  { label: 'Scoring Trust QA', script: 'validate:scoring', timeoutMs: 60000 },
  { label: 'Practice Variety QA', script: 'validate:practice-variety', timeoutMs: isDeepRun ? 180000 : 60000, fastInline: true },
  { label: 'Score Distribution QA', script: 'validate:score-distribution', timeoutMs: isDeepRun ? 300000 : 60000, fastInline: true },
];

function printDivider(title, index) {
  const prefix = typeof index === 'number' ? `${index}. ` : '';
  console.log('\n' + '='.repeat(72));
  console.log(`${prefix}${title}`);
  console.log('='.repeat(72));
}

function nodeTargetForScript(scriptName) {
  const script = scripts[scriptName];
  if (!script) return null;
  const match = script.match(/(?:^|\s)node\s+([^\s]+)(?:\s|$)/);
  return match ? match[1] : null;
}

function envDefaults() {
  return isDeepRun ? DEEP_DEFAULTS : FAST_DEFAULTS;
}

function envForCheck(check) {
  const defaults = envDefaults();
  const env = {
    ...process.env,
    RACKLE_QA_PARENT: '1',
  };

  // Keep sample-size overrides scoped to the check that owns them. This avoids
  // accidental cross-talk, such as practice sample overrides changing Daily
  // determinism expectations.
  if (check.script !== 'validate:incoming') {
    delete env.RACKLE_INCOMING_SEEDS;
  } else {
    env.RACKLE_INCOMING_SEEDS = process.env.RACKLE_INCOMING_SEEDS || defaults.RACKLE_INCOMING_SEEDS;
  }

  if (check.script !== 'validate:practice-variety') {
    delete env.RACKLE_PRACTICE_VARIETY_GAMES;
    delete env.RACKLE_PRACTICE_VARIETY_RACKS;
  } else {
    env.RACKLE_PRACTICE_VARIETY_GAMES = process.env.RACKLE_PRACTICE_VARIETY_GAMES || defaults.RACKLE_PRACTICE_VARIETY_GAMES;
    env.RACKLE_PRACTICE_VARIETY_RACKS = process.env.RACKLE_PRACTICE_VARIETY_RACKS || env.RACKLE_PRACTICE_VARIETY_GAMES;
  }

  if (check.script !== 'validate:score-distribution') {
    delete env.RACKLE_SCORE_DISTRIBUTION_GAMES;
    delete env.RACKLE_SCORE_DISTRIBUTION_MODE;
  } else {
    env.RACKLE_SCORE_DISTRIBUTION_GAMES = process.env.RACKLE_SCORE_DISTRIBUTION_GAMES || defaults.RACKLE_SCORE_DISTRIBUTION_GAMES;
    env.RACKLE_SCORE_DISTRIBUTION_MODE = isDeepRun ? 'deep' : 'fast';
  }

  if (check.script === 'validate:scoring') {
    env.RACKLE_QA_SUMMARY = '1';
  }

  return env;
}

function runScript(check, nodeTarget) {
  const result = spawnSync(process.execPath, [nodeTarget], {
    cwd: projectRoot,
    env: envForCheck(check),
    stdio: 'inherit',
    shell: false,
    timeout: check.timeoutMs,
  });

  if (result.error) {
    const isTimeout = result.error.code === 'ETIMEDOUT';
    if (isTimeout) {
      console.error(`\n${check.label} timed out after ${Math.round(check.timeoutMs / 1000)} seconds.`);
      return { status: 'failed', reason: 'timeout' };
    }
    console.error(`\n${check.label} could not start: ${result.error.message}`);
    return { status: 'failed', reason: result.error.message };
  }

  if (result.status !== 0) {
    return { status: 'failed', reason: `exit ${result.status}` };
  }

  return { status: 'passed', reason: 'exit 0' };
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
  return rack.map(tileKey).sort().join('|');
}

function countTiles(rack = []) {
  return rack.reduce((acc, tile) => {
    const key = tileKey(tile);
    acc.set(key, (acc.get(key) || 0) + 1);
    return acc;
  }, new Map());
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
      toRemove.set(key, count - 1);
      return false;
    }
    return true;
  });
}

function pct(count, total) {
  return Number(((count / Math.max(1, total)) * 100).toFixed(1));
}

function band(score) {
  if (score >= 90) return '90+';
  if (score >= 80) return '80-89';
  if (score >= 70) return '70-79';
  if (score >= 60) return '60-69';
  if (score >= 50) return '50-59';
  return 'under 50';
}

function dailySeedFromOffset(offset) {
  const base = new Date(Date.UTC(2026, 0, 1));
  base.setUTCDate(base.getUTCDate() + offset);
  return base.getUTCFullYear() * 10000 + (base.getUTCMonth() + 1) * 100 + base.getUTCDate();
}

function seededChoice(seed, index, max) {
  const value = Math.abs(Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453);
  return Math.floor((value - Math.floor(value)) * max);
}

async function runPracticeVarietyFast() {
  const { dealPracticeRack, scoreSections } = await import('./game.js');
  const defaults = envDefaults();
  const total = Number(process.env.RACKLE_PRACTICE_VARIETY_GAMES || process.env.RACKLE_PRACTICE_VARIETY_RACKS || defaults.RACKLE_PRACTICE_VARIETY_GAMES);
  const signatures = new Set();
  const bands = { '90+': 0, '80-89': 0, '70-79': 0, '60-69': 0, '50-59': 0, 'under 50': 0 };
  let impossibleDuplicates = 0;
  let honorHeavy = 0;
  let pairHeavy = 0;
  let totalScore = 0;

  for (let i = 0; i < total; i += 1) {
    const rack = dealPracticeRack();
    signatures.add(rackSignature(rack));
    if (rack.length !== 13 || duplicateViolations(rack) > 0) impossibleDuplicates += 1;
    const honors = rack.filter(tile => tile?.t === 'w' || tile?.t === 'd').length;
    if (honors >= 6) honorHeavy += 1;
    const pairCount = [...countTiles(rack).values()].filter(count => count >= 2).length;
    if (pairCount >= 4) pairHeavy += 1;
    const score = scoreSections(rack)[0]?.score || 0;
    totalScore += score;
    bands[band(score)] += 1;
  }

  const repeated = total - signatures.size;
  const ninetyRate = pct(bands['90+'], total);
  const repeatRate = pct(repeated, total);
  const honorHeavyRate = pct(honorHeavy, total);
  const ok = impossibleDuplicates === 0 && repeatRate <= 5 && ninetyRate <= 25 && honorHeavyRate <= 20;

  console.log('Practice Variety QA');
  console.log(`Practice racks tested: ${total}`);
  console.log(`Unique racks: ${signatures.size}`);
  console.log(`Repeated racks: ${repeated}`);
  console.log(`Average score: ${(totalScore / Math.max(1, total)).toFixed(1)}`);
  console.log('');
  console.log('Score bands:');
  Object.entries(bands).forEach(([label, count]) => console.log(`- ${label}: ${count} / ${pct(count, total)}%`));
  console.log('');
  console.log('Risk checks:');
  console.log(`- impossible duplicates: ${impossibleDuplicates}`);
  console.log(`- honor-heavy racks: ${honorHeavy}`);
  console.log(`- pair-heavy racks: ${pairHeavy}`);
  console.log(`- 90+ rate: ${ninetyRate}%`);
  console.log(`- repeated signature rate: ${repeatRate}%`);
  console.log('');
  console.log(`Practice Variety QA: ${ok ? 'PASSED' : 'FAILED'}`);
  return { status: ok ? 'passed' : 'failed', reason: ok ? 'exit 0' : 'practice variety smoke failed' };
}

function chooseRandomPass(rack, seed) {
  const legal = rack.filter(tile => tile?.t !== 'j');
  const copy = [...legal];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = seededChoice(seed, i, i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, 3);
}

function chooseExpertPass(rack, seed, recommendPassCandidates) {
  const recommended = recommendPassCandidates(rack, { limit: 3, seed });
  return recommended.filter(tile => tile?.t !== 'j').slice(0, 3);
}

async function runScoreDistributionFast() {
  const {
    calculateIQCore,
    dealDailyRack,
    getIncomingTiles,
    recommendPassCandidates,
    scoreSections,
  } = await import('./game.js');

  const defaults = envDefaults();
  const total = Number(process.env.RACKLE_SCORE_DISTRIBUTION_GAMES || defaults.RACKLE_SCORE_DISTRIBUTION_GAMES);
  const modes = ['random', 'expert', 'mixed'];
  const summaries = {};

  for (const mode of modes) {
    const bands = { '90+': 0, '80-89': 0, '70-79': 0, '60-69': 0, '50-59': 0, 'under 50': 0 };
    const scores = [];
    let outgoingJokers = 0;

    for (let i = 0; i < total; i += 1) {
      const seed = dailySeedFromOffset(i);
      const startingRack = dealDailyRack(seed);
      let rack = [...startingRack];
      const passLog = [];

      for (let passNum = 1; passNum <= 3; passNum += 1) {
        const useRandom = mode === 'random' || (mode === 'mixed' && (seed + passNum) % 2 === 0);
        const out = useRandom ? chooseRandomPass(rack, seed + passNum) : chooseExpertPass(rack, seed + passNum, recommendPassCandidates);
        if (out.some(tile => tile?.t === 'j')) outgoingJokers += 1;
        const rackAfterOutgoing = removeTilesByIdentity(rack, out);
        const incoming = getIncomingTiles(seed, passNum, rackAfterOutgoing) || [];
        passLog.push({ label: `Pass ${passNum}`, dir: passNum === 1 ? 'left' : passNum === 2 ? 'across' : 'right', out, in: incoming, secs: 12 });
        rack = rackAfterOutgoing.concat(incoming.filter(tile => tile?.t !== 'j'));
      }

      const chosenSection = scoreSections(startingRack)[0]?.id || null;
      const result = calculateIQCore(startingRack, passLog, rack, chosenSection);
      const score = Number(result.rackleIQ || 0);
      scores.push(score);
      bands[band(score)] += 1;
    }

    const average = scores.reduce((sum, score) => sum + score, 0) / Math.max(1, scores.length);
    summaries[mode] = {
      bands,
      average: Number(average.toFixed(1)),
      ninetyPlusRate: pct(bands['90+'], total),
      eightyPlusRate: pct(bands['90+'] + bands['80-89'], total),
      outgoingJokers,
    };
  }

  const failures = [];
  if (summaries.random.ninetyPlusRate > 8) failures.push('Random 90+ rate is inflated.');
  if (summaries.random.eightyPlusRate > 25) failures.push('Random 80+ rate is inflated.');
  if (summaries.expert.ninetyPlusRate > 12) failures.push('Expert-ish 90+ rate is inflated.');
  if (summaries.expert.eightyPlusRate > 45) failures.push('Expert-ish 80+ rate is inflated.');
  if (summaries.mixed.ninetyPlusRate > 10) failures.push('Mixed 90+ rate is inflated.');
  if (summaries.mixed.eightyPlusRate > 35) failures.push('Mixed 80+ rate is inflated.');
  if (Object.values(summaries).some(summary => summary.outgoingJokers > 0)) failures.push('A score distribution pass included outgoing Jokers.');
  if (summaries.expert.average <= summaries.random.average) failures.push('Expert-ish passing did not beat random passing.');

  console.log('Score Distribution QA');
  console.log(`Games per mode: ${total}`);
  Object.entries(summaries).forEach(([mode, summary]) => {
    console.log('');
    console.log(`${mode === 'random' ? 'Random legal pass' : mode === 'expert' ? 'Expert-ish pass' : 'Mixed pass'}:`);
    Object.entries(summary.bands).forEach(([label, count]) => console.log(`- ${label}: ${count} / ${pct(count, total)}%`));
    console.log(`- average score: ${summary.average}`);
    console.log(`- 90+ rate: ${summary.ninetyPlusRate}%`);
    console.log(`- 80+ rate: ${summary.eightyPlusRate}%`);
  });
  console.log('');
  console.log(`Score Distribution QA: ${failures.length ? 'FAILED' : 'PASSED'}`);
  failures.forEach(failure => console.log(`- ${failure}`));
  return { status: failures.length ? 'failed' : 'passed', reason: failures.length ? 'score distribution smoke failed' : 'exit 0' };
}

async function runGameEngineValidation() {
  const defaults = envDefaults();
  console.log('Rackle Game Engine QA');
  console.log(`Mode: ${isDeepRun ? 'deep' : 'fast'}`);
  console.log(`Incoming seeds: ${process.env.RACKLE_INCOMING_SEEDS || defaults.RACKLE_INCOMING_SEEDS}`);
  console.log(`Practice racks: ${process.env.RACKLE_PRACTICE_VARIETY_GAMES || process.env.RACKLE_PRACTICE_VARIETY_RACKS || defaults.RACKLE_PRACTICE_VARIETY_GAMES}`);
  console.log(`Score distribution games per mode: ${process.env.RACKLE_SCORE_DISTRIBUTION_GAMES || defaults.RACKLE_SCORE_DISTRIBUTION_GAMES}`);

  const skipped = [];

  for (let i = 0; i < CHECKS.length; i += 1) {
    const check = CHECKS[i];
    const nodeTarget = nodeTargetForScript(check.script);
    if (!nodeTarget) {
      printDivider(`${check.label} — SKIPPED`, i + 1);
      console.log(`Script not found or unsupported: npm run ${check.script}`);
      skipped.push(check.label);
      continue;
    }

    printDivider(check.label, i + 1);
    const result = check.script === 'validate:practice-variety'
      ? await runPracticeVarietyFast()
      : check.script === 'validate:score-distribution'
        ? await runScoreDistributionFast()
        : runScript(check, nodeTarget);

    if (result.status !== 'passed') {
      console.log('\nGame Engine QA: FAILED');
      console.log(`Failed check: ${check.label}`);
      console.log(`Failure reason: ${result.reason}`);
      if (skipped.length) console.log(`Skipped checks before failure: ${skipped.join(', ')}`);
      process.exit(1);
    }
  }

  console.log('\n' + '='.repeat(72));
  console.log('Game Engine QA: PASSED');
  console.log(`Skipped checks: ${skipped.length ? skipped.join(', ') : 'none'}`);
  console.log('='.repeat(72));
}

await runGameEngineValidation();
