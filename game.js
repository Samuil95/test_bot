const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 200, y: 500, dy: 0 };
let gravity = 0.2;
let jumpPower = -6;
let platforms = [];

function initPlatforms() {
  for (let i = 0; i < 6; i++) {
    platforms.push({
      x: Math.random() * 350,
      y: 600 - i * 100,
      width: 60,
      height: 10
    });
  }
}

function drawPlayer() {
  ctx.fillStyle = 'green';
  ctx.fillRect(player.x, player.y, 30, 30);
}

function drawPlatforms() {
  ctx.fillStyle = 'brown';
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });
}

function update() {
  player.dy += gravity;
  player.y += player.dy;

  platforms.forEach(p => {
    if (
      player.x + 30 > p.x &&
      player.x < p.x + p.width &&
      player.y + 30 > p.y &&
      player.y + 30 < p.y + player.dy + 5
    ) {
      player.dy = jumpPower;
    }
  });

  if (player.y < 300) {
    let diff = 300 - player.y;
    player.y = 300;
    platforms.forEach(p => {
      p.y += diff;
      if (p.y > 600) {
        p.y = 0;
        p.x = Math.random() * 350;
      }
    });
  }
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  drawPlayer();
  drawPlatforms();
  requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') player.x -= 20;
  if (e.key === 'ArrowRight') player.x += 20;
});

initPlatforms();
loop();
