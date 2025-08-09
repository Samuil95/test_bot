const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Размеры под iPhone 12 Pro (390x844)
const PLAYER_SIZE = Math.min(window.innerWidth * 0.08, 40);
const PLATFORM_WIDTH = window.innerWidth * 0.18;
const PLATFORM_HEIGHT = window.innerHeight * 0.012;
const PLATFORM_COUNT = 12;
const GRAVITY = 0.35;
const JUMP_STRENGTH = -10;
const PLAYER_SPEED = 6;
const VISIBLE_HEIGHT_RANGE = 2.0;

// Telegram WebApp integration
const isTelegram = window.Telegram && window.Telegram.WebApp;

const player = {
  x: 0,
  y: 0,
  width: PLAYER_SIZE,
  height: PLAYER_SIZE,
  velocityY: 0,
  velocityX: 0,
  gravity: GRAVITY,
  jumpStrength: JUMP_STRENGTH,
};

// Предрасчет высоты прыжка
const jumpHeight = Math.abs(JUMP_STRENGTH * (JUMP_STRENGTH / GRAVITY));

const platforms = [];
let maxHeight = 0;
let score = 0;
let lastPlatformIndex = -1;
let gameActive = true;
let scrollOffset = 0;

// Элементы UI
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// Инициализация размеров
function initGame() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height * 0.7;
  maxHeight = player.y;
  
  initPlatforms();
  
  // Telegram-specific setup
  if (isTelegram) {
    Telegram.WebApp.expand();
    Telegram.WebApp.enableZoom(false);
    Telegram.WebApp.MainButton.setText('RESTART').show().onClick(resetGame);
  }
}

// Платформы
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
  
  for (let i = 1; i < PLATFORM_COUNT; i++) {
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

// Рисование игрока
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
  
  // Глаза для лучшей видимости
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(
    player.x + player.width / 3,
    player.y + player.height / 3,
    player.width / 6,
    0,
    Math.PI * 2
  );
  ctx.arc(
    player.x + (player.width * 2) / 3,
    player.y + player.height / 3,
    player.width / 6,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

// Рисование платформ
function drawPlatforms() {
  ctx.fillStyle = '#8B4513';
  
  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    const isVisible = p.y > player.y - canvas.height * 1.5 && p.y < player.y + canvas.height;
    
    if (isVisible) {
      // Градиент для объема
      const gradient = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
      gradient.addColorStop(0, '#A0522D');
      gradient.addColorStop(1, '#8B4513');
      ctx.fillStyle = gradient;
      
      // Скругленные углы
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.width, p.height, 5);
      ctx.fill();
    }
  }
}

