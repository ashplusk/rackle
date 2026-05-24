import { bestCardLineFit, getCardLineKeepWeights, summarizeBestCardLine } from "./nmjl-2026-card-lines.js";

// ─── Rackle v2 · Game engine ──────────────────────────────────────────────────
// Tile generation, Charleston simulation, and IQ scoring.
// Pure JS — no React, no DOM dependencies.

// ── Tile pool ─────────────────────────────────────────────────────────────────

const SUITS = ["bam", "crak", "dot"];

export function buildDeck() {
  const d = [];
  // Suited: 9 numbers × 3 suits × 4 copies = 108
  SUITS.forEach(s => {
    for (let n = 1; n <= 9; n++)
      for (let i = 0; i < 4; i++)
        d.push({ t: "s", s, n });
  });
  // Winds × 4 = 16
  ["E", "S", "W", "N"].forEach(v => {
    for (let i = 0; i < 4; i++) d.push({ t: "w", v });
  });
  // Dragons × 4 = 12
  ["Red", "Grn", "Soap"].forEach(v => {
    for (let i = 0; i < 4; i++) d.push({ t: "d", v });
  });
  // Flowers = 8
  for (let i = 0; i < 8; i++) d.push({ t: "f" });
  // Jokers = 8
  for (let i = 0; i < 8; i++) d.push({ t: "j" });
  return d; // 152 tiles
}

// ── Seeded RNG (LCG — matches v1) ────────────────────────────────────────────

function lcgStep(s) { return (s * 16807) % 2147483647; }

export function seededShuffle(arr, seed) {
  const b = [...arr];
  let s = seed;
  for (let i = b.length - 1; i > 0; i--) {
    s = lcgStep(s);
    const j = s % (i + 1);
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

// ── Daily rack ────────────────────────────────────────────────────────────────

/** Deal the daily 13-tile rack from a seeded shuffle */
export function dealDailyRack(seed) {
  return seededShuffle(buildDeck(), seed).slice(0, 13);
}

/** Deal a varied, realistic 13-tile practice rack.
 *
 * Practice Room stays simple in the UI, but the generator quietly rotates
 * through subtle rack shapes so play does not feel repetitive or chaotic.
 * Daily Rackle does not use this path.
 */
export function dealPracticeRack(options = {}) {
  return buildPracticeRack(options);
}

const PRACTICE_ARCHETYPE_WEIGHTS = [
  { id: "random", weight: 30 },
  { id: "messy", weight: 16 },
  { id: "consecutive", weight: 14 },
  { id: "like", weight: 12 },
  { id: "pair-heavy", weight: 10 },
  { id: "honors", weight: 9 },
  { id: "strong", weight: 9 },
];

function randomItem(items = []) {
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randomShuffle(arr = []) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function choosePracticeArchetype(requested = null) {
  if (requested && PRACTICE_ARCHETYPE_WEIGHTS.some(item => item.id === requested)) return requested;

  const total = PRACTICE_ARCHETYPE_WEIGHTS.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of PRACTICE_ARCHETYPE_WEIGHTS) {
    roll -= item.weight;
    if (roll <= 0) return item.id;
  }
  return "random";
}

function practiceTileMatches(tile, spec) {
  if (!tile || !spec || tile.t !== spec.t) return false;
  if (spec.t === "s") return tile.s === spec.s && tile.n === spec.n;
  if (spec.t === "w") return tile.v === spec.v;
  if (spec.t === "d") return tile.v === spec.v;
  return true;
}

function pullPracticeTile(deck, spec) {
  const index = deck.findIndex(tile => practiceTileMatches(tile, spec));
  if (index < 0) return null;
  const [tile] = deck.splice(index, 1);
  return tile;
}

function suitedSpec(suit, n) { return { t: "s", s: suit, n }; }
function windSpec(v) { return { t: "w", v }; }
function dragonSpec(v) { return { t: "d", v }; }
function flowerSpec() { return { t: "f" }; }

function uniqueSpecs(specs = []) {
  const seen = new Map();
  return specs.filter(spec => {
    const key = spec.t === "s" ? `${spec.t}-${spec.s}-${spec.n}` : spec.t === "w" || spec.t === "d" ? `${spec.t}-${spec.v}` : spec.t;
    const count = seen.get(key) || 0;
    const max = spec.t === "f" ? 8 : spec.t === "j" ? 8 : 4;
    if (count >= max) return false;
    seen.set(key, count + 1);
    return true;
  });
}

function practiceForcedSpecs(archetype) {
  const suit = randomItem(SUITS);
  const suit2 = randomItem(SUITS.filter(item => item !== suit));
  const suit3 = randomItem(SUITS.filter(item => item !== suit && item !== suit2));
  const number = randomInt(1, 9);
  const runStart = randomInt(1, 7);
  const wind = randomItem(["E", "S", "W", "N"]);
  const wind2 = randomItem(["E", "S", "W", "N"].filter(item => item !== wind));
  const dragon = randomItem(["Red", "Grn", "Soap"]);

  if (archetype === "pair-heavy") {
    const pairA = suitedSpec(suit, number);
    const pairB = suitedSpec(suit2, randomInt(1, 9));
    const pairC = Math.random() < 0.65 ? suitedSpec(suit3, randomInt(1, 9)) : windSpec(wind);
    return uniqueSpecs([pairA, pairA, pairB, pairB, pairC, pairC]);
  }

  if (archetype === "honors") {
    return uniqueSpecs([
      windSpec(wind),
      windSpec(wind),
      windSpec(wind2),
      dragonSpec(dragon),
      Math.random() < 0.45 ? dragonSpec(dragon) : dragonSpec(randomItem(["Red", "Grn", "Soap"])),
      suitedSpec(suit, randomInt(2, 8)),
    ]);
  }

  if (archetype === "consecutive") {
    const nums = [runStart, runStart + 1, runStart + 2];
    return uniqueSpecs([
      suitedSpec(suit, nums[0]),
      suitedSpec(suit, nums[1]),
      suitedSpec(suit, nums[1]),
      suitedSpec(suit, nums[2]),
      suitedSpec(Math.random() < 0.55 ? suit : suit2, Math.max(1, Math.min(9, nums[2] + 1))),
    ]);
  }

  if (archetype === "like") {
    return uniqueSpecs([
      suitedSpec(suit, number),
      suitedSpec(suit, number),
      suitedSpec(suit2, number),
      suitedSpec(suit3, number),
      suitedSpec(randomItem(SUITS), Math.max(1, Math.min(9, number + (Math.random() < 0.5 ? -1 : 1)))),
    ]);
  }

  if (archetype === "messy") {
    return uniqueSpecs([
      suitedSpec("bam", randomItem([1, 4, 8])),
      suitedSpec("crak", randomItem([2, 5, 9])),
      suitedSpec("dot", randomItem([3, 6, 7])),
      windSpec(wind),
      dragonSpec(dragon),
    ]);
  }

  if (archetype === "strong") {
    const strongType = randomItem(["year", "run", "like", "wd"]);
    if (strongType === "year") {
      return uniqueSpecs([
        suitedSpec(suit, 2),
        suitedSpec(suit, 2),
        suitedSpec(suit2, 6),
        dragonSpec("Soap"),
        flowerSpec(),
        suitedSpec(suit3, randomItem([2, 6])),
      ]);
    }
    if (strongType === "wd") {
      return uniqueSpecs([
        windSpec(wind),
        windSpec(wind),
        windSpec(wind2),
        dragonSpec(dragon),
        dragonSpec(dragon),
        flowerSpec(),
      ]);
    }
    if (strongType === "like") {
      return uniqueSpecs([
        suitedSpec(suit, number),
        suitedSpec(suit, number),
        suitedSpec(suit2, number),
        suitedSpec(suit2, number),
        suitedSpec(suit3, number),
        flowerSpec(),
      ]);
    }
    return uniqueSpecs([
      suitedSpec(suit, runStart),
      suitedSpec(suit, runStart + 1),
      suitedSpec(suit, runStart + 1),
      suitedSpec(suit, runStart + 2),
      suitedSpec(suit, runStart + 2),
      flowerSpec(),
    ]);
  }

  return [];
}

function buildPracticeRack(options = {}) {
  const archetype = choosePracticeArchetype(options.archetype);
  const deck = randomShuffle(buildDeck());
  const rack = [];

  practiceForcedSpecs(archetype).forEach(spec => {
    if (rack.length >= 13) return;
    const tile = pullPracticeTile(deck, spec);
    if (tile) rack.push(tile);
  });

  while (rack.length < 13 && deck.length) {
    rack.push(deck.shift());
  }

  return randomShuffle(rack.slice(0, 13));
}

/**
 * Get the predetermined incoming tiles for each Charleston pass.
 * Virtual players have their own racks (seeded) and pass their weakest tiles.
 * passNum: 1 = from left, 2 = from across, 3 = from right
 */
export function getIncomingTiles(seed, passNum, currentRackAfterOutgoing = null) {
  // Virtual players' racks start after the player's 13 tiles.
  // Left player: tiles 13-25, Across: 26-38, Right: 39-51.
  const deck = seededShuffle(buildDeck(), seed);
  const offsets = { 1: 13, 2: 26, 3: 39 };
  const start = offsets[passNum] ?? 13;
  const virtualRack = deck.slice(start, start + 13);
  const incoming = chooseVirtualCharlestonPass(virtualRack, passNum, seed);

  return sanitizeIncomingTiles(incoming, currentRackAfterOutgoing, deck, seed, passNum);
}

// ── Charleston evaluation model ─────────────────────────────────────────────
// Frontend-only Rackle evaluator. No backend schema or Supabase changes.
// Goal: directionally credible NMJL Charleston reads, not exact card solving.

const SECTION_META = {
  "2026": {
    name: "2026",
    needs: "2s, 6s, Soap, flowers, and clean year structure.",
    risk: "Year hands can look tempting but become fragile when the 2/6/Soap core is thin.",
  },
  evens: {
    name: "2-4-6-8",
    needs: "Even-number density, duplicate evens, suit concentration, and useful dragon support.",
    risk: "Evens get weak when odd singles and loose honors stay in the rack too long.",
  },
  like: {
    name: "Any Like Numbers",
    needs: "Same-number concentration across suits, natural pairs, and joker-supported groups.",
    risk: "Like Numbers need a real number cluster, not just several unrelated duplicates.",
  },
  quints: {
    name: "Quints",
    needs: "Natural pairs, triples, same-number clusters, and joker acceleration.",
    risk: "Quints become low-percentage without joker help or several natural pairs.",
  },
  consec: {
    name: "Consecutive Run",
    needs: "A compact run, duplicate middle numbers, and one or two suits doing most of the work.",
    risk: "Edge-only runs and split suits create pretty shape without enough speed.",
  },
  odds: {
    name: "1-3-5-7-9",
    needs: "Odd-number density, duplicate odds, and a strong suit or number lane.",
    risk: "Odd racks drift when every odd tile points to a different idea.",
  },
  wd: {
    name: "Winds & Dragons",
    needs: "Honor density, matching winds or dragons, and enough duplicate support.",
    risk: "Single winds and isolated dragons are often dead weight, not a direction.",
  },
  threeSixNine: {
    name: "3-6-9",
    needs: "3s, 6s, 9s, matching dragons, and clean discipline around the core numbers.",
    risk: "This lane punishes generic odd/even drift. The 3-6-9 core has to stay clean.",
  },
  pairs: {
    name: "Singles & Pairs",
    needs: "Natural pairs, exact tiles, flowers, and low joker dependency.",
    risk: "Singles & Pairs require precision. Jokers do very little here.",
  },
  suited: {
    name: "Single Suit",
    needs: "Dominant suit density, duplicate suit anchors, and low off-suit noise.",
    risk: "Single-suit reads collapse when the rack carries too many off-suit singles.",
  },
  other: {
    name: "Other / Unsure",
    needs: "A clearer signal before committing.",
    risk: "Unclear reads need cleanup first. Keep structure, cut noise.",
  },
};

const SECTIONS = Object.entries(SECTION_META)
  .filter(([id]) => id !== "other")
  .map(([id, meta]) => ({ id, name: meta.name }));

// ── Tile utilities ────────────────────────────────────────────────────────────

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(Number(n) || 0)));
}

function tileKey(t) {
  if (!t) return "x";
  if (t.t === "s") return `s-${t.s}-${t.n}`;
  if (t.t === "d") return `d-${t.v}`;
  if (t.t === "w") return `w-${t.v}`;
  return t.t;
}


function legalTileMax(tile) {
  if (!tile) return 0;
  if (tile.t === "s") return 4;
  if (tile.t === "w") return 4;
  if (tile.t === "d") return 4;
  if (tile.t === "f") return 8;
  if (tile.t === "j") return 8;
  return 0;
}

function sanitizeIncomingTiles(incoming = [], currentRackAfterOutgoing = null, deck = buildDeck(), seed = 1, passNum = 1) {
  if (!Array.isArray(currentRackAfterOutgoing)) return incoming.filter(tile => tile?.t !== "j").slice(0, 3);

  const counts = freqMap(currentRackAfterOutgoing, true);
  const usedReplacementKeys = new Map();
  const candidatePool = seededShuffle(deck, Math.max(1, (Number(seed) || 1) + passNum * 104729))
    .filter(tile => tile?.t !== "j");

  const canAdd = tile => {
    const key = tileKey(tile);
    const nextCount = (counts[key] || 0) + 1;
    return nextCount <= legalTileMax(tile);
  };

  const addTile = tile => {
    const key = tileKey(tile);
    counts[key] = (counts[key] || 0) + 1;
    return tile;
  };

  const safeIncoming = [];
  (incoming || []).forEach(tile => {
    if (safeIncoming.length >= 3 || tile?.t === "j") return;
    if (canAdd(tile)) safeIncoming.push(addTile(tile));
  });

  for (const candidate of candidatePool) {
    if (safeIncoming.length >= 3) break;
    if (!canAdd(candidate)) continue;

    const key = tileKey(candidate);
    const replacementCopies = usedReplacementKeys.get(key) || 0;
    if (replacementCopies >= legalTileMax(candidate)) continue;

    usedReplacementKeys.set(key, replacementCopies + 1);
    safeIncoming.push(addTile(candidate));
  }

  return safeIncoming.slice(0, 3);
}

function tileLabelShort(t) {
  if (!t) return "";
  if (t.t === "s") {
    const suit = t.s === "bam" ? "Bam" : t.s === "crak" ? "Crak" : "Dot";
    return `${t.n} ${suit}`;
  }
  if (t.t === "d") return `${t.v === "Grn" ? "Green" : t.v} Dragon`;
  if (t.t === "w") return `${t.v} Wind`;
  if (t.t === "f") return "Flower";
  if (t.t === "j") return "Joker";
  return "Tile";
}

function freqMap(rack, includeJokers = false) {
  const freq = {};
  (rack || []).forEach(t => {
    if (!includeJokers && t?.t === "j") return;
    const k = tileKey(t);
    freq[k] = (freq[k] || 0) + 1;
  });
  return freq;
}

function countPairs(freq) { return Object.values(freq).filter(c => c >= 2).length; }
function countTriples(freq) { return Object.values(freq).filter(c => c >= 3).length; }
function countQuads(freq) { return Object.values(freq).filter(c => c >= 4).length; }

function sectionName(id) {
  return SECTION_META[id]?.name || id || "Other / Unsure";
}

function sectionDisplayName(id, sig = null) {
  if (id === "wd" && sig && sig.dragons === 0) return "Winds";
  return sectionName(id);
}

function getConsecMetrics(rack = []) {
  const suited = rack.filter(t => t?.t === "s");
  const bySuit = { bam: {}, crak: {}, dot: {} };
  const allNums = {};

  suited.forEach(t => {
    bySuit[t.s][t.n] = (bySuit[t.s][t.n] || 0) + 1;
    allNums[t.n] = (allNums[t.n] || 0) + 1;
  });

  let bestSameSuitWindow = 0;
  let bestSameSuitUnique = 0;
  let bestSuit = null;
  let bestStart = null;
  let duplicateAnchors = 0;
  let mixedWindow = 0;

  for (let start = 1; start <= 7; start++) {
    const nums = [start, start + 1, start + 2];
    const mixed = nums.reduce((sum, n) => sum + (allNums[n] || 0), 0);
    if (mixed > mixedWindow) mixedWindow = mixed;

    for (const suit of SUITS) {
      const total = nums.reduce((sum, n) => sum + (bySuit[suit][n] || 0), 0);
      const unique = nums.filter(n => (bySuit[suit][n] || 0) > 0).length;
      const dupes = nums.filter(n => (bySuit[suit][n] || 0) >= 2).length;
      if (total > bestSameSuitWindow || (total === bestSameSuitWindow && unique > bestSameSuitUnique)) {
        bestSameSuitWindow = total;
        bestSameSuitUnique = unique;
        bestSuit = suit;
        bestStart = start;
        duplicateAnchors = dupes;
      }
    }
  }

  return {
    mixedWindow,
    bestSameSuitWindow,
    bestSameSuitUnique,
    bestSuit,
    bestStart,
    duplicateAnchors,
  };
}

