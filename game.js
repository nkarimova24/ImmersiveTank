const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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

const bulletImg = new Image(); 
bulletImg.src = "assets/Exhaust_Fire.png";

//tank
const tank = {
    x: canvas.width / 2 - 60,
    y: canvas.height - 120,
    width: 120,
    height: 80,
    speed: 6,
    direction: 0,
    tiltAngle: 0
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
    rotationSpeed: 5,
    barrelLength: 55   
};

const grenades = [];
const grenadeSpeed = 3;
const spawnInterval = 1500; 

const bullets = [];
const bulletSpeed = 7;

function spawnGrenade() {
    grenades.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: -20,
        width: 75,
        height: 75,
        speed: grenadeSpeed,
        hitRadius: 45 
    });
}

//keys
document.addEventListener("keydown", (event) => {
    if (event.key === "a" || event.key === "A") {
        tank.direction = -1;
        tank.tiltAngle = -10; 
    } else if (event.key === "d" || event.key === "D") {
        tank.direction = 1;
        tank.tiltAngle = 10; 
    } else if (event.key === "ArrowLeft") {
        upperbody.angle -= upperbody.rotationSpeed;
        if (upperbody.angle < -45) upperbody.angle = -45;
    } else if (event.key === "ArrowRight") {
        upperbody.angle += upperbody.rotationSpeed;
        if (upperbody.angle > 45) upperbody.angle = 45;
    } else if (event.key === " ") { 
        shootBullet();
    }
});

document.addEventListener("keyup", (event) => {
    if ((event.key === "a" || event.key === "A" || event.key === "d" || event.key === "D") && 
        tank.direction === (event.key.toLowerCase() === "a" ? -1 : 1)) {
        tank.direction = 0;
        tank.tiltAngle = 0; 
    }
});

function shootBullet() {
    const radians = (upperbody.angle * Math.PI) / 180;
    
    const gunCenterX = tank.x + tank.width / 2;
    const gunCenterY = tank.y + tank.height / 2 + upperbody.offsetY;
    
    const bulletX = gunCenterX + Math.sin(radians) * upperbody.barrelLength;
    const bulletY = gunCenterY - Math.cos(radians) * upperbody.barrelLength;
    
    bullets.push({
        x: bulletX,
        y: bulletY,
        angle: upperbody.angle - 90, 
        speed: bulletSpeed,
        width: 50, 
        height: 50,
        hitRadius: 3 
    });
}

function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function update() {
    tank.x += tank.speed * tank.direction;
    
    if (tank.x < 50) tank.x = 50;
    if (tank.x + tank.width > canvas.width - 50) tank.x = canvas.width - 50 - tank.width;

    for (let i = 0; i < grenades.length; i++) {
        grenades[i].y += grenades[i].speed;

        if (
            grenades[i].x < tank.x + tank.width &&
            grenades[i].x + grenades[i].width > tank.x &&
            grenades[i].y < tank.y + tank.height &&
            grenades[i].y + grenades[i].height > tank.y
        ) {
            alert("Game Over! Je tank is geraakt!");
            document.location.reload();
        }

        if (grenades[i].y > canvas.height) {
            grenades.splice(i, 1);
            i--;
        }
    }

    for (let i = 0; i < bullets.length; i++) {
        const radians = (bullets[i].angle * Math.PI) / 180;
        bullets[i].x += Math.cos(radians) * bullets[i].speed;
        bullets[i].y += Math.sin(radians) * bullets[i].speed;

        //botsingdetectie
        for (let j = 0; j < grenades.length; j++) {
            if (bullets[i] && grenades[j]) {

                const bulletCenterX = bullets[i].x + bullets[i].width / 2;
                const bulletCenterY = bullets[i].y + bullets[i].height / 2;
                const grenadeCenterX = grenades[j].x + grenades[j].width / 2;
                const grenadeCenterY = grenades[j].y + grenades[j].height / 2;
                
                const distance = getDistance(
                    bulletCenterX, 
                    bulletCenterY, 
                    grenadeCenterX, 
                    grenadeCenterY
                );
                
                if (distance < (bullets[i].hitRadius + grenades[j].hitRadius)) {
                    grenades.splice(j, 1);
                    bullets.splice(i, 1);
                    i--;
                    break;
                }
            }
        }

        if (bullets[i] && (bullets[i].x < 0 || bullets[i].x > canvas.width || bullets[i].y < 0 || bullets[i].y > canvas.height)) {
            bullets.splice(i, 1);
            i--;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(tank.x + tank.width / 2, tank.y + tank.height / 2);
    ctx.rotate((tank.tiltAngle * Math.PI) / 180);

    ctx.drawImage(trackLeftImg, -tank.width / 2 - tracks.width + tracks.offsetX, -tank.height / 2 + tracks.offsetY, tracks.width, tracks.height);
    ctx.drawImage(trackRightImg, tank.width / 2 - tracks.offsetX, -tank.height / 2 + tracks.offsetY, tracks.width, tracks.height);
    ctx.drawImage(lowerbodyImg, -tank.width / 2, -tank.height / 2, tank.width, tank.height);
    
    ctx.restore();

    ctx.save();
    ctx.translate(tank.x + tank.width / 2, tank.y + tank.height / 2 + upperbody.offsetY);
    ctx.rotate((upperbody.angle * Math.PI) / 180);
    ctx.drawImage(gunImg, -upperbody.width / 2, -upperbody.height / 2, upperbody.width, upperbody.height);
    ctx.restore();

    for (let grenade of grenades) {
        ctx.drawImage(grenadeImg, grenade.x, grenade.y, grenade.width, grenade.height);
        
//debug show hitbox of grenades
        /*
        ctx.beginPath();
        ctx.arc(
            grenade.x + grenade.width / 2, 
            grenade.y + grenade.height / 2, 
            grenade.hitRadius, 
            0, 
            Math.PI * 2
        );
        ctx.strokeStyle = "red";
        ctx.stroke();
        */
    }

    for (let bullet of bullets) {
        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        ctx.rotate((bullet.angle * Math.PI) / 180);
        ctx.drawImage(bulletImg, -bullet.width / 2, -bullet.height / 2, bullet.width, bullet.height);
        ctx.restore();
        
//debug hitbox of bullets
        /*
        ctx.beginPath();
        ctx.arc(
            bullet.x + bullet.width / 2, 
            bullet.y + bullet.height / 2, 
            bullet.hitRadius, 
            0, 
            Math.PI * 2
        );
        ctx.strokeStyle = "blue";
        ctx.stroke();
        */
    }
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
    new Promise(resolve => { gunImg.onload = resolve; }),
    new Promise(resolve => { grenadeImg.onload = resolve; }),
    new Promise(resolve => { bulletImg.onload = resolve; })
]).then(() => {
    setInterval(spawnGrenade, spawnInterval);
    gameLoop();
});