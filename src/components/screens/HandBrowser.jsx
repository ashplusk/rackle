// ─── Rackle v2 · HandBrowser ─────────────────────────────────────────────────
// 2026 NMJL card reference — browse hands by category with tile display.

import { useState, useMemo } from "react";
import Tile from "../shared/Tile.jsx";

// ── 2026 NMJL card (representative hands) ────────────────────────────────────
// Format: tiles array uses same shape as game engine
// P = Pair, K = Kong, Q = Quint (5 of a kind), S = Sequence

const s = (suit, n) => ({ t: "s", s: suit, n });
const d = v => ({ t: "d", v });
const w = v => ({ t: "w", v });
const f = () => ({ t: "f" });
const j = () => ({ t: "j" });

export const HANDS_2026 = [
  {
    section: "2026",
    sectionLabel: "2026",
    hands: [
      {
        name: "2026 · Any 2 suits",
        notation: "22 00 222 666 NEWS",
        display: [s("bam",2), s("bam",2), d("Soap"), d("Soap"), s("crak",2), s("crak",2), s("crak",2), s("dot",6), s("dot",6), s("dot",6), w("N"), w("E"), w("W"), w("S")],
        value: 30,
        concealed: false,
        jokers: true,
        hint: "The 2026 section leans on 2s, 6s, Soap as 0, and sometimes NEWS or flowers.",
      },
      {
        name: "2026 · Any 3 suits",
        notation: "FFF 2026 222 6666",
        display: [f(), f(), f(), s("bam",2), d("Soap"), s("crak",2), s("dot",6), s("bam",2), s("bam",2), s("bam",2), s("crak",6), s("crak",6), s("crak",6), s("crak",6)],
        value: 25,
        concealed: false,
        jokers: true,
      },
    ],
  },
  {
    section: "evens",
    sectionLabel: "2-4-6-8",
    hands: [
      {
        name: "2-4-6-8 · Any 1 or 2 suits",
        notation: "222 444 6666 8888",
        display: [s("bam",2), s("bam",2), s("bam",2), s("crak",4), s("crak",4), s("crak",4), s("dot",6), s("dot",6), s("dot",6), s("dot",6), s("bam",8), s("bam",8), s("bam",8), s("bam",8)],
        value: 25,
        concealed: false,
        jokers: true,
      },
      {
        name: "2-4-6-8 · 2 suits",
        notation: "FF 246 888 246 888",
        display: [f(), f(), s("bam",2), s("bam",4), s("bam",6), s("bam",8), s("bam",8), s("bam",8), s("crak",2), s("crak",4), s("crak",6), s("crak",8), s("crak",8), s("crak",8)],
        value: 30,
        concealed: true,
        jokers: false,
      },
    ],
  },
  {
    section: "like",
    sectionLabel: "Any Like Numbers",
    hands: [
      {
        name: "Any Like Numbers · Any 2 suits",
        notation: "1111 FFFFF 1111",
        display: [s("bam",1), s("bam",1), s("bam",1), s("bam",1), f(), f(), f(), f(), f(), s("crak",1), s("crak",1), s("crak",1), s("crak",1)],
        value: 30,
        concealed: false,
        jokers: true,
      },
      {
        name: "Any Like Numbers · 3 suits with dragon",
        notation: "1111 D 111 D 1111 D",
        display: [s("bam",1), s("bam",1), s("bam",1), s("bam",1), d("Grn"), s("crak",1), s("crak",1), s("crak",1), d("Grn"), s("dot",1), s("dot",1), s("dot",1), s("dot",1), d("Grn")],
        value: 25,
        concealed: false,
        jokers: true,
      },
    ],
  },
  {
    section: "quints",
    sectionLabel: "Quints",
    hands: [
      {
        name: "Quints · Any 3 suits, any like nos.",
        notation: "11111 1111 11111",
        display: [s("bam",1), s("bam",1), s("bam",1), s("bam",1), j(), s("crak",1), s("crak",1), s("crak",1), s("crak",1), s("dot",1), s("dot",1), s("dot",1), s("dot",1), j()],
        value: 40,
        concealed: false,
        jokers: true,
      },
      {
        name: "Quints · Any 1 suit, any 3 consec. nos.",
        notation: "FF 11111 22 33333",
        display: [f(), f(), s("bam",1), s("bam",1), s("bam",1), s("bam",1), j(), s("bam",2), s("bam",2), s("bam",3), s("bam",3), s("bam",3), s("bam",3), j()],
        value: 45,
        concealed: false,
        jokers: true,
      },
    ],
  },
  {
    section: "consec",
    sectionLabel: "Consecutive Run",
    hands: [
      {
        name: "Consecutive Run · Any 1 or 2 suits",
        notation: "FFF 1111 234 5555",
        display: [f(), f(), f(), s("bam",1), s("bam",1), s("bam",1), s("bam",1), s("crak",2), s("crak",3), s("crak",4), s("bam",5), s("bam",5), s("bam",5), s("bam",5)],
        value: 25,
        concealed: false,
        jokers: true,
      },
      {
        name: "Consecutive Run · Any 3 suits",
        notation: "11 22 111 222 3333",
        display: [s("bam",1), s("bam",1), s("crak",2), s("crak",2), s("dot",1), s("dot",1), s("dot",1), s("bam",2), s("bam",2), s("bam",2), s("crak",3), s("crak",3), s("crak",3), s("crak",3)],
        value: 25,
        concealed: false,
        jokers: true,
      },
    ],
  },
  {
    section: "odds",
    sectionLabel: "1-3-5-7-9",
    hands: [
      {
        name: "1-3-5-7-9 · Any 1 or 3 suits",
        notation: "11 333 55 777 9999",
        display: [s("bam",1), s("bam",1), s("bam",3), s("bam",3), s("bam",3), s("crak",5), s("crak",5), s("dot",7), s("dot",7), s("dot",7), s("bam",9), s("bam",9), s("bam",9), s("bam",9)],
        value: 25,
        concealed: false,
        jokers: true,
      },
      {
        name: "1-3-5-7-9 · Any 1 or 2 suits",
        notation: "1111 33 55 77 9999",
        display: [s("bam",1), s("bam",1), s("bam",1), s("bam",1), s("crak",3), s("crak",3), s("bam",5), s("bam",5), s("crak",7), s("crak",7), s("dot",9), s("dot",9), s("dot",9), s("dot",9)],
        value: 30,
        concealed: false,
        jokers: true,
      },
    ],
  },
  {
    section: "wd",
    sectionLabel: "Winds & Dragons",
    hands: [
      {
        name: "Winds & Dragons · Any wind, any dragon",
        notation: "FFF NNNN FFF DDDD",
        display: [f(), f(), f(), w("N"), w("N"), w("N"), w("N"), f(), f(), f(), d("Red"), d("Red"), d("Red"), d("Red")],
        value: 25,
        concealed: false,
        jokers: true,
      },
      {
        name: "Winds & Dragons · 2026 any 1 suit",
        notation: "NN EEE 2026 WWW SS",
        display: [w("N"), w("N"), w("E"), w("E"), w("E"), s("bam",2), d("Soap"), s("bam",2), s("bam",6), w("W"), w("W"), w("W"), w("S"), w("S")],
        value: 30,
        concealed: true,
        jokers: false,
      },
    ],
  },
  {
    section: "threeSixNine",
    sectionLabel: "3-6-9",
    hands: [
      {
        name: "3-6-9 · Any 3 suits",
        notation: "33 66 333 666 9999",
        display: [s("bam",3), s("bam",3), s("crak",6), s("crak",6), s("dot",3), s("dot",3), s("dot",3), s("bam",6), s("bam",6), s("bam",6), s("crak",9), s("crak",9), s("crak",9), s("crak",9)],
        value: 25,
        concealed: false,
        jokers: true,
      },
      {
        name: "3-6-9 · Any 2 suits",
        notation: "FF 333 666 999 369",
        display: [f(), f(), s("bam",3), s("bam",3), s("bam",3), s("crak",6), s("crak",6), s("crak",6), s("dot",9), s("dot",9), s("dot",9), s("bam",3), s("crak",6), s("dot",9)],
        value: 30,
        concealed: true,
        jokers: false,
      },
    ],
  },
  {
    section: "pairs",
    sectionLabel: "Singles & Pairs",
    hands: [
      {
        name: "Singles & Pairs · Like number with matching dragons",
        notation: "NN EE WW SS 1D 1D 1D",
        display: [w("N"), w("N"), w("E"), w("E"), w("W"), w("W"), w("S"), w("S"), s("bam",1), d("Grn"), s("crak",1), d("Grn"), s("dot",1), d("Grn")],
        value: 50,
        concealed: true,
        jokers: false,
      },
      {
        name: "Singles & Pairs · Any 2 suits",
        notation: "FF 2026 2026 2026",
        display: [f(), f(), s("bam",2), d("Soap"), s("bam",2), s("bam",6), s("crak",2), d("Soap"), s("crak",2), s("crak",6), s("dot",2), d("Soap"), s("dot",2), s("dot",6)],
        value: 75,
        concealed: true,
        jokers: false,
      },
    ],
  },
  {
    section: "suited",
    sectionLabel: "Single Suit",
    hands: [
      {
        name: "Single Suit · representative",
        notation: "One suit core with flowers",
        display: [f(), f(), s("bam",1), s("bam",1), s("bam",1), s("bam",2), s("bam",2), s("bam",2), s("bam",3), s("bam",3), s("bam",3), s("bam",4), s("bam",4), s("bam",4)],
        value: 25,
        concealed: false,
        jokers: true,
        hint: "Single Suit is a distinct 2026 card section. Keep the suit dense and cut off-suit drift quickly.",
      },
      {
        name: "Single Suit · representative pair build",
        notation: "One suit with pairs and kongs",
        display: [s("crak",2), s("crak",2), s("crak",4), s("crak",4), s("crak",4), s("crak",4), s("crak",6), s("crak",6), s("crak",6), s("crak",8), s("crak",8), s("crak",8), s("crak",8), d("Red")],
        value: 30,
        concealed: false,
        jokers: true,
      },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function HandBrowser({ setScreen }) {
  const [activeSection, setActiveSection] = useState("all");
  const [search,        setSearch]        = useState("");
  const [expandedHand,  setExpandedHand]  = useState(null);

  const sections = useMemo(() => {
    const all = { section: "all", sectionLabel: "All Hands" };
    return [all, ...HANDS_2026];
  }, []);

  const visibleHands = useMemo(() => {
    let source = HANDS_2026;
    if (activeSection !== "all") {
      source = source.filter(s => s.section === activeSection);
    }
    const allHands = source.flatMap(sec =>
      sec.hands.map(h => ({ ...h, sectionLabel: sec.sectionLabel, sectionId: sec.section }))
    );
    if (!search.trim()) return allHands;
    const q = search.toLowerCase();
    return allHands.filter(h =>
      h.name?.toLowerCase().includes(q) ||
      h.notation?.toLowerCase().includes(q) ||
      h.sectionLabel?.toLowerCase().includes(q) ||
      h.hint?.toLowerCase().includes(q)
    );
  }, [activeSection, search]);

  return (
    <div className="rk-hand-browser">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="rk-hand-browser__header">
        <h1 className="rk-section-title">2026 Card Reference</h1>
        <p className="rk-hand-browser__sub">
          {HANDS_2026.reduce((s, sec) => s + sec.hands.length, 0)} hands across{" "}
          {HANDS_2026.length} sections
        </p>

        {/* Search */}
        <input
          className="rk-input"
          type="search"
          placeholder="Search hands…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── Section tabs ─────────────────────────────────────────────────── */}
      <div className="rk-hand-browser__tabs">
        {sections.map(sec => (
          <button
            key={sec.section}
            className={`rk-hand-browser__tab ${activeSection === sec.section ? "rk-hand-browser__tab--active" : ""}`}
            onClick={() => { setActiveSection(sec.section); setSearch(""); }}
          >
            {sec.sectionLabel}
          </button>
        ))}
      </div>

      {/* ── Hand list ────────────────────────────────────────────────────── */}
      <div className="rk-hand-browser__list">
        {visibleHands.length === 0 && (
          <p className="rk-hand-browser__none">No hands match "{search}"</p>
        )}
        {visibleHands.map((hand, i) => {
          const isExpanded = expandedHand === i;
          return (
            <div
              key={i}
              className={`rk-hand-card ${isExpanded ? "rk-hand-card--expanded" : ""}`}
              onClick={() => setExpandedHand(isExpanded ? null : i)}
            >
              {/* Section badge */}
              <div className="rk-hand-card__section">{hand.sectionLabel}</div>

              <div className="rk-hand-card__header">
                <h3 className="rk-hand-card__name">{hand.name}</h3>
                <div className="rk-hand-card__badges">
                  {hand.concealed && (
                    <span className="rk-hand-card__badge rk-hand-card__badge--concealed">Concealed</span>
                  )}
                  {!hand.jokers && (
                    <span className="rk-hand-card__badge rk-hand-card__badge--no-joker">No Jokers</span>
                  )}
                  {hand.value && (
                    <span className="rk-hand-card__badge rk-hand-card__badge--value">{hand.value}¢</span>
                  )}
                </div>
              </div>

              {/* Tile display */}
              <div className="rk-hand-card__tiles">
                {(hand.display || []).map((tile, ti) => (
                  <Tile key={ti} tile={tile} size="sm" />
                ))}
              </div>

              {/* Notation */}
              <p className="rk-hand-card__notation">{hand.notation}</p>

              {/* Expanded hint */}
              {isExpanded && hand.hint && (
                <p className="rk-hand-card__hint">{hand.hint}</p>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