function sectionSupportCount(rack = [], section, includeJokers = false) {
  return supportingTilesForSection(rack, section).filter(t => includeJokers || t?.t !== "j").length;
}


function addLineWeight(lineWeights, key, weight, lineName) {
  if (!key) return;
  const current = lineWeights.get(key) || { weight: 0, lines: new Set() };
  current.weight += weight;
  if (lineName) current.lines.add(lineName);
  lineWeights.set(key, current);
}

function addRackTileLineWeight(lineWeights, rack, predicate, weight, lineName) {
  (rack || []).forEach(tile => {
    if (predicate(tile)) addLineWeight(lineWeights, tileKey(tile), weight, lineName);
  });
}

function bestNumberInSet(rack = [], numbers = []) {
  const allowed = new Set(numbers);
  const counts = {};
  (rack || []).forEach(tile => {
    if (tile?.t !== "s" || !allowed.has(tile.n)) return;
    counts[tile.n] = (counts[tile.n] || 0) + 1;
  });
  const [num] = Object.entries(counts).sort((a, b) => (b[1] - a[1]) || (Number(a[0]) - Number(b[0])))[0] || [];
  return num ? Number(num) : null;
}

function bestSuitForNumbers(rack = [], numbers = []) {
  const allowed = new Set(numbers);
  const suitScores = { bam: 0, crak: 0, dot: 0 };
  (rack || []).forEach(tile => {
    if (tile?.t === "s" && allowed.has(tile.n)) suitScores[tile.s] += 1;
  });
  const [suit] = Object.entries(suitScores).sort((a, b) => b[1] - a[1])[0] || [];
  return suit || null;
}

function addNaturalGroupLineWeights(lineWeights, rack = [], minCount = 2, weight = 20, lineName = "Natural group") {
  const counts = freqMap(rack, true);
  (rack || []).forEach(tile => {
    if (tile?.t === "j") return;
    const count = counts[tileKey(tile)] || 0;
    if (count >= minCount) addLineWeight(lineWeights, tileKey(tile), weight + Math.min(3, count) * 4, lineName);
  });
}

function addLineWeightsForSection(lineWeights, rack = [], sectionId = "other", sig = analyzeRackSignals(rack), lineRank = 0) {
  const rankBonus = lineRank === 0 ? 8 : 0;
  const counts = freqMap(rack, true);
  const line = (name) => `${sectionName(sectionId)}: ${name}`;

  if (sectionId === "2026") {
    const twos = rack.filter(tile => tile?.t === "s" && tile.n === 2).length;
    const sixes = rack.filter(tile => tile?.t === "s" && tile.n === 6).length;
    const soaps = rack.filter(tile => tile?.t === "d" && tile.v === "Soap").length;
    const coreIsReal = (twos + sixes + soaps + sig.flowers) >= 4 && soaps >= 1 && (twos >= 1 || sixes >= 1);

    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "d" && tile.v === "Soap", coreIsReal ? 38 + rankBonus : 22, line("year soap anchor"));
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "s" && tile.n === 2, sixes || soaps ? 26 + rankBonus : 14, line("2/6 year core"));
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "s" && tile.n === 6, twos || soaps ? 26 + rankBonus : 14, line("2/6 year core"));
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "f", coreIsReal ? 24 + rankBonus : 10, line("year flower support"));
    return;
  }

  if (sectionId === "consec") {
    const metrics = getConsecMetrics(rack);
    const suit = metrics.bestSuit || sig.dominantSuit;
    const start = metrics.bestStart || sig.bestRunStart || 1;
    const window = [start, start + 1, start + 2].filter(n => n >= 1 && n <= 9);
    const extended = [start - 1, ...window, start + 3].filter(n => n >= 1 && n <= 9);
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "s" && tile.s === suit && window.includes(tile.n), 30 + rankBonus, line("same-suit run core"));
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "s" && tile.s === suit && extended.includes(tile.n), 14, line("same-suit run edge"));
    addNaturalGroupLineWeights(lineWeights, rack.filter(tile => tile?.t === "s" && tile.s === suit && window.includes(tile.n)), 2, 10, line("run duplicate anchor"));
    return;
  }

  if (sectionId === "like") {
    const likeNumber = sig.bestLikeNumber;
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "s" && tile.n === likeNumber, 34 + rankBonus, line("same-number core"));
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "s" && Math.abs(tile.n - likeNumber) === 1 && (counts[tileKey(tile)] || 0) >= 2, 8, line("nearby pair fallback"));
    return;
  }

  if (sectionId === "quints") {
    addNaturalGroupLineWeights(lineWeights, rack, 3, 42 + rankBonus, line("natural triple anchor"));
    addNaturalGroupLineWeights(lineWeights, rack, 2, 24 + rankBonus, line("natural pair anchor"));
    if (sig.jokers > 0 && (sig.triples > 0 || sig.pairs >= 2)) {
      addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "j", 70, line("joker quint fuel"));
    }
    return;
  }

  if (sectionId === "wd") {
    const trueWd = sig.dragons >= 1 && sig.honors >= 4;
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "w" && (counts[tileKey(tile)] || 0) >= 2, 34 + rankBonus, line("paired wind"));
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "d" && (counts[tileKey(tile)] || 0) >= 2, 38 + rankBonus, line("paired dragon"));
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "d" && trueWd, 20 + rankBonus, line("dragon balance"));
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "w" && trueWd && (counts[tileKey(tile)] || 0) === 1, 11, line("wind support"));
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "f" && sig.flowerPair, 14, line("flower pair support"));
    return;
  }

  if (sectionId === "threeSixNine") {
    const suit = bestSuitForNumbers(rack, [3, 6, 9]) || sig.dominantSuit;
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "s" && tile.s === suit && [3, 6, 9].includes(tile.n), 30 + rankBonus, line("same-suit 3-6-9 core"));
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "s" && [3, 6, 9].includes(tile.n) && (counts[tileKey(tile)] || 0) >= 2, 18, line("3-6-9 pair anchor"));
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "d" && sig.threeSixNine >= 4, 12, line("dragon support"));
    return;
  }

  if (sectionId === "evens") {
    const suit = bestSuitForNumbers(rack, [2, 4, 6, 8]) || sig.dominantSuit;
    const bestEven = bestNumberInSet(rack, [2, 4, 6, 8]);
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "s" && tile.s === suit && [2, 4, 6, 8].includes(tile.n), 24 + rankBonus, line("same-suit even lane"));
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "s" && tile.n === bestEven, 18, line("even like-number option"));
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "d" && sig.evens >= 5, 8, line("dragon-supported even hand"));
    return;
  }

  if (sectionId === "odds") {
    const suit = bestSuitForNumbers(rack, [1, 3, 5, 7, 9]) || sig.dominantSuit;
    const bestOdd = bestNumberInSet(rack, [1, 3, 5, 7, 9]);
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "s" && tile.s === suit && [1, 3, 5, 7, 9].includes(tile.n), 22 + rankBonus, line("same-suit odd lane"));
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "s" && tile.n === bestOdd, 18, line("odd like-number option"));
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "f" && sig.odds >= 5, 8, line("odd hand flower support"));
    return;
  }

  if (sectionId === "pairs") {
    addNaturalGroupLineWeights(lineWeights, rack, 2, 38 + rankBonus, line("natural pair"));
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "f" && sig.pairs >= 3, 18 + rankBonus, line("concealed flower support"));
    return;
  }

  if (sectionId === "suited") {
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "s" && tile.s === sig.dominantSuit, 22 + rankBonus, line("dominant suit lane"));
    addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "s" && tile.s === sig.dominantSuit && (counts[tileKey(tile)] || 0) >= 2, 14, line("same-suit pair anchor"));
  }
}

function buildLineAwareKeepProfile(rack = [], topSections = [], sig = analyzeRackSignals(rack)) {
  const lineWeights = new Map();
  const sections = topSections.length ? topSections : scoreSections(rack).slice(0, 2);
  sections.forEach((section, index) => {
    addLineWeightsForSection(lineWeights, rack, section.id, sig, index);

    const cardLineWeights = getCardLineKeepWeights(rack, section.id, index === 0 ? 3 : 2);
    cardLineWeights.weights.forEach((weight, key) => {
      const lineNames = cardLineWeights.linesByKey.get(key) || [];
      addLineWeight(lineWeights, key, weight + (index === 0 ? 8 : 0), lineNames[0] ? `2026 card line: ${lineNames[0]}` : "2026 card line support");
    });
  });

  addRackTileLineWeight(lineWeights, rack, tile => tile?.t === "j", 120, "Illegal pass");

  const linesByKey = new Map();
  lineWeights.forEach((entry, key) => {
    linesByKey.set(key, [...entry.lines]);
  });

  return { lineWeights, linesByKey };
}

/** Individual tile strength heuristic for virtual player passing */
function tileIndividualStrength(tile) {
  if (!tile) return 0;
  if (tile.t === "j") return 100; // jokers never passed
  if (tile.t === "f") return 3;
  if (tile.t === "d") return 4;
  if (tile.t === "w") return 3.5;
  const n = tile.n || 0;
  const middle = n >= 3 && n <= 7 ? 1.2 : 0;
  const sectionAffinity = [2, 4, 6, 8].includes(n) || [1, 3, 5, 7, 9].includes(n) ? 0.6 : 0;
  return 5 + middle + sectionAffinity;
}

function isHonorTile(tile) {
  return tile?.t === "w" || tile?.t === "d";
}

function virtualTilePassValue(tile, rack = [], topSections = [], sig = analyzeRackSignals(rack), lineProfile = null, valueMapByKey = null) {
  if (!tile) return 0;
  if (tile.t === "j") return 999;

  const primarySection = topSections[0]?.id || bestSection(rack)?.id || "other";
  const sectionIds = new Set(topSections.map(sec => sec.id));
  const freq = freqMap(rack, true);
  const key = tileKey(tile);
  const count = freq[key] || 0;
  const supportSections = topSections.filter(sec =>
    supportingTilesForSection(rack, sec.id).some(supportTile => tileKey(supportTile) === key)
  );
  const supportsPrimary = supportSections.some(sec => sec.id === primarySection);
  const supportsTopTwo = supportSections.length > 0;
  const mapped = valueMapByKey?.get(key) || tileValueMapForRack(rack, primarySection, topSections).find(item => item.key === key);
  const profile = lineProfile || buildLineAwareKeepProfile(rack, topSections, sig);
  const lineEntry = profile.lineWeights.get(key);

  let value = mapped?.valueScore ?? tileIndividualStrength(tile) * 8;
  if (lineEntry?.weight) value += lineEntry.weight;

  // Natural groups are protected. Real players do not casually pass pairs unless
  // they are clearly outside both leading reads.
  if (count >= 4) value += 42;
  else if (count >= 3) value += 34;
  else if (count >= 2) value += supportsTopTwo ? 30 : 18;

  if (supportsPrimary) value += 18;
  else if (supportsTopTwo) value += 10;

  if (tile.t === "f") {
    if (["2026", "pairs", "wd"].includes(primarySection)) value += 22;
    if (sig.flowers >= 2) value += 12;
    else value += 4;
  }

  if (tile.t === "d" && tile.v === "Soap" && sectionIds.has("2026")) value += 26;

  if (isHonorTile(tile)) {
    const honorPairCount = (sig.windPairs?.length || 0) + (sig.dragonPairs?.length || 0);
    if (primarySection === "wd") value += 32;
    if (count >= 2) value += 28;
    if (tile.t === "d" && sectionIds.has("threeSixNine")) value += 10;

    // Isolated honors are passable, but avoid making every virtual pass three
    // winds and dragons.
    if (count <= 1 && primarySection !== "wd" && honorPairCount === 0) value -= 8;
  }

  if (tile.t === "s") {
    if (primarySection === "suited" && tile.s === sig.dominantSuit) value += 18;
    if (["consec", "evens", "odds", "like", "threeSixNine", "2026"].includes(primarySection) && supportsTopTwo) value += 8;
    if (tile.s !== sig.dominantSuit && sig.dominantSuitCount >= 6 && !supportsTopTwo && count <= 1) value -= 6;
  }

  return clamp(value, 0, 999);
}

function isClearlyOffPathPair(tile, rack = [], topSections = [], lineProfile = null) {
  const key = tileKey(tile);
  const count = freqMap(rack, true)[key] || 0;
  if (count < 2) return false;
  const supportsTop = topSections.some(sec =>
    supportingTilesForSection(rack, sec.id).some(supportTile => tileKey(supportTile) === key)
  );
  const lineEntry = lineProfile?.lineWeights?.get(key);
  return !supportsTop && !lineEntry?.weight;
}

function chooseVirtualCharlestonPass(virtualRack = [], passNum = 1, seed = 1) {
  const legalTiles = (virtualRack || []).filter(tile => tile?.t !== "j");
  if (legalTiles.length <= 3) return legalTiles.slice(0, 3);

  const topSections = scoreSections(virtualRack).slice(0, 2);
  const sig = analyzeRackSignals(virtualRack);
  const freq = freqMap(virtualRack, true);
  const primaryId = topSections[0]?.id;
  const topIds = new Set(topSections.map(sec => sec.id));
  const lineProfile = buildLineAwareKeepProfile(virtualRack, topSections, sig);
  const valueMapByKey = new Map(tileValueMapForRack(virtualRack, primaryId, topSections).map(item => [item.key, item]));
  const nonHonorCount = legalTiles.filter(tile => !isHonorTile(tile)).length;
  const honorSelector = Math.abs((Number(seed) || 1) + passNum * 7919 + sig.honors * 37) % 4;
  const maxHonorPasses = primaryId === "wd" ? 0 : nonHonorCount >= 3 ? (honorSelector === 0 ? 0 : 1) : 2;
  const maxFlowerPasses = topIds.has("2026") || topIds.has("pairs") ? 0 : 1;

  const candidates = legalTiles.map((tile, index) => {
    const key = tileKey(tile);
    const value = virtualTilePassValue(tile, virtualRack, topSections, sig, lineProfile, valueMapByKey);
    const isPair = (freq[key] || 0) >= 2;
    const lineEntry = lineProfile.lineWeights.get(key);
    const clearlyOffPathPair = isClearlyOffPathPair(tile, virtualRack, topSections, lineProfile);
    return {
      tile,
      index,
      key,
      value,
      isHonor: isHonorTile(tile),
      isFlower: tile?.t === "f",
      isPair,
      lineWeight: lineEntry?.weight || 0,
      lineNames: lineEntry ? [...lineEntry.lines] : [],
      clearlyOffPathPair,
    };
  }).sort((a, b) =>
    (a.value - b.value) ||
    (tileIndividualStrength(a.tile) - tileIndividualStrength(b.tile)) ||
    (a.index - b.index)
  );

  const selected = [];
  const selectedKeys = new Map();

  const canUse = candidate => {
    if (!candidate || selected.length >= 3) return false;
    if (candidate.tile?.t === "j") return false;

    const selectedSame = selectedKeys.get(candidate.key) || 0;
    if (selectedSame >= (freq[candidate.key] || 0)) return false;

    const selectedHonors = selected.filter(item => item.isHonor).length;
    const selectedFlowers = selected.filter(item => item.isFlower).length;

    if (candidate.isHonor && selectedHonors >= maxHonorPasses) {
      const nonHonorAlternatives = candidates.filter(item =>
        !item.isHonor &&
        !selected.includes(item)
      );
      if (nonHonorAlternatives.length >= 3 - selected.length) return false;
    }

    if (candidate.isFlower && selectedFlowers >= maxFlowerPasses) {
      const nonFlowerAlternatives = candidates.filter(item =>
        !item.isFlower &&
        !selected.includes(item)
      );
      if (nonFlowerAlternatives.length >= 3 - selected.length) return false;
    }

    if (candidate.isPair && !candidate.clearlyOffPathPair) {
      const singletonAlternatives = candidates.filter(item =>
        !item.isPair &&
        !selected.includes(item) &&
        item.value <= candidate.value + 24
      );
      if (singletonAlternatives.length >= 3 - selected.length) return false;
    }

    return true;
  };

  candidates.forEach(candidate => {
    if (canUse(candidate)) {
      selected.push(candidate);
      selectedKeys.set(candidate.key, (selectedKeys.get(candidate.key) || 0) + 1);
    }
  });

  // If strict realism filters leave fewer than 3 tiles, fill with the next legal
  // low-value tiles. Jokers are still never eligible.
  candidates.forEach(candidate => {
    if (selected.length >= 3 || selected.includes(candidate)) return;
    selected.push(candidate);
  });

  return selected.slice(0, 3).map(item => item.tile);
}

