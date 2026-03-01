import Phaser from "phaser";
import { loadProfile } from "../state/profile.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create() {
    const { width, height } = this.scale;
    const profile = loadProfile();

    this.add.rectangle(width / 2, height / 2, width, height, 0x101825);
    this.add.text(width / 2, height * 0.12, "CRASHTOWN", {
      fontFamily: "Impact, Arial",
      fontSize: "48px",
      color: "#ffd45f",
      stroke: "#000000",
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.22, "Prototype Android - Build 0.1", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#d4deed",
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.3, `Best Score: ${profile.bestScore}`, {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.35, `Coins: ${profile.coins}`, {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.createButton(width / 2, height * 0.52, "GARAGE", () => {
      this.scene.start("garage");
    });

    this.createButton(width / 2, height * 0.65, "LANCER COURSE", () => {
      this.scene.start("race");
    });

    this.add.text(width / 2, height * 0.9, "Optimisé clavier + tactile", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#8ca2bf",
    }).setOrigin(0.5);
  }

  createButton(x, y, label, onTap) {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 330, 90, 0x2f81f7).setStrokeStyle(4, 0xffffff);
    const text = this.add.text(0, 0, label, {
      fontFamily: "Impact, Arial",
      fontSize: "36px",
      color: "#ffffff",
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(330, 90);
    container.setInteractive({ useHandCursor: true });
    container.on("pointerup", onTap);

    container.on("pointerover", () => bg.setFillStyle(0x4a97ff));
    container.on("pointerout", () => bg.setFillStyle(0x2f81f7));
  }
}
