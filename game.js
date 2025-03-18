class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: "StartScene" });
    }

    init(data) {
        this.gameOver = data.gameOver || false;
    }

    preload() {
        this.load.image("background", "assets/rectangle.png");
        this.load.image("playButton", "assets/Play.png");
        this.load.image("replayButton", "assets/Replay.png");
        this.load.image("pauseButton", "assets/Pause.png"); 
    }

    create() {
        if (!window.gameSocket) {
            this.initWebSocket();
        }

        let background = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "background");
        background.setScale(0.75);

        let buttonImage = this.gameOver ? "replayButton" : "playButton";

        let actionButton = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, buttonImage).setInteractive();
        actionButton.setScale(0.55);

        actionButton.on("pointerover", () => actionButton.setScale(0.6));
        actionButton.on("pointerout", () => actionButton.setScale(0.55));
        actionButton.on("pointerdown", () => this.startGame());

        this.input.keyboard.on("keydown-ENTER", () => this.startGame());
    }
    
    initWebSocket() {
        window.gameSocket = new WebSocket("ws://localhost:8080");
        
        window.gameSocket.onopen = () => {
            console.log("WebSocket connection established in StartScene");

            window.gameSocket.send("RESET");
            console.log("Initial RESET command sent");
        };
        
        window.gameSocket.onclose = () => {
            console.log("WebSocket connection closed in StartScene");
        };
        
        window.gameSocket.onerror = (error) => {
            console.error("WebSocket error in StartScene:", error);
        };
        
        window.gameSocket.onmessage = (event) => {
            console.log("WebSocket message received in StartScene:", event.data);
        };
    }

    startGame() {
        if (this.gameOver) {
            if (window.gameSocket && window.gameSocket.readyState === 1) { 
                window.gameSocket.send("RESET");
                console.log("Reset command sent");
            } else {
                console.log("Socket not ready, state:", window.gameSocket ? window.gameSocket.readyState : "undefined");
            }
        }
        this.scene.start("GameScene");
    }
}

