import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  create() {
    this.createTextures();
    this.scene.start("menu");
  }

  createTextures() {
    const g = this.add.graphics();

    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(0, 0, 84, 154, 14);
    g.generateTexture("car-base", 84, 154);
    g.clear();

    g.fillStyle(0xf3f3f3, 1);
    g.fillRect(0, 0, 240, 360);
    g.generateTexture("panel", 240, 360);
    g.clear();

    g.fillStyle(0x1a1f2a, 1);
    g.fillRect(0, 0, 64, 64);
    g.generateTexture("btn", 64, 64);
    g.destroy();
  }
}
