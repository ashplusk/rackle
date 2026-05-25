// ─── Rackle v2 · Auth screens ────────────────────────────────────────────────
// Traditional local auth prototype plus Supabase password reset flow.

import { useEffect, useMemo, useState } from "react";
import {
  ST, getProfile, setProfile, writeSession, getTodayDailyResult, getDailySeed, getClubCode,
  getLeaderboardDisplayName,
} from "../../engine/storage.js";
import { migrateDailyLeaderboardIdentity } from "../../engine/leaderboard.js";
import { trackRackleEvent, getClubState } from "../../engine/analytics.js";
import {
  getRecoveryAccessTokenFromUrl,
  getResetPasswordRedirectUrl,
  isRecoveryLink,
  requestPasswordReset,
  updatePasswordWithAccessToken,
} from "../../engine/supabase.js";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function makePlayerId() {
  return `player-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function getStoredAccounts() {
  return ST.get("accounts", {});
}

function saveStoredAccounts(accounts) {
  ST.set("accounts", accounts || {});
}

function updateStoredAccountProfile(profile) {
  const cleanEmail = normalizeEmail(profile?.email);
  if (!cleanEmail) return;
  const accounts = getStoredAccounts();
  if (!accounts[cleanEmail]) return;
  accounts[cleanEmail] = {
    ...accounts[cleanEmail],
    profile: { ...accounts[cleanEmail].profile, ...profile },
  };
  saveStoredAccounts(accounts);
}

function updateStoredAccountPassword(email, password) {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail || !password) return false;

  const accounts = getStoredAccounts();
  if (!accounts[cleanEmail]) return false;

  accounts[cleanEmail] = {
    ...accounts[cleanEmail],
    password,
    updatedAt: Date.now(),
  };
  saveStoredAccounts(accounts);
  return true;
}

function currentGuestPlayerId() {
  const id = String(ST.get("playerId", "") || "").trim();
  return id && id.startsWith("guest-") ? id : null;
}

async function syncTodayScoreToProfile(profile, previousGuestId = null) {
  const result = getTodayDailyResult();
  const score = result?.iqScore ?? result?.totalScore ?? null;
  const playerId = String(profile?.playerId || profile?.player_id || "").trim();
  if (!playerId || score === null || score === undefined) return;

  await migrateDailyLeaderboardIdentity({
    fromPlayerId: previousGuestId,
    toPlayerId: playerId,
    name: getLeaderboardDisplayName(profile),
    iqScore: score,
    timeSecs: result?.time ?? result?.timeSecs ?? result?.time_secs ?? null,
    clubCode: profile?.clubCode || profile?.club_code || getClubCode(),
    seed: result?.daySeed || result?.day_seed || getDailySeed(),
    profile,
  }).catch(() => false);
}

function fullName(firstName, lastName) {
  return [firstName, lastName].map(v => String(v || "").trim()).filter(Boolean).join(" ");
}

function AuthShell({ children, mode, setScreen }) {
  const title =
    mode === "signup" ? "Create your Rackle account" :
    mode === "forgot" ? "Reset your password" :
    mode === "reset" ? "Choose a new password" :
    "Log in to Rackle";

  const copy =
    mode === "signup"
      ? "Save your streak, scorecards, club, and leaderboard progress."
      : mode === "forgot"
        ? "Enter your email and we’ll send reset instructions."
        : mode === "reset"
          ? "Enter a new password to get back to your Rackle table."
          : "Pick up your daily Charleston ritual where you left off.";

  return (
    <div className="rk-auth">
      <div className="rk-auth__bg" aria-hidden="true" />
      <section className="rk-auth__card" aria-label={title}>
        <button type="button" className="rk-auth__back" onClick={() => setScreen?.("home")}>← Back to Rackle</button>
        <div className="rk-auth__brand">
          <span className="rk-auth__wordmark">Rackle</span>
          <span className="rk-auth__tagline">The Daily Charleston Ritual</span>
        </div>
        <div className="rk-auth__intro">
          <p className="rk-auth__eyebrow">Account</p>
          <h1>{title}</h1>
          <p>{copy}</p>
        </div>
        {children}
      </section>
    </div>
  );
}

function AuthInlineState({ title, body }) {
  return (
    <div className="rk-inline-state" role="alert">
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}

const LOGIN_ERROR = {
  title: "That login did not work.",
  body: "Check your email and password, then try again.",
};

const SIGNUP_ERROR = {
  title: "Your account was not created.",
  body: "Try again, or use a different email.",
};

const FORGOT_ERROR = {
  title: "That email did not work.",
  body: "Enter the email connected to your Rackle account.",
};

const RESET_ERROR = {
  title: "Password was not updated.",
  body: "Open the latest reset link and try again.",
};

function LoginForm({ setScreen }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError(LOGIN_ERROR);
      return;
    }
    if (!password) {
      setError(LOGIN_ERROR);
      return;
    }

    const accounts = getStoredAccounts();
    const saved = accounts[cleanEmail];
    const existingProfile = getProfile() || {};
    const existingMatchesEmail = normalizeEmail(existingProfile.email) === cleanEmail;
    const previousGuestId = currentGuestPlayerId();

    if (saved && saved.password !== password) {
      setError(LOGIN_ERROR);
      return;
    }
    if (!saved && !existingMatchesEmail) {
      setError(LOGIN_ERROR);
      return;
    }

    const baseProfile = saved?.profile || {
      ...existingProfile,
      email: cleanEmail,
      name: existingProfile.name || cleanEmail,
      firstName: existingProfile.firstName || "",
      lastName: existingProfile.lastName || "",
      createdAt: existingProfile.createdAt || Date.now(),
    };
    const profile = {
      ...baseProfile,
      playerId: baseProfile.playerId || baseProfile.player_id || existingProfile.playerId || previousGuestId || makePlayerId(),
      email: cleanEmail,
    };

    setProfile(profile);
    writeSession(profile);
    updateStoredAccountProfile(profile);
    await syncTodayScoreToProfile(profile, previousGuestId);
    trackRackleEvent("login_completed", {
      source: "login",
      hasClub: Boolean(profile?.clubCode || profile?.club_code),
      isGuest: false,
      clubState: getClubState({ hasClub: Boolean(profile?.clubCode || profile?.club_code) }),
    });
    setScreen?.("home");
  }

  return (
    <form className="rk-auth__form" onSubmit={submit}>
      {error && <AuthInlineState title={error.title} body={error.body} />}
      <label className="rk-auth__field">
        <span>Email</span>
        <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
      </label>
      <label className="rk-auth__field">
        <span>Password</span>
        <input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" />
      </label>
      <button type="submit" className="rk-auth__primary">Log in</button>
      <div className="rk-auth__links">
        <button type="button" onClick={() => setScreen?.("forgot-password")}>Forgot password?</button>
        <button type="button" onClick={() => setScreen?.("signup")}>Create account</button>
      </div>
    </form>
  );
}

function SignupForm({ setScreen }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clubCode, setClubCodeInput] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    trackRackleEvent("signup_started", { source: "signup", isGuest: true, clubState: "none" });
  }, []);

  async function submit(e) {
    e.preventDefault();
    const name = fullName(firstName, lastName);
    const cleanEmail = normalizeEmail(email);
    const cleanClub = clubCode.trim().toUpperCase();

    if (!name) {
      setError(SIGNUP_ERROR);
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError(SIGNUP_ERROR);
      return;
    }
    if (password.length < 6) {
      setError(SIGNUP_ERROR);
      return;
    }
    if (password !== confirmPassword) {
      setError(SIGNUP_ERROR);
      return;
    }

    const accounts = getStoredAccounts();
    const previousGuestId = currentGuestPlayerId();
    const playerId = accounts[cleanEmail]?.profile?.playerId || previousGuestId || makePlayerId();
    const profile = {
      playerId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name,
      email: cleanEmail,
      clubCode: cleanClub || null,
      createdAt: Date.now(),
    };

    accounts[cleanEmail] = { password, profile, createdAt: accounts[cleanEmail]?.createdAt || Date.now() };
    saveStoredAccounts(accounts);
    setProfile(profile);
    writeSession(profile);
    await syncTodayScoreToProfile(profile, previousGuestId);
    trackRackleEvent("signup_completed", {
      source: "signup",
      hasClub: Boolean(cleanClub),
      isGuest: false,
      clubState: getClubState({ hasClub: Boolean(cleanClub) }),
    });
    setScreen?.("home");
  }

  return (
    <form className="rk-auth__form" onSubmit={submit}>
      {error && <AuthInlineState title={error.title} body={error.body} />}
      <div className="rk-auth__grid">
        <label className="rk-auth__field">
          <span>First name</span>
          <input type="text" autoComplete="given-name" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
        </label>
        <label className="rk-auth__field">
          <span>Last name</span>
          <input type="text" autoComplete="family-name" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
        </label>
      </div>
      <label className="rk-auth__field">
        <span>Email</span>
        <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
      </label>
      <label className="rk-auth__field">
        <span>Password</span>
        <input type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" />
      </label>
      <label className="rk-auth__field">
        <span>Confirm password</span>
        <input type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm your password" />
      </label>
      <label className="rk-auth__field">
        <span>Club code <em>optional</em></span>
        <input type="text" value={clubCode} onChange={e => setClubCodeInput(e.target.value)} placeholder="ApexMahjong" />
      </label>
      <p className="rk-auth__fineprint">By creating an account, you can save your streak, scorecards, and club leaderboard progress.</p>
      <button type="submit" className="rk-auth__primary">Create account</button>
      <div className="rk-auth__links rk-auth__links--center">
        <button type="button" onClick={() => setScreen?.("login")}>Already have an account? Log in</button>
      </div>
    </form>
  );
}

function ForgotPasswordForm({ setScreen }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError(FORGOT_ERROR);
      return;
    }

    setSending(true);
    setError(null);

    try {
      await requestPasswordReset(cleanEmail, getResetPasswordRedirectUrl());
      setSent(true);
      trackRackleEvent("password_reset_requested", { source: "forgot_password", isGuest: true });
    } catch (err) {
      setError({
        title: "Reset email was not sent.",
        body: err?.message || "Check your email and try again.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="rk-auth__form" onSubmit={submit}>
      {sent ? (
        <div className="rk-auth__success">
          <h2>Check your inbox.</h2>
          <p>We sent a reset link if that email has a Rackle account.</p>
          <p className="rk-auth__fineprint">The link will take you back to Rackle to choose a new password.</p>
        </div>
      ) : (
        <>
          {error && <AuthInlineState title={error.title} body={error.body} />}
          <label className="rk-auth__field">
            <span>Email</span>
            <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>
          <button type="submit" className="rk-auth__primary" disabled={sending}>
            {sending ? "Sending..." : "Send reset link"}
          </button>
        </>
      )}
      <div className="rk-auth__links rk-auth__links--center">
        <button type="button" onClick={() => setScreen?.("login")}>Back to login</button>
      </div>
    </form>
  );
}

function ResetPasswordForm({ setScreen }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState(() => normalizeEmail(ST.get("lastResetEmail", "")));
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const accessToken = useMemo(() => getRecoveryAccessTokenFromUrl(), []);

  useEffect(() => {
    if (!isRecoveryLink()) {
      setError({
        title: "Reset link is missing.",
        body: "Open the latest password reset email and try again.",
      });
    }
  }, []);

  async function submit(e) {
    e.preventDefault();

    if (!password || password.length < 6) {
      setError({ title: RESET_ERROR.title, body: "Password must be at least 6 characters." });
      return;
    }

    if (password !== confirmPassword) {
      setError({ title: RESET_ERROR.title, body: "Passwords do not match." });
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updatePasswordWithAccessToken(accessToken, password);

      // Keep the local prototype password in sync when the account is stored locally.
      if (email) updateStoredAccountPassword(email, password);

      setStatus("updated");
      trackRackleEvent("password_reset_completed", { source: "reset_password", isGuest: true });

      try {
        window.history.replaceState({}, "", "/login");
      } catch {
        // Ignore history cleanup failures.
      }
    } catch (err) {
      setError({
        title: RESET_ERROR.title,
        body: err?.message || RESET_ERROR.body,
      });
    } finally {
      setSaving(false);
    }
  }

  if (status === "updated") {
    return (
      <div className="rk-auth__form">
        <div className="rk-auth__success">
          <h2>Password updated.</h2>
          <p>You can now log in with your new password.</p>
        </div>
        <button type="button" className="rk-auth__primary" onClick={() => setScreen?.("login")}>
          Back to login
        </button>
      </div>
    );
  }

  return (
    <form className="rk-auth__form" onSubmit={submit}>
      {error && <AuthInlineState title={error.title} body={error.body} />}

      <label className="rk-auth__field">
        <span>Email <em>optional</em></span>
        <input type="email" autoComplete="email" value={email} onChange={e => setEmail(normalizeEmail(e.target.value))} placeholder="you@example.com" />
      </label>

      <label className="rk-auth__field">
        <span>New password</span>
        <input type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a new password" />
      </label>

      <label className="rk-auth__field">
        <span>Confirm new password</span>
        <input type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm your new password" />
      </label>

      <button type="submit" className="rk-auth__primary" disabled={saving || !accessToken}>
        {saving ? "Saving..." : "Update password"}
      </button>

      <div className="rk-auth__links rk-auth__links--center">
        <button type="button" onClick={() => setScreen?.("forgot-password")}>Send a new reset link</button>
      </div>
    </form>
  );
}

export default function Auth({ mode = "login", setScreen }) {
  const activeMode = mode === "signup" || mode === "forgot" || mode === "reset" ? mode : "login";

  return (
    <AuthShell mode={activeMode} setScreen={setScreen}>
      {activeMode === "signup" && <SignupForm setScreen={setScreen} />}
      {activeMode === "login" && <LoginForm setScreen={setScreen} />}
      {activeMode === "forgot" && <ForgotPasswordForm setScreen={setScreen} />}
      {activeMode === "reset" && <ResetPasswordForm setScreen={setScreen} />}
    </AuthShell>
  );
}