// ── Rack signals ──────────────────────────────────────────────────────────────

export function analyzeRackSignals(rack = []) {
  const suited = rack.filter(t => t.t === "s");
  const honors = rack.filter(t => t.t === "w" || t.t === "d");
  const dragons = rack.filter(t => t.t === "d");
  const winds = rack.filter(t => t.t === "w");
  const flowers = rack.filter(t => t.t === "f").length;
  const jokers = rack.filter(t => t.t === "j").length;
  const freq = freqMap(rack);
  const pairs = countPairs(freq);
  const triples = countTriples(freq);
  const quads = countQuads(freq);

  const suitCounts = { bam: 0, crak: 0, dot: 0 };
  const numCounts = {};
  suited.forEach(t => {
    suitCounts[t.s] = (suitCounts[t.s] || 0) + 1;
    numCounts[t.n] = (numCounts[t.n] || 0) + 1;
  });

  const dominantSuit = Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0] || ["", 0];
  const bestLike = Object.entries(numCounts).sort((a, b) => b[1] - a[1])[0] || ["", 0];
  const evens = suited.filter(t => [2,4,6,8].includes(t.n)).length;
  const odds = suited.filter(t => [1,3,5,7,9].includes(t.n)).length;
  const threeSixNine = suited.filter(t => [3,6,9].includes(t.n)).length;
  const twos = suited.filter(t => t.n === 2).length;
  const sixes = suited.filter(t => t.n === 6).length;
  const soap = dragons.filter(t => t.v === "Soap").length;
  const yearCore = rack.filter(t =>
    t.t === "f" || t.t === "j" ||
    (t.t === "d" && t.v === "Soap") ||
    (t.t === "s" && [2,6].includes(t.n))
  ).length;

  let bestRun = 0;
  let bestRunStart = null;
  for (let n = 1; n <= 7; n++) {
    const run = (numCounts[n] || 0) + (numCounts[n + 1] || 0) + (numCounts[n + 2] || 0);
    if (run > bestRun) {
      bestRun = run;
      bestRunStart = n;
    }
  }

  const isolatedHonors = honors.filter(t => (freq[tileKey(t)] || 0) === 1).length;
  const isolatedSuited = suited.filter(t => {
    const same = (freq[tileKey(t)] || 0) > 1;
    const neighbor = suited.some(o => o !== t && o.s === t.s && Math.abs((o.n || 0) - (t.n || 0)) <= 2);
    const like = (numCounts[t.n] || 0) >= 2;
    return !same && !neighbor && !like;
  }).length;

  const deadTileBurden = isolatedHonors + isolatedSuited;
  const windCounts = {};
  const dragonCounts = {};
  winds.forEach(t => { windCounts[t.v] = (windCounts[t.v] || 0) + 1; });
  dragons.forEach(t => { dragonCounts[t.v] = (dragonCounts[t.v] || 0) + 1; });
  const windPairs = Object.entries(windCounts).filter(([, c]) => c >= 2).map(([v]) => v);
  const dragonPairs = Object.entries(dragonCounts).filter(([, c]) => c >= 2).map(([v]) => v);
  const flowerPair = flowers >= 2;
  const groupStrength = pairs * 8 + triples * 14 + quads * 18 + (pairs >= 2 ? jokers * 4 : 0);
  const suitConcentration = dominantSuit[1] ? (dominantSuit[1] / Math.max(1, suited.length)) * 100 : 0;
  const numberConcentration = bestLike[1] ? (bestLike[1] / Math.max(1, suited.length)) * 100 : 0;

  return {
    suitCounts,
    numCounts,
    dominantSuit: dominantSuit[0],
    dominantSuitCount: dominantSuit[1],
    bestLikeNumber: bestLike[0] ? Number(bestLike[0]) : null,
    bestLikeCount: bestLike[1],
    pairs,
    triples,
    quads,
    jokers,
    flowers,
    honors: honors.length,
    winds: winds.length,
    dragons: dragons.length,
    windPairs,
    dragonPairs,
    flowerPair,
    evens,
    odds,
    threeSixNine,
    twos,
    sixes,
    soap,
    yearCore,
    bestRun,
    bestRunStart,
    isolatedHonors,
    isolatedSuited,
    deadTileBurden,
    groupStrength,
    suitConcentration,
    numberConcentration,
    signals: [
      pairs >= 2 ? "Pair structure" : null,
      dominantSuit[1] >= 5 ? "Suit concentration" : null,
      bestRun >= 5 ? "Consecutive structure" : null,
      evens >= 5 ? "Even-number density" : null,
      odds >= 6 ? "Odd-number density" : null,
      honors.length >= 4 ? "Honor concentration" : null,
      dragons.length >= 2 ? "Dragon support" : null,
      flowers >= 1 ? "Flower support" : null,
      jokers >= 1 ? "Joker acceleration" : null,
      deadTileBurden >= 4 ? "Dead tile burden" : null,
    ].filter(Boolean),
  };
}

// ── Section scoring ───────────────────────────────────────────────────────────

// Section-specific helper metrics. These now sit beside Rackle's structured
// 2026 card-line database so fragile sections are judged against real line
// shape, not only broad section labels.
function pairShapeMetrics(rack = []) {
  const freq = freqMap(rack);
  const pairTiles = Object.entries(freq).filter(([, count]) => count >= 2).map(([key]) => key);
  const suitedPairs = pairTiles
    .filter(key => key.startsWith("s-"))
    .map(key => {
      const [, suit, n] = key.split("-");
      return { suit, n: Number(n), key };
    });

  let bestSameSuitPairWindow = 0;
  for (const suit of SUITS) {
    const nums = suitedPairs.filter(p => p.suit === suit).map(p => p.n);
    for (let start = 1; start <= 7; start++) {
      const count = nums.filter(n => n >= start && n <= start + 2).length;
      bestSameSuitPairWindow = Math.max(bestSameSuitPairWindow, count);
    }
  }

  const byNumber = {};
  suitedPairs.forEach(p => { byNumber[p.n] = (byNumber[p.n] || 0) + 1; });
  const bestLikePairCluster = Math.max(0, ...Object.values(byNumber));
  const flowerPair = (freq.f || 0) >= 2;
  const honorPairs = pairTiles.filter(key => key.startsWith("w-") || key.startsWith("d-")).length;
  const exactPairDensity = pairTiles.length + bestSameSuitPairWindow + bestLikePairCluster + (flowerPair ? 1 : 0);
  const disconnectedPairs = Math.max(0, pairTiles.length - Math.max(bestSameSuitPairWindow, bestLikePairCluster) - (flowerPair ? 1 : 0));

  return {
    pairTiles,
    naturalPairCount: pairTiles.length,
    bestSameSuitPairWindow,
    bestLikePairCluster,
    flowerPair,
    honorPairs,
    exactPairDensity,
    disconnectedPairs,
  };
}

function yearShapeMetrics(rack = [], sig = analyzeRackSignals(rack)) {
  const twos = sig.twos ?? rack.filter(t => t?.t === "s" && t.n === 2).length;
  const sixes = sig.sixes ?? rack.filter(t => t?.t === "s" && t.n === 6).length;
  const soap = sig.soap ?? rack.filter(t => t?.t === "d" && t.v === "Soap").length;
  const flowers = sig.flowers ?? rack.filter(t => t?.t === "f").length;
  const partsPresent = [twos > 0, sixes > 0, soap > 0, flowers > 0].filter(Boolean).length;
  const pairSupport = (twos >= 2 ? 1 : 0) + (sixes >= 2 ? 1 : 0) + (soap >= 2 ? 1 : 0) + (flowers >= 2 ? 1 : 0);
  const naturalCore = twos + sixes + soap + flowers;
  const nonYearNoise = rack.filter(t =>
    t?.t !== "j" &&
    t?.t !== "f" &&
    !(t?.t === "d" && t.v === "Soap") &&
    !(t?.t === "s" && [2, 6].includes(t.n))
  ).length;

  return { twos, sixes, soap, flowers, partsPresent, pairSupport, naturalCore, nonYearNoise };
}

function scoreConsec(rack, sig = analyzeRackSignals(rack)) {
  const m = getConsecMetrics(rack);
  const splitSuitNoise = Math.max(0, m.mixedWindow - m.bestSameSuitWindow);
  const trueRun = m.bestSameSuitWindow * 13 + Math.max(0, m.bestSameSuitUnique - 1) * 7;
  const mixedHelp = splitSuitNoise * 3;
  const duplicateBonus = m.duplicateAnchors * 6;
  const suitBonus = sig.dominantSuitCount >= 5 ? 7 : 0;
  const jokerBonus = m.bestSameSuitWindow >= 3 ? Math.min(8, sig.jokers * 4) : 0;
  const honorDrag = Math.max(0, sig.honors - 3) * 1.5;
  const penalty = splitSuitNoise * 3 + sig.isolatedHonors * 1.5 + honorDrag + sig.deadTileBurden * 1.5;
  return clamp(trueRun + mixedHelp + duplicateBonus + suitBonus + jokerBonus - penalty);
}

function scoreLikeNums(rack, sig = analyzeRackSignals(rack)) {
  const likeScore = sig.bestLikeCount * 18;
  const pairBonus = sig.pairs * 6;
  const jokerBonus = Math.min(14, sig.jokers * 6);
  const scatterPenalty = sig.bestLikeCount < 3 ? sig.deadTileBurden * 3 : sig.deadTileBurden;
  let score = clamp(likeScore + pairBonus + jokerBonus - scatterPenalty);
  if (sig.bestLikeCount < 3) score = Math.min(score, sig.deadTileBurden >= 5 ? 14 : 30);
  return clamp(score);
}

function scoreWD(rack, sig = analyzeRackSignals(rack)) {
  const honorPairCount = sig.windPairs.length + sig.dragonPairs.length;
  const dragonPairCount = sig.dragonPairs.length;
  const windPairCount = sig.windPairs.length;
  const windScore = sig.winds * 5.5;
  const dragonScore = sig.dragons * 8.5;
  const pairBonus = windPairCount * 8 + dragonPairCount * 11 + sig.triples * 7;
  const balanceBonus = sig.winds >= 2 && sig.dragons >= 2 ? 8 : sig.winds >= 2 && sig.dragons >= 1 ? 4 : 0;
  const flowerSupport = sig.flowerPair ? 5 : sig.flowers >= 1 ? 2 : 0;
  const jokerBonus = (honorPairCount >= 1 || dragonPairCount >= 1) ? Math.min(6, sig.jokers * 3) : 0;
  const singleHonorClutter = Math.max(0, sig.isolatedHonors - honorPairCount - 1);
  const penalty = sig.isolatedSuited * 4 + singleHonorClutter * 4;
  let score = clamp(windScore + dragonScore + pairBonus + balanceBonus + flowerSupport + jokerBonus - penalty);

  // Winds alone can be a real lane, but not a true Winds & Dragons ceiling.
  if (sig.dragons === 0) score = Math.min(score, sig.winds >= 6 && windPairCount >= 2 ? 62 : 56);
  if (sig.dragons === 1 && dragonPairCount === 0) score = Math.min(score, 72);
  if (sig.winds >= 6 && windPairCount >= 2 && sig.dragons >= 1) score = Math.max(score, 68);
  if (honorPairCount === 0) score = Math.min(score, 58);
  return clamp(score);
}

function scoreSuited(rack, sig = analyzeRackSignals(rack)) {
  const suitScore = sig.dominantSuitCount * 10;
  const pairBonus = sig.pairs * 5 + sig.triples * 6;
  const offSuit = rack.filter(t => t.t === "s" && t.s !== sig.dominantSuit).length;
  return clamp(suitScore + pairBonus + sig.jokers * 5 + sig.flowers * 2 - offSuit * 5 - sig.isolatedHonors * 3);
}

function scoreEvens(rack, sig = analyzeRackSignals(rack)) {
  const evenTiles = rack.filter(t => t.t === "s" && [2,4,6,8].includes(t.n));
  const oddNoise = rack.filter(t => t.t === "s" && ![2,4,6,8].includes(t.n)).length;
  const evenFreq = {};
  const evenSuitCounts = { bam: 0, crak: 0, dot: 0 };
  evenTiles.forEach(t => { evenFreq[tileKey(t)] = (evenFreq[tileKey(t)] || 0) + 1; evenSuitCounts[t.s] += 1; });
  const evenPairs = countPairs(evenFreq);
  const bestEvenSuit = Math.max(0, ...Object.values(evenSuitCounts));
  let score = clamp(sig.evens * 10 + evenPairs * 8 + bestEvenSuit * 3 + sig.jokers * 4 + sig.dragons * 1.5 - oddNoise * 4 - sig.isolatedHonors * 3);

  // A pile of the same even number should read as Like Numbers first, not generic 2468.
  if (sig.bestLikeCount >= 4 && evenPairs >= 2 && sig.evens < 8) score = Math.min(score, 86);
  if (sig.evens < 4 || (evenPairs === 0 && bestEvenSuit < 3)) score = Math.min(score, 46);
  return clamp(score);
}

function scoreOdds(rack, sig = analyzeRackSignals(rack)) {
  const oddTiles = rack.filter(t => t.t === "s" && [1,3,5,7,9].includes(t.n));
  const evenNoise = rack.filter(t => t.t === "s" && ![1,3,5,7,9].includes(t.n)).length;
  const oddFreq = {};
  const oddSuitCounts = { bam: 0, crak: 0, dot: 0 };
  oddTiles.forEach(t => { oddFreq[tileKey(t)] = (oddFreq[tileKey(t)] || 0) + 1; oddSuitCounts[t.s] += 1; });
  const oddPairs = countPairs(oddFreq);
  const bestOddSuit = Math.max(0, ...Object.values(oddSuitCounts));
  const suitScatterPenalty = bestOddSuit < 4 ? Math.max(0, oddTiles.length - bestOddSuit) * 3 : 0;
  let score = clamp(sig.odds * 8.5 + oddPairs * 9 + bestOddSuit * 3 + sig.jokers * 3.5 + sig.flowers * 1.5 - evenNoise * 4 - sig.isolatedHonors * 3 - suitScatterPenalty);

  // Odd singles across several suits are fake flexibility. They should not drown out the chosen read.
  if (sig.odds < 5 || (oddPairs === 0 && bestOddSuit < 4)) score = Math.min(score, 44);
  if (oddPairs === 0 && bestOddSuit < 3) score = Math.min(score, 14);
  if (sig.jokers > 0 && sig.pairs >= 3 && oddPairs <= 1) score = Math.min(score, 28);
  if (sig.deadTileBurden >= 5 && oddPairs === 0) score = Math.min(score, 34);
  return clamp(score);
}

function score2026(rack, sig = analyzeRackSignals(rack)) {
  const year = yearShapeMetrics(rack, sig);
  const twosScore = Math.min(year.twos, 3) * 8;
  const sixesScore = Math.min(year.sixes, 3) * 8;
  const soapScore = year.soap * 11;
  const flowerScore = Math.min(year.flowers, 3) * 7;
  const balanceBonus = year.partsPresent >= 3 ? 8 : 0;
  const completeCoreBonus = year.partsPresent === 4 ? 8 : 0;
  const pairBonus = year.pairSupport * 5;
  const jokerBonus = year.partsPresent >= 3 ? Math.min(8, sig.jokers * 4) : Math.min(2, sig.jokers);
  let score = clamp(
    twosScore + sixesScore + soapScore + flowerScore + balanceBonus + completeCoreBonus + pairBonus + jokerBonus -
    year.nonYearNoise * 3 - sig.deadTileBurden * 2
  );

  // Year hands are exact. A missing Soap or missing 2/6 side should lower the ceiling.
  if (year.soap === 0) score = Math.min(score, 56);
  if (year.twos === 0 || year.sixes === 0) score = Math.min(score, 52);
  if (year.partsPresent <= 2) score = Math.min(score, 42);
  if (year.partsPresent === 3 && year.naturalCore < 6) score = Math.min(score, 62);
  return clamp(score);
}

function score369(rack, sig = analyzeRackSignals(rack)) {
  const noise = rack.filter(t => t.t === "s" && ![3,6,9].includes(t.n)).length;
  return clamp(sig.threeSixNine * 13 + sig.pairs * 5 + sig.jokers * 5 + sig.dragons * 3 - noise * 4 - sig.isolatedHonors * 2);
}

