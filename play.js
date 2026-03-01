import { createFrameBudgetTracker, initPagePerf, reportNavigationArrival, runExitTransition } from "./perf-tools.js";
import { isFeatureEnabled } from "./src/core/featureFlags.js";
import { ensureStorageVersion, readNumber, writeNumber } from "./src/core/storage.js";
import { trackEvent } from "./src/core/telemetry.js";
import { gameplayConfig } from "./src/data/gameplay.js";
import { RADIO_STATION_PREF_KEY, buildStationTracks, isKnownStation } from "./src/data/radioStations.js";
import { VEHICLE_CATALOG, getVehicleVariant } from "./src/data/vehicles.js";
import { safePlay, stopAndReset } from "./src/core/audio.js";
import { STORAGE_KEYS } from "./src/core/keys.js";
import { applyRunSummary } from "./src/game/state/progression.js";
import { getRunDifficulty } from "./src/data/difficulties.js";
const lanes = gameplayConfig.lanes;
const ENEMY_SPAWN_INTERVAL_MS = gameplayConfig.enemySpawnIntervalMs;
const MAX_ENEMIES = gameplayConfig.maxEnemies;
const BOT_BASE_SPEED = gameplayConfig.bot.baseSpeed;
const BOT_MAX_SPEED = gameplayConfig.bot.maxSpeed;
const BOT_MIN_SPEED = gameplayConfig.bot.minSpeed;
const BOT_SAFE_GAP = gameplayConfig.bot.safeGap;
const BOT_PLAYER_SPEED_MARGIN = gameplayConfig.bot.playerSpeedMargin;
const PLAYER_HITBOX_HALF_WIDTH = gameplayConfig.player.hitboxHalfWidth;
const BOT_HITBOX_HALF_WIDTH = gameplayConfig.player.hitboxHalfWidth;
const FRONTAL_CONTACT_X_THRESHOLD = 0.032;
const SIDE_TAKEDOWN_X_MIN = 0.036;
const NEAR_MISS_X_MIN = 0.07;
const NEAR_MISS_X_MAX = 0.19;
const COMBO_WINDOW_MS = 3200;
const TAKEDOWN_STEER_WINDOW_MS = gameplayConfig.takedown.steerWindowMs;
const PLAYER_Y = gameplayConfig.player.y;
const HITBOX_FRONT_OFFSET = gameplayConfig.player.hitboxFrontOffset;
const HITBOX_BACK_OFFSET = gameplayConfig.player.hitboxBackOffset;
const TAKEDOWN_OVERLAP_BUFFER = gameplayConfig.takedown.overlapBuffer;
const START_GRACE_MS = gameplayConfig.player.startGraceMs;
const LANE_CHANGE_COOLDOWN_MS = gameplayConfig.player.laneChangeCooldownMs;
const LANE_SHIELD_MS = gameplayConfig.player.laneShieldMs;
const BASE_DIFFICULTY_SCORE_STEP = gameplayConfig.race.baseDifficultyScoreStep;
const MIN_SPAWN_PROGRESS_GAP = gameplayConfig.race.minSpawnProgressGap;
const MAX_RECENT_EVENTS = gameplayConfig.race.maxRecentEvents;
const DEV_HITBOX_QUERY = new URLSearchParams(window.location.search).get("devHitbox") === "1";
const PLAYER_WALLET_KEY = STORAGE_KEYS.walletCredits;
const LEGACY_PLAYER_WALLET_KEY = "wallet_credits_v1";
const GIFT_REWARD_CREDITS = gameplayConfig.gift.rewardCredits;
const GIFT_SPAWN_MIN_MS = gameplayConfig.gift.spawnMinMs;
const GIFT_SPAWN_MAX_MS = gameplayConfig.gift.spawnMaxMs;
const OBSTACLE_SPAWN_INTERVAL_MS = gameplayConfig.obstacle.spawnIntervalMs;
const MAX_ACTIVE_OBSTACLES = gameplayConfig.obstacle.maxActive;
const RUN_EVENT_MIN_INTERVAL_MS = gameplayConfig.runEvents.minIntervalMs;
const RUN_EVENT_MAX_INTERVAL_MS = gameplayConfig.runEvents.maxIntervalMs;
const RUN_EVENT_DURATION_MS = gameplayConfig.runEvents.durationMs;
const RUN_EVENT_DENSE_TRAFFIC_SPAWN_MULT = gameplayConfig.runEvents.denseTrafficSpawnMultiplier;
const RUN_EVENT_DENSE_TRAFFIC_MAX_BONUS = gameplayConfig.runEvents.denseTrafficMaxEnemiesBonus;
const RUN_EVENT_NIGHT_CRUISE_MULT = gameplayConfig.runEvents.nightCruiseMultiplier;
const RUN_EVENT_NIGHT_SPEED_CAP = gameplayConfig.runEvents.nightSpeedCap;
const RADIO_REPEAT_PREF_KEY = STORAGE_KEYS.radioRepeat;
const OBSTACLE_ASSET_CANDIDATES = [
  "/Assets/Road/obstacles/Obstacles_decor_base_v01.svg",
  "/Assets/Road/Obstacles/Obstacles_decor_base_v01.svg",
  "./Assets/Road/obstacles/Obstacles_decor_base_v01.svg",
  "./Assets/Road/Obstacles/Obstacles_decor_base_v01.svg",
];

const PAGE_NAME = "play.html";
initPagePerf(PAGE_NAME);
reportNavigationArrival(PAGE_NAME);
const frameBudgetTracker = createFrameBudgetTracker("play.frame");

const road = document.getElementById("road");
const carsLayer = document.getElementById("carsLayer");
const playerCar = document.getElementById("playerCar");
const scoreValue = document.getElementById("scoreValue");
const speedValue = document.getElementById("speedValue");
const pauseBtn = document.getElementById("pauseBtn");
const settingsBtn = document.getElementById("settingsBtn");
const overlay = document.getElementById("overlay");
const settingsPopup = document.getElementById("settingsPopup");
const confirmExitPopup = document.getElementById("confirmExitPopup");
const pausePopup = document.getElementById("pausePopup");
const gameOverPanel = document.getElementById("gameOverPanel");
const gameOverSummary = document.getElementById("gameOverSummary");
const gameOverMissionSummary = document.getElementById("gameOverMissionSummary");
const closeSettingsBtn = document.querySelector('[data-close="settingsPopup"]');
const menuBtnInSettings = document.getElementById("menuBtnInSettings");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");
const resumeBtn = document.getElementById("resumeBtn");
const menuBtnInPause = document.getElementById("menuBtnInPause");
const retryBtn = document.getElementById("retryBtn");
const menuBtnGameOver = document.getElementById("menuBtnGameOver");
const crashSound = document.getElementById("crashSound");
const takedownSound = document.getElementById("takedownSound");
const playApp = document.querySelector(".play-app");
const radioPlayer = document.getElementById("radioPlayer");
const radioSelect = document.getElementById("radioSelect");
const prevTrackBtn = document.getElementById("prevTrackBtn");
const loopTrackBtn = document.getElementById("loopTrackBtn");
const nextTrackBtn = document.getElementById("nextTrackBtn");

const vehicleAssets = VEHICLE_CATALOG.reduce((acc, vehicle) => {
  acc[vehicle.id] = { ...vehicle.variants };
  return acc;
}, {});


const botVehicleAssets = {
  hd: [
    "./Assets/Vehicles/Bot/HD/Vehicles_Bluecar_HD_base_v01.png",
    "./Assets/Vehicles/Bot/HD/Vehicles_greencar_HD_base_v01.png",
    "./Assets/Vehicles/Bot/HD/Vehicles_greycar_HD_base_v01.png",
    "./Assets/Vehicles/Bot/HD/Vehicles_redcar_HD_base_v01.png",
    "./Assets/Vehicles/Bot/HD/Vehicles_yellowcar_HD_base_v01.png",
  ],
  pixel: [
    "./Assets/Vehicles/Bot/Pixel/Vehicles_Bluecar_pixel_base_v01.png",
    "./Assets/Vehicles/Bot/Pixel/Vehicles_greencar_pixel_base_v01.png",
    "./Assets/Vehicles/Bot/Pixel/Vehicles_greycar_pixel_base_v01.png",
    "./Assets/Vehicles/Bot/Pixel/Vehicles_redcar_pixel_base_v01.png",
    "./Assets/Vehicles/Bot/Pixel/Vehicles_yellowcar_pixel_base_v01.png",
  ],
};


