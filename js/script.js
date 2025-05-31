// Utility to get display character for a given value (1-based)
function getChar(val) {
    if (val === 0) return '';
    if (val <= 9) return val.toString();
    // For 10+, use letters: 10 -> A, 11 -> B, etc.
    return String.fromCharCode('A'.charCodeAt(0) + val - 10);
}

// Utility to parse character input to value
function parseChar(char) {
    if (!char) return 0;
    if (char >= '1' && char <= '9') return parseInt(char, 10);
    let code = char.toUpperCase().charCodeAt(0);
    if (code >= 65 && code <= 90) { // 'A'-'Z'
        return code - 65 + 10;
    }
    return 0;
}

let sudoku;

// Render the board as an HTML table with text inputs
function renderBoard(highlightErrors = false) {
    let container = document.getElementById('sudoku-board');
    if (!container) {
        return;
    }
    container.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'sudoku-board-table';
    const boxSize = Math.floor(Math.sqrt(sudoku.size));
    for (let row = 0; row < sudoku.size; row++) {
        const tr = document.createElement('tr');
        for (let col = 0; col < sudoku.size; col++) {
            const td = document.createElement('td');
            td.className = 'sudoku-board-cell';
            // Add thick border classes for box separation
            if (col % boxSize === 0) td.classList.add('sudoku-box-border-left');
            if ((col + 1) % boxSize === 0) td.classList.add('sudoku-box-border-right');
            if (row % boxSize === 0) td.classList.add('sudoku-box-border-top');
            if ((row + 1) % boxSize === 0) td.classList.add('sudoku-box-border-bottom');
            let cellValue = sudoku.getCell(row, col);
            let cellChar = getChar(cellValue);
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.value = cellChar;
            input.dataset.row = row;
            input.dataset.col = col;
            input.className = 'sudoku-board-input';
            input.autocomplete = 'off';
            input.inputMode = 'text';
            input.oninput = onCellInput;
            // Highlight errors if needed
            if (
                highlightErrors &&
                input.value &&
                !sudoku.isValid(row, col, parseChar(input.value))
            ) {
                input.classList.add('sudoku-error');
            }
            td.appendChild(input);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    container.appendChild(table);

    // Remove message area if present
    let msg = document.getElementById('sudoku-message');
    if (msg && msg.parentNode) {
        msg.parentNode.removeChild(msg);
    }
}

// Handle input event for each cell
function onCellInput(e) {
    const input = e.target;
    const row = parseInt(input.dataset.row, 10);
    const col = parseInt(input.dataset.col, 10);
    let val = parseChar(input.value);
    // Only allow valid values or empty
    if (val < 0 || val > sudoku.size) {
        input.value = '';
        sudoku.setCell(row, col, 0);
        return;
    }
    // Try to set cell, if invalid, clear input
    if (val === 0 || sudoku.setCell(row, col, val)) {
        input.value = getChar(val);
    } else {
        input.value = '';
        sudoku.setCell(row, col, 0);
    }
}

// Remove all loading bar/percentage logic and UI

// Remove: showGeneratingOverlay, hideGeneratingOverlay, and all progress/percent logic

async function initSudokuGame(customSize) {
    sudoku = await generateSudokuAsync(customSize || 9, null);
    console.log('Sudoku board generated (init):', sudoku.board);
    sudoku.lastGeneratedBoard = sudoku.copyBoard(sudoku.board);
    renderBoard();
}

async function newSudoku() {
    sudoku = await generateSudokuAsync(sudoku.size, null);
    console.log('Sudoku board generated (new):', sudoku.board);
    sudoku.lastGeneratedBoard = sudoku.copyBoard(sudoku.board);
    renderBoard();
}

// Helper to generate a Sudoku puzzle asynchronously (non-blocking UI)
function generateSudokuAsync(size, progressCb) {
    return new Promise(resolve => {
        setTimeout(() => {
            const boxSize = Math.floor(Math.sqrt(size));
            // No progress logic
            const puzzle = Sudoku.generatePuzzle(size, boxSize, 5, null);
            const s = new Sudoku(size, puzzle, false);
            resolve(s);
        }, 50);
    });
}

function checkSudoku() {
    let hasEmpty = false;
    for (let row = 0; row < sudoku.size; row++) {
        for (let col = 0; col < sudoku.size; col++) {
            const val = sudoku.getCell(row, col);
            if (val === 0) {
                hasEmpty = true;
            }
        }
    }
    if (hasEmpty) {
        alert('There are missing cells.');
        renderBoard(true);
        return;
    }
    // Use solvedBoard for correctness check
    if (!sudoku.solvedBoard) {
        alert('The solution is not ready yet. Please wait and try again.');
        return;
    }
    let hasWrong = false;
    for (let row = 0; row < sudoku.size; row++) {
        for (let col = 0; col < sudoku.size; col++) {
            const val = sudoku.getCell(row, col);
            if (val !== sudoku.solvedBoard[row][col]) {
                hasWrong = true;
            }
        }
    }
    renderBoard(true);
    if (hasWrong) {
        alert('There are wrong answers.');
    } else {
        alert('Congratulations! The board is correct.');
    }
}

function resetSudoku() {
    // Only reset if lastGeneratedBoard exists and is valid
    if (sudoku.lastGeneratedBoard && Array.isArray(sudoku.lastGeneratedBoard) && sudoku.lastGeneratedBoard.length === sudoku.size) {
        sudoku = new Sudoku(sudoku.size, sudoku.copyBoard(sudoku.lastGeneratedBoard), false);
        // Do NOT update lastGeneratedBoard here!
        renderBoard();
    }
}

function solveSudoku() {
    if (sudoku.solvedBoard) {
        if (!sudoku.solvedBoard || !Array.isArray(sudoku.solvedBoard) || !sudoku.solvedBoard.every(row => row.every(cell => cell !== 0))) {
            alert('This puzzle is unsolvable.');
            return;
        }
        // Only fill the board with the solution if not already solved
        let alreadySolved = true;
        for (let row = 0; row < sudoku.size; row++) {
            for (let col = 0; col < sudoku.size; col++) {
                if (sudoku.getCell(row, col) !== sudoku.solvedBoard[row][col]) {
                    alreadySolved = false;
                    break;
                }
            }
            if (!alreadySolved) break;
        }
        if (!alreadySolved) {
            sudoku.board = sudoku.copyBoard(sudoku.solvedBoard);
            renderBoard();
        }
        // If already solved, do nothing
        return;
    }
    // If not solved yet, compute solution synchronously and render
    sudoku.solvedBoard = sudoku.getSolution();
    if (sudoku.solvedBoard && sudoku.solvedBoard.every(row => row.every(cell => cell !== 0))) {
        sudoku.board = sudoku.copyBoard(sudoku.solvedBoard);
        renderBoard();
    } else {
        alert('This puzzle is unsolvable.');
    }
}

// Attach button events after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const checkBtn = document.getElementById('check-sudoku');
    const solveBtn = document.getElementById('solve-sudoku');
    const resetBtn = document.getElementById('reset-sudoku');
    const newBtn = document.getElementById('new-sudoku');
    if (checkBtn) checkBtn.onclick = checkSudoku;
    if (solveBtn) solveBtn.onclick = solveSudoku;
    if (resetBtn) resetBtn.onclick = resetSudoku;
    if (newBtn) newBtn.onclick = newSudoku;
    // Add Show Steps button if not present
    let showStepsBtn = document.getElementById('show-steps-sudoku');
    if (!showStepsBtn) {
        showStepsBtn = document.createElement('button');
        showStepsBtn.id = 'show-steps-sudoku';
        showStepsBtn.textContent = 'Show Steps';
        const btnContainer = document.querySelector('#sudoku-board').parentNode.querySelector('div');
        if (btnContainer) btnContainer.appendChild(showStepsBtn);
    }
});

// Modular styles for sudoku board
const style = document.createElement('style');
style.textContent = `
#sudoku-board .sudoku-board-table { border-collapse: collapse; margin: 0 auto; }
#sudoku-board .sudoku-board-cell {
    border: 1px solid #888;
    width: 2em; height: 2em;
    text-align: center;
    font-size: 1.2em;
    padding: 0;
    box-sizing: border-box;
}
#sudoku-board .sudoku-box-border-left { border-left: 3px solid #222 !important; }
#sudoku-board .sudoku-box-border-right { border-right: 3px solid #222 !important; }
#sudoku-board .sudoku-box-border-top { border-top: 3px solid #222 !important; }
#sudoku-board .sudoku-box-border-bottom { border-bottom: 3px solid #222 !important; }
#sudoku-board .sudoku-board-input {
    width: 1.8em;
    height: 1.8em;
    text-align: center;
    font-size: 1.2em;
    border: none;
    outline: none;
    background: none;
}
#sudoku-board .sudoku-board-input:focus {
    background: #e0f7fa;
}
#sudoku-board .sudoku-error {
    background: #ffcdd2 !important;
}
`;
document.head.appendChild(style);