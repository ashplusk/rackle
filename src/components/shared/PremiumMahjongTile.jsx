// ─── Rackle v2 · Premium Mahjong Tile ─────────────────────────────────────────
// Tactile tile atom used for hero/gameplay moments.
// Tile types: s=suited, d=dragon, w=wind, f=flower, j=joker

const TILE_COLORS = {
  bam:  "#176B42",
  crak: "#B02A2A",
  dot:  "#1A5FAB",
  Red:  "#B02A2A",
  Grn:  "#176B42",
  Soap: "#6B6157",
  wind: "#4F4941",
  f:    "#C84F92",
  j:    "#A07828",
};

const TILE_LABELS = {
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

const DRAGON_CHARS = {
  Red:  "中",
  Grn:  "發",
  Soap: "白",
};

function tileFace(tile) {
  if (!tile) {
    return { main: "", corner: "", label: "", color: TILE_COLORS.wind, tone: "wind" };
  }

  if (tile.t === "s") {
    return {
      main: tile.n,
      corner: tile.n,
      mark: tile.s === "bam" ? "B" : tile.s === "crak" ? "C" : "D",
      label: TILE_LABELS[tile.s],
      color: TILE_COLORS[tile.s],
      tone: tile.s,
    };
  }

  if (tile.t === "d") {
    return {
      main: DRAGON_CHARS[tile.v] || tile.v,
      corner: tile.v === "Red" ? "R" : tile.v === "Grn" ? "G" : "S",
      mark: "",
      label: TILE_LABELS[tile.v],
      color: TILE_COLORS[tile.v],
      tone: "dragon",
    };
  }

  if (tile.t === "w") {
    return {
      main: tile.v,
      corner: tile.v,
      mark: "",
      label: TILE_LABELS[tile.v],
      color: TILE_COLORS.wind,
      tone: "wind",
    };
  }

  if (tile.t === "j") {
    return {
      main: "J",
      corner: "J",
      mark: "",
      label: TILE_LABELS.j,
      color: TILE_COLORS.j,
      tone: "joker",
    };
  }

  return {
    main: "✿",
    corner: "F",
    mark: "",
    label: TILE_LABELS.f,
    color: TILE_COLORS.f,
    tone: "flower",
  };
}

function TileMotif({ tone }) {
  const marks = tone === "dot" || tone === "flower" ? 5 : tone === "crak" ? 4 : 3;

  return (
    <span className={`rk-premium-hero-tile__motif rk-premium-hero-tile__motif--${tone}`} aria-hidden="true">
      {Array.from({ length: marks }).map((_, i) => <i key={i} />)}
    </span>
  );
}

export default function PremiumMahjongTile({
  tile,
  size = "md",
  selected = false,
  locked = false,
  dim = false,
  tilt = 0,
}) {
  const face = tileFace(tile);

  return (
    <div
      className={[
        "rk-premium-hero-tile",
        "rk-premium-game-tile",
        `rk-premium-hero-tile--${face.tone}`,
        `rk-premium-game-tile--${size}`,
        selected ? "rk-premium-game-tile--selected" : "",
        locked ? "rk-premium-game-tile--locked" : "",
        dim ? "rk-premium-game-tile--dim" : "",
      ].join(" ")}
      style={{
        "--hero-tile-color": face.color,
        transform: tilt ? `rotate(${tilt}deg)` : undefined,
      }}
      aria-label={`${face.main} ${face.label} tile`}
    >
      <span className="rk-premium-hero-tile__edge" aria-hidden="true" />
      <span className="rk-premium-hero-tile__shine" aria-hidden="true" />
      <span className="rk-premium-hero-tile__corner rk-premium-hero-tile__corner--left">{face.corner}</span>
      <span className="rk-premium-hero-tile__corner rk-premium-hero-tile__corner--right">{face.corner}</span>
      <span className="rk-premium-hero-tile__inner">
        <span className="rk-premium-hero-tile__face">
          <span className="rk-premium-hero-tile__main">{face.main}</span>
          <TileMotif tone={face.tone} />
        </span>
        <span className="rk-premium-hero-tile__label">{face.label}</span>
      </span>
    </div>
  );
}
