const STORAGE_KEY = "crashtown_profile_v1";

const defaultProfile = {
  selectedCar: "porshe",
  bestScore: 0,
  totalRuns: 0,
  coins: 0,
};

export const cars = [
  { id: "porshe", label: "PORSHE", color: 0xff4d4d, speedBonus: 0 },
  { id: "bmw", label: "BMW", color: 0x4da6ff, speedBonus: 15 },
  { id: "gallardo", label: "GALLARDO", color: 0xffd24d, speedBonus: 8 },
  { id: "rx7", label: "RX7", color: 0x66e07f, speedBonus: 5 },
  { id: "chiron", label: "CHIRON", color: 0xb366ff, speedBonus: 20 },
];

export function loadProfile() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultProfile };
    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    return { ...defaultProfile };
  }
}

export function saveProfile(profile) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function getCarById(id) {
  return cars.find((car) => car.id === id) ?? cars[0];
}
