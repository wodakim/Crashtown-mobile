const NAV_MARK_KEY = "ct_perf_nav_mark_v1";
const PERF_SUMMARY_KEY = "ct_perf_summary_v1";
const UI_TRANSITION_FLAG_KEY = "ct_ui_transition_v1";

function safeNow() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function readSummary() {
  try {
    return JSON.parse(localStorage.getItem(PERF_SUMMARY_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeSummary(next) {
  localStorage.setItem(PERF_SUMMARY_KEY, JSON.stringify(next));
}

export function initPagePerf(pageName) {
  const startedAt = safeNow();
  window.addEventListener(
    "load",
    () => {
      const coldStartMs = Math.round(safeNow() - startedAt);
      const summary = readSummary();
      summary[pageName] = {
        ...(summary[pageName] || {}),
        lastColdStartMs: coldStartMs,
        measuredAt: Date.now(),
      };
      writeSummary(summary);
      console.info(`[CT PERF] ${pageName} cold-start: ${coldStartMs}ms`);
    },
    { once: true },
  );
}

export function markNavigationStart(fromPage, toPage) {
  const payload = { fromPage, toPage, startedAt: safeNow(), wallClockAt: Date.now() };
  sessionStorage.setItem(NAV_MARK_KEY, JSON.stringify(payload));
}

export function reportNavigationArrival(currentPage) {
  const raw = sessionStorage.getItem(NAV_MARK_KEY);
  if (!raw) return;

  try {
    const nav = JSON.parse(raw);
    if (!nav?.toPage || nav.toPage !== currentPage) return;
    const navMs = Math.round(safeNow() - Number(nav.startedAt || 0));
    const summary = readSummary();
    const navKey = `${nav.fromPage}->${nav.toPage}`;
    summary.nav = {
      ...(summary.nav || {}),
      [navKey]: { lastMs: navMs, measuredAt: Date.now() },
    };
    writeSummary(summary);
    console.info(`[CT PERF] nav ${navKey}: ${navMs}ms`);
    sessionStorage.removeItem(NAV_MARK_KEY);
  } catch {
    sessionStorage.removeItem(NAV_MARK_KEY);
  }
}

export function createFrameBudgetTracker(label, sampleSize = 240) {
  const state = {
    label,
    sampleSize,
    frameCount: 0,
    maxFrameMs: 0,
    totalFrameMs: 0,
  };

  return {
    tick(frameMs) {
      if (!Number.isFinite(frameMs)) return;
      state.frameCount += 1;
      state.totalFrameMs += frameMs;
      state.maxFrameMs = Math.max(state.maxFrameMs, frameMs);

      if (state.frameCount < state.sampleSize) return;

      const avgFrameMs = state.totalFrameMs / state.frameCount;
      const fps = avgFrameMs > 0 ? 1000 / avgFrameMs : 0;

      const summary = readSummary();
      summary[state.label] = {
        ...(summary[state.label] || {}),
        avgFrameMs: Math.round(avgFrameMs * 100) / 100,
        approxFps: Math.round(fps * 10) / 10,
        maxFrameMs: Math.round(state.maxFrameMs * 100) / 100,
        measuredAt: Date.now(),
      };
      writeSummary(summary);

      console.info(
        `[CT PERF] ${state.label}: avg=${summary[state.label].avgFrameMs}ms ` +
          `fps~${summary[state.label].approxFps} max=${summary[state.label].maxFrameMs}ms`,
      );

      state.frameCount = 0;
      state.totalFrameMs = 0;
      state.maxFrameMs = 0;
    },
  };
}


export function isUiTransitionEnabled() {
  const raw = localStorage.getItem(UI_TRANSITION_FLAG_KEY);
  if (raw == null) return true;
  return raw !== "0";
}

export async function runExitTransition({ appRoot = null, navLoading = null, durationMs = 220 } = {}) {
  if (!isUiTransitionEnabled()) return;

  if (appRoot) appRoot.classList.add("ct-page-exit");
  if (navLoading) navLoading.classList.add("ct-nav-loading-show");

  await new Promise((resolve) => window.setTimeout(resolve, durationMs));
}
