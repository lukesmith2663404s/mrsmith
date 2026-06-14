const PAIRS_SETTINGS_KEY = "pairsGameSettings";
const PAIRS_SETTINGS_VERSION = 2;

const CARD_ASPECT_RATIO = 5 / 7;
const MAXIMUM_CARD_WIDTH = 220;

const DEFAULT_PAIRS_SETTINGS = {
  settingsVersion: PAIRS_SETTINGS_VERSION,
  pairCount: 8,
  mode: "equivalent-fractions",
  difficulty: "easy",
  playerCount: 1
};

const SOLO_TABLE_THEME = {
  dark: "#063d24",
  mid: "#0d6b3c",
  light: "#16844a",
  text: "#ffffff"
};

const TEAM_COLOURS = [
  {
    name: "Blue",
    dark: "#082d69",
    mid: "#1558b0",
    light: "#3b82f6",
    accent: "#60a5fa",
    text: "#ffffff"
  },
  {
    name: "Red",
    dark: "#641616",
    mid: "#ad2828",
    light: "#e34c4c",
    accent: "#f87171",
    text: "#ffffff"
  },
  {
    name: "Cyan",
    dark: "#07505d",
    mid: "#07839a",
    light: "#22c1d6",
    accent: "#67e8f9",
    text: "#ffffff"
  },
  {
    name: "Pink",
    dark: "#6c1747",
    mid: "#b92f78",
    light: "#ec65a4",
    accent: "#f9a8d4",
    text: "#ffffff"
  },
  {
    name: "Green",
    dark: "#0b4d2a",
    mid: "#168647",
    light: "#37b96a",
    accent: "#86efac",
    text: "#ffffff"
  },
  {
    name: "Orange",
    dark: "#6f3105",
    mid: "#b95a0b",
    light: "#ed8a2e",
    accent: "#fdba74",
    text: "#ffffff"
  },
  {
    name: "Yellow",
    dark: "#765d00",
    mid: "#c59d05",
    light: "#f2cf35",
    accent: "#fde96e",
    text: "#ffffff"
  },
  {
    name: "Light Purple",
    dark: "#503478",
    mid: "#8060ac",
    light: "#ad8bd3",
    accent: "#d8b4fe",
    text: "#ffffff"
  }
];

let settings = loadSettings();
let deck = null;

let selectedCardIndices = [];
let faceUpCardIndices = new Set();
let matchedCardIndices = new Set();
let matchedOwnerByPairId = new Map();

let scores = [];
let currentTeamIndex = 0;
let turns = 0;

let locked = false;
let gameComplete = false;

let cardElements = [];
let layoutAnimationFrame = null;

const cardTable = document.querySelector(
  "#cardTable"
);

const soloStats = document.querySelector(
  "#soloStats"
);

const turnCount = document.querySelector(
  "#turnCount"
);

const teamTurn = document.querySelector(
  "#teamTurn"
);

const scoreboard = document.querySelector(
  "#scoreboard"
);

const statusDisplay = document.querySelector(
  "#statusDisplay"
);

const newRoundButton = document.querySelector(
  "#newRoundButton"
);

const gameMessage = document.querySelector(
  "#gameMessage"
);

newRoundButton.addEventListener(
  "click",
  startNewRound
);

window.addEventListener(
  "resize",
  scheduleCardLayout
);

startNewRound();

function loadSettings() {
  const savedSettings = localStorage.getItem(
    PAIRS_SETTINGS_KEY
  );

  if (!savedSettings) {
    return { ...DEFAULT_PAIRS_SETTINGS };
  }

  try {
    const parsedSettings = JSON.parse(savedSettings);

    if (
      parsedSettings.settingsVersion !==
      PAIRS_SETTINGS_VERSION
    ) {
      return { ...DEFAULT_PAIRS_SETTINGS };
    }

    const mode = PairsGenerator.getMode(
      parsedSettings.mode
    );

    const difficulty =
      PairsGenerator.getDifficulty(
        parsedSettings.difficulty
      );

    const validMode = mode
      ? parsedSettings.mode
      : DEFAULT_PAIRS_SETTINGS.mode;

    const validDifficulty = difficulty
      ? parsedSettings.difficulty
      : DEFAULT_PAIRS_SETTINGS.difficulty;

    const maximumPairCount =
      PairsGenerator.getMaximumPairCount(
        validMode,
        validDifficulty
      );

    return {
      settingsVersion: PAIRS_SETTINGS_VERSION,

      pairCount: clampNumber(
        parsedSettings.pairCount,
        2,
        maximumPairCount
      ),

      mode: validMode,
      difficulty: validDifficulty,

      playerCount: clampNumber(
        parsedSettings.playerCount,
        1,
        8
      )
    };
  } catch {
    return { ...DEFAULT_PAIRS_SETTINGS };
  }
}

