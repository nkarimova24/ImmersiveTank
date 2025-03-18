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
let lastCommand = "";
let tank, gun, trackLeft, trackRight, cursors, bullets, grenades;
let fireKey, lowerLeftKey, lowerRightKey, gunLeftKey, gunRightKey;
let tiltAngle = 0;
let gunAngle = 0;
let barrelLength = 70;
let targetTiltAngle = 0;
let bulletRadius = 5;
let grenadeRadius = 15;
let socket;

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

    // WebSocket verbinding
    socket = new WebSocket("ws://localhost:8765");

    socket.onopen = function () {
        console.log("✅ Verbonden met WebSocket server!");
    };

    socket.onmessage = function (event) {
        let feedback = event.data.trim();
        console.log("📡 Feedback ontvangen:", feedback);
    
        if (feedback.startsWith("TANK_POS:")) {
            let tankX = parseFloat(feedback.split(":")[1]);
            tank.x = 400 + ((tankX - (SERVO_MIN + SERVO_MAX) / 2) / (SERVO_MAX - SERVO_MIN)) * 200; 
        }
    
        if (feedback.startsWith("GUN_ANGLE:")) {
            let gunAngle = parseFloat(feedback.split(":")[1]);
            gun.setAngle(((gunAngle - (SERVO_MIN + SERVO_MAX) / 2) / (SERVO_MAX - SERVO_MIN)) * 180);
        }
    };
    
    

    socket.onerror = function (error) {
        console.log("⚠️ WebSocket Fout:", error);
    };

    socket.onclose = function () {
        console.log("❌ WebSocket connection closed.");
        setTimeout(() => {
            console.log("🔄 Attempting to reconnect...");
            socket = new WebSocket("ws://localhost:8765");
        }, 1000);  // Retry in 1 second
    };
    
    // Tracks
    trackLeft = this.add.sprite(400 - 40, 500 + 15, "trackLeft");
    trackLeft.setScale(0.5);
    
    trackRight = this.add.sprite(400 + 40, 500 + 15, "trackRight");
    trackRight.setScale(0.5);

    // Tank body
    tank = this.physics.add.sprite(400, 500, "tank");
    tank.setCollideWorldBounds(true);
    tank.setScale(0.5);


   //kanon
    gun = this.add.sprite(tank.x - 10, tank.y - 35, "gun"); 
    gun.setOrigin(0.5, 1);
    gun.setScale(0.5);


    bullets = this.physics.add.group({
        defaultKey: "bullet",
        maxSize: 10
    });

    grenades = this.physics.add.group();

    // Besturing
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
    let speed = 200; // Beweging snelheid
    let tiltFactor = 15; // Maximale kanteling
    let tiltOffset = 5; // Hoeveelheid visuele Y-verschuiving tijdens kantelen

    // Beweging en kanteling bepalen
    if (lowerLeftKey.isDown) {
        tank.setVelocityX(-speed); // Links bewegen
        targetTiltAngle = -tiltFactor;
    } else if (lowerRightKey.isDown) {
        tank.setVelocityX(speed); // Rechts bewegen
        targetTiltAngle = tiltFactor;
    } else {
        tank.setVelocityX(0);
        targetTiltAngle = 0;
    }

    // Snellere en vloeiendere kanteling
    tiltAngle += (targetTiltAngle - tiltAngle) * 0.2;

    // Bereken een visuele Y-offset zonder de tank echt te verplaatsen
    let yOffset = Math.abs(tiltAngle) / tiltFactor * tiltOffset;

    // Tracks volgen de beweging van de tank
    trackLeft.x = tank.x - 40;
    trackLeft.y = 500 + yOffset;

    trackRight.x = tank.x + 40;
    trackRight.y = 500 + yOffset;

    // Tank kantelen, maar Y blijft stabiel
    tank.setAngle(tiltAngle);
    tank.y = 500; // Houdt de tank op vaste hoogte

    trackLeft.setAngle(tiltAngle);
    trackRight.setAngle(tiltAngle);

    // Kanon los van de body bewegen
    if (gunLeftKey.isDown) {
        gunAngle -= 2;
    }
    if (gunRightKey.isDown) {
        gunAngle += 2;
    }
    gun.setAngle(gunAngle);

    // Schieten
    if (Phaser.Input.Keyboard.JustDown(fireKey)) {
        shootBullet();
    }

    // Kanon blijft correct bovenop de tank
    gun.x = tank.x;
    gun.y = tank.y - -40;
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
