import { useState } from "react";

const s = (suit, n) => ({ t: "s", s: suit, n });
const d = v => ({ t: "d", v });
const w = v => ({ t: "w", v });
const f = () => ({ t: "f" });
const j = () => ({ t: "j" });

const TUTORIAL_TILE_LABELS = {
  bam: "BAM",
  crak: "CRK",
  dot: "DOT",
  Red: "RED",
  Grn: "GRN",
  Wht: "SOAP",
  E: "WIND",
  N: "WIND",
  S: "WIND",
  W: "WIND",
  f: "FLOWER",
  j: "JOKER",
};

const TUTORIAL_TILE_COLORS = {
  bam: "#176B42",
  crak: "#A7272F",
  dot: "#1D5DAA",
  Red: "#A7272F",
  Grn: "#176B42",
  Wht: "#A07828",
  E: "#4F4941",
  N: "#4F4941",
  S: "#4F4941",
  W: "#4F4941",
  f: "#C84F92",
  j: "#A07828",
};

const CURVE = [
  { y: 10, r: -8 },
  { y: 4, r: -4 },
  { y: 0, r: -2 },
  { y: 0, r: 2 },
  { y: 4, r: 4 },
  { y: 10, r: 8 },
  { y: 2, r: 0 },
];

function tileColor(tile) {
  if (tile.t === "s") return TUTORIAL_TILE_COLORS[tile.s] || "#4F4941";
  if (tile.t === "d") return TUTORIAL_TILE_COLORS[tile.v] || "#A7272F";
  if (tile.t === "w") return TUTORIAL_TILE_COLORS[tile.v] || "#4F4941";
  if (tile.t === "f") return TUTORIAL_TILE_COLORS.f;
  if (tile.t === "j") return TUTORIAL_TILE_COLORS.j;
  return "#4F4941";
}

function tileLabel(tile) {
  if (tile.t === "s") return TUTORIAL_TILE_LABELS[tile.s] || tile.s.toUpperCase();
  if (tile.t === "d") return TUTORIAL_TILE_LABELS[tile.v] || tile.v.toUpperCase();
  if (tile.t === "w") return TUTORIAL_TILE_LABELS[tile.v] || "WIND";
  if (tile.t === "f") return "FLOWER";
  if (tile.t === "j") return "JOKER";
  return "";
}

function renderMotif(tile) {
  const color = tileColor(tile);
  if (tile.t === "f") return <div className="rk-premium-hero-tile__flower" style={{ color }}>✿</div>;
  if (tile.t === "j") return <div className="rk-premium-hero-tile__glyph" style={{ color }}>J</div>;
  if (tile.t === "d") return <div className="rk-premium-hero-tile__glyph" style={{ color }}>{tile.v === "Red" ? "中" : tile.v === "Grn" ? "發" : "◻"}</div>;
  if (tile.t === "w") return <div className="rk-premium-hero-tile__glyph" style={{ color }}>{tile.v}</div>;
  return null;
}

function renderSuitPips(suit, n, color) {
  if (suit === "bam") return <div className="rk-premium-hero-tile__motif rk-premium-hero-tile__motif--bam" style={{ color }}>{Array.from({ length: Math.min(n, 4) }).map((_, i) => <span key={i} />)}</div>;
  if (suit === "dot") return <div className="rk-premium-hero-tile__motif rk-premium-hero-tile__motif--dot" style={{ color }}>{Array.from({ length: Math.min(n, 6) }).map((_, i) => <span key={i} />)}</div>;
  if (suit === "crak") return <div className="rk-premium-hero-tile__motif rk-premium-hero-tile__motif--crak" style={{ color }}>{Array.from({ length: Math.min(n, 4) }).map((_, i) => <span key={i}>◆</span>)}</div>;
  return null;
}

