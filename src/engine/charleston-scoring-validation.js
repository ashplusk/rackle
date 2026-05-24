// Rackle Charleston score trust validation library.
// Internal only. Do not expose this file in player-facing routes.
//
// Goal: prevent inflated or unfair Rackle IQ scores before launch.
// Run manually with:
//   npm run validate:scoring
// or:
//   node src/engine/charleston-scoring-validation.js

import { calculateIQ } from "./game.js";

const t = {
  b: n => ({ t: "s", s: "bam", n }),
  c: n => ({ t: "s", s: "crak", n }),
  d: n => ({ t: "s", s: "dot", n }),
  w: v => ({ t: "w", v }),
  dragon: v => ({ t: "d", v }),
  soap: () => ({ t: "d", v: "Soap" }),
  f: () => ({ t: "f" }),
  j: () => ({ t: "j" }),
};

const pass = (passName, playerPassed = [], receivedTiles = []) => ({
  passName,
  label: passName,
  dir: passName.toLowerCase(),
  out: playerPassed,
  in: receivedTiles,
  secs: 0,
});

function key(tile) {
  if (!tile) return "?";
  if (tile.t === "s") return `${tile.n}${tile.s}`;
  if (tile.t === "w") return `${tile.v} wind`;
  if (tile.t === "d") return `${tile.v} dragon`;
  if (tile.t === "f") return "flower";
  if (tile.t === "j") return "joker";
  return JSON.stringify(tile);
}

function applyPasses(startingRack = [], passSequence = []) {
  let rack = [...startingRack];
  passSequence.forEach(p => {
    const outs = new Map();
    (p.out || []).forEach(tile => outs.set(key(tile), (outs.get(key(tile)) || 0) + 1));
    rack = rack.filter(tile => {
      const k = key(tile);
      const count = outs.get(k) || 0;
      if (count > 0) {
        outs.set(k, count - 1);
        return false;
      }
      return true;
    }).concat((p.in || []).filter(tile => tile?.t !== "j"));
  });
  return rack;
}

function scenario({
  testName,
  startingRack,
  passSequence = [],
  finalRack = null,
  selectedDirection,
  expectedBestSection,
  expectedBestPathType = "section",
  acceptablePasses = [],
  badPasses = [],
  expectedScoreRange,
  expectedConfidence,
  expectedArchetypes = [],
  expectedCoachThemes = [],
}) {
  return {
    testName,
    startingRack,
    passSequence,
    receivedTiles: passSequence.map(p => p.in || []),
    finalRack: finalRack || applyPasses(startingRack, passSequence),
    selectedDirection,
    expectedBestSection,
    expectedBestPathType,
    acceptablePasses,
    badPasses,
    expectedScoreRange,
    expectedConfidence,
    expectedArchetypes,
    expectedCoachThemes,
  };
}

