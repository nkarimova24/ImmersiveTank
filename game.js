const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "gameContainer",
    physics: {
        default: "arcade",
        arcade: { debug: false }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let tank, gun, trackLeft, trackRight, cursors, bullets, grenades;
let fireKey, lowerLeftKey, lowerRightKey, gunLeftKey, gunRightKey;
let tiltAngle = 0;
let gunAngle = 0;
let barrelLength = 70;
let targetTiltAngle = 0;
let bulletRadius = 5;
let grenadeRadius = 15;

function preload() {
    this.load.image("tank", "assets/Hull_01.png");
    this.load.image("trackLeft", "assets/Track_1_A.png");
    this.load.image("trackRight", "assets/Track_1_B.png");
    this.load.image("gun", "assets/Gun_01.png");
    this.load.image("grenade", "assets/Granade_Shell.png");
    this.load.image("bullet", "assets/Exhaust_Fire.png");

    console.log("Assets geladen...");
}

function create() {
    this.cameras.main.setBackgroundColor("#444");

    //tracks
    trackLeft = this.add.sprite(400 - 40, 500 + 15, "trackLeft");
    trackLeft.setScale(0.5);
    
    trackRight = this.add.sprite(400 + 40, 500 + 15, "trackRight");
    trackRight.setScale(0.5);

    //body
    tank = this.physics.add.sprite(400, 500, "tank");
    tank.setCollideWorldBounds(true);
    tank.setScale(0.5);

    //kanon
    gun = this.add.sprite(tank.x, tank.y - 20, "gun");
    gun.setOrigin(0.5, 1);
    gun.setScale(0.5);

    bullets = this.physics.add.group({
        defaultKey: "bullet",
        maxSize: 10
    });

    grenades = this.physics.add.group();

    //keys
    cursors = this.input.keyboard.createCursorKeys();
    fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    lowerLeftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    lowerRightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    gunLeftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    gunRightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    this.time.addEvent({ delay: 2000, callback: spawnGrenade, callbackScope: this, loop: true });

    this.physics.add.overlap(bullets, grenades, bulletHit, null, this);
}

function update() {
    if (lowerLeftKey.isDown) {
        tank.setVelocityX(-200);
        targetTiltAngle = -10;
    } else if (lowerRightKey.isDown) {
        tank.setVelocityX(200);
        targetTiltAngle = 10;
    } else {
        tank.setVelocityX(0);
        targetTiltAngle = 0;
    }

    tiltAngle += (targetTiltAngle - tiltAngle) * 0.1;

    trackLeft.x = tank.x - 40;
    trackLeft.y = tank.y + 5;
    
    trackRight.x = tank.x + 40;
    trackRight.y = tank.y + 5;

    tank.setAngle(tiltAngle);
    trackLeft.setAngle(tiltAngle);
    trackRight.setAngle(tiltAngle);

    //move kanon without body
    if (gunLeftKey.isDown) {
        gunAngle -= 2;
    }
    if (gunRightKey.isDown) {
        gunAngle += 2;
    }
    gun.setAngle(gunAngle);

    //shootings
    if (Phaser.Input.Keyboard.JustDown(fireKey)) {
        shootBullet();
    }

    gun.x = tank.x;
    gun.y = tank.y - 20;
}

function shootBullet() {
    const angleRad = Phaser.Math.DegToRad(gunAngle - 90);
    const bulletX = gun.x + Math.cos(angleRad) * (barrelLength + 10);
    const bulletY = gun.y + Math.sin(angleRad) * (barrelLength + 10);

    let bullet = bullets.create(bulletX, bulletY, "bullet");
    if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setVelocity(
            Math.cos(angleRad) * 400,
            Math.sin(angleRad) * 400
        );
    }
}

function spawnGrenade() {
    let xPos = Phaser.Math.Between(50, 750);
    let grenade = grenades.create(xPos, -20, "grenade");
    grenade.setVelocityY(200);
}

function bulletHit(bullet, grenade) {
    const dx = bullet.x - grenade.x;
    const dy = bullet.y - grenade.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < bulletRadius + grenadeRadius) {
        bullet.destroy();
        grenade.destroy();
    }
}
