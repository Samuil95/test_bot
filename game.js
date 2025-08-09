const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Константы для улучшения читаемости и управления параметрами
const PLAYER_SIZE = 30;
const PLATFORM_WIDTH = 60;
const PLATFORM_HEIGHT = 10;
const PLATFORM_COUNT = 8;
const GRAVITY = 0.4;
const JUMP_STRENGTH = -12;
const PLAYER_SPEED = 5;
const VISIBLE_HEIGHT_RANGE = 1.5; // Диапазон видимых платформ относительно высоты канваса

const player = {
  x: 185,
  y: 500,
  width: PLAYER_SIZE,
  height: PLAYER_SIZE,
  velocityY: 0,
  velocityX: 0,
  gravity: GRAVITY,
  jumpStrength: JUMP_STRENGTH,
};

// Предрасчет высоты прыжка (оптимизация)
const jumpHeight = Math.abs(JUMP_STRENGTH * (JUMP_STRENGTH / GRAVITY));

const platforms = [];
let maxHeight = player.y;
let score = 0;
let lastPlatformIndex = -1;
let gameActive = true;

// Оптимизация: кеширование частых вычислений
const canvasMidHeight = canvas.height / 3;
const maxVisibleY = canvas.height * VISIBLE_HEIGHT_RANGE;

// 1. Оптимизация генерации платформ
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
  
  // Генерация остальных платформ
  for (let i = 1; i < PLATFORM_COUNT; i++) {
    const newY = lastY - randomRange(jumpHeight * 0.8, jumpHeight);
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

// 2. Оптимизация отрисовки - рисуем только видимые платформы
function drawPlatforms() {
  ctx.fillStyle = 'brown';
  
  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    // Проверка видимости платформы
    if (p.y > maxHeight - maxVisibleY && p.y < maxHeight + canvas.height) {
      ctx.fillRect(p.x, p.y, p.width, p.height);
    }
  }
}

// 3. Оптимизация коллизий
function checkPlatformCollision() {
  const playerBottom = player.y + player.height;
  const playerNextBottom = playerBottom + player.velocityY;
  
  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    
    // Быстрая проверка по вертикали перед точным расчетом
    if (playerNextBottom > p.y && playerBottom < p.y) {
      const playerRight = player.x + player.width;
      const platformRight = p.x + p.width;
      
      // Точная проверка горизонтального пересечения
      if (player.x < platformRight && playerRight > p.x) {
        // Корректировка позиции игрока
        player.y = p.y - player.height;
        player.velocityY = player.jumpStrength;
        
        if (p.index !== lastPlatformIndex) {
          score++;
          lastPlatformIndex = p.index;
        }
        return; // Выход после первой коллизии
      }
    }
  }
}

// 4. Оптимизация скроллинга мира
function scrollWorld() {
  if (player.y < canvasMidHeight) {
    const diff = canvasMidHeight - player.y;
    player.y = canvasMidHeight;
    maxHeight += diff;

    for (let i = 0; i < platforms.length; i++) {
      const p = platforms[i];
      p.y += diff;
      
      // Перемещение платформ вышедших за экран
      if (p.y > canvas.height) {
        p.y = getNewPlatformY();
        p.x = Math.random() * (canvas.width - PLATFORM_WIDTH);
        p.index = getNextPlatformIndex();
      }
    }
  }
}

// 5. Вспомогательные оптимизированные функции
function getNewPlatformY() {
  let minY = platforms[0].y;
  for (let i = 1; i < platforms.length; i++) {
    if (platforms[i].y < minY) minY = platforms[i].y;
  }
  return minY - randomRange(jumpHeight * 0.8, jumpHeight);
}

function getNextPlatformIndex() {
  let maxIndex = 0;
  for (let i = 0; i < platforms.length; i++) {
    if (platforms[i].index > maxIndex) maxIndex = platforms[i].index;
  }
  return maxIndex + 1;
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

// 6. Оптимизация игрового цикла
function gameLoop() {
  if (!gameActive) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  handleInput();
  updatePlayer();
  checkPlatformCollision();
  scrollWorld();

  drawPlatforms();
  drawPlayer();
  drawScore();

  requestAnimationFrame(gameLoop);
}

// Остальные функции остаются аналогичными, но используют константы
// ...
