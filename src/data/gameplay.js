export const gameplayConfig = {
  lanes: [0.27, 0.43, 0.59, 0.75],
  enemySpawnIntervalMs: 980,
  maxEnemies: 6,
  bot: {
    baseSpeed: 0.18,
    maxSpeed: 0.45,
    minSpeed: 0.12,
    safeGap: 0.12,
    playerSpeedMargin: 0.03,
  },
  player: {
    y: 0.79,
    hitboxHalfWidth: 0.046,
    hitboxFrontOffset: 0.048,
    hitboxBackOffset: 0.05,
    laneChangeCooldownMs: 120,
    laneShieldMs: 210,
    startGraceMs: 2600,
  },
  race: {
    baseDifficultyScoreStep: 1800,
    minSpawnProgressGap: 0.22,
    maxRecentEvents: 12,
  },
  takedown: {
    steerWindowMs: 520,
    overlapBuffer: 0.006,
  },
  gift: {
    rewardCredits: 50,
    spawnMinMs: 120000,
    spawnMaxMs: 300000,
  },
  obstacle: {
    spawnIntervalMs: 3600,
    maxActive: 2,
    minGapFromPlayerLane: 0.12,
  },
  runEvents: {
    minIntervalMs: 120000,
    maxIntervalMs: 180000,
    durationMs: 120000,
    denseTrafficSpawnMultiplier: 0.72,
    denseTrafficMaxEnemiesBonus: 1,
    nightCruiseMultiplier: 0.9,
    nightSpeedCap: 470,
  },
};
