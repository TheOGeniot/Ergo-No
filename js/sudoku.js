// Sudoku class handles the logic and state of the Sudoku board
class Sudoku {
    constructor(board = null) {
        this.size = 9; // Board is 9x9
        this.boxSize = 3; // Each box is 3x3
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
        const boxRow = Math.floor(row / this.boxSize) * this.boxSize;
        const boxCol = Math.floor(col / this.boxSize) * this.boxSize;
        for (let i = 0; i < this.boxSize; i++) {
            for (let j = 0; j < this.boxSize; j++) {
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

    // Render the Sudoku board as an HTML table with input fields
    function renderBoard() {
        const boardDiv = document.getElementById('sudoku-board');
        boardDiv.innerHTML = '';
        const table = document.createElement('table');
        table.className = 'sudoku-table';
        for (let row = 0; row < 9; row++) {
            const tr = document.createElement('tr');
            for (let col = 0; col < 9; col++) {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.value = sudoku.getCell(row, col) || '';
                input.className = 'sudoku-cell';
                // Disable input for fixed (initial) cells
                if (initialBoard[row][col] !== 0) {
                    input.disabled = true;
                    input.classList.add('fixed');
                } else {
                    // Allow user to input numbers 1-9
                    input.addEventListener('input', (e) => {
                        let val = parseInt(e.target.value);
                        if (isNaN(val) || val < 1 || val > 9) {
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
        // For demo: start with a simple puzzle
        const puzzle = [
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
        return puzzle;
    }

    // Generate a random, solvable Sudoku puzzle
    function generateRandomPuzzle() {
        // Step 1: Generate a full valid board
        let board = Array.from({ length: 9 }, () => Array(9).fill(0));
        let sudoku = new Sudoku(board);
        sudoku.solve();
        let fullBoard = sudoku.copyBoard(sudoku.board);

        // Step 2: Remove numbers to create a puzzle (keep it solvable)
        // We'll remove cells one by one, checking that the puzzle still has a unique solution
        let attempts = 40; // Number of cells to try to remove (difficulty)
        while (attempts > 0) {
            let row = Math.floor(Math.random() * 9);
            let col = Math.floor(Math.random() * 9);
            if (fullBoard[row][col] === 0) continue;
            let backup = fullBoard[row][col];
            fullBoard[row][col] = 0;
            // Check if the puzzle still has a unique solution
            if (!hasUniqueSolution(fullBoard)) {
                fullBoard[row][col] = backup; // Restore if not unique
            } else {
                attempts--;
            }
        }
        return fullBoard;
    }

    // Helper: Check if a board has a unique solution
    function hasUniqueSolution(board) {
        let count = 0;
        function solveUnique(bd) {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (bd[row][col] === 0) {
                        for (let num = 1; num <= 9; num++) {
                            let sudoku = new Sudoku(bd);
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
        sudoku = new Sudoku(initialBoard);
        renderBoard();
    }

    // Initialize the game
    initialBoard = generatePuzzle();
    sudoku = new Sudoku(initialBoard);
    renderBoard();
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
        initialBoard = generateRandomPuzzle();
        sudoku = new Sudoku(initialBoard);
        renderBoard();
    };
}