// ─── Rackle v2 · Club signup ─────────────────────────────────────────────────
// Simple founding club intake flow using mailto until backend intake exists.

import { useEffect, useMemo, useState } from "react";
import { trackRackleEvent } from "../../engine/analytics.js";

function encode(value) {
  return encodeURIComponent(String(value || ""));
}

function cleanUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.startsWith("http://") || text.startsWith("https://") || text.startsWith("@")) return text;
  return text.includes(".") ? `https://${text}` : text;
}

export default function ClubSignup({ setScreen }) {
  const [clubName, setClubName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [players, setPlayers] = useState("");
  const [webOrInstagram, setWebOrInstagram] = useState("");
  const [notes, setNotes] = useState("");
  const [sendError, setSendError] = useState(false);
  const [sent, setSent] = useState(false);

  const location = [city.trim(), state.trim()].filter(Boolean).join(", ");
  const cleanedWeb = cleanUrl(webOrInstagram);

  useEffect(() => {
    trackRackleEvent("club_signup_started", { source: "club_signup", clubState: "pending" });
  }, []);

  const mailto = useMemo(() => {
    const subject = `Sign my club up for Rackle${clubName ? `: ${clubName}` : ""}`;
    const body = [
      "Club signup request",
      "",
      `Club name: ${clubName}`,
      `City: ${city}`,
      `State: ${state}`,
      `Club owner/admin: ${ownerName}`,
      `Email: ${email}`,
      `Expected players: ${players}`,
      `Instagram / website: ${cleanedWeb}`,
      "",
      "Notes:",
      notes,
    ].join("\n");
    return `mailto:hello@playrackle.com?subject=${encode(subject)}&body=${encode(body)}`;
  }, [clubName, city, state, ownerName, email, players, cleanedWeb, notes]);

  function validateForm() {
    const required = [clubName, city, state, ownerName, email];
    const hasRequired = required.every(value => String(value || "").trim().length > 1);
    const hasEmail = email.trim().includes("@") && email.trim().includes(".");
    return hasRequired && hasEmail;
  }

  function handleClubRequest(event) {
    event?.preventDefault?.();
    setSendError(false);
    if (!validateForm()) {
      setSendError(true);
      return;
    }
    try {
      window.location.href = mailto;
      trackRackleEvent("club_signup_submitted", { source: "club_signup", clubState: "pending" });
      setSent(true);
    } catch (error) {
      if (import.meta.env?.DEV) console.warn("club signup mailto failed", error);
      setSendError(true);
    }
  }

  if (sent) {
    return (
      <div className="rk-club-signup-page">
        <section className="rk-club-signup-card rk-club-signup-card--success">
          <p className="rk-room-pill rk-room-pill--club-directory"><span /> Founding club</p>
          <h1 className="rk-club-signup-card__title">Your club request is in.</h1>
          <p className="rk-club-signup-card__sub">We’ll help you get your table set up.</p>
          <div className="rk-club-signup-summary">
            <span>{clubName}</span>
            <strong>{location}</strong>
            {players && <small>{players} expected players</small>}
          </div>
          <div className="rk-club-signup-actions">
            <button className="rk-btn rk-btn--primary rk-btn--full" type="button" onClick={() => setScreen?.("foundingClubs")}>Invite your table</button>
            <button className="rk-btn rk-btn--ghost" type="button" onClick={() => setScreen?.("clubDirectory")}>Back to directory</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="rk-club-signup-page">
      <section className="rk-club-signup-card">
        <p className="rk-room-pill rk-room-pill--club-directory"><span /> Founding club</p>
        <h1 className="rk-club-signup-card__title">Bring your Mahjong group to the daily table.</h1>
        <p className="rk-club-signup-card__sub">
          Request a club room, invite your players, and let your table compare the same daily Charleston read.
        </p>

        <div className="rk-club-signup-points" aria-label="Club benefits">
          <span>Club directory listing</span>
          <span>Private club board</span>
          <span>Invite copy ready</span>
        </div>

        <form className="rk-club-signup-form" onSubmit={handleClubRequest} noValidate>
          <label><span>Club name</span><input value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="Apex Mahjong Club" required /></label>
          <label><span>City</span><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Apex" required /></label>
          <label><span>State</span><input value={state} onChange={(e) => setState(e.target.value)} placeholder="NC" required /></label>
          <label><span>Club owner/admin name</span><input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Your name" required /></label>
          <label><span>Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label>
          <label><span>Expected number of players</span><input value={players} onChange={(e) => setPlayers(e.target.value)} placeholder="10-25" /></label>
          <label><span>Instagram / website</span><input value={webOrInstagram} onChange={(e) => setWebOrInstagram(e.target.value)} placeholder="@yourclub or yourclub.com" /></label>
          <label className="rk-club-signup-form__full"><span>Notes</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tell us when your group plays, how many regular players you have, or anything we should know." rows={5} /></label>
        </form>

        {sendError && (
          <div className="rk-inline-state" role="alert">
            <strong>Your club request did not send.</strong>
            <span>Try again, or email us directly and we’ll help set up your table.</span>
            <div className="rk-state-card__actions">
              <button type="button" className="rk-btn rk-btn--secondary" onClick={() => setSendError(false)}>Try again</button>
              <a className="rk-btn rk-btn--ghost" href={mailto}>Email Rackle</a>
            </div>
          </div>
        )}

        <div className="rk-club-signup-actions">
          <button className="rk-btn rk-btn--primary rk-btn--full" type="button" onClick={handleClubRequest}>Email club request</button>
          <button className="rk-btn rk-btn--ghost" type="button" onClick={() => setScreen?.("foundingClubs")}>Back to founding clubs</button>
        </div>
      </section>
    </div>
  );
}
