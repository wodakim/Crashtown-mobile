export const RUN_DIFFICULTIES = {
  easy: {
    id: "easy",
    label: "Facile",
    description: "Trafic très modéré, sans obstacle, bots stables.",
    xpMultiplier: 0.25,
    trafficSpawnMult: 1.45,
    maxEnemiesDelta: -2,
    laneChangeMode: "none",
    obstaclesEnabled: false,
  },
  normal: {
    id: "normal",
    label: "Normal",
    description: "Trafic amusant, sans obstacle, bots changent rarement de voie.",
    xpMultiplier: 1,
    trafficSpawnMult: 1.0,
    maxEnemiesDelta: 0,
    laneChangeMode: "rare",
    obstaclesEnabled: false,
  },
  hard: {
    id: "hard",
    label: "Difficile",
    description: "Trafic dense organique, obstacles actifs.",
    xpMultiplier: 1.5,
    trafficSpawnMult: 0.82,
    maxEnemiesDelta: 1,
    laneChangeMode: "normal",
    obstaclesEnabled: true,
  },
};

export function getRunDifficulty(id) {
  return RUN_DIFFICULTIES[id] || RUN_DIFFICULTIES.normal;
}
