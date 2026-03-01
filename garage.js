import { initPagePerf, markNavigationStart, reportNavigationArrival, runExitTransition } from "./perf-tools.js";
import { navigateWithPreload as sharedNavigateWithPreload, preloadAsset } from "./src/core/navigation.js";
import { VEHICLE_CATALOG as vehicles, VEHICLE_QUALITY_ORDER as qualityOrder, getVehicleVariant } from "./src/data/vehicles.js";
import { isVehicleColorOwned, isVehicleOwned } from "./src/data/vehicleOwnership.js";

let currentQuality = localStorage.getItem("selectedVehicleQuality") || "hd";
let currentIndex = 0;
let selectedColor = localStorage.getItem("selectedVehicleColor") || "white";

const carImage = document.getElementById("carImage");
const carName = document.getElementById("carName");
const variantLabel = document.getElementById("variantLabel");
const garageMusic = document.getElementById("garageMusic");
const carSound = document.getElementById("carSound");
const selectionSound = document.getElementById("selectionSound");
const overlay = document.getElementById("overlay");
const garageSettingsPopup = document.getElementById("garageSettingsPopup");
const garageMusicVolume = document.getElementById("garageMusicVolume");
const garageAutoPlayToggle = document.getElementById("garageAutoPlayToggle");
const navLoading = document.getElementById("navLoading");
const colorButtons = Array.from(document.querySelectorAll(".color-btn"));
const carStage = document.querySelector(".car-stage");
const startRaceBtn = document.getElementById("startRaceBtn");
let garageMusicWanted = true;
const GARAGE_SETTINGS_KEY = "ct_garage_settings_v1";

const PAGE_NAME = "garage.html";
initPagePerf(PAGE_NAME);
reportNavigationArrival(PAGE_NAME);

function getGarageSettings() {
  const fallback = { musicVolume: 60, autoPlayMusic: true };
  try {
    const raw = localStorage.getItem(GARAGE_SETTINGS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      musicVolume: Number.isFinite(Number(parsed.musicVolume)) ? Math.max(0, Math.min(100, Number(parsed.musicVolume))) : fallback.musicVolume,
      autoPlayMusic: parsed.autoPlayMusic !== false,
    };
  } catch {
    return fallback;
  }
}

function saveGarageSettings(settings) {
  localStorage.setItem(GARAGE_SETTINGS_KEY, JSON.stringify(settings));
}

function applyGarageSettings() {
  const settings = getGarageSettings();
  garageMusic.volume = settings.musicVolume / 100;
  garageMusicWanted = settings.autoPlayMusic;
  if (garageMusicVolume) garageMusicVolume.value = String(settings.musicVolume);
  if (garageAutoPlayToggle) garageAutoPlayToggle.checked = settings.autoPlayMusic;
}

function findInitialVehicle() {
  const selected = localStorage.getItem("selectedVehicle") || "RX7";
  const fallback = vehicles.find((vehicle) => isVehicleOwned(vehicle.id)) || vehicles[0];
  const resolvedId = isVehicleOwned(selected) ? selected : fallback.id;
  const index = vehicles.findIndex((vehicle) => vehicle.id === resolvedId || vehicle.name === resolvedId);
  currentIndex = index >= 0 ? index : 0;
  if (!qualityOrder.includes(currentQuality)) currentQuality = "hd";
}

function selectedVehicle() {
  return vehicles[currentIndex];
}

function animateGarageCarSwap() {
  if (!carImage) return;
  carImage.classList.remove("garage-car-swap");
  void carImage.offsetWidth;
  carImage.classList.add("garage-car-swap");
}

function saveSelectedVehicle() {
  const vehicle = selectedVehicle();
  if (!isVehicleOwned(vehicle.id) || !isVehicleColorOwned(vehicle.id, selectedColor)) return;
  localStorage.setItem("selectedVehicle", vehicle.id);
  localStorage.setItem("selectedVehicleQuality", currentQuality);
  localStorage.setItem("selectedVehicleColor", selectedColor);
}

