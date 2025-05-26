// UI and game logic for browser
function initSudokuGame() {
    let sudoku;
    let initialBoard;
    let size = 9;

    // Remove size selector

    function getSelectedSize() {
        return 9;
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
        size = 9;
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
}