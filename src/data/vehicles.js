import { GENERATED_VEHICLE_VARIANTS } from "./vehicles.generated.js";

export const VEHICLE_QUALITY_ORDER = ["hd", "pixel"];
export const COLOR_TOKEN_ORDER = ["white", "yellow", "blue", "red", "green"];

const COLOR_META = {
  white: { token: "white", label: "Blanc", hex: "#ffffff" },
  yellow: { token: "yellow", label: "Jaune", hex: "#f2d037" },
  blue: { token: "blue", label: "Bleu", hex: "#4ca8ff" },
  red: { token: "red", label: "Rouge", hex: "#ff5353" },
  green: { token: "green", label: "Vert", hex: "#62d681" },
};

function colorList(...tokens) {
  return tokens.map((token) => COLOR_META[token]).filter(Boolean);
}

const BASE_VEHICLE_CATALOG = [
  {
    id: "PORSHE",
    name: "PORSHE",
    baseColor: "white",
    sound: "/Assets/Sounds/Garage/Car/Sound_effect_car_porsche_sample_v01.mp3",
    shop: {
      carPriceCredits: 0,
      colorPricesCredits: { white: 0, yellow: 0, blue: 0, red: 0, green: 0 },
    },
    colors: colorList("white", "yellow", "blue", "red", "green"),
  },
  {
    id: "BMW",
    name: "BMW",
    baseColor: "white",
    sound: "/Assets/Sounds/Garage/Car/Sound_effect_car_bmw_sample_v01.mp3",
    shop: {
      carPriceCredits: 2500,
      colorPricesCredits: { white: 0, yellow: 350, blue: 350, red: 350, green: 350 },
    },
    colors: colorList("white", "yellow", "blue", "red", "green"),
  },
  {
    id: "GALLARDO",
    name: "GALLARDO",
    baseColor: "white",
    sound: "/Assets/Sounds/Garage/Car/Sound_effect_car_gallardo_sample_v01.mp3",
    shop: {
      carPriceCredits: 3200,
      colorPricesCredits: { white: 0, yellow: 450, blue: 450, red: 450, green: 450 },
    },
    colors: colorList("white", "yellow", "blue", "red", "green"),
  },
  {
    id: "RX7",
    name: "RX7",
    baseColor: "white",
    sound: "",
    shop: {
      carPriceCredits: 4200,
      colorPricesCredits: { white: 0, yellow: 600, blue: 600, red: 600, green: 600 },
    },
    colors: colorList("white", "yellow", "blue", "red", "green"),
  },
  {
    id: "CHIRON",
    name: "CHIRON",
    baseColor: "white",
    sound: "",
    shop: {
      carPriceCredits: 7000,
      colorPricesCredits: { white: 0, yellow: 900, blue: 900, red: 900, green: 900 },
    },
    colors: colorList("white", "yellow", "blue", "red", "green"),
  },
  {
    id: "CAMARO",
    name: "CAMARO",
    baseColor: "white",
    sound: "",
    shop: {
      carPriceCredits: 5500,
      colorPricesCredits: { white: 0, yellow: 700, blue: 700, red: 700, green: 700 },
    },
    colors: colorList("white", "yellow", "blue", "red", "green"),
  },
];

function firstDefined(...values) {
  return values.find((value) => typeof value === "string" && value.length > 0) || "";
}

function pickColorPath(variantsByQuality, quality, colorToken, fallbackColor) {
  const qualityVariants = variantsByQuality?.[quality] || {};
  return firstDefined(
    qualityVariants[colorToken],
    qualityVariants[fallbackColor],
    qualityVariants.base,
  );
}

export const VEHICLE_CATALOG = BASE_VEHICLE_CATALOG.map((vehicle) => {
  const generated = GENERATED_VEHICLE_VARIANTS[vehicle.id] || {};
  const fallbackColor = vehicle.baseColor || "white";
  const variants = {
    hd: pickColorPath(generated, "hd", fallbackColor, fallbackColor),
    pixel: pickColorPath(generated, "pixel", fallbackColor, fallbackColor),
  };

  return {
    ...vehicle,
    variants,
    generatedVariants: generated,
  };
});

export function getVehicleById(vehicleId) {
  return VEHICLE_CATALOG.find((vehicle) => vehicle.id === vehicleId) || VEHICLE_CATALOG[0];
}

export function getVehicleVariant(vehicleId, quality = "hd", colorToken = "white") {
  const vehicle = getVehicleById(vehicleId);
  const generated = vehicle.generatedVariants || {};
  return firstDefined(
    pickColorPath(generated, quality, colorToken, vehicle.baseColor),
    vehicle.variants[quality],
    vehicle.variants.hd,
  );
}

export function getVehicleCard(vehicleId, quality = "hd", colorToken = "white") {
  const vehicle = getVehicleById(vehicleId);
  const color = vehicle.colors.find((entry) => entry.token === colorToken) || vehicle.colors[0];
  const colorPrice = vehicle.shop?.colorPricesCredits?.[color?.token || "white"] || 0;
  return {
    id: vehicle.id,
    name: vehicle.name,
    image: getVehicleVariant(vehicle.id, quality, color?.token || "white"),
    quality,
    color,
    carPriceCredits: vehicle.shop?.carPriceCredits || 0,
    colorPriceCredits: colorPrice,
    totalPriceCredits: (vehicle.shop?.carPriceCredits || 0) + colorPrice,
  };
}

export function listVehiclesForQuality(quality = "hd", colorToken = "white") {
  return VEHICLE_CATALOG.map((vehicle) => [
    `${vehicle.name} ${quality.toUpperCase()}`,
    getVehicleVariant(vehicle.id, quality, colorToken),
  ]);
}
