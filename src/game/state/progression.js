import { STORAGE_KEYS } from "../../core/keys.js";

const DEFAULT_PROFILE = {
  nickname: "CrashPilot",
  xp: 0,
  level: 1,
  rank: "Rookie",
  totalRuns: 0,
  bestScore: 0,
};

const DAILY_MISSIONS = {
  run_1: { label: "Terminer 1 run", target: 1, rewardCredits: 300, field: "runs" },
  near_miss_3: { label: "Faire 3 near-miss", target: 3, rewardCredits: 500, field: "nearMisses" },
  takedown_1: { label: "Réaliser 1 takedown", target: 1, rewardCredits: 700, field: "takedowns" },
};

const WEEKLY_MISSIONS = {
  runs_10: { label: "Terminer 10 runs", target: 10, rewardCredits: 2000, field: "runs" },
  near_miss_10: { label: "Faire 10 near-miss", target: 10, rewardCredits: 1500, field: "nearMisses" },
};

function safeParse(raw, fallback) {
  try {
    return raw ? { ...fallback, ...JSON.parse(raw) } : { ...fallback };
  } catch {
    return { ...fallback };
  }
}

function dateKey() {
  return new Date().toISOString().slice(0, 10);
}

function weekKey() {
  const d = new Date();
  const onejan = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const dayMs = 86400000;
  const week = Math.ceil((((d - onejan) / dayMs) + onejan.getUTCDay() + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function rankFromLevel(level) {
  if (level >= 20) return "Legend";
  if (level >= 12) return "Pro";
  if (level >= 6) return "Street";
  return "Rookie";
}

function levelThreshold(level) {
  return 500 + (level - 1) * 120;
}

function readWallet() {
  const credits = Number(localStorage.getItem(STORAGE_KEYS.walletCredits));
  const emeralds = Number(localStorage.getItem(STORAGE_KEYS.walletEmeralds));
  return {
    credits: Number.isFinite(credits) && credits >= 0 ? Math.floor(credits) : 2500,
    emeralds: Number.isFinite(emeralds) && emeralds >= 0 ? Math.floor(emeralds) : 25,
  };
}

function writeWallet({ credits, emeralds }) {
  localStorage.setItem(STORAGE_KEYS.walletCredits, String(Math.max(0, Math.floor(credits))));
  localStorage.setItem(STORAGE_KEYS.walletEmeralds, String(Math.max(0, Math.floor(emeralds))));
}

function normalizeMissionState(raw, defs, keyGetter) {
  const base = {
    key: keyGetter(),
    progress: {},
    claimed: {},
    bonusClaimed: false,
  };
  const state = safeParse(raw, base);
  if (state.key !== base.key) return base;

  Object.keys(defs).forEach((id) => {
    state.progress[id] = Number.isFinite(Number(state.progress[id])) ? Math.max(0, Number(state.progress[id])) : 0;
    state.claimed[id] = Boolean(state.claimed[id]);
  });

  state.bonusClaimed = Boolean(state.bonusClaimed);
  return state;
}

function readProfile() {
  const state = safeParse(localStorage.getItem(STORAGE_KEYS.playerProfile), DEFAULT_PROFILE);
  return {
    nickname: String(state.nickname || DEFAULT_PROFILE.nickname).slice(0, 20),
    xp: Number.isFinite(Number(state.xp)) ? Math.max(0, Number(state.xp)) : 0,
    level: Number.isFinite(Number(state.level)) ? Math.max(1, Number(state.level)) : 1,
    rank: String(state.rank || DEFAULT_PROFILE.rank),
    totalRuns: Number.isFinite(Number(state.totalRuns)) ? Math.max(0, Number(state.totalRuns)) : 0,
    bestScore: Number.isFinite(Number(state.bestScore)) ? Math.max(0, Number(state.bestScore)) : 0,
  };
}

function writeProfile(profile) {
  localStorage.setItem(STORAGE_KEYS.playerProfile, JSON.stringify(profile));
}

function readDailyMissions() {
  return normalizeMissionState(localStorage.getItem(STORAGE_KEYS.dailyMissions), DAILY_MISSIONS, dateKey);
}

function writeDailyMissions(state) {
  localStorage.setItem(STORAGE_KEYS.dailyMissions, JSON.stringify(state));
}

function readWeeklyMissions() {
  return normalizeMissionState(localStorage.getItem(STORAGE_KEYS.weeklyMissions), WEEKLY_MISSIONS, weekKey);
}

function writeWeeklyMissions(state) {
  localStorage.setItem(STORAGE_KEYS.weeklyMissions, JSON.stringify(state));
}

function missionStatus(state, defs) {
  const total = Object.keys(defs).length;
  const completed = Object.entries(defs).filter(([id, def]) => Number(state.progress[id] || 0) >= def.target).length;
  const claimable = Object.entries(defs).filter(([id, def]) => Number(state.progress[id] || 0) >= def.target && !state.claimed[id]).length;
  return { total, completed, claimable };
}

function updateMissionProgress(state, defs, summary) {
  Object.entries(defs).forEach(([id, def]) => {
    const value = Number(summary?.[def.field] || 0);
    state.progress[id] = Math.min(def.target, (state.progress[id] || 0) + Math.max(0, value));
  });
}

export function applyRunSummary(summary = {}) {
  const score = Math.max(0, Number(summary.score || 0));
  const takedowns = Math.max(0, Number(summary.takedowns || 0));
  const nearMisses = Math.max(0, Number(summary.nearMisses || 0));

  const profile = readProfile();
  profile.totalRuns += 1;
  profile.bestScore = Math.max(profile.bestScore, score);

  const rawXp = 100 + Math.floor(score / 120) + (nearMisses * 20) + (takedowns * 80);
  const xpMultiplier = Math.max(0.1, Number(summary.xpMultiplier || 1));
  const xpGain = Math.max(1, Math.floor(rawXp * xpMultiplier));
  profile.xp += xpGain;

  let leveledUp = 0;
  while (profile.xp >= levelThreshold(profile.level)) {
    profile.xp -= levelThreshold(profile.level);
    profile.level += 1;
    leveledUp += 1;
  }
  profile.rank = rankFromLevel(profile.level);
  writeProfile(profile);

  const daily = readDailyMissions();
  const weekly = readWeeklyMissions();
  updateMissionProgress(daily, DAILY_MISSIONS, { runs: 1, nearMisses, takedowns });
  updateMissionProgress(weekly, WEEKLY_MISSIONS, { runs: 1, nearMisses, takedowns });
  writeDailyMissions(daily);
  writeWeeklyMissions(weekly);

  return {
    xpGain,
    xpMultiplier,
    leveledUp,
    profile,
    daily,
    weekly,
    dailyStatus: missionStatus(daily, DAILY_MISSIONS),
    weeklyStatus: missionStatus(weekly, WEEKLY_MISSIONS),
  };
}

export function claimDailyRewards() {
  const daily = readDailyMissions();
  const wallet = readWallet();
  let gainCredits = 0;
  let gainEmeralds = 0;

  Object.entries(DAILY_MISSIONS).forEach(([id, def]) => {
    const completed = (daily.progress[id] || 0) >= def.target;
    if (completed && !daily.claimed[id]) {
      daily.claimed[id] = true;
      gainCredits += def.rewardCredits;
    }
  });

  const allDone = Object.keys(DAILY_MISSIONS).every((id) => (daily.progress[id] || 0) >= DAILY_MISSIONS[id].target);
  if (allDone && !daily.bonusClaimed) {
    daily.bonusClaimed = true;
    gainEmeralds += 5;
  }

  if (gainCredits > 0 || gainEmeralds > 0) {
    wallet.credits += gainCredits;
    wallet.emeralds += gainEmeralds;
    writeWallet(wallet);
    writeDailyMissions(daily);
  }

  return { gainCredits, gainEmeralds, daily, dailyStatus: missionStatus(daily, DAILY_MISSIONS) };
}


export function claimWeeklyRewards() {
  const weekly = readWeeklyMissions();
  const wallet = readWallet();
  let gainCredits = 0;

  Object.entries(WEEKLY_MISSIONS).forEach(([id, def]) => {
    const completed = (weekly.progress[id] || 0) >= def.target;
    if (completed && !weekly.claimed[id]) {
      weekly.claimed[id] = true;
      gainCredits += def.rewardCredits;
    }
  });

  if (gainCredits > 0) {
    wallet.credits += gainCredits;
    writeWallet(wallet);
    writeWeeklyMissions(weekly);
  }

  return { gainCredits, weekly, weeklyStatus: missionStatus(weekly, WEEKLY_MISSIONS) };
}

export function getProgressState() {
  return {
    profile: readProfile(),
    daily: readDailyMissions(),
    weekly: readWeeklyMissions(),
    dailyDefs: DAILY_MISSIONS,
    weeklyDefs: WEEKLY_MISSIONS,
  };
}
