const KIMS_SETTINGS_VERSION = 3;
const KIMS_SETTINGS_KEY = "kimsGameSettings";
const CARD_ASPECT_RATIO = 5 / 7;
const MAXIMUM_CARD_WIDTH = 270;

const DEFAULT_KIMS_QUESTION_TYPE_IDS = [
  "positive-addition-under-100"
];

const DEFAULT_KIMS_SETTINGS = {
  settingsVersion: KIMS_SETTINGS_VERSION,
  cardCount: 4,
  timerEnabled: false,
  timerDuration: 20,
  selectedQuestionTypeIds: [...DEFAULT_KIMS_QUESTION_TYPE_IDS]
};

let settings = loadSettings();
let roundQuestions = [];
let missingQuestionIndex = 0;
let questionLayout = [];
let phase = "answers";
let timerInterval = null;
let timerRemaining = 0;
let revealedCards = new Set();
let layoutAnimationFrame = null;

const cardTable = document.querySelector("#cardTable");
const timerDisplay = document.querySelector("#timerDisplay");
const continueButton = document.querySelector("#continueButton");
const showAnswersAgainButton = document.querySelector(
  "#showAnswersAgainButton"
);
const revealAllButton = document.querySelector("#revealAllButton");
const newRoundButton = document.querySelector("#newRoundButton");
const gameMessage = document.querySelector("#gameMessage");

continueButton.addEventListener("click", showQuestionPhase);
showAnswersAgainButton.addEventListener("click", showAnswerPhase);
revealAllButton.addEventListener("click", revealAllCards);
newRoundButton.addEventListener("click", startNewRound);

window.addEventListener("resize", scheduleCardLayout);

if ("ResizeObserver" in window) {
  const cardTableResizeObserver = new ResizeObserver(() => {
    scheduleCardLayout();
  });

  cardTableResizeObserver.observe(cardTable);
}

startNewRound();

function loadSettings() {
  const savedSettings = localStorage.getItem(KIMS_SETTINGS_KEY);

  if (!savedSettings) {
    return {
      ...DEFAULT_KIMS_SETTINGS,
      selectedQuestionTypeIds: [
        ...DEFAULT_KIMS_QUESTION_TYPE_IDS
      ]
    };
  }

  try {
    const parsedSettings = JSON.parse(savedSettings);

    if (
      parsedSettings.settingsVersion !==
      KIMS_SETTINGS_VERSION
    ) {
      return {
        ...DEFAULT_KIMS_SETTINGS,
        selectedQuestionTypeIds: [
          ...DEFAULT_KIMS_QUESTION_TYPE_IDS
        ]
      };
    }

    const validSelectedIds = getValidQuestionTypeIds(
      parsedSettings.selectedQuestionTypeIds
    );

    return {
      ...DEFAULT_KIMS_SETTINGS,
      ...parsedSettings,
      selectedQuestionTypeIds:
        validSelectedIds.length > 0
          ? validSelectedIds
          : [...DEFAULT_KIMS_QUESTION_TYPE_IDS]
    };
  } catch {
    return {
      ...DEFAULT_KIMS_SETTINGS,
      selectedQuestionTypeIds: [
        ...DEFAULT_KIMS_QUESTION_TYPE_IDS
      ]
    };
  }
}

function getValidQuestionTypeIds(typeIds) {
  if (!Array.isArray(typeIds)) {
    return [];
  }

  return typeIds.filter((typeId) => {
    return QuestionGenerator.getQuestionType(typeId) !== null;
  });
}

function startNewRound() {
  stopTimer();
  hideGameMessage();

  try {
    roundQuestions = QuestionGenerator.generateUniqueQuestions(
      clampNumber(settings.cardCount, 4, 20),
      settings.selectedQuestionTypeIds
    );
  } catch (error) {
    showGameMessage(error.message);
    return;
  }

  missingQuestionIndex = randomInt(
    0,
    roundQuestions.length - 1
  );

  questionLayout = makeQuestionLayout();
  revealedCards = new Set();

  showAnswerPhase();
}

function showAnswerPhase() {
  stopTimer();

  phase = "answers";
  revealedCards = new Set();

  continueButton.classList.remove("hidden");
  showAnswersAgainButton.classList.add("hidden");
  revealAllButton.classList.add("hidden");

  renderAnswerCards();

  const timerDuration = clampNumber(
    Number(settings.timerDuration),
    1,
    600
  );

  if (settings.timerEnabled === true) {
    continueButton.textContent = "Hide Now";
    startTimer(timerDuration);
  } else {
    continueButton.textContent = "Hide Answers";
    timerDisplay.textContent = "";
  }
}

function showQuestionPhase() {
  if (phase === "questions") {
    return;
  }

  stopTimer();

  phase = "questions";
  revealedCards = new Set();
  timerDisplay.textContent = "";

  continueButton.classList.add("hidden");
  showAnswersAgainButton.classList.remove("hidden");
  revealAllButton.classList.remove("hidden");

  renderQuestionCards();
}

