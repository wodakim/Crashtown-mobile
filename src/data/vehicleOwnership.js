const VEHICLE_OWNERSHIP_KEY = "ct_vehicle_ownership_v1";

const DEFAULT_STATE = {
  ownedCars: ["RX7"],
  ownedColorsByCar: {
    RX7: ["white"],
  },
};

function uniqueUpper(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((item) => String(item).toUpperCase()))];
}

function uniqueLower(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((item) => String(item).toLowerCase()))];
}

function normalizeOwnership(raw) {
  const state = raw && typeof raw === "object" ? raw : {};
  const ownedCars = uniqueUpper(state.ownedCars);
  const ownedColorsByCar = {};

  const srcMap = state.ownedColorsByCar && typeof state.ownedColorsByCar === "object" ? state.ownedColorsByCar : {};
  Object.entries(srcMap).forEach(([carId, colors]) => {
    ownedColorsByCar[String(carId).toUpperCase()] = uniqueLower(colors);
  });

  DEFAULT_STATE.ownedCars.forEach((carId) => {
    if (!ownedCars.includes(carId)) ownedCars.push(carId);
  });
  Object.entries(DEFAULT_STATE.ownedColorsByCar).forEach(([carId, colors]) => {
    const key = String(carId).toUpperCase();
    const merged = uniqueLower([...(ownedColorsByCar[key] || []), ...colors]);
    ownedColorsByCar[key] = merged;
  });

  return { ownedCars, ownedColorsByCar };
}

export function getVehicleOwnership() {
  try {
    const raw = localStorage.getItem(VEHICLE_OWNERSHIP_KEY);
    if (!raw) return normalizeOwnership(DEFAULT_STATE);
    return normalizeOwnership(JSON.parse(raw));
  } catch {
    return normalizeOwnership(DEFAULT_STATE);
  }
}

export function saveVehicleOwnership(state) {
  const normalized = normalizeOwnership(state);
  localStorage.setItem(VEHICLE_OWNERSHIP_KEY, JSON.stringify(normalized));
  return normalized;
}

export function isVehicleOwned(vehicleId) {
  const id = String(vehicleId).toUpperCase();
  return getVehicleOwnership().ownedCars.includes(id);
}

export function isVehicleColorOwned(vehicleId, colorToken) {
  const id = String(vehicleId).toUpperCase();
  const color = String(colorToken || "white").toLowerCase();
  const state = getVehicleOwnership();
  return (state.ownedColorsByCar[id] || []).includes(color);
}

export function unlockVehicle(vehicleId) {
  const id = String(vehicleId).toUpperCase();
  const state = getVehicleOwnership();
  if (!state.ownedCars.includes(id)) state.ownedCars.push(id);
  const colors = uniqueLower([...(state.ownedColorsByCar[id] || []), "white"]);
  state.ownedColorsByCar[id] = colors;
  return saveVehicleOwnership(state);
}

export function unlockVehicleColor(vehicleId, colorToken) {
  const id = String(vehicleId).toUpperCase();
  const color = String(colorToken || "white").toLowerCase();
  const state = unlockVehicle(id);
  const colors = uniqueLower([...(state.ownedColorsByCar[id] || []), color]);
  state.ownedColorsByCar[id] = colors;
  return saveVehicleOwnership(state);
}
