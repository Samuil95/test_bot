// ============== КОНСТАНТЫ И ПЕРЕМЕННЫЕ ==============
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const FPS = 10;

// Направления
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// Элементы DOM
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

// Игровые переменные
let snake = [];
let food = {};
let direction = DIRECTIONS.RIGHT;
let nextDirection = DIRECTIONS.RIGHT;
let score = 0;
let gameActive = false;
let lastRenderTime = 0;
let gameSpeed = FPS;

// ============== ФУНКЦИИ ИНИЦИАЛИЗАЦИИ ==============
function initGame() {
    // Установка размеров canvas
    canvas.width = GRID_SIZE * CELL_SIZE;
    canvas.height = GRID_SIZE * CELL_SIZE;
    
    // Инициализация змейки
    const startX = Math.floor(GRID_SIZE / 2);
    const startY = Math.floor(GRID_SIZE / 2);
    snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
    ];
    
    // Генерация еды
    generateFood();
    
    // Сброс направления и счета
    direction = DIRECTIONS.RIGHT;
    nextDirection = DIRECTIONS.RIGHT;
    score = 0;
    scoreDisplay.textContent = `Счет: ${score}`;
    
    // Скрыть экран завершения игры
    gameOverScreen.style.display = 'none';
    
    // Активация игры
    gameActive = true;
    
    // Запуск игрового цикла
    requestAnimationFrame(mainLoop);
}

function generateFood() {
    // Создаем массив всех занятых позиций
    const occupiedPositions = new Set(snake.map(segment => `${segment.x},${segment.y}`));
    
    // Список свободных позиций
    const freePositions = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (!occupiedPositions.has(`${x},${y}`)) {
                freePositions.push({x, y});
            }
        }
    }
    
    // Если есть свободные позиции - выбираем случайную
    if (freePositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * freePositions.length);
        food = freePositions[randomIndex];
    } else {
        // Если свободных позиций нет (змея заполнила всё поле)
        food = {x: -1, y: -1}; // Невидимая еда
    }
}

// ============== ОСНОВНЫЕ ФУНКЦИИ ИГРЫ ==============
function update() {
    if (!gameActive) return;
    
    // Обновление направления
    direction = nextDirection;
    
    // Перемещение головы змейки
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    
    // Проверка столкновения со стенами
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        endGame();
        return;
    }
    
    // Проверка столкновения с собой
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            endGame();
            return;
        }
    }
    
    // Добавление новой головы
    snake.unshift(head);
    
    // Проверка съедания еды
    if (head.x === food.x && head.y === food.y) {
        // Увеличение счета
        score++;
        scoreDisplay.textContent = `Счет: ${score}`;
        
        // Увеличение скорости каждые 5 очков
        if (score % 5 === 0 && gameSpeed > 5) {
            gameSpeed--;
        }
        
        // Генерация новой еды
        generateFood();
    } else {
        // Удаление хвоста, если еда не съедена
        snake.pop();
    }
}

