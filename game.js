const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Sprites laden
const lowerbodyImg = new Image();
lowerbodyImg.src = "assets/Hull_01.png";

const trackLeftImg = new Image();
trackLeftImg.src = "assets/Track_1_A.png";

const trackRightImg = new Image();
trackRightImg.src = "assets/Track_1_B.png";

const gunImg = new Image();
gunImg.src = "assets/Gun_01.png";

const grenadeImg = new Image();
grenadeImg.src = "assets/Granade_Shell.png";

// Tank instellingen
const tank = {
    x: canvas.width / 2 - 60,
    y: canvas.height - 120,
    width: 120,
    height: 80,
    speed: 6,
    direction: 0
};

// Tracks
const tracks = {
    width: 28,
    height: tank.height * 1.15,
    offsetX: 40,    
    offsetY: -5    
};

// Kanon
const upperbody = {
    angle: 0,
    width: 75,  
    height: 75,    
    offsetY: -20, 
    rotationSpeed: 5
};

// Granaten (vijanden)
const grenades = [];
const grenadeSpeed = 3;
const spawnInterval = 1500; // Om de 1,5 sec spawnt een granaat

function spawnGrenade() {
    grenades.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: -20,
        width: 75,
        height: 75,
        speed: grenadeSpeed
    });
}

// Toetsen voor tank en kanonbesturing
document.addEventListener("keydown", (event) => {
    if (event.key === "a" || event.key === "A") {
        tank.direction = -1;
    } else if (event.key === "d" || event.key === "D") {
        tank.direction = 1;
    } else if (event.key === "ArrowLeft") {
        upperbody.angle -= upperbody.rotationSpeed;
        if (upperbody.angle < -45) upperbody.angle = -45;
    } else if (event.key === "ArrowRight") {
        upperbody.angle += upperbody.rotationSpeed;
        if (upperbody.angle > 45) upperbody.angle = 45;
    }
});

document.addEventListener("keyup", (event) => {
    if ((event.key === "a" || event.key === "A" || event.key === "d" || event.key === "D") && 
        tank.direction === (event.key.toLowerCase() === "a" ? -1 : 1)) {
        tank.direction = 0;
    }
});

// **Update functie**
function update() {
    tank.x += tank.speed * tank.direction;
    
    if (tank.x < 50) tank.x = 50;
    if (tank.x + tank.width > canvas.width - 50) tank.x = canvas.width - 50 - tank.width;

    // Update granaten
    for (let i = 0; i < grenades.length; i++) {
        grenades[i].y += grenades[i].speed;

        // Botsing detectie
        if (
            grenades[i].x < tank.x + tank.width &&
            grenades[i].x + grenades[i].width > tank.x &&
            grenades[i].y < tank.y + tank.height &&
            grenades[i].y + grenades[i].height > tank.y
        ) {
            alert("Game Over! Je tank is geraakt!");
            document.location.reload();
        }

        // Verwijder granaten die uit beeld gaan
        if (grenades[i].y > canvas.height) {
            grenades.splice(i, 1);
            i--;
        }
    }
}

// **Teken functie**
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Tracks tekenen
    ctx.drawImage(trackLeftImg, tank.x - tracks.width + tracks.offsetX, tank.y + tracks.offsetY, tracks.width, tracks.height);
    ctx.drawImage(trackRightImg, tank.x + tank.width - tracks.offsetX, tank.y + tracks.offsetY, tracks.width, tracks.height);

    // Lowerbody tekenen
    ctx.drawImage(lowerbodyImg, tank.x, tank.y, tank.width, tank.height);

    // Upperbody tekenen (apart roteren)
    ctx.save();
    ctx.translate(tank.x + tank.width / 2, tank.y + tank.height / 2 + upperbody.offsetY);
    ctx.rotate((upperbody.angle * Math.PI) / 180);
    ctx.drawImage(gunImg, -upperbody.width / 2, -upperbody.height / 2, upperbody.width, upperbody.height);
    ctx.restore();

    // Granaten tekenen
    for (let grenade of grenades) {
        ctx.drawImage(grenadeImg, grenade.x, grenade.y, grenade.width, grenade.height);
    }
}

// **Game loop**
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game als alle afbeeldingen geladen zijn
Promise.all([
    new Promise(resolve => { lowerbodyImg.onload = resolve; }),
    new Promise(resolve => { trackLeftImg.onload = resolve; }),
    new Promise(resolve => { trackRightImg.onload = resolve; }),
    new Promise(resolve => { gunImg.onload = resolve; }),
    new Promise(resolve => { grenadeImg.onload = resolve; })
]).then(() => {
    setInterval(spawnGrenade, spawnInterval); // Start granaten-generatie
    gameLoop();
});
