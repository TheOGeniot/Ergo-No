// Sudoku class handles the logic and state of the Sudoku board
class Sudoku {
    constructor(board = null, size = 9) {
        this.size = size; // Board size (NxN)
        this.boxSize = Math.sqrt(size); // Box size (e.g., 3 for 9x9, 4 for 16x16)
        this.board = board ? this.copyBoard(board) : this.generateEmptyBoard();
    }

    // Create an empty board board filled with zeros
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
        if (num < 0 || num > this.size) return false;
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
                    for (let num = 1; num <= this.size; num++) {
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