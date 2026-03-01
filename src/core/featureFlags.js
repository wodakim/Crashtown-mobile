import { readJson, writeJson } from "./storage.js";

const FLAGS_KEY = "feature_flags";

const defaultFlags = {
  telemetryEnabled: true,
  tutorialEnabled: true,
  dynamicWeatherEnabled: false,
  comboSystemEnabled: true,
};

export function getFeatureFlags() {
  return { ...defaultFlags, ...(readJson(FLAGS_KEY, {}) || {}) };
}

export function isFeatureEnabled(flagName) {
  const flags = getFeatureFlags();
  return Boolean(flags[flagName]);
}

export function setFeatureFlag(flagName, value) {
  const flags = getFeatureFlags();
  flags[flagName] = Boolean(value);
  writeJson(FLAGS_KEY, flags);
  return flags;
}
