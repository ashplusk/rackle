// ─── Rackle v2 · Settings ────────────────────────────────────────────────────
// Premium player controls for table feel, sharing, account, and local data.

import { useEffect, useState } from "react";
import { getProfile, getClubCode, logout } from "../../engine/storage.js";
import { trackRackleEvent, getClubState } from "../../engine/analytics.js";

const TILE_SIZE_KEY = "rackleTileSize";
const SOUND_KEY = "rackleSoundEnabled";
const HAPTICS_KEY = "rackleHapticsEnabled";
const SHOW_NAME_KEY = "rackleShowNameOnLeaderboard";
const SHARE_TONE_KEY = "rackleShareTone";

const tileSizes = [
  { value: "small", label: "Small" },
  { value: "regular", label: "Regular" },
  { value: "large", label: "Large" },
];

const shareTones = [
  { value: "friendly", label: "Friendly" },
  { value: "competitive", label: "Competitive" },
  { value: "club", label: "Club" },
];

function readLocal(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function readBool(key, fallback) {
  const value = readLocal(key, null);
  if (value === null) return fallback;
  return value === "true";
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, String(value));
    return true;
  } catch (error) {
    if (import.meta.env?.DEV) console.warn("settings save failed", error);
    return false;
  }
}

function applyTileSize(value) {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.rackleTileSize = value || "regular";
  }
}

function SettingsToast({ message }) {
  if (!message) return null;
  return <div className="rk-settings-toast" role="status">{message}</div>;
}

function SettingCard({ eyebrow, title, copy, children }) {
  return (
    <section className="rk-settings-card">
      <div className="rk-settings-card__head">
        <span className="rk-settings-card__eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {copy && <p>{copy}</p>}
      </div>
      <div className="rk-settings-card__body">{children}</div>
    </section>
  );
}

function SettingsRow({ label, value, onClick, children, danger = false, info = false }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      className={`rk-settings-row ${danger ? "rk-settings-row--danger" : ""} ${info ? "rk-settings-row--info" : ""}`}
      onClick={onClick}
    >
      <span className="rk-settings-row__text">
        <span className="rk-settings-row__label">{label}</span>
        {value && <span className="rk-settings-row__value">{value}</span>}
      </span>
      {children || (onClick ? <span className="rk-settings-row__chevron">›</span> : null)}
    </Tag>
  );
}

