// ─── Rackle v2 · Feedback ────────────────────────────────────────────────────
// Lightweight launch feedback form for founding players and clubs.

import { useEffect, useMemo, useState } from "react";
import { getProfile, getClubCode, getTodayDailyResult } from "../../engine/storage.js";
import { trackRackleEvent, getScoreBand, getClubState } from "../../engine/analytics.js";

function encode(value) {
  return encodeURIComponent(String(value || ""));
}

export default function Feedback({ setScreen, type = "general" }) {
  const profile = useMemo(() => getProfile() || {}, []);
  const clubCode = getClubCode();
  const todayResult = getTodayDailyResult();
  const [feltFair, setFeltFair] = useState("");
  const [wouldReturn, setWouldReturn] = useState("");
  const [shared, setShared] = useState("");
  const [message, setMessage] = useState("");
  const [sendError, setSendError] = useState(false);
  const [sendReady, setSendReady] = useState(false);
  const isClubFeedback = type === "club";

  useEffect(() => {
    trackRackleEvent("feedback_started", {
      source: isClubFeedback ? "club_feedback" : "feedback",
      hasClub: Boolean(clubCode),
      isGuest: !profile?.email,
      clubState: getClubState({ hasClub: Boolean(clubCode) }),
      scoreBand: todayResult?.iqScore ? getScoreBand(todayResult.iqScore) : undefined,
    });
  }, [isClubFeedback, clubCode, profile?.email, todayResult?.iqScore]);

  const mailto = useMemo(() => {
    const subject = isClubFeedback ? "Rackle club feedback" : "Rackle feedback";
    const body = [
      isClubFeedback ? "Rackle club feedback" : "Rackle feedback",
      "",
      `Name: ${profile.name || ""}`,
      `Email: ${profile.email || ""}`,
      `Club code: ${clubCode || ""}`,
      `Today’s score: ${todayResult?.iqScore || ""}`,
      "",
      `Did the score feel fair? ${feltFair}`,
      `Would you play tomorrow? ${wouldReturn}`,
      `Did you share it? ${shared}`,
      "",
      "What felt confusing, fun, unfair, or missing?",
      message,
    ].join("\n");
    return `mailto:hello@playrackle.com?subject=${encode(subject)}&body=${encode(body)}`;
  }, [profile, clubCode, todayResult, feltFair, wouldReturn, shared, message, isClubFeedback]);

  function handleSendFeedback() {
    setSendError(false);
    try {
      window.location.href = mailto;
      trackRackleEvent("feedback_submitted", {
        source: isClubFeedback ? "club_feedback" : "feedback",
        hasClub: Boolean(clubCode),
        isGuest: !profile?.email,
        clubState: getClubState({ hasClub: Boolean(clubCode) }),
        scoreBand: todayResult?.iqScore ? getScoreBand(todayResult.iqScore) : undefined,
      });
      setSendReady(true);
    } catch (error) {
      if (import.meta.env?.DEV) console.warn("feedback mailto failed", error);
      setSendError(true);
    }
  }

  return (
    <div className="rk-feedback-page">
      <section className="rk-feedback-card">
        <p className="rk-room-pill rk-room-pill--practice"><span /> Founding feedback</p>
        <h1 className="rk-feedback-card__title">{isClubFeedback ? "Help make the club room sharper." : "Help make Rackle sharper."}</h1>
        <p className="rk-feedback-card__sub">
          {isClubFeedback
            ? "Tell us how the club flow felt, what players needed, and what would make your table easier to invite."
            : "Tell us what felt right, what felt off, and whether the score matched your table read."}
        </p>

        <div className="rk-feedback-grid" role="group" aria-label="Quick feedback prompts">
          <label>
            <span>Did your score feel fair?</span>
            <select value={feltFair} onChange={(e) => setFeltFair(e.target.value)}>
              <option value="">Choose one</option>
              <option>Yes</option>
              <option>Mostly</option>
              <option>Not really</option>
            </select>
          </label>
          <label>
            <span>Would you play tomorrow?</span>
            <select value={wouldReturn} onChange={(e) => setWouldReturn(e.target.value)}>
              <option value="">Choose one</option>
              <option>Yes</option>
              <option>Maybe</option>
              <option>No</option>
            </select>
          </label>
          <label>
            <span>Did you share your score?</span>
            <select value={shared} onChange={(e) => setShared(e.target.value)}>
              <option value="">Choose one</option>
              <option>Yes</option>
              <option>Not yet</option>
              <option>No</option>
            </select>
          </label>
        </div>

        <label className="rk-feedback-message">
          <span>Your notes</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isClubFeedback ? "Example: I wanted a clearer invite link for my group chat." : "Example: My score felt high because I picked Consecutive Run, but the hand clearly leaned Winds."}
            rows={6}
          />
        </label>

        {sendError && (
          <div className="rk-inline-state" role="alert">
            <strong>Your note did not send.</strong>
            <span>Try again in a moment.</span>
            <button type="button" className="rk-btn rk-btn--secondary" onClick={() => setSendError(false)}>Try again</button>
          </div>
        )}

        {sendReady && (
          <div className="rk-inline-state" role="status">
            <strong>Your feedback email is ready.</strong>
            <span>Send it from your email app when it opens.</span>
          </div>
        )}

        <div className="rk-feedback-actions">
          <button className="rk-btn rk-btn--primary rk-btn--full" type="button" onClick={handleSendFeedback}>Send feedback</button>
          <button className="rk-btn rk-btn--ghost" type="button" onClick={() => setScreen?.("home")}>Back to Rackle</button>
        </div>
      </section>
    </div>
  );
}