let radioUnlockBound = false;

const state = {
  running: true,
  gameOver: false,
  lane: 1,
  playerLanePosition: 1,
  score: 0,
  speed: 280,
  roadOffset: 0,
  enemies: [],
  keys: {
    left: false,
    right: false,
    accel: false,
    brake: false,
  },
  lastFrame: performance.now(),
  enemySpawnClock: 0,
  laneChangeBlockedUntil: 0,
  startedAt: performance.now(),
  takedowns: 0,
  overtakes: 0,
  collisions: 0,
  nearMisses: 0,
  currentModal: null,
  shieldUntil: 0,
  eventLog: [],
  devHitboxVisible: DEV_HITBOX_QUERY,
  touchModeDetected: false,
  tutorialSeen: false,
  tutorialVisibleUntil: 0,
  speedProgressBoost: 0,
  tutorialDismissFn: null,
  lastLaneChangeAt: 0,
  lastLaneChangeDir: 0,
  giftDrops: [],
  giftSpawnClock: 0,
  giftSpawnTarget: GIFT_SPAWN_MIN_MS + Math.random() * (GIFT_SPAWN_MAX_MS - GIFT_SPAWN_MIN_MS),
  obstacles: [],
  obstacleSpawnClock: 0,
  combo: {
    count: 0,
    multiplier: 1,
    expiresAt: 0,
    lastSource: null,
  },
  runEvent: {
    type: null,
    endsAt: 0,
    nextAt: performance.now() + RUN_EVENT_MIN_INTERVAL_MS,
  },
  currentRadioStation: null,
  currentRadioTrack: null,
  radioTracks: [],
  radioQueue: [],
  radioHistory: [],
  radioHistoryIndex: -1,
  radioLoopCurrent: false,
  radioEmptyWarnedStation: null,
};

const selectedDifficultyId = localStorage.getItem(STORAGE_KEYS.runDifficulty) || "normal";
const selectedDifficulty = getRunDifficulty(selectedDifficultyId);

const feedbackLayer = document.createElement("div");
feedbackLayer.className = "feedback-layer";
playApp?.appendChild(feedbackLayer);

const comboMeter = document.createElement("div");
comboMeter.className = "combo-meter hidden";
playApp?.appendChild(comboMeter);

const playerShadow = document.createElement("div");
playerShadow.className = "car-shadow player-shadow";
carsLayer?.appendChild(playerShadow);

function selectedVehicleSrc() {
  const selected = localStorage.getItem(STORAGE_KEYS.selectedVehicle) || "RX7";
  const quality = localStorage.getItem(STORAGE_KEYS.selectedVehicleQuality) || "hd";
  const color = localStorage.getItem(STORAGE_KEYS.selectedVehicleColor) || "white";
  return getVehicleVariant(selected, quality, color) || vehicleAssets.RX7?.hd || vehicleAssets.PORSHE?.hd;
}

function playSfx(audio) {
  if (!audio) return;
  audio.currentTime = 0;
  safePlay(audio);
}

function award(points) {
  state.score += points;
}
function getWalletCredits() {
  const raw = readNumber(PLAYER_WALLET_KEY, Number.NaN);
  if (Number.isFinite(raw) && raw >= 0) return Math.floor(raw);
  writeNumber(PLAYER_WALLET_KEY, 2500);
  return 2500;
}

function addWalletCredits(amount) {
  const next = getWalletCredits() + amount;
  writeNumber(PLAYER_WALLET_KEY, next);
  return next;
}

function getSavedRadioStation() {
  const raw = localStorage.getItem(RADIO_STATION_PREF_KEY) || "radio_random";
  return isKnownStation(raw) ? raw : "radio_random";
}

function saveRadioStation(stationId) {
  const safe = isKnownStation(stationId) ? stationId : "radio_random";
  localStorage.setItem(RADIO_STATION_PREF_KEY, safe);
  return safe;
}


function getSavedRadioRepeat() {
  return localStorage.getItem(RADIO_REPEAT_PREF_KEY) === "1";
}

function saveRadioRepeat(enabled) {
  localStorage.setItem(RADIO_REPEAT_PREF_KEY, enabled ? "1" : "0");
}

