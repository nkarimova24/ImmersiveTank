// 🔥 StartScene: Startscherm met een knop om te beginnen
class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: "StartScene" });
    }

    preload() {
        this.load.image("startButton", "assets/start.png");
    }

    create() {
        this.add.text(300, 200, "Tank Battle!", { fontSize: "40px", fill: "#fff" });

        let startButton = this.add.sprite(400, 300, "startButton").setInteractive();
        startButton.setScale(0.2);

        startButton.on("pointerdown", () => {
            this.scene.start("GameScene");
        });
    }
}

// 🔥 GameScene: Spel zelf
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
        this.tankHP = 100; // Tank begint met 100 HP
        this.tiltAngle = 0;
        this.targetTiltAngle = 0;
        this.gunAngle = 0;
        this.barrelLength = 70;
    }

    preload() {
        this.load.image("tank", "assets/Hull_01.png");
        this.load.image("trackLeft", "assets/Track_1_A.png");
        this.load.image("trackRight", "assets/Track_1_B.png");
        this.load.image("gun", "assets/Gun_01.png");
        this.load.image("grenade", "assets/Granade_Shell.png");
        this.load.image("bullet", "assets/Exhaust_Fire.png");

        this.load.image("greenbar_1", "assets/greenbar_1.png");
        this.load.image("greenbar_2", "assets/greenbar_2.png");
        this.load.image("greenbar_3", "assets/greenbar_3.png");

        console.log("Assets geladen...");
    }

    create() {
        this.cameras.main.setBackgroundColor("#444");

        // Health bars
        this.healthBar1 = this.add.image(100, 50, "greenbar_1").setScale(0.5).setVisible(true);
        this.healthBar2 = this.add.image(100, 50, "greenbar_2").setScale(0.5).setVisible(true);
        this.healthBar3 = this.add.image(100, 50, "greenbar_3").setScale(0.5).setVisible(false);

        // Tracks
        this.trackLeft = this.add.sprite(400 - 40, 500 + 5, "trackLeft").setScale(0.5);
        this.trackRight = this.add.sprite(400 + 40, 500 + 5, "trackRight").setScale(0.5);

        // Tank body
        this.tank = this.physics.add.sprite(400, 500, "tank").setCollideWorldBounds(true).setScale(0.5);

        // Kanon
        this.gun = this.add.sprite(this.tank.x, this.tank.y - 35, "gun").setOrigin(0.5, 1).setScale(0.5);

        // Besturing
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.lowerLeftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.lowerRightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.gunLeftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.gunRightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        this.bullets = this.physics.add.group({ defaultKey: "bullet", maxSize: 10 });
        this.grenades = this.physics.add.group();

        this.time.addEvent({ delay: 2000, callback: this.spawnGrenade, callbackScope: this, loop: true });

        this.physics.add.overlap(this.bullets, this.grenades, this.bulletHit, null, this);
    }

    update() {
        let speed = 200;
        let tiltFactor = 15;
        let tiltOffset = 5;

        if (this.lowerLeftKey.isDown) {
            this.tank.setVelocityX(-speed);
            this.targetTiltAngle = -tiltFactor;
        } else if (this.lowerRightKey.isDown) {
            this.tank.setVelocityX(speed);
            this.targetTiltAngle = tiltFactor;
        } else {
            this.tank.setVelocityX(0);
            this.targetTiltAngle = 0;
        }

        this.tiltAngle += (this.targetTiltAngle - this.tiltAngle) * 0.2;

        let yOffset = Math.abs(this.tiltAngle) / tiltFactor * tiltOffset;

        this.trackLeft.x = this.tank.x - 38;
        this.trackLeft.y = this.tank.y + yOffset + 5;

        this.trackRight.x = this.tank.x + 38;
        this.trackRight.y = this.tank.y + yOffset + 5;

        this.tank.setAngle(this.tiltAngle);
        this.tank.y = 500;

        this.trackLeft.setAngle(this.tiltAngle);
        this.trackRight.setAngle(this.tiltAngle);

        if (this.gunLeftKey.isDown) {
            this.gunAngle -= 2;
        }
        if (this.gunRightKey.isDown) {
            this.gunAngle += 2;
        }
        this.gun.setAngle(this.gunAngle);

        if (Phaser.Input.Keyboard.JustDown(this.fireKey)) {
            this.shootBullet();
        }

        this.gun.x = this.tank.x;
        this.gun.y = this.tank.y - 35;
    }

    shootBullet() {
        const angleRad = Phaser.Math.DegToRad(this.gunAngle - 90);
        const bulletX = this.gun.x + Math.cos(angleRad) * (this.barrelLength + 10);
        const bulletY = this.gun.y + Math.sin(angleRad) * (this.barrelLength + 10);

        let bullet = this.bullets.create(bulletX, bulletY, "bullet");
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setVelocity(
                Math.cos(angleRad) * 400,
                Math.sin(angleRad) * 400
            );
        }
    }

    updateHealthBar() {
        if (this.tankHP > 50) {
            this.healthBar1.setVisible(true);
            this.healthBar2.setVisible(true);
            this.healthBar3.setVisible(false);
        } else if (this.tankHP > 15) {
            this.healthBar1.setVisible(false);
            this.healthBar2.setVisible(true);
            this.healthBar3.setVisible(true);
        } else {
            this.healthBar1.setVisible(false);
            this.healthBar2.setVisible(false);
            this.healthBar3.setVisible(true);
        }
    }

    spawnGrenade() {
        let xPos = Phaser.Math.Between(50, 750);
        let grenade = this.grenades.create(xPos, -20, "grenade");
        grenade.setVelocityY(200);
    }

    bulletHit(bullet, grenade) {
        bullet.destroy();
        grenade.destroy();

        // HP verminderen
        this.tankHP -= 15;
        if (this.tankHP < 0) this.tankHP = 0;

        // Health bar updaten
        this.updateHealthBar();
    }
}

// **Phaser-config met beide scenes**
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "gameContainer",
    physics: {
        default: "arcade",
        arcade: { debug: false }
    },
    scene: [StartScene, GameScene]
};


const game = new Phaser.Game(config);