function startNewRound() {
  hideGameMessage();

  try {
    deck = PairsGenerator.generateDeck(
      settings.mode,
      settings.difficulty,
      settings.pairCount
    );
  } catch (error) {
    showGameMessage(error.message);
    return;
  }

  selectedCardIndices = [];
  faceUpCardIndices = new Set();
  matchedCardIndices = new Set();
  matchedOwnerByPairId = new Map();

  scores = Array(settings.playerCount).fill(0);

  currentTeamIndex = 0;
  turns = 0;

  locked = false;
  gameComplete = false;

  renderPlayerInformation();
  applyCurrentTableTheme();
  createCardElements();
  renderCardLayout();
  updateCards();

  statusDisplay.textContent =
    settings.playerCount === 1
      ? "Find a matching pair."
      : "Team 1 begins.";
}

function createCardElements() {
  cardElements = deck.cards.map((card, index) => {
    const button = document.createElement("button");
    const value = document.createElement("span");

    button.type = "button";
    button.className = "pair-card face-down";
    button.dataset.cardIndex = index;

    value.className = "pair-card-value";
    value.textContent = card.text;

    button.appendChild(value);

    button.addEventListener("click", () => {
      handleCardClick(index);
    });

    return button;
  });
}

function handleCardClick(cardIndex) {
  if (
    locked ||
    gameComplete ||
    matchedCardIndices.has(cardIndex) ||
    faceUpCardIndices.has(cardIndex)
  ) {
    return;
  }

  faceUpCardIndices.add(cardIndex);
  selectedCardIndices.push(cardIndex);

  updateCards();

  if (selectedCardIndices.length < 2) {
    statusDisplay.textContent =
      "Choose one more card.";

    return;
  }

  turns++;
  updateTurnCount();

  locked = true;
  updateCards();

  const firstIndex = selectedCardIndices[0];
  const secondIndex = selectedCardIndices[1];

  const firstCard = deck.cards[firstIndex];
  const secondCard = deck.cards[secondIndex];

  if (firstCard.pairId === secondCard.pairId) {
    handleMatch(
      firstIndex,
      secondIndex,
      firstCard.pairId
    );
  } else {
    handleNonMatch(firstIndex, secondIndex);
  }
}

function handleMatch(
  firstIndex,
  secondIndex,
  pairId
) {
  window.setTimeout(() => {
    matchedCardIndices.add(firstIndex);
    matchedCardIndices.add(secondIndex);

    faceUpCardIndices.delete(firstIndex);
    faceUpCardIndices.delete(secondIndex);

    matchedOwnerByPairId.set(
      pairId,
      currentTeamIndex
    );

    if (settings.playerCount > 1) {
      scores[currentTeamIndex]++;

      statusDisplay.textContent =
        `Team ${currentTeamIndex + 1} found a pair ` +
        "and gets another turn.";
    } else {
      statusDisplay.textContent = "Pair found!";
    }

    selectedCardIndices = [];
    locked = false;

    renderPlayerInformation();
    updateCards();

    if (
      matchedCardIndices.size ===
      deck.cards.length
    ) {
      finishGame();
    }
  }, 450);
}

function handleNonMatch(firstIndex, secondIndex) {
  statusDisplay.textContent = "Not a match.";

  window.setTimeout(() => {
    faceUpCardIndices.delete(firstIndex);
    faceUpCardIndices.delete(secondIndex);

    selectedCardIndices = [];

    if (settings.playerCount > 1) {
      currentTeamIndex =
        (currentTeamIndex + 1) %
        settings.playerCount;

      applyCurrentTableTheme();

      statusDisplay.textContent =
        `Team ${currentTeamIndex + 1}’s turn.`;
    } else {
      statusDisplay.textContent = "Try again.";
    }

    locked = false;

    renderPlayerInformation();
    updateCards();
  }, 1000);
}

function finishGame() {
  gameComplete = true;
  locked = true;

  updateCards();

  if (settings.playerCount === 1) {
    statusDisplay.textContent =
      `All pairs found in ${turns} ` +
      `turn${turns === 1 ? "" : "s"}!`;

    return;
  }

  const highestScore = Math.max(...scores);

  const winners = scores
    .map((score, index) => ({
      score,
      index
    }))
    .filter((team) => {
      return team.score === highestScore;
    })
    .map((team) => {
      return `Team ${team.index + 1}`;
    });

  if (winners.length === 1) {
    statusDisplay.textContent =
      `${winners[0]} wins with ${highestScore} ` +
      `pair${highestScore === 1 ? "" : "s"}!`;

    return;
  }

  statusDisplay.textContent =
    `${joinNames(winners)} tie with ${highestScore} ` +
    `pair${highestScore === 1 ? "" : "s"} each!`;
}