function shuffleTracks(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeTrackPath(stationId, trackName) {
  if (trackName.startsWith("http://") || trackName.startsWith("https://") || trackName.startsWith("/")) return trackName;
  return `/Assets/Sounds/Onroad/radio/${stationId}/${trackName}`;
}

async function loadStationTracks(stationId) {
  try {
    const response = await fetch(`/Assets/Sounds/Onroad/radio/${stationId}/playlist.json`, { cache: "no-store" });
    if (!response.ok) throw new Error(`playlist ${response.status}`);
    const payload = await response.json();
    const tracks = Array.isArray(payload?.tracks)
      ? payload.tracks.map((name) => normalizeTrackPath(stationId, String(name))).filter(Boolean)
      : [];
    if (tracks.length > 0) return tracks;
    console.warn(`[CT RADIO] playlist vide pour ${stationId} (playlist.json)`);
  } catch {
    // fallback below
  }

  return buildStationTracks(stationId);
}

function refillRadioQueue() {
  if (!state.radioTracks.length) {
    state.radioQueue = [];
    return;
  }
  state.radioQueue = shuffleTracks(state.radioTracks);
}

function pullNextTrack() {
  if (!state.radioQueue.length) refillRadioQueue();
  return state.radioQueue.shift() || null;
}

function pushRadioHistory(track) {
  if (!track) return;
  if (state.radioHistoryIndex < state.radioHistory.length - 1) {
    state.radioHistory = state.radioHistory.slice(0, state.radioHistoryIndex + 1);
  }
  state.radioHistory.push(track);
  state.radioHistoryIndex = state.radioHistory.length - 1;
}

function updateRadioControlsUi() {
  if (loopTrackBtn) {
    loopTrackBtn.classList.toggle("active", state.radioLoopCurrent);
    loopTrackBtn.setAttribute("aria-pressed", state.radioLoopCurrent ? "true" : "false");
  }
  if (prevTrackBtn) prevTrackBtn.disabled = state.radioHistoryIndex <= 0;
}

async function prepareRadioStation(stationId, { forceReload = false } = {}) {
  const stationChanged = state.currentRadioStation !== stationId;
  if (!stationChanged && !forceReload && state.radioTracks.length) return;

  state.currentRadioStation = stationId;
  state.radioTracks = await loadStationTracks(stationId);
  refillRadioQueue();
  if (!state.radioTracks.length && state.radioEmptyWarnedStation !== stationId) {
    state.radioEmptyWarnedStation = stationId;
    addFloatingFeedback("RADIO: playlist vide", "neutral");
  }
  state.radioHistory = [];
  state.radioHistoryIndex = -1;
  state.currentRadioTrack = null;
  updateRadioControlsUi();
}

function migrateLegacyStorageKeys() {
  try {
    const legacyWallet = Number(localStorage.getItem(LEGACY_PLAYER_WALLET_KEY));
    if (Number.isFinite(legacyWallet) && legacyWallet >= 0 && !Number.isFinite(readNumber(PLAYER_WALLET_KEY, Number.NaN))) {
      writeNumber(PLAYER_WALLET_KEY, Math.floor(legacyWallet));
    }

    const legacyRadio = Number(localStorage.getItem("ct_radio_track_idx_v1"));
    if (Number.isInteger(legacyRadio) && !localStorage.getItem(RADIO_STATION_PREF_KEY)) {
      saveRadioStation("radio_random");
    }
  } catch {
    // no-op
  }
}

function pushEvent(type, payload = {}) {
  state.eventLog.push({ type, at: performance.now(), ...payload });
  if (state.eventLog.length > MAX_RECENT_EVENTS) {
    state.eventLog.shift();
  }
}

function laneNearestGap(lane, progress) {
  let nearest = Infinity;
  state.enemies.forEach((enemy) => {
    if (!enemy.alive || enemy.lane != lane) return;
    nearest = Math.min(nearest, Math.abs(enemy.progress - progress));
  });
  return nearest;
}


function difficultyLevel() {
  return Math.min(5, Math.floor(state.score / BASE_DIFFICULTY_SCORE_STEP));
}

function addFloatingFeedback(text, type = "neutral") {
  if (!feedbackLayer) return;
  const feedback = document.createElement("div");
  feedback.className = `floating-feedback floating-feedback-${type}`;
  feedback.textContent = text;
  feedbackLayer.appendChild(feedback);
  setTimeout(() => feedback.remove(), 820);
}

function scheduleNextRunEvent(now = performance.now()) {
  const nextDelay = RUN_EVENT_MIN_INTERVAL_MS + Math.random() * (RUN_EVENT_MAX_INTERVAL_MS - RUN_EVENT_MIN_INTERVAL_MS);
  state.runEvent.nextAt = now + nextDelay;
}

function clearRunEvent() {
  if (!state.runEvent.type) return;
  const endedType = state.runEvent.type;
  state.runEvent.type = null;
  state.runEvent.endsAt = 0;
  playApp?.classList.remove("event-night", "event-dense-traffic");
  addFloatingFeedback("RUN EVENT TERMINÉ", "neutral");
  trackEvent("run_event_end", { type: endedType, score: state.score });
}

function activateRunEvent(type, now = performance.now()) {
  state.runEvent.type = type;
  state.runEvent.endsAt = now + RUN_EVENT_DURATION_MS;
  playApp?.classList.remove("event-night", "event-dense-traffic");
  if (type === "night") {
    playApp?.classList.add("event-night");
    addFloatingFeedback("EVENT: NUIT", "neutral");
  }
  if (type === "dense_traffic") {
    playApp?.classList.add("event-dense-traffic");
    addFloatingFeedback("EVENT: TRAFIC DENSE", "neutral");
  }
  trackEvent("run_event_start", { type, score: state.score });
}

function updateRunEvents(now = performance.now()) {
  if (state.gameOver || !state.running) return;
  if (now - state.startedAt < START_GRACE_MS + 2000) return;

  if (state.runEvent.type && now >= state.runEvent.endsAt) {
    clearRunEvent();
    scheduleNextRunEvent(now);
    return;
  }

  if (!state.runEvent.type && now >= state.runEvent.nextAt) {
    const nextType = Math.random() > 0.5 ? "dense_traffic" : "night";
    activateRunEvent(nextType, now);
  }
}

function refreshComboMeter() {
  if (!comboMeter) return;
  if (state.combo.count <= 0) {
    comboMeter.classList.add("hidden");
    comboMeter.textContent = "";
    return;
  }

  comboMeter.classList.remove("hidden");
  comboMeter.classList.remove("combo-pop");
  void comboMeter.offsetWidth;
  comboMeter.classList.add("combo-pop");
  comboMeter.textContent = `COMBO x${state.combo.multiplier.toFixed(1)} · ${state.combo.count}`;
}

function breakCombo(reason = "timeout") {
  if (state.combo.count <= 0) return;
  trackEvent("combo_break", { reason, count: state.combo.count, multiplier: state.combo.multiplier });
  state.combo.count = 0;
  state.combo.multiplier = 1;
  state.combo.expiresAt = 0;
  state.combo.lastSource = null;
  refreshComboMeter();
}

function registerComboAction(source, basePoints, feedbackText, feedbackType = "neutral") {
  const now = performance.now();
  if (state.combo.expiresAt < now) {
    state.combo.count = 0;
    state.combo.multiplier = 1;
  }

  state.combo.count += 1;
  state.combo.multiplier = Math.min(4.5, 1 + state.combo.count * 0.12);
  state.combo.expiresAt = now + COMBO_WINDOW_MS;
  state.combo.lastSource = source;

  const comboBonus = Math.round(basePoints * Math.max(0, state.combo.multiplier - 1));
  if (comboBonus > 0) award(comboBonus);

  trackEvent("combo_step", {
    source,
    count: state.combo.count,
    multiplier: Number(state.combo.multiplier.toFixed(2)),
    comboBonus,
  });

  addFloatingFeedback(`${feedbackText} · x${state.combo.multiplier.toFixed(1)}`, feedbackType);
  refreshComboMeter();
}

function checkNearMiss(enemy) {
  if (!enemy.alive || enemy.nearMissChecked || state.gameOver) return;

  const progressDelta = enemy.progress - PLAYER_Y;
  if (progressDelta < 0.02 || progressDelta > 0.24) return;

  enemy.nearMissChecked = true;
  const playerX = playerHitboxX().center;
  const enemyX = enemyHitboxX(enemy).center;
  const lateralDistance = Math.abs(playerX - enemyX);

  if (lateralDistance < NEAR_MISS_X_MIN || lateralDistance > NEAR_MISS_X_MAX) return;

  const nearMissPoints = 220;
  award(nearMissPoints);
  trackEvent("near_miss", { lane: enemy.lane, lateralDistance: Number(lateralDistance.toFixed(3)), score: state.score });
  state.nearMisses += 1;
  registerComboAction("near_miss", nearMissPoints, "NEAR MISS +220", "overtake");
}

function flashScreen(type = "neutral") {
  if (!playApp) return;
  playApp.classList.remove("flash-hit", "flash-takedown");
  if (type === "hit") playApp.classList.add("flash-hit");
  if (type === "takedown") playApp.classList.add("flash-takedown");
  setTimeout(() => {
    playApp.classList.remove("flash-hit", "flash-takedown");
  }, 260);
}

function playerLeftCss() {
  const laneFloor = Math.floor(state.playerLanePosition);
  const laneNext = Math.min(lanes.length - 1, laneFloor + 1);
  const blend = Math.max(0, Math.min(1, state.playerLanePosition - laneFloor));
  const playerX = lanes[laneFloor] + (lanes[laneNext] - lanes[laneFloor]) * blend;
  return laneToLeftCss(playerX);
}

function laneToLeftCss(laneValue) {
  return `calc(${Math.round(laneValue * 1000) / 10}% - 5.5%)`;
}

function hitboxAt(centerY) {
  return {
    front: centerY + HITBOX_FRONT_OFFSET,
    back: centerY - HITBOX_BACK_OFFSET,
  };
}

function hitboxOverlap(a, b, buffer = 0) {
  return Math.min(a.front, b.front) - Math.max(a.back, b.back) > -buffer;
}

function overlapFromRects(a, b) {
  const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return {
    x,
    y,
    intersects: x > 0 && y > 0,
    centerDx: (b.left + b.right) / 2 - (a.left + a.right) / 2,
  };
}

function playerHitboxX() {
  const laneFloor = Math.floor(state.playerLanePosition);
  const laneNext = Math.min(lanes.length - 1, laneFloor + 1);
  const blend = Math.max(0, Math.min(1, state.playerLanePosition - laneFloor));
  const x = lanes[laneFloor] + (lanes[laneNext] - lanes[laneFloor]) * blend;
  return {
    left: x - PLAYER_HITBOX_HALF_WIDTH,
    right: x + PLAYER_HITBOX_HALF_WIDTH,
    center: x,
  };
}

function enemyHitboxX(enemy) {
  const laneX = enemy.laneX ?? lanes[Math.round(enemy.lanePosition)] ?? lanes[enemy.lane] ?? lanes[1];
  return {
    left: laneX - BOT_HITBOX_HALF_WIDTH,
    right: laneX + BOT_HITBOX_HALF_WIDTH,
    center: laneX,
  };
}

function laneHasSpace(targetLane, progress, minGap = 0.14, ignoreEnemy = null) {
  return !state.enemies.some((enemy) => {
    if (!enemy.alive || enemy === ignoreEnemy) return false;
    if (Math.round(enemy.lanePosition) !== targetLane) return false;
    return Math.abs(enemy.progress - progress) < minGap;
  });
}

function syncHitboxVisibility() {
  if (!playApp) return;
  playApp.classList.toggle("dev-hitbox-visible", state.devHitboxVisible);
}

function placePlayer(animated = true) {
  if (!animated) playerCar.style.transition = "none";
  const left = playerLeftCss();
  playerCar.style.left = left;
  if (playerShadow) {
    playerShadow.style.left = left;
    playerShadow.style.top = `${(PLAYER_Y + 0.035) * 100}%`;
  }
}

function createEnemy(prewarm = false, forcedLane = null) {
  const laneLoad = lanes.map(() => 0);
  state.enemies.forEach((enemy) => {
    laneLoad[enemy.lane] += 1;
  });

  const laneCandidates = lanes.map((_, index) => index).sort((a, b) => laneLoad[a] - laneLoad[b]);
  let chosenLane = forcedLane ?? laneCandidates[0];
  if (!prewarm && forcedLane == null && Math.random() < 0.7 && chosenLane === state.lane) {
    chosenLane = laneCandidates.find((lane) => lane !== state.lane) ?? chosenLane;
  }

  const enemy = document.createElement("img");
  enemy.className = "car enemy";
  const enemyShadow = document.createElement("div");
  enemyShadow.className = "car-shadow enemy-shadow";
  const quality = Math.random() > 0.5 ? "hd" : "pixel";
  const pack = botVehicleAssets[quality];
  enemy.src = pack[Math.floor(Math.random() * pack.length)];

  const startProgress = prewarm ? 0.22 + Math.random() * 0.34 : -0.18 + Math.random() * 0.3;
  const nearestGap = laneNearestGap(chosenLane, startProgress);
  if (!prewarm && (nearestGap < MIN_SPAWN_PROGRESS_GAP || !laneHasSpace(chosenLane, startProgress, 0.2))) {
    return;
  }
  enemy.style.left = `calc(${Math.round(lanes[chosenLane] * 1000) / 10}% - 5.5%)`;
  enemy.style.top = `${startProgress * 100}%`;
  enemyShadow.style.left = enemy.style.left;
  enemyShadow.style.top = `${(startProgress + 0.035) * 100}%`;

  const model = {
    element: enemy,
    lane: chosenLane,
    progress: startProgress,
    speed: BOT_BASE_SPEED + Math.random() * 0.04,
    desiredSpeed: BOT_BASE_SPEED + Math.random() * 0.04,
    cruiseSpeed: BOT_BASE_SPEED + Math.random() * 0.05,
    alive: true,
    countedOvertake: false,
    targetLane: chosenLane,
    lanePosition: chosenLane,
    laneShiftClock: 0,
    steeringDir: 0,
    laneX: lanes[chosenLane],
    nearMissChecked: false,
    shadowEl: enemyShadow,
  };

  enemy.style.transform = "translate(0px, 0px) rotate(0deg) scale(1)";

  carsLayer.appendChild(enemyShadow);
  carsLayer.appendChild(enemy);
  state.enemies.push(model);
}

function removeEnemy(model) {
  model.alive = false;
  model.element.remove();
  model.shadowEl?.remove();
  state.enemies = state.enemies.filter((enemy) => enemy !== model);
}

function doTakedown(model, direction = 1) {
  if (!model.alive) return;
  model.alive = false;
  const horizontal = direction > 0 ? 80 : -80;
  model.element.style.transition = "transform 650ms linear, opacity 650ms ease-in, top 650ms cubic-bezier(0.2, 0.8, 0.2, 1)";
  model.element.style.transform = `translate(${horizontal}px, -40px) rotate(${direction > 0 ? 1080 : -1080}deg) scale(0.6)`;
  model.element.style.opacity = "0";
  model.element.style.top = `${(model.progress - 0.05) * 100}%`;
  if (model.shadowEl) {
    model.shadowEl.style.transition = "transform 650ms linear, opacity 650ms ease-out, top 650ms linear";
    model.shadowEl.style.transform = `translateX(${horizontal * 0.7}px) scale(0.4)`;
    model.shadowEl.style.top = `${(model.progress + 0.1) * 100}%`;
    model.shadowEl.style.opacity = "0";
  }
  const takedownPoints = 750;
  award(takedownPoints);
  trackEvent("takedown", { lane: model.lane, score: state.score });
  state.takedowns += 1;
  pushEvent("takedown", { lane: model.lane, score: state.score });
  registerComboAction("takedown", takedownPoints, "TAKEDOWN +750", "takedown");
  flashScreen("takedown");
  playSfx(takedownSound);
  setTimeout(() => removeEnemy(model), 600);
}

function crashBotOnObstacle(model, obstacleLane) {
  if (!model.alive) return;
  model.alive = false;
  model.element.style.transition = "transform 360ms ease-out, opacity 360ms ease-out";
  const direction = model.steeringDir || (Math.random() > 0.5 ? 1 : -1);
  model.element.style.transform = `translate(${direction > 0 ? 26 : -26}px, 0px) rotate(${direction > 0 ? 132 : -132}deg) scale(0.92)`;
  model.element.style.opacity = "0";
  if (model.shadowEl) {
    model.shadowEl.style.transition = "transform 360ms ease-out, opacity 360ms ease-out";
    model.shadowEl.style.transform = `translateX(${direction > 0 ? 16 : -16}px) scale(0.7)`;
    model.shadowEl.style.opacity = "0.1";
  }
  trackEvent("obstacle_bot_hit", { lane: obstacleLane, score: state.score });
  setTimeout(() => removeEnemy(model), 370);
}

function endGame() {
  if (state.gameOver) return;
  state.gameOver = true;
  state.running = false;
  state.collisions += 1;
  breakCombo("collision");

  const progression = applyRunSummary({
    score: state.score,
    takedowns: state.takedowns,
    nearMisses: state.nearMisses,
    xpMultiplier: selectedDifficulty.xpMultiplier || 1,
  });

  trackEvent("run_summary", {
    score: state.score,
    takedowns: state.takedowns,
    nearMisses: state.nearMisses,
    xpGain: progression.xpGain,
    level: progression.profile.level,
    leveledUp: progression.leveledUp,
    difficulty: selectedDifficulty.id,
  });

  trackEvent("mission_progress", {
    dailyProgress: progression.daily?.progress || {},
    weeklyProgress: progression.weekly?.progress || {},
    dailyCompleted: progression.dailyStatus?.completed || 0,
    weeklyCompleted: progression.weeklyStatus?.completed || 0,
  });

  if (gameOverSummary) {
    const xpNeeded = 500 + (progression.profile.level - 1) * 120;
    gameOverSummary.textContent = `RUN +${progression.xpGain} XP · NIVEAU ${progression.profile.level} (${Math.floor(progression.profile.xp)}/${xpNeeded})`;
  }

  if (gameOverMissionSummary) {
    const d = progression.dailyStatus || { completed: 0, total: 0, claimable: 0 };
    const w = progression.weeklyStatus || { completed: 0, total: 0, claimable: 0 };
    gameOverMissionSummary.textContent = `Missions: Daily ${d.completed}/${d.total} (${d.claimable} à réclamer) · Weekly ${w.completed}/${w.total} (${w.claimable} à réclamer)`;
  }

  if (progression.leveledUp > 0) {
    addFloatingFeedback(`LEVEL UP x${progression.leveledUp}`, "takedown");
  }

  trackEvent("collision", { score: state.score, lane: state.lane });
  pushEvent("collision", { lane: state.lane, score: state.score });
  gameOverPanel.classList.remove("hidden");
  overlay.classList.add("hidden");
  settingsPopup.classList.add("hidden");
  confirmExitPopup.classList.add("hidden");
  pausePopup.classList.add("hidden");
  state.currentModal = "gameover";
  flashScreen("hit");
  playSfx(crashSound);
}

function syncOverlay() {
  const shouldShow = Boolean(state.currentModal);
  overlay.classList.toggle("hidden", !shouldShow);
}

function setModal(modalName) {
  state.currentModal = modalName;
  settingsPopup.classList.toggle("hidden", modalName !== "settings");
  confirmExitPopup.classList.toggle("hidden", modalName !== "confirmExit");
  pausePopup.classList.toggle("hidden", modalName !== "pause");
  gameOverPanel.classList.toggle("hidden", modalName !== "gameover");
  syncOverlay();
}


function attemptLaneTakedownOnLaneChange(previousLane, nextLane) {
  const now = performance.now();
  if (now - state.startedAt < START_GRACE_MS) return;
  if (nextLane === previousLane) return;
  // The actual takedown is resolved in handlePlayerBotBump using strict rect overlap.
}

function moveLane(direction) {
  const now = performance.now();
  if (now < state.laneChangeBlockedUntil) return;

  const previousLane = state.lane;
  const next = Math.max(0, Math.min(lanes.length - 1, state.lane + direction));
  if (next === state.lane) return;

  state.lane = next;
  state.laneChangeBlockedUntil = now + LANE_CHANGE_COOLDOWN_MS;
  state.shieldUntil = now + LANE_SHIELD_MS;
  dismissTutorialOverlay(true);
  attemptLaneTakedownOnLaneChange(previousLane, next);
  state.lastLaneChangeAt = now;
  state.lastLaneChangeDir = Math.sign(next - previousLane);
}


function handlePlayerBotBump(enemy, now) {
  if (!enemy.alive || state.gameOver) return;
  if (now - state.startedAt < START_GRACE_MS) return;

  const playerRect = playerCar.getBoundingClientRect();
  const enemyRect = enemy.element.getBoundingClientRect();
  const overlap = overlapFromRects(playerRect, enemyRect);
  if (!overlap.intersects) return;

  const isSteeringWindow = now - state.lastLaneChangeAt <= TAKEDOWN_STEER_WINDOW_MS;
  const steeringTowardEnemy = Math.sign(overlap.centerDx) === state.lastLaneChangeDir;

  if (isSteeringWindow && steeringTowardEnemy) {
    const knockDirection = Math.sign(overlap.centerDx) || state.lastLaneChangeDir || 1;
    doTakedown(enemy, knockDirection);
    state.shieldUntil = now + 140;
    return;
  }

  if (now >= state.shieldUntil) endGame();
}

function updateEnemy(enemy, dt, now) {
  if (!enemy.alive) return;

  enemy.laneShiftClock -= dt;
  if (enemy.laneShiftClock <= 0) {
    const laneMode = selectedDifficulty.laneChangeMode || "normal";
    const nextClock = laneMode === "rare" ? (1.4 + Math.random() * 2.8) : (0.6 + Math.random() * 1.6);
    enemy.laneShiftClock = nextClock;

    if (laneMode === "none") {
      enemy.targetLane = enemy.lane;
    } else {
      const laneChoices = [enemy.lane - 1, enemy.lane, enemy.lane + 1].filter((lane) => lane >= 0 && lane < lanes.length);
      if (laneMode === "rare" && Math.random() < 0.72) {
        enemy.targetLane = enemy.lane;
      } else {
        enemy.targetLane = laneChoices[Math.floor(Math.random() * laneChoices.length)];
      }
    }
  }

  if (enemy.targetLane !== enemy.lane) {
    const dir = enemy.targetLane > enemy.lane ? 1 : -1;
    enemy.steeringDir = dir;
    enemy.lanePosition += dir * dt * 1.35;
    if ((dir > 0 && enemy.lanePosition >= enemy.targetLane) || (dir < 0 && enemy.lanePosition <= enemy.targetLane)) {
      enemy.lanePosition = enemy.targetLane;
      enemy.lane = enemy.targetLane;
      enemy.steeringDir = 0;
    }
  } else {
    enemy.lanePosition += (enemy.lane - enemy.lanePosition) * dt * 8;
    enemy.steeringDir = 0;
  }

  const laneFloor = Math.floor(enemy.lanePosition);
  const laneNext = Math.min(lanes.length - 1, laneFloor + 1);
  const blend = Math.max(0, Math.min(1, enemy.lanePosition - laneFloor));
  const laneX = lanes[laneFloor] + (lanes[laneNext] - lanes[laneFloor]) * blend;
  enemy.laneX = laneX;
  enemy.element.style.left = laneToLeftCss(laneX);

  enemy.element.style.transform = `translate(0px, 0px) rotate(${enemy.steeringDir * 9}deg) scale(1)`;

  enemy.speed += (enemy.desiredSpeed - enemy.speed) * dt * 2.2;
  const playerRelativeSpeed = Math.max(BOT_MIN_SPEED + 0.01, state.speed / 1420 - BOT_PLAYER_SPEED_MARGIN);
  enemy.speed = Math.max(BOT_MIN_SPEED, Math.min(BOT_MAX_SPEED, playerRelativeSpeed, enemy.speed));
  enemy.progress += (state.speed / 1240 - enemy.speed) * dt;
  enemy.element.style.top = `${enemy.progress * 100}%`;
  if (enemy.shadowEl) {
    enemy.shadowEl.style.left = enemy.element.style.left;
    enemy.shadowEl.style.top = `${(enemy.progress + 0.035) * 100}%`;
    enemy.shadowEl.style.opacity = "0.28";
    enemy.shadowEl.style.transform = "translateX(0) scale(1)";
  }

  checkNearMiss(enemy);

  if (!enemy.countedOvertake && enemy.progress > 1.02) {
    enemy.countedOvertake = true;
    state.overtakes += 1;
    const overtakePoints = 180;
    award(overtakePoints);
    pushEvent("overtake", { lane: enemy.lane, score: state.score });
    registerComboAction("overtake", overtakePoints, "OVERTAKE +180", "overtake");
  }

  if (enemy.progress > 1.18 || enemy.progress < -0.25) {
    removeEnemy(enemy);
    return;
  }

  if (now - state.startedAt < START_GRACE_MS) return;

  handlePlayerBotBump(enemy, now);
}

function hasUnfairLaneBlock() {
  const blockWindowTop = 0.66;
  const blockWindowBottom = 0.9;
  return lanes.every((_, lane) => {
    return state.enemies.some((enemy) => {
      if (!enemy.alive || enemy.lane !== lane) return false;
      return enemy.progress > blockWindowTop && enemy.progress < blockWindowBottom;
    });
  });
}

function rebalanceUnfairBlock() {
  if (!hasUnfairLaneBlock()) return;
  const candidate = state.enemies.find((enemy) => {
    if (!enemy.alive) return false;
    return enemy.progress > 0.66 && enemy.progress < 0.9;
  });
  if (!candidate) return;
  candidate.progress = 0.22;
  candidate.element.style.top = `${candidate.progress * 100}%`;
}


function maybeAssignLaneChange(enemy) {
  const laneChoices = [enemy.lane - 1, enemy.lane + 1]
    .filter((lane) => lane >= 0 && lane < lanes.length)
    .filter((lane) => laneHasSpace(lane, enemy.progress, 0.16, enemy));
  if (!laneChoices.length) return;
  enemy.targetLane = laneChoices[Math.floor(Math.random() * laneChoices.length)];
}

function regulateBotTraffic(dt) {
  const alive = state.enemies.filter((enemy) => enemy.alive);
  const byLane = lanes.map(() => []);
  alive.forEach((enemy) => {
    byLane[Math.round(enemy.lanePosition)]?.push(enemy);
  });

  byLane.forEach((laneEnemies) => {
    laneEnemies.sort((a, b) => a.progress - b.progress);
    laneEnemies.forEach((enemy, index) => {
      const trafficDrift = (Math.random() - 0.5) * 0.012;
      const playerRelativeSpeed = Math.max(BOT_MIN_SPEED + 0.01, state.speed / 1420 - BOT_PLAYER_SPEED_MARGIN);
      const baseCruise = enemy.cruiseSpeed + difficultyLevel() * 0.006 + trafficDrift;
      const base = Math.min(baseCruise, playerRelativeSpeed);
      enemy.desiredSpeed = Math.max(BOT_MIN_SPEED, Math.min(BOT_MAX_SPEED, base));
      if (index === 0) return;
      const front = laneEnemies[index - 1];
      const gap = enemy.progress - front.progress;
      if (gap < BOT_SAFE_GAP) {
        enemy.desiredSpeed = Math.max(BOT_MIN_SPEED, front.speed - 0.06);
        if (gap < BOT_SAFE_GAP * 0.7) {
          maybeAssignLaneChange(enemy);
        }
      }
    });
  });

  for (let i = 0; i < alive.length; i += 1) {
    for (let j = i + 1; j < alive.length; j += 1) {
      const a = alive[i];
      const b = alive[j];
      if (Math.abs(a.lanePosition - b.lanePosition) > 0.45) continue;
      if (!hitboxOverlap(hitboxAt(a.progress), hitboxAt(b.progress))) continue;
      const rear = a.progress > b.progress ? a : b;
      const front = rear === a ? b : a;
      rear.speed = Math.max(BOT_MIN_SPEED, rear.speed - 0.08);
      front.speed = Math.min(BOT_MAX_SPEED, front.speed + 0.05);
      maybeAssignLaneChange(rear);
    }
  }
}


function spawnGiftDrop() {
  const lane = Math.floor(Math.random() * lanes.length);
  if (!laneHasSpace(lane, -0.22, 0.22)) return;
  const gift = document.createElement("img");
  gift.className = "gift-drop";
  gift.src = "./Assets/UI/Icons/ui_icon_gift_v01.svg";
  gift.style.left = laneToLeftCss(lanes[lane]);
  gift.style.top = "-22%";
  carsLayer.appendChild(gift);

  state.giftDrops.push({
    element: gift,
    lane,
    progress: -0.22,
    collected: false,
  });
}

function updateGiftDrops(dt) {
  const playerYBox = hitboxAt(PLAYER_Y);
  const playerX = playerHitboxX();
  state.giftDrops = state.giftDrops.filter((gift) => {
    gift.progress += (state.speed / 1240) * dt;
    gift.element.style.top = `${gift.progress * 100}%`;

    if (!gift.collected) {
      const giftY = hitboxAt(gift.progress);
      const yOverlap = Math.min(playerYBox.front, giftY.front) - Math.max(playerYBox.back, giftY.back);
      const giftXCenter = lanes[gift.lane];
      const giftLeft = giftXCenter - BOT_HITBOX_HALF_WIDTH;
      const giftRight = giftXCenter + BOT_HITBOX_HALF_WIDTH;
      const xOverlap = Math.min(playerX.right, giftRight) - Math.max(playerX.left, giftLeft);
      if (yOverlap > 0 && xOverlap > 0) {
        gift.collected = true;
        addWalletCredits(GIFT_REWARD_CREDITS);
        award(120);
        addFloatingFeedback(`CADEAU +${GIFT_REWARD_CREDITS} CR`, "neutral");
      }
    }

    if (gift.collected || gift.progress > 1.2) {
      gift.element.remove();
      return false;
    }
    return true;
  });
}

function giftSpawnTick(dt) {
  state.giftSpawnClock += dt * 1000;
  if (state.giftSpawnClock < state.giftSpawnTarget) return;
  state.giftSpawnClock = 0;
  state.giftSpawnTarget = GIFT_SPAWN_MIN_MS + Math.random() * (GIFT_SPAWN_MAX_MS - GIFT_SPAWN_MIN_MS);
  spawnGiftDrop();
}

function laneBlockedByObstacle(lane, progress = null) {
  return state.obstacles.some((obs) => {
    if (!obs.active || obs.lane !== lane) return false;
    if (progress == null) return true;
    return Math.abs(obs.progress - progress) < 0.16;
  });
}

function spawnObstacle() {
  if (state.obstacles.length >= MAX_ACTIVE_OBSTACLES) return;

  const laneCandidates = lanes
    .map((_, i) => i)
    .filter((lane) => !laneBlockedByObstacle(lane));
  if (!laneCandidates.length) return;

  let lane = laneCandidates[Math.floor(Math.random() * laneCandidates.length)];
  if (Math.random() < 0.72 && lane === state.lane) {
    const safe = laneCandidates.filter((i) => i !== state.lane);
    if (safe.length) lane = safe[Math.floor(Math.random() * safe.length)];
  }

  const el = document.createElement("img");
  el.className = "lane-obstacle";
  el.alt = "";
  el.setAttribute("aria-hidden", "true");
  let assetIndex = 0;
  const tryNextObstacleAsset = () => {
    if (assetIndex >= OBSTACLE_ASSET_CANDIDATES.length) {
      el.classList.add("lane-obstacle-fallback");
      el.removeAttribute("src");
      trackEvent("obstacle_asset_missing", {
        candidates: OBSTACLE_ASSET_CANDIDATES,
      });
      return;
    }

    const nextSrc = OBSTACLE_ASSET_CANDIDATES[assetIndex];
    assetIndex += 1;
    el.src = nextSrc;
  };

  el.addEventListener("error", tryNextObstacleAsset);
  tryNextObstacleAsset();
  el.style.left = laneToLeftCss(lanes[lane]);
  el.style.top = "-18%";
  carsLayer.appendChild(el);

  state.obstacles.push({
    element: el,
    lane,
    progress: -0.18,
    active: true,
  });

  addFloatingFeedback(`⚠ VOIE ${lane + 1} BLOQUÉE`, "neutral");
  trackEvent("obstacle_spawn", { lane });
}

function updateObstacles(dt) {
  state.obstacles = state.obstacles.filter((obs) => {
    if (!obs.active) return false;

    obs.progress += (state.speed / 1240) * dt;
    obs.element.style.top = `${obs.progress * 100}%`;

    const playerRect = playerCar.getBoundingClientRect();
    const obstacleRect = obs.element.getBoundingClientRect();

    state.enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      const enemyRect = enemy.element.getBoundingClientRect();
      if (!overlapFromRects(enemyRect, obstacleRect).intersects) return;
      crashBotOnObstacle(enemy, obs.lane);
    });

    const overlap = overlapFromRects(playerRect, obstacleRect);

    if (overlap.intersects) {
      trackEvent("obstacle_hit", { lane: obs.lane, score: state.score });
      endGame();
      obs.element.remove();
      return false;
    }

    if (obs.progress > 1.2) {
      obs.element.remove();
      return false;
    }

    return true;
  });
}

