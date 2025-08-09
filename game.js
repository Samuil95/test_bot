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
  jumpStrength: -12,  // чуть сильнее прыжок
};

const platforms = [];
const platformWidth = 60;
const platformHeight = 10;
const platformCount = 7;

let maxHeight = player.y;

function initPlatforms() {
  platforms.length = 0;
  for (let i = 0; i < platformCount; i++) {
    platforms.push({
      x: Math.random() * (canvas.width - platformWidth),
      y: canvas.height - i * 80,
      width: platformWidth,
      height: platformHeight,
    });
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
  ctx.fillText(`Score: ${Math.max(0, Math.floor(maxHeight - player.y))}`, 10, 30);
}

function updatePlayer() {
  // Добавляем гравитацию
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  // Горизонтальное движение с ограничениями по краям
  player.x += player.velocityX;
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

  // Обновляем максимальную высоту (для очков)
  if (player.y < maxHeight) {
    maxHeight = player.y;
  }

  // Если упал вниз - сброс игры
  if (player.y > canvas.height) {
    resetGame();
  }
}

function checkPlatformCollision() {
  platforms.forEach(p => {
    // Проверяем, касается ли игрок платформы при падении вниз (velocityY > 0)
    if (
      player.velocityY > 0 && 
      player.y + player.height <= p.y &&
      player.y + player.height + player.velocityY >= p.y &&
      player.x + player.width > p.x &&
      player.x < p.x + p.width
    ) {
      player.velocityY = player.jumpStrength;  // Прыжок вверх
    }
  });
}

function scrollWorld() {
  // Если игрок поднялся выше 1/3 высоты канваса, то "поднимаем" платформы вниз, создавая эффект движения вверх
  if (player.y < canvas.height / 3) {
    const diff = (canvas.height / 3) - player.y;
    player.y = canvas.height / 3;

    platforms.forEach(p => {
      p.y += diff;

      // Если платформа ушла вниз за экран — переносим её наверх
      if (p.y > canvas.height) {
        p.y = 0;
        p.x = Math.random() * (canvas.width - platformWidth);
      }
    });

    maxHeight += diff; // увеличиваем очки
  }
}

// Управление
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
