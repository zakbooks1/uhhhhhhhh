const canvas = document.getElementById('worldCanvas');
const ctx = canvas.getContext('2d');

const CELL_SIZE = 10;
const COLS = canvas.width / CELL_SIZE;
const ROWS = canvas.height / CELL_SIZE;

// Grid representation: 0 = Empty, 1 = Food, 2 = Fire
let grid = makeGrid();

// Entities (Humans) roaming the world
let humans = [];
let currentTool = 'human';

function makeGrid() {
    let arr = new Array(COLS).fill(0).map(() => new Array(ROWS).fill(0));
    return arr;
}

class Human {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.energy = 100;
    }

    update() {
        // Random movement simulation
        let choices = [
            {x: 0, y: -1}, {x: 0, y: 1}, 
            {x: -1, y: 0}, {x: 1, y: 0}
        ];
        let move = choices[Math.floor(Math.random() * choices.length)];
        
        let newX = (this.x + move.x + COLS) % COLS;
        let newY = (this.y + move.y + ROWS) % ROWS;

        // Check environment hazards or resources
        if (grid[newX][newY] === 2) {
            // Hit fire, lose energy
            this.energy -= 25;
        } else if (grid[newX][newY] === 1) {
            // Eat food, regain energy
            this.energy = Math.min(100, this.energy + 30);
            grid[newX][newY] = 0; // Consume food
        }

        this.x = newX;
        this.y = newY;
        this.energy -= 0.5; // Natural decay
    }
}

// Handle User Inputs on Canvas Click
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    if (currentTool === 'human') {
        humans.push(new Human(x, y));
    } else if (currentTool === 'food') {
        grid[x][y] = 1;
    } else if (currentTool === 'fire') {
        grid[x][y] = 2;
    }
});

function setTool(tool) {
    currentTool = tool;
}

function clearWorld() {
    grid = makeGrid();
    humans = [];
}

// Main Simulation Loop
function update() {
    // Update humans
    for (let i = humans.length - 1; i >= 0; i--) {
        humans[i].update();
        if (humans[i].energy <= 0) {
            humans.splice(i, 1); // Remove dead humans
        }
    }

    // Randomly spawn natural food occasionally
    if (Math.random() < 0.1) {
        let fx = Math.floor(Math.random() * COLS);
        let fy = Math.floor(Math.random() * ROWS);
        if (grid[fx][fy] === 0) grid[fx][fy] = 1;
    }
}

function draw() {
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid elements (Food / Fire)
    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
            if (grid[x][y] === 1) {
                ctx.fillStyle = '#4CAF50'; // Food = Green
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            } else if (grid[x][y] === 2) {
                ctx.fillStyle = '#FF5722'; // Fire = Orange/Red
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }

    // Draw Humans
    ctx.fillStyle = '#2196F3'; // Humans = Blue
    for (let h of humans) {
        ctx.fillRect(h.x * CELL_SIZE, h.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
}

function loop() {
    update();
    draw();
}

// Run simulation at 10 ticks per second
setInterval(loop, 100);