function pickSpawnLaneV2() {
  const laneScores = lanes.map((_, lane) => {
    let score = 0;

    if (laneBlockedByObstacle(lane, -0.05)) score += 1000;

    state.enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      const laneDistance = Math.abs(Math.round(enemy.lanePosition) - lane);
      if (laneDistance === 0) score += Math.max(0, 0.25 - Math.abs(enemy.progress + 0.02)) * 18;
      if (laneDistance === 1) score += Math.max(0, 0.2 - Math.abs(enemy.progress - 0.1)) * 6;
    });

    if (lane === state.lane) score += 2.5;

    return { lane, score };
  });

  laneScores.sort((a, b) => a.score - b.score);
  return laneScores[0]?.lane ?? Math.floor(Math.random() * lanes.length);
}

function spawnTick() {
  state.enemySpawnClock += performance.now() - state.lastFrame;
  const level = difficultyLevel();
  const denseTrafficActive = state.runEvent.type === "dense_traffic";
  const spawnIntervalBase = Math.max(520, ENEMY_SPAWN_INTERVAL_MS - level * 90);
  const difficultySpawnMult = selectedDifficulty.trafficSpawnMult || 1;
  const spawnIntervalRaw = denseTrafficActive
    ? Math.max(380, spawnIntervalBase * RUN_EVENT_DENSE_TRAFFIC_SPAWN_MULT)
    : spawnIntervalBase;
  const spawnInterval = Math.max(360, spawnIntervalRaw * difficultySpawnMult);

  const maxEnemiesBase = Math.min(9, MAX_ENEMIES + Math.floor(level / 2));
  const maxEnemiesAdjusted = Math.max(2, maxEnemiesBase + (selectedDifficulty.maxEnemiesDelta || 0));
  const maxEnemies = denseTrafficActive ? maxEnemiesAdjusted + RUN_EVENT_DENSE_TRAFFIC_MAX_BONUS : maxEnemiesAdjusted;

  if (selectedDifficulty.obstaclesEnabled) {
    state.obstacleSpawnClock += performance.now() - state.lastFrame;
    if (state.obstacleSpawnClock >= OBSTACLE_SPAWN_INTERVAL_MS) {
      state.obstacleSpawnClock = 0;
      spawnObstacle();
    }
  }
  if (state.enemySpawnClock < spawnInterval || state.enemies.length >= maxEnemies) return;
  state.enemySpawnClock = 0;

  const blockedNearPlayerLane = state.enemies.some((enemy) => enemy.alive && Math.round(enemy.lanePosition) === state.lane && enemy.progress > 0.62 && enemy.progress < 0.95);
  if (blockedNearPlayerLane) {
    // Try spawning but avoid player's lane in unfair window.
    createEnemy(false, pickSpawnLaneV2());
    const last = state.enemies[state.enemies.length - 1];
    if (last.lane === state.lane) {
      last.lane = (last.lane + 1 + Math.floor(Math.random() * 2)) % lanes.length;
      last.targetLane = last.lane;
      last.lanePosition = last.lane;
      last.element.style.left = laneToLeftCss(lanes[last.lane]);
    }
    return;
  }

  createEnemy(false, pickSpawnLaneV2());
  rebalanceUnfairBlock();
}

