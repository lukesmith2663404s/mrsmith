const DEFAULT_TREASURE_TRACKER_SETTINGS = {
  gridSize: 5,
  allowNegativeTargets: true,
  allowFractionTargets: false,
  useStartSquare: false
};

const TREASURE_TRACKER_SETTINGS_KEY = "treasureTrackerSettings";
const OLD_NAVIGATOR_SETTINGS_KEY = "navigatorSettings";

let settings = loadSettings();
let puzzle = null;
let playerPath = [];
let currentValue = new TreasureTrackerGenerator.Fraction(0, 1);
let currentExpression = "0";
let gameComplete = false;
let correct = false;
let solutionVisible = false;

const targetDisplay = document.querySelector("#targetDisplay");
const currentValueDisplay = document.querySelector("#currentValueDisplay");
const statusDisplay = document.querySelector("#statusDisplay");
const mapBoard = document.querySelector("#mapBoard");
const playerPathLine = document.querySelector("#playerPathLine");
const solutionPathLine = document.querySelector("#solutionPathLine");
const expressionDisplay = document.querySelector("#expressionDisplay");
const resetButton = document.querySelector("#resetButton");
const newButton = document.querySelector("#newButton");
const solutionButton = document.querySelector("#solutionButton");

resetButton.addEventListener("click", () => {
  resetAttempt(true);
});

newButton.addEventListener("click", startNewPuzzle);

solutionButton.addEventListener("click", () => {
  solutionVisible = true;
  statusDisplay.textContent = "Solution path shown";
  renderBoard();
});

startNewPuzzle();

function loadSettings() {
  const savedSettings =
    localStorage.getItem(TREASURE_TRACKER_SETTINGS_KEY) ||
    localStorage.getItem(OLD_NAVIGATOR_SETTINGS_KEY);

  if (!savedSettings) {
    return DEFAULT_TREASURE_TRACKER_SETTINGS;
  }

  return {
    ...DEFAULT_TREASURE_TRACKER_SETTINGS,
    ...JSON.parse(savedSettings)
  };
}

function startNewPuzzle() {
  puzzle = TreasureTrackerGenerator.generatePuzzle(settings);
  solutionVisible = false;

  resetAttempt(false);
}

function resetAttempt(keepSolutionVisible) {
  playerPath = [];
  currentValue = new TreasureTrackerGenerator.Fraction(0, 1);
  currentExpression = "0";
  gameComplete = false;
  correct = false;

  if (!keepSolutionVisible) {
    solutionVisible = false;
  }

  if (solutionVisible) {
    statusDisplay.textContent = "Solution path shown";
  } else if (usesFixedStartSquare()) {
    statusDisplay.textContent = "Start on the marked square";
  } else {
    statusDisplay.textContent = "Start on an edge";
  }

  updateDisplays();
  renderBoard();
}

function updateDisplays() {
  targetDisplay.textContent = TreasureTrackerGenerator.formatFraction(puzzle.target);
  currentValueDisplay.textContent = TreasureTrackerGenerator.formatFraction(currentValue);
  expressionDisplay.textContent = currentExpression;
}

function renderBoard() {
  mapBoard.style.setProperty("--grid-size", puzzle.gridSize);
  mapBoard.classList.toggle("complete", gameComplete);
  mapBoard.classList.toggle("correct", correct);
  mapBoard.classList.toggle("wrong", gameComplete && !correct);

  mapBoard.querySelectorAll(".map-cell").forEach((cell) => {
    cell.remove();
  });

  for (let row = 0; row < puzzle.gridSize; row++) {
    for (let column = 0; column < puzzle.gridSize; column++) {
      const cell = puzzle.grid[row][column];
      const button = document.createElement("button");

      button.type = "button";
      button.className = "map-cell";
      button.style.gridRow = row + 1;
      button.style.gridColumn = column + 1;
      button.dataset.row = row;
      button.dataset.column = column;

      if (cell.isTarget) {
        button.classList.add("target-cell");
        addCellMainText(
          button,
          `=\u00A0${TreasureTrackerGenerator.formatFraction(puzzle.target)}`
        );
      } else {
        addCellMainText(
          button,
          TreasureTrackerGenerator.operationToCellText(cell.operation)
        );
      }

      if (isEdgeCell(row, column)) {
        button.classList.add("edge-cell");
      }

      if (usesFixedStartSquare() && isStartCell(row, column)) {
        button.classList.add("start-cell");
        addStartLabel(button);
      }

      if (pathContains(playerPath, row, column)) {
        button.classList.add("selected-cell");
      }

      if (isCurrentCell(row, column)) {
        button.classList.add("current-cell");
      }

      if (solutionVisible && pathContains(puzzle.solutionPath, row, column)) {
        button.classList.add("solution-cell");
      }

      if (gameComplete) {
        button.disabled = true;
      }

      button.addEventListener("click", () => {
        handleCellClick(row, column);
      });

      mapBoard.appendChild(button);
    }
  }

  renderLines();
}

