import { isFeatureEnabled } from "./featureFlags.js";
import { readJson, writeJson } from "./storage.js";

const TELEMETRY_KEY = "telemetry_events";
const MAX_EVENTS = 200;

export function trackEvent(name, payload = {}) {
  if (!isFeatureEnabled("telemetryEnabled")) return;

  const event = {
    name,
    payload,
    at: Date.now(),
  };

  const events = readJson(TELEMETRY_KEY, []);
  events.push(event);
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }
  writeJson(TELEMETRY_KEY, events);

  console.info(`[CT EVENT] ${name}`, payload);
}

export function readTelemetryEvents() {
  return readJson(TELEMETRY_KEY, []);
}

export function clearTelemetryEvents() {
  writeJson(TELEMETRY_KEY, []);
}