function renderColorButtons(vehicle) {
  const isUnlocked = isVehicleOwned(vehicle.id);
  const firstOwnedColor = vehicle.colors.find((color) => isVehicleColorOwned(vehicle.id, color.token))?.token || "white";
  if (!isVehicleColorOwned(vehicle.id, selectedColor)) selectedColor = firstOwnedColor;

  colorButtons.forEach((btn, idx) => {
    const colorDef = vehicle.colors[idx];
    if (!colorDef) {
      btn.classList.add("hidden");
      btn.disabled = true;
      return;
    }
    btn.classList.remove("hidden");
    btn.dataset.colorToken = colorDef.token;
    btn.style.backgroundColor = colorDef.hex;
    btn.title = colorDef.label;

    const colorOwned = isUnlocked && isVehicleColorOwned(vehicle.id, colorDef.token);
    btn.disabled = !colorOwned;
    btn.classList.toggle("active", colorDef.token === selectedColor && colorOwned);
    btn.classList.toggle("locked", !colorOwned);
  });
}

function renderVehicle() {
  const vehicle = selectedVehicle();
  const unlocked = isVehicleOwned(vehicle.id);
  const image = getVehicleVariant(vehicle.id, currentQuality, selectedColor);

  animateGarageCarSwap();
  carImage.src = image;
  carImage.alt = `${vehicle.name} ${currentQuality.toUpperCase()}`;
  carName.textContent = unlocked ? `${vehicle.name} · ${selectedColor.toUpperCase()}` : `${vehicle.name} · VERROUILLÉ (acheter dans la boutique)`;
  variantLabel.textContent = currentQuality.toUpperCase();

  carStage?.classList.toggle("locked", !unlocked);
  startRaceBtn.disabled = !unlocked;
  startRaceBtn.classList.toggle("locked", !unlocked);

  renderColorButtons(vehicle);
}

function playVehicleSound() {
  const vehicle = selectedVehicle();
  if (!vehicle.sound) return;
  carSound.src = vehicle.sound;
  carSound.currentTime = 0;
  carSound.play().catch(() => {});
}

function openGarageSettings() {
  overlay.classList.remove("hidden");
  garageSettingsPopup.classList.remove("hidden");
}

function closeGarageSettings() {
  overlay.classList.add("hidden");
  garageSettingsPopup.classList.add("hidden");
}

async function startMusic() {
  applyGarageSettings();
  garageMusic.playbackRate = 1;
  garageMusic.loop = false;
  try {
    await garageMusic.play();
  } catch {
    const unlock = async () => {
      await garageMusic.play();
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
  }
}

function restartGarageMusic() {
  garageMusic.currentTime = 0;
  garageMusic.play().catch(() => {});
}

garageMusic.addEventListener("ended", () => {
  if (!garageMusicWanted) return;
  restartGarageMusic();
});

function handleAppVisibility() {
  if (document.hidden) {
    garageMusicWanted = !garageMusic.paused;
    garageMusic.pause();
    return;
  }

  if (garageMusicWanted) {
    garageMusic.play().catch(() => {});
  }
}

function setupAssetFallbacks() {
  document.querySelectorAll("img[data-asset-name]").forEach((img) => {
    img.addEventListener("error", () => {
      const placeholder = document.createElement("div");
      placeholder.className = "placeholder";
      placeholder.style.width = `${img.clientWidth || 120}px`;
      placeholder.style.height = `${img.clientHeight || 48}px`;
      placeholder.textContent = `Placeholder: ${img.dataset.assetName}`;
      img.replaceWith(placeholder);
    });
  });
}

async function navigateWithPreload(targetHref, assets) {
  return sharedNavigateWithPreload({
    targetHref,
    assets,
    appRoot: document.querySelector(".garage-app"),
    navLoading,
    runExitTransition,
    markNavigationStart,
    pageName: PAGE_NAME,
  });
}

function cycleVehicle(direction) {
  currentIndex = (currentIndex + direction + vehicles.length) % vehicles.length;
  renderVehicle();
  playVehicleSound();
}

function cycleVariant(direction) {
  const idx = qualityOrder.indexOf(currentQuality);
  const next = (idx + direction + qualityOrder.length) % qualityOrder.length;
  currentQuality = qualityOrder[next];
  localStorage.setItem("selectedVehicleQuality", currentQuality);
  renderVehicle();
}

document.getElementById("prevCar").addEventListener("click", () => {
  cycleVehicle(-1);
});

document.getElementById("nextCar").addEventListener("click", () => {
  cycleVehicle(1);
});

document.getElementById("variantPrev").addEventListener("click", () => cycleVariant(-1));
document.getElementById("variantNext").addEventListener("click", () => cycleVariant(1));

colorButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const token = btn.dataset.colorToken || "white";
    const vehicle = selectedVehicle();
    if (!isVehicleOwned(vehicle.id) || !isVehicleColorOwned(vehicle.id, token)) return;
    selectedColor = token;
    saveSelectedVehicle();
    renderVehicle();
  });
});