function addCellMainText(button, text) {
  const mainText = document.createElement("span");
  mainText.className = "cell-main-text";
  mainText.textContent = text;

  button.appendChild(mainText);
}

function addStartLabel(button) {
  const startLabel = document.createElement("span");
  startLabel.className = "start-label";
  startLabel.textContent = "START";

  button.appendChild(startLabel);
}

function renderLines() {
  playerPathLine.setAttribute("points", makePolylinePoints(playerPath));

  if (solutionVisible) {
    solutionPathLine.setAttribute("points", makePolylinePoints(puzzle.solutionPath));
  } else {
    solutionPathLine.setAttribute("points", "");
  }
}

function makePolylinePoints(path) {
  return path.map((coord) => {
    const cellSize = 100 / puzzle.gridSize;
    const x = (coord.column + 0.5) * cellSize;
    const y = (coord.row + 0.5) * cellSize;

    return `${x},${y}`;
  }).join(" ");
}

function handleCellClick(row, column) {
  if (gameComplete) {
    statusDisplay.textContent = "Press Reset to try another route";
    return;
  }

  const cell = puzzle.grid[row][column];

  if (playerPath.length === 0) {
    if (usesFixedStartSquare()) {
      if (!isStartCell(row, column)) {
        statusDisplay.textContent = "You must start on the marked square";
        return;
      }

      enterCell(cell, row, column);
      return;
    }

    if (!isEdgeCell(row, column) || cell.isTarget) {
      statusDisplay.textContent = "Start on any outside edge";
      return;
    }

    enterCell(cell, row, column);
    return;
  }

  const lastCell = playerPath[playerPath.length - 1];

  if (!areAdjacent(lastCell, { row, column })) {
    statusDisplay.textContent = "Move to an adjacent square";
    return;
  }

  if (pathContains(playerPath, row, column)) {
    statusDisplay.textContent = "You cannot revisit a square";
    return;
  }

  enterCell(cell, row, column);
}

function enterCell(cell, row, column) {
  playerPath.push({ row, column });

  if (cell.isTarget) {
    finishAttempt();
    updateDisplays();
    renderBoard();
    return;
  }

  currentValue = TreasureTrackerGenerator.applyOperation(currentValue, cell.operation);
  currentExpression = `(${currentExpression} ${TreasureTrackerGenerator.operationToExpressionText(cell.operation)})`;

  statusDisplay.textContent = "Keep tracking";

  updateDisplays();
  renderBoard();
}

function finishAttempt() {
  gameComplete = true;

  if (currentValue.equals(puzzle.target)) {
    correct = true;
    currentExpression = `${currentExpression} = ${TreasureTrackerGenerator.formatFraction(puzzle.target)}`;
    statusDisplay.textContent = "Treasure found!";
    return;
  }

  correct = false;
  currentExpression = `${currentExpression} ≠ ${TreasureTrackerGenerator.formatFraction(puzzle.target)}`;
  statusDisplay.textContent = "Not quite";
}

function usesFixedStartSquare() {
  return settings.useStartSquare === true;
}

function isStartCell(row, column) {
  const startCell = puzzle.solutionPath[0];

  return startCell.row === row && startCell.column === column;
}

function isEdgeCell(row, column) {
  return (
    row === 0 ||
    row === puzzle.gridSize - 1 ||
    column === 0 ||
    column === puzzle.gridSize - 1
  );
}

function areAdjacent(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.column - b.column) === 1;
}

function pathContains(path, row, column) {
  return path.some((coord) => {
    return coord.row === row && coord.column === column;
  });
}

function isCurrentCell(row, column) {
  if (playerPath.length === 0) {
    return false;
  }

  const currentCell = playerPath[playerPath.length - 1];

  return currentCell.row === row && currentCell.column === column;
}