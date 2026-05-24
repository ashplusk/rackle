// ─── Rackle v2 · App shell ────────────────────────────────────────────────────
// Routing only. All page content lives in src/components/screens/.

import { useState, useEffect } from "react";
import { fetchClubs }          from "./engine/leaderboard.js";
import { clearStaleDailyResult, getStreak, getTodayDailyResult } from "./engine/storage.js";

// Shared components
import TileThemeProvider from "./components/shared/TileTheme.jsx";
import RackleHeader      from "./components/shared/RackleHeader.jsx";
import Footer            from "./components/shared/Footer.jsx";
import RackleState       from "./components/shared/RackleState.jsx";

// Screens
import Home              from "./components/screens/Home.jsx";
import Game              from "./components/screens/Game.jsx";
import DailyScorecard    from "./components/screens/DailyScorecard.jsx";
import Leaderboard       from "./components/screens/Leaderboard.jsx";
import ClubRoom          from "./components/screens/ClubRoom.jsx";
import ClubDirectory     from "./components/screens/ClubDirectory.jsx";
import ClubSignup        from "./components/screens/ClubSignup.jsx";
import FoundingClubs     from "./components/screens/FoundingClubs.jsx";
import Feedback          from "./components/screens/Feedback.jsx";
import Profile           from "./components/screens/Profile.jsx";
import Auth              from "./components/screens/Auth.jsx";
import Settings          from "./components/screens/Settings.jsx";
import HandBrowser       from "./components/screens/HandBrowser.jsx";
import Tutorial          from "./components/screens/Tutorial.jsx";
import TrustPages        from "./components/screens/TrustPages.jsx";

import "./design/global.css";

// ── No-header screens (full bleed) ───────────────────────────────────────────
const NO_HEADER_SCREENS = new Set(["game", "login", "signup", "forgot-password"]);

// ── No-footer screens ─────────────────────────────────────────────────────────
const NO_FOOTER_SCREENS = new Set(["game", "tutorial", "login", "signup", "forgot-password"]);

const PATH_TO_SCREEN = {
  "/": "home",
  "/privacy": "privacy",
  "/terms": "terms",
  "/trust": "trust",
  "/club-directory": "clubDirectory",
  "/club-signup": "clubSignup",
  "/founding-clubs": "foundingClubs",
  "/feedback": "feedback",
  "/leaderboard": "leaderboard",
  "/login": "login",
  "/signup": "signup",
  "/forgot-password": "forgot-password",
};

const SCREEN_TO_PATH = {
  home: "/",
  privacy: "/privacy",
  terms: "/terms",
  trust: "/trust",
  clubDirectory: "/club-directory",
  clubSignup: "/club-signup",
  foundingClubs: "/founding-clubs",
  feedback: "/feedback",
  leaderboard: "/leaderboard",
  login: "/login",
  signup: "/signup",
  "forgot-password": "/forgot-password",
};

function getInitialRoute() {
  if (typeof window === "undefined") return { screen: "home", params: {} };
  const path = window.location.pathname || "/";
  const screen = PATH_TO_SCREEN[path] || "home";
  const params = {};
  if (screen === "feedback") {
    const search = new URLSearchParams(window.location.search);
    const type = search.get("type");
    if (type) params.type = type;
  }
  return { screen, params };
}

function toSafeArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === "") return [];
  return [value];
}

function normalizeScorecardResult(rawResult) {
  if (!rawResult || typeof rawResult !== "object") return rawResult || null;

  const bestPaths = toSafeArray(rawResult.bestPaths).map(path => {
    if (!path || typeof path !== "object") return path;
    return {
      ...path,
      supportingTiles: toSafeArray(path.supportingTiles),
      missingNeeds: toSafeArray(path.missingNeeds),
      deadTiles: toSafeArray(path.deadTiles),
    };
  });

  const passAnalysis = toSafeArray(rawResult.passAnalysis).map(entry => {
    if (!entry || typeof entry !== "object") return entry;
    return {
      ...entry,
      betterPassCandidate: toSafeArray(entry.betterPassCandidate),
      tilesYouProtectedWell: toSafeArray(entry.tilesYouProtectedWell),
      questionableKeep: toSafeArray(entry.questionableKeep),
    };
  });

  return {
    ...rawResult,
    bestPaths,
    passAnalysis,
    passLog: toSafeArray(rawResult.passLog),
    allSections: toSafeArray(rawResult.allSections),
    finalRack: toSafeArray(rawResult.finalRack),
    startingRack: toSafeArray(rawResult.startingRack),
    whatHeldYouBack: toSafeArray(rawResult.whatHeldYouBack),
    nearMisses: toSafeArray(rawResult.nearMisses),
    defensibleAlternatives: toSafeArray(rawResult.defensibleAlternatives),
  };
}

