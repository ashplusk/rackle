// ─── Rackle v2 · Profile ─────────────────────────────────────────────────────
// Account details, stats, history, and club affiliation.

import { useState } from "react";
import {
  ST, getProfile, setProfile, getHistory, getStreak, getStreakBadge,
  getBestIQ, getClubCode, setClubCode, writeSession, getTodayDailyResult, getDailySeed,
  getPlayerId, getLeaderboardDisplayName,
} from "../../engine/storage.js";
import { getIQTier } from "../../engine/scoring.js";
import { getClubs, postScore, removeLeaderboardScore } from "../../engine/leaderboard.js";

function splitName(name = "") {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

function joinName(firstName, lastName) {
  return [firstName, lastName].map(v => String(v || "").trim()).filter(Boolean).join(" ");
}

function updateStoredAccountProfile(profile) {
  const email = String(profile?.email || "").trim().toLowerCase();
  if (!email) return;
  const accounts = ST.get("accounts", {});
  if (!accounts[email]) return;
  accounts[email] = {
    ...accounts[email],
    profile: { ...accounts[email].profile, ...profile },
  };
  ST.set("accounts", accounts);
}

async function syncTodayLeaderboardName(profile) {
  const result = getTodayDailyResult();
  const score = result?.iqScore ?? result?.totalScore ?? null;
  if (score === null || score === undefined) return;
  await postScore({
    playerId: getPlayerId(),
    name: getLeaderboardDisplayName(profile),
    iqScore: score,
    timeSecs: result?.time ?? result?.timeSecs ?? result?.time_secs ?? null,
    clubCode: profile?.clubCode || profile?.club_code || getClubCode(),
    seed: result?.daySeed || result?.day_seed || getDailySeed(),
    profile,
  }).catch(() => false);
}

export default function Profile({ setScreen }) {
  const storedProfile = getProfile() || {};
  const split = splitName(storedProfile.name);
  const [profile, setProfileState] = useState(storedProfile);
  const [editing, setEditing] = useState(!storedProfile.name && !storedProfile.email);
  const [firstName, setFirstName] = useState(storedProfile.firstName || split.firstName || "");
  const [lastName, setLastName] = useState(storedProfile.lastName || split.lastName || "");
  const [email, setEmail] = useState(storedProfile.email || "");
  const [saveMsg, setSaveMsg] = useState("");

  const history = getHistory();
  const streak  = getStreak();
  const badge   = getStreakBadge(streak);
  const bestIQ  = getBestIQ();
  const clubs   = getClubs();
  const myCode  = getClubCode();
  const clubInfo = myCode ? clubs[myCode] : null;

  const avgIQ = history.length
    ? Math.round(history.reduce((s, h) => s + (h.iqScore || 0), 0) / history.length)
    : null;
  const totalGames = history.length;
  const displayName = profile.name || profile.email || "Rackle Player";
  const initial = displayName.charAt(0).toUpperCase();

  async function saveAccount(e) {
    e.preventDefault();
    const name = joinName(firstName, lastName);
    const cleanEmail = email.trim().toLowerCase();
    if (!name || name.length < 2) return;
    if (cleanEmail && !cleanEmail.includes("@")) return;
    const updated = {
      ...profile,
      playerId: profile.playerId || profile.player_id || getPlayerId(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name,
      email: cleanEmail || profile.email || "",
    };
    setProfile(updated);
    writeSession(updated);
    updateStoredAccountProfile(updated);
    await syncTodayLeaderboardName(updated);
    setProfileState(updated);
    setEditing(false);
    setSaveMsg("Saved");
    setTimeout(() => setSaveMsg(""), 2000);
  }

  async function leaveClub() {
    const previousClub = getClubCode();
    setClubCode(null);
    const updated = { ...profile, playerId: profile.playerId || profile.player_id || getPlayerId(), clubCode: null, clubName: null };
    setProfile(updated);
    writeSession(updated);
    updateStoredAccountProfile(updated);
    setProfileState(updated);

    const result = getTodayDailyResult();
    if (previousClub && result) {
      await removeLeaderboardScore({
        playerId: getPlayerId(),
        seed: result?.daySeed || result?.day_seed || getDailySeed(),
        clubCode: previousClub,
      }).catch(() => false);
    }
  }

  const recentGames = [...history].reverse().slice(0, 10);

  return (
    <div className="rk-profile">

      <div className="rk-profile__hero">
        <div className="rk-profile__avatar">{initial}</div>

        {editing ? (
          <form onSubmit={saveAccount} className="rk-profile__name-form rk-profile__account-form">
            <div className="rk-profile__account-grid">
              <input
                className="rk-input rk-profile__name-input"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                autoComplete="given-name"
                autoFocus
              />
              <input
                className="rk-input rk-profile__name-input"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </div>
            <input
              className="rk-input rk-profile__name-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
            <div className="rk-profile__name-actions">
              <button className="rk-btn rk-btn--primary" type="submit" disabled={joinName(firstName, lastName).length < 2}>
                Save account
              </button>
              {(profile.name || profile.email) && (
                <button className="rk-btn rk-btn--ghost" type="button" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="rk-profile__name-row">
            <div>
              <h1 className="rk-profile__name">{displayName}</h1>
              {profile.email && <p className="rk-profile__email">{profile.email}</p>}
            </div>
            <button
              className="rk-profile__edit-btn"
              onClick={() => { setEditing(true); }}
            >
              Edit
            </button>
          </div>
        )}

        {saveMsg && <p className="rk-profile__save-msg">{saveMsg}</p>}

        {clubInfo && (
          <div className="rk-profile__club-badge">
            <span className="rk-profile__club-name">{clubInfo.name}</span>
          </div>
        )}

        {streak > 0 && (
          <div className="rk-profile__streak">
            {badge ? `${badge.badge} ${badge.title}` : "🔥"} · {streak}-day streak
          </div>
        )}
      </div>

      <section className="rk-profile__stats">
        <h2 className="rk-sc__section-title">Your stats</h2>
        <div className="rk-progress__grid">
          <div className="rk-progress__stat">
            <div className="rk-progress__val">{totalGames}</div>
            <div className="rk-progress__key">games played</div>
          </div>
          <div className="rk-progress__stat">
            <div className="rk-progress__val">{streak > 0 ? `${streak}🔥` : "—"}</div>
            <div className="rk-progress__key">current streak</div>
          </div>
          <div className="rk-progress__stat">
            <div className="rk-progress__val" style={avgIQ ? { color: getIQTier(avgIQ).color } : {}}>
              {avgIQ ?? "—"}
            </div>
            <div className="rk-progress__key">avg IQ score</div>
          </div>
          <div className="rk-progress__stat">
            <div className="rk-progress__val" style={bestIQ ? { color: getIQTier(bestIQ).color } : {}}>
              {bestIQ ?? "—"}
            </div>
            <div className="rk-progress__key">best IQ score</div>
          </div>
        </div>
      </section>

      <section className="rk-profile__club">
        <h2 className="rk-sc__section-title">Club</h2>
        {clubInfo ? (
          <div className="rk-profile__club-card">
            <div className="rk-profile__club-info">
              <span className="rk-profile__club-card-name">{clubInfo.name}</span>
              {clubInfo.location && <span className="rk-profile__club-card-loc">{clubInfo.location}</span>}
            </div>
            <div className="rk-profile__club-actions">
              <button className="rk-btn rk-btn--secondary" onClick={() => setScreen?.("clubRoom")}>Club room →</button>
              <button className="rk-btn rk-btn--ghost rk-profile__leave" onClick={leaveClub}>Leave club</button>
            </div>
          </div>
        ) : (
          <div className="rk-profile__no-club">
            <p>You're not in a club yet. Join one to compete with your table every day.</p>
            <button className="rk-btn rk-btn--secondary" onClick={() => setScreen?.("clubDirectory")}>Find your club →</button>
          </div>
        )}
      </section>

      {recentGames.length > 0 && (
        <section className="rk-profile__history">
          <h2 className="rk-sc__section-title">Recent games</h2>
          <div className="rk-profile__history-list">
            {recentGames.map((g, i) => {
              const iq   = g.iqScore || g.totalScore || 0;
              const tier = getIQTier(iq);
              const date = g.completedDate || (g.ts ? new Date(g.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—");
              const isDaily = g.mode !== "practice";
              return (
                <div key={i} className="rk-profile__history-row">
                  <div className="rk-profile__history-meta">
                    <span className="rk-profile__history-date">{date}</span>
                    <span className={`rk-profile__history-mode ${isDaily ? "" : "rk-profile__history-mode--practice"}`}>
                      {isDaily ? "Daily" : "Practice"}
                    </span>
                  </div>
                  <div className="rk-profile__history-score" style={{ color: tier.color }}>{iq}</div>
                  <div className="rk-profile__history-tier">{tier.level}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
