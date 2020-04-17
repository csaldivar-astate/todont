const canvas = document.getElementById("game");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2
const RADIUS = 200;
const NEEDLE_LENGTH = RADIUS * 0.8;
const ctx = canvas.getContext("2d");
const arcColors = ["#C70039", "#23DEDE", "#FF33E3", "#42DE23"]
let needleColor;
const Direction = {
    LEFT: Symbol(),
    RIGHT: Symbol()
};
let currentDirection;
let currentAngle;
let gameUpdateInverval;
let score = 0;

let failAngle;

function getRandomColor () {
    let color = arcColors[Math.floor(Math.random() * arcColors.length)];
    while (color == needleColor) {
        color = arcColors[Math.floor(Math.random() * arcColors.length)];
    }
    return color;
}

function drawCircle () {
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const start = Math.PI*(i/2); const stop = Math.PI*((i+1)/2);
        ctx.arc(CENTER_X, CENTER_Y, RADIUS, start, stop); // Create an arc
        ctx.strokeStyle = arcColors[i];
        ctx.lineWidth = 20;
        ctx.stroke(); 
    } 
}

function drawNeedle (color, angle) {
    // clear inner circle
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, NEEDLE_LENGTH+10, 0, Math.PI*2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Draw circle in center
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, 10, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();

    // Draw the needle itself
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineWidth = 10;
    ctx.moveTo(CENTER_X, CENTER_Y);
    const rads = angle * Math.PI/180;
    const x = NEEDLE_LENGTH * Math.cos(rads) + CENTER_X;
    const y = NEEDLE_LENGTH * Math.sin(rads) + CENTER_Y;
    ctx.lineTo(x, y);
    ctx.stroke();
}

function drawGame () {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.lineCap = "butt";
    drawCircle();
    updateScore();
    drawNeedle(needleColor, 45);
}

function startGame () {
    needleColor = getRandomColor();
    currentDirection = Direction.LEFT;
    currentAngle = 45;
    score = 0;
    drawGame();
    setFailAngle();
    gameUpdateInverval = setInterval(update, 10);
    canvas.onclick = checkClick;
}

function update () {
    currentAngle = currentDirection == Direction.LEFT ? currentAngle-1 : currentAngle+1;
    currentAngle = currentAngle % 360;
    drawNeedle(needleColor, currentAngle);

    if (normalizeAngle() == failAngle) {
        gameOver();
    }
}

function gameOver () {
    console.log("Game Over");
    clearInterval(gameUpdateInverval);
    canvas.onclick = startGame;
    ctx.font = "80px Arial";
    ctx.fillStyle = "#000000"
    ctx.textAlign = "center";
    ctx.fillText("Game Over", CENTER_X, CENTER_Y);
}

function updateScore() {
    ctx.clearRect(0,0,WIDTH, 30);
    ctx.font = "30px Arial";
    ctx.fillStyle = "#000000"
    ctx.textAlign = "center";
    ctx.fillText(`Score: ${score}`, CENTER_X, 30);
}

function goodClick () {
    currentDirection = currentDirection == Direction.LEFT ? Direction.RIGHT : Direction.LEFT;
    needleColor = getRandomColor();
    drawNeedle();
    setFailAngle();

    score++;
    updateScore();
}

function setFailAngle () {
    const arcs = {
        "#C70039": {
            lower: 0,
            upper: 90,
        },
        "#23DEDE": {
            lower: 90,
            upper: 180, 
        },
        "#FF33E3": {
            lower: 180,
            upper: 270, 
        },
        "#42DE23": {
            lower: 270,
            upper: 359, 
        },
    }
    failAngle = currentDirection == Direction.LEFT ? arcs[needleColor].lower : arcs[needleColor].upper;
}

function normalizeAngle () {
    let normalizedAngle = currentAngle;
    if (normalizedAngle < 0) {
        normalizedAngle += 360;
    }
    return normalizedAngle;
}

function checkClick () {
    const normalizedAngle = normalizeAngle();
    if (needleColor == "#C70039" && normalizedAngle < 90 && normalizedAngle > 0) {
        goodClick();
    } else if (needleColor == "#23DEDE" && normalizedAngle < 180 && normalizedAngle > 90) {
        goodClick();
    } else if (needleColor == "#FF33E3" && normalizedAngle < 270 && normalizedAngle > 180) {
        goodClick();
    } else if (needleColor == "#42DE23" && normalizedAngle < 360 && normalizedAngle > 270) {
        goodClick();
    } else {
        gameOver();
    }
}

startGame();