function scoreQuints(rack, sig = analyzeRackSignals(rack)) {
  const freq = freqMap(rack);
  const bestGroup = Math.max(0, ...Object.values(freq));
  const pairAnchors = countPairs(freq);
  const naturalTriples = countTriples(freq);
  const naturalAnchor = naturalTriples >= 1 || bestGroup >= 3;
  const strongPairBase = pairAnchors >= 3;
  const jokerHelp = sig.jokers >= 2 && naturalAnchor ? 18 :
    sig.jokers > 0 && naturalAnchor && strongPairBase ? 11 :
      sig.jokers > 0 && naturalAnchor ? 6 : sig.jokers > 0 ? 1 : 0;
  const groupedEntries = Object.entries(freq).filter(([, count]) => count >= 2);
  const suitedAnchors = groupedEntries.filter(([key]) => key.startsWith("s-")).length;
  let score = clamp(bestGroup * 13 + pairAnchors * 5 + naturalTriples * 16 + jokerHelp - sig.deadTileBurden * 3);

  // Honor-heavy duplicate racks should not automatically become Quints when
  // Winds & Dragons is the more natural table read.
  if (sig.winds >= 4 && sig.dragons >= 1 && suitedAnchors === 0) score = Math.min(score, 60);
  if (sig.jokers === 0) score = Math.min(score, 46);
  if (!naturalAnchor) score = Math.min(score, sig.jokers >= 2 ? 52 : 42);
  if (naturalTriples === 0 && bestGroup < 3) score = Math.min(score, 56);
  if (sig.jokers === 1 && naturalTriples === 0 && pairAnchors < 3) score = Math.min(score, 34);
  if (sig.jokers >= 2 && naturalTriples >= 1 && pairAnchors >= 3) score = Math.max(score, 94);
  return clamp(score);
}

function scorePairs(rack, sig = analyzeRackSignals(rack)) {
  const pairShape = pairShapeMetrics(rack);
  const jokerPenalty = sig.jokers * 15;
  const exactnessBonus = pairShape.bestSameSuitPairWindow * 3 + pairShape.bestLikePairCluster * 4 + (pairShape.flowerPair ? 5 : 0);
  const disconnectedPenalty = pairShape.disconnectedPairs * 4 + pairShape.honorPairs * 2;
  let score = clamp(
    pairShape.naturalPairCount * 15 +
    exactnessBonus +
    sig.flowers * 3 +
    sig.suitConcentration * 0.08 -
    sig.deadTileBurden * 4 -
    disconnectedPenalty -
    jokerPenalty
  );

  // Pair density is useful, but exact concealed hands should not become elite from pairs alone.
  if (pairShape.naturalPairCount >= 5 && pairShape.bestSameSuitPairWindow < 3 && pairShape.bestLikePairCluster < 2) score = Math.min(score, 78);
  if (sig.jokers > 0) score = Math.min(score, 64);
  if (sig.jokers > 0 && pairShape.naturalPairCount < 4) score = Math.min(score, 50);
  if (pairShape.naturalPairCount < 3) score = Math.min(score, 46);
  return clamp(score);
}

const SECTION_SCORERS = {
  "2026": score2026,
  evens: scoreEvens,
  like: scoreLikeNums,
  quints: scoreQuints,
  consec: scoreConsec,
  odds: scoreOdds,
  wd: scoreWD,
  threeSixNine: score369,
  pairs: scorePairs,
  suited: scoreSuited,
};

const CARD_LINE_SCORING_SECTIONS = new Set(["2026", "quints", "wd", "pairs"]);

function blendSectionWithCardLine(sectionId, heuristicScore, rack, sig = analyzeRackSignals(rack)) {
  if (!CARD_LINE_SCORING_SECTIONS.has(sectionId) && heuristicScore < 82) return { score: heuristicScore, fit: null };
  const fit = bestCardLineFit(rack, sectionId);
  if (!fit) return { score: heuristicScore, fit: null };

  // The card-line database is used as a precision layer, not a broad score
  // rewrite. Keep the already-calibrated Rackle IQ bands stable while allowing
  // exact line shape to provide a small nudge and fragile-line caps.
  let score = heuristicScore;
  if (fit.score >= 82) score += Math.min(3, Math.max(0, fit.score - heuristicScore) * 0.08);

  if (sectionId === "2026") {
    const year = yearShapeMetrics(rack, sig);
    if (year.soap === 0 || year.twos === 0 || year.sixes === 0) score = Math.min(score, 68);
    if (fit.criticalMisses >= 2) score = Math.min(score, 62);
  }

  if (sectionId === "pairs") {
    if (sig.jokers > 0) score = Math.min(score, 68);
    if (fit.score < 42) score = Math.min(score, 74);
  }

  if (sectionId === "quints") {
    const hasNaturalAnchor = sig.triples >= 1 || sig.quads >= 1 || sig.pairs >= 2;
    if (sig.jokers <= 1 && !hasNaturalAnchor) score = Math.min(score, 66);
    if (fit.score < 36) score = Math.min(score, 74);
  }

  if (sectionId === "wd") {
    if (sig.dragons === 0 && fit.tags?.includes("winds-only")) score = Math.min(score, 62);
    if (fit.criticalMisses >= 1 && sig.isolatedHonors >= 4) score = Math.min(score, 58);
  }

  return { score: clamp(score), fit };
}

function sectionTieBreaker(sectionId, sig = analyzeRackSignals([])) {
  if (sectionId === "like" && sig.bestLikeCount >= 4) return 30;
  if (sectionId === "quints" && sig.jokers >= 2 && sig.triples >= 1 && sig.pairs >= 3) return 36;
  if (sectionId === "wd" && (sig.windPairs.length + sig.dragonPairs.length) >= 2) return 20;
  if (sectionId === "consec" && sig.bestRun >= 5 && sig.dominantSuitCount >= 5) return 18;
  if (sectionId === "consec" && sig.bestRun >= 3 && sig.pairs === 0) return 10;
  if (sectionId === "suited" && sig.dominantSuitCount >= 7) return 16;
  return 0;
}

/** Returns all sections scored against the rack, sorted best first */
export function scoreSections(rack) {
  const sig = analyzeRackSignals(rack);
  return SECTIONS.map(sec => {
    const heuristicScore = SECTION_SCORERS[sec.id](rack, sig);
    const { score, fit } = blendSectionWithCardLine(sec.id, heuristicScore, rack, sig);
    const name = sectionDisplayName(sec.id, sig);
    const confidence =
      score >= 82 ? "high" :
      score >= 66 ? "medium" :
      score >= 48 ? "developing" : "thin";
    return {
      ...sec,
      name,
      score,
      fitScore: score,
      heuristicScore,
      cardLineFit: fit ? summarizeBestCardLine(rack, sec.id) : null,
      tiePriority: sectionTieBreaker(sec.id, sig) + Math.round((fit?.score || 0) / 12),
      confidence: sec.id === "wd" && sig.dragons === 0 && score < 66 ? "developing" : confidence,
      supportingTiles: supportingTilesForSection(rack, sec.id).slice(0, 7).map(tileLabelShort),
      missingNeeds: missingNeedsForSection(rack, sec.id, sig, fit),
      risk: sec.id === "wd" && sig.dragons === 0 ? "Wind shape can be real, but without dragons it needs stronger grouping or faster acceleration." : SECTION_META[sec.id]?.risk || "This path needs cleaner convergence.",
      explanation: explanationForSection(sec.id, sig, score, fit),
    };
  }).sort((a, b) => (b.score - a.score) || ((b.tiePriority || 0) - (a.tiePriority || 0)));
}

/** Best section for a given rack */
export function bestSection(rack) {
  return scoreSections(rack)[0];
}

function supportingTilesForSection(rack, section) {
  return (rack || []).filter(t => {
    if (!t) return false;
    if (t.t === "j") return section !== "pairs";
    if (section === "2026") return t.t === "f" || (t.t === "d" && t.v === "Soap") || (t.t === "s" && [2,6].includes(t.n));
    if (section === "evens") return t.t === "s" && [2,4,6,8].includes(t.n) || t.t === "j";
    if (section === "odds") return t.t === "s" && [1,3,5,7,9].includes(t.n) || t.t === "f";
    if (section === "threeSixNine") return t.t === "s" && [3,6,9].includes(t.n) || t.t === "d";
    if (section === "wd") {
      const sig = analyzeRackSignals(rack);
      return t.t === "w" || t.t === "d" || (t.t === "f" && sig.flowers >= 2) || (t.t === "j" && (sig.windPairs.length || sig.dragonPairs.length));
    }
    if (section === "suited") {
      const sig = analyzeRackSignals(rack);
      return t.t === "s" && t.s === sig.dominantSuit || t.t === "f" || t.t === "j";
    }
    if (section === "like") {
      const sig = analyzeRackSignals(rack);
      return t.t === "s" && t.n === sig.bestLikeNumber || t.t === "j";
    }
    if (section === "consec") {
      const m = getConsecMetrics(rack);
      return (t.t === "s" && m.bestStart && t.s === m.bestSuit && t.n >= m.bestStart && t.n <= m.bestStart + 2) || (t.t === "j" && m.bestSameSuitWindow >= 3);
    }
    if (section === "quints") return t.t === "j" || (freqMap(rack, true)[tileKey(t)] || 0) >= 2;
    if (section === "pairs") return (freqMap(rack, true)[tileKey(t)] || 0) >= 2 || t.t === "f";
    return false;
  });
}

function missingNeedsForSection(rack, section, sig = analyzeRackSignals(rack), cardFit = bestCardLineFit(rack, section)) {
  if (cardFit?.score >= 45 && cardFit?.missing?.length) return `Card-line needs: ${cardFit.missing.slice(0, 2).join(", ")}.`;
  if (section === "quints" && sig.jokers === 0) return "Joker help or more natural pairs.";
  if (section === "pairs" && sig.pairs < 3) return "More exact natural pairs.";
  if (section === "wd" && sig.dragons === 0) return "Dragon support or stronger wind grouping.";
  if (section === "wd" && sig.honors < 5) return "More honor density.";
  if (section === "suited" && sig.dominantSuitCount < 6) return "More tiles in one suit.";
  if (section === "consec" && getConsecMetrics(rack).bestSameSuitWindow < 3) return "A same-suit run, not split-suit number fragments.";
  if (section === "like" && sig.bestLikeCount < 3) return "More of the same number across suits.";
  if (section === "evens" && sig.evens < 6) return "More even-number density.";
  if (section === "odds" && sig.odds < 6) return "More odd-number density.";
  if (section === "threeSixNine" && sig.threeSixNine < 5) return "More 3-6-9 core tiles.";
  if (section === "2026" && sig.yearCore < 5) return "More 2/6/Soap/flower core.";
  return "Cleaner draw path and fewer loose tiles.";
}

function explanationForSection(section, sig, score, cardFit = null) {
  const name = sectionDisplayName(section, sig);
  if (cardFit?.score >= 72 && cardFit?.title) return `${name} matched a real 2026 card-line shape: ${cardFit.title}.`;
  if (cardFit?.criticalMisses >= 2 && cardFit?.missing?.length) return `${name} had a section signal, but the best card line was missing ${cardFit.missing.slice(0, 2).join(" and ")}.`;
  if (section === "pairs" && sig.jokers > 0) return "Singles & Pairs stayed risky because Jokers do not complete concealed pair shapes.";
  if (section === "pairs" && sig.pairs >= 5) return "Singles & Pairs had natural density, but still needed exactness before it became certain.";
  if (section === "quints" && sig.jokers > 0 && sig.triples < 1) return "Quints had Joker help, but needed a natural anchor before it became real.";
  if (section === "wd" && sig.dragons === 0) return "Winds had grouping, but missing dragons kept the ceiling lower.";
  if (section === "wd" && sig.isolatedHonors >= 4) return "Honors were present, but too many were singles instead of anchors.";
  if (section === "2026" && ((sig.soap ?? 0) === 0 || (sig.twos ?? 0) === 0 || (sig.sixes ?? 0) === 0)) return "2026 was fragile because one part of the year core was missing.";
  if (score >= 78) return `${name} had real shape, useful structure, and enough tile economy to defend.`;
  if (score >= 58) return `${name} was believable, but needed cleaner convergence after the Charleston.`;
  return `${name} showed a signal, but the rack carried too much noise to fully trust it.`;
}

// ── IQ component scoring ──────────────────────────────────────────────────────

function convergenceScore(startingRack = [], passLog = [], finalRack = []) {
  const startBest = bestSection(startingRack)?.score || 0;
  const finalBest = bestSection(finalRack)?.score || 0;

  let rack = [...startingRack];
  const realPasses = (passLog || []).filter(p => p.dir !== "courtesy");
  if (!realPasses.length) return clamp(38 + finalBest * 0.45);

  const steps = realPasses.map(pass => {
    const outKeys = new Map();
    (pass.out || []).forEach(t => outKeys.set(tileKey(t), (outKeys.get(tileKey(t)) || 0) + 1));
    rack = rack.filter(t => {
      const k = tileKey(t);
      const n = outKeys.get(k) || 0;
      if (n > 0) {
        outKeys.set(k, n - 1);
        return false;
      }
      return true;
    }).concat((pass.in || []).filter(t => t?.t !== "j"));
    return bestSection(rack)?.score || 0;
  });

  const trend = steps.length
    ? steps.reduce((acc, val, idx) => acc + (idx === 0 ? val - startBest : val - steps[idx - 1]), 0)
    : finalBest - startBest;

  return clamp(45 + (finalBest - startBest) * 0.55 + trend * 0.35);
}

function tileEfficiencyScore(rack = [], sig = analyzeRackSignals(rack), bestId = bestSection(rack)?.id) {
  const support = supportingTilesForSection(rack, bestId).length;
  const supportRatio = support / Math.max(1, rack.length);
  const compression = sig.pairs * 8 + sig.triples * 12 + sig.jokers * 5 + supportRatio * 42;
  const scatterPenalty = sig.deadTileBurden * 7 + Math.max(0, 4 - sig.bestLikeCount) * 1.5;
  return clamp(compression - scatterPenalty + 18);
}

function accelerationScore(rack = [], sig = analyzeRackSignals(rack), bestId = bestSection(rack)?.id) {
  const coherent = bestSection(rack)?.score || 0;
  const raw = sig.jokers * 13 + sig.pairs * 8 + sig.triples * 9 + sig.dominantSuitCount * 2 + coherent * 0.25;
  const incoherentPenalty = coherent < 50 ? 18 : 0;
  return clamp(raw - incoherentPenalty);
}

function deadnessRiskScore(rack = [], sig = analyzeRackSignals(rack)) {
  const risk = sig.deadTileBurden * 13 + sig.isolatedHonors * 4 + (sig.pairs < 2 ? 10 : 0) + (sig.jokers > 2 && sig.pairs < 2 ? 8 : 0);
  return clamp(risk);
}

function passTilePenalty(tile, finalBestId, currentRack, finalRack) {
  if (!tile) return 0;
  if (tile.t === "j") return 28;
  const finalSupport = supportingTilesForSection([...finalRack, tile], finalBestId).some(t => tileKey(t) === tileKey(tile));
  const freq = freqMap(currentRack, true);
  const wasPairOrBetter = (freq[tileKey(tile)] || 0) >= 2;
  if (wasPairOrBetter && finalSupport) return 14;
  if (finalSupport) return 8;
  if (tile.t === "w" || tile.t === "d") return -5;
  return -3;
}