class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: "PauseScene" });
    }

    create() {
        console.log("PauseScene created");
        
        this.cameras.main.setBackgroundColor("#444");
        
        let background = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "background");
        background.setScale(0.75);
        
        let pauseButton = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "pauseButton");
        pauseButton.setScale(0.55);
        
        console.log("Pause button added at", this.cameras.main.centerX, this.cameras.main.centerY);

        this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY + 100, 
            "Press P or ESC to resume", 
            {
                fontFamily: "Arial",
                fontSize: "24px",
                fill: "#FFFFFF",
            }
        ).setOrigin(0.5);

        this.input.keyboard.on("keydown-P", () => this.resumeGame());
        this.input.keyboard.on("keydown-ESC", () => this.resumeGame());
        
        this.input.on('pointerdown', () => this.resumeGame());
    }

    resumeGame() {
        console.log("Resuming game");
        this.scene.resume("GameScene");
        this.scene.stop();
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
        this.tankHP = 100;
        this.tiltAngle = 0;
        this.targetTiltAngle = 0;
        this.gunAngle = 0;
        this.barrelLength = 70;
        this.isPaused = false;
    }

    preload() {
        this.load.image("tank", "assets/Hull_01.png");
        this.load.image("trackLeft", "assets/Track_1_A.png");
        this.load.image("trackRight", "assets/Track_1_B.png");
        this.load.image("gun", "assets/Gun_01.png");
        this.load.image("grenade", "assets/Granade_Shell.png");
        this.load.image("bullet", "assets/Exhaust_Fire.png");
    }

    create() {
        this.cameras.main.setBackgroundColor("#444");

        //hp
        this.hpText = this.add.text(20, 20, `HP: ${this.tankHP}`, {
            fontFamily: "Squada One",
            fontSize: "32px",
            fill: "#FFFFFF",
        });

        //tracks
        this.trackLeft = this.add.sprite(400 - 40, 500 + 5, "trackLeft").setScale(0.5);
        this.trackRight = this.add.sprite(400 + 40, 500 + 5, "trackRight").setScale(0.5);

        //tank
        this.tank = this.physics.add.sprite(400, 500, "tank").setCollideWorldBounds(true).setScale(0.5);

        //kanon
        this.gun = this.add.sprite(this.tank.x, this.tank.y - 35, "gun").setOrigin(0.5, 1).setScale(0.5);

        //keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.lowerLeftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.lowerRightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.gunLeftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.gunRightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        
        //pausekeys
        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.input.keyboard.on('keydown-P', () => this.togglePause());
        this.input.keyboard.on('keydown-ESC', () => this.togglePause());

        //bullets and nades
        this.bullets = this.physics.add.group({ defaultKey: "bullet", maxSize: 10 });
        this.grenades = this.physics.add.group();

        //
        this.time.addEvent({ delay: 2000, callback: this.spawnGrenade, callbackScope: this, loop: true });

        //collisions
        this.physics.add.overlap(this.bullets, this.grenades, this.bulletHit, null, this);
        this.physics.add.collider(this.tank, this.grenades, this.tankHit, null, this);

        //websocket for the pi
        if (window.gameSocket && window.gameSocket.readyState === 1) {
            this.socket = window.gameSocket;
            console.log("Using existing WebSocket connection");
        } else {
            this.socket = new WebSocket("ws://localhost:8080");
            window.gameSocket = this.socket;
            console.log("Created new WebSocket connection in GameScene");
        }

        this.socket.onopen = () => {
            console.log("WebSocket connection established");
        };

        this.socket.onclose = () => {
            console.log("WebSocket connection closed");
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        this.socket.onmessage = (event) => {
            console.log("WebSocket message received:", event.data);
        };

        this.input.keyboard.on("keydown", (event) => {
            let command = "";
            if (event.key === "d") {
                command = "E"; 
            } else if (event.key === "a") {
                command = "D";
            } else if (event.key === "j" || event.key === "ArrowLeft") {
                command = "J"; 
            } else if (event.key === "l" || event.key === "ArrowRight") {
                command = "L"; 
            }
            
            if (command && this.socket && this.socket.readyState === 1) {
                this.socket.send(command);
                console.log("Sent command:", command);
            }
        });
    }

    togglePause() {
        if (this.isPaused) {
            // Resume game
            console.log("Resuming from pause");
            this.isPaused = false;
            this.scene.resume();
            this.scene.stop("PauseScene");
        } else {
            // Pause game
            console.log("Pausing game");
            this.isPaused = true;
            this.scene.pause();
            this.scene.launch("PauseScene");
        }
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
    
        // gun angle 
        if (this.gunLeftKey.isDown) {
            this.gunAngle = Math.max(this.gunAngle - 2, -90);
        } else if (this.gunRightKey.isDown) {
            this.gunAngle = Math.min(this.gunAngle + 2, 90);
        }
        this.gun.setAngle(this.gunAngle);
    
        if (Phaser.Input.Keyboard.JustDown(this.fireKey)) {
            this.shootBullet();
        }
    
        this.gun.x = this.tank.x;
        this.gun.y = this.tank.y - -35;
        
        //send position data to arduino
        if (this.socket && this.socket.readyState === 1) {
      
            const normalizedTankX = Math.floor((this.tank.x / 800) * 180);
            
            const normalizedGunAngle = Math.floor(((this.gunAngle + 90) / 180) * 180);
            
            const positionCommand = `POS:${normalizedTankX}:${normalizedGunAngle}`;
            this.socket.send(positionCommand);
        }
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

            this.time.delayedCall(3000, () => bullet.destroy());
        }
    }

    tankHit(tank, grenade) {
        grenade.destroy();
        this.tankHP -= 15;
    
        this.hpText.setText(`HP: ${this.tankHP}`);
    
        let damageText = this.add.text(tank.x, tank.y - 50, "-15", {
            fontFamily: "Squada One",
            fontSize: "28px",
            fill: "#FF0000",
        }).setOrigin(0.5);
    
        this.tweens.add({
            targets: damageText,
            y: tank.y - 70,
            alpha: 0,
            duration: 800,
            onComplete: () => damageText.destroy()
        });
    
        this.tweens.add({
            targets: this.tank,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 4
        });
    
        if (this.tankHP <= 0) {
            this.scene.start("StartScene", { gameOver: true });
        }
    }
    
    bulletHit(bullet, grenade) {
        bullet.destroy();
        grenade.destroy();
    }

    spawnGrenade() {
        const grenadeX = Phaser.Math.Between(50, 750);
        const grenade = this.grenades.create(grenadeX, 0, "grenade");
        grenade.setVelocity(0, 200);
        grenade.setCollideWorldBounds(false);
    
        grenade.setSize(20, 20).setOffset(6, 6);
    
        this.time.addEvent({
            delay: 100,
            callback: () => {
                if (grenade.active && grenade.y > this.cameras.main.height) {
                    grenade.destroy();
                }
            },
            callbackScope: this,
            loop: true,
            repeat: 60
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "gameContainer",
    physics: { default: "arcade", arcade: { debug: false } },
    scene: [StartScene, PauseScene, GameScene]
};

const game = new Phaser.Game(config);