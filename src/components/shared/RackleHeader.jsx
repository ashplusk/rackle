// ─── Rackle v2 · RackleHeader ────────────────────────────────────────────────
// Single shared header used on every screen.
// isHome=true  → left slot shows streak badge (hidden if streak=0)
// isHome=false → left slot shows back arrow

import { useEffect, useMemo, useRef, useState } from "react";
import { getProfile, hasValidSession, logout } from "../../engine/storage.js";

const NAV_GROUPS = [
  {
    label: "Play",
    items: [
      { label: "Play Today", icon: "🀄", screen: "game", params: { mode: "daily" }, match: ["game"] },
      { label: "Practice Room", icon: "✦", screen: "practice", match: ["practice"] },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Leaderboard", icon: "↟", screen: "leaderboard", match: ["leaderboard"] },
      { label: "Club Directory", icon: "◎", screen: "clubDirectory", match: ["clubDirectory", "clubSignup", "foundingClubs"] },
      { label: "Founding Clubs", icon: "◇", screen: "foundingClubs", match: ["foundingClubs"] },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Trust", icon: "✓", screen: "trust", match: ["trust"] },
      { label: "Privacy", icon: "◦", screen: "privacy", match: ["privacy"] },
      { label: "Terms", icon: "§", screen: "terms", match: ["terms"] },
      { label: "Send Feedback", icon: "✎", screen: "feedback", match: ["feedback"] },
      { label: "Contact", icon: "@", href: "mailto:hello@playrackle.com" },
      { label: "Instagram", icon: "◌", href: "https://instagram.com/playrackle", external: true },
    ],
  },
];

function getAccountItems(isLoggedIn, displayName) {
  if (isLoggedIn) {
    return [
      {
        label: "Profile",
        icon: (displayName || "R").charAt(0).toUpperCase(),
        screen: "profile",
        match: ["profile"],
        description: displayName || "Rackle player",
        variant: "account",
      },
      { label: "Settings", icon: "⚙", screen: "settings", match: ["settings"] },
      { label: "Log out", icon: "↩", action: "logout", muted: true },
    ];
  }

  return [
    { label: "Join Rackle", icon: "＋", screen: "signup", match: ["signup"], primary: true },
    { label: "Log in", icon: "→", screen: "login", match: ["login"], muted: true },
    { label: "Settings", icon: "⚙", screen: "settings", match: ["settings"] },
  ];
}

export default function RackleHeader({ isHome = false, streak = 0, onBack, setScreen, currentScreen = "home" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const profile = getProfile();
  const displayName = profile?.name || profile?.email || "";
  const isLoggedIn = hasValidSession() || !!displayName;

  const menuGroups = useMemo(() => [
    NAV_GROUPS[0],
    NAV_GROUPS[1],
    {
      label: "Account",
      items: getAccountItems(isLoggedIn, displayName),
    },
    NAV_GROUPS[2],
  ], [isLoggedIn, displayName]);

  function goHome() { setScreen?.("home"); }

  function closeMenu() { setMenuOpen(false); }

  function goTo(screen, params) {
    closeMenu();
    setScreen?.(screen, params);
  }

  function handleLogout() {
    logout();
    closeMenu();
    setScreen?.("home");
  }

  function handleItemClick(item) {
    if (item.action === "logout") return handleLogout();
    return goTo(item.screen, item.params);
  }

  function isActive(item) {
    if (!item.match) return false;
    return item.match.includes(currentScreen);
  }

  useEffect(() => {
    if (!menuOpen) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") closeMenu();
    }

    function onPointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) closeMenu();
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  return (
    <header className={`rk-header${isHome ? " rk-header--home" : ""}`} role="banner">

      {/* ── Left slot ──────────────────────────────────────────────────── */}
      <div className="rk-header-left">
        {isHome ? (
          <button
            type="button"
            className="rk-header-streak"
            onClick={() => setScreen?.(isLoggedIn ? "profile" : "signup")}
            aria-label={streak > 0 ? `View streak — ${streak} days` : "Start a streak"}
          >
            <span className="rk-header-streak-icon" aria-hidden="true">●</span>
            <span className="rk-header-streak-count">{streak > 0 ? `${streak}-day` : "Start"}</span>
            <span className="rk-header-streak-label">streak</span>
          </button>
        ) : (
          <button
            type="button"
            className="rk-header-back"
            onClick={onBack}
            aria-label="Go back"
          >
            ←
          </button>
        )}
      </div>

      {/* ── Centre — wordmark + tagline (non-interactive on home) ──────── */}
      <div className="rk-header-centre">
        {isHome ? (
          <div className="rk-header-brand-div">
            <span className="rk-wordmark rk-header-wordmark">Rackle</span>
            <span className="rk-tagline rk-header-tagline">The Daily Charleston Ritual</span>
          </div>
        ) : (
          <button type="button" className="rk-header-brand-btn" onClick={goHome} aria-label="Go to Rackle home">
            <span className="rk-wordmark rk-header-wordmark">Rackle</span>
            <span className="rk-tagline rk-header-tagline">The Daily Charleston Ritual</span>
          </button>
        )}
      </div>

      {/* ── Right slot — hamburger menu ─────────────────────────────────── */}
      <div className="rk-header-right">
        <div className="rk-header-menu-wrap" ref={menuRef}>
          <button
            type="button"
            className={`rk-header-menu-btn${menuOpen ? " is-open" : ""}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="rackle-main-menu"
          >
            <span /><span /><span />
          </button>

          {menuOpen && (
            <>
              <div className="rk-header-menu-backdrop" aria-hidden="true" />
              <nav id="rackle-main-menu" className="rk-header-menu-dropdown" role="menu" aria-label="Rackle navigation">
                <div className="rk-header-menu-topline">
                  <span className="rk-header-menu-title">Rackle Menu</span>
                  <button type="button" className="rk-header-menu-close" onClick={closeMenu} aria-label="Close menu">×</button>
                </div>

                {menuGroups.map(group => (
                  <div className="rk-header-menu-section" key={group.label}>
                    <div className="rk-header-menu-section-label">{group.label}</div>
                    <div className="rk-header-menu-items">
                      {group.items.map(item => {
                        const active = isActive(item);
                        const itemClass = [
                          "rk-header-menu-item",
                          item.primary ? "rk-header-menu-item--primary" : "",
                          item.muted ? "rk-header-menu-item--muted" : "",
                          item.variant === "account" ? "rk-header-menu-item--account" : "",
                          active ? "is-active" : "",
                        ].filter(Boolean).join(" ");

                        const content = (
                          <>
                            <span className="rk-header-menu-icon" aria-hidden="true">{item.icon}</span>
                            <span className="rk-header-menu-copy">
                              <span className="rk-header-menu-link-label">{item.label}</span>
                              {item.description && <span className="rk-header-menu-description">{item.description}</span>}
                            </span>
                          </>
                        );

                        if (item.href) {
                          return (
                            <a
                              key={item.label}
                              role="menuitem"
                              className={itemClass}
                              href={item.href}
                              target={item.external ? "_blank" : undefined}
                              rel={item.external ? "noreferrer" : undefined}
                              onClick={closeMenu}
                            >
                              {content}
                            </a>
                          );
                        }

                        return (
                          <button
                            key={item.label}
                            role="menuitem"
                            type="button"
                            className={itemClass}
                            onClick={() => handleItemClick(item)}
                          >
                            {content}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </>
          )}
        </div>
      </div>

    </header>
  );
}
