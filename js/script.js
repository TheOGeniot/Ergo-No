// UI and game logic for browser
function initSudokuGame(sizes = 9) {
    // Sudoku class for handling board logic
    let sudoku;
    let initialBoard;
    let size = sizes;

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

    // Helper: Convert value to display (1-9, then A-Z)
    function valueToDisplay(val) {
        if (val === 0) return '';
        if (val <= 9) return val.toString();
        // 10 -> A, 11 -> B, ...
        return String.fromCharCode('A'.charCodeAt(0) + val - 10);
    }
    // Helper: Convert display (string) to value
    function displayToValue(str) {
        if (!str) return 0;
        if (/^[1-9]$/.test(str)) return parseInt(str);
        if (/^[A-Z]$/.test(str)) return str.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
        return 0;
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
                input.maxLength = size > 9 ? 2 : 1;
                input.value = valueToDisplay(sudoku.getCell(row, col));
                input.className = 'sudoku-cell';
                if (initialBoard[row][col] !== 0) {
                    input.disabled = true;
                    input.classList.add('fixed');
                } else {
                    input.addEventListener('input', (e) => {
                        let val = displayToValue(e.target.value.toUpperCase());
                        if (val < 1 || val > size) {
                            e.target.value = '';
                            sudoku.setCell(row, col, 0);
                        } else {
                            sudoku.setCell(row, col, val);
                            // Always display as letter/number
                            e.target.value = valueToDisplay(val);
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
        // Generate a random, solvable Sudoku puzzle for any size
        let board = Array.from({ length: size }, () => Array(size).fill(0));
        let sudokuGen = new Sudoku(board, size);
        sudokuGen.solve();
        let fullBoard = sudokuGen.copyBoard(sudokuGen.board);
        // Remove numbers to create a puzzle (difficulty: remove about half)
        let attempts = Math.floor(size * size / 2);
        while (attempts > 0) {
            let row = Math.floor(Math.random() * size);
            let col = Math.floor(Math.random() * size);
            if (fullBoard[row][col] === 0) continue;
            let backup = fullBoard[row][col];
            fullBoard[row][col] = 0;
            // Optionally, check for unique solution here for harder puzzles
            attempts--;
        }
        return fullBoard;
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