function updateDifficultyUiHint() {
  const level = difficultyLevel();
  if (level >= 4 && state.score % 500 < 12) {
    addFloatingFeedback("INTENSITÉ MAX", "neutral");
  }
}

function togglePause(force = null) {
  if (state.gameOver) return;
  state.running = force === null ? !state.running : force;
  if (state.running) {
    setModal(null);
    return;
  }
  setModal("pause");
}

function showSettings(show) {
  if (state.gameOver) return;
  if (show) {
    state.running = false;
    setModal("settings");
  } else {
    setModal(null);
    state.running = true;
  }
}

function mainLoop(now) {
  const rawFrameMs = now - state.lastFrame;
  frameBudgetTracker.tick(rawFrameMs);
  const dt = Math.min(rawFrameMs / 1000, 0.04);

  if (state.running) {
    updateRunEvents(now);
    state.speedProgressBoost = Math.min(220, state.speedProgressBoost + dt * (8 + difficultyLevel() * 1.2));
    const nightActive = state.runEvent.type === "night";
    const dynamicCruiseBase = 300 + state.speedProgressBoost;
    const dynamicCruise = nightActive ? dynamicCruiseBase * RUN_EVENT_NIGHT_CRUISE_MULT : dynamicCruiseBase;

    const speedCap = nightActive ? RUN_EVENT_NIGHT_SPEED_CAP : 520;
    if (state.keys.accel) state.speed = Math.min(speedCap, state.speed + 250 * dt);
    else if (state.keys.brake) state.speed = Math.max(190, state.speed - 260 * dt);
    else state.speed += (dynamicCruise - state.speed) * dt * 1.55;

    state.playerLanePosition += (state.lane - state.playerLanePosition) * Math.min(1, dt * 12);
    placePlayer();

    state.roadOffset += (state.speed * 1.35) * dt;
    road.style.backgroundPosition = `center ${state.roadOffset}px`;
    road.style.backgroundSize = `${160 + (state.speed - 200) * 0.11}% auto`;
    playerCar.style.transform = `scale(${1 + Math.max(0, (state.speed - 260)) / 2200})`;

    award(Math.floor(state.speed * dt * 0.75));
    giftSpawnTick(dt);
    spawnTick();
    updateDifficultyUiHint();

    const nowTime = performance.now();
    if (state.combo.expiresAt && nowTime > state.combo.expiresAt) breakCombo("timeout");
    regulateBotTraffic(dt);
    [...state.enemies].forEach((enemy) => updateEnemy(enemy, dt, nowTime));
    updateGiftDrops(dt);
    updateObstacles(dt);
  }

  scoreValue.textContent = String(state.score).padStart(10, "0");
  speedValue.textContent = String(Math.floor(state.speed)).padStart(4, "0");

  state.lastFrame = now;
  requestAnimationFrame(mainLoop);
}


