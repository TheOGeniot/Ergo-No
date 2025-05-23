// Sudoku class handles the logic and state of the Sudoku board
class Sudoku {
    constructor(board = null, size = 9) {
        this.size = size; // Board is size x size
        // Calculate box size (try to make square boxes if possible)
        this.boxSize = Math.floor(Math.sqrt(this.size));
        // For non-square box sizes (e.g., 6x6), find factors
        if (this.boxSize * this.boxSize !== this.size) {
            // Find two factors as close as possible
            let factors = [];
            for (let i = 2; i <= Math.sqrt(this.size); i++) {
                if (this.size % i === 0) factors.push([i, this.size / i]);
            }
            if (factors.length > 0) {
                // Pick the pair with minimal difference
                let [r, c] = factors.reduce((a, b) => Math.abs(a[0] - a[1]) < Math.abs(b[0] - b[1]) ? a : b);
                this.boxRows = r;
                this.boxCols = c;
            } else {
                this.boxRows = this.boxCols = this.boxSize;
            }
        } else {
            this.boxRows = this.boxCols = this.boxSize;
        }
        this.board = board ? this.copyBoard(board) : this.generateEmptyBoard();
    }

    // Create an empty 9x9 board filled with zeros
    generateEmptyBoard() {
        return Array.from({ length: this.size }, () => Array(this.size).fill(0));
    }

    // Deep copy a board
    copyBoard(board) {
        return board.map(row => row.slice());
    }

    // Check if placing 'num' at (row, col) is valid
    isValid(row, col, num) {
        for (let i = 0; i < this.size; i++) {
            if (this.board[row][i] === num || this.board[i][col] === num) {
                return false;
            }
        }
        const boxRow = Math.floor(row / this.boxRows) * this.boxRows;
        const boxCol = Math.floor(col / this.boxCols) * this.boxCols;
        for (let i = 0; i < this.boxRows; i++) {
            for (let j = 0; j < this.boxCols; j++) {
                if (this.board[boxRow + i][boxCol + j] === num) {
                    return false;
                }
            }
        }
        return true;
    }

    // Set a cell to a number if valid (or clear if 0)
    setCell(row, col, num) {
        if (num < 0 || num > 9) return false;
        if (num === 0 || this.isValid(row, col, num)) {
            this.board[row][col] = num;
            return true;
        }
        return false;
    }

    // Get the value at a cell
    getCell(row, col) {
        return this.board[row][col];
    }

    // Check if the board is completely filled (no zeros)
    isComplete() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0) return false;
            }
        }
        return true;
    }

    // Solve the board using backtracking (modifies board in place)
    solve() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.isValid(row, col, num)) {
                            this.board[row][col] = num;
                            if (this.solve()) return true;
                            this.board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
}

