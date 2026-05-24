/* global process */
// Rackle 2026 card-line database validation.
// Internal only. Run with:
//   npm run validate:card-lines

import {
  CARD_SECTION_IDS,
  NMJL_2026_CARD_LINES,
  bestCardLineFit,
  validateCardLineDatabase,
} from "./nmjl-2026-card-lines.js";

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

const EXPECTED_SECTION_COUNTS = {
  "2026": 4,
  evens: 8,
  like: 3,
  quints: 3,
  consec: 8,
  odds: 8,
  wd: 8,
  threeSixNine: 6,
  pairs: 6,
  suited: 3,
};

const scenarios = [
  {
    title: "2026 exact year core protects Soap, 2s, and 6s",
    section: "2026",
    rack: [t.b(2), t.b(2), t.b(2), t.soap(), t.soap(), t.soap(), t.c(2), t.c(2), t.c(2), t.b(6), t.b(6), t.b(6), t.b(6)],
    minScore: 92,
    expectedLinePrefix: "2026-01",
  },
  {
    title: "2026 near line with missing Soap is still capped",
    section: "2026",
    rack: [t.f(), t.f(), t.b(2), t.c(2), t.d(2), t.b(6), t.c(6), t.d(6), t.b(2), t.c(6), t.b(4), t.c(8), t.w("E")],
    maxScore: 74,
    expectedLinePrefix: "2026-",
  },
  {
    title: "2468 exact even shape fits the evens section",
    section: "evens",
    rack: [t.b(2), t.b(2), t.b(2), t.b(4), t.b(4), t.b(4), t.b(6), t.b(6), t.b(6), t.b(6), t.b(8), t.b(8), t.b(8)],
    minScore: 82,
    expectedLinePrefix: "evens-",
  },
  {
    title: "2468 dragon line protects dragons with even kongs",
    section: "evens",
    rack: [t.b(2), t.b(2), t.b(2), t.b(2), t.dragon("Red"), t.dragon("Red"), t.dragon("Red"), t.c(8), t.c(8), t.c(8), t.c(8), t.dragon("Green"), t.dragon("Green")],
    minScore: 78,
    expectedLinePrefix: "evens-04",
  },
  {
    title: "Like Numbers exact flower lane fits Like Numbers",
    section: "like",
    rack: [t.b(1), t.b(1), t.b(1), t.b(1), t.f(), t.f(), t.f(), t.f(), t.f(), t.c(1), t.c(1), t.c(1), t.c(1)],
    minScore: 88,
    expectedLinePrefix: "like-01",
  },
  {
    title: "Like Numbers with dragons favors matching number groups",
    section: "like",
    rack: [t.b(4), t.b(4), t.b(4), t.b(4), t.dragon("Red"), t.c(4), t.c(4), t.c(4), t.c(4), t.dragon("Red"), t.d(4), t.d(4), t.dragon("Red")],
    minScore: 80,
    expectedLinePrefix: "like-02",
  },
  {
    title: "Quints needs Joker fuel and natural anchor",
    section: "quints",
    rack: [t.b(5), t.b(5), t.b(5), t.b(5), t.j(), t.j(), t.c(5), t.c(5), t.c(5), t.j(), t.d(5), t.d(5), t.d(5)],
    minScore: 72,
    expectedLinePrefix: "quints-",
  },
  {
    title: "Quints without Joker fuel does not look ready",
    section: "quints",
    rack: [t.b(5), t.b(5), t.b(5), t.c(5), t.c(5), t.c(5), t.d(5), t.d(5), t.b(2), t.c(3), t.d(4), t.w("E"), t.f()],
    maxScore: 68,
    expectedLinePrefix: "quints-",
  },
  {
    title: "Consecutive Run exact long run fits consecutive section",
    section: "consec",
    rack: [t.b(1), t.b(1), t.b(2), t.b(2), t.b(2), t.b(3), t.b(3), t.b(4), t.b(4), t.b(4), t.b(5), t.b(5), t.b(5)],
    minScore: 82,
    expectedLinePrefix: "consec-",
  },
  {
    title: "Consecutive dragon-middle line protects matching dragons",
    section: "consec",
    rack: [t.f(), t.f(), t.b(1), t.b(1), t.b(2), t.b(2), t.b(3), t.b(3), t.b(3), t.dragon("Red"), t.dragon("Red"), t.dragon("Red"), t.dragon("Red")],
    minScore: 76,
    expectedLinePrefix: "consec-05",
  },
  {
    title: "13579 exact odd shape fits odd section",
    section: "odds",
    rack: [t.b(1), t.b(1), t.b(3), t.b(3), t.b(3), t.b(5), t.b(5), t.b(7), t.b(7), t.b(7), t.b(9), t.b(9), t.b(9)],
    minScore: 82,
    expectedLinePrefix: "odds-",
  },
  {
    title: "13579 concealed dragon lane recognizes flower and dragon support",
    section: "odds",
    rack: [t.f(), t.f(), t.b(1), t.b(3), t.b(5), t.b(7), t.b(7), t.b(7), t.b(9), t.b(9), t.dragon("Red"), t.dragon("Red"), t.dragon("Red")],
    minScore: 74,
    expectedLinePrefix: "odds-08",
  },
  {
    title: "True wind-heavy rack fits Winds and Dragons wind line",
    section: "wd",
    rack: [t.w("N"), t.w("N"), t.w("N"), t.w("N"), t.w("E"), t.w("E"), t.w("E"), t.w("W"), t.w("W"), t.w("W"), t.w("W"), t.w("S"), t.w("S")],
    minScore: 84,
    expectedLinePrefix: "wd-01",
  },
  {
    title: "Winds and Dragons year line protects Soap as zero",
    section: "wd",
    rack: [t.w("N"), t.w("N"), t.w("E"), t.w("E"), t.w("E"), t.w("W"), t.w("W"), t.w("W"), t.w("W"), t.w("S"), t.w("S"), t.soap(), t.b(2)],
    minScore: 70,
    expectedLinePrefix: "wd-",
  },
  {
    title: "369 exact shape fits 3-6-9 section",
    section: "threeSixNine",
    rack: [t.b(3), t.b(3), t.b(3), t.b(6), t.b(6), t.b(6), t.b(6), t.b(9), t.b(9), t.b(9), t.b(9), t.c(3), t.c(3)],
    minScore: 82,
    expectedLinePrefix: "369-",
  },
  {
    title: "369 with flowers and dragon support fits flower-dragon line",
    section: "threeSixNine",
    rack: [t.f(), t.f(), t.f(), t.b(3), t.b(3), t.b(6), t.b(6), t.b(6), t.b(9), t.b(9), t.dragon("Red"), t.dragon("Red"), t.dragon("Red")],
    minScore: 74,
    expectedLinePrefix: "369-03",
  },
  {
    title: "Singles and Pairs exact concealed even pairs fit pair section",
    section: "pairs",
    rack: [t.b(2), t.b(2), t.b(4), t.b(4), t.b(6), t.b(6), t.b(8), t.b(8), t.c(2), t.c(2), t.c(4), t.c(4), t.c(8)],
    minScore: 80,
    expectedLinePrefix: "pairs-02",
  },
  {
    title: "Singles and Pairs with Joker is penalized",
    section: "pairs",
    rack: [t.b(2), t.b(2), t.b(4), t.b(4), t.b(6), t.b(6), t.b(8), t.b(8), t.c(2), t.c(2), t.c(4), t.c(4), t.j()],
    maxScore: 86,
    expectedLinePrefix: "pairs-",
  },
];