async function ensureRadioPlayback({ start = true, forceNext = false, usePrevious = false } = {}) {
  if (!radioPlayer) return false;

  const stationFromUi = typeof radioSelect?.value === "string" ? radioSelect.value : getSavedRadioStation();
  const stationId = saveRadioStation(stationFromUi);
  if (radioSelect && radioSelect.value !== stationId) radioSelect.value = stationId;

  await prepareRadioStation(stationId, { forceReload: false });

  let targetTrack = null;

  if (usePrevious) {
    if (state.radioHistoryIndex > 0) {
      state.radioHistoryIndex -= 1;
      targetTrack = state.radioHistory[state.radioHistoryIndex] || null;
    }
  } else if (state.radioLoopCurrent && state.currentRadioTrack && !forceNext) {
    targetTrack = state.currentRadioTrack;
  } else if (!forceNext && state.radioHistoryIndex >= 0 && state.radioHistoryIndex < state.radioHistory.length - 1) {
    state.radioHistoryIndex += 1;
    targetTrack = state.radioHistory[state.radioHistoryIndex] || null;
  }

  if (!targetTrack) {
    targetTrack = pullNextTrack();
    if (!targetTrack) return false;
    pushRadioHistory(targetTrack);
  }

  state.currentRadioTrack = targetTrack;
  radioPlayer.src = targetTrack;
  radioPlayer.loop = false;
  radioPlayer.volume = 0.62;
  updateRadioControlsUi();

  if (!start) return false;
  return safePlay(radioPlayer);
}