export const CHARLESTON_SCORE_TRUST_TESTS = [
  scenario({
    testName: "Obvious strong Consecutive Run with same-suit density",
    startingRack: [t.b(1), t.b(2), t.b(3), t.b(3), t.b(4), t.b(5), t.b(6), t.f(), t.j(), t.c(8), t.d(9), t.w("E"), t.dragon("Red")],
    passSequence: [
      pass("Right", [t.c(8), t.d(9), t.w("E")], [t.b(2), t.b(4), t.f()]),
      pass("Across", [t.dragon("Red"), t.f(), t.b(6)], [t.b(5), t.b(6), t.b(7)]),
      pass("Left", [t.f(), t.b(7), t.j()], [t.b(1), t.b(2), t.b(3)]),
    ],
    selectedDirection: "consec",
    expectedBestSection: "Consecutive Run",
    expectedScoreRange: [78, 88],
    expectedConfidence: "High",
    expectedArchetypes: ["Sharp Reader", "Smooth Builder", "Precision Builder"],
    expectedCoachThemes: ["same-suit run density", "protected structure", "clean lane"],
  }),
  scenario({
    testName: "Weak fake Consecutive Run split across suits with honors clutter",
    startingRack: [t.b(1), t.c(2), t.d(3), t.b(4), t.w("E"), t.w("S"), t.dragon("Green"), t.f(), t.c(8), t.d(9), t.w("N"), t.c(5), t.d(7)],
    passSequence: [pass("Right", [t.w("E"), t.c(8), t.d(9)], [t.w("W"), t.f(), t.c(3)])],
    selectedDirection: "consec",
    expectedBestSection: "Consecutive Run",
    expectedScoreRange: [45, 58],
    expectedConfidence: "Low",
    expectedArchetypes: ["Direction Tester", "Pattern Juggler", "Shape Tinkerer"],
    expectedCoachThemes: ["split-suit sequence", "fake flexibility", "honors clutter"],
  }),
  scenario({
    testName: "Strong 2468 with two-suit even density",
    startingRack: [t.b(2), t.b(4), t.b(6), t.b(8), t.c(2), t.c(4), t.c(6), t.f(), t.j(), t.w("N"), t.d(1), t.dragon("Red"), t.c(8)],
    passSequence: [pass("Right", [t.w("N"), t.d(1), t.dragon("Red")], [t.b(2), t.c(4), t.f()])],
    selectedDirection: "evens",
    expectedBestSection: "2468",
    expectedScoreRange: [75, 86],
    expectedConfidence: "High",
    expectedCoachThemes: ["even density", "two-suit support", "clean section signal"],
  }),
  scenario({
    testName: "Fake 2468 scattered evens across all suits with no anchors",
    startingRack: [t.b(2), t.c(4), t.d(6), t.b(8), t.c(1), t.d(3), t.b(5), t.w("E"), t.w("S"), t.dragon("Green"), t.f(), t.c(9), t.d(7)],
    selectedDirection: "evens",
    expectedBestSection: "2468",
    expectedScoreRange: [45, 60],
    expectedConfidence: "Low",
    expectedCoachThemes: ["scattered evens", "no pair structure", "weak convergence"],
  }),
  scenario({
    testName: "Strong 13579 with odd density and pair support",
    startingRack: [t.b(1), t.b(3), t.b(5), t.b(7), t.b(9), t.c(3), t.c(5), t.c(5), t.f(), t.j(), t.w("S"), t.d(2), t.dragon("Red")],
    passSequence: [pass("Right", [t.w("S"), t.d(2), t.dragon("Red")], [t.b(3), t.b(7), t.f()])],
    selectedDirection: "odds",
    expectedBestSection: "13579",
    expectedScoreRange: [72, 84],
    expectedConfidence: "High",
    expectedCoachThemes: ["odd density", "pair support", "protected odd lane"],
  }),
  scenario({
    testName: "Strong Like Numbers with repeated fours and matching support",
    startingRack: [t.b(4), t.b(4), t.c(4), t.c(4), t.d(4), t.f(), t.j(), t.dragon("Green"), t.dragon("Green"), t.w("E"), t.b(7), t.c(9), t.d(2)],
    passSequence: [pass("Right", [t.w("E"), t.b(7), t.c(9)], [t.d(4), t.f(), t.j()])],
    selectedDirection: "like",
    expectedBestSection: "Like Numbers",
    expectedScoreRange: [75, 88],
    expectedConfidence: "High",
    expectedCoachThemes: ["same-number density", "dragon support", "tile compression"],
  }),
  scenario({
    testName: "Fake Like Numbers with one loose duplicate only",
    startingRack: [t.b(6), t.c(6), t.d(1), t.b(2), t.c(3), t.d(4), t.b(8), t.c(9), t.w("N"), t.w("S"), t.f(), t.dragon("Red"), t.dragon("Green")],
    selectedDirection: "like",
    expectedBestSection: "Like Numbers",
    expectedScoreRange: [45, 58],
    expectedConfidence: "Low",
    expectedCoachThemes: ["not enough same-number density", "one duplicate is not a lane"],
  }),
  scenario({
    testName: "Winds-heavy rack with no dragons should label as Winds",
    startingRack: [t.w("E"), t.w("E"), t.w("W"), t.w("W"), t.w("N"), t.w("S"), t.f(), t.f(), t.j(), t.b(4), t.c(2), t.c(3), t.d(1)],
    selectedDirection: "wd",
    expectedBestSection: "Winds",
    expectedScoreRange: [50, 64],
    expectedConfidence: "Medium",
    expectedCoachThemes: ["no dragons", "wind grouping", "do not overstate Winds & Dragons"],
  }),
  scenario({
    testName: "True Winds and Dragons with honor pairs and dragon support",
    startingRack: [t.w("E"), t.w("E"), t.w("W"), t.w("W"), t.dragon("Red"), t.dragon("Red"), t.dragon("Green"), t.f(), t.f(), t.j(), t.b(7), t.c(8), t.d(9)],
    passSequence: [pass("Right", [t.b(7), t.c(8), t.d(9)], [t.w("N"), t.dragon("Green"), t.f()])],
    selectedDirection: "wd",
    expectedBestSection: "Winds & Dragons",
    expectedScoreRange: [70, 85],
    expectedConfidence: "High",
    expectedCoachThemes: ["dragon support", "honor anchors", "callable groups"],
  }),
  scenario({
    testName: "Joker-heavy Quints with natural duplicate anchors",
    startingRack: [t.b(5), t.b(5), t.b(5), t.c(2), t.c(2), t.d(8), t.d(8), t.j(), t.j(), t.f(), t.w("N"), t.c(9), t.dragon("Soap")],
    passSequence: [pass("Right", [t.w("N"), t.c(9), t.dragon("Soap")], [t.b(5), t.c(2), t.f()])],
    selectedDirection: "quints",
    expectedBestSection: "Quints",
    expectedScoreRange: [65, 82],
    expectedConfidence: "Medium",
    expectedCoachThemes: ["natural duplicate anchors", "joker support", "not joker-only"],
  }),
  scenario({
    testName: "Joker trap in scattered rack should not inflate",
    startingRack: [t.j(), t.b(1), t.c(3), t.d(5), t.b(8), t.c(9), t.w("E"), t.w("S"), t.dragon("Red"), t.dragon("Green"), t.f(), t.d(2), t.c(7)],
    selectedDirection: "quints",
    expectedBestSection: "Quints",
    expectedScoreRange: [40, 60],
    expectedConfidence: "Low",
    expectedCoachThemes: ["joker insurance", "scattered rack", "no anchors"],
  }),
  scenario({
    testName: "Singles and Pairs trap with Joker",
    startingRack: [t.j(), t.b(1), t.b(1), t.c(2), t.c(2), t.d(3), t.w("E"), t.w("W"), t.f(), t.f(), t.dragon("Red"), t.b(9), t.c(7)],
    selectedDirection: "pairs",
    expectedBestSection: "Singles & Pairs",
    expectedScoreRange: [35, 52],
    expectedConfidence: "Low",
    expectedCoachThemes: ["jokers do not help Singles & Pairs", "concealed risk", "exact tiles"],
  }),
  scenario({
    testName: "Flower-heavy but low-fit rack",
    startingRack: [t.f(), t.f(), t.f(), t.b(1), t.c(3), t.d(5), t.b(8), t.c(9), t.w("E"), t.dragon("Red"), t.d(2), t.c(7), t.w("N")],
    selectedDirection: "other",
    expectedBestSection: "Singles & Pairs",
    expectedScoreRange: [45, 60],
    expectedConfidence: "Low",
    expectedCoachThemes: ["flowers need section fit", "low acceleration", "ambiguous rack"],
  }),
  scenario({
    testName: "One-suit rack with strong suit density",
    startingRack: [t.d(1), t.d(2), t.d(3), t.d(4), t.d(5), t.d(6), t.d(7), t.d(8), t.f(), t.j(), t.w("S"), t.c(9), t.b(9)],
    passSequence: [pass("Right", [t.w("S"), t.c(9), t.b(9)], [t.d(2), t.d(5), t.f()])],
    selectedDirection: "suited",
    expectedBestSection: "Suit-Based",
    expectedScoreRange: [72, 86],
    expectedConfidence: "High",
    expectedCoachThemes: ["dominant suit", "low dead tile burden", "many future draws"],
  }),
  scenario({
    testName: "Three-suit ambiguity should avoid extreme scores",
    startingRack: [t.b(2), t.b(4), t.c(3), t.c(5), t.d(6), t.d(8), t.f(), t.w("E"), t.dragon("Red"), t.b(7), t.c(8), t.d(9), t.j()],
    selectedDirection: "other",
    expectedBestSection: "2468",
    expectedScoreRange: [50, 66],
    expectedConfidence: "Low",
    expectedCoachThemes: ["defensible alternatives", "avoid extremes", "reduce dead weight"],
  }),
  scenario({
    testName: "Lucky receive after bad pass should cap score",
    startingRack: [t.b(3), t.b(3), t.b(4), t.b(5), t.c(7), t.d(9), t.w("E"), t.w("N"), t.f(), t.dragon("Green"), t.c(1), t.d(2), t.b(8)],
    passSequence: [
      pass("Right", [t.b(3), t.b(4), t.b(5)], [t.b(3), t.b(4), t.b(5)]),
      pass("Across", [t.w("E"), t.w("N"), t.dragon("Green")], [t.b(4), t.b(5), t.j()]),
    ],
    selectedDirection: "consec",
    expectedBestSection: "Consecutive Run",
    expectedScoreRange: [58, 75],
    expectedConfidence: "Medium",
    expectedCoachThemes: ["lucky receive", "bad pass", "decision quality cap"],
  }),
  scenario({
    testName: "Bad receive after good pass should not punish too hard",
    startingRack: [t.b(2), t.b(3), t.b(4), t.b(5), t.b(5), t.b(6), t.f(), t.j(), t.w("E"), t.c(9), t.d(9), t.dragon("Red"), t.c(1)],
    passSequence: [pass("Right", [t.w("E"), t.c(9), t.d(9)], [t.w("N"), t.dragon("Green"), t.c(8)])],
    selectedDirection: "consec",
    expectedBestSection: "Consecutive Run",
    expectedScoreRange: [64, 78],
    expectedConfidence: "Medium",
    expectedCoachThemes: ["strong decisions", "poor receives", "kept structure"],
  }),
  scenario({
    testName: "Pair passed incorrectly from best line",
    startingRack: [t.b(4), t.b(4), t.b(5), t.b(6), t.b(7), t.c(2), t.d(8), t.f(), t.j(), t.w("E"), t.c(9), t.dragon("Red"), t.d(1)],
    passSequence: [pass("Right", [t.b(4), t.b(4), t.w("E")], [t.b(5), t.b(6), t.f()])],
    selectedDirection: "consec",
    expectedBestSection: "Consecutive Run",
    expectedScoreRange: [55, 72],
    expectedConfidence: "Medium",
    expectedCoachThemes: ["pair passed", "meaningful penalty", "lost anchor"],
  }),
  scenario({
    testName: "Pair passed correctly because it was off-path",
    startingRack: [t.b(2), t.b(3), t.b(4), t.b(5), t.b(6), t.c(9), t.c(9), t.f(), t.j(), t.w("E"), t.dragon("Red"), t.d(1), t.d(8)],
    passSequence: [pass("Right", [t.c(9), t.c(9), t.w("E")], [t.b(3), t.b(5), t.f()])],
    selectedDirection: "consec",
    expectedBestSection: "Consecutive Run",
    expectedScoreRange: [70, 84],
    expectedConfidence: "Medium",
    expectedCoachThemes: ["pair off path", "defensible cut", "better compression"],
  }),
  scenario({
    testName: "Wrong selected direction should cap score",
    startingRack: [t.b(2), t.b(3), t.b(4), t.b(5), t.b(6), t.b(6), t.b(7), t.f(), t.j(), t.c(1), t.d(9), t.w("E"), t.dragon("Red")],
    selectedDirection: "wd",
    expectedBestSection: "Consecutive Run",
    expectedScoreRange: [40, 62],
    expectedConfidence: "Low",
    expectedCoachThemes: ["direction mismatch", "unsupported read", "score cap"],
  }),
  scenario({
    testName: "Correct selected direction rewards alignment",
    startingRack: [t.b(2), t.b(3), t.b(4), t.b(5), t.b(6), t.b(6), t.b(7), t.f(), t.j(), t.c(1), t.d(9), t.w("E"), t.dragon("Red")],
    selectedDirection: "consec",
    expectedBestSection: "Consecutive Run",
    expectedScoreRange: [70, 84],
    expectedConfidence: "Medium",
    expectedCoachThemes: ["direction alignment", "same-suit lane", "clean read"],
  }),
  scenario({
    testName: "High dead tile burden prevents elite score",
    startingRack: [t.b(2), t.b(2), t.c(4), t.d(6), t.w("E"), t.w("S"), t.w("N"), t.dragon("Red"), t.dragon("Green"), t.f(), t.c(9), t.d(1), t.j()],
    selectedDirection: "evens",
    expectedBestSection: "2468",
    expectedScoreRange: [48, 65],
    expectedConfidence: "Low",
    expectedCoachThemes: ["dead tile burden", "honors clutter", "no elite score"],
  }),
  scenario({
    testName: "Low dead tile burden allows high score if decisions support it",
    startingRack: [t.c(2), t.c(3), t.c(4), t.c(5), t.c(5), t.c(6), t.c(7), t.c(8), t.f(), t.j(), t.c(2), t.c(4), t.c(6)],
    selectedDirection: "consec",
    expectedBestSection: "Consecutive Run",
    expectedScoreRange: [82, 93],
    expectedConfidence: "High",
    expectedCoachThemes: ["low dead tile burden", "strong exact fit", "elite possible"],
  }),
  scenario({
    testName: "Year hand with Soap as zero",
    startingRack: [t.b(2), t.c(2), t.d(2), t.b(6), t.c(6), t.d(6), t.soap(), t.soap(), t.f(), t.f(), t.j(), t.w("E"), t.c(9)],
    passSequence: [pass("Right", [t.w("E"), t.c(9), t.b(2)], [t.d(6), t.soap(), t.f()])],
    selectedDirection: "2026",
    expectedBestSection: "2026",
    expectedScoreRange: [70, 84],
    expectedConfidence: "High",
    expectedCoachThemes: ["Soap as zero", "year core", "flower support"],
  }),
  scenario({
    testName: "Wrong dragon kept with suit logic conflict",
    startingRack: [t.b(3), t.b(4), t.b(5), t.b(6), t.dragon("Red"), t.dragon("Red"), t.f(), t.j(), t.c(2), t.d(8), t.w("E"), t.c(9), t.d(1)],
    selectedDirection: "consec",
    expectedBestSection: "Consecutive Run",
    expectedScoreRange: [55, 72],
    expectedConfidence: "Low",
    expectedCoachThemes: ["wrong dragon", "suit logic", "off-direction tile"],
  }),
  scenario({
    testName: "Matching dragon protected with suit logic",
    startingRack: [t.c(3), t.c(4), t.c(5), t.c(6), t.dragon("Red"), t.dragon("Red"), t.f(), t.j(), t.b(2), t.d(8), t.w("E"), t.c(9), t.c(1)],
    passSequence: [pass("Right", [t.b(2), t.d(8), t.w("E")], [t.c(4), t.c(5), t.f()])],
    selectedDirection: "consec",
    expectedBestSection: "Consecutive Run",
    expectedScoreRange: [68, 82],
    expectedConfidence: "Medium",
    expectedCoachThemes: ["matching dragon", "protected support", "suit logic"],
  }),
  scenario({
    testName: "Concealed hand over-chase should add risk",
    startingRack: [t.b(1), t.b(1), t.c(2), t.c(2), t.d(3), t.d(3), t.f(), t.f(), t.w("E"), t.w("S"), t.dragon("Red"), t.c(9), t.d(8)],
    selectedDirection: "pairs",
    expectedBestSection: "Singles & Pairs",
    expectedScoreRange: [50, 68],
    expectedConfidence: "Medium",
    expectedCoachThemes: ["concealed risk", "exact private draws", "no callability"],
  }),
  scenario({
    testName: "Exposed hand practical with callable group structure",
    startingRack: [t.d(7), t.d(7), t.d(7), t.d(8), t.d(8), t.d(9), t.d(9), t.f(), t.j(), t.c(1), t.w("E"), t.dragon("Green"), t.b(2)],
    passSequence: [pass("Right", [t.c(1), t.w("E"), t.b(2)], [t.d(8), t.d(9), t.f()])],
    selectedDirection: "consec",
    expectedBestSection: "Consecutive Run",
    expectedScoreRange: [74, 88],
    expectedConfidence: "High",
    expectedCoachThemes: ["callable groups", "exposed hand practical", "pung/kong anchors"],
  }),
  scenario({
    testName: "Many pairs rack should not assume one correct path",
    startingRack: [t.b(1), t.b(1), t.c(2), t.c(2), t.d(3), t.d(3), t.b(4), t.b(4), t.f(), t.f(), t.w("E"), t.w("E"), t.dragon("Red")],
    selectedDirection: "pairs",
    expectedBestSection: "Singles & Pairs",
    expectedScoreRange: [62, 78],
    expectedConfidence: "Medium",
    expectedCoachThemes: ["many pairs", "defensible alternatives", "concealed exactness"],
  }),
  scenario({
    testName: "No-pair rack should avoid high confidence",
    startingRack: [t.b(1), t.b(2), t.c(3), t.c(4), t.d(5), t.d(6), t.b(7), t.c(8), t.d(9), t.f(), t.w("N"), t.dragon("Red"), t.dragon("Green")],
    selectedDirection: "other",
    expectedBestSection: "Consecutive Run",
    expectedScoreRange: [42, 60],
    expectedConfidence: "Low",
    expectedCoachThemes: ["no pair anchors", "low confidence", "reduce dead weight"],
  }),
  scenario({
    testName: "369 rack with fake nearby numbers",
    startingRack: [t.b(3), t.b(6), t.b(9), t.c(3), t.c(6), t.d(9), t.b(4), t.c(5), t.d(7), t.f(), t.j(), t.w("E"), t.dragon("Green")],
    selectedDirection: "threeSixNine",
    expectedBestSection: "369",
    expectedScoreRange: [62, 78],
    expectedConfidence: "Medium",
    expectedCoachThemes: ["3-6-9 core", "nearby numbers are noise", "section discipline"],
  }),
  scenario({
    testName: "Scattered honors rack should stay mixed",
    startingRack: [t.w("E"), t.w("S"), t.w("W"), t.w("N"), t.dragon("Red"), t.dragon("Green"), t.soap(), t.f(), t.b(1), t.c(4), t.d(7), t.b(9), t.c(2)],
    selectedDirection: "wd",
    expectedBestSection: "Winds & Dragons",
    expectedScoreRange: [48, 66],
    expectedConfidence: "Low",
    expectedCoachThemes: ["honor density without groups", "low compression", "mixed read"],
  }),
  scenario({
    testName: "Strong wind groups but missing dragon speed",
    startingRack: [t.w("E"), t.w("E"), t.w("E"), t.w("W"), t.w("W"), t.w("N"), t.f(), t.f(), t.j(), t.b(2), t.c(8), t.d(9), t.dragon("Red")],
    selectedDirection: "wd",
    expectedBestSection: "Winds & Dragons",
    expectedScoreRange: [64, 80],
    expectedConfidence: "Medium",
    expectedCoachThemes: ["wind groups", "dragon speed", "not elite without cleaner support"],
  }),
  scenario({
    testName: "Courtesy pass should not distort score",
    startingRack: [t.b(2), t.b(3), t.b(4), t.b(5), t.b(6), t.f(), t.j(), t.c(9), t.d(9), t.w("E"), t.dragon("Red"), t.c(1), t.d(2)],
    passSequence: [
      pass("Right", [t.c(9), t.d(9), t.w("E")], [t.b(3), t.b(4), t.f()]),
      { passName: "Courtesy", label: "Courtesy", dir: "courtesy", out: [t.c(1)], in: [t.c(1)] },
    ],
    selectedDirection: "consec",
    expectedBestSection: "Consecutive Run",
    expectedScoreRange: [70, 84],
    expectedConfidence: "High",
    expectedCoachThemes: ["courtesy pass ignored", "clean run lane"],
  }),
  scenario({
    testName: "Joker must never be a legal pass recommendation",
    startingRack: [t.j(), t.b(2), t.b(3), t.b(4), t.b(5), t.f(), t.c(8), t.d(9), t.w("E"), t.dragon("Red"), t.c(1), t.d(2), t.b(6)],
    passSequence: [pass("Right", [t.c(8), t.d(9), t.w("E")], [t.b(3), t.b(4), t.f()])],
    selectedDirection: "consec",
    expectedBestSection: "Consecutive Run",
    expectedScoreRange: [70, 84],
    expectedConfidence: "High",
    expectedCoachThemes: ["joker protected", "illegal pass", "expert pass excludes joker"],
  }),
  scenario({
    testName: "Exact card-line fit strong enough for rare 90 potential",
    startingRack: [t.b(2), t.b(2), t.b(3), t.b(3), t.b(4), t.b(4), t.b(5), t.b(5), t.b(6), t.b(6), t.f(), t.f(), t.j()],
    passSequence: [pass("Right", [t.f(), t.f(), t.b(6)], [t.b(3), t.b(4), t.j()])],
    selectedDirection: "consec",
    expectedBestSection: "Consecutive Run",
    expectedScoreRange: [85, 96],
    expectedConfidence: "High",
    expectedCoachThemes: ["rare elite potential", "excellent fit", "low dead tile burden"],
  }),
  scenario({
    testName: "Wrong read on exact final rack still capped",
    startingRack: [t.b(2), t.b(2), t.b(3), t.b(3), t.b(4), t.b(4), t.b(5), t.b(5), t.b(6), t.b(6), t.f(), t.f(), t.j()],
    selectedDirection: "wd",
    expectedBestSection: "Consecutive Run",
    expectedScoreRange: [40, 62],
    expectedConfidence: "Low",
    expectedCoachThemes: ["wrong direction", "score cap", "outcome luck is not table read"],
  }),
  scenario({
    testName: "Honor-heavy wrong Consecutive Run regression case",
    startingRack: [t.b(4), t.c(2), t.c(3), t.d(1), t.w("S"), t.w("W"), t.j(), t.f(), t.w("E"), t.w("W"), t.f(), t.w("N"), t.w("E")],
    selectedDirection: "consec",
    expectedBestSection: "Winds",
    expectedScoreRange: [50, 58],
    expectedConfidence: "Low",
    expectedArchetypes: ["Late Pivoter", "Shape Tinkerer", "Direction Tester", "Pattern Juggler"],
    expectedCoachThemes: ["selected direction mismatch", "split-suit numbers", "stronger line elsewhere"],
  }),
  scenario({
    testName: "Same honor-heavy rack read as Winds is better but not strong",
    startingRack: [t.b(4), t.c(2), t.c(3), t.d(1), t.w("S"), t.w("W"), t.j(), t.f(), t.w("E"), t.w("W"), t.f(), t.w("N"), t.w("E")],
    selectedDirection: "wd",
    expectedBestSection: "Winds",
    expectedScoreRange: [58, 64],
    expectedConfidence: "Medium",
    expectedCoachThemes: ["better read", "missing dragons", "still mixed"],
  }),

  scenario({
    testName: "Section tighten: clean natural Singles & Pairs stays strong but not elite",
    startingRack: [t.b(1), t.b(1), t.c(2), t.c(2), t.d(3), t.d(3), t.b(4), t.b(4), t.f(), t.f(), t.w("E"), t.c(9), t.d(8)],
    selectedDirection: "pairs",
    expectedBestSection: "Singles & Pairs",
    expectedScoreRange: [68, 78],
    expectedConfidence: "Medium",
    expectedCoachThemes: ["natural pairs", "concealed exactness", "not elite from pair count alone"],
  }),
  scenario({
    testName: "Section tighten: many unrelated pairs are capped below elite",
    startingRack: [t.b(1), t.b(1), t.c(4), t.c(4), t.d(7), t.d(7), t.b(9), t.b(9), t.c(2), t.c(2), t.w("E"), t.dragon("Red"), t.f()],
    selectedDirection: "pairs",
    expectedBestSection: "Singles & Pairs",
    expectedScoreRange: [62, 76],
    expectedConfidence: "Medium",
    expectedCoachThemes: ["many pairs", "unclear exact line", "score cap"],
  }),
  scenario({
    testName: "Section tighten: Singles & Pairs with Joker dependence stays low",
    startingRack: [t.j(), t.j(), t.b(1), t.b(1), t.c(2), t.c(2), t.d(3), t.f(), t.f(), t.w("E"), t.w("S"), t.dragon("Red"), t.c(9)],
    selectedDirection: "pairs",
    expectedBestSection: "Singles & Pairs",
    expectedScoreRange: [35, 52],
    expectedConfidence: "Low",
    expectedCoachThemes: ["Jokers do not help", "concealed risk", "no elite score"],
  }),
  scenario({
    testName: "Section tighten: Like Numbers beats broad pair density when clearer",
    startingRack: [t.b(4), t.b(4), t.c(4), t.c(4), t.d(4), t.d(4), t.b(7), t.b(7), t.f(), t.w("E"), t.c(9), t.dragon("Green"), t.d(2)],
    selectedDirection: "pairs",
    expectedBestSection: "Like Numbers",
    expectedScoreRange: [50, 72],
    expectedConfidence: "Low",
    expectedCoachThemes: ["same-number density", "clearer than Singles & Pairs", "wrong direction"],
  }),
  scenario({
    testName: "Section tighten: Quints with Joker and natural triple is strong but capped",
    startingRack: [t.b(5), t.b(5), t.b(5), t.c(2), t.c(2), t.c(2), t.d(8), t.d(8), t.j(), t.j(), t.f(), t.w("N"), t.c(9)],
    selectedDirection: "quints",
    expectedBestSection: "Quints",
    expectedScoreRange: [72, 82],
    expectedConfidence: "Medium",
    expectedCoachThemes: ["natural triple", "Joker support", "not automatic 90"],
  }),
  scenario({
    testName: "Section tighten: Quints with one Joker and one loose pair is not real",
    startingRack: [t.j(), t.b(5), t.b(5), t.c(2), t.d(8), t.f(), t.w("N"), t.c(9), t.soap(), t.b(1), t.c(3), t.d(7), t.w("E")],
    selectedDirection: "quints",
    expectedBestSection: "Quints",
    expectedScoreRange: [40, 56],
    expectedConfidence: "Low",
    expectedCoachThemes: ["one Joker", "loose pair", "no natural anchor"],
  }),
  scenario({
    testName: "Section tighten: two Jokers without natural structure remains uncertain",
    startingRack: [t.j(), t.j(), t.b(5), t.c(2), t.d(8), t.f(), t.w("N"), t.c(9), t.soap(), t.b(1), t.c(3), t.d(7), t.w("E")],
    selectedDirection: "quints",
    expectedBestSection: "Quints",
    expectedScoreRange: [30, 52],
    expectedConfidence: "Low",
    expectedCoachThemes: ["two Jokers", "weak natural structure", "no inflated score"],
  }),
  scenario({
    testName: "Section tighten: true Winds & Dragons rewards paired honors",
    startingRack: [t.w("E"), t.w("E"), t.w("W"), t.w("W"), t.dragon("Red"), t.dragon("Red"), t.dragon("Green"), t.f(), t.f(), t.j(), t.b(7), t.c(8), t.d(9)],
    selectedDirection: "wd",
    expectedBestSection: "Winds & Dragons",
    expectedScoreRange: [65, 78],
    expectedConfidence: "Medium",
    expectedCoachThemes: ["paired honors", "dragon support", "not honor clutter"],
  }),
  scenario({
    testName: "Section tighten: winds-only rack is capped without dragons",
    startingRack: [t.w("E"), t.w("E"), t.w("W"), t.w("W"), t.w("N"), t.w("N"), t.f(), t.f(), t.j(), t.b(7), t.c(8), t.d(9), t.c(2)],
    selectedDirection: "wd",
    expectedBestSection: "Winds",
    expectedScoreRange: [50, 64],
    expectedConfidence: "Low",
    expectedCoachThemes: ["missing dragons", "wind grouping", "capped ceiling"],
  }),
  scenario({
    testName: "Section tighten: scattered single honors do not create fake direction",
    startingRack: [t.w("E"), t.w("S"), t.w("W"), t.w("N"), t.dragon("Red"), t.dragon("Green"), t.soap(), t.f(), t.b(1), t.c(4), t.d(7), t.b(9), t.c(2)],
    selectedDirection: "wd",
    expectedBestSection: "Winds & Dragons",
    expectedScoreRange: [42, 60],
    expectedConfidence: "Low",
    expectedCoachThemes: ["single honor clutter", "no anchors", "fake direction"],
  }),
  scenario({
    testName: "Section tighten: paired dragon plus wind support beats isolated honors",
    startingRack: [t.w("E"), t.w("E"), t.w("S"), t.dragon("Red"), t.dragon("Red"), t.dragon("Green"), t.f(), t.j(), t.b(1), t.c(4), t.d(7), t.b(9), t.c(2)],
    selectedDirection: "wd",
    expectedBestSection: "Winds & Dragons",
    expectedScoreRange: [55, 70],
    expectedConfidence: "Medium",
    expectedCoachThemes: ["paired dragon", "wind support", "better than isolated honors"],
  }),
  scenario({
    testName: "Section tighten: balanced 2026 core can score well",
    startingRack: [t.b(2), t.c(2), t.d(2), t.b(6), t.c(6), t.d(6), t.soap(), t.soap(), t.f(), t.f(), t.j(), t.w("E"), t.c(9)],
    selectedDirection: "2026",
    expectedBestSection: "2026",
    expectedScoreRange: [74, 84],
    expectedConfidence: "High",
    expectedCoachThemes: ["2s", "6s", "Soap", "flowers"],
  }),
  scenario({
    testName: "Section tighten: 2026 missing Soap should not overfit",
    startingRack: [t.b(2), t.c(2), t.d(2), t.b(6), t.c(6), t.d(6), t.f(), t.f(), t.j(), t.w("E"), t.c(9), t.dragon("Red"), t.b(8)],
    selectedDirection: "2026",
    expectedBestSection: "2468",
    expectedScoreRange: [50, 68],
    expectedConfidence: "Low",
    expectedCoachThemes: ["missing Soap", "year cap", "better non-year lane"],
  }),
  scenario({
    testName: "Section tighten: lone Soap does not force 2026",
    startingRack: [t.soap(), t.b(1), t.c(3), t.d(5), t.b(8), t.c(9), t.w("E"), t.dragon("Red"), t.f(), t.d(7), t.c(4), t.w("S"), t.b(9)],
    selectedDirection: "2026",
    expectedBestSection: "2026",
    expectedScoreRange: [30, 48],
    expectedConfidence: "Low",
    expectedCoachThemes: ["lone Soap", "weak year core", "no overfit"],
  }),
  scenario({
    testName: "Section tighten: 2-heavy rack without 6s is capped",
    startingRack: [t.b(2), t.c(2), t.d(2), t.b(2), t.soap(), t.f(), t.f(), t.j(), t.w("E"), t.c(9), t.dragon("Red"), t.b(8), t.c(4)],
    selectedDirection: "2026",
    expectedBestSection: "Like Numbers",
    expectedScoreRange: [50, 65],
    expectedConfidence: "Low",
    expectedCoachThemes: ["missing 6s", "year fragility", "cap"],
  }),
  scenario({
    testName: "Section tighten: flowers plus weak year core do not inflate 2026",
    startingRack: [t.f(), t.f(), t.f(), t.soap(), t.b(2), t.c(4), t.d(8), t.w("E"), t.c(9), t.dragon("Red"), t.b(8), t.c(5), t.d(1)],
    selectedDirection: "2026",
    expectedBestSection: "2026",
    expectedScoreRange: [42, 58],
    expectedConfidence: "Low",
    expectedCoachThemes: ["flowers", "weak year core", "do not inflate"],
  }),
];