function PremiumTutorialTile({ tile }) {
  const color = tileColor(tile);
  const value = tile.t === "s" ? tile.n : tile.t === "w" ? tile.v : tile.t === "d" ? (tile.v === "Red" ? "D" : tile.v === "Grn" ? "G" : "W") : tile.t === "f" ? "F" : "J";

  return (
    <div className="rk-premium-hero-tile rk-premium-hero-tile--tutorial">
      <div className="rk-premium-hero-tile__corner rk-premium-hero-tile__corner--tl" style={{ color }}>{value}</div>
      <div className="rk-premium-hero-tile__corner rk-premium-hero-tile__corner--tr" style={{ color }}>{value}</div>
      <div className="rk-premium-hero-tile__face">
        {tile.t === "s" ? (
          <>
            <div className="rk-premium-hero-tile__main" style={{ color }}>{tile.n}</div>
            {renderSuitPips(tile.s, tile.n, color)}
          </>
        ) : renderMotif(tile)}
        <div className="rk-premium-hero-tile__label" style={{ color }}>{tileLabel(tile)}</div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    id: "welcome",
    eyebrow: "The Daily Ritual",
    title: "Welcome to Rackle",
    body: "Every day, every player gets the same 13-tile rack. Your job is to make the strongest Charleston decisions and see where your read lands on the board.",
    tiles: [s("bam",2), s("crak",5), s("dot",8), d("Red"), w("E"), f()],
    tileLabel: "A premium sample rack. The real rack changes every day.",
    highlights: ["Same rack for everyone", "One daily score to chase", "Built for American Mahjong"],
    cta: "Start the table tour →",
  },
  {
    id: "rack",
    eyebrow: "Read The Rack",
    title: "Your 13 tiles are the whole puzzle",
    body: "You’ll see suited tiles, winds, dragons, flowers, and sometimes jokers. The goal is to spot shape early and steer toward a real hand on the 2026 NMJL card.",
    tiles: [s("bam",1), s("bam",2), s("bam",3), s("crak",5), s("crak",5), d("Grn"), w("N"), w("N"), f(), j()],
    tileLabel: "Good reads start with shape, density, and likely hand families.",
    highlights: ["Suited tiles build direction", "Honors can define the lane", "Flowers and jokers are premium"],
  },
  {
    id: "charleston",
    eyebrow: "Make The Passes",
    title: "The Charleston gives you 3 chances to clean the rack",
    body: "In each pass, you choose 3 tiles to send away and receive 3 tiles back. Pass with purpose. Every choice should move you closer to a real direction.",
    steps: [
      { label: "Pass 1", dir: "Pass Left", desc: "Start cutting tiles that do not support your best lane." },
      { label: "Pass 2", dir: "Pass Across", desc: "Tighten your shape and protect your emerging plan." },
      { label: "Pass 3", dir: "Pass Right", desc: "Finish cleaner and commit to the hand with the best upside." },
    ],
    highlights: ["3 tiles per pass", "No joker passing", "Commit earlier than feels comfortable"],
  },
  {
    id: "strategy",
    eyebrow: "Pick A Direction",
    title: "Strong scores come from commitment",
    body: "The fastest way to lose points is to carry too many maybes. Keep what belongs together. Let go of off-suit noise and weak backups before they slow you down.",
    tiles: [s("bam",2), s("bam",4), s("bam",6), s("bam",8), s("bam",2), s("bam",4), s("bam",6), s("bam",8)],
    tileLabel: "This rack is clearly leaning 2-4-6-8 in Bam.",
    callouts: [
      { color: "#176B42", text: "Hold linked shape and repeated numbers." },
      { color: "#B02A2A", text: "Pass off-suit clutter and unsupported honors early." },
    ],
  },
  {
    id: "jokers",
    eyebrow: "Protect Premium Tiles",
    title: "Jokers and flowers deserve extra respect",
    body: "Jokers are wild and flowers fit many hands, so both are valuable. Jokers can never be passed in Rackle. Hold them and let the rest of the rack organize around them.",
    tiles: [j(), j(), f(), f(), s("bam",4), s("bam",4), s("bam",4), s("bam",4)],
    tileLabel: "Premium tiles can anchor your whole read.",
    callouts: [
      { color: "#A07828", text: "Jokers stay with you the whole Charleston." },
      { color: "#176B42", text: "Flowers often keep more options alive than you think." },
    ],
  },
  {
    id: "scoring",
    eyebrow: "See Your Result",
    title: "Your Rackle IQ reflects the quality of your read",
    body: "After the final pass, Rackle scores your position from 0 to 100. The best scores come from clear direction, strong tile quality, better passing, and earlier commitment.",
    bars: [
      { label: "Direction", max: 40, value: 32, color: "#176B42", desc: "How clearly your final rack points toward a real hand." },
      { label: "Tile strength", max: 25, value: 19, color: "#176B42", desc: "The quality of the tiles you protected." },
      { label: "Pass quality", max: 25, value: 21, color: "#176B42", desc: "Whether you cut the right tiles at the right time." },
      { label: "Timing", max: 10, value: 8, color: "#176B42", desc: "How decisively you moved into one direction." },
    ],
    highlights: ["Climb your club board", "Share your score", "Come back tomorrow for a new rack"],
  },
];