function bindRadioUnlockOnFirstInteraction() {
  if (radioUnlockBound) return;
  radioUnlockBound = true;

  const unlock = async () => {
    const started = await ensureRadioPlayback({ start: true });
    dismissTutorialOverlay();
    if (!started) return;
    radioUnlockBound = false;
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("touchstart", unlock);
  };

  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock);
  window.addEventListener("touchstart", unlock, { passive: true });
}


function pauseAllRuntimeAudio() {
  radioPlayer?.pause();
  stopAndReset(crashSound);
  stopAndReset(takedownSound);
}

function onAppBackground() {
  if (!state.gameOver) {
    state.running = false;
    setModal("pause");
  }
  pauseAllRuntimeAudio();
}

async function navigateAway(targetHref) {
  state.running = false;
  pauseAllRuntimeAudio();
  await runExitTransition({ appRoot: playApp });
  window.location.href = targetHref;
}

function dismissTutorialOverlay(force = false) {
  if (state.tutorialSeen || !state.tutorialDismissFn) return;
  if (!force && performance.now() < state.tutorialVisibleUntil) return;
  state.tutorialSeen = true;
  state.tutorialDismissFn();
  state.tutorialDismissFn = null;
}

function setupTutorialOverlay() {
  const overlayEl = document.createElement("div");
  overlayEl.className = "tutorial-overlay";
  overlayEl.id = "tutorialOverlay";
  overlayEl.innerHTML = '<div class="tutorial-card"><div class="tutorial-hand">🖐️</div><div>Swipe ou tap gauche/droite pour changer de voie</div></div>';
  playApp?.appendChild(overlayEl);

  state.tutorialVisibleUntil = performance.now() + 900;
  state.tutorialDismissFn = () => overlayEl.remove();

  const keyDismiss = () => dismissTutorialOverlay();
  window.addEventListener("keydown", keyDismiss, { once: true });
}

