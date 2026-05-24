// ─── Rackle shared state card ────────────────────────────────────────────────
// Calm empty/error/recovery state used across launch flows.

export default function RackleState({
  eyebrow,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  secondaryHref,
  className = "",
}) {
  return (
    <section className={`rk-state-card ${className}`.trim()} aria-live="polite">
      {eyebrow && <p className="rk-state-card__eyebrow">{eyebrow}</p>}
      <h2 className="rk-state-card__title">{title}</h2>
      {body && <p className="rk-state-card__body">{body}</p>}
      {(primaryLabel || secondaryLabel) && (
        <div className="rk-state-card__actions">
          {primaryLabel && (
            <button type="button" className="rk-btn rk-btn--primary" onClick={onPrimary}>
              {primaryLabel}
            </button>
          )}
          {secondaryLabel && secondaryHref ? (
            <a className="rk-btn rk-btn--secondary" href={secondaryHref}>{secondaryLabel}</a>
          ) : secondaryLabel ? (
            <button type="button" className="rk-btn rk-btn--secondary" onClick={onSecondary}>
              {secondaryLabel}
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
