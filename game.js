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
  jumpStrength: -12,
};

const platformWidth = 60;
const platformHeight = 10;
const platformCount = 7;

const maxVerticalGap = 110; // макс вертикальное расстояние
const minHorizontalGap = 50; // мин горизонтальное расстояние
const maxHorizontalGap = 150; // макс горизонтальное расстояние

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
    let newY = lastY - randomRange(50, maxVerticalGap);

    // Генерируем X с учётом мин и макс смещения от предыдущей платформы
    let direction = Math.random() < 0.5 ? -1 : 1;
    let deltaX = direction * randomRange(minHorizontalGap, maxHorizontalGap);
    let newX = lastX + deltaX;

    if (newX < 0) newX = 0;
    if (newX > canvas.width - platformWidth) newX = canvas.width - platformWidth;

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
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

  if (player.y < maxHeight) {
    maxHeight = player.y;
  }

  if (player.y > canvas.height) {
    resetGame();
  }
}

function checkPlatformCollision() {
  platforms.forEach(p => {
    if (
      player.velocityY > 0 &&
      player.y + player.height <= p.y &&
      player.y + player.height + player.velocityY >= p.y &&
      player.x + player.width > p.x &&
      player.x < p.x + p.width
    ) {
      player.velocityY = player.jumpStrength;

      // Подсчет очков за перепрыгнутую платформу
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
        // Генерируем новую платформу сверху
        const highestPlatformY = Math.min(...platforms.map(pl => pl.y));
        let newY = highestPlatformY - randomRange(50, maxVerticalGap);

        const highestPlatform = platforms.find(pl => pl.y === highestPlatformY);
        let direction = Math.random() < 0.5 ? -1 : 1;
        let deltaX = direction * randomRange(minHorizontalGap, maxHorizontalGap);
        let newX = highestPlatform.x + deltaX;

        if (newX < 0) newX = 0;
        if (newX > canvas.width - platformWidth) newX = canvas.width - platformWidth;

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