document.getElementById("startRaceBtn").addEventListener("click", async () => {
  const vehicle = selectedVehicle();
  if (!isVehicleOwned(vehicle.id) || !isVehicleColorOwned(vehicle.id, selectedColor)) return;
  try {
    selectionSound.currentTime = 0;
    await selectionSound.play();
  } catch {
    // no-op
  }

  saveSelectedVehicle();
  const qualityImage = getVehicleVariant(vehicle.id, currentQuality, selectedColor);
  const selectedStation = localStorage.getItem("ct_radio_station_v1") || "radio_random";
  const stationPreviewTrack = `/Assets/Sounds/Onroad/radio/${selectedStation}/Sound_music_onroad_playsong1_sample_v01.mp3`;

  navigateWithPreload("play.html", [
    qualityImage,
    "./Assets/Road/Road_street_baseloop_v01.png",
    "/Assets/Road/obstacles/Obstacles_decor_base_v01.svg",
    "/Assets/Road/Obstacles/Obstacles_decor_base_v01.svg",
    "./Assets/Road/obstacles/Obstacles_decor_base_v01.svg",
    "./Assets/Road/Obstacles/Obstacles_decor_base_v01.svg",
    stationPreviewTrack,
  ]);
});

document.getElementById("garageSettingsBtn").addEventListener("click", () => {
  openGarageSettings();
});

document.getElementById("returnMainBtn").addEventListener("click", () => {
  garageMusicWanted = false;
  garageMusic.pause();
  garageMusic.currentTime = 0;
  navigateWithPreload("index.html", [
    "./Assets/UI/Screens/MainMenu/ui_mainmenu_bg_v02.svg",
    "./Assets/Sounds/Mainmenu/Song_mainmenu_base_v01.mp3",
  ]);
});

document.getElementById("closeGarageSettings").addEventListener("click", closeGarageSettings);
overlay.addEventListener("click", closeGarageSettings);

garageMusicVolume?.addEventListener("input", () => {
  const current = getGarageSettings();
  const next = { ...current, musicVolume: Number(garageMusicVolume.value) };
  saveGarageSettings(next);
  garageMusic.volume = next.musicVolume / 100;
});

garageAutoPlayToggle?.addEventListener("change", () => {
  const current = getGarageSettings();
  const next = { ...current, autoPlayMusic: garageAutoPlayToggle.checked };
  saveGarageSettings(next);
  garageMusicWanted = next.autoPlayMusic;
  if (!next.autoPlayMusic) garageMusic.pause();
});

findInitialVehicle();
setupAssetFallbacks();
saveSelectedVehicle();
renderVehicle();
startMusic();

window.addEventListener("pagehide", () => {
  garageMusicWanted = false;
  garageMusic.pause();
  garageMusic.currentTime = 0;
  carSound.pause();
  carSound.currentTime = 0;
});

document.addEventListener("visibilitychange", handleAppVisibility);
window.addEventListener("blur", handleAppVisibility);

async function runGarageBootSequence() {
  navLoading.classList.remove("hidden");
  navLoading.classList.remove("fade-out");
  const selected = selectedVehicle();
  const carImgSrc = getVehicleVariant(selected.id, currentQuality, selectedColor);
  const criticalAssets = [
    "./Assets/UI/Screens/MainMenu/ui_garage_menu_bg_v01.svg",
    "./Assets/Branding/Logo/Brand_crashtown_logo_main_v01.svg",
    carImgSrc,
  ];
  await Promise.all(criticalAssets.map((src) => preloadAsset(src)));
  await new Promise((resolve) => setTimeout(resolve, 300));
  navLoading.classList.add("fade-out");
  setTimeout(() => {
    navLoading.classList.add("hidden");
  }, 600);
}

runGarageBootSequence();