function tileValueMapForRack(rack = [], primarySection = bestSection(rack)?.id, candidateSections = null) {
  const sections = candidateSections || scoreSections(rack).slice(0, 3);
  const supportSets = new Map(sections.map(sec => [sec.id, new Set(supportingTilesForSection(rack, sec.id).map(tileKey))]));
  const freq = freqMap(rack, true);
  const primarySupport = supportSets.get(primarySection) || new Set();

  return (rack || []).map(tile => {
    const k = tileKey(tile);
    const count = freq[k] || 0;
    const supportedBy = sections.filter(sec => supportSets.get(sec.id)?.has(k));
    const supportNames = supportedBy.map(sec => sec.name);
    let valueScore = 28 + supportedBy.length * 12 + Math.min(count, 3) * 10;
    let role = "Neutral";
    let reason = `${tileLabelShort(tile)} had limited value across the main reads.`;

    if (tile?.t === "j") {
      role = "Illegal pass";
      valueScore = 100;
      reason = "Jokers stay protected during the Charleston.";
    } else if (count >= 3 && primarySupport.has(k)) {
      role = "Anchor";
      valueScore = 92;
      reason = `${tileLabelShort(tile)} was group structure for ${sectionName(primarySection)}.`;
    } else if (count >= 2 && primarySupport.has(k)) {
      role = "Anchor";
      valueScore = 86;
      reason = `${tileLabelShort(tile)} was a pair worth protecting for the leading lane.`;
    } else if (primarySupport.has(k) && supportedBy.length >= 2) {
      role = "Strong keep";
      valueScore = 76;
      reason = `${tileLabelShort(tile)} supported more than one realistic path.`;
    } else if (primarySupport.has(k)) {
      role = "Flexible keep";
      valueScore = 64;
      reason = `${tileLabelShort(tile)} helped ${sectionName(primarySection)}, but it was not a locked anchor.`;
    } else if (supportedBy.length >= 1) {
      role = "Soft pass";
      valueScore = 44;
      reason = `${tileLabelShort(tile)} had secondary-path value, but did not support the best lane.`;
    } else if ((tile?.t === "w" || tile?.t === "d") && count <= 1) {
      role = "Clear pass";
      valueScore = 20;
      reason = `${tileLabelShort(tile)} was an isolated honor with no clear support.`;
    } else if (count >= 2) {
      role = "Dangerous pass";
      valueScore = 72;
      reason = `${tileLabelShort(tile)} was a natural pair. Passing pairs needs a clear reason.`;
    } else {
      role = "Clear pass";
      valueScore = 26;
      reason = `${tileLabelShort(tile)} was low-utility for the top reads.`;
    }

    return {
      tile: tileLabelShort(tile),
      key: k,
      role,
      valueScore: clamp(valueScore),
      reason,
      supportsSections: supportNames,
      supportsExactLines: sections
        .map(sec => summarizeBestCardLine(rack, sec.id))
        .filter(fit => fit?.score >= 42 && fit?.title)
        .map(fit => fit.title),
    };
  });
}

function buildPassRecommendationCandidate(tile, rack = [], index = 0, primarySection = bestSection(rack)?.id, candidateSections = null) {
  const sections = (candidateSections || scoreSections(rack).slice(0, 3)).filter(Boolean);
  const topSections = sections.slice(0, 2);
  const primaryId = primarySection || topSections[0]?.id || "other";
  const sig = analyzeRackSignals(rack);
  const freq = freqMap(rack, true);
  const key = tileKey(tile);
  const count = freq[key] || 0;
  const sectionIds = new Set(topSections.map(sec => sec.id));
  const supportSections = topSections.filter(sec =>
    supportingTilesForSection(rack, sec.id).some(supportTile => tileKey(supportTile) === key)
  );
  const supportsPrimary = supportSections.some(sec => sec.id === primaryId);
  const supportsTopTwo = supportSections.length > 0;
  const lineProfile = buildLineAwareKeepProfile(rack, topSections, sig);
  const lineEntry = lineProfile.lineWeights.get(key);
  const lineWeight = lineEntry?.weight || 0;
  const isPair = count >= 2;
  const clearlyOffPathPair = isClearlyOffPathPair(tile, rack, topSections, lineProfile);
  const tileMap = tileValueMapForRack(rack, primaryId, sections);
  const mapped = tileMap.find(item => item.key === key);

  let keepValue = virtualTilePassValue(
    tile,
    rack,
    topSections,
    sig,
    lineProfile,
    new Map(tileMap.map(item => [item.key, item]))
  );

  // Player-facing recommendations should be stricter than virtual players.
  // Do not casually recommend useful natural pairs, shared-path tiles, or line anchors.
  if (tile?.t === "j") keepValue = 999;
  if (isPair && !clearlyOffPathPair) keepValue += 34;
  if (supportsPrimary) keepValue += 18;
  if (supportsTopTwo && supportSections.length >= 2) keepValue += 16;
  if (lineWeight >= 34) keepValue += 18;

  const twos = rack.filter(t => t?.t === "s" && t.n === 2).length;
  const sixes = rack.filter(t => t?.t === "s" && t.n === 6).length;
  const soaps = rack.filter(t => t?.t === "d" && t.v === "Soap").length;
  const yearCoreIsReal = (twos + sixes + soaps + sig.flowers) >= 4 && soaps >= 1 && (twos >= 1 || sixes >= 1);

  if (tile?.t === "d" && tile.v === "Soap") {
    if (yearCoreIsReal && sectionIds.has("2026")) keepValue += 46;
    else if (!yearCoreIsReal) keepValue -= 18;
  }

  if (tile?.t === "f") {
    const flowerRelevant =
      (sectionIds.has("2026") && yearCoreIsReal) ||
      (sectionIds.has("pairs") && sig.pairs >= 3) ||
      (sectionIds.has("wd") && sig.flowers >= 2);
    keepValue += flowerRelevant ? 28 : -10;
  }

  if (isHonorTile(tile)) {
    const honorPairCount = (sig.windPairs?.length || 0) + (sig.dragonPairs?.length || 0);
    const pairedHonor = count >= 2;
    const trueWd = sectionIds.has("wd") && (sig.honors >= 5 || honorPairCount >= 2 || sig.dragonPairs?.length);

    if (pairedHonor && trueWd) keepValue += 44;
    if (!pairedHonor && !trueWd && !supportsTopTwo) keepValue -= 22;
    if (tile?.t === "d" && pairedHonor && (sectionIds.has("wd") || sectionIds.has("threeSixNine") || sectionIds.has("like"))) keepValue += 24;
  }

  if (tile?.t === "s" && !supportsTopTwo && count <= 1 && tile.s !== sig.dominantSuit) keepValue -= 10;

  let role = mapped?.role || "Neutral";
  if (tile?.t === "j") role = "Illegal pass";
  else if (keepValue >= 118) role = "Protected";
  else if (keepValue >= 92) role = "Strong keep";
  else if (keepValue <= 34) role = "Likely pass";
  else if (keepValue <= 52) role = "Soft pass";

  return {
    tile,
    index,
    key,
    keepValue: clamp(keepValue, 0, 999),
    role,
    isPair,
    isHonor: isHonorTile(tile),
    isFlower: tile?.t === "f",
    clearlyOffPathPair,
    supportsSections: supportSections.map(sec => sec.id),
    supportsPrimary,
    lineWeight,
    lineNames: lineEntry ? [...lineEntry.lines] : [],
    reason: mapped?.reason || `${tileLabelShort(tile)} had limited value across the main reads.`,
  };
}

export function getPassRecommendationDetails(rack = [], options = {}) {
  const sections = (options.candidateSections || scoreSections(rack).slice(0, 3)).filter(Boolean);
  const primarySection = options.primarySection || sections[0]?.id || bestSection(rack)?.id || "other";
  const candidates = (rack || [])
    .map((tile, index) => buildPassRecommendationCandidate(tile, rack, index, primarySection, sections))
    .sort((a, b) =>
      (a.keepValue - b.keepValue) ||
      (tileIndividualStrength(a.tile) - tileIndividualStrength(b.tile)) ||
      (a.index - b.index)
    );

  const selected = [];
  const selectedKeys = new Map();

  const canUse = candidate => {
    if (!candidate || selected.length >= 3) return false;
    if (candidate.tile?.t === "j") return false;

    const availableSame = (rack || []).filter(tile => tileKey(tile) === candidate.key).length;
    const selectedSame = selectedKeys.get(candidate.key) || 0;
    if (selectedSame >= availableSame) return false;

    const remainingSlots = 3 - selected.length;

    if (candidate.isPair && !candidate.clearlyOffPathPair) {
      const singletonAlternatives = candidates.filter(item =>
        !selected.includes(item) &&
        !item.isPair &&
        item.tile?.t !== "j" &&
        item.keepValue <= candidate.keepValue + 32
      );
      if (singletonAlternatives.length >= remainingSlots) return false;
    }

    if (candidate.role === "Protected" || candidate.role === "Strong keep") {
      const softerAlternatives = candidates.filter(item =>
        !selected.includes(item) &&
        item.tile?.t !== "j" &&
        item.keepValue <= candidate.keepValue - 28
      );
      if (softerAlternatives.length >= remainingSlots) return false;
    }

    const selectedHonors = selected.filter(item => item.isHonor).length;
    if (candidate.isHonor && selectedHonors >= 2) {
      const nonHonorAlternatives = candidates.filter(item =>
        !selected.includes(item) &&
        !item.isHonor &&
        item.tile?.t !== "j" &&
        item.keepValue <= candidate.keepValue + 20
      );
      if (nonHonorAlternatives.length >= remainingSlots) return false;
    }

    return true;
  };

  candidates.forEach(candidate => {
    if (canUse(candidate)) {
      selected.push(candidate);
      selectedKeys.set(candidate.key, (selectedKeys.get(candidate.key) || 0) + 1);
    }
  });

  candidates.forEach(candidate => {
    if (selected.length >= 3 || selected.includes(candidate) || candidate.tile?.t === "j") return;
    selected.push(candidate);
  });

  const recommendations = selected.slice(0, 3);
  const allPainful = recommendations.every(item => item.keepValue >= 72);

  return {
    primarySection,
    candidateSections: sections,
    recommendations: recommendations.map(item => item.tile),
    recommendationDetails: recommendations,
    candidates,
    label: allPainful ? "least damaging" : "cleanest pass",
  };
}

export function recommendPassCandidates(rack = [], options = {}) {
  return getPassRecommendationDetails(rack, options).recommendations;
}

function chooseBetterPassCandidate(rack = [], actualPassed = [], primarySection = bestSection(rack)?.id, candidateSections = null) {
  void actualPassed;
  return recommendPassCandidates(rack, { primarySection, candidateSections });
}

function receiveLuckScore(passLog = [], finalBestId = null) {
  const receives = (passLog || []).filter(p => p.dir !== "courtesy").flatMap(p => (p.in || []).filter(t => t?.t !== "j"));
  if (!receives.length) return 50;
  const support = receives.filter(t => supportingTilesForSection(receives.concat([]), finalBestId).some(s => tileKey(s) === tileKey(t))).length;
  const pairs = countPairs(freqMap(receives, true));
  const honors = receives.filter(t => t?.t === "w" || t?.t === "d").length;
  const suited = receives.filter(t => t?.t === "s").length;
  return clamp(38 + support * 10 + pairs * 8 + suited * 2 - honors * 2);
}

function passQualitySummary(startingRack = [], passLog = [], finalRack = []) {
  const sections = scoreSections(finalRack);
  const best = sections[0];
  let rack = [...startingRack];
  let total = 0;
  let rounds = 0;
  let usefulPairPassed = false;
  let bestLineTilePassed = false;

  (passLog || []).forEach(pass => {
    if (pass.dir === "courtesy") return;
    let round = 72;
    rounds += 1;
    const passed = pass.out || [];
    const preRack = [...rack];
    const candidateSections = scoreSections(preRack).slice(0, 3);
    const preBest = candidateSections[0] || best;
    const valueMap = tileValueMapForRack(preRack, preBest?.id || best?.id, candidateSections);
    const valueByKey = new Map(valueMap.map(item => [item.key, item]));

    const protectedJoker = passed.every(t => t?.t !== "j");
    if (!protectedJoker) round -= 38;

    passed.forEach(tile => {
      const info = valueByKey.get(tileKey(tile));
      const freq = freqMap(preRack, true)[tileKey(tile)] || 0;
      const finalSupport = supportingTilesForSection([...finalRack, tile], best?.id).some(t => tileKey(t) === tileKey(tile));
      if (freq >= 2 && finalSupport) usefulPairPassed = true;
      if (finalSupport) bestLineTilePassed = true;
      round -= passTilePenalty(tile, best?.id, preRack, finalRack);
      if (info?.role === "Anchor") round -= 14;
      if (info?.role === "Strong keep") round -= 8;
      if (info?.role === "Clear pass") round += 8;
      if (info?.role === "Soft pass") round += 4;
      if (info?.role === "Illegal pass") round -= 32;
    });

    const supportKeys = new Set(supportingTilesForSection(preRack, best?.id).map(tileKey));
    passed.forEach(tile => {
      const k = tileKey(tile);
      const freq = freqMap(preRack, true)[k] || 0;
      if (!supportKeys.has(k) && freq <= 1 && tile?.t !== "j") round += 7;
    });

    const inTiles = (pass.in || []).filter(t => t?.t !== "j");
    const outKeys = new Map();
    passed.forEach(t => outKeys.set(tileKey(t), (outKeys.get(tileKey(t)) || 0) + 1));
    rack = rack.filter(t => {
      const k = tileKey(t);
      const n = outKeys.get(k) || 0;
      if (n > 0) {
        outKeys.set(k, n - 1);
        return false;
      }
      return true;
    }).concat(inTiles);

    total += clamp(round);
  });

  const avg = rounds ? total / rounds : 70;
  return { score: clamp(avg), details: [], usefulPairPassed, bestLineTilePassed };
}

function passQualityDetail(startingRack = [], passLog = [], finalRack = []) {
  const sections = scoreSections(finalRack);
  const best = sections[0];
  let rack = [...startingRack];
  const details = [];
  let total = 0;
  let usefulPairPassed = false;
  let bestLineTilePassed = false;

  (passLog || []).forEach((pass, idx) => {
    if (pass.dir === "courtesy") return;
    let round = 72;
    const passed = pass.out || [];
    const preRack = [...rack];
    const candidateSections = scoreSections(preRack).slice(0, 3);
    const preBest = candidateSections[0] || best;
    const valueMap = tileValueMapForRack(preRack, preBest?.id || best?.id, candidateSections);
    const valueByKey = new Map(valueMap.map(item => [item.key, item]));
    const betterPassTiles = chooseBetterPassCandidate(preRack, passed, preBest?.id || best?.id, candidateSections);
    const protectedWell = preRack
      .filter(t => !passed.some(p => tileKey(p) === tileKey(t)))
      .filter(t => ["Anchor", "Strong keep", "Illegal pass"].includes(valueByKey.get(tileKey(t))?.role))
      .slice(0, 4);
    const questionableKeep = preRack
      .filter(t => !passed.some(p => tileKey(p) === tileKey(t)))
      .filter(t => ["Clear pass", "Soft pass"].includes(valueByKey.get(tileKey(t))?.role))
      .slice(0, 3);

    const protectedJoker = passed.every(t => t?.t !== "j");
    if (!protectedJoker) round -= 38;

    passed.forEach(tile => {
      const info = valueByKey.get(tileKey(tile));
      const freq = freqMap(preRack, true)[tileKey(tile)] || 0;
      const finalSupport = supportingTilesForSection([...finalRack, tile], best?.id).some(t => tileKey(t) === tileKey(tile));
      if (freq >= 2 && finalSupport) usefulPairPassed = true;
      if (finalSupport) bestLineTilePassed = true;
      round -= passTilePenalty(tile, best?.id, preRack, finalRack);
      if (info?.role === "Anchor") round -= 14;
      if (info?.role === "Strong keep") round -= 8;
      if (info?.role === "Clear pass") round += 8;
      if (info?.role === "Soft pass") round += 4;
      if (info?.role === "Illegal pass") round -= 32;
    });

    // Good passes remove unsupported singletons and off-path tiles.
    const supportKeys = new Set(supportingTilesForSection(preRack, best?.id).map(tileKey));
    passed.forEach(tile => {
      const k = tileKey(tile);
      const freq = freqMap(preRack, true)[k] || 0;
      if (!supportKeys.has(k) && freq <= 1 && tile?.t !== "j") round += 7;
    });

    const inTiles = (pass.in || []).filter(t => t?.t !== "j");
    const outKeys = new Map();
    passed.forEach(t => outKeys.set(tileKey(t), (outKeys.get(tileKey(t)) || 0) + 1));
    rack = rack.filter(t => {
      const k = tileKey(t);
      const n = outKeys.get(k) || 0;
      if (n > 0) {
        outKeys.set(k, n - 1);
        return false;
      }
      return true;
    }).concat(inTiles);

    const clean = clamp(round);
    total += clean;
    const betterLabels = betterPassTiles.map(tileLabelShort);
    const passedLabels = passed.map(tileLabelShort);
    const sameAsExpert = betterLabels.join("|") === passedLabels.join("|");
    const quality = clean >= 82 ? "strong" : clean >= 66 ? "good" : clean >= 48 ? "mixed" : "weak";
    const explanation = sameAsExpert
      ? `This pass was defensible. You cut low-utility tiles without breaking the clearest structure.`
      : `A cleaner expert pass would likely cut ${betterLabels.join(", ")} because those tiles did less for the strongest lane.`;

    details.push({
      label: pass.label || `Pass ${idx + 1}`,
      passName: pass.label || `Pass ${idx + 1}`,
      direction: pass.dir,
      score: clean,
      passQualityScore: clean,
      passQualityLabel: quality,
      quality,
      passed: passedLabels,
      received: inTiles.map(tileLabelShort),
      playerPassed: passedLabels,
      betterPassCandidate: betterLabels,
      bestPassedTiles: passedLabels.filter(name => betterLabels.includes(name)),
      questionablePassedTiles: passed.filter(t => ["Anchor", "Strong keep", "Dangerous pass"].includes(valueByKey.get(tileKey(t))?.role)).map(tileLabelShort),
      tilesYouProtectedWell: protectedWell.map(tileLabelShort),
      protectedWell: protectedWell.map(tileLabelShort),
      questionableKeep: questionableKeep.map(tileLabelShort),
      tilesYouShouldHavePassed: betterLabels,
      tileValueMap: valueMap,
      explanation,
      expertNote: explanation,
      note:
        clean >= 82 ? "Clean pass. You cut noise without damaging the strongest lane." :
        clean >= 66 ? "Useful pass. The rack kept moving toward a readable shape." :
        clean >= 48 ? "Mixed pass. Some cleanup helped, but useful structure also left the rack." :
        "Costly pass. Too much useful structure was sent away.",
    });
  });

  const avg = details.length ? total / details.length : 70;
  return { score: clamp(avg), details, usefulPairPassed, bestLineTilePassed };
}

