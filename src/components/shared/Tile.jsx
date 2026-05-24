// ─── Rackle v2 · Tile ─────────────────────────────────────────────────────────
// Skinnable tile atom. Reads active skin from TileTheme context.
// Tile types: s=suited, d=dragon, w=wind, f=flower, j=joker

import { useTileTheme } from "./TileTheme.jsx";

// ── Size presets ──────────────────────────────────────────────────────────────
const SIZES = {
  sm: { width: 30, height: 42, fontSize: 11, suitSize: 9 },
  md: { width: 44, height: 62, fontSize: 16, suitSize: 13 },
  lg: { width: 56, height: 78, fontSize: 20, suitSize: 17 },
};

// ── Suit colours ──────────────────────────────────────────────────────────────
const SUIT_COLORS = {
  bam:  "#176B42",
  crak: "#B02A2A",
  dot:  "#1A5FAB",
};

// ── Suit symbols (letter inside tile face) ────────────────────────────────────
const SUIT_LABELS = {
  bam:  "B",
  crak: "C",
  dot:  "D",
};

// ── Bottom label text (shown when showLabel=true) ─────────────────────────────
const BOTTOM_LABELS = {
  bam:  "BAM",
  crak: "CRK",
  dot:  "DOT",
  Red:  "RED",
  Grn:  "GRN",
  Soap: "SOAP",
  E:    "WIND",
  S:    "WIND",
  W:    "WIND",
  N:    "WIND",
  f:    "FLOWER",
  j:    "JOKER",
};

// ── Dragon characters ─────────────────────────────────────────────────────────
const DRAGON_CHARS = {
  Red:  { char: "中", color: "#B02A2A" },
  Grn:  { char: "發", color: "#176B42" },
  Soap: { char: "白", color: "#6B6157" },
};

// ── Wind labels ───────────────────────────────────────────────────────────────
const WIND_LABELS = {
  E: { char: "E", label: "East"  },
  S: { char: "S", label: "South" },
  W: { char: "W", label: "West"  },
  N: { char: "N", label: "North" },
};