function SegmentedControl({ label, value, options, onChange, ariaLabel }) {
  return (
    <div className="rk-settings-segment" aria-label={ariaLabel || label}>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          className={`rk-settings-segment__button ${value === option.value ? "is-active" : ""}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`rk-settings-toggle ${checked ? "is-on" : ""}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span />
    </button>
  );
}

export default function Settings({ setScreen }) {
  const profile = getProfile() || {};
  const isLoggedIn = Boolean(profile.name || profile.email || profile.playerId || profile.player_id);
  const [tileSize, setTileSize] = useState(() => readLocal(TILE_SIZE_KEY, "regular"));
  const [soundOn, setSoundOn] = useState(() => readBool(SOUND_KEY, true));
  const [hapticsOn, setHapticsOn] = useState(() => readBool(HAPTICS_KEY, true));
  const [showName, setShowName] = useState(() => readBool(SHOW_NAME_KEY, true));
  const [shareTone, setShareTone] = useState(() => readLocal(SHARE_TONE_KEY, "friendly"));
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState("");
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    applyTileSize(tileSize);
  }, [tileSize]);

  function saveSetting(key, value, setter) {
    setter(value);
    const saved = writeLocal(key, value);
    if (key === TILE_SIZE_KEY) applyTileSize(value);
    if (!saved) {
      setSaveError(true);
      setToast("");
      return;
    }
    setSaveError(false);
    trackRackleEvent("settings_saved", {
      source: "settings",
      hasClub: Boolean(getClubCode()),
      isGuest: !profile?.email,
      clubState: getClubState({ hasClub: Boolean(getClubCode()) }),
    });
    setToast("Settings saved.");
    window.clearTimeout(saveSetting._timer);
    saveSetting._timer = window.setTimeout(() => setToast(""), 1400);
  }

  function handleReset() {
    try {
      const preservedAccounts = localStorage.getItem("rk-accounts");
      const keys = Object.keys(localStorage).filter((k) => k.startsWith("rk-") || k.startsWith("rackle"));
      keys.forEach((k) => {
        if (k !== "rk-accounts") localStorage.removeItem(k);
      });
      if (preservedAccounts) localStorage.setItem("rk-accounts", preservedAccounts);
    } catch {
      // Local storage may not be available in private browsing.
    }
    applyTileSize("regular");
    setConfirmReset(false);
    setToast("Rackle data reset.");
    window.setTimeout(() => setScreen?.("home"), 900);
  }

  const version = "2.0.0";
  const displayName = profile.name || profile.displayName || profile.email || "Guest Rackler";
  const clubLabel = profile.clubName || (getClubCode() ? `Code: ${getClubCode()}` : "No club joined");

  return (
    <div className="rk-settings rk-settings--premium">
      <header className="rk-settings-hero">
        <span className="rk-settings-hero__pill">TABLE SETTINGS</span>
        <h1 className="rk-settings__title">Settings</h1>
        <p>Tune your table, profile, and Rackle experience.</p>
      </header>

      {!isLoggedIn && (
        <section className="rk-settings-login-card">
          <div>
            <span>Playing as Guest Rackler</span>
            <p>Log in to save scorecards and streaks across devices.</p>
          </div>
          <button type="button" className="rk-settings-login-card__button" onClick={() => setScreen?.("login")}>Log in</button>
        </section>
      )}

      {saveError && (
        <div className="rk-inline-state" role="alert">
          <strong>Settings did not save.</strong>
          <span>Try again in a moment.</span>
          <button type="button" className="rk-btn rk-btn--secondary" onClick={() => setSaveError(false)}>Retry</button>
        </div>
      )}

      <SettingCard eyebrow="Account" title="Your table identity" copy="Keep your name, club, and account details close to the board.">
        <SettingsRow label="Profile" value={displayName} onClick={() => setScreen?.("profile")} />
        <SettingsRow label="Club" value={clubLabel} onClick={() => setScreen?.("clubDirectory")} />
        <SettingsRow
          label={isLoggedIn ? "Log out" : "Log in"}
          value={isLoggedIn ? "Sign out of this device" : "Save your streak and scorecards"}
          onClick={() => {
            if (isLoggedIn) {
              trackRackleEvent("logout_clicked", {
                source: "settings",
                hasClub: Boolean(getClubCode()),
                isGuest: false,
                clubState: getClubState({ hasClub: Boolean(getClubCode()) }),
              });
              logout();
            }
            setScreen?.("login");
          }}
        />
      </SettingCard>

      <SettingCard eyebrow="Gameplay" title="Table feel" copy="Set the tile size and table feedback that feels best on your screen.">
        <div className="rk-settings-control-block">
          <div>
            <span className="rk-settings-control-block__label">Tile size</span>
            <p>Choose the tile size that feels best on your screen.</p>
          </div>
          <SegmentedControl
            value={tileSize}
            options={tileSizes}
            ariaLabel="Tile size"
            onChange={(value) => saveSetting(TILE_SIZE_KEY, value, setTileSize)}
          />
        </div>
        <SettingsRow label="Sound effects" value="Soft tile taps and table moments.">
          <Toggle checked={soundOn} label="Sound effects" onChange={(value) => saveSetting(SOUND_KEY, value, setSoundOn)} />
        </SettingsRow>
        <SettingsRow label="Haptics" value="Gentle feedback when selecting tiles.">
          <Toggle checked={hapticsOn} label="Haptics" onChange={(value) => saveSetting(HAPTICS_KEY, value, setHapticsOn)} />
        </SettingsRow>
        <SettingsRow label="Practice preferences" value="Practice stays separate from your daily board." info />
      </SettingCard>

      <SettingCard eyebrow="Social" title="Sharing and boards" copy="Choose how you show up when you share a score or join the chase.">
        <div className="rk-settings-control-block">
          <div>
            <span className="rk-settings-control-block__label">Default share message</span>
            <p>Choose how your shared score sounds.</p>
          </div>
          <SegmentedControl
            value={shareTone}
            options={shareTones}
            ariaLabel="Default share message"
            onChange={(value) => saveSetting(SHARE_TONE_KEY, value, setShareTone)}
          />
        </div>
        <SettingsRow label="Show my name on leaderboards" value="Turn this off to appear as Guest Rackler.">
          <Toggle checked={showName} label="Show my name on leaderboards" onChange={(value) => saveSetting(SHOW_NAME_KEY, value, setShowName)} />
        </SettingsRow>
        <SettingsRow label="Club invite link" value="Invite your table from the club directory." onClick={() => setScreen?.("clubDirectory")} />
      </SettingCard>

      <SettingCard eyebrow="Data" title="Local data and support" copy="Control what stays on this device and send feedback when something feels off.">
        <SettingsRow label="Data storage" value="Stored locally on this device. Logged-in players can save more across devices." info />
        <SettingsRow label="Send feedback" value="Tell us what felt confusing, broken, or off." onClick={() => setScreen?.("feedback")} />
        <SettingsRow label="Reset all data" value="Clears history, streak, profile, and practice data from this device." danger onClick={() => setConfirmReset(true)} />
      </SettingCard>

      <SettingCard eyebrow="About" title="Rackle" copy={`Version ${version} · Daily American Mahjong`}>
        <SettingsRow label="Scoring" value="Built around NMJL-style Charleston table reads." info />
      </SettingCard>

      {confirmReset && (
        <div className="rk-settings-modal" role="dialog" aria-modal="true" aria-labelledby="rk-reset-title">
          <div className="rk-settings-modal__panel">
            <span className="rk-settings-modal__eyebrow">RESET DATA</span>
            <h2 id="rk-reset-title">Reset Rackle data?</h2>
            <p>This clears your local history, streak, profile, and practice data from this device. Your saved login stays available on this device.</p>
            <div className="rk-settings-modal__actions">
              <button type="button" className="rk-settings-modal__button rk-settings-modal__button--secondary" onClick={() => setConfirmReset(false)}>Cancel</button>
              <button type="button" className="rk-settings-modal__button rk-settings-modal__button--danger" onClick={handleReset}>Reset data</button>
            </div>
          </div>
        </div>
      )}

      <SettingsToast message={toast} />
    </div>
  );
}