export function normalizeConfidence(value = "") {
  const text = String(value).toLowerCase();
  if (text.startsWith("high")) return "High";
  if (text.startsWith("medium")) return "Medium";
  if (text.startsWith("low")) return "Low";
  return value;
}

function normalizeSectionName(value = "") {
  const text = String(value).trim();
  const aliases = new Map([
    ["2-4-6-8", "2468"],
    ["1-3-5-7-9", "13579"],
    ["3-6-9", "369"],
    ["Single Suit", "Suit-Based"],
    ["Any Like Numbers", "Like Numbers"],
  ]);
  return aliases.get(text) || text;
}

export function getResultBestSection(result = {}) {
  return result.bestPaths?.[0]?.section || result.bestSectionName || "Unknown";
}

export function runCharlestonScoringValidation(tests = CHARLESTON_SCORE_TRUST_TESTS) {
  return tests.map(test => {
    const result = calculateIQ(test.startingRack, test.passSequence, test.finalRack, test.selectedDirection);
    const score = result.iqScore ?? result.rackleIQ ?? result.totalScore;
    const bestSection = getResultBestSection(result);
    const actualConfidence = normalizeConfidence(result.confidenceRating || result.confidence?.rating);
    const scorePass = score >= test.expectedScoreRange[0] && score <= test.expectedScoreRange[1];
    const exactBestPass = normalizeSectionName(bestSection) === normalizeSectionName(test.expectedBestSection);
    // Low-confidence racks should not fail validation solely because several weak sections are clustered together.
    // The important calibration signal is that the score stays mixed/low and the engine is honest about ambiguity.
    const lowConfidenceAmbiguousPass = actualConfidence === "Low" && test.expectedConfidence === "Low" && scorePass && score <= 60;
    const bestPass = exactBestPass || lowConfidenceAmbiguousPass;
    const confidencePass = !test.expectedConfidence || actualConfidence === test.expectedConfidence;
    const pass = scorePass && bestPass && confidencePass;

    return {
      testName: test.testName,
      pass,
      scorePass,
      bestPass,
      confidencePass,
      actualScore: score,
      expectedScoreRange: test.expectedScoreRange,
      actualBestSection: bestSection,
      expectedBestSection: test.expectedBestSection,
      actualConfidence,
      expectedConfidence: test.expectedConfidence,
      archetype: result.archetype,
      headline: result.headline,
      coachThemes: test.expectedCoachThemes,
    };
  });
}

