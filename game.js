// Telegram WebApp init
if (window.Telegram?.WebApp) {
    Telegram.WebApp.ready();
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI элементы
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// Константы
const PLAYER_SIZE = 40;
const PLATFORM_WIDTH = 70;
const PLATFORM_HEIGHT = 10;
const GRAVITY = 0.35;
const JUMP_STRENGTH = -12.5; // усилен для iPhone 12 Pro
const PLAYER_SPEED = 6.5;

// Игровые переменные
const player = {
    x: 0,
    y: 0,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    velocityY: 0,
    velocityX: 0,
    gravity: GRAVITY,
    jumpStrength: JUMP_STRENGTH
};

const platforms = [];
let maxHeight = 0;
let score = 0;
let lastPlatformIndex = -1;
let gameActive = true;
let lastTime = 0;
const FPS = 60;
const FRAME_INTERVAL = 1000 / FPS;

// Запрет скроллов на iOS
document.body.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

// Функция ресайза
function resizeCanvas() {
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.height = vh;
}
window.addEventListener('resize', resizeCanvas);

// Инициализация
function initGame() {
    resizeCanvas();

    player.x = (canvas.width - PLAYER_SIZE) / 2;
    player.y = canvas.height * 0.7;
    player.velocityY = 0;
    player.velocityX = 0;
    maxHeight = player.y;
    score = 0;
    lastPlatformIndex = -1;
    gameActive = true;

    scoreDisplay.textContent = `Score: ${score}`;
    gameOverScreen.style.display = 'none';

    createPlatforms();
}

// Генерация платформ
function createPlatforms() {
    platforms.length = 0;

    const startPlatformX = (canvas.width - PLATFORM_WIDTH) / 2;
    const startPlatformY = player.y + player.height;

    platforms.push({
        x: startPlatformX,
        y: startPlatformY,
        width: PLATFORM_WIDTH,
        height: PLATFORM_HEIGHT,
        index: 0
    });

    let lastY = startPlatformY;
    const jumpHeight = Math.pow(player.jumpStrength, 2) / (2 * player.gravity);

    const maxStep = Math.min(jumpHeight * 0.8, canvas.height * 0.25);
    const minStep = canvas.height * 0.12;

    for (let i = 1; i < 12; i++) {
        let step = minStep + Math.random() * (maxStep - minStep);
        const newY = lastY - step;
        const newX = Math.random() * (canvas.width - PLATFORM_WIDTH);

        platforms.push({
            x: newX,
            y: newY,
            width: PLATFORM_WIDTH,
            height: PLATFORM_HEIGHT,
            index: i
        });

        lastY = newY;
    }
}

// Отрисовка
function drawPlayer() {
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(
        player.x + player.width / 2,
        player.y + player.height / 2,
        player.width / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function drawPlatforms() {
    ctx.fillStyle = '#8B4513';
    for (let p of platforms) {
        ctx.fillRect(p.x, p.y, p.width, p.height);
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#6495ED');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Логика
function updatePlayer() {
    player.velocityY += player.gravity;
    player.y += player.velocityY;
    player.x += player.velocityX;

    if (player.y < maxHeight) {
        maxHeight = player.y;
    }

    if (player.y > canvas.height) {
        gameOver();
        return;
    }

    if (player.x + player.width < 0) {
        player.x = canvas.width;
    } else if (player.x > canvas.width) {
        player.x = -player.width;
    }
}

function checkPlatformCollision() {
    const playerBottom = player.y + player.height;
    for (let p of platforms) {
        if (
            player.velocityY > 0 &&
            playerBottom <= p.y + 5 &&
            playerBottom + player.velocityY >= p.y &&
            player.x + player.width > p.x &&
            player.x < p.x + p.width
        ) {
            player.y = p.y - player.height;
            player.velocityY = player.jumpStrength;
            if (p.index !== lastPlatformIndex) {
                score++;
                lastPlatformIndex = p.index;
                scoreDisplay.textContent = `Score: ${score}`;
            }
            break;
        }
    }
}

function scrollWorld() {
    if (player.y < canvas.height * 0.3) {
        const diff = canvas.height * 0.3 - player.y;
        player.y = canvas.height * 0.3;
        for (let p of platforms) {
            p.y += diff;
        }
    }
}

function gameOver() {
    gameActive = false;
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'flex';

    if (window.Telegram?.WebApp) {
        Telegram.WebApp.sendData(JSON.stringify({ score }));
    }
}

function resetGame() {
    initGame();
    gameLoop(0);
}

// Управление
const keys = { left: false, right: false };
document.getElementById('leftBtn').addEventListener('touchstart', e => { e.preventDefault(); keys.left = true; });
document.getElementById('leftBtn').addEventListener('touchend', e => { e.preventDefault(); keys.left = false; });
document.getElementById('rightBtn').addEventListener('touchstart', e => { e.preventDefault(); keys.right = true; });
document.getElementById('rightBtn').addEventListener('touchend', e => { e.preventDefault(); keys.right = false; });

function handleInput() {
    if (keys.left) {
        player.velocityX = -PLAYER_SPEED;
    } else if (keys.right) {
        player.velocityX = PLAYER_SPEED;
    } else {
        player.velocityX = 0;
    }
}

// Игровой цикл
function gameLoop(timestamp) {
    if (!gameActive) {
        requestAnimationFrame(gameLoop);
        return;
    }

    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    if (delta < FRAME_INTERVAL) {
        requestAnimationFrame(gameLoop);
        return;
    }
    lastTime = timestamp - (delta % FRAME_INTERVAL);

    handleInput();
    updatePlayer();

    if (gameActive) {
        checkPlatformCollision();
        scrollWorld();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        drawPlatforms();
        drawPlayer();
    }

    requestAnimationFrame(gameLoop);
}

// Запуск
window.addEventListener('load', () => {
    initGame();
    gameLoop(0);
});
restartBtn.addEventListener('click', resetGame);
