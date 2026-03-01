import Phaser from "phaser";
import { cars, getCarById, loadProfile, saveProfile } from "../state/profile.js";

export class GarageScene extends Phaser.Scene {
  constructor() {
    super("garage");
    this.index = 0;
  }

  create() {
    const { width, height } = this.scale;
    const profile = loadProfile();

    this.index = cars.findIndex((car) => car.id === profile.selectedCar);
    if (this.index < 0) this.index = 0;

    this.add.rectangle(width / 2, height / 2, width, height, 0x101317);
    this.add.text(width / 2, height * 0.1, "GARAGE", {
      fontFamily: "Impact, Arial",
      fontSize: "54px",
      color: "#f4f8ff",
      stroke: "#000",
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.carBody = this.add.image(width / 2, height * 0.44, "car-base").setScale(2.5);
    this.carName = this.add.text(width / 2, height * 0.59, "", {
      fontFamily: "Arial",
      fontSize: "36px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.carStats = this.add.text(width / 2, height * 0.65, "", {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#b2c7e3",
      align: "center",
    }).setOrigin(0.5);

    this.createArrow(width * 0.18, height * 0.44, "<", -1);
    this.createArrow(width * 0.82, height * 0.44, ">", 1);

    this.createButton(width / 2, height * 0.77, "CONFIRMER VOITURE", () => {
      const updated = loadProfile();
      updated.selectedCar = cars[this.index].id;
      saveProfile(updated);
      this.flashMessage(`${cars[this.index].label} sélectionnée`);
    });

    this.createButton(width / 2, height * 0.88, "RETOUR MENU", () => this.scene.start("menu"));

    this.message = this.add.text(width / 2, height * 0.96, "", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#73ff86",
    }).setOrigin(0.5);

    this.refreshCar();
  }

  createArrow(x, y, char, direction) {
    const btn = this.add.circle(x, y, 40, 0x1f2938).setStrokeStyle(3, 0xffffff);
    const label = this.add.text(x, y, char, {
      fontFamily: "Impact, Arial",
      fontSize: "42px",
      color: "#fff",
    }).setOrigin(0.5);

    btn.setInteractive({ useHandCursor: true });
    btn.on("pointerup", () => {
      this.index = Phaser.Math.Wrap(this.index + direction, 0, cars.length);
      this.refreshCar();
    });

    btn.on("pointerover", () => btn.setFillStyle(0x2f3f56));
    btn.on("pointerout", () => btn.setFillStyle(0x1f2938));

    this.input.keyboard.on(direction === -1 ? "keydown-LEFT" : "keydown-RIGHT", () => {
      this.index = Phaser.Math.Wrap(this.index + direction, 0, cars.length);
      this.refreshCar();
    });

    this.add.existing(label);
  }

  refreshCar() {
    const selected = getCarById(cars[this.index].id);
    this.carBody.setTint(selected.color);
    this.carName.setText(selected.label);
    this.carStats.setText([`Bonus vitesse: +${selected.speedBonus}`, "Maniabilité: Standard", "Statistiques Android prêtes"].join("\n"));
  }

  flashMessage(text) {
    this.message.setText(text);
    this.time.delayedCall(1400, () => this.message.setText(""));
  }

  createButton(x, y, label, callback) {
    const bg = this.add.rectangle(x, y, 380, 80, 0x1974d2).setStrokeStyle(3, 0xffffff);
    const text = this.add.text(x, y, label, {
      fontFamily: "Impact, Arial",
      fontSize: "30px",
      color: "#ffffff",
    }).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerup", callback);
    bg.on("pointerover", () => bg.setFillStyle(0x2f87e7));
    bg.on("pointerout", () => bg.setFillStyle(0x1974d2));

    this.input.keyboard.on("keydown-ENTER", callback);

    this.add.existing(text);
  }
}