// ── Tile face content ─────────────────────────────────────────────────────────
function TileFace({ tile, skin, sz }) {
  const { t, s, n, v } = tile;

  if (t === "s") {
    // Suited tile — number + suit initial
    const suitColor = SUIT_COLORS[s] ?? "#1A1410";
    return (
      <>
        <span style={{
          fontFamily:  "'Fraunces', Georgia, serif",
          fontStyle:   "italic",
          fontWeight:  900,
          fontSize:    sz.fontSize * 1.05,
          color:       skin.numberColor,
          lineHeight:  1,
          letterSpacing: "-0.02em",
        }}>
          {n}
        </span>
        <span style={{
          fontSize:      sz.suitSize * 0.9,
          color:         suitColor,
          fontWeight:    900,
          lineHeight:    1,
          letterSpacing: "0.06em",
          fontFamily:    "'Nunito', sans-serif",
        }}>
          {SUIT_LABELS[s] ?? s}
        </span>
      </>
    );
  }

  if (t === "d") {
    // Dragon tile
    const d = DRAGON_CHARS[v] ?? { char: v, color: "#1A1410" };
    return (
      <span style={{
        fontFamily: "Fraunces, Georgia, serif",
        fontWeight: 900,
        fontSize:   sz.fontSize * 1.25,
        color:      d.color,
        lineHeight: 1,
      }}>
        {d.char}
      </span>
    );
  }

  if (t === "w") {
    // Wind tile
    const w = WIND_LABELS[v] ?? { char: v, label: v };
    return (
      <span style={{
        fontFamily: "Fraunces, Georgia, serif",
        fontWeight: 900,
        fontSize:   sz.fontSize,
        color:      skin.numberColor,
        lineHeight: 1,
      }}>
        {w.char}
      </span>
    );
  }

  if (t === "f") {
    // Flower tile
    return (
      <span style={{
        fontSize:   sz.fontSize * 1.1,
        lineHeight: 1,
      }}>
        🌸
      </span>
    );
  }

  if (t === "j") {
    // Joker tile — gold
    return (
      <span style={{
        fontFamily: "Fraunces, Georgia, serif",
        fontWeight: 900,
        fontSize:   sz.fontSize,
        color:      "#A07828",
        lineHeight: 1,
      }}>
        J
      </span>
    );
  }

  // Unknown
  return <span style={{ fontSize: sz.suitSize, color: "#9A8F85" }}>?</span>;
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * <Tile tile={...} size="md" tilt={-3} selected locked dim />
 *
 * tile shape:
 *   suited:  { t:"s", s:"bam"|"crak"|"dot", n:1-9 }
 *   dragon:  { t:"d", v:"Red"|"Grn"|"Soap" }
 *   wind:    { t:"w", v:"E"|"S"|"W"|"N" }
 *   flower:  { t:"f" }
 *   joker:   { t:"j" }
 *   back:    { t:"back" }
 */
export default function Tile({
  tile,
  size      = "md",
  tilt      = 0,
  selected  = false,
  locked    = false,
  dim       = false,
  showLabel = false,
}) {
  const skin   = useTileTheme();
  const sz     = SIZES[size] ?? SIZES.md;
  const isBack = tile?.t === "back";

  // Derive bottom label text
  let bottomLabel = null;
  if (showLabel && tile) {
    const { t, s, v } = tile;
    if (t === "s")  bottomLabel = BOTTOM_LABELS[s] ?? s.toUpperCase();
    if (t === "d")  bottomLabel = BOTTOM_LABELS[v] ?? v.toUpperCase();
    if (t === "w")  bottomLabel = BOTTOM_LABELS[v] ?? "WIND";
    if (t === "f")  bottomLabel = "FLOWER";
    if (t === "j")  bottomLabel = "JOKER";
  }

  const baseStyle = {
    display:         "inline-flex",
    flexDirection:   "column",
    alignItems:      "center",
    justifyContent:  bottomLabel ? "space-between" : "center",
    paddingTop:      bottomLabel ? 7 : 0,
    paddingBottom:   bottomLabel ? 5 : 0,
    width:           sz.width,
    height:          sz.height,
    borderRadius:    10,
    border:          `1.5px solid ${selected ? "#176B42" : "rgba(200,188,170,0.9)"}`,
    background:      isBack
      ? "linear-gradient(155deg, #EDE7DA 0%, #E2DAC8 100%)"
      : "linear-gradient(155deg, #FFFEFC 0%, #FAF6EE 60%, #F5F0E4 100%)",
    boxShadow: selected
      ? "0 0 0 2.5px rgba(23,107,66,0.5), 0 6px 16px rgba(26,20,16,0.18), inset 0 1.5px 0 rgba(255,255,255,0.98), inset 0 -1px 0 rgba(26,20,16,0.06)"
      : "0 4px 12px rgba(26,20,16,0.13), 0 1px 3px rgba(26,20,16,0.07), inset 0 1.5px 0 rgba(255,255,255,0.98), inset 0 -1px 0 rgba(26,20,16,0.05)",
    transform:       [
      tilt ? `rotate(${tilt}deg)` : null,
    ].filter(Boolean).join(" ") || undefined,
    opacity:         dim ? 0.38 : 1,
    cursor:          locked ? "not-allowed" : "default",
    transition:      "transform 0.18s cubic-bezier(0.34,1.56,0.64,1), opacity 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
    flexShrink:      0,
    position:        "relative",
    gap:             0,
  };

  return (
    <div style={baseStyle} aria-label={tileAriaLabel(tile)}>
      {!isBack && <TileFace tile={tile} skin={skin} sz={sz} />}
      {!isBack && bottomLabel && (
        <span style={{
          fontSize:      sz.suitSize - 1,
          fontWeight:    900,
          letterSpacing: "0.04em",
          color:         "#9A8F85",
          lineHeight:    1,
          userSelect:    "none",
        }}>
          {bottomLabel}
        </span>
      )}
      {isBack && skin.logo && (
        <img
          src={skin.logo}
          alt="tile back"
          style={{ width: "60%", height: "auto", opacity: 0.6 }}
        />
      )}
    </div>
  );
}

// ── Accessibility label ───────────────────────────────────────────────────────
function tileAriaLabel(tile) {
  if (!tile) return "tile";
  const { t, s, n, v } = tile;
  if (t === "s")    return `${n} of ${s}`;
  if (t === "d")    return `${v} dragon`;
  if (t === "w")    return `${WIND_LABELS[v]?.label ?? v} wind`;
  if (t === "f")    return "flower";
  if (t === "j")    return "joker";
  if (t === "back") return "tile back";
  return "tile";
}
