// ─── Rackle v2 · Game screen ──────────────────────────────────────────────────
// Charleston flow: intro → select → reveal → continue →
//   [blind notice before left pass] → [second Charleston prompt] →
//   [courtesy pass] → section → scoring

import { useState, useEffect, useRef, useCallback } from "react";
import PremiumMahjongTile from "../shared/PremiumMahjongTile.jsx";
import RackleState from "../shared/RackleState.jsx";
import {
  dealDailyRack, dealPracticeRack, getIncomingTiles, calculateIQ,
} from "../../engine/game.js";
import {
  getDailySeed, getDayNum, getProfile, getClubCode, getPlayerId, getLeaderboardDisplayName,
  saveDailyResult, addHistory, getStreak, setStreak, ST, ensureAuthenticatedPlayerId,
} from "../../engine/storage.js";
import { postScore, migrateDailyLeaderboardIdentity } from "../../engine/leaderboard.js";
import { HANDS_2026 } from "./HandBrowser.jsx";
import { trackRackleEvent, getScoreBand, getClubState } from "../../engine/analytics.js";

// ── Pass templates — used for both Charlestons ────────────────────────────────
const PASS_TEMPLATES = [
  { label: "Pass Right", dir: "right", icon: "→", copy: "Your opening read.",    sub: "Find your strongest tiles and commit to a direction." },
  { label: "Pass Across", dir: "across", icon: "↔", copy: "The table is shaping.", sub: "Protect what's working. Cut what isn't." },
  { label: "Pass Left",  dir: "left",   icon: "←", copy: "Final pass.",           sub: "Lock in your read. This is the one that matters." },
];

// ── Section options ───────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "consec", label: "Consecutive Run", sub: "Runs and connected shape" },
  { id: "evens", label: "2-4-6-8",          sub: "Even number hands" },
  { id: "odds",  label: "1-3-5-7-9",        sub: "Odd number hands" },
  { id: "threeSixNine", label: "3-6-9",     sub: "3s, 6s, and 9s" },
  { id: "like",  label: "Like Numbers",     sub: "Same-number pressure" },
  { id: "wd",    label: "Winds & Dragons",  sub: "Honor tile hands" },
  { id: "quints", label: "Quints",          sub: "Five-of-a-kind builds" },
  { id: "pairs", label: "Singles & Pairs",  sub: "Exact tile patterns" },
  { id: "suited", label: "Single Suit",     sub: "Suit-based structure" },
  { id: "2026", label: "2026",              sub: "Year section" },
  { id: "other", label: "Other / Unsure",   sub: "Still reading the rack" },
];

const SECTION_LABELS = {
  "2026": "2026",
  evens: "2-4-6-8",
  like: "Any Like Numbers",
  quints: "Quints",
  consec: "Consecutive Run",
  odds: "1-3-5-7-9",
  wd: "Winds & Dragons",
  threeSixNine: "3-6-9",
  pairs: "Singles & Pairs",
  suited: "Single Suit",
  other: "Other / Unsure",
};

const REFERENCE_GUIDANCE = {
  "2026": {
    hold: "2s, 6s, Soaps, flowers, and any pairs that point toward the year pattern.",
    pass: "Loose terminals, isolated winds, and suit tiles that do not support 2/6 structure.",
    strategy: "Build around the hard-to-pair tiles first. Treat Soap as your zero anchor and avoid chasing too many suits at once.",
  },
  consec: {
    hold: "Runs of 3+ connected numbers, duplicate middle tiles, and jokers that can support pungs or kongs.",
    pass: "Isolated honors, far-apart numbers, and single tiles that break the run.",
    strategy: "Protect the middle of the run. A 3-4-5 shape usually has more ways to improve than an edge-only shape.",
  },
  evens: {
    hold: "2s, 4s, 6s, 8s, duplicate evens, and jokers if the pattern allows them.",
    pass: "Odd singles, loose winds, and dragons that do not support the section.",
    strategy: "Watch suit density. Evens get stronger when your duplicates concentrate in one or two suits.",
  },
  odds: {
    hold: "1s, 3s, 5s, 7s, 9s, duplicate odds, and jokers when the hand is not singles/pairs.",
    pass: "Even-number singles, loose honors, and low-value tiles outside your strongest odd suit.",
    strategy: "Do not keep every odd tile forever. Find the suit or number cluster that is actually forming.",
  },
  threeSixNine: {
    hold: "3s, 6s, 9s, duplicate 3-6-9 tiles, and jokers for exposed group hands.",
    pass: "1s, 2s, 4s, 5s, 7s, 8s unless they connect to a clear alternative path.",
    strategy: "This section rewards discipline. Keep the 3-6-9 core clean and avoid drifting into generic odds.",
  },
  like: {
    hold: "Same-number tiles across suits, duplicates, and jokers when building pungs, kongs, or quints.",
    pass: "Numbers that do not match your strongest like-number cluster.",
    strategy: "Count the same number across all suits before committing. A weak pair in three suits can beat a pretty mixed rack.",
  },
  quints: {
    hold: "Pairs, triples, same-number clusters, flowers where relevant, and jokers.",
    pass: "Singletons with no duplicate support and tiles that cannot become a five-tile group.",
    strategy: "Quints usually need joker help. Protect natural pairs and do not burn jokers on low-probability shapes too early.",
  },
  wd: {
    hold: "Winds, dragons, matching dragon colors, and duplicates that can become pungs or kongs.",
    pass: "Loose suit tiles unless your rack has a clear mixed honor-number path.",
    strategy: "Honor hands need density. One wind is noise. Two or three matching honors can become a real direction.",
  },
  suited: {
    hold: "Your densest suit, strong same-suit duplicates, flowers where useful, and jokers.",
    pass: "Off-suit singles, stray honors, and low-density suit tiles that split your rack.",
    strategy: "Single Suit hands reward commitment. Once one suit clearly leads, cut the others quickly and keep the rack clean.",
  },
  pairs: {
    hold: "Natural pairs, unique required singles, flowers, and tiles that are hard to replace.",
    pass: "Jokers, loose duplicates that do not fit, and tiles outside the exact pair/single pattern.",
    strategy: "Singles and pairs are precision hands. Since jokers usually cannot help, protect exact tiles and avoid over-passing pairs.",
  },
};