function renderPlayerInformation() {
  const isSolo = settings.playerCount === 1;

  soloStats.classList.toggle("hidden", !isSolo);
  teamTurn.classList.toggle("hidden", isSolo);
  scoreboard.classList.toggle("hidden", isSolo);

  if (isSolo) {
    updateTurnCount();
    return;
  }

  teamTurn.textContent =
    `Team ${currentTeamIndex + 1}’s turn`;

  scoreboard.innerHTML = "";

  scores.forEach((score, teamIndex) => {
    const teamColour = TEAM_COLOURS[teamIndex];

    const scoreCard = document.createElement("div");
    const teamName = document.createElement("span");
    const teamScore = document.createElement("strong");

    scoreCard.className = "team-score-card";

    scoreCard.classList.toggle(
      "current-team",
      teamIndex === currentTeamIndex &&
        !gameComplete
    );

    scoreCard.style.setProperty(
      "--team-colour",
      teamColour.accent
    );

    scoreCard.style.setProperty(
      "--team-text",
      teamColour.text
    );

    teamName.textContent = `Team ${teamIndex + 1}`;

    teamScore.textContent =
      `${score} pair${score === 1 ? "" : "s"}`;

    scoreCard.append(teamName, teamScore);
    scoreboard.appendChild(scoreCard);
  });
}

function updateTurnCount() {
  turnCount.textContent = String(turns);
}

function applyCurrentTableTheme() {
  const theme =
    settings.playerCount === 1
      ? SOLO_TABLE_THEME
      : TEAM_COLOURS[currentTeamIndex];

  document.body.style.setProperty(
    "--table-dark",
    theme.dark
  );

  document.body.style.setProperty(
    "--table-mid",
    theme.mid
  );

  document.body.style.setProperty(
    "--table-light",
    theme.light
  );

  document.body.style.setProperty(
    "--table-text",
    theme.text
  );
}

function updateCards() {
  cardElements.forEach((button, index) => {
    const card = deck.cards[index];

    const isMatched =
      matchedCardIndices.has(index);

    const isFaceUp =
      isMatched ||
      faceUpCardIndices.has(index);

    button.classList.toggle(
      "face-down",
      !isFaceUp
    );

    button.classList.toggle(
      "face-up",
      isFaceUp
    );

    button.classList.toggle(
      "matched",
      isMatched
    );

    if (isMatched) {
      const ownerIndex =
        matchedOwnerByPairId.get(card.pairId);

      const ownerColour =
        settings.playerCount === 1
          ? "#86efac"
          : TEAM_COLOURS[ownerIndex].accent;

      button.style.setProperty(
        "--match-colour",
        ownerColour
      );
    } else {
      button.style.removeProperty(
        "--match-colour"
      );
    }

    button.disabled =
      locked ||
      gameComplete ||
      isMatched;

    button.setAttribute(
      "aria-label",
      isFaceUp
        ? `${card.text}${isMatched ? ", matched" : ""}`
        : "Face-down card"
    );
  });

  scheduleTextFitting();
}

function renderCardLayout() {
  cardTable.innerHTML = "";

  const layout = chooseCardLayout(
    cardElements.length
  );

  let cardIndex = 0;

  layout.rowCounts.forEach((cardsInRow) => {
    const row = document.createElement("div");

    row.className = "pairs-card-row";

    for (
      let indexInRow = 0;
      indexInRow < cardsInRow;
      indexInRow++
    ) {
      row.appendChild(cardElements[cardIndex]);
      cardIndex++;
    }

    cardTable.appendChild(row);
  });

  applyCardDimensions(layout.cardWidth);
  scheduleTextFitting();
}

