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

const jumpHeight = Math.abs(player.jumpStrength * (player.jumpStrength / player.gravity)); 

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

// Ставим стартовую платформу под игроком, чтобы не падал в пустоту
function initPlatforms() {
  platforms.length = 0;
  // Стартовая платформа под игроком
  platforms.push({
    x: player.x,
    y: player.y + player.height,
    width: platformWidth,
    height: platformHeight,
    index: 0,
  });
  let lastY = player.y + player.height;
  let lastX = player.x;

  for (let i = 1; i < platformCount; i++) {
    // Максимальная высота прыжка (примерно)
    const maxJumpHeight = Math.abs(player.jumpStrength) * 25;

    // Новая Y позиция платформы чуть выше предыдущей, не дальше чем maxJumpHeight
    let newY = lastY - randomRange(maxJumpHeight * 0.7, maxJumpHeight);

    // Новая X позиция — в пределах прыжка по горизонтали, чтобы можно было допрыгнуть
    // Например, max horizontal jump distance
    const maxHorizontalJump = 150;

    // Ограничиваем X так, чтобы платформа была не слишком далеко
    let minX = Math.max(0, lastX - maxHorizontalJump);
    let maxX = Math.min(screenWidth - platformWidth, lastX + maxHorizontalJump);

    let newX = randomRange(minX, maxX);

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

  // Wrap-around по горизонтали
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
    if (player.velocityY > 0) {
      const isAbovePlatform = player.y + player.height <= p.y + 10;
      const willPassThrough = player.y + player.height + player.velocityY >= p.y;

      let playerXNorm = (player.x + canvas.width) % canvas.width;
      let platformXNorm = (p.x + canvas.width) % canvas.width;

      const horizontalCollision =
        (playerXNorm + player.width > platformXNorm && playerXNorm < platformXNorm + p.width) ||
        (playerXNorm + player.width > platformXNorm - canvas.width && playerXNorm < platformXNorm + p.width - canvas.width);

      if (isAbovePlatform && willPassThrough && horizontalCollision) {
        player.velocityY = player.jumpStrength;

        if (p.index !== lastPlatformIndex) {
          score++;
          lastPlatformIndex = p.index;
        }
      }
    }
  });
}

function scrollWorld() {
  if (player.y < screenHeight / 3) {
    const diff = (screenHeight / 3) - player.y;
    player.y = screenHeight / 3;

    platforms.forEach(p => {
      p.y += diff;

      if (p.y > screenHeight) {
        // Находим самую верхнюю платформу
        const highestPlatform = platforms.reduce((prev, curr) => (curr.y < prev.y ? curr : prev));

        // Генерируем новую платформу на расстоянии прыжка выше верхней платформы
        const maxJumpHeight = Math.abs(player.jumpStrength) * 25;
        const maxHorizontalJump = 150;

        let newY = highestPlatform.y - randomRange(maxJumpHeight * 0.7, maxJumpHeight);

        let minX = Math.max(0, highestPlatform.x - maxHorizontalJump);
        let maxX = Math.min(screenWidth - platformWidth, highestPlatform.x + maxHorizontalJump);

        let newX = randomRange(minX, maxX);

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

