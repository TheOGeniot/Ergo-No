class Sudoku {
    constructor(size = 9, board = null, generate = false, skipSolution = false) {
        this.size = size;
        this.boxSize = Math.floor(Math.sqrt(size));
        if (board) {
            this.board = this.copyBoard(board);
        } else if (generate) {
            this.board = Sudoku.generatePuzzle(this.size, this.boxSize);
        } else {
            this.board = this.generateEmptyBoard();
        }
        this.solvedBoard = skipSolution ? undefined : this.getSolution(true);
        this.lastGeneratedBoard = null;
        console.log(`Sudoku created: size=${this.size}, generate=${generate}, skipSolution=${skipSolution}`);
    }

    // Create an empty board filled with zeros
    generateEmptyBoard() {
        return Array.from({ length: this.size }, () => Array(this.size).fill(0));
    }

    // Deep copy a board (2D array)
    copyBoard(board) {
        return board.map(row => Array.isArray(row) ? row.slice() : row);
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

    // Get possible values for a cell based on current board state
    getPossibleValues(row, col) {
        if (this.board[row][col] !== 0) return [];
        const used = new Set();
        for (let i = 0; i < this.size; i++) {
            used.add(this.board[row][i]);
            used.add(this.board[i][col]);
        }
        const boxRow = Math.floor(row / this.boxSize) * this.boxSize;
        const boxCol = Math.floor(col / this.boxSize) * this.boxSize;
        for (let i = 0; i < this.boxSize; i++) {
            for (let j = 0; j < this.boxSize; j++) {
                used.add(this.board[boxRow + i][boxCol + j]);
            }
        }
        const possible = [];
        for (let n = 1; n <= this.size; n++) {
            if (!used.has(n)) possible.push(n);
        }
        return possible;
    }

    // Solve the board using backtracking with MRV heuristic (modifies board in place)
    solve() {
        // Find the cell with the fewest possible values (MRV)
        let minOptions = this.size + 1;
        let minCell = null;
        let options = null;
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0) {
                    let possible = this.getPossibleValues(row, col);
                    if (possible.length < minOptions) {
                        minOptions = possible.length;
                        minCell = { row, col };
                        options = possible;
                        if (minOptions === 1) break;
                    }
                }
            }
            if (minOptions === 1) break;
        }
        if (!minCell) return true;
        for (let num of options) {
            if (this.isValid(minCell.row, minCell.col, num)) {
                this.board[minCell.row][minCell.col] = num;
                if (this.solve()) return true;
                this.board[minCell.row][minCell.col] = 0;
            }
        }
        return false;
    }

    // Return a deep copy of the solution for the current board (does not modify this.board)
    // Pass skipSolution=true to avoid infinite recursion
    getSolution(skipSolution = false) {
        const boardCopy = this.copyBoard(this.board);
        // Pass skipSolution=true to prevent recursive solvedBoard computation
        const solver = new Sudoku(this.size, boardCopy, false, true);
        if (solver.solve()) {
            return solver.copyBoard(solver.board);
        }
        return undefined;
    }

    // Count the number of solutions for a board (returns >1 if not unique)
    static countSolutions(board, size, boxSize, maxSolutions = 2) {
        let count = 0;
        const trySolve = (b) => {
            for (let row = 0; row < size; row++) {
                for (let col = 0; col < size; col++) {
                    if (b[row][col] === 0) {
                        // MRV heuristic
                        let possible = [];
                        const used = new Set();
                        for (let i = 0; i < size; i++) {
                            used.add(b[row][i]);
                            used.add(b[i][col]);
                        }
                        const boxRow = Math.floor(row / boxSize) * boxSize;
                        const boxCol = Math.floor(col / boxSize) * boxSize;
                        for (let i = 0; i < boxSize; i++) {
                            for (let j = 0; j < boxSize; j++) {
                                used.add(b[boxRow + i][boxCol + j]);
                            }
                        }
                        for (let n = 1; n <= size; n++) {
                            if (!used.has(n)) possible.push(n);
                        }
                        for (let num of possible) {
                            if (Sudoku._isValidForBoardStatic(b, row, col, num, size, boxSize)) {
                                b[row][col] = num;
                                if (trySolve(b)) return true;
                                b[row][col] = 0;
                            }
                        }
                        return false;
                    }
                }
            }
            count++;
            return count >= maxSolutions;
        };
        trySolve(board.map(row => row.slice()));
        return count;
    }

    // Generate a fully solved board using backtracking + MRV
    static generateSolvedBoard(size, boxSize) {
        const board = Array.from({ length: size }, () => Array(size).fill(0));
        function fill() {
            // Find the cell with the fewest possible values (MRV)
            let minOptions = size + 1;
            let minCell = null;
            let options = null;
            for (let row = 0; row < size; row++) {
                for (let col = 0; col < size; col++) {
                    if (board[row][col] === 0) {
                        // Get possible values for this cell
                        const used = new Set();
                        for (let i = 0; i < size; i++) {
                            used.add(board[row][i]);
                            used.add(board[i][col]);
                        }
                        const boxRow = Math.floor(row / boxSize) * boxSize;
                        const boxCol = Math.floor(col / boxSize) * boxSize;
                        for (let i = 0; i < boxSize; i++) {
                            for (let j = 0; j < boxSize; j++) {
                                used.add(board[boxRow + i][boxCol + j]);
                            }
                        }
                        const possible = [];
                        for (let n = 1; n <= size; n++) {
                            if (!used.has(n)) possible.push(n);
                        }
                        if (possible.length < minOptions) {
                            minOptions = possible.length;
                            minCell = { row, col };
                            options = possible;
                            if (minOptions === 1) break;
                        }
                    }
                }
                if (minOptions === 1) break;
            }
            if (!minCell) return true;
            // Shuffle options for randomness
            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]];
            }
            for (let num of options) {
                board[minCell.row][minCell.col] = num;
                if (fill()) return true;
                board[minCell.row][minCell.col] = 0;
            }
            return false;
        }
        fill();
        return board;
    }

    // Generate a Sudoku puzzle by removing cells from a solved board, ensuring unique solution
    // Accepts a progress callback: (checked, total) => void
    static generatePuzzle(size, boxSize, maxTries = 5, progressCb) {
        let tries = 0;
        while (tries < maxTries) {
            tries++;
            let board = Sudoku.generateSolvedBoard(size, boxSize);

            let cells = [];
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    cells.push([r, c]);
                }
            }
            for (let i = cells.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cells[i], cells[j]] = [cells[j], cells[i]];
            }

            let puzzle = board.map(row => row.slice());
            let checked = 0;
            let total = cells.length;
            for (let i = 0; i < cells.length; i++) {
                const [r, c] = cells[i];
                const backup = puzzle[r][c];
                puzzle[r][c] = 0;
                // Check for unique solution
                const solutionCount = Sudoku.countSolutions(puzzle, size, boxSize, 2);
                checked++;
                console.log(`Checked cell [${r},${c}] (${checked}/${total})`);
                if (progressCb) progressCb(checked, total);
                if (solutionCount !== 1) {
                    puzzle[r][c] = backup; // revert if not unique
                    console.log(`Rollback: cell [${r},${c}] restored to ${backup} (not unique)`);
                }
            }
            let clueCount = puzzle.flat().filter(x => x !== 0).length;
            console.log(`Puzzle generation attempt ${tries}: clues left = ${clueCount}`);
            if (clueCount > 0) {
                return puzzle;
            }
        }
        console.log('Puzzle generation fallback: returning solved board');
        return Sudoku.generateSolvedBoard(size, boxSize);
    }

    // Static: Check if placing a number is valid for an arbitrary board
    static _isValidForBoardStatic(board, row, col, num, size, boxSize) {
        for (let i = 0; i < size; i++) {
            if (board[row][i] === num || board[i][col] === num) return false;
        }
        const boxRow = Math.floor(row / boxSize) * boxSize;
        const boxCol = Math.floor(col / boxSize) * boxSize;
        for (let i = 0; i < boxSize; i++) {
            for (let j = 0; j < boxSize; j++) {
                if (board[boxRow + i][boxCol + j] === num) return false;
            }
        }
        return true;
    }
}