function timingScore(passLog = []) {
  const realPasses = passLog.filter(p => p.dir !== "courtesy");
  if (!realPasses.length) return 72;
  const avgSecs = realPasses.reduce((s, p) => s + (p.secs || 20), 0) / realPasses.length;
  if (avgSecs < 3)  return 38;
  if (avgSecs < 6)  return 58;
  if (avgSecs < 10) return 72;
  if (avgSecs <= 28) return 88;
  if (avgSecs <= 45) return 74;
  return 56;
}

function commitmentScore(passLog = [], finalRack = []) {
  const finalBest = bestSection(finalRack);
  const finalSupport = new Set(supportingTilesForSection(finalRack, finalBest?.id).map(tileKey));
  const realPasses = passLog.filter(p => p.dir !== "courtesy");
  if (!realPasses.length) return 68;

  const byRound = realPasses.map((p, idx) => {
    const passedSupport = (p.out || []).filter(t => finalSupport.has(tileKey(t))).length;
    const multiplier = idx === 0 ? 0.7 : idx === 1 ? 1 : 1.3;
    return 82 - passedSupport * 16 * multiplier;
  });

  return clamp(byRound.reduce((a, b) => a + b, 0) / byRound.length);
}

function buildBestPaths(sections) {
  return sections.slice(0, 3).map(sec => ({
    section: sec.name,
    sectionId: sec.id,
    fitScore: clamp(sec.score),
    confidence: sec.confidence,
    supportingTiles: sec.supportingTiles,
    missingNeeds: sec.missingNeeds,
    risk: sec.risk,
    explanation: sec.explanation,
  }));
}

function buildHeldBack(sig, passQuality, convergence, chosenId, bestId, ctx = null) {
  const out = [];
  if (chosenId && chosenId !== "other" && bestId && chosenId !== bestId) out.push("The selected direction did not match the rack’s strongest signals.");
  if (sig.deadTileBurden >= 4) out.push("Too many loose tiles survived the Charleston.");
  if (passQuality < 62) out.push("At least one pass gave away useful structure.");
  if (convergence < 58) out.push("The rack did not sharpen enough across the passes.");
  if (chosenId === "consec" && ctx?.chosenFit < 45) out.push("The number tiles were split across suits instead of forming one clean run lane.");
  if (sig.jokers > 0 && (ctx?.bestFit || 0) < 66) out.push("The Joker helped, but only after the rack found structure.");
  if (sig.pairs < 2) out.push("The final rack needed more natural pair structure.");
  return out.slice(0, 4);
}

function buildStrongPlayersSaw(sig, bestPath, chosenId = null) {
  const out = [];
  if (bestPath) out.push(`${bestPath.section} was the cleanest section-level read.`);
  if (sig.windPairs?.length >= 2) out.push("The East and West style wind pairs were worth protecting.");
  if (sig.flowerPair) out.push("The flower pair gave useful section support.");
  if (chosenId === "consec") out.push("Consecutive Run needed cleaner same-suit alignment.");
  if (sig.dominantSuitCount >= 5) out.push(`The ${sig.dominantSuit} suit was doing the most work.`);
  if (sig.pairs >= 2) out.push("Natural pairs were the tiles to protect.");
  if (sig.deadTileBurden >= 3) out.push("The cleanup priority was cutting isolated honors and disconnected singles.");
  if (sig.jokers > 0) out.push("The Joker helped only where the rest of the structure was already coherent.");
  return out.slice(0, 4);
}

// ── Archetypes ────────────────────────────────────────────────────────────────

const ARCHETYPES = {
  elite: ["Table Master", "Charleston Whisperer", "Clean Lane Reader", "Pattern Hunter", "Club Champion", "Precision Builder", "The Finisher", "Sharp Table Mind", "Structure Reader", "Ivory Strategist", "The Accelerator", "Rack Commander", "Calm Reader", "Controlled Aggressor", "Velvet Hammer"],
  strong: ["Sharp Reader", "Smooth Builder", "Quick Pivot", "Rack Refiner", "Table Technician", "Pattern Tracker", "Efficient Builder", "Flow Builder", "Strategic Connector", "Direction Finder", "Suit Specialist", "Pair Protector"],
  solid: ["Steady Builder", "Flexible Finder", "Table Reader", "Pattern Chaser", "Rack Shaper", "Balanced Builder", "Patient Planner", "Adaptive Reader", "Slow Burner", "Structure Seeker", "Measured Pivot"],
  mid: ["Table Tinkerer", "Late Structurer", "Wide Explorer", "Tile Collector", "Possibility Chaser", "Flexible Thinker", "Rack Wanderer", "Delayed Committer", "Direction Tester", "Pattern Sampler"],
  lower: ["Scattered Watcher", "Late Pivoter", "Tile Wanderer", "Split Direction Player", "Overthinker", "Shape Drifter", "Slow Committer", "Pattern Juggler", "Direction Doubter", "Shape Tinkerer"],
  low: ["Lost in the Charleston", "The Gambler", "Tile Tourist", "Pattern Dreamer", "Chaos Builder", "The Free Spirit", "Shape Chaser", "The Improviser", "Table Floater", "Pattern Wanderer"],
};

function archetypeBand(score) {
  if (score >= 90) return "elite";
  if (score >= 80) return "strong";
  if (score >= 70) return "solid";
  if (score >= 60) return "mid";
  if (score >= 40) return "lower";
  return "low";
}

function chooseArchetype(score, sig, passQuality, convergence, chosenId, bestId) {
  const band = archetypeBand(score);
  const list = ARCHETYPES[band];
  let seed =
    score * 7 +
    sig.pairs * 11 +
    sig.jokers * 13 +
    sig.deadTileBurden * 17 +
    Math.round(passQuality) * 3 +
    Math.round(convergence) +
    (chosenId === bestId ? 19 : 0);
  return list[Math.abs(seed) % list.length];
}

function buildHeadline(score, passQuality, convergence, chosenId, bestId) {
  if (chosenId && bestId && chosenId !== "other" && chosenId !== bestId) return "The better line appeared late.";
  if (score >= 90) return "Elite table read.";
  if (score >= 84) return "Sharp Charleston.";
  if (score >= 76) return "Strong instincts through the middle pass.";
  if (score >= 68) return "You found the clean lane late.";
  if (score >= 58) return convergence < 58 ? "A sharper pivot unlocks this rack." : "The rack rewarded your patience.";
  if (score >= 45) return "One cleaner pass changes the whole rack.";
  return "Tough table read.";
}

function buildSummary(score, bestPath, passQuality, convergence, chosenId = null, bestId = null) {
  const section = bestPath?.section || "your clearest lane";
  if (chosenId && bestId && chosenId !== "other" && chosenId !== bestId) {
    return `You were reading ${sectionName(chosenId)}, but the rack’s real signals pointed toward ${section}. The pairs gave you some structure, but the number tiles stayed too scattered to support the lane you chose.`;
  }
  if (score >= 90) return `You protected structure, cut the noise, and let ${section} become the table read.`;
  if (score >= 80) return `Strong shape after the Charleston. ${section} had enough structure to defend.`;
  if (score >= 70) return `You found a believable lane in ${section}, but the rack still needed a little more speed.`;
  if (score >= 60) return `The rack stayed playable, but a few medium-strength ideas kept competing for space.`;
  if (score >= 40) return `There were useful clues, but the rack never fully compressed around one direction.`;
  return `This rack needed patience. Protect structure first, then wait for a cleaner signal.`;
}

function buildCoachGuidance(score, bestPath, heldBack) {
  if (score >= 80) return `Keep trusting the strongest section-level signal. Your next edge is cutting slightly earlier when the lane is real.`;
  if (score >= 60) return `Your next improvement is compression. Pick the tiles doing two jobs and cut the singles doing none.`;
  return heldBack?.[0] || `Start by protecting pairs and cutting isolated honors before chasing a thin hand.`;
}

function tileEfficiencyObject(finalRack, sig, bestId) {
  return {
    compression: tileEfficiencyScore(finalRack, sig, bestId),
    usefulFlexibility: clamp((supportingTilesForSection(finalRack, bestId).length / Math.max(1, finalRack.length)) * 100),
    deadTileBurden: sig.deadTileBurden,
    acceleration: accelerationScore(finalRack, sig, bestId),
    deadnessRisk: deadnessRiskScore(finalRack, sig),
  };
}


function sectionOverlapRisk(closeIds = []) {
  const ids = new Set(closeIds);
  const overlaps = [
    ["threeSixNine", "consec"],
    ["threeSixNine", "like"],
    ["consec", "like"],
    ["evens", "like"],
    ["odds", "threeSixNine"],
    ["pairs", "quints"],
    ["pairs", "wd"],
  ];
  return overlaps.some(([a, b]) => ids.has(a) && ids.has(b));
}

function confidenceRating(sections = [], convergence = 0, efficiency = 0, deadnessRisk = 0, ctx = {}) {
  const bestSection = sections[0] || {};
  const best = bestSection.score || 0;
  const second = sections[1]?.score || 0;
  const gap = Math.max(0, best - second);
  const closeSections = sections.slice(1, 4).filter(s => best - s.score <= 14);
  const defensible = closeSections.length;
  const closeIds = [bestSection.id, ...closeSections.map(s => s.id)].filter(Boolean);

  const decisionScore = Number(ctx.decisionScore ?? 68);
  const passQuality = Number(ctx.passQuality ?? 68);
  const outcomeScore = Number(ctx.outcomeScore ?? best);
  const receiveLuck = Number(ctx.receiveLuck ?? 50);
  const exactFit = Number(ctx.exactFit ?? 0);
  const finalDirectionAccuracy = Number(ctx.finalDirectionAccuracy ?? 0);
  const sig = ctx.sig || {};
  const bestId = ctx.bestId || bestSection.id;
  const chosenSection = ctx.chosenSection;
  const directionConflict = Boolean(ctx.directionConflict || (chosenSection && chosenSection !== "other" && bestId && chosenSection !== bestId));
  const directionDefensible = Boolean(ctx.directionDefensible);

  const lowDecision = decisionScore < 58 || passQuality < 56;
  const softDecision = decisionScore < 72 || passQuality < 62;
  const highDeadness = deadnessRisk >= 58 || (sig.deadTileBurden ?? 0) >= 5;
  const moderateDeadness = deadnessRisk >= 38 || (sig.deadTileBurden ?? 0) >= 3;
  const luckyRescue = Boolean(ctx.luckyRescue || (receiveLuck >= 70 && decisionScore < 72 && outcomeScore - decisionScore >= 6));
  const majorPassMistake = Boolean(ctx.usefulPairPassed || (ctx.bestLineTilePassed && decisionScore < 72) || passQuality < 62);
  const ambiguousRack = defensible >= 1 || gap < 12 || sectionOverlapRisk(closeIds);
  const manyPairAmbiguity = bestId === "pairs" && (sig.pairs ?? 0) >= 5;
  const concealedPairCaution = bestId === "pairs" && ((sig.jokers ?? 0) > 0 || (sig.pairs ?? 0) >= 5 || gap < 14);
  const fragileYearCaution = bestId === "2026" && (((sig.soap ?? 0) === 0) || ((sig.twos ?? 0) === 0) || ((sig.sixes ?? 0) === 0) || (sig.yearCore ?? 0) < 7);
  const jokerQuintsCaution = bestId === "quints" && (sig.jokers ?? 0) > 0 && ((sig.triples ?? 0) < 2 || (sig.pairs ?? 0) < 4 || convergence < 60 || gap < 12);
  const fakeFlexibility = best < 58 || (efficiency < 28 && exactFit < 75) || (convergence < 52 && exactFit < 82 && gap < 12);
  const sectionOverlapCaution = sectionOverlapRisk(closeIds) && !(bestId === "like" && (sig.bestLikeCount ?? 0) >= 5) && !(bestId === "2026" && exactFit >= 88);
  const overlapCaution = sectionOverlapCaution || (bestId === "threeSixNine" && efficiency < 44) || (bestId === "consec" && gap < 12 && exactFit < 82);

  const raw = clamp(
    best * 0.24 +
    gap * 0.72 +
    convergence * 0.15 +
    efficiency * 0.12 +
    (100 - deadnessRisk) * 0.10 +
    decisionScore * 0.20 +
    passQuality * 0.10 -
    defensible * 8 -
    (ambiguousRack ? 5 : 0) -
    (luckyRescue ? 14 : 0) -
    (majorPassMistake ? 12 : 0) -
    (directionConflict ? 20 : 0)
  );

  let rating = "Low confidence";
  const cleanHigh =
    raw >= 76 &&
    best >= 76 &&
    gap >= 12 &&
    convergence >= 60 &&
    efficiency >= 38 &&
    deadnessRisk <= 36 &&
    decisionScore >= 74 &&
    passQuality >= 68 &&
    !ambiguousRack &&
    !majorPassMistake &&
    !luckyRescue &&
    !directionConflict &&
    !jokerQuintsCaution &&
    !manyPairAmbiguity &&
    !concealedPairCaution &&
    !fragileYearCaution &&
    !overlapCaution;

  const exactCleanHigh =
    raw >= 54 &&
    best >= 90 &&
    exactFit >= 88 &&
    convergence >= 45 &&
    decisionScore >= 76 &&
    deadnessRisk <= 24 &&
    (gap >= 8 || efficiency >= 75) &&
    !majorPassMistake &&
    !luckyRescue &&
    !directionConflict &&
    !jokerQuintsCaution &&
    !manyPairAmbiguity &&
    !concealedPairCaution &&
    !fragileYearCaution;

  if (directionConflict && !directionDefensible) {
    rating = "Low confidence";
  } else if (fakeFlexibility || highDeadness || lowDecision) {
    const correctReadable = !directionConflict && chosenSection === bestId && (
      (best >= 66 && decisionScore >= 62) ||
      (bestId === "pairs" && (sig.pairs ?? 0) >= 3 && decisionScore >= 54)
    );
    rating = (raw >= 52 || correctReadable) && !directionConflict ? "Medium confidence" : "Low confidence";
  } else if (cleanHigh || exactCleanHigh) {
    rating = "High confidence";
  } else if (raw >= 50 || best >= 62 || finalDirectionAccuracy >= 70) {
    rating = "Medium confidence";
  }

  if (directionConflict) rating = "Low confidence";
  if (luckyRescue || majorPassMistake || jokerQuintsCaution || manyPairAmbiguity || concealedPairCaution || fragileYearCaution || overlapCaution) {
    if (rating === "High confidence") rating = "Medium confidence";
  }
  if (softDecision && rating === "High confidence") rating = "Medium confidence";
  if (moderateDeadness && rating === "High confidence") rating = "Medium confidence";

  const completeYearRead = bestId === "2026" && (sig.soap ?? 0) >= 1 && (sig.twos ?? 0) >= 1 && (sig.sixes ?? 0) >= 1 && (sig.yearCore ?? 0) >= 9;
  if (completeYearRead && exactFit >= 82 && decisionScore >= 74 && !majorPassMistake && !luckyRescue && !directionConflict) {
    rating = "High confidence";
  }

  const explanation =
    rating === "High confidence" ? "The best path clearly separated, the pass quality supported it, and the rack had low deadness risk." :
    rating === "Medium confidence" ? "There was a believable best path, but ambiguity, pass quality, receive luck, or dead tile risk kept it from being certain." :
    "No section clearly separated enough, or the chosen read carried too much deadness, conflict, or pass risk.";

  return {
    rating,
    score: raw,
    gap,
    defensibleAlternativesCount: defensible,
    ambiguityFlags: {
      ambiguousRack,
      sectionOverlap: sectionOverlapRisk(closeIds),
      manyPairAmbiguity,
      concealedPairCaution,
      fragileYearCaution,
      jokerQuintsCaution,
      luckyRescue,
      majorPassMistake,
      directionConflict,
      highDeadness,
      fakeFlexibility,
    },
    explanation,
  };
}