// UI and game logic for browser
function initSudokuGame() {
    let sudoku;
    let initialBoard;
    let size = 9;

    // Add size selector if not present
    if (!document.getElementById('sudoku-size')) {
        const controls = document.getElementById('sudoku-controls') || document.body;
        const sizeLabel = document.createElement('label');
        sizeLabel.textContent = 'Size: ';
        sizeLabel.htmlFor = 'sudoku-size';
        const sizeSelect = document.createElement('select');
        sizeSelect.id = 'sudoku-size';
        [4, 6, 9, 12, 16].forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = `${s} x ${s}`;
            if (s === 9) opt.selected = true;
            sizeSelect.appendChild(opt);
        });
        sizeLabel.appendChild(sizeSelect);
        controls.insertBefore(sizeLabel, controls.firstChild);
    }

    function getSelectedSize() {
        const sel = document.getElementById('sudoku-size');
        return sel ? parseInt(sel.value) : 9;
    }

    // Render the Sudoku board as an HTML table with input fields
    function renderBoard() {
        const boardDiv = document.getElementById('sudoku-board');
        boardDiv.innerHTML = '';
        const table = document.createElement('table');
        table.className = 'sudoku-table';
        for (let row = 0; row < size; row++) {
            const tr = document.createElement('tr');
            for (let col = 0; col < size; col++) {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 2;
                input.value = sudoku.getCell(row, col) || '';
                input.className = 'sudoku-cell';
                if (initialBoard[row][col] !== 0) {
                    input.disabled = true;
                    input.classList.add('fixed');
                } else {
                    input.addEventListener('input', (e) => {
                        let val = parseInt(e.target.value);
                        if (isNaN(val) || val < 1 || val > size) {
                            e.target.value = '';
                            sudoku.setCell(row, col, 0);
                        } else {
                            sudoku.setCell(row, col, val);
                        }
                    });
                }
                td.appendChild(input);
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        boardDiv.appendChild(table);
    }

    // Return a sample puzzle (0 = empty cell)
    function generatePuzzle() {
        // For demo: only 9x9 has a real puzzle, others are empty
        if (size === 9) {
            return [
                [5,3,0,0,7,0,0,0,0],
                [6,0,0,1,9,5,0,0,0],
                [0,9,8,0,0,0,0,6,0],
                [8,0,0,0,6,0,0,0,3],
                [4,0,0,8,0,3,0,0,1],
                [7,0,0,0,2,0,0,0,6],
                [0,6,0,0,0,0,2,8,0],
                [0,0,0,4,1,9,0,0,5],
                [0,0,0,0,8,0,0,7,9]
            ];
        } else {
            return Array.from({ length: size }, () => Array(size).fill(0));
        }
    }

    // Generate a random, solvable Sudoku puzzle
    function generateRandomPuzzle() {
        // For demo: only 9x9 random puzzle, others are empty
        if (size === 9) {
            let board = Array.from({ length: 9 }, () => Array(9).fill(0));
            let sudoku = new Sudoku(board, 9);
            sudoku.solve();
            let fullBoard = sudoku.copyBoard(sudoku.board);
            let attempts = 40;
            while (attempts > 0) {
                let row = Math.floor(Math.random() * 9);
                let col = Math.floor(Math.random() * 9);
                if (fullBoard[row][col] === 0) continue;
                let backup = fullBoard[row][col];
                fullBoard[row][col] = 0;
                if (!hasUniqueSolution(fullBoard)) {
                    fullBoard[row][col] = backup;
                } else {
                    attempts--;
                }
            }
            return fullBoard;
        } else {
            return Array.from({ length: size }, () => Array(size).fill(0));
        }
    }

    // Helper: Check if a board has a unique solution
    function hasUniqueSolution(board) {
        let count = 0;
        function solveUnique(bd) {
            for (let row = 0; row < size; row++) {
                for (let col = 0; col < size; col++) {
                    if (bd[row][col] === 0) {
                        for (let num = 1; num <= size; num++) {
                            let sudoku = new Sudoku(bd, size);
                            if (sudoku.isValid(row, col, num)) {
                                bd[row][col] = num;
                                solveUnique(bd);
                                bd[row][col] = 0;
                            }
                        }
                        return;
                    }
                }
            }
            count++;
        }
        let bdCopy = board.map(row => row.slice());
        solveUnique(bdCopy);
        return count === 1;
    }

    // Reset the board to the initial puzzle
    function resetBoard() {
        sudoku = new Sudoku(initialBoard, size);
        renderBoard();
    }

    // Initialize the game
    function startGame() {
        size = getSelectedSize();
        initialBoard = generatePuzzle();
        sudoku = new Sudoku(initialBoard, size);
        renderBoard();
    }
    startGame();

    // Button: Check if the board is solved
    document.getElementById('check-sudoku').onclick = () => {
        if (sudoku.isComplete() && sudoku.solve()) {
            alert('Congratulations! Sudoku is solved!');
        } else {
            alert('There are mistakes or the puzzle is incomplete.');
        }
    };
    // Button: Solve the puzzle
    document.getElementById('solve-sudoku').onclick = () => {
        sudoku.solve();
        renderBoard();
    };
    // Button: Reset the board
    document.getElementById('reset-sudoku').onclick = resetBoard;
    // Button: New Game (generate a random puzzle)
    document.getElementById('new-sudoku').onclick = () => {
        size = getSelectedSize();
        initialBoard = generateRandomPuzzle();
        sudoku = new Sudoku(initialBoard, size);
        renderBoard();
    };
    // Size selector: change board size
    document.getElementById('sudoku-size').onchange = () => {
        size = getSelectedSize();
        startGame();
    };
}