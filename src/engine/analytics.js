// ─── Rackle · Analytics-lite ────────────────────────────────────────────────
// Small, privacy-safe event helper for launch learning.

const SAFE_PAYLOAD_KEYS = new Set([
  "mode",
  "scoreBand",
  "hasClub",
  "isGuest",
  "shareMethod",
  "source",
  "clubState",
  "hasGlobalRank",
  "hasClubRank",
  "activeTab",
  "outcome",
  "scoreRange",
  "dailyState",
  "copyType",
]);

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const MAX_STRING_LENGTH = 48;

function cleanString(value) {
  return String(value || "")
    .replace(EMAIL_PATTERN, "[redacted]")
    .trim()
    .slice(0, MAX_STRING_LENGTH);
}

function cleanValue(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") return cleanString(value);
  return null;
}

export function getScoreBand(score) {
  const n = Number(score || 0);
  if (n >= 90) return "90+";
  if (n >= 80) return "80-89";
  if (n >= 70) return "70-79";
  if (n >= 60) return "60-69";
  if (n >= 50) return "50-59";
  return "under-50";
}

export function getClubState({ hasClub, pending } = {}) {
  if (pending) return "pending";
  return hasClub ? "joined" : "none";
}

export function sanitizeAnalyticsPayload(payload = {}) {
  const clean = {};
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (!SAFE_PAYLOAD_KEYS.has(key)) return;
    const nextValue = cleanValue(value);
    if (nextValue === null || nextValue === "") return;
    clean[key] = nextValue;
  });
  return clean;
}

export function trackRackleEvent(eventName, payload = {}) {
  const name = cleanString(eventName);
  if (!name) return false;

  try {
    const cleanPayload = sanitizeAnalyticsPayload(payload);

    if (import.meta.env?.DEV) {
      // Development-only visibility. Production stays quiet.
      console.info("[Rackle analytics]", name, cleanPayload);
    }

    // Keep analytics dependency-free so Rackle never fails to load because an
    // optional provider package is missing or unavailable in a local build.
    if (typeof window !== "undefined") {
      if (typeof window.va === "function") {
        window.va("event", { name, data: cleanPayload });
      } else {
        window.dispatchEvent(new CustomEvent("rackle:analytics", {
          detail: { name, payload: cleanPayload },
        }));
      }
    }

    return true;
  } catch (error) {
    if (import.meta.env?.DEV) console.warn("Rackle analytics event failed", name, error);
    return false;
  }
}
