export function preloadAsset(src, onProgress = () => {}) {
  return new Promise((resolve) => {
    const done = () => {
      onProgress();
      resolve();
    };

    if (src.endsWith(".mp3") || src.endsWith(".mp4")) {
      const media = document.createElement(src.endsWith(".mp4") ? "video" : "audio");
      media.preload = "auto";
      media.src = src;
      media.addEventListener("loadeddata", done, { once: true });
      media.addEventListener("error", done, { once: true });
      return;
    }

    const img = new Image();
    img.onload = done;
    img.onerror = done;
    img.src = src;
  });
}

export async function navigateWithPreload({
  targetHref,
  assets = [],
  appRoot = null,
  navLoading = null,
  runExitTransition,
  markNavigationStart,
  pageName,
  loadingDelayMs = 220,
}) {
  let loadingShown = false;
  const loadingTimer = window.setTimeout(() => {
    navLoading?.classList.remove("hidden");
    loadingShown = true;
  }, loadingDelayMs);

  if (typeof runExitTransition === "function") {
    await runExitTransition({ appRoot, navLoading: null });
  }

  if (typeof markNavigationStart === "function" && pageName) {
    markNavigationStart(pageName, targetHref);
  }

  await Promise.all(assets.map((src) => preloadAsset(src)));

  window.clearTimeout(loadingTimer);
  if (!loadingShown) navLoading?.classList.add("hidden");
  window.location.href = targetHref;
}