function getReferenceGuidance(section, hand) {
  const base = REFERENCE_GUIDANCE[section] || {
    hold: "Tiles that match the section pattern, natural pairs, and flexible duplicates.",
    pass: "Loose singletons, unsupported honors, and tiles outside your clearest path.",
    strategy: "Use the card as a map. Find the hand shape first, then decide which tiles have no job.",
  };

  return {
    ...base,
    strategy: hand?.hint || base.strategy,
  };
}

// ── Phases ────────────────────────────────────────────────────────────────────
const PH = {
  PREGAME:        "pregame",
  INTRO:          "intro",
  SELECT:         "select",
  REVEAL:         "reveal",
  CONTINUE:       "continue",
  BLIND_NOTICE:   "blind_notice",   // shown before left pass of 1st Charleston
  SECOND_PROMPT:  "second_prompt",  // shown after 1st Charleston finishes
  COURTESY:       "courtesy",       // 1-3 tile exchange before scoring
  SECTION:        "section",
  SCORING:        "scoring",
};

// ── Sort helpers (module-level so they don't re-create on each render) ────────
const SUIT_ORDER   = { bam: 0, crak: 1, dot: 2 };
const TYPE_ORDER   = { s: 0, w: 1, d: 2, f: 3, j: 4 };
const WIND_ORDER   = { E: 0, S: 1, W: 2, N: 3 };
const DRAGON_ORDER = { Red: 0, Grn: 1, Soap: 2 };


function createInitialRack(mode, seed) {
  try {
    const rack = mode === "daily" ? dealDailyRack(seed) : dealPracticeRack();
    if (!Array.isArray(rack) || rack.length !== 13) {
      throw new Error(`${mode} rack returned ${Array.isArray(rack) ? rack.length : "no"} tiles`);
    }
    return { rack, error: null };
  } catch (error) {
    if (import.meta.env?.DEV) console.warn("Rackle rack load failed", error);
    return { rack: [], error };
  }
}