function setupTapSwipeControls() {
  if (!playApp) return () => {};
  let pointerStartX = null;
  let pointerStartY = null;
  const SWIPE_MIN = 30;

  const onDown = (event) => {
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    state.touchModeDetected = true;
    playApp.classList.add("touch-ui-mode");
  };

  const onUp = (event) => {
    if (pointerStartX === null || pointerStartY === null) return;
    const dx = event.clientX - pointerStartX;
    const dy = event.clientY - pointerStartY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX >= SWIPE_MIN && absX > absY) {
      moveLane(dx > 0 ? 1 : -1);
    } else {
      const bounds = playApp.getBoundingClientRect();
      const localX = event.clientX - bounds.left;
      moveLane(localX < bounds.width / 2 ? -1 : 1);
    }

    pointerStartX = null;
    pointerStartY = null;
  };

  playApp.addEventListener("pointerdown", onDown, { passive: true });
  playApp.addEventListener("pointerup", onUp, { passive: true });

  return () => {
    playApp.removeEventListener("pointerdown", onDown);
    playApp.removeEventListener("pointerup", onUp);
  };
}


function clearRunEntities() {
  state.enemies.forEach((enemy) => {
    enemy.element.remove();
    enemy.shadowEl?.remove();
  });
  state.giftDrops.forEach((gift) => gift.element.remove());
  state.obstacles.forEach((obs) => obs.element.remove());
  state.enemies = [];
  state.giftDrops = [];
  state.obstacles = [];
}

function restartRun() {
  clearRunEntities();

  state.running = true;
  state.gameOver = false;
  state.lane = 1;
  state.playerLanePosition = 1;
  state.score = 0;
  state.speed = 280;
  state.roadOffset = 0;
  state.keys.left = false;
  state.keys.right = false;
  state.keys.accel = false;
  state.keys.brake = false;
  state.enemySpawnClock = 0;
  state.obstacleSpawnClock = 0;
  state.giftSpawnClock = 0;
  state.giftSpawnTarget = GIFT_SPAWN_MIN_MS + Math.random() * (GIFT_SPAWN_MAX_MS - GIFT_SPAWN_MIN_MS);
  state.laneChangeBlockedUntil = 0;
  state.startedAt = performance.now();
  state.shieldUntil = 0;
  state.speedProgressBoost = 0;
  state.combo = { count: 0, multiplier: 1, expiresAt: 0, lastSource: null };
  state.nearMisses = 0;
  state.runEvent = { type: null, endsAt: 0, nextAt: performance.now() + RUN_EVENT_MIN_INTERVAL_MS };
  state.currentModal = null;

  breakCombo("retry");
  setModal(null);
  overlay.classList.add("hidden");
  gameOverPanel.classList.add("hidden");
  pausePopup.classList.add("hidden");
  settingsPopup.classList.add("hidden");
  confirmExitPopup.classList.add("hidden");

  placePlayer(false);
  scoreValue.textContent = String(state.score).padStart(10, "0");
  speedValue.textContent = String(Math.floor(state.speed)).padStart(4, "0");

  for (let i = 0; i < 3; i += 1) {
    createEnemy(true);
  }

  state.lastFrame = performance.now();
  trackEvent("play_retry", { station: state.currentRadioStation || getSavedRadioStation() });
}

function bindControls() {
  const onKey = (pressed) => (event) => {
    const key = event.key.toLowerCase();

    if (["arrowleft", "a"].includes(key)) {
      if (pressed && !state.keys.left) moveLane(-1);
      state.keys.left = pressed;
      event.preventDefault();
    }

    if (["arrowright", "d"].includes(key)) {
      if (pressed && !state.keys.right) moveLane(1);
      state.keys.right = pressed;
      event.preventDefault();
    }

    if (["arrowup", "w"].includes(key)) {
      state.keys.accel = pressed;
      event.preventDefault();
    }

    if (["arrowdown", "s"].includes(key)) {
      state.keys.brake = pressed;
      event.preventDefault();
    }

    if (pressed && key === "escape") {
      togglePause();
    }
  };

  window.addEventListener("keydown", onKey(true));
  window.addEventListener("keyup", onKey(false));


  if (isFeatureEnabled("tutorialEnabled")) setupTutorialOverlay();
  setupTapSwipeControls();

  pauseBtn.addEventListener("click", () => togglePause());
  settingsBtn.addEventListener("click", () => showSettings(true));
  closeSettingsBtn.addEventListener("click", () => showSettings(false));

  menuBtnInSettings.addEventListener("click", () => {
    setModal("confirmExit");
  });

  confirmNo.addEventListener("click", () => {
    setModal("settings");
  });

  confirmYes.addEventListener("click", () => {
    navigateAway("index.html");
  });

  overlay.addEventListener("click", () => {
    if (state.currentModal === "confirmExit") {
      setModal("settings");
      return;
    }
    if (state.currentModal === "settings") {
      showSettings(false);
      return;
    }
    if (state.currentModal === "pause") {
      togglePause(true);
    }
  });

  resumeBtn.addEventListener("click", () => togglePause(true));
  menuBtnInPause?.addEventListener("click", () => {
    navigateAway("index.html");
  });
  retryBtn.addEventListener("click", () => restartRun());
  menuBtnGameOver.addEventListener("click", () => {
    navigateAway("index.html");
  });

  radioSelect?.addEventListener("change", async () => {
    saveRadioStation(radioSelect.value);
    await prepareRadioStation(radioSelect.value, { forceReload: true });
    ensureRadioPlayback({ start: true, forceNext: true });
  });

  prevTrackBtn?.addEventListener("click", () => {
    ensureRadioPlayback({ start: true, usePrevious: true });
  });

  nextTrackBtn?.addEventListener("click", () => {
    ensureRadioPlayback({ start: true, forceNext: true });
  });

  loopTrackBtn?.addEventListener("click", () => {
    state.radioLoopCurrent = !state.radioLoopCurrent;
    saveRadioRepeat(state.radioLoopCurrent);
    updateRadioControlsUi();
  });

  radioPlayer?.addEventListener("ended", () => {
    ensureRadioPlayback({ start: true, forceNext: !state.radioLoopCurrent });
  });


  document.addEventListener("visibilitychange", () => {
    if (document.hidden) onAppBackground();
  });
  window.addEventListener("blur", onAppBackground);
  window.addEventListener("pagehide", onAppBackground);
}

function init() {
  ensureStorageVersion(2);
  migrateLegacyStorageKeys();
  playerCar.src = selectedVehicleSrc();
  if (radioSelect) radioSelect.value = getSavedRadioStation();
  state.radioLoopCurrent = getSavedRadioRepeat();
  updateRadioControlsUi();
  state.playerLanePosition = state.lane;
  placePlayer(false);
  if (!isFeatureEnabled("tutorialEnabled")) state.tutorialSeen = true;
  bindControls();
  ensureRadioPlayback({ start: true }).then((started) => {
    if (!started) bindRadioUnlockOnFirstInteraction();
  });

  for (let i = 0; i < 3; i += 1) {
    createEnemy(true);
  }

  state.lastFrame = performance.now();
  trackEvent("play_session_start", { vehicle: localStorage.getItem(STORAGE_KEYS.selectedVehicle) || "PORSHE", difficulty: selectedDifficulty.id });
  addFloatingFeedback(`DIFFICULTÉ: ${selectedDifficulty.label.toUpperCase()} · XP x${selectedDifficulty.xpMultiplier}`, "neutral");
  requestAnimationFrame(mainLoop);
}

window.__ctGameState = state;
window.__ctGameDebug = {
  difficultyLevel,
  laneNearestGap,
};

init();
