const DEFAULT_SETTINGS = {
  difficulty: "medium",
  maxTarget: 999,
  allowMultiplyDivide: true,
  liveEvaluation: false
};

const BUTTON_LAYOUT = [
  "7", "8", "9", "÷",
  "4", "5", "6", "×",
  "1", "2", "3", "-",
  "0", "C", "=", "+"
];

const PLAYABLE_BUTTONS = new Set([
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
  "+", "-", "×", "÷"
]);

const GHOST_IMAGE_FOLDER = "../../assets/images/ghosts";
const EASTER_EGG_CHANCE = 1 / 30;

const GHOST_IMAGE_FILES = {
  "0": "g0.png",
  "1": "g1.png",
  "2": "g2.png",
  "3": "g3.png",
  "4": "g4.png",
  "5": "g5.png",
  "6": "g6.png",
  "7": "g7.png",
  "8": "g8.png",
  "9": "g9.png",
  "+": "gplus.png",
  "-": "gminus.png",
  "×": "gtimes.png",
  "÷": "gdivide.png"
};

const EASTER_EGG_GHOSTS = [
  "napstablook.png",
  "gengar.png",
  "boo.png"
];

let settings = loadSettings();
let puzzle = null;
let expression = "";
let buttonUsesRemaining = {};
let solved = false;
let easterEggGhost = null;

const targetDisplay = document.querySelector("#targetDisplay");
const calculatorScreen = document.querySelector("#calculatorScreen");
const calculatorDisplay = document.querySelector("#calculatorDisplay");
const evaluationDisplay = document.querySelector("#evaluationDisplay");
const calculatorButtons = document.querySelector("#calculatorButtons");
const newButton = document.querySelector("#newButton");
const solutionButton = document.querySelector("#solutionButton");
const solutionModal = document.querySelector("#solutionModal");
const closeSolutionsButton = document.querySelector("#closeSolutionsButton");
const solutionsList = document.querySelector("#solutionsList");
const solutionSummary = document.querySelector("#solutionSummary");

newButton.addEventListener("click", startNewPuzzle);
solutionButton.addEventListener("click", showSolutionsModal);
closeSolutionsButton.addEventListener("click", closeSolutionsModal);

solutionModal.addEventListener("click", (event) => {
  if (event.target.dataset.closeModal !== undefined) {
    closeSolutionsModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSolutionsModal();
  }
});

startNewPuzzle();

function loadSettings() {
  const savedSettings = localStorage.getItem("hauntedCalculatorSettings");

  if (!savedSettings) {
    return DEFAULT_SETTINGS;
  }

  return {
    ...DEFAULT_SETTINGS,
    ...JSON.parse(savedSettings)
  };
}

function startNewPuzzle() {
  puzzle = HauntedGenerator.generatePuzzle(settings);
  expression = "";
  buttonUsesRemaining = { ...puzzle.buttonLimits };
  solved = false;
  easterEggGhost = chooseEasterEggGhostForPuzzle();

  document.body.classList.remove("win-glow");

  solutionButton.disabled = false;

  calculatorScreen.classList.remove("won", "wrong", "solution-shown");

  closeSolutionsModal();
  renderPuzzle();
}

