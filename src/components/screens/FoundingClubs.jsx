// ─── Rackle v2 · Founding Clubs ──────────────────────────────────────────────
// Launch-ready club owner guide, invite copy, and feedback surface.

import { useMemo, useState } from "react";
import { trackRackleEvent } from "../../engine/analytics.js";

const PLAY_URL = "https://playrackle.com";

function CopyBlock({ title, description, text, copyType = "club_invite" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      trackRackleEvent("club_invite_copy_clicked", { source: "founding_clubs", copyType, shareMethod: "copy", clubState: "pending" });
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      if (import.meta.env?.DEV) console.warn("club invite copy failed", error);
      setCopied(false);
    }
  }

  return (
    <article className="rk-founding-copy-card">
      <div className="rk-founding-copy-card__head">
        <div>
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>
        <button type="button" className="rk-btn rk-btn--secondary" onClick={handleCopy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>{text}</pre>
    </article>
  );
}

export default function FoundingClubs({ setScreen }) {
  const smsCopy = useMemo(() => [
    "Our Mahjong group is trying Rackle, a daily Charleston challenge.",
    "",
    "Play today’s rack and compare your table read:",
    PLAY_URL,
  ].join("\n"), []);

  const emailCopy = useMemo(() => [
    "Hi everyone,",
    "",
    "We’re going to try Rackle as a daily table challenge for our Mahjong group.",
    "",
    "It gives everyone the same Charleston rack, asks you to make three passes, then gives you a Rackle IQ score and a table read.",
    "",
    "Play today’s rack here:",
    PLAY_URL,
    "",
    "Once our club room is active, we’ll be able to compare scores on our own club board.",
  ].join("\n"), []);

  return (
    <div className="rk-founding-page">
      <section className="rk-founding-hero">
        <p className="rk-room-pill rk-room-pill--club"><span /> Founding clubs</p>
        <h1>Bring your Mahjong group to the daily table.</h1>
        <p>
          Start a club room, invite your players, and turn today’s Charleston read into a friendly table chase.
        </p>
        <div className="rk-founding-hero__actions">
          <button type="button" className="rk-btn rk-btn--primary" onClick={() => setScreen?.("clubSignup")}>Start a founding club</button>
          <button type="button" className="rk-btn rk-btn--ghost" onClick={() => setScreen?.("clubDirectory")}>Browse club directory</button>
        </div>
      </section>

      <section className="rk-founding-steps" aria-label="Founding club launch steps">
        {[
          ["1", "Request your club", "Tell us your club name, location, owner contact, and expected players."],
          ["2", "Invite your table", "Use the SMS, WhatsApp, email, or QR copy below to bring players in."],
          ["3", "Play today’s Rackle", "Guests and logged-in players can complete the same daily Charleston rack."],
          ["4", "Fill the club board", "Club-affiliated players appear on your private club board and Global stays clean."],
        ].map(([num, title, body]) => (
          <article className="rk-founding-step" key={num}>
            <span>{num}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="rk-founding-invite" aria-labelledby="founding-invite-title">
        <div className="rk-founding-section-head">
          <p className="rk-room-pill rk-room-pill--club"><span /> Invite copy</p>
          <h2 id="founding-invite-title">Send this to your table.</h2>
          <p>Keep it simple. Players just need the link, the daily rack, and a reason to compare scores.</p>
        </div>
        <CopyBlock
          title="SMS / WhatsApp invite"
          description="Best for group chats and club text threads."
          text={smsCopy}
          copyType="sms_whatsapp"
        />
        <CopyBlock
          title="Email invite"
          description="Best for club admins sending to a member list."
          text={emailCopy}
          copyType="email"
        />
      </section>

      <section className="rk-founding-qr-card" aria-label="QR placeholder">
        <div className="rk-founding-qr-card__box">QR</div>
        <div>
          <p className="rk-room-pill rk-room-pill--practice"><span /> Table card</p>
          <h2>Print this for your Mahjong table.</h2>
          <p>Scan to play today’s Rackle. Pass three tiles. Get your Rackle IQ. Compare with your table.</p>
        </div>
      </section>

      <section className="rk-founding-feedback">
        <div>
          <h2>Trying Rackle with a club?</h2>
          <p>Tell us what worked, what confused players, and what would make the club board better.</p>
        </div>
        <button type="button" className="rk-btn rk-btn--secondary" onClick={() => setScreen?.("feedback", { type: "club" })}>Send club feedback</button>
      </section>
    </div>
  );
}
