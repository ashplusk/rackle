// ─── Rackle v2 · TileTheme ────────────────────────────────────────────────────
// Context provider for tile skins. Wrap the app at root level.
// Adding a new skin = one new object, zero component changes.

import { createContext, useContext } from "react";

export const DEFAULT_SKIN = {
  background:  "#FFFDF8",
  border:      "#E8E2D8",
  numberColor: "#1A1410",
  tileBack:    "#F5F2EC",
  logo:        null,
};

export const TileThemeContext = createContext(DEFAULT_SKIN);
export const useTileTheme = () => useContext(TileThemeContext);

export default function TileThemeProvider({ skin = DEFAULT_SKIN, children }) {
  return (
    <TileThemeContext.Provider value={{ ...DEFAULT_SKIN, ...skin }}>
      {children}
    </TileThemeContext.Provider>
  );
}
