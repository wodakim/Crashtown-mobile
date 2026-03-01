export class UIScene extends Phaser.Scene {
  constructor() {
    super("ui");
  }

  create(data) {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.72);

    if (data?.gameOver) {
      this.add.text(width / 2, height * 0.34, "GAME OVER", {
        fontFamily: "Impact, Arial",
        fontSize: "68px",
        color: "#ff5e5e",
        stroke: "#000",
        strokeThickness: 7,
      }).setOrigin(0.5);

      this.add.text(width / 2, height * 0.45, `Score: ${data.score}`, {
        fontFamily: "Arial",
        fontSize: "36px",
        color: "#ffffff",
      }).setOrigin(0.5);

      this.add.text(width / 2, height * 0.51, `Best: ${data.bestScore}`, {
        fontFamily: "Arial",
        fontSize: "30px",
        color: "#ffd45f",
      }).setOrigin(0.5);

      this.createButton(width / 2, height * 0.63, "REJOUER", () => {
        this.scene.stop("race");
        this.scene.stop();
        this.scene.start("race");
      });
    } else {
      this.add.text(width / 2, height * 0.4, "PAUSE", {
        fontFamily: "Impact, Arial",
        fontSize: "68px",
        color: "#ffffff",
        stroke: "#000",
        strokeThickness: 7,
      }).setOrigin(0.5);

      this.createButton(width / 2, height * 0.53, "REPRENDRE", () => {
        this.scene.stop();
        this.scene.resume("race");
      });
    }

    this.createButton(width / 2, height * 0.75, "GARAGE", () => {
      this.scene.stop("race");
      this.scene.stop();
      this.scene.start("garage");
    });

    this.createButton(width / 2, height * 0.86, "MENU", () => {
      this.scene.stop("race");
      this.scene.stop();
      this.scene.start("menu");
    });
  }

  createButton(x, y, label, callback) {
    const bg = this.add.rectangle(x, y, 340, 86, 0x2f81f7).setStrokeStyle(3, 0xffffff);
    const text = this.add.text(x, y, label, {
      fontFamily: "Impact, Arial",
      fontSize: "34px",
      color: "#fff",
    }).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerup", callback);
    bg.on("pointerover", () => bg.setFillStyle(0x4092ff));
    bg.on("pointerout", () => bg.setFillStyle(0x2f81f7));

    this.add.existing(text);
  }
}