function startTimer(duration) {
  timerRemaining = duration;
  updateTimerDisplay();

  timerInterval = window.setInterval(() => {
    timerRemaining--;
    updateTimerDisplay();

    if (timerRemaining <= 0) {
      stopTimer();
      showQuestionPhase();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval !== null) {
    window.clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay() {
  timerDisplay.textContent =
    `${timerRemaining} second${timerRemaining === 1 ? "" : "s"}`;
}

function renderAnswerCards() {
  const cards = roundQuestions.map((question, index) => {
    const card = createCard("answer-card");
    card.dataset.originalIndex = index;

    const answer = document.createElement("span");
    answer.className = "answer-card-value";
    answer.textContent = question.answerText;

    card.appendChild(answer);

    return card;
  });

  renderCardsInBalancedRows(cards);
}

function renderQuestionCards() {
  const cards = questionLayout.map((item, position) => {
    if (item.kind === "missing") {
      return createMissingCard(item, position);
    }

    return createQuestionCard(item, position);
  });

  renderCardsInBalancedRows(cards);
}

function createQuestionCard(item, position) {
  const card = createCard("question-card", true);
  card.dataset.position = position;

  const question = roundQuestions[item.questionIndex];
  const isRevealed = revealedCards.has(position);

  if (isRevealed) {
    card.classList.add("revealed");

    const originalQuestion = document.createElement("span");
    originalQuestion.className = "revealed-question";
    originalQuestion.textContent = question.question;

    const answer = document.createElement("span");
    answer.className = "revealed-answer";
    answer.textContent = question.answerText;

    card.append(originalQuestion, answer);

    card.setAttribute(
      "aria-label",
      `${question.question} equals ${question.answerText}. Click to hide.`
    );
  } else {
    const questionText = document.createElement("span");
    questionText.className = "question-card-text";
    questionText.textContent = question.question;

    card.appendChild(questionText);

    card.setAttribute(
      "aria-label",
      `${question.question}. Click to reveal the answer.`
    );
  }

  card.addEventListener("click", () => {
    toggleCardReveal(position);
  });

  return card;
}

function createMissingCard(item, position) {
  const card = createCard("missing-card", true);
  card.dataset.position = position;

  const missingQuestion = roundQuestions[item.questionIndex];
  const isRevealed = revealedCards.has(position);

  if (isRevealed) {
    card.classList.add(
      "revealed",
      "missing-revealed"
    );

    const answer = document.createElement("span");
    answer.className = "revealed-answer";
    answer.textContent = missingQuestion.answerText;

    card.appendChild(answer);

    card.setAttribute(
      "aria-label",
      `The missing answer was ${missingQuestion.answerText}. Click to hide.`
    );
  } else {
    const cardBack = document.createElement("span");
    cardBack.className = "card-back-pattern";

    card.appendChild(cardBack);

    card.setAttribute(
      "aria-label",
      "Face-down card. Click to reveal the missing answer."
    );
  }

  card.addEventListener("click", () => {
    toggleCardReveal(position);
  });

  return card;
}

function toggleCardReveal(position) {
  if (revealedCards.has(position)) {
    revealedCards.delete(position);
  } else {
    revealedCards.add(position);
  }

  renderQuestionCards();
}

function revealAllCards() {
  questionLayout.forEach((item, position) => {
    revealedCards.add(position);
  });

  renderQuestionCards();
}

function createCard(extraClass, interactive = false) {
  const card = document.createElement(
    interactive ? "button" : "div"
  );

  card.className = `kim-card ${extraClass}`;

  if (interactive) {
    card.type = "button";
  }

  return card;
}

function renderCardsInBalancedRows(cards) {
  cardTable.innerHTML = "";

  const layout = chooseCardLayout(cards.length);
  let cardIndex = 0;

  layout.rowCounts.forEach((numberOfCardsInRow) => {
    const row = document.createElement("div");
    row.className = "card-row";

    for (
      let indexInRow = 0;
      indexInRow < numberOfCardsInRow;
      indexInRow++
    ) {
      row.appendChild(cards[cardIndex]);
      cardIndex++;
    }

    cardTable.appendChild(row);
  });

  applyCardDimensions(layout.cardWidth);
  scheduleTextFitting();
}

function chooseCardLayout(cardCount) {
  const tableRect = cardTable.getBoundingClientRect();
  const availableWidth = Math.max(300, tableRect.width);
  const availableHeight = Math.max(260, tableRect.height);
  const gap = getCardGap();

  let bestLayout = null;
  const maximumRows = Math.min(cardCount, 6);

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

    const widthFromHorizontalSpace =
      (
        availableWidth -
        gap * (largestRow - 1)
      ) / largestRow;

    const heightPerCard =
      (
        availableHeight -
        gap * (rowCount - 1)
      ) / rowCount;

    const widthFromVerticalSpace =
      heightPerCard * CARD_ASPECT_RATIO;

    const cardWidth = Math.min(
      widthFromHorizontalSpace,
      widthFromVerticalSpace,
      MAXIMUM_CARD_WIDTH
    );

    if (cardWidth <= 0) {
      continue;
    }

    const layoutWidth =
      largestRow * cardWidth +
      gap * (largestRow - 1);

    const layoutHeight =
      rowCount * (cardWidth / CARD_ASPECT_RATIO) +
      gap * (rowCount - 1);

    const tableAspectRatio =
      availableWidth / availableHeight;

    const layoutAspectRatio =
      layoutWidth / layoutHeight;

    const aspectDifference = Math.abs(
      Math.log(
        layoutAspectRatio / tableAspectRatio
      )
    );

    const unevenness = largestRow - smallestRow;
    const hasSingleCardRow =
      smallestRow === 1 && cardCount > 4;

    let score = cardWidth;

    score -= aspectDifference * 16;
    score -= unevenness * 7;

    if (hasSingleCardRow) {
      score -= 45;
    }

    if (rowCount === 1 && cardCount > 6) {
      score -= 60;
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
    cardWidth: 100,
    score: 0
  };
}

function distributeCardsAcrossRows(cardCount, rowCount) {
  const cardsPerFullRow = Math.floor(
    cardCount / rowCount
  );

  const extraCards = cardCount % rowCount;
  const rowCounts = [];

  for (let row = 0; row < rowCount; row++) {
    rowCounts.push(
      cardsPerFullRow +
      (row < extraCards ? 1 : 0)
    );
  }

  return rowCounts;
}

function applyCardDimensions(cardWidth) {
  const safeCardWidth = Math.max(
    52,
    Math.floor(cardWidth)
  );

  const cardHeight = Math.floor(
    safeCardWidth / CARD_ASPECT_RATIO
  );

  cardTable.style.setProperty(
    "--card-width",
    `${safeCardWidth}px`
  );

  cardTable.style.setProperty(
    "--card-height",
    `${cardHeight}px`
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

      const cards = [
        ...cardTable.querySelectorAll(".kim-card")
      ];

      if (cards.length === 0) {
        return;
      }

      renderCardsInBalancedRows(cards);
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
    .querySelectorAll(
      ".answer-card-value, .revealed-answer"
    )
    .forEach((element) => {
      fitSingleLineText(
        element,
        Math.min(74, cardWidth * 0.3),
        16
      );
    });

  document
    .querySelectorAll(".question-card-text")
    .forEach((element) => {
      fitSingleLineText(
        element,
        Math.min(42, cardWidth * 0.18),
        11
      );
    });

  document
    .querySelectorAll(".revealed-question")
    .forEach((element) => {
      fitSingleLineText(
        element,
        Math.min(22, cardWidth * 0.105),
        9
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

  for (let attempt = 0; attempt < 12; attempt++) {
    const testSize =
      (lowerBound + upperBound) / 2;

    element.style.fontSize = `${testSize}px`;

    const fits =
      element.scrollWidth <= element.clientWidth + 1 &&
      element.scrollHeight <= element.clientHeight + 1;

    if (fits) {
      bestSize = testSize;
      lowerBound = testSize;
    } else {
      upperBound = testSize;
    }
  }

  element.style.fontSize = `${bestSize}px`;
}

function getCurrentCardWidth() {
  const value = window
    .getComputedStyle(cardTable)
    .getPropertyValue("--card-width");

  const parsedValue = Number.parseFloat(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 100;
}

function getCardGap() {
  const computedStyle =
    window.getComputedStyle(cardTable);

  const gap = Number.parseFloat(
    computedStyle.rowGap
  );

  return Number.isFinite(gap) ? gap : 12;
}

function makeQuestionLayout() {
  const items = [];

  roundQuestions.forEach((question, questionIndex) => {
    if (questionIndex === missingQuestionIndex) {
      return;
    }

    items.push({
      kind: "question",
      questionIndex
    });
  });

  items.push({
    kind: "missing",
    questionIndex: missingQuestionIndex
  });

  for (let attempt = 0; attempt < 1000; attempt++) {
    const shuffledItems = shuffle(items);

    const validLayout = shuffledItems.every(
      (item, position) => {
        if (item.kind === "missing") {
          return true;
        }

        return item.questionIndex !== position;
      }
    );

    if (validLayout) {
      return shuffledItems;
    }
  }

  return rotateItems(items);
}

function rotateItems(items) {
  for (let shift = 1; shift < items.length; shift++) {
    const candidate = items.map((item, index) => {
      return items[
        (index + shift) % items.length
      ];
    });

    const validLayout = candidate.every(
      (item, position) => {
        return (
          item.kind === "missing" ||
          item.questionIndex !== position
        );
      }
    );

    if (validLayout) {
      return candidate;
    }
  }

  return [...items].reverse();
}

function shuffle(array) {
  const shuffledArray = [...array];

  for (
    let index = shuffledArray.length - 1;
    index > 0;
    index--
  ) {
    const randomIndex = randomInt(0, index);

    [
      shuffledArray[index],
      shuffledArray[randomIndex]
    ] = [
      shuffledArray[randomIndex],
      shuffledArray[index]
    ];
  }

  return shuffledArray;
}

function randomInt(minimum, maximum) {
  return Math.floor(
    Math.random() * (maximum - minimum + 1)
  ) + minimum;
}

function clampNumber(value, minimum, maximum) {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.min(
    maximum,
    Math.max(minimum, Math.round(value))
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