// ─── Rackle v2 · Trust pages ────────────────────────────────────────────────
// Simple human-readable privacy, terms, and trust pages for launch.

const CONTACT_EMAIL = "hello@playrackle.com";

const PAGE_COPY = {
  privacy: {
    eyebrow: "Privacy",
    title: "Your table read should feel safe.",
    intro: "Rackle stores only what it needs to run the daily game, show fair leaderboards, and help clubs play together.",
    updated: "Last updated: May 2026",
    sections: [
      {
        title: "What Rackle stores",
        body: [
          "If you create an account, Rackle may store your email address, display name, club affiliation, Daily Rackle score, leaderboard rank, settings, and feedback you choose to send.",
          "If you play as a guest, Rackle may use local storage on your device to remember your guest play, scorecard, first-time intro state, and basic game preferences.",
        ],
      },
      {
        title: "Guest play",
        body: [
          "You can play without creating an account. Guest scores may appear on the Global board as Guest Rackler.",
          "Joining Rackle helps save your streak, table reads, display name, and club connection more reliably across sessions.",
        ],
      },
      {
        title: "Leaderboards",
        body: [
          "The Global board shows Daily Rackle scores. Club boards show scores for players connected to that club.",
          "Rackle should never show your email as your public display name. If no safe display name exists, Rackle falls back to Guest Rackler.",
          "If leaderboard name visibility is available in your settings, Rackle uses that preference where supported.",
        ],
      },
      {
        title: "Clubs",
        body: [
          "Joining or requesting a club may connect you to that club’s daily board.",
          "Club owner requests include the contact details you provide so we can help set up your table.",
        ],
      },
      {
        title: "Deletion requests",
        body: [
          `You can ask us to review or delete your Rackle account details by emailing ${CONTACT_EMAIL}.`,
          "Guest data may also live in your browser’s local storage. You can clear it from Settings or your browser.",
        ],
      },
      {
        title: "Data is not sold",
        body: [
          "Rackle does not sell personal data.",
        ],
      },
    ],
  },
  terms: {
    eyebrow: "Terms",
    title: "Simple rules for the daily table.",
    intro: "Rackle is a game and learning tool for American Mahjong players. These terms keep the experience fair, friendly, and useful.",
    updated: "Last updated: May 2026",
    sections: [
      {
        title: "Rackle is a game",
        body: [
          "Rackle scores are for fun, practice, and comparison with your table. They are not a guarantee of perfect Mahjong advice.",
          "The game engine, scoring, card-line logic, and feedback may change as Rackle improves.",
        ],
      },
      {
        title: "Use Rackle respectfully",
        body: [
          "Do not use abusive names, submit harmful feedback, interfere with the app, or try to manipulate leaderboards.",
          "Rackle may moderate display names, club requests, feedback, or leaderboard entries that harm the player experience.",
        ],
      },
      {
        title: "Accounts and clubs",
        body: [
          "You are responsible for the information you provide when creating an account, requesting a club, or submitting feedback.",
          "Club participation should reflect real player groups. We may review club requests before adding or promoting them.",
        ],
      },
      {
        title: "Gameplay updates",
        body: [
          "Rackle can update scoring, practice racks, Daily Rackle generation, leaderboard behavior, and share copy to improve the game.",
          "Practice scores do not count toward the daily leaderboard.",
        ],
      },
      {
        title: "Contact",
        body: [
          `If something looks wrong, email ${CONTACT_EMAIL} or use the feedback page in Rackle.`,
        ],
      },
    ],
  },
  trust: {
    eyebrow: "Trust",
    title: "Built for American Mahjong players.",
    intro: "Rackle is designed to make the Charleston feel clear, social, and believable. The game engine is tested before launch changes are shipped.",
    updated: "Launch trust notes",
    sections: [
      {
        title: "Scoring is tested",
        body: [
          "Rackle uses QA scenarios to check scoring, pass recommendations, incoming tile realism, rack validity, score distribution, and Daily Rackle stability.",
          "The goal is not to flatter every hand. The goal is to make the table read feel fair and useful.",
        ],
      },
      {
        title: "Charleston rules are protected",
        body: [
          "Jokers can appear in your rack, but they are never passed in Charleston receives.",
          "Rackle checks that complete game states keep 13 tiles and do not exceed legal tile counts.",
        ],
      },
      {
        title: "Leaderboards are kept clean",
        body: [
          "Daily scores are deduped to one score per player per day where possible.",
          "Practice scores do not post to the Global or Club leaderboard.",
          "Club boards only show club-affiliated players.",
        ],
      },
      {
        title: "Card-line logic can improve",
        body: [
          "Rackle includes structured card-line logic for the current card and reviews it through validation checks.",
          "If a player spots a mismatch or a table read that feels off, feedback is welcome and useful.",
        ],
      },
      {
        title: "Player feedback matters",
        body: [
          "Rackle is launch-hardening with real players and founding clubs. Reports about confusing hands, score trust, or club flow issues help make the game better.",
        ],
      },
    ],
  },
};

export default function TrustPages({ page = "privacy", setScreen }) {
  const copy = PAGE_COPY[page] || PAGE_COPY.privacy;

  return (
    <div className="rk-static-page">
      <section className="rk-static-hero">
        <p className="rk-room-pill rk-room-pill--practice"><span /> {copy.eyebrow}</p>
        <h1 className="rk-static-hero__title">{copy.title}</h1>
        <p className="rk-static-hero__intro">{copy.intro}</p>
        <p className="rk-static-hero__meta">{copy.updated}</p>
      </section>

      <section className="rk-static-grid" aria-label={`${copy.eyebrow} details`}>
        {copy.sections.map((section) => (
          <article className="rk-static-card" key={section.title}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        ))}
      </section>

      <section className="rk-static-contact">
        <h2>Questions?</h2>
        <p>Email us or send feedback from inside Rackle.</p>
        <div className="rk-static-actions">
          <a className="rk-btn rk-btn--secondary" href={`mailto:${CONTACT_EMAIL}`}>Email Rackle</a>
          <button type="button" className="rk-btn rk-btn--ghost" onClick={() => setScreen?.("feedback")}>Send feedback</button>
        </div>
      </section>
    </div>
  );
}