function draw() {
    // Очистка холста
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Отрисовка сетки
    ctx.strokeStyle = '#16213e';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= GRID_SIZE; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL_SIZE, 0);
        ctx.lineTo(x * CELL_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= GRID_SIZE; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL_SIZE);
        ctx.lineTo(canvas.width, y * CELL_SIZE);
        ctx.stroke();
    }
    
    // Отрисовка змейки
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Голова
            ctx.fillStyle = '#27ae60';
            ctx.beginPath();
            ctx.arc(
                segment.x * CELL_SIZE + CELL_SIZE / 2,
                segment.y * CELL_SIZE + CELL_SIZE / 2,
                CELL_SIZE / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Глаза
            ctx.fillStyle = '#000';
            const eyeSize = CELL_SIZE / 8;
            const offset = CELL_SIZE / 3;
            
            // Правый глаз
            ctx.beginPath();
            ctx.arc(
                segment.x * CELL_SIZE + CELL_SIZE / 2 + (direction.x * offset),
                segment.y * CELL_SIZE + CELL_SIZE / 2 + (direction.y * offset),
                eyeSize,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Левый глаз
            ctx.beginPath();
            ctx.arc(
                segment.x * CELL_SIZE + CELL_SIZE / 2 + (direction.y * offset),
                segment.y * CELL_SIZE + CELL_SIZE / 2 - (direction.x * offset),
                eyeSize,
                0,
                Math.PI * 2
            );
            ctx.fill();
        } else {
            // Тело
            const colorValue = 150 - Math.min(140, index * 2);
            ctx.fillStyle = `rgb(39, 174, 96, ${0.7 - index * 0.02})`;
            ctx.fillRect(
                segment.x * CELL_SIZE,
                segment.y * CELL_SIZE,
                CELL_SIZE,
                CELL_SIZE
            );
            
            // Обводка для сегментов
            ctx.strokeStyle = '#1e8449';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                segment.x * CELL_SIZE,
                segment.y * CELL_SIZE,
                CELL_SIZE,
                CELL_SIZE
            );
        }
    });
    
    // Отрисовка еды
    if (food.x >= 0 && food.y >= 0) {
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(
            food.x * CELL_SIZE + CELL_SIZE / 2,
            food.y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Детали для еды
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.moveTo(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + 5);
        ctx.lineTo(food.x * CELL_SIZE + CELL_SIZE / 2 - 3, food.y * CELL_SIZE + CELL_SIZE / 2);
        ctx.lineTo(food.x * CELL_SIZE + CELL_SIZE / 2 + 3, food.y * CELL_SIZE + CELL_SIZE / 2);
        ctx.closePath();
        ctx.fill();
    }
}

// ============== ИГРОВОЙ ЦИКЛ ==============
function mainLoop(currentTime) {
    if (!gameActive) return;
    
    // Контроль FPS
    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if (secondsSinceLastRender < 1 / gameSpeed) {
        requestAnimationFrame(mainLoop);
        return;
    }
    lastRenderTime = currentTime;
    
    // Обновление и отрисовка игры
    update();
    draw();
    
    // Продолжение цикла
    requestAnimationFrame(mainLoop);
}

// ============== УПРАВЛЕНИЕ ==============
function changeDirection(newDirection) {
    // Запрет разворота на 180 градусов
    if (
        (direction === DIRECTIONS.UP && newDirection === DIRECTIONS.DOWN) ||
        (direction === DIRECTIONS.DOWN && newDirection === DIRECTIONS.UP) ||
        (direction === DIRECTIONS.LEFT && newDirection === DIRECTIONS.RIGHT) ||
        (direction === DIRECTIONS.RIGHT && newDirection === DIRECTIONS.LEFT)
    ) {
        return;
    }
    nextDirection = newDirection;
}

// Назначение обработчиков кнопок
upBtn.addEventListener('click', () => changeDirection(DIRECTIONS.UP));
downBtn.addEventListener('click', () => changeDirection(DIRECTIONS.DOWN));
leftBtn.addEventListener('click', () => changeDirection(DIRECTIONS.LEFT));
rightBtn.addEventListener('click', () => changeDirection(DIRECTIONS.RIGHT));

// Обработка клавиатуры
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': changeDirection(DIRECTIONS.UP); break;
        case 'ArrowDown': changeDirection(DIRECTIONS.DOWN); break;
        case 'ArrowLeft': changeDirection(DIRECTIONS.LEFT); break;
        case 'ArrowRight': changeDirection(DIRECTIONS.RIGHT); break;
    }
});

// ============== ЗАВЕРШЕНИЕ И ПЕРЕЗАПУСК ==============
function endGame() {
    gameActive = false;
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'block';
}

restartBtn.addEventListener('click', () => {
    gameSpeed = FPS;
    initGame();
});

// ============== ЗАПУСК ИГРЫ ==============
window.addEventListener('load', initGame);
