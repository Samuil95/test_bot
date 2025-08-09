// ===================== Инициализация =====================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Проверка платформы
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isTelegram = window.Telegram && window.Telegram.WebApp;

// Размеры элементов
let PLAYER_SIZE, PLATFORM_WIDTH, PLATFORM_HEIGHT;

// Элементы UI
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const shareBtn = document.getElementById('shareBtn');

const player = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    velocityY: 0,
    velocityX: 0,
    gravity: 0,
    jumpStrength: 0,
};

let jumpHeight;
const platforms = [];
let maxHeight = 0;
let score = 0;
let lastPlatformIndex = -1;
let gameActive = true;
let scrollOffset = 0;
let lastTime = 0;
const fps = 60;
const frameInterval = 1000 / fps;

// ===================== Основные функции =====================
function initSizes() {
    PLAYER_SIZE = Math.min(window.innerWidth * 0.08, 40);
    PLATFORM_WIDTH = window.innerWidth * 0.18;
    PLATFORM_HEIGHT = Math.max(window.innerHeight * 0.012, 4);
    
    player.width = PLAYER_SIZE;
    player.height = PLAYER_SIZE;
    player.gravity = isIOS ? 0.32 : 0.35;
    player.jumpStrength = -10;
    
    jumpHeight = Math.abs(player.jumpStrength * (player.jumpStrength / player.gravity));
}

function initGame() {
    initSizes();
    resizeCanvas();
    
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height * 0.7;
    maxHeight = player.y;
    
    initPlatforms();
    
    // Telegram-specific setup
    if (isTelegram) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        Telegram.WebApp.enableZoom(false);
        shareBtn.style.display = 'block';
    } else {
        shareBtn.style.display = 'none';
    }
    
    // Сброс состояния игры
    gameActive = true;
    score = 0;
    lastPlatformIndex = -1;
    gameOverScreen.style.display = 'none';
    scoreDisplay.textContent = `Score: ${score}`;
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initPlatforms() {
    platforms.length = 0;
    
    // Стартовая платформа
    platforms.push({
        x: player.x,
        y: player.y + player.height,
        width: PLATFORM_WIDTH,
        height: PLATFORM_HEIGHT,
        index: 0,
    });
    
    let lastY = player.y + player.height;
    
    for (let i = 1; i < 12; i++) {
        const newY = lastY - randomRange(jumpHeight * 0.7, jumpHeight * 0.9);
        const newX = Math.random() * (canvas.width - PLATFORM_WIDTH);
        
        platforms.push({
            x: newX,
            y: newY,
            width: PLATFORM_WIDTH,
            height: PLATFORM_HEIGHT,
            index: i,
        });
        
        lastY = newY;
    }
}

// ... остальные функции (drawPlayer, drawPlatforms и т.д.) без изменений ...

// ===================== Игровой цикл =====================
function gameLoop(timestamp) {
    if (!gameActive) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Контроль FPS
    if (timestamp < lastTime + frameInterval) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    lastTime = timestamp;
    
    // Обновление состояния
    handleInput();
    updatePlayer();
    
    if (gameActive) {
        checkPlatformCollision();
        scrollWorld();
        
        // Отрисовка
        drawBackground();
        drawPlatforms();
        drawPlayer();
    }
    
    requestAnimationFrame(gameLoop);
}

// ===================== Запуск игры =====================
function startGame() {
    initGame();
    gameLoop(0);
}

// Ожидание полной загрузки страницы
window.addEventListener('load', () => {
    // Для Telegram дожидаемся инициализации WebApp
    if (isTelegram) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        setTimeout(startGame, 300);
    } else {
        startGame();
    }
});

// Обработка изменения ориентации/размера
window.addEventListener('resize', () => {
    const isLandscape = window.innerWidth > window.innerHeight;
    player.gravity = isLandscape ? 0.25 : (isIOS ? 0.32 : 0.35);
    initGame();
});

window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        const isLandscape = window.innerWidth > window.innerHeight;
        player.gravity = isLandscape ? 0.25 : (isIOS ? 0.32 : 0.35);
        initGame();
    }, 300);
});
