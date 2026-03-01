import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { GarageScene } from "./scenes/GarageScene.js";
import { RaceScene } from "./scenes/RaceScene.js";
import { UIScene } from "./scenes/UIScene.js";

export const gameConfig = {
  type: Phaser.AUTO,
  parent: "game-root",
  width: 1080,
  height: 2400,
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GarageScene, RaceScene, UIScene],
};
