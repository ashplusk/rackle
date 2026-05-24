// ─── Rackle v2 · Footer ───────────────────────────────────────────────────────

function InstagramGlyph() {
  return (
    <svg
      className="rk-footer-action__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.7" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.1" cy="6.9" r="1.05" fill="currentColor" />
    </svg>
  );
}

export default function Footer({ setScreen }) {
  return (
    <footer className="rk-footer" role="contentinfo">
      <div className="rk-footer-inner">
        <div className="rk-footer-actions" aria-label="Footer navigation">
          <a href="mailto:hello@playrackle.com" className="rk-footer-action">Contact</a>
          <button type="button" className="rk-footer-action rk-footer-action--button" onClick={() => setScreen?.("clubDirectory")}>Clubs</button>
          <button type="button" className="rk-footer-action rk-footer-action--button" onClick={() => setScreen?.("trust")}>Trust</button>
          <button type="button" className="rk-footer-action rk-footer-action--button" onClick={() => setScreen?.("privacy")}>Privacy</button>
          <button type="button" className="rk-footer-action rk-footer-action--button" onClick={() => setScreen?.("terms")}>Terms</button>
          <button type="button" className="rk-footer-action rk-footer-action--button" onClick={() => setScreen?.("feedback")}>Feedback</button>
          <a href="https://instagram.com/playrackle" target="_blank" rel="noreferrer" className="rk-footer-action rk-footer-action--instagram" aria-label="Instagram">
            <InstagramGlyph />
            <span>Instagram</span>
          </a>
        </div>
        <a href="https://playrackle.com" className="rk-wordmark rk-footer-wordmark">Rackle</a>
        <p className="rk-tagline">The Daily Charleston Ritual</p>
        <p className="rk-footer-copy">© {new Date().getFullYear()} Rackle. Built for the modern mahjong table.</p>
      </div>
    </footer>
  );
}
