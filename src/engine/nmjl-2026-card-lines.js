// Rackle 2026 card-line database layer.
//
// The engine uses these structured line specs to evaluate real card-line shape
// without rendering or relying on copied card text in the product UI. Keep labels
// short and internal. Use IDs, sections, tile requirements, and line-shape rules.

export const CARD_YEAR = 2026;

export const CARD_SECTION_IDS = [
  "2026",
  "evens",
  "like",
  "quints",
  "consec",
  "odds",
  "wd",
  "threeSixNine",
  "pairs",
  "suited",
];

const SUITS = ["bam", "crak", "dot"];
const WINDS = ["E", "S", "W", "N"];
const DRAGONS = ["Red", "Grn", "Soap"];

function tileKey(tile) {
  if (!tile) return "x";
  if (tile.t === "s") return `s-${tile.s}-${tile.n}`;
  if (tile.t === "d") return `d-${tile.v}`;
  if (tile.t === "w") return `w-${tile.v}`;
  return tile.t;
}


const evaluationCache = new Map();
const MAX_EVALUATION_CACHE_SIZE = 2000;

function rackSignature(rack = []) {
  return rack
    .map(tileKey)
    .sort()
    .join("|");
}

function cacheSet(key, value) {
  if (evaluationCache.size >= MAX_EVALUATION_CACHE_SIZE) {
    const firstKey = evaluationCache.keys().next().value;
    evaluationCache.delete(firstKey);
  }
  evaluationCache.set(key, value);
}

function freqMap(rack = [], includeJokers = false) {
  const freq = {};
  rack.forEach(tile => {
    if (!includeJokers && tile?.t === "j") return;
    const key = tileKey(tile);
    freq[key] = (freq[key] || 0) + 1;
  });
  return freq;
}

function matchingKeys(rack, predicate) {
  return new Set(rack.filter(predicate).map(tileKey));
}

function countNaturalPairs(rack, predicate = () => true) {
  const freq = {};
  rack.filter(tile => tile?.t !== "j" && predicate(tile)).forEach(tile => {
    const key = tileKey(tile);
    freq[key] = (freq[key] || 0) + 1;
  });
  return Object.values(freq).filter(count => count >= 2).length;
}

function countNaturalTriples(rack, predicate = () => true) {
  const freq = {};
  rack.filter(tile => tile?.t !== "j" && predicate(tile)).forEach(tile => {
    const key = tileKey(tile);
    freq[key] = (freq[key] || 0) + 1;
  });
  return Object.values(freq).filter(count => count >= 3).length;
}

function countNaturalGroups(rack, predicate = () => true) {
  const freq = {};
  rack.filter(tile => tile?.t !== "j" && predicate(tile)).forEach(tile => {
    const key = tileKey(tile);
    freq[key] = (freq[key] || 0) + 1;
  });
  const values = Object.values(freq);
  return {
    pairs: values.filter(count => count >= 2).length,
    triples: values.filter(count => count >= 3).length,
    quads: values.filter(count => count >= 4).length,
  };
}

function countGroupStatsForTiles(tiles = []) {
  const freq = {};
  tiles.filter(tile => tile?.t !== "j").forEach(tile => {
    const key = tileKey(tile);
    freq[key] = (freq[key] || 0) + 1;
  });
  const values = Object.values(freq);
  return {
    pairs: values.filter(count => count >= 2).length,
    triples: values.filter(count => count >= 3).length,
    quads: values.filter(count => count >= 4).length,
  };
}

function req(id, description, predicate, options = {}) {
  return {
    id,
    description,
    predicate,
    min: options.min ?? 1,
    ideal: options.ideal ?? options.min ?? 1,
    weight: options.weight ?? 1,
    critical: Boolean(options.critical),
    pairSensitive: Boolean(options.pairSensitive),
    allowJokers: Boolean(options.allowJokers),
  };
}

function reqFamily(id, description, family, options = {}) {
  return {
    id,
    description,
    family,
    predicate: () => false,
    min: options.min ?? 1,
    ideal: options.ideal ?? options.min ?? 1,
    weight: options.weight ?? 1,
    critical: Boolean(options.critical),
    pairSensitive: Boolean(options.pairSensitive),
    allowJokers: Boolean(options.allowJokers),
  };
}

function line(id, section, title, requirements, options = {}) {
  return {
    id,
    section,
    title,
    concealed: Boolean(options.concealed),
    allowsJokers: options.allowsJokers !== false,
    exactness: options.exactness ?? "medium",
    requirements,
    tags: options.tags || [],
  };
}

function isNumber(numbers) {
  const allowed = new Set(numbers);
  return tile => tile?.t === "s" && allowed.has(tile.n);
}

function isSuitNumber(suit, numbers) {
  const allowed = new Set(numbers);
  return tile => tile?.t === "s" && tile.s === suit && allowed.has(tile.n);
}

function isLikeNumber(n) {
  return tile => tile?.t === "s" && tile.n === n;
}

