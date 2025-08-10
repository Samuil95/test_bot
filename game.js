// Размеры игрового поля (в блоках)
const GRID_SIZE = 20;
const BLOCK_SIZE = 20; // Размер одного блока в пикселях

// Направления
const UP = { x: 0, y: -1 };
const DOWN = { x: 0, y: 1 };
const LEFT = { x: -1, y: 0 };
const RIGHT = { x: 1, y: 0 };

// Элементы
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// Переменные игры
let snake = [];
let food = {};
let direction = RIGHT;
let nextDirection = RIGHT;
let score = 0;
let gameActive = false;
let gameLoopId = null;

// Инициализация игры
function initGame() {
    // Размер canvas
    canvas.width = GRID_SIZE * BLOCK_SIZE;
    canvas.height = GRID_SIZE * BLOCK_SIZE;

    // Инициализация змейки
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    // Создаем еду
    generateFood();

    // Сброс направления
    direction = RIGHT;
    nextDirection = RIGHT;

    // Сброс счета
    score = 0;
    scoreDisplay.textContent = `Счет: ${score}`;

    // Скрыть экран окончания игры
    gameOverScreen.style.display = 'none';

    // Запуск игры
    gameActive = true;
}

// Генерация еды
function generateFood() {
    // Генерируем случайные координаты, пока не найдем свободное место
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));

    food = newFood;
}

// Обновление игры
function update() {
    if (!gameActive) return;

    // Обновляем направление
    direction = nextDirection;

    // Перемещаем змейку: добавляем голову в новом направлении
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    // Проверка на столкновение с границами
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        gameOver();
        return;
    }

    // Проверка на столкновение с собой
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    // Добавляем новую голову
    snake.unshift(head);

    // Проверка, съели ли еду
    if (head.x === food.x && head.y === food.y) {
        // Увеличиваем счет
        score++;
        scoreDisplay.textContent = `Счет: ${score}`;
        // Генерируем новую еду
        generateFood();
    } else {
        // Удаляем хвост, если не съели еду
        snake.pop();
    }
}

// Отрисовка игры
function draw() {
    // Очистка холста
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Отрисовка змейки
    ctx.fillStyle = '#4CAF50';
    snake.forEach(segment => {
        ctx.fillRect(
            segment.x * BLOCK_SIZE,
            segment.y * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
        );
    });

    // Отрисовка еды
    ctx.fillStyle = '#FF5252';
    ctx.fillRect(
        food.x * BLOCK_SIZE,
        food.y * BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE
    );
}

// Игровой цикл
function gameLoop() {
    update();
    draw();
    if (gameActive) {
        gameLoopId = setTimeout(gameLoop, 150); // Скорость игры
    }
}

// Завершение игры
function gameOver() {
    gameActive = false;
    clearTimeout(gameLoopId);
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'block';
}

// Управление
upBtn.addEventListener('click', () => {
    if (direction !== DOWN) nextDirection = UP;
});
downBtn.addEventListener('click', () => {
    if (direction !== UP) nextDirection = DOWN;
});
leftBtn.addEventListener('click', () => {
    if (direction !== RIGHT) nextDirection = LEFT;
});
rightBtn.addEventListener('click', () => {
    if (direction !== LEFT) nextDirection = RIGHT;
});

// Рестарт
restartBtn.addEventListener('click', () => {
    initGame();
    gameLoop();
});

// Запуск игры при загрузке
window.addEventListener('load', () => {
    initGame();
    gameLoop();
});

// Обработка клавиатуры (на случай, если кто-то захочет с клавиатуры играть)
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== DOWN) nextDirection = UP;
            break;
        case 'ArrowDown':
            if (direction !== UP) nextDirection = DOWN;
            break;
        case 'ArrowLeft':
            if (direction !== RIGHT) nextDirection = LEFT;
            break;
        case 'ArrowRight':
            if (direction !== LEFT) nextDirection = RIGHT;
            break;
    }
});