// Фон с параллаксом
function drawBackground() {
  // Небо
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#6495ED');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Облака с параллаксом
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for(let i = 0; i < 5; i++) {
    const x = (i * 200 + scrollOffset * 0.1) % (canvas.width + 200) - 100;
    ctx.beginPath();
    ctx.arc(x, 100, 30, 0, Math.PI * 2);
    ctx.arc(x + 40, 90, 25, 0, Math.PI * 2);
    ctx.arc(x + 80, 100, 30, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Обновление игрока
function updatePlayer() {
  player.velocityY += player.gravity;
  player.y += player.velocityY;
  player.x += player.velocityX;
  
  // Обновление максимальной высоты
  if (player.y < maxHeight) {
    maxHeight = player.y;
    scrollOffset = canvas.height - maxHeight;
  }

  // Выход за нижнюю границу
  if (player.y > canvas.height) {
    gameOver();
    return;
  }

  // Переход через края экрана
  if (player.x + player.width < 0) {
    player.x = canvas.width;
  } else if (player.x > canvas.width) {
    player.x = -player.width;
  }
}

// Проверка коллизий с платформами
function checkPlatformCollision() {
  const playerBottom = player.y + player.height;
  const playerNextBottom = playerBottom + player.velocityY;
  
  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    
    // Быстрая вертикальная проверка
    if (playerNextBottom > p.y && playerBottom <= p.y && player.velocityY > 0) {
      // Точная горизонтальная проверка
      if (player.x < p.x + p.width && player.x + player.width > p.x) {
        player.y = p.y - player.height;
        player.velocityY = player.jumpStrength;
        
        if (p.index !== lastPlatformIndex) {
          score++;
          lastPlatformIndex = p.index;
          scoreDisplay.textContent = `Score: ${score}`;
        }
        break; // Обрабатываем только одну платформу за кадр
      }
    }
  }
}

// Скроллинг мира
function scrollWorld() {
  if (player.y < canvas.height * 0.3) {
    const diff = canvas.height * 0.3 - player.y;
    player.y = canvas.height * 0.3;
    
    for (let i = 0; i < platforms.length; i++) {
      const p = platforms[i];
      p.y += diff;
      
      // Перемещение платформ вышедших за экран
      if (p.y > canvas.height) {
        // Находим самую высокую платформу
        let minY = platforms[0].y;
        for (let j = 1; j < platforms.length; j++) {
          if (platforms[j].y < minY) minY = platforms[j].y;
        }
        
        p.y = minY - randomRange(jumpHeight * 0.7, jumpHeight * 0.9);
        p.x = Math.random() * (canvas.width - PLATFORM_WIDTH);
        p.index = getNextPlatformIndex();
      }
    }
  }
}

// Служебные функции
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function getNextPlatformIndex() {
  let maxIndex = 0;
  for (let i = 0; i < platforms.length; i++) {
    if (platforms[i].index > maxIndex) maxIndex = platforms[i].index;
  }
  return maxIndex + 1;
}

// Управление
const keys = {
  left: false,
  right: false,
};

// Кнопки управления
document.getElementById('leftBtn').addEventListener('touchstart', (e) => {
  e.preventDefault();
  keys.left = true;
  keys.right = false;
});

document.getElementById('leftBtn').addEventListener('touchend', (e) => {
  e.preventDefault();
  keys.left = false;
});

document.getElementById('rightBtn').addEventListener('touchstart', (e) => {
  e.preventDefault();
  keys.right = true;
  keys.left = false;
});

document.getElementById('rightBtn').addEventListener('touchend', (e) => {
  e.preventDefault();
  keys.right = false;
});

// Свайпы по экрану
let touchStartX = 0;

canvas.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  if (!touchStartX) return;
  
  const touchX = e.touches[0].clientX;
  const diffX = touchX - touchStartX;
  
  if (Math.abs(diffX) > 10) {
    keys.left = diffX < 0;
    keys.right = diffX > 0;
  }
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', () => {
  keys.left = false;
  keys.right = false;
  touchStartX = 0;
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

// Завершение игры
function gameOver() {
  gameActive = false;
  finalScoreDisplay.textContent = score;
  gameOverScreen.style.display = 'flex';
}

// Перезапуск игры
function resetGame() {
  gameActive = true;
  score = 0;
  lastPlatformIndex = -1;
  gameOverScreen.style.display = 'none';
  scoreDisplay.textContent = `Score: ${score}`;
  initGame();
}

restartBtn.addEventListener('click', resetGame);

// Игровой цикл с оптимизацией FPS
let lastTime = 0;
const fps = 60;
const frameInterval = 1000 / fps;

function gameLoop(timestamp) {
  if (!gameActive) return;
  
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

// Адаптация под изменение ориентации
function handleOrientation() {
  const isLandscape = window.innerWidth > window.innerHeight;
  player.gravity = isLandscape ? 0.25 : 0.35;
  initGame();
}

window.addEventListener('resize', handleOrientation);
window.addEventListener('orientationchange', handleOrientation);

// Инициализация игры
initGame();
gameLoop(0);

// Полифил для roundRect (для старых iOS)
if (CanvasRenderingContext2D.prototype.roundRect === undefined) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    
    this.beginPath();
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();
    return this;
  };
}