function isSuit(tileSuit) {
  return tile => tile?.t === "s" && tile.s === tileSuit;
}

function isAnyDragon(tile) { return tile?.t === "d"; }
function isSoap(tile) { return tile?.t === "d" && tile.v === "Soap"; }
function isAnyWind(tile) { return tile?.t === "w"; }
function isHonor(tile) { return tile?.t === "w" || tile?.t === "d"; }
function isFlower(tile) { return tile?.t === "f"; }
function isJoker(tile) { return tile?.t === "j"; }

function buildCardLines() {
  const lines = [];

  // Physical 2026 NMJL card line specs, reviewed against the owner-provided
  // card images. These are internal structural specs, not player-facing card
  // text. Variants inside a printed line are represented by one line spec when
  // the same Charleston read protects the same tile family.

  // 2026 section: 4 printed lines.
  lines.push(
    line("2026-01-two-suit-year", "2026", "2026 line 1", [
      req("twos", "2s", isNumber([2]), { min: 3, ideal: 7, weight: 2.1, critical: true, pairSensitive: true }),
      req("soaps", "Soap zeros", isSoap, { min: 2, ideal: 3, weight: 1.9, critical: true, pairSensitive: true }),
      req("sixes", "6s", isNumber([6]), { min: 2, ideal: 4, weight: 1.7, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "year", "soap"] }),
    line("2026-02-dragons-kong", "2026", "2026 line 2", [
      req("year-core", "2026 core", tile => isSoap(tile) || isNumber([2, 6])(tile), { min: 3, ideal: 6, weight: 1.8, critical: true, pairSensitive: true }),
      req("twos", "2 kong option", isNumber([2]), { min: 2, ideal: 4, weight: 1.5, critical: true, pairSensitive: true }),
      req("dragons", "dragon groups", isAnyDragon, { min: 3, ideal: 6, weight: 1.6, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "year", "dragon"] }),
    line("2026-03-flower-year", "2026", "2026 line 3", [
      req("flowers", "flower pair", isFlower, { min: 2, ideal: 2, weight: 1.4, critical: true, pairSensitive: true }),
      req("year-core", "2026 core", tile => isSoap(tile) || isNumber([2, 6])(tile), { min: 4, ideal: 6, weight: 1.4, critical: true, pairSensitive: true }),
      req("soaps", "Soap zero", isSoap, { min: 1, ideal: 1, weight: 1.1, critical: true, pairSensitive: true }),
      req("twos", "2s", isNumber([2]), { min: 2, ideal: 3, weight: 1.2, critical: true, pairSensitive: true }),
      req("sixes", "6s", isNumber([6]), { min: 2, ideal: 4, weight: 1.2, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "year", "flower"] }),
    line("2026-04-news-year", "2026", "2026 line 4", [
      req("twos", "2s", isNumber([2]), { min: 3, ideal: 5, weight: 1.7, critical: true, pairSensitive: true }),
      req("soaps", "Soap zeros", isSoap, { min: 2, ideal: 2, weight: 1.6, critical: true, pairSensitive: true }),
      req("sixes", "6s", isNumber([6]), { min: 2, ideal: 3, weight: 1.3, critical: true, pairSensitive: true }),
      req("winds", "NEWS wind set", isAnyWind, { min: 3, ideal: 4, weight: 1.2, critical: true }),
    ], { exactness: "high", tags: ["physical", "year", "winds"] })
  );

  // 2468 section: 8 printed lines.
  lines.push(
    line("evens-01-stacked-even-run", "evens", "2468 line 1", [
      req("evens", "2-4-6-8 structure", isNumber([2, 4, 6, 8]), { min: 10, ideal: 13, weight: 2.8, critical: true, pairSensitive: true }),
    ], { exactness: "medium", tags: ["physical", "2468"] }),
    line("evens-02-flowers-2222-44-66-8888", "evens", "2468 line 2", [
      req("flowers", "flower pair", isFlower, { min: 2, ideal: 2, weight: 1.1, critical: true, pairSensitive: true }),
      req("evens", "2-4-6-8 structure", isNumber([2, 4, 6, 8]), { min: 6, ideal: 11, weight: 2.5, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "2468", "flower"] }),
    line("evens-03-east-west", "evens", "2468 line 3", [
      req("east-west", "East/West support", tile => tile?.t === "w" && ["E", "W"].includes(tile.v), { min: 2, ideal: 4, weight: 1.3, critical: true, pairSensitive: true }),
      req("evens", "same-lane even structure", isNumber([2, 4, 6, 8]), { min: 6, ideal: 9, weight: 2.3, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "2468", "winds"] }),
    line("evens-04-dragon-bookends", "evens", "2468 line 4", [
      req("evens", "2 and 8 kongs", isNumber([2, 8]), { min: 4, ideal: 8, weight: 2.2, critical: true, pairSensitive: true }),
      req("dragons", "matching dragon groups", isAnyDragon, { min: 3, ideal: 6, weight: 1.6, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "2468", "dragon"] }),
    line("evens-05-flower-one-suit", "evens", "2468 line 5", [
      req("flowers", "flower group", isFlower, { min: 2, ideal: 3, weight: 1.1, critical: true, pairSensitive: true }),
      req("evens", "2-4-6-8 one-lane structure", isNumber([2, 4, 6, 8]), { min: 6, ideal: 10, weight: 2.4, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "2468", "flower"] }),
    line("evens-06-like-kongs-dragon", "evens", "2468 line 6", [
      req("like-even-kongs", "like even kongs", isNumber([2, 4, 6, 8]), { min: 8, ideal: 10, weight: 2.7, critical: true, pairSensitive: true }),
      req("dragons", "matching dragon pair", isAnyDragon, { min: 2, ideal: 2, weight: 1.0, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "2468", "like", "dragon"] }),
    line("evens-07-flowers-2468-kong", "evens", "2468 line 7", [
      req("flowers", "flower groups", isFlower, { min: 3, ideal: 6, weight: 1.4, critical: true, pairSensitive: true }),
      req("evens", "2468 plus even kong", isNumber([2, 4, 6, 8]), { min: 5, ideal: 8, weight: 2.2, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "2468", "flower"] }),
    line("evens-08-concealed-246-888", "evens", "2468 line 8", [
      req("evens", "246 and 888 shape", isNumber([2, 4, 6, 8]), { min: 8, ideal: 11, weight: 2.6, critical: true, pairSensitive: true }),
      req("flowers", "flower pair", isFlower, { min: 1, ideal: 2, weight: 0.8, pairSensitive: true }),
    ], { concealed: true, exactness: "high", tags: ["physical", "2468", "concealed"] })
  );

  // Any Like Numbers section: 3 printed lines.
  lines.push(
    line("like-01-flowers-like", "like", "Like Numbers line 1", [
      reqFamily("like-number", "like number groups", { type: "like-number" }, { min: 4, ideal: 8, weight: 2.4, critical: true, pairSensitive: true }),
      req("flowers", "flower group", isFlower, { min: 4, ideal: 5, weight: 1.4, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "like", "flower"] }),
    line("like-02-dragons-like", "like", "Like Numbers line 2", [
      reqFamily("like-number", "like number groups", { type: "like-number" }, { min: 4, ideal: 10, weight: 2.5, critical: true, pairSensitive: true }),
      req("dragons", "matching dragon support", isAnyDragon, { min: 3, ideal: 3, weight: 1.2, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "like", "dragon"] }),
    line("like-03-flowers-dragon", "like", "Like Numbers line 3", [
      reqFamily("like-number", "like number pairs and kong", { type: "like-number" }, { min: 4, ideal: 9, weight: 2.4, critical: true, pairSensitive: true }),
      req("flowers", "flower pair", isFlower, { min: 2, ideal: 2, weight: 0.9, critical: true, pairSensitive: true }),
      req("dragons", "dragon pair", isAnyDragon, { min: 2, ideal: 2, weight: 0.8, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "like", "flower", "dragon"] })
  );

  // Quints section: 3 printed lines.
  lines.push(
    line("quints-01-like-numbers", "quints", "Quints line 1", [
      reqFamily("natural-anchor", "natural like-number anchors", { type: "like-number" }, { min: 3, ideal: 8, weight: 2.2, critical: true, pairSensitive: true }),
      req("jokers", "joker quint fuel", isJoker, { min: 1, ideal: 4, weight: 1.4, critical: true, allowJokers: true }),
    ], { exactness: "medium", tags: ["physical", "quints", "joker"] }),
    line("quints-02-flower-consecutive", "quints", "Quints line 2", [
      req("flowers", "flower pair", isFlower, { min: 2, ideal: 2, weight: 1.0, critical: true, pairSensitive: true }),
      req("numbers", "consecutive number anchors", tile => tile?.t === "s", { min: 6, ideal: 9, weight: 2.2, critical: true, pairSensitive: true }),
      req("jokers", "joker quint fuel", isJoker, { min: 1, ideal: 4, weight: 1.2, critical: true, allowJokers: true }),
    ], { exactness: "medium", tags: ["physical", "quints", "flower", "consecutive"] }),
    line("quints-03-dragon-anchor", "quints", "Quints line 3", [
      reqFamily("number-anchor", "number quint anchor", { type: "like-number" }, { min: 3, ideal: 5, weight: 1.8, critical: true, pairSensitive: true }),
      req("dragon-anchor", "opposite dragon quint anchor", isAnyDragon, { min: 3, ideal: 4, weight: 1.6, critical: true, pairSensitive: true }),
      req("jokers", "joker quint fuel", isJoker, { min: 1, ideal: 4, weight: 1.2, critical: true, allowJokers: true }),
    ], { exactness: "medium", tags: ["physical", "quints", "dragon", "joker"] })
  );

  // Consecutive Run section: 8 printed lines.
  lines.push(
    line("consec-01-long-run", "consec", "Consecutive Run line 1", [
      req("numbers", "long consecutive run", tile => tile?.t === "s", { min: 8, ideal: 13, weight: 3.0, critical: true, pairSensitive: true }),
    ], { exactness: "medium", tags: ["physical", "consecutive"] }),
    line("consec-02-flowers-run", "consec", "Consecutive Run line 2", [
      req("flowers", "flower group", isFlower, { min: 3, ideal: 4, weight: 1.2, critical: true, pairSensitive: true }),
      req("numbers", "three-number run", tile => tile?.t === "s", { min: 7, ideal: 9, weight: 2.4, critical: true, pairSensitive: true }),
    ], { exactness: "medium", tags: ["physical", "consecutive", "flower"] }),
    line("consec-03-three-suits", "consec", "Consecutive Run line 3", [
      req("numbers", "three consecutive numbers across suits", tile => tile?.t === "s", { min: 9, ideal: 13, weight: 3.0, critical: true, pairSensitive: true }),
    ], { exactness: "medium", tags: ["physical", "consecutive", "three-suits"] }),
    line("consec-04-four-number-run", "consec", "Consecutive Run line 4", [
      req("numbers", "four-number run", tile => tile?.t === "s", { min: 9, ideal: 13, weight: 3.0, critical: true, pairSensitive: true }),
    ], { exactness: "medium", tags: ["physical", "consecutive", "four-run"] }),
    line("consec-05-dragon-middle", "consec", "Consecutive Run line 5", [
      req("flowers", "flower pair", isFlower, { min: 2, ideal: 3, weight: 0.9, pairSensitive: true }),
      req("numbers", "run around middle number", tile => tile?.t === "s", { min: 5, ideal: 7, weight: 1.8, critical: true, pairSensitive: true }),
      req("dragons", "dragon kong", isAnyDragon, { min: 3, ideal: 4, weight: 1.4, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "consecutive", "dragon"] }),
    line("consec-06-flowers-two-numbers", "consec", "Consecutive Run line 6", [
      req("flowers", "flower run", isFlower, { min: 4, ideal: 6, weight: 1.5, critical: true, pairSensitive: true }),
      req("numbers", "two consecutive kongs", tile => tile?.t === "s", { min: 6, ideal: 8, weight: 2.2, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "consecutive", "flower"] }),
    line("consec-07-flowers-three-kongs", "consec", "Consecutive Run line 7", [
      req("flowers", "flower pair", isFlower, { min: 2, ideal: 2, weight: 0.8, critical: true, pairSensitive: true }),
      req("numbers", "three consecutive kongs", tile => tile?.t === "s", { min: 9, ideal: 11, weight: 2.9, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "consecutive", "flower"] }),
    line("consec-08-concealed-pair-run", "consec", "Consecutive Run line 8", [
      req("numbers", "paired consecutive run", tile => tile?.t === "s", { min: 12, ideal: 13, weight: 3.1, critical: true, pairSensitive: true }),
    ], { concealed: true, exactness: "high", tags: ["physical", "consecutive", "pairs"] })
  );

  // 13579 section: 8 printed lines.
  lines.push(
    line("odds-01-long-odd-run", "odds", "13579 line 1", [
      req("odds", "odd-number run", isNumber([1, 3, 5, 7, 9]), { min: 8, ideal: 13, weight: 3.0, critical: true, pairSensitive: true }),
    ], { exactness: "medium", tags: ["physical", "13579"] }),
    line("odds-02-two-suit-odd", "odds", "13579 line 2", [
      req("odds", "odd-number two-suit structure", isNumber([1, 3, 5, 7, 9]), { min: 8, ideal: 13, weight: 3.0, critical: true, pairSensitive: true }),
    ], { exactness: "medium", tags: ["physical", "13579"] }),
    line("odds-03-north-south", "odds", "13579 line 3", [
      req("north-south", "North/South support", tile => tile?.t === "w" && ["N", "S"].includes(tile.v), { min: 3, ideal: 4, weight: 1.2, critical: true, pairSensitive: true }),
      req("odds", "odd-number one-suit structure", isNumber([1, 3, 5, 7, 9]), { min: 7, ideal: 9, weight: 2.4, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "13579", "winds"] }),
    line("odds-04-pair-kongs", "odds", "13579 line 4", [
      req("odds", "odd pair and kong shape", isNumber([1, 3, 5, 7, 9]), { min: 10, ideal: 13, weight: 3.0, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "13579", "pairs"] }),
    line("odds-05-flower-dragon", "odds", "13579 line 5", [
      req("flowers", "flower group", isFlower, { min: 3, ideal: 3, weight: 1.0, critical: true, pairSensitive: true }),
      req("odds", "odd-number structure", isNumber([1, 3, 5, 7, 9]), { min: 6, ideal: 7, weight: 2.0, critical: true, pairSensitive: true }),
      req("dragons", "matching dragon kong", isAnyDragon, { min: 3, ideal: 4, weight: 1.2, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "13579", "dragon", "flower"] }),
    line("odds-06-three-suits", "odds", "13579 line 6", [
      req("odds", "odd-number three-suit structure", isNumber([1, 3, 5, 7, 9]), { min: 10, ideal: 13, weight: 3.0, critical: true, pairSensitive: true }),
    ], { exactness: "medium", tags: ["physical", "13579", "three-suits"] }),
    line("odds-07-concealed-these-only", "odds", "13579 line 7", [
      req("flowers", "flower pair", isFlower, { min: 2, ideal: 2, weight: 0.8, critical: true, pairSensitive: true }),
      req("odds", "specified odd numbers", isNumber([1, 3, 5, 7, 9]), { min: 11, ideal: 11, weight: 3.0, critical: true, pairSensitive: true }),
    ], { concealed: true, exactness: "high", tags: ["physical", "13579", "concealed"] }),
    line("odds-08-concealed-dragon", "odds", "13579 line 8", [
      req("flowers", "flower pair", isFlower, { min: 2, ideal: 2, weight: 0.8, critical: true, pairSensitive: true }),
      req("odds", "13579 one-suit core", isNumber([1, 3, 5, 7, 9]), { min: 7, ideal: 8, weight: 2.2, critical: true, pairSensitive: true }),
      req("dragons", "opposite dragon group", isAnyDragon, { min: 3, ideal: 3, weight: 1.2, critical: true, pairSensitive: true }),
    ], { concealed: true, exactness: "high", tags: ["physical", "13579", "dragon", "concealed"] })
  );

  // Winds & Dragons section: 8 printed lines.
  lines.push(
    line("wd-01-wind-kongs", "wd", "Winds & Dragons line 1", [
      req("winds", "wind kongs and pungs", isAnyWind, { min: 8, ideal: 13, weight: 3.0, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "winds"] }),
    line("wd-02-run-dragons", "wd", "Winds & Dragons line 2", [
      req("numbers", "four-number run", tile => tile?.t === "s", { min: 4, ideal: 4, weight: 1.2, critical: true }),
      req("dragons", "three dragon groups", isAnyDragon, { min: 7, ideal: 9, weight: 2.5, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "dragons", "consecutive"] }),
    line("wd-03-like-odd-winds", "wd", "Winds & Dragons line 3", [
      req("winds", "wind pungs", isAnyWind, { min: 4, ideal: 6, weight: 1.7, critical: true, pairSensitive: true }),
      req("odds", "like odd numbers", isNumber([1, 3, 5, 7, 9]), { min: 6, ideal: 7, weight: 1.8, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "winds", "odds"] }),
    line("wd-04-like-even-winds", "wd", "Winds & Dragons line 4", [
      req("winds", "wind pungs", isAnyWind, { min: 4, ideal: 6, weight: 1.7, critical: true, pairSensitive: true }),
      req("evens", "like even numbers", isNumber([2, 4, 6, 8]), { min: 6, ideal: 7, weight: 1.8, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "winds", "evens"] }),
    line("wd-05-flowers-wind-dragon", "wd", "Winds & Dragons line 5", [
      req("flowers", "flower group", isFlower, { min: 3, ideal: 3, weight: 1.0, critical: true, pairSensitive: true }),
      req("winds", "wind group", isAnyWind, { min: 4, ideal: 4, weight: 1.4, critical: true, pairSensitive: true }),
      req("dragons", "dragon group", isAnyDragon, { min: 4, ideal: 4, weight: 1.4, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "winds", "dragons", "flower"] }),
    line("wd-06-wind-number-sequence", "wd", "Winds & Dragons line 6", [
      req("winds", "NEWS number-wind pattern", isAnyWind, { min: 6, ideal: 8, weight: 2.1, critical: true, pairSensitive: true }),
      req("numbers", "1-4 number pattern", isNumber([1, 2, 3, 4]), { min: 4, ideal: 5, weight: 1.3, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "winds", "numbers"] }),
    line("wd-07-flowers-winds-dragons", "wd", "Winds & Dragons line 7", [
      req("flowers", "flower pair", isFlower, { min: 1, ideal: 2, weight: 0.8, pairSensitive: true }),
      req("winds", "wind kong", isAnyWind, { min: 4, ideal: 5, weight: 1.8, critical: true, pairSensitive: true }),
      req("dragons", "two dragon pairs", isAnyDragon, { min: 4, ideal: 4, weight: 1.4, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "winds", "dragons"] }),
    line("wd-08-concealed-2026-winds", "wd", "Winds & Dragons line 8", [
      req("winds", "paired wind support", isAnyWind, { min: 7, ideal: 8, weight: 2.0, critical: true, pairSensitive: true }),
      req("year-core", "2026 core", tile => isSoap(tile) || isNumber([2, 6])(tile), { min: 4, ideal: 4, weight: 1.4, critical: true, pairSensitive: true }),
    ], { concealed: true, exactness: "high", tags: ["physical", "winds", "year", "concealed"] })
  );

  // 369 section: 6 printed lines.
  lines.push(
    line("369-01-kong-pair", "threeSixNine", "369 line 1", [
      req("369", "3-6-9 groups", isNumber([3, 6, 9]), { min: 9, ideal: 13, weight: 3.0, critical: true, pairSensitive: true }),
    ], { exactness: "medium", tags: ["physical", "369"] }),
    line("369-02-three-suits", "threeSixNine", "369 line 2", [
      req("369", "3-6-9 across suits", isNumber([3, 6, 9]), { min: 9, ideal: 13, weight: 3.0, critical: true, pairSensitive: true }),
    ], { exactness: "medium", tags: ["physical", "369"] }),
    line("369-03-flower-dragon", "threeSixNine", "369 line 3", [
      req("flowers", "flower group", isFlower, { min: 3, ideal: 3, weight: 1.0, critical: true, pairSensitive: true }),
      req("369", "3-6-9 pair/pung shape", isNumber([3, 6, 9]), { min: 4, ideal: 6, weight: 1.8, critical: true, pairSensitive: true }),
      req("dragons", "matching/opposite dragon kong", isAnyDragon, { min: 3, ideal: 4, weight: 1.2, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "369", "flower", "dragon"] }),
    line("369-04-news", "threeSixNine", "369 line 4", [
      req("369", "3-6-9 shape", isNumber([3, 6, 9]), { min: 6, ideal: 9, weight: 2.2, critical: true, pairSensitive: true }),
      req("winds", "NEWS set", isAnyWind, { min: 3, ideal: 4, weight: 1.2, critical: true }),
    ], { exactness: "high", tags: ["physical", "369", "winds"] }),
    line("369-05-flowers-kong-pair", "threeSixNine", "369 line 5", [
      req("flowers", "flower pair", isFlower, { min: 2, ideal: 2, weight: 0.8, critical: true, pairSensitive: true }),
      req("369", "pair 3/6/9 with matching kongs", isNumber([3, 6, 9]), { min: 10, ideal: 11, weight: 3.0, critical: true, pairSensitive: true }),
    ], { exactness: "high", tags: ["physical", "369", "flower"] }),
    line("369-06-concealed-369", "threeSixNine", "369 line 6", [
      req("flowers", "flower pair", isFlower, { min: 2, ideal: 2, weight: 0.8, critical: true, pairSensitive: true }),
      req("369", "3-6-9 concealed structure", isNumber([3, 6, 9]), { min: 10, ideal: 11, weight: 3.0, critical: true, pairSensitive: true }),
    ], { concealed: true, exactness: "high", tags: ["physical", "369", "concealed"] })
  );

  // Singles & Pairs section: 6 printed concealed lines. Jokers are not allowed.
  lines.push(
    line("pairs-01-winds-like-dragon", "pairs", "Singles & Pairs line 1", [
      req("winds", "wind pairs", isAnyWind, { min: 8, ideal: 8, weight: 2.1, critical: true, pairSensitive: true }),
      req("numbers", "like-number pair", tile => tile?.t === "s", { min: 2, ideal: 2, weight: 0.8, critical: true, pairSensitive: true }),
      req("dragons", "matching dragon singles", isAnyDragon, { min: 3, ideal: 3, weight: 0.8, critical: true }),
    ], { concealed: true, allowsJokers: false, exactness: "high", tags: ["physical", "singles-pairs", "winds"] }),
    line("pairs-02-even-pairs", "pairs", "Singles & Pairs line 2", [
      req("evens", "specific even pairs", isNumber([2, 4, 6, 8]), { min: 10, ideal: 13, weight: 3.0, critical: true, pairSensitive: true }),
    ], { concealed: true, allowsJokers: false, exactness: "high", tags: ["physical", "singles-pairs", "2468"] }),
    line("pairs-03-flowers-369", "pairs", "Singles & Pairs line 3", [
      req("flowers", "flower pair", isFlower, { min: 2, ideal: 2, weight: 0.8, critical: true, pairSensitive: true }),
      req("369", "369 pair singles", isNumber([3, 6, 9]), { min: 9, ideal: 11, weight: 2.8, critical: true, pairSensitive: true }),
    ], { concealed: true, allowsJokers: false, exactness: "high", tags: ["physical", "singles-pairs", "369"] }),
    line("pairs-04-long-consecutive", "pairs", "Singles & Pairs line 4", [
      req("consecutive", "seven consecutive pairs", tile => tile?.t === "s", { min: 13, ideal: 13, weight: 3.2, critical: true, pairSensitive: true }),
    ], { concealed: true, allowsJokers: false, exactness: "high", tags: ["physical", "singles-pairs", "consecutive"] }),
    line("pairs-05-odd-pairs", "pairs", "Singles & Pairs line 5", [
      req("odds", "odd singles and pairs", isNumber([1, 3, 5, 7, 9]), { min: 11, ideal: 11, weight: 2.8, critical: true, pairSensitive: true }),
      req("flowers", "flower pair", isFlower, { min: 2, ideal: 2, weight: 0.8, critical: true, pairSensitive: true }),
    ], { concealed: true, allowsJokers: false, exactness: "high", tags: ["physical", "singles-pairs", "13579"] }),
    line("pairs-06-year-pairs", "pairs", "Singles & Pairs line 6", [
      req("flowers", "flower pair", isFlower, { min: 2, ideal: 2, weight: 0.8, critical: true, pairSensitive: true }),
      req("year-core", "2026 singles and pairs", tile => isSoap(tile) || isNumber([2, 6])(tile), { min: 11, ideal: 11, weight: 3.0, critical: true, pairSensitive: true }),
    ], { concealed: true, allowsJokers: false, exactness: "high", tags: ["physical", "singles-pairs", "year"] })
  );

  // Rackle internal single-suit support lanes. These are not an extra physical
  // NMJL section; they help Charleston reads protect a strong one-suit rack.
  for (const suit of SUITS) {
    lines.push(
      line(`suited-${suit}-support`, "suited", `Single suit support ${suit}`, [
        req("suit", "dominant suit", isSuit(suit), { min: 6, ideal: 10, weight: 2.2, critical: true, pairSensitive: true }),
        req("flowers", "flower support", isFlower, { min: 0, ideal: 2, weight: 0.35 }),
        req("jokers", "joker acceleration", isJoker, { min: 0, ideal: 2, weight: 0.45, allowJokers: true }),
      ], { exactness: "low", tags: ["internal", "single-suit"] })
    );
  }

  return lines;
}

export const NMJL_2026_CARD_LINES = Object.freeze(buildCardLines());

function evaluateFamilyMatch(rack = [], family = {}) {
  if (family.type === "like-number") {
    const allowed = new Set(family.numbers || [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const byNumber = new Map();
    rack.filter(tile => tile?.t === "s" && allowed.has(tile.n)).forEach(tile => {
      const group = byNumber.get(tile.n) || [];
      group.push(tile);
      byNumber.set(tile.n, group);
    });
    const best = [...byNumber.values()].sort((a, b) => b.length - a.length)[0] || [];
    return best;
  }

  if (family.type === "same-suit-numbers") {
    const allowed = new Set(family.numbers || [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const bySuit = new Map();
    rack.filter(tile => tile?.t === "s" && allowed.has(tile.n)).forEach(tile => {
      const group = bySuit.get(tile.s) || [];
      group.push(tile);
      bySuit.set(tile.s, group);
    });
    const best = [...bySuit.values()].sort((a, b) => b.length - a.length)[0] || [];
    return best;
  }

  return [];
}

function evaluateRequirement(rack = [], requirement) {
  const matchedTiles = requirement.family ? evaluateFamilyMatch(rack, requirement.family) : rack.filter(requirement.predicate);
  const matchedKeys = requirement.family ? new Set(matchedTiles.map(tileKey)) : matchingKeys(rack, requirement.predicate);
  const count = matchedTiles.length;
  const capped = Math.min(count, requirement.ideal);
  const baseRatio = requirement.ideal > 0 ? capped / requirement.ideal : 1;
  const groupStats = requirement.family ? countGroupStatsForTiles(matchedTiles) : {
    pairs: countNaturalPairs(rack, requirement.predicate),
    triples: countNaturalTriples(rack, requirement.predicate),
  };
  const pairBonus = requirement.pairSensitive ? Math.min(0.22, groupStats.pairs * 0.11) : 0;
  const tripleBonus = requirement.pairSensitive ? Math.min(0.16, groupStats.triples * 0.08) : 0;
  const metMin = count >= requirement.min;
  const criticalMiss = requirement.critical && !metMin;

  return {
    id: requirement.id,
    description: requirement.description,
    count,
    matchedKeys,
    metMin,
    criticalMiss,
    contribution: Math.min(1, baseRatio + pairBonus + tripleBonus) * requirement.weight,
    maxContribution: requirement.weight,
    naturalPairs: groupStats.pairs,
    naturalTriples: groupStats.triples,
  };
}

export function evaluateCardLine(rack = [], lineSpec) {
  const requirementResults = lineSpec.requirements.map(requirement => evaluateRequirement(rack, requirement));
  const maxContribution = requirementResults.reduce((sum, result) => sum + result.maxContribution, 0) || 1;
  const contribution = requirementResults.reduce((sum, result) => sum + result.contribution, 0);
  const criticalMisses = requirementResults.filter(result => result.criticalMiss).length;
  const metRequirements = requirementResults.filter(result => result.metMin).length;
  const freq = freqMap(rack, true);
  const naturalGroups = countNaturalGroups(rack, tile => {
    return requirementResults.some(result => result.matchedKeys.has(tileKey(tile)));
  });
  const jokerCount = freq.j || 0;
  const concealedPenalty = lineSpec.concealed && jokerCount > 0 ? Math.min(35, jokerCount * 18) : 0;
  const jokerDisallowedPenalty = lineSpec.allowsJokers === false && jokerCount > 0 ? Math.min(35, jokerCount * 18) : 0;
  const missingPenalty = criticalMisses * 16;
  const groupBonus = Math.min(10, naturalGroups.pairs * 2 + naturalGroups.triples * 3 + naturalGroups.quads * 4);
  const raw = (contribution / maxContribution) * 100 + groupBonus - missingPenalty - concealedPenalty - jokerDisallowedPenalty;
  const supportKeys = new Set();
  requirementResults.forEach((result, index) => {
    const requirement = lineSpec.requirements[index];
    // Optional helper requirements, especially loose dragons/flowers, should not
    // become hard keep tiles unless they have real duplicate structure. This
    // keeps Charleston passes realistic and prevents optional honors from being
    // overprotected by broad card-line fits.
    const hasNaturalGroup = requirement.pairSensitive && result.naturalPairs > 0;
    const isCoreRequirement = requirement.critical || requirement.min > 0 || hasNaturalGroup;
    if (!isCoreRequirement) return;
    result.matchedKeys.forEach(key => supportKeys.add(key));
  });

  return {
    line: lineSpec,
    lineId: lineSpec.id,
    section: lineSpec.section,
    title: lineSpec.title,
    score: Math.max(0, Math.min(100, Math.round(raw))),
    exactness: lineSpec.exactness,
    concealed: lineSpec.concealed,
    allowsJokers: lineSpec.allowsJokers,
    supportKeys,
    metRequirements,
    totalRequirements: requirementResults.length,
    criticalMisses,
    missing: requirementResults.filter(result => !result.metMin).map(result => result.description),
    tags: lineSpec.tags,
  };
}

export function evaluateCardLinesForRack(rack = [], sectionId = null) {
  const cacheKey = `${sectionId || "all"}::${rackSignature(rack)}`;
  const cached = evaluationCache.get(cacheKey);
  if (cached) return cached;

  const evaluated = NMJL_2026_CARD_LINES
    .filter(lineSpec => !sectionId || lineSpec.section === sectionId)
    .map(lineSpec => evaluateCardLine(rack, lineSpec))
    .sort((a, b) => (b.score - a.score) || (a.criticalMisses - b.criticalMisses) || a.lineId.localeCompare(b.lineId));

  cacheSet(cacheKey, evaluated);
  return evaluated;
}

export function bestCardLineFit(rack = [], sectionId = null) {
  return evaluateCardLinesForRack(rack, sectionId)[0] || null;
}

export function getCardLineKeepWeights(rack = [], sectionId = null, limit = 3) {
  const fits = evaluateCardLinesForRack(rack, sectionId).slice(0, limit);
  const weights = new Map();
  const linesByKey = new Map();

  fits.forEach((fit, index) => {
    const rankFactor = index === 0 ? 1 : index === 1 ? 0.72 : 0.5;
    const fitFactor = Math.max(0.22, fit.score / 100);
    const baseWeight = (fit.exactness === "high" ? 36 : fit.exactness === "medium" ? 28 : 20) * rankFactor * fitFactor;

    fit.supportKeys.forEach(key => {
      const current = weights.get(key) || 0;
      weights.set(key, current + baseWeight);
      const lineNames = linesByKey.get(key) || new Set();
      lineNames.add(fit.title);
      linesByKey.set(key, lineNames);
    });

    if (fit.allowsJokers && fit.score >= 45) {
      weights.set("j", (weights.get("j") || 0) + 18 * rankFactor);
    }
  });

  return {
    weights,
    linesByKey: new Map([...linesByKey.entries()].map(([key, value]) => [key, [...value]])),
    fits,
  };
}

export function summarizeBestCardLine(rack = [], sectionId = null) {
  const fit = bestCardLineFit(rack, sectionId);
  if (!fit) return null;
  return {
    id: fit.lineId,
    section: fit.section,
    title: fit.title,
    score: fit.score,
    exactness: fit.exactness,
    missing: fit.missing.slice(0, 3),
    concealed: fit.concealed,
    allowsJokers: fit.allowsJokers,
  };
}

export function validateCardLineDatabase() {
  const sectionCounts = CARD_SECTION_IDS.reduce((acc, section) => {
    acc[section] = NMJL_2026_CARD_LINES.filter(lineSpec => lineSpec.section === section).length;
    return acc;
  }, {});
  const missingSections = Object.entries(sectionCounts).filter(([, count]) => count === 0).map(([section]) => section);
  const duplicateIds = NMJL_2026_CARD_LINES
    .map(lineSpec => lineSpec.id)
    .filter((id, index, ids) => ids.indexOf(id) !== index);

  const physicalLines = NMJL_2026_CARD_LINES.filter(lineSpec => lineSpec.tags?.includes("physical")).length;
  const internalSupportLines = NMJL_2026_CARD_LINES.filter(lineSpec => lineSpec.tags?.includes("internal")).length;

  return {
    ok: missingSections.length === 0 && duplicateIds.length === 0,
    totalLines: NMJL_2026_CARD_LINES.length,
    physicalLines,
    internalSupportLines,
    sectionCounts,
    missingSections,
    duplicateIds,
  };
}
