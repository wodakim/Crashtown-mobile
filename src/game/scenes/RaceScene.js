import Phaser from "phaser";
import { getCarById, loadProfile, saveProfile } from "../state/profile.js";

const LANES = [0.26, 0.5, 0.74];

export class RaceScene extends Phaser.Scene {
  constructor() {
    super("race");
    this.playerLane = 1;
    this.enemyCars = [];
    this.score = 0;
    this.speed = 240;
    this.running = true;
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x191d26);
    this.road = this.add.tileSprite(width / 2, height / 2, width * 0.62, height, "panel").setTint(0x30343d);

    this.add.rectangle(width * 0.15, height / 2, width * 0.13, height, 0x0f131a, 0.85);
    this.add.rectangle(width * 0.85, height / 2, width * 0.13, height, 0x0f131a, 0.85);

    this.profile = loadProfile();
    this.selectedCar = getCarById(this.profile.selectedCar);

    this.player = this.add.image(width * LANES[this.playerLane], height * 0.83, "car-base").setScale(1.35).setTint(this.selectedCar.color);

    this.scoreLabel = this.add.text(width * 0.06, height * 0.03, "SCORE 000000", {
      fontFamily: "Impact, Arial",
      fontSize: "36px",
      color: "#ffffff",
      stroke: "#000",
      strokeThickness: 4,
    });

    this.speedLabel = this.add.text(width * 0.06, height * 0.09, "SPEED 000", {
      fontFamily: "Impact, Arial",
      fontSize: "28px",
      color: "#ffd45f",
      stroke: "#000",
      strokeThickness: 3,
    });

    this.pauseBtn = this.createCornerButton(width * 0.88, height * 0.08, "II", () => {
      if (!this.running) return;
      this.scene.pause();
      this.scene.launch("ui", { from: "race" });
    });

    this.spawnEnemies(5);
    this.setupControls();
  }

  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on("keydown-A", () => this.movePlayer(-1));
    this.input.keyboard.on("keydown-D", () => this.movePlayer(1));

    this.touchStartX = 0;
    this.input.on("pointerdown", (pointer) => {
      this.touchStartX = pointer.x;
    });

    this.input.on("pointerup", (pointer) => {
      const delta = pointer.x - this.touchStartX;
      if (Math.abs(delta) < 24) return;
      this.movePlayer(delta < 0 ? -1 : 1);
    });
  }

  movePlayer(direction) {
    this.playerLane = Phaser.Math.Clamp(this.playerLane + direction, 0, LANES.length - 1);
    const targetX = this.scale.width * LANES[this.playerLane];
    this.tweens.add({
      targets: this.player,
      x: targetX,
      duration: 120,
      ease: "Sine.easeOut",
    });
  }

  spawnEnemies(count) {
    for (let i = 0; i < count; i += 1) {
      const lane = Phaser.Math.Between(0, 2);
      const enemy = this.add.image(this.scale.width * LANES[lane], -180 - i * 220, "car-base").setScale(1.3);
      enemy.setTint(Phaser.Display.Color.RandomRGB().color);
      enemy.lane = lane;
      this.enemyCars.push(enemy);
    }
  }

  update(_, delta) {
    if (!this.running) return;

    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) this.movePlayer(-1);
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) this.movePlayer(1);

    const dt = delta / 1000;
    this.road.tilePositionY -= (this.speed + this.selectedCar.speedBonus) * dt;
    this.score += Math.floor((this.speed + this.selectedCar.speedBonus) * dt * 1.8);
    this.speed = Math.min(this.speed + dt * 5, 420);

    this.scoreLabel.setText(`SCORE ${String(this.score).padStart(6, "0")}`);
    this.speedLabel.setText(`SPEED ${Math.floor(this.speed + this.selectedCar.speedBonus)}`);

    this.enemyCars.forEach((enemy) => {
      enemy.y += (this.speed + 85) * dt;
      if (enemy.y > this.scale.height + 140) {
        enemy.y = -Phaser.Math.Between(220, 420);
        enemy.lane = Phaser.Math.Between(0, 2);
        enemy.x = this.scale.width * LANES[enemy.lane];
      }

      if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), enemy.getBounds())) {
        this.endRun();
      }
    });
  }

  endRun() {
    if (!this.running) return;
    this.running = false;

    const updated = loadProfile();
    updated.totalRuns += 1;
    updated.bestScore = Math.max(updated.bestScore, this.score);
    updated.coins += Math.floor(this.score / 100);
    saveProfile(updated);

    this.scene.pause();
    this.scene.launch("ui", {
      from: "race",
      gameOver: true,
      score: this.score,
      bestScore: updated.bestScore,
    });
  }

  createCornerButton(x, y, label, callback) {
    const bg = this.add.circle(x, y, 32, 0x2f81f7).setStrokeStyle(3, 0xffffff);
    const text = this.add.text(x, y, label, {
      fontFamily: "Impact, Arial",
      fontSize: "26px",
      color: "#ffffff",
    }).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerup", callback);

    return { bg, text };
  }
}