export default function App() {
  const initialRoute = getInitialRoute();
  const [screen, setScreenState] = useState(initialRoute.screen);
  const [params, setParams]      = useState(initialRoute.params);
  const [streak]                = useState(() => getStreak());

  // Boot
  useEffect(() => {
    clearStaleDailyResult();
    fetchClubs().catch(() => {});

    try {
      const savedTileSize = localStorage.getItem("rackleTileSize") || "regular";
      document.documentElement.dataset.rackleTileSize = savedTileSize;
    } catch {
      document.documentElement.dataset.rackleTileSize = "regular";
    }
  }, []);

  useEffect(() => {
    function handlePopState() {
      const next = getInitialRoute();
      setScreenState(next.screen);
      setParams(next.params);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function go(target, nextParams = {}) {
    const safeParams = nextParams ?? {};
    setScreenState(target);
    setParams(safeParams);

    const path = SCREEN_TO_PATH[target];
    if (path && typeof window !== "undefined") {
      const query = target === "feedback" && safeParams.type ? `?type=${encodeURIComponent(safeParams.type)}` : "";
      const nextUrl = `${path}${query}`;
      const currentUrl = `${window.location.pathname}${window.location.search}`;
      if (nextUrl !== currentUrl) window.history.pushState({}, "", nextUrl);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const isHome = screen === "home";
  const showHeader = !NO_HEADER_SCREENS.has(screen);
  const showFooter = !NO_FOOTER_SCREENS.has(screen);

  // Shared setScreen helper passed to all screens
  function setScreen(s, p) { go(s, p); }

  const scorecardResult = normalizeScorecardResult(params.result || getTodayDailyResult());

  return (
    <TileThemeProvider>
      <div className={`rk-app-shell rk-app-shell--${screen}`}>
        {showHeader && (
          <RackleHeader
          isHome={isHome}
          streak={streak}
          onBack={() => go("home")}
          setScreen={setScreen}
          currentScreen={screen}
        />
      )}

      <main className="rk-page" role="main">
        {screen === "home" && (
          <Home setScreen={setScreen} />
        )}
        {screen === "game" && (
          <Game
            mode={params.mode || "daily"}
            setScreen={setScreen}
          />
        )}
        {screen === "practice" && (
          <Game
            mode="practice"
            setScreen={setScreen}
          />
        )}
        {(screen === "scorecard" || screen === "dailyScorecard") && (
          <DailyScorecard
            result={scorecardResult}
            mode={params.mode || "daily"}
            setScreen={setScreen}
          />
        )}
        {screen === "leaderboard" && (
          <Leaderboard setScreen={setScreen} />
        )}
        {screen === "clubRoom" && (
          <ClubRoom setScreen={setScreen} />
        )}
        {screen === "clubDirectory" && (
          <ClubDirectory setScreen={setScreen} />
        )}
        {screen === "clubSignup" && (
          <ClubSignup setScreen={setScreen} />
        )}
        {screen === "foundingClubs" && (
          <FoundingClubs setScreen={setScreen} />
        )}
        {screen === "feedback" && (
          <Feedback setScreen={setScreen} type={params.type} />
        )}
        {screen === "login" && (
          <Auth mode="login" setScreen={setScreen} />
        )}
        {screen === "signup" && (
          <Auth mode="signup" setScreen={setScreen} />
        )}
        {screen === "forgot-password" && (
          <Auth mode="forgot" setScreen={setScreen} />
        )}
        {screen === "profile" && (
          <Profile setScreen={setScreen} />
        )}
        {screen === "settings" && (
          <Settings setScreen={setScreen} />
        )}
        {screen === "handBrowser" && (
          <HandBrowser setScreen={setScreen} />
        )}
        {screen === "tutorial" && (
          <Tutorial setScreen={setScreen} />
        )}
        {screen === "privacy" && (
          <TrustPages page="privacy" setScreen={setScreen} />
        )}
        {screen === "terms" && (
          <TrustPages page="terms" setScreen={setScreen} />
        )}
        {screen === "trust" && (
          <TrustPages page="trust" setScreen={setScreen} />
        )}
        {!([
          "home", "game", "practice", "scorecard", "dailyScorecard", "leaderboard", "clubRoom",
          "clubDirectory", "clubSignup", "foundingClubs", "feedback", "login", "signup", "forgot-password",
          "profile", "settings", "handBrowser", "tutorial", "privacy", "terms", "trust",
        ].includes(screen)) && (
          <RackleState
            eyebrow="Rackle"
            title="The room is still setting up."
            body="Try opening today’s Rackle again."
            primaryLabel="Back home"
            onPrimary={() => go("home")}
          />
        )}
      </main>

        {showFooter && <Footer setScreen={setScreen} />}
      </div>
    </TileThemeProvider>
  );
}