function run() {
  const db = validateCardLineDatabase();
  const countFailures = CARD_SECTION_IDS
    .filter(section => db.sectionCounts[section] !== EXPECTED_SECTION_COUNTS[section])
    .map(section => ({ section, expected: EXPECTED_SECTION_COUNTS[section], actual: db.sectionCounts[section] }));

  const results = scenarios.map(scenario => {
    const fit = bestCardLineFit(scenario.rack, scenario.section);
    const aboveMin = scenario.minScore == null || (fit?.score ?? 0) >= scenario.minScore;
    const belowMax = scenario.maxScore == null || (fit?.score ?? 0) <= scenario.maxScore;
    const prefixOk = Boolean(fit && fit.lineId.startsWith(scenario.expectedLinePrefix));
    const passed = Boolean(fit && aboveMin && belowMax && prefixOk);
    return {
      title: scenario.title,
      passed,
      section: scenario.section,
      bestLine: fit?.lineId || "none",
      score: fit?.score ?? 0,
      minScore: scenario.minScore ?? "-",
      maxScore: scenario.maxScore ?? "-",
    };
  });

  const failed = results.filter(result => !result.passed);
  const sectionCounts = CARD_SECTION_IDS.map(section => `${section}: ${db.sectionCounts[section]}`).join(" | ");

  console.log("Card-Line Database QA");
  console.log(`Total card-line specs: ${db.totalLines}`);
  console.log(`Physical card specs: ${db.physicalLines}`);
  console.log(`Internal support specs: ${db.internalSupportLines}`);
  console.log(`Section coverage: ${sectionCounts}`);
  console.log(`Scenario tests: ${results.length}`);
  console.log(`Passed: ${results.length - failed.length}`);
  console.log(`Failed: ${failed.length}`);

  if (countFailures.length) {
    console.log("\nSection count mismatches:");
    console.table(countFailures);
  }

  if (failed.length) {
    console.log("\nFailed scenarios:");
    console.table(failed);
  }

  const ok = db.ok && countFailures.length === 0 && failed.length === 0 && NMJL_2026_CARD_LINES.length === 57;
  console.log(`\nCard-Line Database QA: ${ok ? "PASSED" : "FAILED"}`);

  if (!ok) process.exit(1);
}

run();