function chooseCardLayout(cardCount) {
  const tableRect =
    cardTable.getBoundingClientRect();

  const availableWidth = Math.max(
    280,
    tableRect.width
  );

  const availableHeight = Math.max(
    240,
    tableRect.height
  );

  const gap = getCardGap();

  let bestLayout = null;

  const maximumRows = Math.min(cardCount, 8);

  for (
    let rowCount = 1;
    rowCount <= maximumRows;
    rowCount++
  ) {
    const rowCounts = distributeCardsAcrossRows(
      cardCount,
      rowCount
    );

    const largestRow = Math.max(...rowCounts);
    const smallestRow = Math.min(...rowCounts);

    const horizontalCardWidth =
      (
        availableWidth -
        gap * (largestRow - 1)
      ) / largestRow;

    const availableHeightPerCard =
      (
        availableHeight -
        gap * (rowCount - 1)
      ) / rowCount;

    const verticalCardWidth =
      availableHeightPerCard *
      CARD_ASPECT_RATIO;

    const cardWidth = Math.min(
      horizontalCardWidth,
      verticalCardWidth,
      MAXIMUM_CARD_WIDTH
    );

    if (cardWidth <= 0) {
      continue;
    }

    const layoutWidth =
      largestRow * cardWidth +
      gap * (largestRow - 1);

    const layoutHeight =
      rowCount *
        (cardWidth / CARD_ASPECT_RATIO) +
      gap * (rowCount - 1);

    const tableAspect =
      availableWidth / availableHeight;

    const layoutAspect =
      layoutWidth / layoutHeight;

    const aspectDifference = Math.abs(
      Math.log(layoutAspect / tableAspect)
    );

    const unevenness =
      largestRow - smallestRow;

    const hasSingleCardRow =
      smallestRow === 1 &&
      cardCount > 4;

    let score = cardWidth;

    score -= aspectDifference * 18;
    score -= unevenness * 8;

    if (hasSingleCardRow) {
      score -= 55;
    }

    if (
      rowCount === 1 &&
      cardCount > 6
    ) {
      score -= 80;
    }

    if (
      bestLayout === null ||
      score > bestLayout.score
    ) {
      bestLayout = {
        rowCounts,
        cardWidth,
        score
      };
    }
  }

  return bestLayout || {
    rowCounts: [cardCount],
    cardWidth: 80,
    score: 0
  };
}

function distributeCardsAcrossRows(
  cardCount,
  rowCount
) {
  const cardsPerRow = Math.floor(
    cardCount / rowCount
  );

  const extraCards = cardCount % rowCount;
  const rowCounts = [];

  for (let row = 0; row < rowCount; row++) {
    rowCounts.push(
      cardsPerRow +
      (row < extraCards ? 1 : 0)
    );
  }

  return rowCounts;
}

function applyCardDimensions(cardWidth) {
  const safeWidth = Math.max(
    44,
    Math.floor(cardWidth)
  );

  const safeHeight = Math.floor(
    safeWidth / CARD_ASPECT_RATIO
  );

  cardTable.style.setProperty(
    "--card-width",
    `${safeWidth}px`
  );

  cardTable.style.setProperty(
    "--card-height",
    `${safeHeight}px`
  );
}

function scheduleCardLayout() {
  if (layoutAnimationFrame !== null) {
    window.cancelAnimationFrame(
      layoutAnimationFrame
    );
  }

  layoutAnimationFrame =
    window.requestAnimationFrame(() => {
      layoutAnimationFrame = null;

      if (cardElements.length > 0) {
        renderCardLayout();
      }
    });
}

function scheduleTextFitting() {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      fitAllCardText();
    });
  });
}

function fitAllCardText() {
  const cardWidth = getCurrentCardWidth();

  document
    .querySelectorAll(".pair-card-value")
    .forEach((element) => {
      fitSingleLineText(
        element,
        Math.min(58, cardWidth * 0.27),
        10
      );
    });
}

function fitSingleLineText(
  element,
  maximumSize,
  minimumSize
) {
  let lowerBound = minimumSize;
  let upperBound = maximumSize;
  let bestSize = minimumSize;

  element.style.fontSize = `${minimumSize}px`;

  for (
    let attempt = 0;
    attempt < 12;
    attempt++
  ) {
    const testSize =
      (lowerBound + upperBound) / 2;

    element.style.fontSize =
      `${testSize}px`;

    const fits =
      element.scrollWidth <=
        element.clientWidth + 1 &&
      element.scrollHeight <=
        element.clientHeight + 1;

    if (fits) {
      bestSize = testSize;
      lowerBound = testSize;
    } else {
      upperBound = testSize;
    }
  }

  element.style.fontSize =
    `${bestSize}px`;
}

function getCurrentCardWidth() {
  const value = window
    .getComputedStyle(cardTable)
    .getPropertyValue("--card-width");

  const parsedValue =
    Number.parseFloat(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 100;
}

function getCardGap() {
  const style =
    window.getComputedStyle(cardTable);

  const gap = Number.parseFloat(
    style.rowGap
  );

  return Number.isFinite(gap) ? gap : 12;
}

function joinNames(names) {
  if (names.length <= 1) {
    return names[0] || "";
  }

  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }

  return (
    `${names.slice(0, -1).join(", ")} and ` +
    names[names.length - 1]
  );
}

function clampNumber(
  value,
  minimum,
  maximum
) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return minimum;
  }

  return Math.min(
    maximum,
    Math.max(
      minimum,
      Math.round(numericValue)
    )
  );
}

function showGameMessage(message) {
  gameMessage.textContent = message;
  gameMessage.classList.remove("hidden");
}

function hideGameMessage() {
  gameMessage.textContent = "";
  gameMessage.classList.add("hidden");
}