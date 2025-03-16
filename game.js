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

//tank
const tank = {
    x: canvas.width / 2 - 60,
    y: canvas.height - 120,
    width: 120,
    height: 80,
    speed: 6,
    direction: 0
};

//tracks
const tracks = {
    width: 28,
    height: tank.height * 1.15,
    offsetX: 40,    
    offsetY: -5    
};

//kanon
const upperbody = {
    angle: 0,
    width: 75,  
    height: 75,    
    offsetY: -20, 
    rotationSpeed: 5
};

//keys
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

function update() {
    tank.x += tank.speed * tank.direction;
    
    if (tank.x < 50) tank.x = 50;
    if (tank.x + tank.width > canvas.width - 50) tank.x = canvas.width - 50 - tank.width;
}

//
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
        trackLeftImg, 
        tank.x - tracks.width + tracks.offsetX, 
        tank.y + tracks.offsetY, 
        tracks.width, 
        tracks.height
    );

    ctx.drawImage(
        trackRightImg, 
        tank.x + tank.width - tracks.offsetX, 
        tank.y + tracks.offsetY, 
        tracks.width, 
        tracks.height
    );

    ctx.drawImage(
        lowerbodyImg, 
        tank.x, 
        tank.y, 
        tank.width, 
        tank.height
    );

    ctx.save();
    ctx.translate(tank.x + tank.width / 2, tank.y + tank.height / 2 + upperbody.offsetY);
    ctx.rotate((upperbody.angle * Math.PI) / 180);
    ctx.drawImage(
        gunImg, 
        -upperbody.width / 2, 
        -upperbody.height / 2, 
        upperbody.width,
        upperbody.height
    );
    ctx.restore();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

Promise.all([
    new Promise(resolve => { lowerbodyImg.onload = resolve; }),
    new Promise(resolve => { trackLeftImg.onload = resolve; }),
    new Promise(resolve => { trackRightImg.onload = resolve; }),
    new Promise(resolve => { gunImg.onload = resolve; })
]).then(() => {
    gameLoop();
});