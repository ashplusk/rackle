/* global process */
// Rackle expert pass recommendation validation.
// Run with:
//   npm run validate:passes

import { getPassRecommendationDetails } from './game.js';

const t = {
  b: n => ({ t: 's', s: 'bam', n }),
  c: n => ({ t: 's', s: 'crak', n }),
  d: n => ({ t: 's', s: 'dot', n }),
  w: v => ({ t: 'w', v }),
  dragon: v => ({ t: 'd', v }),
  soap: () => ({ t: 'd', v: 'Soap' }),
  f: () => ({ t: 'f' }),
  j: () => ({ t: 'j' }),
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

function tileLabel(tile) {
  if (!tile) return 'Missing';
  if (tile.t === 's') return `${tile.n} ${tile.s}`;
  if (tile.t === 'w') return `${tile.v} Wind`;
  if (tile.t === 'd') return `${tile.v} Dragon`;
  if (tile.t === 'f') return 'Flower';
  if (tile.t === 'j') return 'Joker';
  return JSON.stringify(tile);
}

function keys(tiles = []) {
  return tiles.map(tileKey);
}

function scenario(config) {
  return {
    expectedNeverPass: [],
    expectedProtected: [],
    expectedLikelyPass: [],
    minLikelyMatches: null,
    expectedLabel: null,
    expectedReasoning: [],
    expectedConfidenceImpact: null,
    ...config,
  };
}

const PASS_RECOMMENDATION_SCENARIOS = [
  scenario({
    id: 'A',
    title: 'Joker in rack is never recommended',
    startingRack: [t.j(), t.b(1), t.b(2), t.b(3), t.b(4), t.b(5), t.c(8), t.d(9), t.w('E'), t.dragon('Red'), t.f(), t.c(2), t.d(7)],
    expectedNeverPass: [t.j()],
    expectedLikelyPass: [t.w('E'), t.dragon('Red'), t.c(8)],
    minLikelyMatches: 2,
    expectedReasoning: ['Jokers stay protected', 'cut unsupported honors first'],
  }),
  scenario({
    id: 'B',
    title: 'Strong pair supporting Consecutive Run is protected',
    startingRack: [t.b(2), t.b(2), t.b(3), t.b(4), t.b(5), t.b(6), t.c(8), t.d(9), t.w('E'), t.dragon('Red'), t.f(), t.c(1), t.d(7)],
    expectedProtected: [t.b(2), t.b(3), t.b(4), t.b(5), t.b(6)],
    expectedLikelyPass: [t.w('E'), t.dragon('Red'), t.d(9)],
    minLikelyMatches: 2,
    expectedReasoning: ['protect same-suit run', 'do not break natural pair'],
  }),
  scenario({
    id: 'C',
    title: 'Pair-heavy Like Numbers rack passes weak singletons first',
    startingRack: [t.b(4), t.b(4), t.c(4), t.c(4), t.d(4), t.d(4), t.w('E'), t.c(9), t.b(1), t.f(), t.dragon('Red'), t.c(7), t.d(2)],
    expectedProtected: [t.b(4), t.c(4), t.d(4)],
    expectedLikelyPass: [t.w('E'), t.dragon('Red'), t.b(1), t.c(9)],
    minLikelyMatches: 2,
    expectedReasoning: ['same-number core protected', 'singletons leave before pairs'],
  }),
  scenario({
    id: 'D',
    title: 'Isolated wind outside Winds path can be recommended',
    startingRack: [t.b(2), t.b(4), t.b(6), t.b(8), t.c(2), t.c(4), t.c(6), t.f(), t.w('E'), t.d(9), t.b(1), t.dragon('Red'), t.c(8)],
    expectedLikelyPass: [t.w('E'), t.dragon('Red'), t.d(9)],
    minLikelyMatches: 2,
    expectedReasoning: ['isolated wind is passable when 2468 is clearer'],
  }),
  scenario({
    id: 'E',
    title: 'Paired wind with Winds and Dragons path is protected',
    startingRack: [t.w('E'), t.w('E'), t.w('N'), t.dragon('Red'), t.dragon('Red'), t.f(), t.f(), t.b(7), t.c(8), t.d(9), t.b(1), t.c(2), t.j()],
    expectedProtected: [t.w('E'), t.dragon('Red'), t.j()],
    expectedLikelyPass: [t.b(7), t.c(8), t.d(9), t.c(2)],
    minLikelyMatches: 2,
    expectedReasoning: ['paired honors are table structure'],
  }),
  scenario({
    id: 'F',
    title: 'Lone dragon with no support can be recommended',
    startingRack: [t.b(1), t.b(2), t.b(3), t.b(4), t.b(5), t.c(8), t.d(9), t.dragon('Green'), t.w('E'), t.f(), t.c(2), t.d(7), t.b(6)],
    expectedLikelyPass: [t.dragon('Green'), t.w('E'), t.d(9)],
    minLikelyMatches: 2,
    expectedReasoning: ['isolated dragon is not automatically protected'],
  }),
  scenario({
    id: 'G',
    title: 'Paired dragon with matching honor logic is protected',
    startingRack: [t.dragon('Red'), t.dragon('Red'), t.w('E'), t.w('E'), t.w('N'), t.f(), t.f(), t.b(7), t.c(8), t.d(9), t.b(1), t.c(2), t.j()],
    expectedProtected: [t.dragon('Red'), t.w('E'), t.j()],
    expectedLikelyPass: [t.b(7), t.c(8), t.d(9), t.c(2)],
    minLikelyMatches: 2,
    expectedReasoning: ['paired dragon is stronger than lone dragon'],
  }),
  scenario({
    id: 'H',
    title: 'Soap plus 2s and 6s is protected for 2026',
    startingRack: [t.soap(), t.b(2), t.c(2), t.b(6), t.d(6), t.f(), t.f(), t.w('E'), t.c(9), t.d(1), t.dragon('Red'), t.b(4), t.c(7)],
    expectedProtected: [t.soap(), t.b(2), t.c(2), t.b(6), t.d(6), t.f()],
    expectedLikelyPass: [t.w('E'), t.dragon('Red'), t.c(9), t.d(1)],
    minLikelyMatches: 2,
    expectedReasoning: ['Soap stays when year core is real'],
  }),
  scenario({
    id: 'I',
    title: 'Lone Soap is not overprotected without 2026 structure',
    startingRack: [t.soap(), t.b(1), t.b(3), t.c(5), t.d(7), t.b(9), t.c(8), t.d(4), t.w('E'), t.w('S'), t.dragon('Red'), t.f(), t.c(1)],
    expectedLikelyPass: [t.soap(), t.w('E'), t.w('S'), t.c(8)],
    minLikelyMatches: 2,
    expectedReasoning: ['lone Soap does not force year hand'],
  }),
  scenario({
    id: 'J',
    title: 'Single Flower with no section support can be recommended',
    startingRack: [t.f(), t.b(2), t.b(3), t.b(4), t.b(5), t.b(6), t.b(7), t.b(8), t.c(2), t.c(3), t.c(4), t.d(8), t.d(9)],
    expectedLikelyPass: [t.f(), t.d(9), t.c(3)],
    minLikelyMatches: 1,
    expectedReasoning: ['Flower is context-aware'],
  }),
  scenario({
    id: 'K',
    title: 'Flower with 2026 support is protected',
    startingRack: [t.f(), t.soap(), t.b(2), t.c(2), t.b(6), t.d(6), t.f(), t.w('E'), t.c(9), t.d(1), t.dragon('Red'), t.b(4), t.c(7)],
    expectedProtected: [t.f(), t.soap(), t.b(2), t.c(2), t.b(6), t.d(6)],
    expectedLikelyPass: [t.w('E'), t.dragon('Red'), t.c(9), t.d(1)],
    minLikelyMatches: 2,
    expectedReasoning: ['Flowers support a real year core'],
  }),
  scenario({
    id: 'L',
    title: 'Consecutive run tiles are protected',
    startingRack: [t.b(3), t.b(4), t.b(5), t.b(5), t.b(6), t.c(9), t.d(1), t.w('E'), t.dragon('Red'), t.f(), t.c(2), t.d(7), t.c(8)],
    expectedProtected: [t.b(3), t.b(4), t.b(5), t.b(6)],
    expectedLikelyPass: [t.w('E'), t.dragon('Red'), t.c(2), t.c(9)],
    minLikelyMatches: 2,
    expectedReasoning: ['connected run core protected'],
  }),
  scenario({
    id: 'M',
    title: 'Like Numbers core is protected',
    startingRack: [t.b(4), t.b(4), t.c(4), t.d(4), t.c(9), t.d(1), t.w('E'), t.dragon('Red'), t.f(), t.c(2), t.d(7), t.b(8), t.c(6)],
    expectedProtected: [t.b(4), t.c(4), t.d(4)],
    expectedLikelyPass: [t.w('E'), t.dragon('Red'), t.d(1), t.c(9)],
    minLikelyMatches: 2,
    expectedReasoning: ['same-number tiles protected across suits'],
  }),
  scenario({
    id: 'N',
    title: '2468 even structure is protected',
    startingRack: [t.b(2), t.b(4), t.b(6), t.b(8), t.b(8), t.c(2), t.c(4), t.w('E'), t.dragon('Red'), t.f(), t.c(9), t.d(1), t.d(7)],
    expectedProtected: [t.b(2), t.b(4), t.b(6), t.b(8), t.c(2), t.c(4)],
    expectedLikelyPass: [t.w('E'), t.dragon('Red'), t.c(9), t.d(1)],
    minLikelyMatches: 2,
    expectedReasoning: ['even lane protected'],
  }),
  scenario({
    id: 'O',
    title: '13579 odd structure is protected',
    startingRack: [t.b(1), t.b(3), t.b(5), t.b(7), t.b(9), t.c(3), t.c(5), t.w('E'), t.dragon('Red'), t.f(), t.c(8), t.d(2), t.d(6)],
    expectedProtected: [t.b(1), t.b(3), t.b(5), t.b(7), t.b(9), t.c(3), t.c(5)],
    expectedLikelyPass: [t.w('E'), t.dragon('Red'), t.c(8), t.d(2)],
    minLikelyMatches: 2,
    expectedReasoning: ['odd lane protected'],
  }),
  scenario({
    id: 'P',
    title: '369 overlap protects meaningful 3-6-9 core',
    startingRack: [t.b(3), t.b(6), t.b(9), t.b(9), t.c(3), t.dragon('Green'), t.w('E'), t.f(), t.c(8), t.d(2), t.d(5), t.c(1), t.d(7)],
    expectedProtected: [t.b(3), t.b(6), t.b(9), t.c(3)],
    expectedLikelyPass: [t.w('E'), t.c(8), t.d(2), t.d(5)],
    minLikelyMatches: 2,
    expectedReasoning: ['3-6-9 core protected where meaningful'],
  }),
  scenario({
    id: 'Q',
    title: 'Quints with Joker and natural anchor protects anchor',
    startingRack: [t.b(5), t.b(5), t.b(5), t.j(), t.c(2), t.c(2), t.d(8), t.w('E'), t.dragon('Red'), t.f(), t.c(9), t.d(1), t.b(7)],
    expectedProtected: [t.b(5), t.c(2), t.j()],
    expectedLikelyPass: [t.w('E'), t.dragon('Red'), t.d(1), t.c(9)],
    minLikelyMatches: 2,
    expectedReasoning: ['natural anchor before Joker dream'],
  }),
  scenario({
    id: 'R',
    title: 'Quints dream without anchor does not protect everything',
    startingRack: [t.j(), t.j(), t.b(5), t.c(2), t.d(8), t.w('E'), t.dragon('Red'), t.f(), t.c(9), t.d(1), t.b(7), t.c(4), t.d(6)],
    expectedProtected: [t.j()],
    expectedLikelyPass: [t.w('E'), t.dragon('Red'), t.d(1), t.c(9)],
    minLikelyMatches: 2,
    expectedLabel: 'cleanest pass',
    expectedReasoning: ['Jokers are not enough without natural anchors'],
  }),
  scenario({
    id: 'S',
    title: 'Many pairs but no exact line passes weakest non-pair tiles first',
    startingRack: [t.b(1), t.b(1), t.c(2), t.c(2), t.d(3), t.d(3), t.w('E'), t.w('E'), t.f(), t.dragon('Red'), t.b(9), t.c(7), t.d(5)],
    expectedProtected: [t.b(1), t.c(2), t.d(3), t.w('E')],
    expectedLikelyPass: [t.dragon('Red'), t.c(7), t.d(5), t.b(9)],
    minLikelyMatches: 2,
    expectedReasoning: ['least useful singletons leave before core pairs'],
  }),
  scenario({
    id: 'T',
    title: 'Fake flexibility rack does not protect everything',
    startingRack: [t.b(1), t.c(2), t.d(3), t.b(4), t.c(5), t.d(6), t.b(7), t.c(8), t.d(9), t.w('E'), t.w('S'), t.dragon('Red'), t.f()],
    expectedLikelyPass: [t.w('E'), t.w('S'), t.dragon('Red'), t.f()],
    minLikelyMatches: 3,
    expectedReasoning: ['fake flexibility must still make a cut'],
  }),
];

function validateScenario(test) {
  const result = getPassRecommendationDetails(test.startingRack);
  const recommendedKeys = keys(result.recommendations);
  const protectedKeys = keys(test.expectedProtected || []);
  const neverKeys = [...new Set([...keys(test.expectedNeverPass || []), ...protectedKeys])];
  const likelyKeys = keys(test.expectedLikelyPass || []);
  const failures = [];

  neverKeys.forEach(key => {
    if (recommendedKeys.includes(key)) failures.push(`Recommended protected tile ${key}.`);
  });

  if (likelyKeys.length) {
    const matched = likelyKeys.filter(key => recommendedKeys.includes(key));
    const minMatches = test.minLikelyMatches ?? likelyKeys.length;
    if (matched.length < minMatches) {
      failures.push(`Expected at least ${minMatches} likely pass match(es), got ${matched.length}.`);
    }
  }

  if (recommendedKeys.includes('joker')) failures.push('Recommended a Joker.');

  if (test.expectedLabel && result.label !== test.expectedLabel) {
    failures.push(`Expected recommendation label ${test.expectedLabel}, got ${result.label}.`);
  }

  return {
    ...test,
    ok: failures.length === 0,
    failures,
    result,
  };
}

const results = PASS_RECOMMENDATION_SCENARIOS.map(validateScenario);
const failed = results.filter(result => !result.ok);

console.log('\nPass Recommendation QA');
console.log(`Scenarios tested: ${results.length}`);
console.log(`Passed: ${results.length - failed.length}`);
console.log(`Failed: ${failed.length}`);

if (failed.length) {
  console.log('\nFailed scenarios:');
  failed.forEach(result => {
    console.log(`\n${result.id}. ${result.title}`);
    console.log(`Recommended: ${result.result.recommendations.map(tileLabel).join(', ')}`);
    console.log(`Expected protected: ${(result.expectedProtected || []).map(tileLabel).join(', ') || 'None'}`);
    console.log(`Expected likely pass: ${(result.expectedLikelyPass || []).map(tileLabel).join(', ') || 'None'}`);
    console.log(`Reason for failure: ${result.failures.join(' ')}`);
  });
  process.exit(1);
}

console.log('\nPass Recommendation QA: PASSED');