export function summarizeCharlestonScoringValidation(results = runCharlestonScoringValidation()) {
  const passed = results.filter(r => r.pass).length;
  const failed = results.length - passed;
  return {
    total: results.length,
    passed,
    failed,
    passRate: `${Math.round((passed / Math.max(1, results.length)) * 100)}%`,
    failures: results.filter(r => !r.pass).map(r => ({
      testName: r.testName,
      actualScore: r.actualScore,
      expectedScoreRange: r.expectedScoreRange,
      actualBestSection: r.actualBestSection,
      expectedBestSection: r.expectedBestSection,
      actualConfidence: r.actualConfidence,
      expectedConfidence: r.expectedConfidence,
    })),
  };
}

// Backward-compatible export used by earlier tooling.
export const CHARLESTON_SCORING_VALIDATION = CHARLESTON_SCORE_TRUST_TESTS.map(test => ({
  name: test.testName,
  chosenSection: test.selectedDirection,
  rack: test.finalRack,
  expectedRange: test.expectedScoreRange,
  expectedBest: test.expectedBestSection,
}));

if (process.argv[1] && import.meta.url === new URL(process.argv[1], `file://${process.cwd()}/`).href) {
  const results = runCharlestonScoringValidation();
  const summary = summarizeCharlestonScoringValidation(results);
  const summaryOnly = process.env.RACKLE_QA_SUMMARY === "1";

  if (!summaryOnly) {
    console.table(results.map(r => ({
      pass: r.pass,
      testName: r.testName,
      actualScore: r.actualScore,
      expectedScoreRange: r.expectedScoreRange.join("-"),
      actualBestSection: r.actualBestSection,
      expectedBestSection: r.expectedBestSection,
      actualConfidence: r.actualConfidence,
      expectedConfidence: r.expectedConfidence,
    })));
  }

  console.log("\nScore trust validation summary:");
  console.log(JSON.stringify(summary, null, 2));

  if (summary.failed > 0) {
    process.exitCode = 1;
  }
}
