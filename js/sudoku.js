class Sudoku {
    constructor(board = null) {
        this.size = 9;
        this.boxSize = 3;
        this.board = board ? this.copyBoard(board) : this.generateEmptyBoard();
    }

    generateEmptyBoard() {
        return Array.from({ length: this.size }, () => Array(this.size).fill(0));
    }

    copyBoard(board) {
        return board.map(row => row.slice());
    }

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

    setCell(row, col, num) {
        if (num < 0 || num > 9) return false;
        if (num === 0 || this.isValid(row, col, num)) {
            this.board[row][col] = num;
            return true;
        }
        return false;
    }

    getCell(row, col) {
        return this.board[row][col];
    }

    isComplete() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0) return false;
            }
        }
        return true;
    }

    // Simple backtracking solver (for validation or puzzle generation)
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

    generateRandomPuzzle(clues = 30) {
        // Fill the board with a complete solution
        this.board = this.generateEmptyBoard();
        this._fillDiagonalBoxes();
        this.solve();
        // Remove cells to create a puzzle
        let cellsToRemove = this.size * this.size - clues;
        while (cellsToRemove > 0) {
            const row = Math.floor(Math.random() * this.size);
            const col = Math.floor(Math.random() * this.size);
            if (this.board[row][col] !== 0) {
                this.board[row][col] = 0;
                cellsToRemove--;
            }
        }
    }

    _fillDiagonalBoxes() {
        for (let i = 0; i < this.size; i += this.boxSize) {
            this._fillBox(i, i);
        }
    }

    _fillBox(row, col) {
        let nums = [1,2,3,4,5,6,7,8,9];
        for (let i = 0; i < this.boxSize; i++) {
            for (let j = 0; j < this.boxSize; j++) {
                const idx = Math.floor(Math.random() * nums.length);
                this.board[row + i][col + j] = nums[idx];
                nums.splice(idx, 1);
            }
        }
    }
}

// Helper to create a random puzzle (export for use in HTML)
function generateSudokuPuzzle(clues = 30) {
    const sudoku = new Sudoku();
    sudoku.generateRandomPuzzle(clues);
    return sudoku;
}