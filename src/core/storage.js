const APP_STORAGE_PREFIX = "ct_";

function safeStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function withPrefix(key) {
  if (key.startsWith(APP_STORAGE_PREFIX)) return key;
  return `${APP_STORAGE_PREFIX}${key}`;
}

export function readJson(key, fallback = null) {
  const storage = safeStorage();
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(withPrefix(key));
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  const storage = safeStorage();
  if (!storage) return false;
  try {
    storage.setItem(withPrefix(key), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function readNumber(key, fallback = 0) {
  const storage = safeStorage();
  if (!storage) return fallback;
  const raw = Number(storage.getItem(withPrefix(key)));
  return Number.isFinite(raw) ? raw : fallback;
}

export function writeNumber(key, value) {
  const storage = safeStorage();
  if (!storage) return false;
  try {
    storage.setItem(withPrefix(key), String(value));
    return true;
  } catch {
    return false;
  }
}

export function getStorageVersion() {
  return readNumber("storage_version", 1);
}

export function ensureStorageVersion(version = 1) {
  const current = getStorageVersion();
  if (current >= version) return current;
  writeNumber("storage_version", version);
  return version;
}