function sortTiles(tiles) {
  return [...tiles].sort((a, b) => {
    const ta = TYPE_ORDER[a.t] ?? 99;
    const tb = TYPE_ORDER[b.t] ?? 99;
    if (ta !== tb) return ta - tb;
    if (a.t === "s") {
      const sa = SUIT_ORDER[a.s] ?? 99;
      const sb = SUIT_ORDER[b.s] ?? 99;
      if (sa !== sb) return sa - sb;
      return (a.n || 0) - (b.n || 0);
    }
    if (a.t === "w") return (WIND_ORDER[a.v] ?? 99) - (WIND_ORDER[b.v] ?? 99);
    if (a.t === "d") return (DRAGON_ORDER[a.v] ?? 99) - (DRAGON_ORDER[b.v] ?? 99);
    return 0;
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Game({ mode = "daily", setScreen }) {
  const seed     = getDailySeed();
  const dayNum   = getDayNum();
  const profile  = getProfile();
  const clubCode = getClubCode();

  const [initialRackState] = useState(() => createInitialRack(mode, seed));

  // ── Core state ──────────────────────────────────────────────────────────────
  const [rack,            setRack]           = useState(() => initialRackState.rack);
  const [rackLoadError,   setRackLoadError]  = useState(() => initialRackState.error);
  const [selected,        setSelected]       = useState(new Set()); // rack indices
  const [passIndex,       setPassIndex]      = useState(0);          // 0-2 within current Charleston
  const [charleston,      setCharleston]     = useState(1);          // 1 or 2
  const [passLog,         setPassLog]        = useState([]);
  const [phase,           setPhase]          = useState(() => {
    if (mode !== "daily") return PH.INTRO;
    try {
      const hasCompleted = localStorage.getItem("rackleHasCompletedFirstDaily") === "true";
      const hasSeenIntro = localStorage.getItem("rackleHasSeenIntro") === "true";
      return !hasCompleted && !hasSeenIntro ? PH.PREGAME : PH.INTRO;
    } catch {
      return PH.INTRO;
    }
  });
  const [lastPassed,      setLastPassed]     = useState([]);
  const [lastReceived,    setLastReceived]   = useState([]);
  const [jokerShake,      setJokerShake]     = useState(null);
  const [jokerTip,        setJokerTip]       = useState(null);
  const [chosenSection,   setChosenSection]  = useState(null);
  const [showReference,   setShowReference]  = useState(false);
  const [referenceFilter, setReferenceFilter]= useState("2026");
  const notesKey = `game-notes-${mode}-${seed}`;
  const [notes,           setNotes]          = useState(() => ST.get(notesKey, ""));
  const [notesSaved,      setNotesSaved]     = useState(false);

  // Courtesy pass state
  const [courtesySelected, setCourtesySelected] = useState(new Set());
  const [courtesyGiven,    setCourtesyGiven]    = useState([]);
  const [courtesyReceived, setCourtesyReceived] = useState([]);
  const [courtesyDone,     setCourtesyDone]     = useState(false);

  const startingRack = useRef(null);
  const passStart    = useRef(Date.now());
  const totalStart   = useRef(Date.now());

  useEffect(() => {
    trackRackleEvent(mode === "practice" ? "practice_started" : "daily_started", {
      mode,
      source: "game",
      hasClub: Boolean(clubCode),
      isGuest: !profile?.email,
      clubState: getClubState({ hasClub: Boolean(clubCode) }),
    });
  }, [mode, clubCode, profile?.email]);

  // Capture starting rack once
  useEffect(() => {
    if (!startingRack.current) startingRack.current = [...rack];
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      ST.set(notesKey, notes);
      if (notes.trim()) {
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 1200);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [notes, notesKey]);

  // Auto-advance intro
  useEffect(() => {
    if (phase !== PH.INTRO) return;
    const id = setTimeout(() => setPhase(PH.SELECT), 1400);
    return () => clearTimeout(id);
  }, [phase]);

  // Reset pass timer on each SELECT
  useEffect(() => {
    if (phase === PH.SELECT) passStart.current = Date.now();
  }, [phase]);

  // ── Current pass template ───────────────────────────────────────────────────
  const pass = PASS_TEMPLATES[passIndex];

  // For progress dots — within current Charleston
  const totalPassesDone = (charleston - 1) * 3 + passIndex;
  const totalPasses     = 3; // dots show current Charleston only

  // ── Tile selection ──────────────────────────────────────────────────────────
  const toggleTile = useCallback((i) => {
    if (phase !== PH.SELECT) return;
    const tile = rack[i];
    if (tile?.t === "j") {
      setJokerShake(i);
      setJokerTip(i);
      setTimeout(() => setJokerShake(null), 500);
      setTimeout(() => setJokerTip(null), 2200);
      return;
    }
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(i)) { next.delete(i); }
      else if (next.size < 3) { next.add(i); }
      return next;
    });
  }, [phase, rack]);

  // ── Sort rack ────────────────────────────────────────────────────────────────
  function sortRack() {
    setRack(prev => sortTiles(prev));
    setSelected(new Set());
  }

  // ── Confirm pass ────────────────────────────────────────────────────────────
  const confirmPass = useCallback(async () => {
    if (selected.size !== 3 || phase !== PH.SELECT) return;

    const secs     = Math.round((Date.now() - passStart.current) / 1000);
    const outTiles = rack.filter((_, i) => selected.has(i));

    // For second Charleston, offset the seed so tiles differ
    const inSeed   = charleston === 2 ? seed + 10000 : seed;
    const rackAfterOutgoing = rack.filter((_, i) => !selected.has(i));
    const inTiles  = mode === "daily"
      ? getIncomingTiles(inSeed, passIndex + 1, rackAfterOutgoing)
      : getIncomingTiles(inSeed + (passIndex + 1) * 997, passIndex + 1, rackAfterOutgoing);

    setLastPassed(outTiles);
    setLastReceived(inTiles);
    setPhase(PH.REVEAL);

    await delay(700);

    const newRack   = rack.filter((_, i) => !selected.has(i)).concat(inTiles);
    const logEntry  = {
      label:      `${charleston === 2 ? "2nd · " : ""}${pass.label}`,
      dir:        pass.dir,
      charleston,
      out:        outTiles,
      in:         inTiles,
      secs,
    };

    setPassLog(prev => [...prev, logEntry]);
    setRack(newRack);
    setSelected(new Set());
    setPhase(PH.CONTINUE);
  }, [selected, rack, passLog, passIndex, phase, seed, mode, charleston, pass]);

  // ── After Continue CTA ───────────────────────────────────────────────────────
  function handleContinue() {
    const isLastPass = passIndex === 2;

    if (!isLastPass) {
      // Middle of a Charleston
      if (charleston === 1 && passIndex === 1) {
        // After Across → show blind pass notice before Left
        setPassIndex(2);
        setPhase(PH.BLIND_NOTICE);
      } else {
        setPassIndex(p => p + 1);
        setPhase(PH.SELECT);
      }
    } else {
      // Finished a full Charleston
      if (charleston === 1) {
        setPhase(PH.SECOND_PROMPT);
      } else {
        // Second Charleston done → courtesy pass
        setPhase(PH.COURTESY);
      }
    }
  }

  // ── Blind pass handlers ──────────────────────────────────────────────────────
  function handleBlindPass() {
    // Pre-select the 3 incoming tiles (they're the last 3 in the rack after concat)
    const rackLen = rack.length;
    setSelected(new Set([rackLen - 3, rackLen - 2, rackLen - 1]));
    setPhase(PH.SELECT);
  }
  function handleChooseMyself() {
    setPhase(PH.SELECT);
  }

  // ── Second Charleston handlers ───────────────────────────────────────────────
  function handleSecondCharleston() {
    setCharleston(2);
    setPassIndex(0);
    setSelected(new Set());
    setPhase(PH.SELECT);
  }
  function handleSkipToCourtesy() {
    setPhase(PH.COURTESY);
  }
  function handleSkipToSection() {
    setPhase(PH.SECTION);
  }

  // ── Courtesy pass ────────────────────────────────────────────────────────────
  function toggleCourtesy(i) {
    if (rack[i]?.t === "j") return; // jokers can't be passed in courtesy either
    setCourtesySelected(prev => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else if (next.size < 3) {
        next.add(i);
      }
      return next;
    });
  }

  function confirmCourtesy() {
    if (courtesySelected.size === 0) {
      // Skip courtesy — go straight to section
      setPhase(PH.SECTION);
      return;
    }

    const given    = rack.filter((_, i) => courtesySelected.has(i));
    const inSeed   = seed + 20000;
    // Get same count back as given
    const rackAfterOutgoing = rack.filter((_, i) => !courtesySelected.has(i));
    const inTiles  = getIncomingTiles(inSeed, 1, rackAfterOutgoing).slice(0, given.length);
    const newRack  = rackAfterOutgoing.concat(inTiles);

    setCourtesyGiven(given);
    setCourtesyReceived(inTiles);
    setRack(newRack);
    setCourtesyDone(true);

    // Log the courtesy exchange
    setPassLog(prev => [...prev, {
      label:      "Courtesy Pass",
      dir:        "courtesy",
      charleston: 0,
      out:        given,
      in:         inTiles,
      secs:       0,
    }]);
  }

  function handleCourtesyContinue() {
    setPhase(PH.SECTION);
  }

  // ── Section confirmed → score ────────────────────────────────────────────────
  async function handleSectionConfirm() {
    if (!chosenSection) return;
    setPhase(PH.SCORING);
    await delay(800);

    const totalSecs = Math.round((Date.now() - totalStart.current) / 1000);
    const iq        = calculateIQ(startingRack.current, passLog, rack, chosenSection);
    const result    = {
      ...iq,
      mode,
      daySeed:      seed,
      day_seed:     seed,
      dayNum,
      iqScore:      iq.totalScore,
      time:         totalSecs,
      startingRack: startingRack.current,
      finalRack:    rack,
      passLog,
      chosenSection,
      didSecond:    charleston === 2,
      didCourtesy:  courtesyDone,
      playerNotes:  notes.trim(),
      ts:           Date.now(),
      completedDate: new Date().toISOString().slice(0, 10),
    };

    ST.remove(notesKey);

    trackRackleEvent(mode === "practice" ? "practice_completed" : "daily_completed", {
      mode,
      source: "game",
      scoreBand: getScoreBand(iq.totalScore),
      hasClub: Boolean(clubCode),
      isGuest: !profile?.email,
      clubState: getClubState({ hasClub: Boolean(clubCode) }),
    });

    if (mode === "daily") {
      saveDailyResult(result);
      try { localStorage.setItem("rackleHasCompletedFirstDaily", "true"); } catch {}
      setStreak(getStreak() + 1);
      const identity = ensureAuthenticatedPlayerId();
      const latestProfile = identity.profile || getProfile() || profile;
      const pid = identity.playerId || getPlayerId();
      const playerName = getLeaderboardDisplayName(latestProfile);
      const postPayload = {
        playerId: pid,
        name: playerName,
        iqScore: iq.totalScore,
        timeSecs: totalSecs,
        clubCode: latestProfile?.clubCode || latestProfile?.club_code || clubCode,
        seed,
        profile: latestProfile,
      };

      if (identity.previousGuestId) {
        await migrateDailyLeaderboardIdentity({
          fromPlayerId: identity.previousGuestId,
          toPlayerId: pid,
          ...postPayload,
        }).catch(() => postScore(postPayload).catch(() => false));
      } else {
        await postScore(postPayload).catch(() => false);
      }
    }

    addHistory(result);
    setScreen("scorecard", { result, mode });
  }

  function resetLoadedRack() {
    const next = createInitialRack(mode, seed);
    setRack(next.rack);
    setRackLoadError(next.error);
    if (!next.error) {
      startingRack.current = next.rack;
      setSelected(new Set());
      setPassIndex(0);
      setCharleston(1);
      setPassLog([]);
      setLastPassed([]);
      setLastReceived([]);
      setCourtesySelected(new Set());
      setCourtesyGiven([]);
      setCourtesyReceived([]);
      setCourtesyDone(false);
      setPhase(mode === "daily" ? PH.INTRO : PH.INTRO);
      passStart.current = Date.now();
      totalStart.current = Date.now();
    }
  }

  // ── Derived ─────────────────────────────────────────────────────────────────
  const isReady    = selected.size === 3;
  const needMore   = 3 - selected.size;
  const selectedArr = rack
    .map((t, i) => ({ t, i }))
    .filter(({ i }) => selected.has(i));
  const selectionGuide = selected.size === 0
    ? "Choose 3 tiles to pass."
    : selected.size === 1
      ? "2 more to pass."
      : selected.size === 2
        ? "1 more to pass."
        : "Pass selected tiles.";

  const referenceSections = HANDS_2026.filter(sec =>
    referenceFilter === "all" ? true : sec.section === referenceFilter
  );

  // ════════════════════════════════════════════════════════════════════════════
  // ── RENDER ──────────────────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════

  if (rackLoadError) {
    const isPractice = mode === "practice";
    return (
      <div className="rk-game-screen">
        <RackleState
          eyebrow={isPractice ? "Practice Room" : "Daily Rackle"}
          title={isPractice ? "Practice room needs a reset." : "The room is still setting up."}
          body={isPractice ? "Start a fresh rack and try again." : "Try opening today’s Rackle again."}
          primaryLabel={isPractice ? "New practice rack" : "Reload Rackle"}
          onPrimary={resetLoadedRack}
          secondaryLabel="Back home"
          onSecondary={() => setScreen?.("home")}
        />
      </div>
    );
  }

  // ── FIRST-TIME PRE-GAME ─────────────────────────────────────────────────────
  if (phase === PH.PREGAME) {
    return (
      <div className="rk-game-screen rk-game-screen--pregame">
        <div className="rk-game-pregame-card">
          <div className="rk-game-pregame-card__pill">Rackle #{dayNum}</div>
          <h1>Today’s table is open.</h1>
          <p>
            You’ll make three Charleston passes. Protect structure, cut dead weight, and see how your read compares.
          </p>
          <div className="rk-game-pregame-card__rule">
            <span aria-hidden="true">🀄</span>
            <b>Jokers stay protected and cannot be passed.</b>
          </div>
          <button
            className="rk-btn rk-btn--primary rk-btn--full rk-btn--play"
            type="button"
            onClick={() => {
              try { localStorage.setItem("rackleHasSeenIntro", "true"); } catch {}
              setPhase(PH.INTRO);
            }}
          >
            <span className="rk-btn__dot" />
            Start the Charleston
          </button>
        </div>
      </div>
    );
  }

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === PH.INTRO) {
    return (
      <div className="rk-game-screen rk-game-screen--intro">
        <div className="rk-game-intro">
          <div className="rk-game-intro__pill">
            {mode === "daily" ? `Rackle #${dayNum}` : "Practice"}
          </div>
          <div className="rk-game-intro__rack">
            {rack.map((tile, i) => (
              <div key={i} className="rk-game-intro__tile" style={{ animationDelay: `${i * 55}ms` }}>
                <PremiumMahjongTile tile={tile} size="md" />
              </div>
            ))}
          </div>
          <p className="rk-game-intro__label">The Charleston begins.</p>
        </div>
      </div>
    );
  }

  // ── BLIND NOTICE ────────────────────────────────────────────────────────────
  if (phase === PH.BLIND_NOTICE) {
    return (
      <div className="rk-game-screen">
        <div className="rk-game-notice">
          <div className="rk-game-notice__icon">👁</div>
          <h2 className="rk-game-notice__title">Blind pass available</h2>
          <p className="rk-game-notice__body">
            You can pass the tiles you just received from Across directly to the left
            without incorporating them into your strategy — a blind pass.
          </p>
          <div className="rk-game-notice__tiles">
            <p className="rk-game-notice__tiles-label">You received from Across</p>
            <div className="rk-game-notice__tiles-row">
              {lastReceived.map((tile, i) => (
                <PremiumMahjongTile key={i} tile={tile} size="md" />
              ))}
            </div>
          </div>
          <div className="rk-game-notice__actions">
            <button
              className="rk-btn rk-btn--primary rk-btn--full"
              onClick={handleBlindPass}
            >
              Pass blind — send these left →
            </button>
            <button
              className="rk-btn rk-btn--ghost"
              onClick={handleChooseMyself}
            >
              Choose my own 3 tiles
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── SECOND CHARLESTON PROMPT ─────────────────────────────────────────────────
  if (phase === PH.SECOND_PROMPT) {
    return (
      <div className="rk-game-screen">
        <div className="rk-game-notice">
          <div className="rk-game-notice__icon">↔</div>
          <h2 className="rk-game-notice__title">First Charleston complete</h2>
          <p className="rk-game-notice__body">
            You can continue with a second Charleston (Right → Across → Left again),
            skip straight to the Courtesy Pass, or stop here and score your rack.
          </p>
          <div className="rk-game-notice__tiles">
            <p className="rk-game-notice__tiles-label">Your rack after Charleston 1</p>
            <div className="rk-game-notice__tiles-row rk-game-notice__tiles-row--wrap">
              {rack.map((tile, i) => (
                <PremiumMahjongTile key={i} tile={tile} size="sm" />
              ))}
            </div>
          </div>
          <div className="rk-game-notice__actions">
            <button
              className="rk-btn rk-btn--primary rk-btn--full"
              onClick={handleSecondCharleston}
            >
              Second Charleston →
            </button>
            <button
              className="rk-btn rk-btn--secondary rk-btn--full"
              onClick={handleSkipToCourtesy}
            >
              Courtesy pass only
            </button>
            <button
              className="rk-btn rk-btn--ghost"
              onClick={handleSkipToSection}
            >
              Done — score my rack
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── COURTESY PASS ───────────────────────────────────────────────────────────
  if (phase === PH.COURTESY) {
    return (
      <div className="rk-game-screen">
        <div className="rk-game-notice">
          <div className="rk-game-notice__icon">🤝</div>
          <h2 className="rk-game-notice__title">Courtesy pass</h2>
          {!courtesyDone ? (
            <>
              <p className="rk-game-notice__body">
                Exchange up to 3 tiles with any willing player. Select the tiles
                you want to give — you'll receive the same count back.
              </p>
              <div className="rk-game-notice__rack-label">Your rack · select 1–3 tiles to swap</div>
              <div className="rk-game-courtesy-rack">
                {rack.map((tile, i) => {
                  const isSel   = courtesySelected.has(i);
                  const isJoker = tile.t === "j";
                  return (
                    <button
                      key={i}
                      className={[
                        "rk-game-tile-btn",
                        isSel   ? "rk-game-tile-btn--selected" : "",
                        isJoker ? "rk-game-tile-btn--joker"    : "",
                      ].join(" ")}
                      onClick={() => toggleCourtesy(i)}
                      disabled={isJoker}
                    >
                      <PremiumMahjongTile tile={tile} size="sm" selected={isSel} locked={isJoker} />
                    </button>
                  );
                })}
              </div>
              <div className="rk-game-notice__actions">
                <button
                  className={`rk-btn rk-btn--primary rk-btn--full ${courtesySelected.size === 0 ? "" : ""}`}
                  onClick={confirmCourtesy}
                >
                  {courtesySelected.size === 0
                    ? "Skip courtesy pass"
                    : `Exchange ${courtesySelected.size} tile${courtesySelected.size !== 1 ? "s" : ""} →`
                  }
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="rk-game-notice__body">Exchange complete.</p>
              <div className="rk-continue__exchange" style={{ width: "100%" }}>
                <div className="rk-continue__col">
                  <p className="rk-continue__col-label">You gave</p>
                  <div className="rk-continue__tiles">
                    {courtesyGiven.map((tile, i) => <PremiumMahjongTile key={i} tile={tile} size="md" dim />)}
                  </div>
                </div>
                <div className="rk-continue__arrow">⇄</div>
                <div className="rk-continue__col">
                  <p className="rk-continue__col-label">You received</p>
                  <div className="rk-continue__tiles rk-continue__tiles--in">
                    {courtesyReceived.map((tile, i) => <PremiumMahjongTile key={i} tile={tile} size="md" />)}
                  </div>
                </div>
              </div>
              <div className="rk-game-notice__actions">
                <button
                  className="rk-btn rk-btn--primary rk-btn--full rk-btn--play"
                  onClick={handleCourtesyContinue}
                >
                  <span className="rk-btn__dot" />
                  What's your read? →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── SECTION SELECT ──────────────────────────────────────────────────────────
  if (phase === PH.SECTION) {
    return (
      <div className="rk-game-screen">
        <div className="rk-section-select">
          <div className="rk-section-select__header">
            <p className="rk-section-select__eyebrow">Charleston complete</p>
            <h1 className="rk-section-select__title">What were you reading?</h1>
            <p className="rk-section-select__sub">
              Pick the section-level direction you were reading. No exact hand required.
            </p>
          </div>
          <div className="rk-section-select__grid">
            {SECTIONS.map(sec => (
              <button
                key={sec.id}
                className={`rk-section-btn ${chosenSection === sec.id ? "rk-section-btn--active" : ""}`}
                onClick={() => setChosenSection(sec.id)}
              >
                <span className="rk-section-btn__label">{sec.label}</span>
                <span className="rk-section-btn__sub">{sec.sub}</span>
              </button>
            ))}
          </div>
          <div className="rk-section-select__rack">
            {rack.map((tile, i) => <PremiumMahjongTile key={i} tile={tile} size="sm" />)}
          </div>
          <div className="rk-section-select__cta">
            <button
              className={`rk-btn rk-btn--primary rk-btn--full rk-btn--play ${!chosenSection ? "rk-btn--disabled" : ""}`}
              onClick={handleSectionConfirm}
              disabled={!chosenSection}
            >
              <span className="rk-btn__dot" />
              Reveal my Rackle IQ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── SCORING ─────────────────────────────────────────────────────────────────
  if (phase === PH.SCORING) {
    return (
      <div className="rk-game-screen rk-game-screen--scoring">
        <div className="rk-game-scoring">
          <div className="rk-game-scoring__dots"><span /><span /><span /></div>
          <p className="rk-game-scoring__label">Reading the table…</p>
        </div>
      </div>
    );
  }

  // ── CONTINUE ────────────────────────────────────────────────────────────────
  if (phase === PH.CONTINUE) {
    const isLastOfCharleston = passIndex === 2;
    const nextPassTemplate   = PASS_TEMPLATES[(passIndex + 1) % 3];
    const isBlindNext        = charleston === 1 && passIndex === 1; // after across → blind notice next

    let ctaLabel;
    if (isLastOfCharleston && charleston === 1) {
      ctaLabel = "Continue to Second Charleston →";
    } else if (isLastOfCharleston && charleston === 2) {
      ctaLabel = "Continue to Courtesy Pass →";
    } else if (isBlindNext) {
      ctaLabel = `Continue · ${nextPassTemplate.label} →`;
    } else {
      ctaLabel = `Continue · ${nextPassTemplate.label} →`;
    }

    return (
      <div className="rk-game-screen rk-game-screen--continue">
        <div className="rk-continue">
          <div className="rk-continue__pill">
            {charleston === 2 ? "2nd · " : ""}{pass.label} · Pass {passIndex + 1} of 3
          </div>
          <div className="rk-continue__exchange">
            <div className="rk-continue__col">
              <p className="rk-continue__col-label">You passed</p>
              <div className="rk-continue__tiles">
                {lastPassed.map((tile, i) => <PremiumMahjongTile key={i} tile={tile} size="md" />)}
              </div>
            </div>
            <div className="rk-continue__arrow">{pass.icon}</div>
            <div className="rk-continue__col">
              <p className="rk-continue__col-label">You received</p>
              <div className="rk-continue__tiles rk-continue__tiles--in">
                {lastReceived.map((tile, i) => <PremiumMahjongTile key={i} tile={tile} size="md" />)}
              </div>
            </div>
          </div>
          <div className="rk-continue__rack-section">
            <p className="rk-continue__rack-label">Your rack</p>
            <div className="rk-continue__rack">
              {rack.map((tile, i) => <PremiumMahjongTile key={i} tile={tile} size="sm" />)}
            </div>
          </div>
          <button
            className="rk-btn rk-btn--primary rk-btn--full rk-btn--play"
            onClick={handleContinue}
          >
            <span className="rk-btn__dot" />
            {ctaLabel}
          </button>
          {!isLastOfCharleston && (
            <p className="rk-continue__round-copy">
              {isBlindNext ? "Blind pass available on the left." : nextPassTemplate.copy}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── SELECT / REVEAL ─────────────────────────────────────────────────────────
  return (
    <div className={`rk-game-screen ${phase === PH.REVEAL ? "rk-game-screen--reveal" : ""}`}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="rk-game-bar">
        <div className="rk-game-bar__left">
          <span className="rk-game-bar__pill">
            {charleston === 2 ? "2nd" : mode === "daily" ? `#${dayNum}` : "Practice"}
          </span>
          <span className="rk-game-bar__pass">
            {pass.label} · {passIndex + 1}/3
          </span>
        </div>
        <div className="rk-game-bar__right">
          <div className="rk-game-bar__dots">
            {PASS_TEMPLATES.map((_, i) => (
              <span
                key={i}
                className={`rk-game-bar__dot ${
                  i < passIndex       ? "rk-game-bar__dot--done"
                  : i === passIndex   ? "rk-game-bar__dot--active"
                  : ""
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Rackle mark + round copy ───────────────────────────────────── */}
      <div className="rk-game-brand">
        <div className="rk-game-brand__mark">
          <span className="rk-wordmark rk-game-brand__wordmark">Rackle</span>
          <span className="rk-tagline rk-game-brand__tagline">The Daily Charleston Ritual</span>
        </div>
        <div className="rk-game-copy rk-game-copy--card">
          <h2 className="rk-game-copy__title">{pass.copy}</h2>
          <p className="rk-game-copy__sub">{pass.sub}</p>
        </div>
      </div>

      {/* ── Utility rail ─────────────────────────────────────────────────── */}
      {phase === PH.SELECT && (
        <div className="rk-game-tools">
          <button className="rk-game-tools__chip" onClick={() => setShowReference(v => !v)} type="button">
            <span>2026 card</span>
          </button>
          <button className="rk-game-tools__sort" onClick={sortRack} aria-label="Sort tiles" type="button">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
            Sort
          </button>
        </div>
      )}

      {phase === PH.SELECT && showReference && (
        <div className="rk-game-reference">
          <div className="rk-game-reference__header">
            <div>
              <p className="rk-game-reference__eyebrow">2026 NMJL card</p>
              <h3 className="rk-game-reference__title">Quick card reference</h3>
            </div>
            <button className="rk-game-reference__close" onClick={() => setShowReference(false)} type="button">Hide</button>
          </div>
          <div className="rk-game-reference__filters">
            {["2026","evens","like","quints","consec","odds","wd","threeSixNine","pairs","suited"].map(key => (
              <button
                key={key}
                type="button"
                className={`rk-game-reference__filter ${referenceFilter === key ? "rk-game-reference__filter--active" : ""}`}
                onClick={() => setReferenceFilter(key)}
              >
                {SECTION_LABELS[key] || key}
              </button>
            ))}
          </div>
          <div className="rk-game-reference__list">
            {referenceSections.flatMap(sec => sec.hands.slice(0,2).map((hand, idx) => {
              const guidance = getReferenceGuidance(sec.section, hand);
              return (
                <div key={`${sec.section}-${idx}`} className="rk-game-reference__card">
                  <div className="rk-game-reference__meta">
                    <span className="rk-game-reference__section">{sec.sectionLabel}</span>
                    <span className="rk-game-reference__value">{hand.value} pts</span>
                  </div>
                  <div className="rk-game-reference__name">{hand.name}</div>
                  <div className="rk-game-reference__notation">{hand.notation}</div>
                  <div className="rk-game-reference__tiles">
                    {(hand.display || []).slice(0, 10).map((tile, j) => (
                      <PremiumMahjongTile key={j} tile={tile} size="xs" />
                    ))}
                  </div>
                  <div className="rk-game-reference__guidance">
                    <div className="rk-game-reference__guide-item">
                      <span>Hold</span>
                      <p>{guidance.hold}</p>
                    </div>
                    <div className="rk-game-reference__guide-item">
                      <span>Pass</span>
                      <p>{guidance.pass}</p>
                    </div>
                    <div className="rk-game-reference__guide-item rk-game-reference__guide-item--strategy">
                      <span>Strategy</span>
                      <p>{guidance.strategy}</p>
                    </div>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      )}

      {/* ── Rack ─────────────────────────────────────────────────────────── */}
      <div className="rk-game-rack-wrap">
        <div className="rk-game-tableau">
          <div className="rk-game-tableau__mat" />
          <div className="rk-game-tableau__rail" />
          {phase === PH.REVEAL ? (
            <div className="rk-game-reveal-anim">
              <div className="rk-game-reveal-anim__dots"><span /><span /><span /></div>
            </div>
          ) : (
            <div className="rk-game-rack">
              {rack.map((tile, i) => {
                const isSel     = selected.has(i);
                const isJoker   = tile.t === "j";
                const isShaking = jokerShake === i;
                return (
                  <div key={i} className="rk-game-tile-wrap">
                    {jokerTip === i && (
                      <div className="rk-game-joker-tip">Jokers stay protected.</div>
                    )}
                    <button
                      className={[
                        "rk-game-tile-btn",
                        isSel     ? "rk-game-tile-btn--selected" : "",
                        isJoker   ? "rk-game-tile-btn--joker"    : "",
                        isShaking ? "rk-game-tile-btn--shake"     : "",
                      ].join(" ")}
                      onClick={() => toggleTile(i)}
                      disabled={phase !== PH.SELECT}
                      aria-pressed={isSel}
                      aria-label={tileLabel(tile)}
                    >
                      <PremiumMahjongTile tile={tile} size="md" selected={isSel} locked={isJoker} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Pass tray ────────────────────────────────────────────────────── */}
      {phase === PH.SELECT && (
        <div className="rk-game-tray">
          <div className="rk-game-tray__header">
            <span className="rk-game-tray__label">Passing {pass.icon}</span>
            <span className="rk-game-tray__count">{selected.size}/3 selected</span>
          </div>
          <div className="rk-game-tray__sub">{selectionGuide}</div>
          <div className="rk-game-tray__slots">
            {[0, 1, 2].map(i => {
              const tile = selectedArr[i]?.t ?? null;
              return (
                <div key={i} className={`rk-game-tray__slot ${tile ? "rk-game-tray__slot--filled" : ""}`}>
                  {tile
                    ? <PremiumMahjongTile tile={tile} size="sm" />
                    : <div className="rk-game-tray__empty" />
                  }
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      {phase === PH.SELECT && (
        <div className="rk-game-cta">
          <button
            className={`rk-btn rk-btn--primary rk-btn--full rk-btn--play ${!isReady ? "rk-btn--disabled" : ""}`}
            onClick={confirmPass}
            disabled={!isReady}
          >
            {isReady ? (
              <><span className="rk-btn__dot" />Pass selected tiles</>
            ) : (
              selectionGuide
            )}
          </button>
        </div>
      )}

    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function tileLabel(tile) {
  if (!tile) return "tile";
  const { t, s, n, v } = tile;
  if (t === "s") return `${n} of ${s}`;
  if (t === "d") return `${v} dragon`;
  if (t === "w") return `${v} wind`;
  if (t === "f") return "flower";
  if (t === "j") return "joker";
  return "tile";
}