function exposureTypeForSection(sectionId) {
  if (sectionId === "pairs") return "C";
  if (sectionId === "quints") return "X";
  if (sectionId === "2026") return "X";
  return "X";
}

function exposureRealismObject(bestPath, sig, finalFit, exactFit) {
  const exposure = exposureTypeForSection(bestPath?.sectionId);
  let callabilityScore = clamp(sig.triples * 18 + sig.pairs * 10 + sig.jokers * 8 + finalFit * 0.45);
  let concealedRisk = "Low";
  let explanation = `${bestPath?.section || "The best path"} looked playable because the rack had callable group structure.`;
  if (exposure === "C" || bestPath?.sectionId === "pairs") {
    callabilityScore = clamp(sig.pairs * 14 + exactFit * 0.38 - sig.jokers * 14 - sig.deadTileBurden * 5);
    concealedRisk = callabilityScore >= 70 ? "Medium" : "High";
    explanation = "The concealed path has value only when the exact tiles are already close. Jokers do not help Singles & Pairs.";
  } else if (callabilityScore < 52) {
    concealedRisk = "Medium";
    explanation = `${bestPath?.section || "The best path"} was plausible, but the rack still needed stronger group anchors before it became easy to call.`;
  }
  return {
    bestPathExposureType: exposure,
    callabilityScore,
    concealedRisk,
    explanation,
  };
}

function buildDefensibleAlternatives(sections = []) {
  const best = sections[0];
  if (!best) return [];
  return sections.slice(1, 5)
    .filter(sec => best.score - sec.score <= 18 && sec.score >= 42)
    .map(sec => ({
      section: sec.name,
      confidence: best.score - sec.score <= 8 ? "Medium" : "Low",
      whyDefensible: `${sec.name} had enough tile signal to keep in view.`,
      whyNotBest: `${best.name} had better fit, lower distance, or cleaner tile economy.`,
    }))
    .slice(0, 3);
}

function buildNearMisses(sections = [], chosenId, pass = {}) {
  const best = sections[0];
  if (!best) return [];
  return sections.slice(0, 4)
    .filter(sec => sec.score >= 46 && sec.score < 78)
    .map(sec => ({
      section: sec.name,
      reason: sec.explanation || `${sec.name} had a signal, but not enough clean structure.`,
      missingTiles: [sec.missingNeeds || "Cleaner support tiles"],
      keyMistake: chosenId && chosenId !== "other" && chosenId !== sec.id
        ? `The read stayed closer to ${sectionName(chosenId)} than ${sec.name}.`
        : pass.score < 66
          ? "At least one pass kept the rack wider than it needed to be."
          : "The path needed one more natural anchor.",
      scoreImpact: sec.id === best.id ? "This held the main score out of the elite range." : "This stayed as a backup lane, not the main read.",
    }))
    .slice(0, 3);
}

function buildExpertTableRead({ bestPath, chosenId, bestId, sig, confidence, decisionScore, receiveLuck }) {
  if (confidence?.rating === "Low confidence") {
    return "This was a low-confidence rack. No section clearly separated, so the expert play was to cut low-utility tiles and preserve the few real anchors.";
  }
  if (chosenId && bestId && chosenId !== "other" && chosenId !== bestId) {
    return `The rack wanted ${bestPath?.section || sectionName(bestId)} sooner. ${sectionName(chosenId)} was readable, but the stronger lane had better tile economy.`;
  }
  if (sig.jokers > 0 && sig.pairs < 2) {
    return "The Joker helped, but it did not solve the rack. Without a clear pung or kong target, it acted more like insurance than acceleration.";
  }
  if (decisionScore >= 78 && receiveLuck < 46) {
    return `You made clean decisions, but the table did not give much back. ${bestPath?.section || "The best lane"} stayed alive because the passes protected structure.`;
  }
  if (decisionScore < 62 && receiveLuck >= 68) {
    return "The rack improved from the tiles you received, but the pass quality was mixed. That keeps the score out of the top bands.";
  }
  if (sig.deadTileBurden >= 5) {
    return "This looked flexible, but much of the flexibility was fake. The rack had several ideas, but too many low-utility tiles survived.";
  }
  return `Your rack wanted ${bestPath?.section || "one clear lane"}. The key was protecting the anchors and cutting tiles that weakened no realistic path.`;
}

function enhancedTileEfficiencyObject(finalRack, sig, bestId, sections = []) {
  const map = tileValueMapForRack(finalRack, bestId, sections.slice(0, 3));
  const useful = map.filter(t => ["Anchor", "Strong keep", "Flexible keep", "Illegal pass"].includes(t.role));
  const softDead = map.filter(t => t.role === "Soft pass").map(t => t.tile);
  const hardDead = map.filter(t => t.role === "Clear pass").map(t => t.tile);
  const anchors = map.filter(t => t.role === "Anchor").map(t => t.tile);
  const flexible = map.filter(t => t.role === "Flexible keep" || t.role === "Strong keep").map(t => t.tile);
  return {
    compression: tileEfficiencyScore(finalRack, sig, bestId),
    usefulFlexibility: clamp((useful.length / Math.max(1, finalRack.length)) * 100),
    usefulTiles: useful.length,
    softDeadTiles: softDead,
    hardDeadTiles: hardDead,
    anchorTiles: anchors,
    flexibleTiles: flexible,
    deadTileBurden: sig.deadTileBurden,
    acceleration: accelerationScore(finalRack, sig, bestId),
    deadnessRisk: deadnessRiskScore(finalRack, sig),
    summary: hardDead.length
      ? `${hardDead.slice(0, 2).join(" and ")} looked like low-utility tiles for the best lane.`
      : anchors.length
        ? `${anchors.slice(0, 2).join(" and ")} gave the rack its clearest anchors.`
        : "The rack needed a cleaner anchor before the direction became obvious.",
    tileValueMap: map,
  };
}

function buildWhatYouDidWell(pass, sig, bestPath) {
  const out = [];
  if (pass.score >= 76) out.push("You passed from the weaker side of the rack without breaking the main structure.");
  if (sig.pairs >= 2) out.push("You kept natural pairs in play, which gave the rack real anchors.");
  if (sig.jokers > 0) out.push("You protected the Joker, which kept acceleration available for legal groups.");
  if (bestPath?.section) out.push(`${bestPath.section} stayed readable after the Charleston.`);
  return out.slice(0, 4);
}

function buildLuckSplitNote(decisionScore, receiveLuck, finalRackQuality) {
  if (decisionScore >= 75 && receiveLuck < 45) return "Strong decisions, poor receives. Your score is lower than your table read deserved.";
  if (decisionScore < 62 && receiveLuck >= 68) return "Lucky receive, loose decision. The rack improved, but the pass quality was mixed.";
  if (decisionScore >= 78 && finalRackQuality >= 78) return "Clean read and clean result. This was earned.";
  return "The score balances what you controlled with what the table gave back.";
}

function applyAdvancedHardCaps(score, ctx = {}) {
  let cap = 100;
  if (ctx.decisionScore < 50) cap = Math.min(cap, 65);
  if (ctx.decisionScore < 60) cap = Math.min(cap, 75);
  if (ctx.decisionScore < 70) cap = Math.min(cap, 85);
  if (ctx.usefulPairPassed) cap = Math.min(cap, 84);
  if (ctx.bestLineTilePassed) cap = Math.min(cap, 88);
  if (ctx.directionConflict) cap = Math.min(cap, ctx.directionDefensible ? 82 : 62);
  if (ctx.luckyRescue) cap = Math.min(cap, Math.max(58, ctx.decisionScore + 18));
  if (ctx.confidenceRating === "Low confidence") cap = Math.min(cap, ctx.decisionScore >= 84 ? 88 : 76);
  if (ctx.deadnessRisk >= 58) cap = Math.min(cap, 72);
  if (ctx.deadnessRisk >= 44) cap = Math.min(cap, 82);
  if (ctx.chosenSection === "pairs" && ctx.jokers > 0) cap = Math.min(cap, 52);
  return { score: clamp(Math.min(score, cap)), cap };
}

function applyScoreTrustCalibration(score, ctx = {}) {
  let calibrated = Number(score || 0);
  let cap = Number(ctx.baseCap || 100);
  const { sig = {}, bestId, chosenSection, finalFit = 0, exactFit = 0, decisionScore = 0, convergence = 0, passQuality = 0, confidenceRating = "", passLog = [] } = ctx;

  // Section realism caps. These keep visually impressive racks from scoring above what the card-like evidence supports.
  if (bestId === "wd" && sig.dragons >= 1) cap = Math.min(cap, 85);
  if (bestId === "quints") cap = Math.min(cap, 82);
  if (bestId === "evens") cap = Math.min(cap, 86);
  if (bestId === "suited") cap = Math.min(cap, 86);
  if (bestId === "2026") cap = Math.min(cap, 84);
  if (bestId === "2026" && ((sig.soap ?? 0) === 0 || (sig.twos ?? 0) === 0 || (sig.sixes ?? 0) === 0)) cap = Math.min(cap, 68);
  if (bestId === "2026" && (sig.yearCore ?? 0) < 6) cap = Math.min(cap, 62);
  if (bestId === "odds") cap = Math.min(cap, 84);
  if (bestId === "pairs" && sig.pairs >= 4) cap = Math.min(cap, 76);
  if (bestId === "pairs" && sig.jokers > 0) cap = Math.min(cap, 52);
  if (bestId === "consec" && sig.dragons >= 2 && sig.triples === 0) cap = Math.min(cap, 82);
  if (bestId === "consec" && sig.jokers >= 1 && exactFit < 88) cap = Math.min(cap, 84);
  if ((passLog || []).some(p => p.dir === "courtesy")) cap = Math.min(cap, 84);
  if (chosenSection === "pairs" && sig.jokers > 0) cap = Math.min(cap, 52);

  // Correct, clean reads should not be dragged below the playable/strong band just because alternatives tie on broad heuristics.
  if (chosenSection === bestId && bestId === "consec" && finalFit >= 70 && decisionScore >= 64 && convergence >= 65) calibrated = Math.max(calibrated, 70);
  if (chosenSection === bestId && finalFit >= 96 && exactFit >= 88 && sig.deadTileBurden <= 1 && decisionScore >= 76 && confidenceRating !== "Low confidence") calibrated = Math.max(calibrated, 82);
  if (chosenSection === bestId && bestId === "consec" && finalFit >= 98 && exactFit >= 88 && sig.deadTileBurden === 0 && decisionScore >= 82 && passQuality >= 88) calibrated = Math.max(calibrated, 85);

  // Low end floors for mixed but readable racks. This avoids making a plausible table read look chaotic.
  if (finalFit >= 20 && decisionScore >= 50 && calibrated < 48) calibrated = 48;
  if (chosenSection === bestId && finalFit >= 18 && decisionScore >= 50 && calibrated < 45) calibrated = 45;
  if (chosenSection === bestId && finalFit >= 45 && decisionScore >= 58 && calibrated < 55) calibrated = 55;

  return { score: clamp(Math.min(calibrated, cap)), cap };
}

export const EXPERT_TEST_RACK_LIBRARY = [
  "strong Consecutive Run rack", "weak fake-flexibility rack", "strong 2468 rack", "scattered honors rack",
  "strong Winds and Dragons rack", "Joker-heavy Quints rack", "Joker in Singles and Pairs trap",
  "flower-heavy but low-fit rack", "strong Like Numbers rack", "369 rack with fake nearby numbers",
  "Year hand with Soap as zero", "wrong dragon kept", "matching dragon correctly protected",
  "concealed hand over-chase", "lucky receive after bad pass", "bad receive after good pass",
  "pair passed incorrectly", "pair passed correctly because it was off-path", "many pairs rack",
  "no-pair rack", "one-suit rack", "three-suit ambiguity rack", "high dead tile burden",
  "low-confidence ambiguous rack", "clean exposed hand path", "concealed Singles and Pairs near miss",
  "dragon mismatch rack", "dominant suit with noisy honors", "strong start poor passes",
  "weak start strong pass discipline", "edge-number Consecutive Run trap", "Soap as dragon not zero",
  "honor pairs with no dragons", "Quints without joker trap", "received tiles open wrong section",
].map((testName, idx) => ({
  testName,
  startingRack: [],
  passSequence: [],
  receivedTiles: [],
  selectedDirection: idx % 3 === 0 ? "consec" : idx % 3 === 1 ? "wd" : "evens",
  expectedBestSection: "calibration scenario",
  expectedBestPathType: "section-level heuristic",
  acceptablePasses: [],
  badPasses: [],
  expectedScoreRange: [40, 88],
  expectedArchetypes: [],
  expectedCoachThemes: [testName],
}));

function directionMatchContext(finalRack, sections, chosenId, bestId, convergence) {
  const chosen = sections.find(s => s.id === chosenId);
  const best = sections.find(s => s.id === bestId);
  const chosenFit = chosen?.score || 0;
  const bestFit = best?.score || 0;
  const supportCount = chosenId && chosenId !== "other" ? sectionSupportCount(finalRack, chosenId, false) : 0;
  const gap = Math.max(0, bestFit - chosenFit);

  let quality = "unsure";
  if (!chosenId || chosenId === "other") quality = "unsure";
  else if (chosenId === bestId && chosenFit >= 66) quality = "strong";
  else if (chosenId === bestId && chosenFit >= 48) quality = "partial";
  else if (chosenId === bestId) quality = "weak";
  else if (supportCount < 3 || chosenFit < 30 || gap >= 28) quality = "wrong";
  else if (supportCount < 4 || chosenFit < 45 || gap >= 18) quality = "weak";
  else quality = "partial";

  const directionScore =
    quality === "strong" ? clamp(chosenFit * 0.32 + convergence * 0.08, 32, 40) :
    quality === "partial" ? clamp(chosenFit * 0.25 + convergence * 0.05, 22, 31) :
    quality === "weak" ? clamp(chosenFit * 0.20 + convergence * 0.03, 12, 21) :
    quality === "wrong" ? clamp(chosenFit * 0.16, 0, 11) :
    clamp((bestFit * 0.20 + convergence * 0.05), 12, 24);

  return { chosen, best, chosenFit, bestFit, supportCount, gap, quality, directionScore };
}

function applyDirectionCaps(score, ctx, chosenId, bestId) {
  if (!chosenId || chosenId === "other") return Math.min(score, 66);
  if (chosenId === bestId) return score;

  let cap = 62;
  if (ctx.chosenFit < 42) cap = Math.min(cap, 55);
  if (ctx.supportCount < 4) cap = Math.min(cap, 52);
  if (ctx.chosenFit < 24 && ctx.supportCount < 2) cap = Math.min(cap, 48);
  return Math.min(score, cap);
}


function normalizedDirectionScore(ctx) {
  return clamp((ctx?.directionScore || 0) * 2.5);
}

function exactCardFitScore(finalRack = [], sig = analyzeRackSignals(finalRack), bestId = bestSection(finalRack)?.id, finalFit = 0, convergence = 0, efficiency = 0, deadnessRisk = 0) {
  let score = clamp(finalFit * 0.58 + convergence * 0.16 + efficiency * 0.16 + (100 - deadnessRisk) * 0.10);

  // Section-specific realism caps. These prevent a pretty rack from looking like
  // a near-card fit when the exact line evidence is still thin.
  if (bestId === "wd" && sig.dragons === 0) score = Math.min(score, sig.windPairs?.length >= 2 ? 74 : 66);
  if (bestId === "quints" && (sig.jokers === 0 || sig.pairs < 2)) score = Math.min(score, 62);
  if (bestId === "pairs" && sig.jokers > 0) score = Math.min(score, 68);
  if (bestId === "consec") {
    const m = getConsecMetrics(finalRack);
    if (m.bestSameSuitWindow < 4 || m.bestSameSuitUnique < 3) score = Math.min(score, 72);
  }
  if (sig.deadTileBurden >= 5) score = Math.min(score, 70);
  if (sig.deadTileBurden >= 7) score = Math.min(score, 58);

  return clamp(score);
}

