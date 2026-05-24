// ─── Rackle v2 · ClubDirectory ───────────────────────────────────────────────
// Browse and join clubs. Enter a club code to affiliate.

import { useState, useMemo, useEffect } from "react";
import RackleState from "../shared/RackleState.jsx";
import { fetchClubs, getClubs, postScore } from "../../engine/leaderboard.js";
import { getProfile, setProfile, setClubCode, getClubCode, getTodayDailyResult, getPlayerId, getLeaderboardDisplayName, getDailySeed } from "../../engine/storage.js";
import { trackRackleEvent, getClubState } from "../../engine/analytics.js";

export default function ClubDirectory({ setScreen }) {
  const profile   = getProfile();
  const myCode    = getClubCode();

  const [clubs,     setClubs]     = useState(getClubs());
  const [search,    setSearch]    = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [joining,   setJoining]   = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joined,    setJoined]    = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    trackRackleEvent("club_directory_opened", {
      source: "club_directory",
      hasClub: Boolean(myCode),
      isGuest: !profile?.email,
      clubState: getClubState({ hasClub: Boolean(myCode) }),
    });
  }, []);

  useEffect(() => {
    let active = true;
    fetchClubs()
      .then(fresh => { if (active) { setClubs(fresh || {}); setLoadError(false); } })
      .catch((error) => {
        if (import.meta.env?.DEV) console.warn("club directory load failed", error);
        if (active) setLoadError(true);
      });
    return () => { active = false; };
  }, []);

  const clubList = useMemo(() => {
    const entries = Object.entries(clubs).map(([code, info]) => ({ code, ...info }));
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q) ||
      c.code?.toLowerCase().includes(q)
    );
  }, [clubs, search]);

  async function backfillTodayClubScore(code, nextProfile) {
    const result = getTodayDailyResult();
    const score = result?.iqScore ?? result?.totalScore ?? null;
    if (score === null || score === undefined) return;
    await postScore({
      playerId: getPlayerId(),
      name: getLeaderboardDisplayName(nextProfile),
      iqScore: score,
      timeSecs: result?.time ?? result?.timeSecs ?? result?.time_secs ?? null,
      clubCode: code,
      seed: result?.daySeed || result?.day_seed || getDailySeed(),
      profile: nextProfile,
    }).catch(() => false);
  }

  async function handleJoinCode(e) {
    e.preventDefault();
    const code = codeInput.trim();
    if (!code) return;
    setJoining(true);
    setJoinError("");

    // Reload clubs from Supabase to verify code
    await fetchClubs().catch(() => {});
    const freshClubs = getClubs();
    setClubs(freshClubs || {});
    const info = freshClubs[code];

    if (!info) {
      setJoinError(`Club code "${code}" not found. Check the code and try again.`);
      setJoining(false);
      return;
    }

    // Save
    setClubCode(code);
    const p = profile || {};
    const nextProfile = { ...p, clubCode: code, clubName: info.name };
    setProfile(nextProfile);
    await backfillTodayClubScore(code, nextProfile);
    setJoined({ code, name: info.name });
    setJoining(false);
  }

  async function handleJoinCard(code) {
    const info = clubs[code];
    setClubCode(code);
    const p = profile || {};
    const nextProfile = { ...p, clubCode: code, clubName: info.name };
    setProfile(nextProfile);
    await backfillTodayClubScore(code, nextProfile);
    setJoined({ code, name: info.name });
  }

  if (joined) {
    return (
      <div className="rk-club-dir rk-club-dir--joined">
        <div className="rk-club-dir__joined-card">
          <div className="rk-club-dir__joined-icon">🀄</div>
          <h2 className="rk-club-dir__joined-title">Welcome to {joined.name}!</h2>
          <p className="rk-club-dir__joined-sub">
            Your daily score will now appear on your club board when you play.
          </p>
          <button className="rk-btn rk-btn--primary rk-btn--full" onClick={() => setScreen?.("clubRoom")}>
            Go to club room →
          </button>
          <button className="rk-btn rk-btn--ghost" onClick={() => setScreen?.("home")}>
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rk-club-dir">

      {/* ── Code entry ───────────────────────────────────────────────────── */}
      <div className="rk-club-dir__code-section">
        <h1 className="rk-section-title">Join a club</h1>
        <p className="rk-club-dir__sub">
          Got a club code? Enter it below to join instantly. If your club is not listed yet, start a founding club room below.
        </p>
        <p className="rk-club-dir__context">
          Rackle clubs let your Mahjong group play the same daily rack, compare table reads, and build a daily club board together.
        </p>
        <form onSubmit={handleJoinCode} className="rk-club-dir__code-form">
          <input
            className="rk-input"
            type="text"
            placeholder="Enter club code…"
            value={codeInput}
            onChange={e => { setCodeInput(e.target.value); setJoinError(""); }}
            maxLength={12}
            autoCapitalize="none"
          />
          <button
            className="rk-btn rk-btn--primary"
            type="submit"
            disabled={!codeInput.trim() || joining}
          >
            {joining ? "Joining…" : "Join"}
          </button>
        </form>
        {joinError && <p className="rk-club-dir__error">{joinError}</p>}
      </div>

      {loadError && (
        <RackleState
          eyebrow="Club directory"
          title="The room is still setting up."
          body="Try opening the club directory again."
          primaryLabel="Reload clubs"
          onPrimary={() => { setLoadError(false); fetchClubs().then(fresh => setClubs(fresh || {})).catch(() => setLoadError(true)); }}
          secondaryLabel="Back home"
          onSecondary={() => setScreen?.("home")}
        />
      )}

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div className="rk-club-dir__divider">
        <span>or browse all clubs</span>
      </div>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <div className="rk-club-dir__search-wrap">
        <input
          className="rk-input"
          type="search"
          placeholder="Search clubs by name or location…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── Club list ────────────────────────────────────────────────────── */}
      <div className="rk-club-dir__list">
        {clubList.length === 0 && (
          <div className="rk-club-dir__none-card">
            <p className="rk-club-dir__none">No clubs match "{search}".</p>
            <button type="button" className="rk-club-dir__email-link rk-club-dir__email-link--button" onClick={() => setScreen?.("foundingClubs")}>
              Start a founding club →
            </button>
          </div>
        )}
        {clubList.map(club => (
          <div
            key={club.code}
            className={`rk-club-dir__card ${myCode === club.code ? "rk-club-dir__card--current" : ""}`}
          >
            <div className="rk-club-dir__card-info">
              <span className="rk-club-dir__card-name">
                {club.emoji && <span className="rk-club-dir__card-emoji">{club.emoji}</span>}
                {club.name}
                {myCode === club.code && (
                  <span className="rk-club-dir__card-current"> · Your club</span>
                )}
              </span>
              {club.location && (
                <span className="rk-club-dir__card-location">{club.location}</span>
              )}
              <span className="rk-club-dir__card-code">Code: {club.code}</span>
            </div>
            {myCode !== club.code && (
              <button
                className="rk-btn rk-btn--secondary rk-club-dir__card-btn"
                onClick={() => handleJoinCard(club.code)}
              >
                Join
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="rk-club-dir__signup-card">
        <div>
          <span>Don’t see your club?</span>
          <p>Start a founding club request and we’ll help get your Mahjong group set up on Rackle.</p>
        </div>
        <button type="button" onClick={() => setScreen?.("foundingClubs")}>
          Start a founding club →
        </button>
      </div>

    </div>
  );
}
