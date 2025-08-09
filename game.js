const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
  x: 185,
  y: 500,
  width: 30,
  height: 30,
  velocityY: 0,
  velocityX: 0,
  gravity: 0.4,
  jumpStrength: -12, // прыжок вверх — отрицательное значение
};

const jumpHeight = Math.abs(player.jumpStrength * (player.jumpStrength / player.gravity)); 
// Формула примерная: время полёта вверх * скорость прыжка для высоты

const platformWidth = 60;
const platformHeight = 10;
const platformCount = 8;

const platforms = [];
let maxHeight = player.y;

let score = 0;
let lastPlatformIndex = -1;

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function initPlatforms() {
  platforms.length = 0;
  let lastY = canvas.height;
  let lastX = Math.random() * (canvas.width - platformWidth);

  for (let i = 0; i < platformCount; i++) {
    // Вертикально — ровно jumpHeight (чуть вариации)
    let newY = lastY - randomRange(jumpHeight * 0.8, jumpHeight);

    // Горизонтально — случайно по всему экрану
    let newX = Math.random() * (canvas.width - platformWidth);

    platforms.push({
      x: newX,
      y: newY,
      width: platformWidth,
      height: platformHeight,
      index: i,
    });

    lastY = newY;
    lastX = newX;
  }
}

function drawPlayer() {
  ctx.fillStyle = 'green';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawPlatforms() {
  ctx.fillStyle = 'brown';
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });
}

function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);
}

function updatePlayer() {
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  player.x += player.velocityX;

  // Wrap-around по горизонтали:
  if (player.x + player.width < 0) {
    player.x = canvas.width;
  } else if (player.x > canvas.width) {
    player.x = -player.width;
  }

  if (player.y < maxHeight) {
    maxHeight = player.y;
  }

  if (player.y > canvas.height) {
    resetGame();
  }
}

function checkPlatformCollision() {
  platforms.forEach(p => {
    // Проверяем столкновение по вертикали и горизонтали с учетом wrap-around
    // Для wrap-around по X делаем проверку, что игрок либо на платформе напрямую,
    // либо с учётом смещения экрана

    // Рассчитаем игрока X с учетом wrap-around для коллизии:
    let playerXNorm = (player.x + canvas.width) % canvas.width;
    let platformXNorm = (p.x + canvas.width) % canvas.width;

    if (
      player.velocityY > 0 &&
      player.y + player.height <= p.y &&
      player.y + player.height + player.velocityY >= p.y &&
      (
        // Игрок и платформа на прямом перекрытии
        (playerXNorm + player.width > platformXNorm && playerXNorm < platformXNorm + p.width)
        ||
        // Или проверим возможное "перекрытие" через границу экрана
        (playerXNorm + player.width > platformXNorm - canvas.width && playerXNorm < platformXNorm + p.width - canvas.width)
      )
    ) {
      player.velocityY = player.jumpStrength;

      if (p.index !== lastPlatformIndex) {
        score++;
        lastPlatformIndex = p.index;
      }
    }
  });
}

function scrollWorld() {
  if (player.y < canvas.height / 3) {
    const diff = (canvas.height / 3) - player.y;
    player.y = canvas.height / 3;

    platforms.forEach(p => {
      p.y += diff;

      if (p.y > canvas.height) {
        // Генерируем новую платформу сверху с вертикальным расстоянием, подходящим под jumpHeight
        const highestPlatformY = Math.min(...platforms.map(pl => pl.y));
        let newY = highestPlatformY - randomRange(jumpHeight * 0.8, jumpHeight);

        // Горизонтально — полностью случайно по ширине экрана
        let newX = Math.random() * (canvas.width - platformWidth);

        p.y = newY;
        p.x = newX;

        p.index = (p.index + platformCount) % 100000;
      }
    });

    maxHeight += diff;
  }
}

const keys = {
  left: false,
  right: false,
};

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key === 'a') {
    keys.left = true;
  } else if (e.key === 'ArrowRight' || e.key === 'd') {
    keys.right = true;
  }
});

document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft' || e.key === 'a') {
    keys.left = false;
  } else if (e.key === 'ArrowRight' || e.key === 'd') {
    keys.right = false;
  }
});

function handleInput() {
  if (keys.left) {
    player.velocityX = -5;
  } else if (keys.right) {
    player.velocityX = 5;
  } else {
    player.velocityX = 0;
  }
}

function resetGame() {
  player.x = 185;
  player.y = 500;
  player.velocityX = 0;
  player.velocityY = 0;
  maxHeight = player.y;
  score = 0;
  lastPlatformIndex = -1;
  initPlatforms();
}

function gameLoop() {
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

initPlatforms();
gameLoop();
