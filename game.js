// ================ Инициализация игры ================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Элементы UI
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// Игровые константы
const PLAYER_SIZE = 40;
const PLATFORM_WIDTH = 70;
const PLATFORM_HEIGHT = 10;
const GRAVITY = 0.35;
const JUMP_STRENGTH = -10.5;
const PLAYER_SPEED = 8.0; // Увеличена скорость для мобильных

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
let scrollOffset = 0;
let lastTime = 0;
const FPS = 60;
const FRAME_INTERVAL = 1000 / FPS;

// ================ Основные функции ================
function initGame() {
    // Установка размеров canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Сброс игрового состояния
    player.x = canvas.width / 2 - PLAYER_SIZE / 2;
    player.y = canvas.height * 0.7;
    player.velocityY = 0;
    player.velocityX = 0;
    maxHeight = player.y;
    score = 0;
    lastPlatformIndex = -1;
    gameActive = true;
    scrollOffset = 0;
    
    // Обновление UI
    scoreDisplay.textContent = `Score: ${score}`;
    gameOverScreen.style.display = 'none';
    
    // Создание платформ
    createPlatforms();
}

function createPlatforms() {
    platforms.length = 0;
    
    // Стартовая платформа под игроком
    platforms.push({
        x: player.x,
        y: player.y + player.height,
        width: PLATFORM_WIDTH,
        height: PLATFORM_HEIGHT,
        index: 0
    });
    
    let lastY = player.y + player.height;
    const jumpHeight = Math.abs(JUMP_STRENGTH * (JUMP_STRENGTH / GRAVITY));
    
    // Ограничения для мобильных устройств
    const maxStep = canvas.height * 0.25;
    const minStep = canvas.height * 0.15;
    
    // Создание остальных платформ
    for (let i = 1; i < 12; i++) {
        let step = jumpHeight * (0.5 + Math.random() * 0.3);
        step = Math.min(step, maxStep);
        step = Math.max(step, minStep);
        
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
    
    for (let i = 0; i < platforms.length; i++) {
        const p = platforms[i];
        ctx.fillRect(p.x, p.y, p.width, p.height);
    }
}

function drawBackground() {
    // Градиентное небо
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#6495ED');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updatePlayer() {
    // Применяем гравитацию
    player.velocityY += player.gravity;
    player.y += player.velocityY;
    player.x += player.velocityX;
    
    // Обновляем максимальную высоту
    if (player.y < maxHeight) {
        maxHeight = player.y;
        scrollOffset = canvas.height - maxHeight;
    }
    
    // Проверка выхода за нижнюю границу
    if (player.y > canvas.height) {
        gameOver();
        return;
    }
    
    // Переход через боковые границы
    if (player.x + player.width < 0) {
        player.x = canvas.width;
    } else if (player.x > canvas.width) {
        player.x = -player.width;
    }
}

function checkPlatformCollision() {
    const playerBottom = player.y + player.height;
    
    for (let i = 0; i < platforms.length; i++) {
        const p = platforms[i];
        
        // Проверка столкновения
        if (player.velocityY > 0 && 
            playerBottom <= p.y + 5 && 
            playerBottom + player.velocityY >= p.y &&
            player.x + player.width > p.x && 
            player.x < p.x + p.width) {
            
            player.y = p.y - player.height;
            player.velocityY = player.jumpStrength;
            
            // Обновление счета
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
    // Скроллинг мира при достижении верхней части экрана
    if (player.y < canvas.height * 0.3) {
        const diff = canvas.height * 0.3 - player.y;
        player.y = canvas.height * 0.3;
        
        for (let i = 0; i < platforms.length; i++) {
            const p = platforms[i];
            p.y += diff;
        }
    }
}

function gameOver() {
    gameActive = false;
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'flex';
}

function resetGame() {
    initGame();
    gameLoop(0);
}

// ================ Управление ================
const keys = {
    left: false,
    right: false
};

// Настройка кнопок управления
document.getElementById('leftBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.left = true;
});

document.getElementById('leftBtn').addEventListener('touchend', (e) => {
    e.preventDefault();
    keys.left = false;
});

document.getElementById('rightBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.right = true;
});

document.getElementById('rightBtn').addEventListener('touchend', (e) => {
    e.preventDefault();
    keys.right = false;
});

// Обработка свайпов
let touchStartX = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    const diff = touchX - touchStartX;
    
    if (Math.abs(diff) > 10) {
        keys.left = diff < 0;
        keys.right = diff > 0;
    }
});

canvas.addEventListener('touchend', () => {
    keys.left = false;
    keys.right = false;
});

// Обработка ввода
function handleInput() {
    if (keys.left) {
        player.velocityX = -PLAYER_SPEED;
    } else if (keys.right) {
        player.velocityX = PLAYER_SPEED;
    } else {
        player.velocityX = 0;
    }
}

// ================ Игровой цикл ================
function gameLoop(timestamp) {
    if (!gameActive) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Контроль FPS
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    
    if (delta < FRAME_INTERVAL) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    lastTime = timestamp - (delta % FRAME_INTERVAL);
    
    // Обновление игры
    handleInput();
    updatePlayer();
    
    if (gameActive) {
        checkPlatformCollision();
        scrollWorld();
        
        // Отрисовка
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        drawPlatforms();
        drawPlayer();
    }
    
    requestAnimationFrame(gameLoop);
}

// ================ Запуск игры ================
// Инициализация игры при загрузке
window.addEventListener('load', () => {
    initGame();
    gameLoop(0);
});

// Ресайз окна
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Настройка кнопки рестарта
restartBtn.addEventListener('click', resetGame);
