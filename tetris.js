// DOM Elements
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const usernameInput = document.getElementById('username');
const loginBtn = document.getElementById('login-btn');
const startBtn = document.getElementById('start-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const downBtn = document.getElementById('down-btn');
const rotateBtn = document.getElementById('rotate-btn');
const loginContainer = document.getElementById('login-container');
const gameContainer = document.getElementById('game-container');

// Sound Elements
const moveSound = new Audio('move.mp3');
const rotateSound = new Audio('rotate.mp3');
const dropSound = new Audio('drop.mp3');
const clearSound = new Audio('clear.mp3');

// Game Constants
const BLOCK_SIZE = 20;
const BOARD_WIDTH = 12;
const BOARD_HEIGHT = 20;


// Game Variables
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let currentUser = '';
let highScores = {};

const colors = [
    null,
    '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF',
    '#FF8E0D', '#FFE138', '#3877FF'
];
function resizeGame() {
    const gameArea = document.getElementById('game-area');
    const gameContainer = document.getElementById('game-container');
    const widthToHeight = BOARD_WIDTH / BOARD_HEIGHT;
    
    let newWidth = gameContainer.clientWidth;
    let newHeight = newWidth / widthToHeight;

    // Ensure the height doesn't exceed the viewport
    const maxHeight = window.innerHeight * 0.7; // Use 70% of viewport height
    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * widthToHeight;
    }

    gameArea.style.width = newWidth + 'px';
    gameArea.style.height = newHeight + 'px';
    gameArea.style.paddingBottom = '0'; // Remove padding-bottom

    canvas.width = BOARD_WIDTH * BLOCK_SIZE;
    canvas.height = BOARD_HEIGHT * BLOCK_SIZE;
    context.scale(canvas.width / BOARD_WIDTH, canvas.height / BOARD_HEIGHT);
}


// Add this line after the resizeGame function
window.addEventListener('resize', resizeGame);

document.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });

document.addEventListener('touchstart', function(e) {
    if (e.target.nodeName === 'BUTTON') {
        e.preventDefault();
    }
}, { passive: false });


const arena = createMatrix(BOARD_WIDTH, BOARD_HEIGHT);
const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0
};

// Piece Shapes
function createPiece(type) {
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

// Game Functions
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// Function to play sound
function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.error("Error playing sound:", e));
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
    playSound(rotateSound);
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
        playSound(dropSound);
    }
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    } else {
        playSound(moveSound);
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
        gameOver();
    }
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += rowCount * 10;
        rowCount *= 2;
        playSound(clearSound);
    }
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function update(time = 0) {
    const deltaTime = time - lastTime;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    lastTime = time;
    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    scoreElement.textContent = `Score: ${player.score}`;
    if (player.score > (highScores[currentUser] || 0)) {
        highScores[currentUser] = player.score;
        highScoreElement.textContent = `High Score: ${player.score}`;
        localStorage.setItem('tetrisHighScores', JSON.stringify(highScores));
    }
}

function gameOver() {
    startBtn.style.display = 'block';
}


// Call resizeGame initially after setting up the game container
function login() {
    currentUser = usernameInput.value.trim();
    if (currentUser) {
        loginContainer.style.display = 'none';
        gameContainer.style.display = 'flex';
        loadHighScore();
        updateHighScore();
        resizeGame(); // Add this line
    }
}


// Make sure this event listener is present:
loginBtn.addEventListener('click', login);

// Initialize the page
loginContainer.style.display = 'flex';
gameContainer.style.display = 'none';

function loadHighScore() {
    const savedScores = localStorage.getItem('tetrisHighScores');
    if (savedScores) {
        highScores = JSON.parse(savedScores);
    }
}

function updateHighScore() {
    const userHighScore = highScores[currentUser] || 0;
    highScoreElement.textContent = `High Score: ${userHighScore}`;
}

// Modify the startGame function to include resizeGame
function startGame() {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
    playerReset();
    resizeGame(); // Add this line
    update();
    startBtn.style.display = 'none';
}

function isGameActive() {
    return startBtn.style.display === 'none';
}

// Event Listeners
loginBtn.addEventListener('click', login);
startBtn.addEventListener('click', startGame);
leftBtn.addEventListener('click', () => playerMove(-1));
rightBtn.addEventListener('click', () => playerMove(1));
downBtn.addEventListener('click', playerDrop);
rotateBtn.addEventListener('click', () => playerRotate(1));

document.addEventListener('keydown', event => {
    if (!isGameActive()) return;
    
    switch(event.key) {
        case 'ArrowLeft':
            playerMove(-1);
            break;
        case 'ArrowRight':
            playerMove(1);
            break;
        case 'ArrowDown':
            playerDrop();
            break;
        case 'ArrowUp':
            playerRotate(1);
            break;
    }
});

// Initialize
loadHighScore();