export default function Tutorial({ setScreen }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  function next() { if (!isLast) setStep(s => s + 1); }
  function prev() { if (!isFirst) setStep(s => s - 1); }

  return (
    <div className="rk-tutorial">
      <div className="rk-tutorial__dots">
        {STEPS.map((_, i) => (
          <button
            key={i}
            className={`rk-tutorial__dot ${i === step ? "rk-tutorial__dot--active" : ""} ${i < step ? "rk-tutorial__dot--done" : ""}`}
            onClick={() => setStep(i)}
            aria-label={`Step ${i + 1}`}
          />
        ))}
      </div>

      <div className="rk-tutorial__card" key={step}>
        <div className="rk-tutorial__kicker-row">
          <span className="rk-room-pill rk-room-pill--tutorial"><span /> {current.eyebrow}</span>
          <span className="rk-tutorial__stepcount">Step {step + 1} of {STEPS.length}</span>
        </div>

        <h2 className="rk-tutorial__title">{current.title}</h2>
        <p className="rk-tutorial__body">{current.body}</p>

        {current.tiles && (
          <div className="rk-tutorial__tiles-wrap rk-tutorial__tiles-wrap--premium">
            <div className="rk-tutorial__mini-table">
              <div className="rk-tutorial__mini-rail" />
              <div className="rk-tutorial__tiles rk-tutorial__tiles--premium">
                {current.tiles.map((tile, i) => (
                  <div
                    key={`${current.id}-${i}`}
                    className="rk-tutorial__premium-tile"
                    style={{ "--tile-y": `${CURVE[i]?.y ?? 0}px`, "--tile-r": `${CURVE[i]?.r ?? 0}deg` }}
                  >
                    <PremiumTutorialTile tile={tile} />
                  </div>
                ))}
              </div>
            </div>
            {current.tileLabel && <p className="rk-tutorial__tile-caption">{current.tileLabel}</p>}
          </div>
        )}

        {current.highlights && (
          <div className="rk-tutorial__highlights">
            {current.highlights.map((item, i) => <span key={i} className="rk-tutorial__highlight">{item}</span>)}
          </div>
        )}

        {current.steps && (
          <div className="rk-tutorial__steps">
            {current.steps.map((s, i) => (
              <div key={i} className="rk-tutorial__step">
                <span className="rk-tutorial__step-num">{i + 1}</span>
                <div>
                  <span className="rk-tutorial__step-dir">{s.dir}</span>
                  <span className="rk-tutorial__step-desc">{s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {current.callouts && (
          <div className="rk-tutorial__callouts">
            {current.callouts.map((c, i) => (
              <div key={i} className="rk-tutorial__callout">
                <span className="rk-tutorial__callout-dot" style={{ background: c.color }} />
                <span className="rk-tutorial__callout-text">{c.text}</span>
              </div>
            ))}
          </div>
        )}

        {current.bars && (
          <div className="rk-tutorial__bars">
            {current.bars.map((bar, i) => (
              <div key={i} className="rk-sc__bar rk-tutorial__bar">
                <div className="rk-sc__bar-header">
                  <span className="rk-sc__bar-label">{bar.label}</span>
                  <span className="rk-sc__bar-val">{bar.value}<span className="rk-sc__bar-max">/{bar.max}</span></span>
                </div>
                <div className="rk-sc__bar-track">
                  <div className="rk-sc__bar-fill" style={{ width: `${Math.round(bar.value / bar.max * 100)}%`, background: bar.color }} />
                </div>
                <p className="rk-tutorial__bar-desc">{bar.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rk-tutorial__nav">
        {!isLast ? (
          <>
            <button className="rk-btn rk-btn--primary rk-btn--full rk-btn--play" onClick={next}>
              <span className="rk-btn__dot" />
              {current.cta || "Next →"}
            </button>
            {!isFirst && <button className="rk-btn rk-btn--ghost" onClick={prev}>← Back</button>}
            <button className="rk-tutorial__skip" onClick={() => setScreen?.("home")}>Skip tutorial</button>
          </>
        ) : (
          <>
            <button className="rk-btn rk-btn--primary rk-btn--full rk-btn--play" onClick={() => setScreen?.("game")}>
              <span className="rk-btn__dot" />
              Play Today&apos;s Rackle
            </button>
            <button className="rk-btn rk-btn--ghost" onClick={() => setScreen?.("home")}>Back to home</button>
          </>
        )}
      </div>
    </div>
  );
}