function scoreRarityCalibration(score, ctx = {}) {
  const {
    decisionScore = 0,
    outcomeScore = 0,
    exactCardFit = 0,
    finalFit = 0,
    directionQuality = "unsure",
    convergence = 0,
    deadnessRisk = 0,
    passQuality = 0,
  } = ctx;

  let cap = 100;

  // Skill controls the ceiling. Lucky outcomes should not masquerade as elite reads.
  if (decisionScore < 50) cap = Math.min(cap, 65);
  if (decisionScore < 60) cap = Math.min(cap, 75);
  if (decisionScore < 70) cap = Math.min(cap, 85);

  // Direction accuracy is required for high scores.
  if (directionQuality === "partial") cap = Math.min(cap, 84);
  if (directionQuality === "weak") cap = Math.min(cap, 70);
  if (directionQuality === "wrong") cap = Math.min(cap, 58);
  if (directionQuality === "unsure") cap = Math.min(cap, 78);

  // Exact card fit and deadness keep the top bands rare.
  if (finalFit < 66) cap = Math.min(cap, 79);
  if (exactCardFit < 72) cap = Math.min(cap, 84);
  if (deadnessRisk >= 42) cap = Math.min(cap, 82);
  if (deadnessRisk >= 58) cap = Math.min(cap, 72);

  // 90+ should require expert-level decision quality, not just a nice final rack.
  if (score >= 90) {
    const eliteReady =
      decisionScore >= 85 &&
      passQuality >= 82 &&
      exactCardFit >= 82 &&
      finalFit >= 78 &&
      convergence >= 74 &&
      deadnessRisk <= 34 &&
      directionQuality === "strong";
    if (!eliteReady) cap = Math.min(cap, 89);
  }

  // 95+ is reserved for near-perfect reads with strong final card alignment.
  if (score >= 95) {
    const exceptionalReady =
      decisionScore >= 92 &&
      passQuality >= 88 &&
      exactCardFit >= 90 &&
      finalFit >= 88 &&
      convergence >= 85 &&
      deadnessRisk <= 22 &&
      outcomeScore >= 86;
    if (!exceptionalReady) cap = Math.min(cap, 94);
  }

  return {
    score: clamp(Math.min(score, cap)),
    cap,
  };
}

// ── Main IQ calculator ────────────────────────────────────────────────────────

// Lightweight Rackle IQ calculator for validation scripts.
// It uses the same scoring formulas as calculateIQ, but skips narrative and UI fields.
export function calculateIQCore(startingRack = [], passLog = [], finalRack = [], chosenSection = null) {
  const sections = scoreSections(finalRack);
  const bestSec = sections[0];
  const sig = analyzeRackSignals(finalRack);
  const pass = passQualitySummary(startingRack, passLog, finalRack);
  const convergence = convergenceScore(startingRack, passLog, finalRack);
  const efficiency = tileEfficiencyScore(finalRack, sig, bestSec?.id);
  const acceleration = accelerationScore(finalRack, sig, bestSec?.id);
  const deadnessRisk = deadnessRiskScore(finalRack, sig);
  const timing = timingScore(passLog);
  const commitment = commitmentScore(passLog, finalRack);

  const finalFit = bestSec?.score || 0;
  const startingRackPotential = bestSection(startingRack)?.score || 0;
  const directionCtx = directionMatchContext(finalRack, sections, chosenSection, bestSec?.id, convergence);
  const finalDirectionAccuracy = normalizedDirectionScore(directionCtx);
  const exactFit = exactCardFitScore(finalRack, sig, bestSec?.id, finalFit, convergence, efficiency, deadnessRisk);
  const receiveLuck = receiveLuckScore(passLog, bestSec?.id);

  const outcomeScore = clamp(
    finalFit * 0.42 +
    exactFit * 0.22 +
    efficiency * 0.14 +
    acceleration * 0.08 +
    (100 - deadnessRisk) * 0.07 +
    convergence * 0.07
  );

  const decisionScore = clamp(
    pass.score * 0.34 +
    commitment * 0.18 +
    convergence * 0.17 +
    finalDirectionAccuracy * 0.16 +
    efficiency * 0.08 +
    timing * 0.07
  );

  const weightedModelScore = clamp(
    startingRackPotential * 0.10 +
    pass.score * 0.25 +
    commitment * 0.15 +
    convergence * 0.15 +
    exactFit * 0.15 +
    finalDirectionAccuracy * 0.10 +
    efficiency * 0.05 +
    (100 - deadnessRisk) * 0.05
  );

  const blendedScore = clamp(decisionScore * 0.60 + outcomeScore * 0.40);
  const uncappedTotalScore = clamp(blendedScore * 0.70 + weightedModelScore * 0.30);
  const directionCappedScore = clamp(applyDirectionCaps(uncappedTotalScore, directionCtx, chosenSection, bestSec?.id));
  const rarity = scoreRarityCalibration(directionCappedScore, {
    decisionScore,
    outcomeScore,
    exactCardFit: exactFit,
    finalFit,
    directionQuality: directionCtx.quality,
    convergence,
    deadnessRisk,
    passQuality: pass.score,
  });

  const directionConflict = Boolean(chosenSection && chosenSection !== "other" && bestSec?.id && chosenSection !== bestSec.id);
  const directionDefensible = directionConflict && sections.find(s => s.id === chosenSection && bestSec.score - s.score <= 14);
  const luckyRescue = receiveLuck >= 70 && decisionScore < 72 && outcomeScore - decisionScore >= 6;
  const confidence = confidenceRating(sections, convergence, efficiency, deadnessRisk, {
    decisionScore,
    passQuality: pass.score,
    outcomeScore,
    receiveLuck,
    exactFit,
    finalFit,
    finalDirectionAccuracy,
    sig,
    bestId: bestSec?.id,
    chosenSection,
    directionConflict,
    directionDefensible,
    luckyRescue,
    usefulPairPassed: pass.usefulPairPassed,
    bestLineTilePassed: pass.bestLineTilePassed,
  });

  const advancedCap = applyAdvancedHardCaps(rarity.score, {
    decisionScore,
    usefulPairPassed: pass.usefulPairPassed,
    bestLineTilePassed: pass.bestLineTilePassed,
    directionConflict,
    directionDefensible,
    luckyRescue,
    confidenceRating: confidence.rating,
    deadnessRisk,
    chosenSection,
    jokers: sig.jokers,
  });

  const scoreTrustCalibration = applyScoreTrustCalibration(advancedCap.score, {
    baseCap: advancedCap.cap,
    sig,
    bestId: bestSec?.id,
    chosenSection,
    finalFit,
    exactFit,
    decisionScore,
    convergence,
    passQuality: pass.score,
    confidenceRating: confidence.rating,
    passLog,
  });

  const totalScore = scoreTrustCalibration.score;

  return {
    rackleIQ: totalScore,
    totalScore,
    decisionScore,
    outcomeScore,
    startingRackPotential,
    convergenceScore: convergence,
    exactCardFitScore: exactFit,
    finalDirectionAccuracy,
    confidenceRating: confidence.rating,
    confidenceScore: confidence.score,
    confidence,
    receiveLuck,
    passQuality: pass.score,
    passAnalysis: pass.details,
    scoreCeiling: scoreTrustCalibration.cap,
    bestSection: bestSec?.id,
    bestPath: bestSec?.id,
    chosenSection,
  };
}

/**
 * Calculate the full Rackle IQ for a completed Charleston.
 *
 * @param {object[]} startingRack  13 tiles before any passes
 * @param {object[]} passLog       Array of { out, in, secs, label } per pass
 * @param {object[]} finalRack     13 tiles after all passes
 * @param {string} chosenSection   Section-level player read
 * @returns Structured Rackle evaluator output
 */
export function calculateIQ(startingRack = [], passLog = [], finalRack = [], chosenSection = null) {
  const sections = scoreSections(finalRack);
  const bestSec = sections[0];
  const sig = analyzeRackSignals(finalRack);
  const pass = passQualityDetail(startingRack, passLog, finalRack);
  const convergence = convergenceScore(startingRack, passLog, finalRack);
  const efficiency = tileEfficiencyScore(finalRack, sig, bestSec?.id);
  const acceleration = accelerationScore(finalRack, sig, bestSec?.id);
  const deadnessRisk = deadnessRiskScore(finalRack, sig);
  const timing = timingScore(passLog);
  const commitment = commitmentScore(passLog, finalRack);

  const finalFit = bestSec?.score || 0;
  const startingRackPotential = bestSection(startingRack)?.score || 0;
  const directionCtx = directionMatchContext(finalRack, sections, chosenSection, bestSec?.id, convergence);
  const finalDirectionAccuracy = normalizedDirectionScore(directionCtx);
  const exactFit = exactCardFitScore(finalRack, sig, bestSec?.id, finalFit, convergence, efficiency, deadnessRisk);
  const receiveLuck = receiveLuckScore(passLog, bestSec?.id);

  const outcomeScore = clamp(
    finalFit * 0.42 +
    exactFit * 0.22 +
    efficiency * 0.14 +
    acceleration * 0.08 +
    (100 - deadnessRisk) * 0.07 +
    convergence * 0.07
  );

  const decisionScore = clamp(
    pass.score * 0.34 +
    commitment * 0.18 +
    convergence * 0.17 +
    finalDirectionAccuracy * 0.16 +
    efficiency * 0.08 +
    timing * 0.07
  );

  const weightedModelScore = clamp(
    startingRackPotential * 0.10 +
    pass.score * 0.25 +
    commitment * 0.15 +
    convergence * 0.15 +
    exactFit * 0.15 +
    finalDirectionAccuracy * 0.10 +
    efficiency * 0.05 +
    (100 - deadnessRisk) * 0.05
  );

  const blendedScore = clamp(decisionScore * 0.60 + outcomeScore * 0.40);
  const uncappedTotalScore = clamp(blendedScore * 0.70 + weightedModelScore * 0.30);
  const directionCappedScore = clamp(applyDirectionCaps(uncappedTotalScore, directionCtx, chosenSection, bestSec?.id));
  const rarity = scoreRarityCalibration(directionCappedScore, {
    decisionScore,
    outcomeScore,
    exactCardFit: exactFit,
    finalFit,
    directionQuality: directionCtx.quality,
    convergence,
    deadnessRisk,
    passQuality: pass.score,
  });

  const directionConflict = Boolean(chosenSection && chosenSection !== "other" && bestSec?.id && chosenSection !== bestSec.id);
  const directionDefensible = directionConflict && sections.find(s => s.id === chosenSection && bestSec.score - s.score <= 14);
  const luckyRescue = receiveLuck >= 70 && decisionScore < 72 && outcomeScore - decisionScore >= 6;
  const confidence = confidenceRating(sections, convergence, efficiency, deadnessRisk, {
    decisionScore,
    passQuality: pass.score,
    outcomeScore,
    receiveLuck,
    exactFit,
    finalFit,
    finalDirectionAccuracy,
    sig,
    bestId: bestSec?.id,
    chosenSection,
    directionConflict,
    directionDefensible,
    luckyRescue,
    usefulPairPassed: pass.usefulPairPassed,
    bestLineTilePassed: pass.bestLineTilePassed,
  });
  const advancedCap = applyAdvancedHardCaps(rarity.score, {
    decisionScore,
    usefulPairPassed: pass.usefulPairPassed,
    bestLineTilePassed: pass.bestLineTilePassed,
    directionConflict,
    directionDefensible,
    luckyRescue,
    confidenceRating: confidence.rating,
    deadnessRisk,
    chosenSection,
    jokers: sig.jokers,
  });
  const scoreTrustCalibration = applyScoreTrustCalibration(advancedCap.score, {
    baseCap: advancedCap.cap,
    sig,
    bestId: bestSec?.id,
    chosenSection,
    finalFit,
    exactFit,
    decisionScore,
    convergence,
    passQuality: pass.score,
    confidenceRating: confidence.rating,
    passLog,
  });
  const totalScore = scoreTrustCalibration.score;
  const finalRackQuality = outcomeScore;
  const luckAdjustedScore = clamp(decisionScore * 0.72 + finalRackQuality * 0.28 - Math.max(0, receiveLuck - 65) * 0.18);

  const directionScore = directionCtx.directionScore;
  const tileStrengthScore = clamp((efficiency * 0.62 + acceleration * 0.38) * 0.25, 0, 25);
  const passQualityScore = clamp(pass.score * 0.25, 0, 25);
  const timingScore10 = clamp(timing * 0.10, 0, 10);

  const bestPaths = buildBestPaths(sections).map(path => ({
    ...path,
    exposureType: exposureTypeForSection(path.sectionId),
    value: path.sectionId === "pairs" ? 50 : path.sectionId === "quints" ? 40 : 25,
    distance: clamp(12 - (path.fitScore || 0) / 10, 0, 12),
    usefulJokers: path.sectionId === "pairs" ? 0 : sig.jokers,
    deadTiles: enhancedTileEfficiencyObject(finalRack, sig, path.sectionId, sections).hardDeadTiles,
    riskLevel: path.confidence === "high" ? "Low" : path.confidence === "medium" ? "Medium" : "High",
    whyItFits: path.explanation,
    whyItIsRisky: path.risk,
    nextBestMove: path.missingNeeds,
  }));
  const heldBack = buildHeldBack(sig, pass.score, convergence, chosenSection, bestSec?.id, directionCtx);
  const strongSaw = buildStrongPlayersSaw(sig, bestPaths[0], chosenSection);
  const archetype = chooseArchetype(totalScore, sig, pass.score, convergence, chosenSection, bestSec?.id);
  const headline = buildHeadline(totalScore, pass.score, convergence, chosenSection, bestSec?.id);
  const summary = buildSummary(totalScore, bestPaths[0], pass.score, convergence, chosenSection, bestSec?.id);
  const coachGuidance = buildCoachGuidance(totalScore, bestPaths[0], heldBack);
  const tileEfficiency = enhancedTileEfficiencyObject(finalRack, sig, bestSec?.id, sections);
  const defensibleAlternatives = buildDefensibleAlternatives(sections);
  const nearMisses = buildNearMisses(sections, chosenSection, pass);
  const exposureRealism = exposureRealismObject(bestPaths[0], sig, finalFit, exactFit);
  const expertTableRead = buildExpertTableRead({ bestPath: bestPaths[0], chosenId: chosenSection, bestId: bestSec?.id, sig, confidence, decisionScore, receiveLuck });
  const luckSplitNote = buildLuckSplitNote(decisionScore, receiveLuck, finalRackQuality);
  const whatYouDidWell = buildWhatYouDidWell(pass, sig, bestPaths[0]);

  const passInsights = pass.details.map(d => ({
    label: d.label,
    passed: d.passed?.length || 3,
    quality: d.quality,
    note: d.note,
  }));

  const shareText = `Rackle IQ ${totalScore} · ${archetype} · ${bestPaths[0]?.section || "Table Read"}`;

  return {
    rackleIQ: totalScore,
    decisionScore,
    outcomeScore,
    startingRackPotential,
    convergenceScore: convergence,
    exactCardFitScore: exactFit,
    finalDirectionAccuracy,
    confidenceRating: confidence.rating,
    confidenceScore: confidence.score,
    confidence,
    decisionQuality: decisionScore,
    receiveLuck,
    finalRackQuality,
    luckAdjustedScore,
    luckSplitNote,
    exposureRealism,
    nearMisses,
    defensibleAlternatives,
    expertTableRead,
    tableReadSummary: expertTableRead,
    whatYouDidWell,
    tileValueMap: tileEfficiency.tileValueMap,
    scoreCeiling: scoreTrustCalibration.cap,
    archetype,
    headline,
    summary,
    bestPaths,
    passAnalysis: pass.details,
    rackSignals: sig.signals,
    tileEfficiency,
    whatHeldYouBack: heldBack,
    whatStrongPlayersSaw: strongSaw,
    coachGuidance,
    shareText,

    // Backward-compatible fields already used by the app.
    totalScore,
    iqScore: totalScore,
    directionScore,
    tileStrengthScore,
    passQualityScore,
    timingScore: timingScore10,
    bestSection: bestSec?.id || "consec",
    bestSectionName: bestSec?.name || "Consecutive Run",
    bestSectionScore: bestSec?.score || 0,
    allSections: sections,
    passInsights,
    finalRack,
    startingRack,
    chosenSection,
    styleName: archetype,
    styleNote: coachGuidance,
    expertFactors: {
      efficiency,
      compression: tileEfficiency.compression,
      acceleration,
      convergence,
      deadnessRisk,
      usefulFlexibility: tileEfficiency.usefulFlexibility,
      commitment,
      startingRackPotential,
      exactCardFit: exactFit,
      finalDirectionAccuracy,
      scoreCeiling: scoreTrustCalibration.cap,
    },
    strategicRead: {
      bestDirection: bestSec?.name,
      chosenDirection: sectionName(chosenSection),
      alignment: chosenSection && chosenSection !== "other" && chosenSection === bestSec?.id ? "aligned" : "misaligned",
      directionQuality: directionCtx.quality,
      chosenFit: directionCtx.chosenFit,
      supportCount: directionCtx.supportCount,
      uncappedScore: uncappedTotalScore,
      directionCappedScore,
      scoreCeiling: scoreTrustCalibration.cap,
    },
  };
}