function chooseEasterEggGhostForPuzzle() {
  if (Math.random() >= EASTER_EGG_CHANCE) {
    return null;
  }

  const ghostableMissingButtons = puzzle.missingButtons.filter((buttonValue) => {
    return GHOST_IMAGE_FILES[buttonValue] !== undefined;
  });

  if (ghostableMissingButtons.length === 0) {
    return null;
  }

  return {
    buttonValue: getRandomItem(ghostableMissingButtons),
    fileName: getRandomItem(EASTER_EGG_GHOSTS)
  };
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function renderPuzzle() {
  targetDisplay.textContent = puzzle.target;
  updateCalculatorScreen(false);
  renderCalculatorButtons();
}

function updateCalculatorScreen(revealEvaluation = false) {
  calculatorDisplay.textContent = expression || "0";

  const shouldShowEvaluation = settings.liveEvaluation || revealEvaluation;

  evaluationDisplay.textContent = "";
  evaluationDisplay.classList.remove(
    "evaluation-valid",
    "evaluation-invalid",
    "evaluation-correct"
  );

  if (!expression) {
    return;
  }

  if (!shouldShowEvaluation) {
    return;
  }

  const result = HauntedGenerator.evaluateExpression(expression);

  if (result === null) {
    evaluationDisplay.textContent = "Invalid";
    evaluationDisplay.classList.add("evaluation-invalid");
    return;
  }

  const displayedResult = Number.isInteger(result)
    ? result
    : Number(result.toFixed(4));

  evaluationDisplay.textContent = displayedResult;

  if (result === puzzle.target) {
    evaluationDisplay.classList.add("evaluation-correct");
  } else {
    evaluationDisplay.classList.add("evaluation-valid");
  }
}

function renderCalculatorButtons() {
  calculatorButtons.innerHTML = "";

  BUTTON_LAYOUT.forEach((buttonValue) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calc-button";
    button.dataset.value = buttonValue;

    const isPlayableButton = PLAYABLE_BUTTONS.has(buttonValue);
    const isMissing = isPlayableButton && puzzle.buttonLimits[buttonValue] === undefined;
    const usesLeft = buttonUsesRemaining[buttonValue];
    const isUsedUp = isPlayableButton && usesLeft === 0;
    const shouldShowGhost = !solved && (isMissing || isUsedUp);

    const label = document.createElement("span");
    label.textContent = buttonValue;
    button.appendChild(label);

    if (shouldShowGhost) {
      button.appendChild(createGhostImage(buttonValue));
      button.classList.add("ghosted");
    }

    if (isPlayableButton && !isMissing) {
      const counter = document.createElement("small");
      counter.textContent = usesLeft;
      button.appendChild(counter);
    }

    if (isMissing) {
      button.disabled = true;
      button.classList.add("missing");
    }

    if (isUsedUp) {
      button.disabled = true;
      button.classList.add("used-up");
    }

    if (solved) {
      button.disabled = true;
      button.classList.add("solved-disabled");
    }

    button.addEventListener("click", () => handleCalculatorButton(buttonValue));

    calculatorButtons.appendChild(button);
  });
}

function createGhostImage(buttonValue) {
  const image = document.createElement("img");
  image.className = "ghost-image";
  image.src = getGhostImagePath(buttonValue);
  image.alt = "";
  image.setAttribute("aria-hidden", "true");

  return image;
}

function getGhostImagePath(buttonValue) {
  let fileName = GHOST_IMAGE_FILES[buttonValue];

  if (easterEggGhost !== null && easterEggGhost.buttonValue === buttonValue) {
    fileName = easterEggGhost.fileName;
  }

  return `${GHOST_IMAGE_FOLDER}/${fileName}`;
}

function handleCalculatorButton(value) {
  if (solved) {
    return;
  }

  if (value === "C") {
    clearAttempt();
    return;
  }

  if (value === "=") {
    submitExpression();
    return;
  }

  if (buttonUsesRemaining[value] === undefined) {
    return;
  }

  if (buttonUsesRemaining[value] <= 0) {
    return;
  }

  calculatorScreen.classList.remove("wrong", "solution-shown");

  buttonUsesRemaining[value]--;
  expression += value;

  updateCalculatorScreen(false);
  renderCalculatorButtons();
}

function clearAttempt() {
  expression = "";
  buttonUsesRemaining = { ...puzzle.buttonLimits };

  calculatorScreen.classList.remove("wrong", "solution-shown");

  updateCalculatorScreen(false);
  renderCalculatorButtons();
}

function submitExpression() {
  if (solved || !expression) {
    return;
  }

  updateCalculatorScreen(true);

  const result = HauntedGenerator.evaluateExpression(expression);

  if (result === null) {
    calculatorScreen.classList.add("wrong");
    return;
  }

  if (result === puzzle.target) {
    solved = true;

    document.body.classList.add("win-glow");

    calculatorScreen.classList.remove("wrong", "solution-shown");
    calculatorScreen.classList.add("won");

    renderCalculatorButtons();
    return;
  }

  calculatorScreen.classList.remove("won", "solution-shown");
  calculatorScreen.classList.add("wrong");
  evaluationDisplay.classList.add("evaluation-invalid");
}

function showSolutionsModal() {
  solutionsList.innerHTML = "";

  const solutions = puzzle.solutions || [puzzle.solution];

  solutionSummary.textContent = `${solutions.length} unique solution${solutions.length === 1 ? "" : "s"} for target ${puzzle.target}.`;

  solutions.forEach((solution) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${formatExpression(solution)} = ${puzzle.target}`;
    solutionsList.appendChild(listItem);
  });

  solutionModal.classList.remove("hidden");
}

function closeSolutionsModal() {
  solutionModal.classList.add("hidden");
}

function formatExpression(expressionToFormat) {
  return expressionToFormat.replace(/([+\-×÷])/g, " $1 ");
}