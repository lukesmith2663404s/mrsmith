const WHEEL_SETTINGS_KEY = "wheelGameSettings";
const WHEEL_SETTINGS_VERSION = 1;

const STARTING_SCORE = 1;
const SPIN_DURATION = 4800;
const ANSWER_EFFECT_DURATION = 950;
const ROUND_ANNOUNCEMENT_DURATION = 1300;
const ROUND_ANNOUNCEMENT_EXIT_DURATION = 320;
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

const DEFAULT_WHEEL_QUESTION_TYPE_IDS = [
  "positive-addition-under-100"
];

const DEFAULT_WHEEL_SETTINGS = {
  settingsVersion: WHEEL_SETTINGS_VERSION,
  roundCount: 6,
  playerCount: 1,
  selectedQuestionTypeIds: [
    ...DEFAULT_WHEEL_QUESTION_TYPE_IDS
  ]
};

const SOLO_TABLE_THEME = {
  name: "Dark Grey",
  dark: "#05070c",
  mid: "#0d131d",
  light: "#1b2635",
  accent: "#59c7ff",
  text: "#ffffff"
};

const TEAM_COLOURS = [
  {
    name: "Blue",
    dark: "#061a38",
    mid: "#0b3974",
    light: "#1558b0",
    accent: "#60a5fa",
    text: "#ffffff"
  },
  {
    name: "Red",
    dark: "#350a0d",
    mid: "#74151d",
    light: "#ad2828",
    accent: "#f87171",
    text: "#ffffff"
  },
  {
    name: "Cyan",
    dark: "#06343d",
    mid: "#056878",
    light: "#078fa7",
    accent: "#67e8f9",
    text: "#ffffff"
  },
  {
    name: "Pink",
    dark: "#3d0c29",
    mid: "#78194d",
    light: "#b92f78",
    accent: "#f9a8d4",
    text: "#ffffff"
  },
  {
    name: "Green",
    dark: "#062c19",
    mid: "#09582f",
    light: "#168647",
    accent: "#86efac",
    text: "#ffffff"
  },
  {
    name: "Orange",
    dark: "#3c1803",
    mid: "#743305",
    light: "#b95a0b",
    accent: "#fdba74",
    text: "#ffffff"
  },
  {
    name: "Yellow",
    dark: "#3b3000",
    mid: "#796100",
    light: "#b89400",
    accent: "#fde96e",
    text: "#ffffff"
  },
  {
    name: "Light Purple",
    dark: "#291941",
    mid: "#503478",
    light: "#8060ac",
    accent: "#d8b4fe",
    text: "#ffffff"
  }
];

const SEGMENT_COLOURS = {
  add: "#25a653",
  multiplyTwo: "#7c3ab4",
  multiplyThree: "#d7a800",
  subtract: "#2382d8",
  extra: "#ea4d9d",
  multiplyZero: "#05070b"
};

const ROUND_WORDS = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
  "Twenty"
];

let settings = loadSettings();

let scores = [];
let currentRound = 1;
let currentTeamIndex = 0;

let currentQuestion = null;
let usedQuestionTexts = new Set();

let wheelSegments = [];
let wheelRotation = 0;

let isSpinning = false;
let pendingSegment = null;
let pendingSpinTimer = null;
let answerEffectTimer = null;
let roundAnnouncementTimer = null;
let roundAnnouncementExitTimer = null;
let gameComplete = false;

const wheelGame = document.querySelector(
  ".wheel-game"
);

const roundDisplay = document.querySelector(
  "#roundDisplay"
);

const scoreboard = document.querySelector(
  "#scoreboard"
);

const currentPlayerLabel = document.querySelector(
  "#currentPlayerLabel"
);

const questionText = document.querySelector(
  "#questionText"
);

const answerForm = document.querySelector(
  "#answerForm"
);

const answerPrefixDisplay = document.querySelector(
  "#answerPrefix"
);

const answerInput = document.querySelector(
  "#answerInput"
);

const answerSuffixDisplay = document.querySelector(
  "#answerSuffix"
);

const submitAnswerButton = document.querySelector(
  "#submitAnswerButton"
);

const answerFeedback = document.querySelector(
  "#answerFeedback"
);

const finalResult = document.querySelector(
  "#finalResult"
);

const wheelShell = document.querySelector(
  "#wheelShell"
);

const wheelSpinner = document.querySelector(
  "#wheelSpinner"
);

const wheelSvg = document.querySelector(
  "#wheelSvg"
);

const wheelCentreDisplay = document.querySelector(
  "#wheelCentreDisplay"
);

const wheelCentreText = document.querySelector(
  "#wheelCentreText"
);

const spinButton = document.querySelector(
  "#spinButton"
);

const continueButton = document.querySelector(
  "#continueButton"
);

const newGameButton = document.querySelector(
  "#newGameButton"
);

const roundAnnouncement = document.querySelector(
  "#roundAnnouncement"
);

const roundAnnouncementText = document.querySelector(
  "#roundAnnouncementText"
);

const gameMessage = document.querySelector(
  "#gameMessage"
);

answerForm.addEventListener(
  "submit",
  checkAnswer
);

spinButton.addEventListener(
  "click",
  spinWheel
);

continueButton.addEventListener(
  "click",
  advanceTurn
);

newGameButton.addEventListener(
  "click",
  startNewGame
);

wheelSpinner.addEventListener(
  "transitionend",
  (event) => {
    if (
      event.propertyName === "transform" &&
      isSpinning
    ) {
      completeSpin();
    }
  }
);

startNewGame();

function loadSettings() {
  const savedSettings = localStorage.getItem(
    WHEEL_SETTINGS_KEY
  );

  if (!savedSettings) {
    return createDefaultSettings();
  }

  try {
    const parsedSettings = JSON.parse(
      savedSettings
    );

    if (
      parsedSettings.settingsVersion !==
      WHEEL_SETTINGS_VERSION
    ) {
      return createDefaultSettings();
    }

    const validQuestionTypeIds =
      getValidQuestionTypeIds(
        parsedSettings.selectedQuestionTypeIds
      );

    return {
      settingsVersion:
        WHEEL_SETTINGS_VERSION,

      roundCount: clampNumber(
        parsedSettings.roundCount,
        1,
        20
      ),

      playerCount: clampNumber(
        parsedSettings.playerCount,
        1,
        8
      ),

      selectedQuestionTypeIds:
        validQuestionTypeIds.length > 0
          ? validQuestionTypeIds
          : [
              ...DEFAULT_WHEEL_QUESTION_TYPE_IDS
            ]
    };
  } catch {
    return createDefaultSettings();
  }
}

function createDefaultSettings() {
  return {
    ...DEFAULT_WHEEL_SETTINGS,
    selectedQuestionTypeIds: [
      ...DEFAULT_WHEEL_QUESTION_TYPE_IDS
    ]
  };
}

function getValidQuestionTypeIds(typeIds) {
  if (!Array.isArray(typeIds)) {
    return [];
  }

  return typeIds.filter((typeId) => {
    return (
      QuestionGenerator.getQuestionType(
        typeId
      ) !== null
    );
  });
}

function startNewGame() {
  clearPendingSpinTimer();
  clearAnswerEffect();
  clearRoundAnnouncement();
  hideGameMessage();

  scores = Array(
    settings.playerCount
  ).fill(STARTING_SCORE);

  currentRound = 1;
  currentTeamIndex = 0;

  currentQuestion = null;
  usedQuestionTexts = new Set();

  gameComplete = false;
  isSpinning = false;
  pendingSegment = null;

  finalResult.textContent = "";
  finalResult.classList.add("hidden");

  answerForm.classList.remove("hidden");
  updateAnswerAffixes(null);

  applyCurrentTableTheme();
  renderRoundInformation();
  renderScoreboard();

  showRoundAnnouncement(() => {
    beginTurn();
  });
}

function beginTurn() {
  clearPendingSpinTimer();
  clearAnswerEffect();

  isSpinning = false;
  pendingSegment = null;

  applyCurrentTableTheme();
  renderRoundInformation();
  renderScoreboard();

  answerFeedback.textContent = "";
  answerFeedback.className =
    "wheel-answer-feedback";

  spinButton.textContent =
    "Spin the Wheel";

  spinButton.classList.add("hidden");
  spinButton.disabled = true;

  continueButton.classList.add("hidden");
  continueButton.textContent =
    getContinueButtonLabel();

  answerForm.classList.remove("hidden");

  answerInput.disabled = false;
  submitAnswerButton.disabled = false;
  answerInput.value = "";

  wheelSegments = getWheelSegments(
    currentRound,
    settings.roundCount
  );

  buildWheel(wheelSegments);
  resetWheelRotation();
  resetWheelSelectionVisuals();

  try {
    currentQuestion =
      generateNextQuestion();

    questionText.textContent =
      currentQuestion.question;

    updateAnswerAffixes(currentQuestion);
  } catch (error) {
    showGameMessage(error.message);
    return;
  }

  window.setTimeout(() => {
    answerInput.focus();
  }, 50);
}

function generateNextQuestion() {
  let fallbackQuestion = null;

  for (
    let attempt = 0;
    attempt < 100;
    attempt++
  ) {
    const typeId = randomChoice(
      settings.selectedQuestionTypeIds
    );

    const generatedQuestion =
      QuestionGenerator.generateQuestion(
        typeId
      );

    fallbackQuestion = generatedQuestion;

    if (
      !usedQuestionTexts.has(
        generatedQuestion.question
      )
    ) {
      usedQuestionTexts.add(
        generatedQuestion.question
      );

      return generatedQuestion;
    }
  }

  if (fallbackQuestion) {
    return fallbackQuestion;
  }

  throw new Error(
    "A question could not be generated."
  );
}

function updateAnswerAffixes(question) {
  const prefix = question
    ? formatPrefixAffix(question.answerPrefix)
    : "";

  const suffix = question
    ? formatSuffixAffix(question.answerSuffix)
    : "";

  answerPrefixDisplay.textContent = prefix;
  answerSuffixDisplay.textContent = suffix;

  answerPrefixDisplay.classList.toggle(
    "hidden",
    prefix === ""
  );

  answerSuffixDisplay.classList.toggle(
    "hidden",
    suffix === ""
  );
}

function formatPrefixAffix(prefix) {
  return typeof prefix === "string"
    ? prefix.trimEnd()
    : "";
}

function formatSuffixAffix(suffix) {
  return typeof suffix === "string"
    ? suffix.trimStart()
    : "";
}

function formatFullAnswer(question) {
  if (!question) {
    return "";
  }

  if (
    typeof QuestionGenerator.formatAnswer ===
    "function"
  ) {
    return QuestionGenerator.formatAnswer(
      question
    );
  }

  const answerPrefix =
    typeof question.answerPrefix === "string"
      ? question.answerPrefix
      : "";

  const answerText =
    question.answerText !== undefined
      ? String(question.answerText)
      : question.answer !== undefined
        ? String(question.answer)
        : "";

  const answerSuffix =
    typeof question.answerSuffix === "string"
      ? question.answerSuffix
      : "";

  return `${answerPrefix}${answerText}${answerSuffix}`;
}

function checkAnswer(event) {
  event.preventDefault();

  if (
    gameComplete ||
    !currentQuestion ||
    isSpinning ||
    answerInput.disabled
  ) {
    return;
  }

  const userAnswer = answerInput.value;

  if (
    answersMatch(
      userAnswer,
      currentQuestion.answerText
    )
  ) {
    handleCorrectAnswer();
    return;
  }

  handleIncorrectAnswer();
}

function handleCorrectAnswer() {
  answerFeedback.textContent =
    "Correct — spin the wheel.";

  answerFeedback.className =
    "wheel-answer-feedback correct";

  answerInput.disabled = true;
  submitAnswerButton.disabled = true;

  continueButton.classList.add("hidden");

  spinButton.classList.remove("hidden");
  spinButton.disabled = false;

  playAnswerEffect("correct");
}

function handleIncorrectAnswer() {
  answerFeedback.textContent =
    `Incorrect — the answer was ` +
    `${formatFullAnswer(currentQuestion)}. ` +
    "The turn is over.";

  answerFeedback.className =
    "wheel-answer-feedback incorrect";

  answerInput.disabled = true;
  submitAnswerButton.disabled = true;

  spinButton.classList.add("hidden");
  spinButton.disabled = true;

  continueButton.textContent =
    getContinueButtonLabel();

  continueButton.classList.remove("hidden");

  playAnswerEffect("incorrect");
}

function answersMatch(
  userAnswer,
  expectedAnswer
) {
  const userNumeric =
    parseNumericAnswer(userAnswer);

  const expectedNumeric =
    parseNumericAnswer(expectedAnswer);

  if (
    userNumeric !== null &&
    expectedNumeric !== null
  ) {
    return (
      Math.abs(
        userNumeric - expectedNumeric
      ) < 0.0000001
    );
  }

  return (
    normaliseAnswer(userAnswer) ===
    normaliseAnswer(expectedAnswer)
  );
}

function parseNumericAnswer(value) {
  const normalised = String(value)
    .trim()
    .replace(/,/g, "")
    .replace(/−/g, "-")
    .replace(/\s+/g, "");

  const fractionMatch =
    normalised.match(
      /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/
    );

  if (fractionMatch) {
    const numerator = Number(
      fractionMatch[1]
    );

    const denominator = Number(
      fractionMatch[2]
    );

    if (
      Number.isFinite(numerator) &&
      Number.isFinite(denominator) &&
      denominator !== 0
    ) {
      return numerator / denominator;
    }
  }

  const numericValue = Number(
    normalised
  );

  return Number.isFinite(numericValue)
    ? numericValue
    : null;
}

function normaliseAnswer(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/−/g, "-")
    .replace(/remainder/g, "r")
    .replace(/\s+/g, "")
    .replace(/,/g, "");
}

function playAnswerEffect(type) {
  clearAnswerEffect();

  void wheelGame.offsetWidth;

  if (type === "correct") {
    wheelGame.classList.add(
      "answer-correct-effect"
    );
  } else {
    wheelGame.classList.add(
      "answer-incorrect-effect"
    );
  }

  answerEffectTimer = window.setTimeout(
    clearAnswerEffect,
    ANSWER_EFFECT_DURATION
  );
}

function clearAnswerEffect() {
  if (answerEffectTimer !== null) {
    window.clearTimeout(
      answerEffectTimer
    );

    answerEffectTimer = null;
  }

  wheelGame.classList.remove(
    "answer-correct-effect",
    "answer-incorrect-effect"
  );
}

function spinWheel() {
  if (
    isSpinning ||
    spinButton.disabled ||
    gameComplete
  ) {
    return;
  }

  isSpinning = true;

  spinButton.disabled = true;
  continueButton.classList.add("hidden");

  resetWheelSelectionVisuals();

  const selectedIndex = randomInt(
    0,
    wheelSegments.length - 1
  );

  pendingSegment =
    wheelSegments[selectedIndex];

  const sliceAngle =
    360 / wheelSegments.length;

  const landingVariation =
    (
      Math.random() - 0.5
    ) * sliceAngle * 0.48;

  const selectedAngle =
    selectedIndex * sliceAngle +
    landingVariation;

  const desiredRotation =
    normaliseAngle(90 - selectedAngle);

  const minimumTarget =
    wheelRotation + 360 * 5;

  const extraTurns = Math.ceil(
    (
      minimumTarget -
      desiredRotation
    ) / 360
  );

  wheelRotation =
    desiredRotation +
    Math.max(0, extraTurns) * 360;

  wheelSpinner.style.transition =
    `transform ${SPIN_DURATION}ms ` +
    "cubic-bezier(0.12, 0.72, 0.13, 1)";

  wheelSpinner.style.transform =
    `rotate(${wheelRotation}deg)`;

  pendingSpinTimer =
    window.setTimeout(() => {
      if (isSpinning) {
        completeSpin();
      }
    }, SPIN_DURATION + 250);
}

function completeSpin() {
  if (
    !isSpinning ||
    !pendingSegment
  ) {
    return;
  }

  clearPendingSpinTimer();

  isSpinning = false;

  applySegment(pendingSegment);
  renderScoreboard();
  showWheelSelection(pendingSegment);

  if (
    pendingSegment.type === "extra"
  ) {
    spinButton.textContent =
      "Extra Spin";

    spinButton.disabled = false;
    spinButton.classList.remove(
      "hidden"
    );

    return;
  }

  spinButton.classList.add("hidden");

  continueButton.textContent =
    getContinueButtonLabel();

  continueButton.classList.remove(
    "hidden"
  );
}

function applySegment(segment) {
  const previousScore =
    scores[currentTeamIndex];

  let newScore = previousScore;

  if (segment.type === "add") {
    newScore =
      previousScore + segment.value;
  }

  if (segment.type === "subtract") {
    newScore = Math.max(
      0,
      previousScore - segment.value
    );
  }

  if (
    segment.type === "multiplyTwo"
  ) {
    newScore = previousScore * 2;
  }

  if (
    segment.type === "multiplyThree"
  ) {
    newScore = previousScore * 3;
  }

  if (
    segment.type === "multiplyZero"
  ) {
    newScore = 0;
  }

  if (segment.type === "extra") {
    newScore = previousScore + 5;
  }

  scores[currentTeamIndex] = newScore;
}

function showWheelSelection(segment) {
  const glowColour =
    segment.glowColour ||
    segment.colour;

  const textColour =
    segment.textColour ||
    "#ffffff";

  wheelShell.classList.remove(
    "segment-selected"
  );

  wheelShell.style.setProperty(
    "--selected-segment-colour",
    glowColour
  );

  wheelCentreDisplay.style.setProperty(
    "--centre-result-colour",
    segment.colour
  );

  wheelCentreDisplay.style.setProperty(
    "--centre-result-text",
    textColour
  );

  wheelCentreText.textContent =
    segment.label;

  void wheelShell.offsetWidth;

  wheelShell.classList.add(
    "segment-selected"
  );
}

function resetWheelSelectionVisuals() {
  wheelShell.classList.remove(
    "segment-selected"
  );

  wheelShell.style.setProperty(
    "--selected-segment-colour",
    "#59c7ff"
  );

  wheelCentreDisplay.style.setProperty(
    "--centre-result-colour",
    "#0a111d"
  );

  wheelCentreDisplay.style.setProperty(
    "--centre-result-text",
    "#dff7ff"
  );

  wheelCentreText.textContent = "SPIN";
}

function advanceTurn() {
  if (
    gameComplete ||
    isSpinning
  ) {
    return;
  }

  if (
    currentTeamIndex <
    settings.playerCount - 1
  ) {
    currentTeamIndex++;
    beginTurn();
    return;
  }

  currentTeamIndex = 0;

  if (
    currentRound <
    settings.roundCount
  ) {
    currentRound++;

    applyCurrentTableTheme();
    renderRoundInformation();
    renderScoreboard();

    showRoundAnnouncement(() => {
      beginTurn();
    });

    return;
  }

  finishGame();
}

function getContinueButtonLabel() {
  if (
    currentTeamIndex <
    settings.playerCount - 1
  ) {
    return "Next Team";
  }

  if (
    currentRound <
    settings.roundCount
  ) {
    return "Next Round";
  }

  return settings.playerCount === 1
    ? "Show Result"
    : "Show Results";
}

function finishGame() {
  gameComplete = true;

  clearAnswerEffect();

  answerForm.classList.add("hidden");
  spinButton.classList.add("hidden");
  continueButton.classList.add("hidden");

  answerFeedback.textContent = "";
  questionText.textContent =
    "Game complete";

  updateAnswerAffixes(null);

  finalResult.classList.remove("hidden");

  renderScoreboard();

  if (settings.playerCount === 1) {
    finalResult.textContent =
      `Final score: ${scores[0]}`;

    return;
  }

  const highestScore = Math.max(
    ...scores
  );

  const winners = scores
    .map((score, index) => {
      return {
        score,
        index
      };
    })
    .filter((team) => {
      return team.score === highestScore;
    })
    .map((team) => {
      return `Team ${team.index + 1}`;
    });

  if (winners.length === 1) {
    finalResult.textContent =
      `${winners[0]} wins with ` +
      `${highestScore} points!`;

    return;
  }

  finalResult.textContent =
    `${joinNames(winners)} tie with ` +
    `${highestScore} points!`;
}

function renderRoundInformation() {
  roundDisplay.textContent =
    `Round ${currentRound} of ` +
    `${settings.roundCount}`;

  if (settings.playerCount === 1) {
    currentPlayerLabel.textContent =
      "Your question";

    return;
  }

  currentPlayerLabel.textContent =
    `Team ${currentTeamIndex + 1}’s ` +
    "question";
}

function renderScoreboard() {
  scoreboard.innerHTML = "";

  scores.forEach((score, teamIndex) => {
    const theme =
      settings.playerCount === 1
        ? SOLO_TABLE_THEME
        : TEAM_COLOURS[teamIndex];

    const scoreCard =
      document.createElement("div");

    scoreCard.className =
      "wheel-score-card";

    scoreCard.classList.toggle(
      "current",
      !gameComplete &&
        teamIndex === currentTeamIndex
    );

    scoreCard.style.setProperty(
      "--score-colour",
      theme.accent
    );

    const name =
      document.createElement("span");

    name.textContent =
      settings.playerCount === 1
        ? "Score"
        : `Team ${teamIndex + 1}`;

    const value =
      document.createElement("strong");

    value.textContent = String(score);

    scoreCard.append(name, value);
    scoreboard.appendChild(scoreCard);
  });
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

function showRoundAnnouncement(onComplete) {
  clearRoundAnnouncement();

  roundAnnouncementText.textContent =
    getRoundAnnouncementText();

  roundAnnouncement.classList.remove(
    "hidden",
    "is-showing",
    "is-leaving"
  );

  void roundAnnouncement.offsetWidth;

  roundAnnouncement.classList.add(
    "is-showing"
  );

  roundAnnouncementTimer =
    window.setTimeout(() => {
      roundAnnouncement.classList.remove(
        "is-showing"
      );

      roundAnnouncement.classList.add(
        "is-leaving"
      );

      roundAnnouncementExitTimer =
        window.setTimeout(() => {
          roundAnnouncement.classList.add(
            "hidden"
          );

          roundAnnouncement.classList.remove(
            "is-leaving"
          );

          if (typeof onComplete === "function") {
            onComplete();
          }
        }, ROUND_ANNOUNCEMENT_EXIT_DURATION);
    }, ROUND_ANNOUNCEMENT_DURATION);
}

function clearRoundAnnouncement() {
  if (roundAnnouncementTimer !== null) {
    window.clearTimeout(
      roundAnnouncementTimer
    );

    roundAnnouncementTimer = null;
  }

  if (
    roundAnnouncementExitTimer !== null
  ) {
    window.clearTimeout(
      roundAnnouncementExitTimer
    );

    roundAnnouncementExitTimer = null;
  }

  roundAnnouncement.classList.add(
    "hidden"
  );

  roundAnnouncement.classList.remove(
    "is-showing",
    "is-leaving"
  );
}

function getRoundAnnouncementText() {
  if (
    currentRound === settings.roundCount
  ) {
    return "Final Round";
  }

  const word =
    ROUND_WORDS[currentRound] ||
    String(currentRound);

  return `Round ${word}`;
}

function getWheelSegments(
  roundNumber,
  totalRounds
) {
  const progress =
    totalRounds <= 1
      ? 1
      : (
          roundNumber - 1
        ) / (
          totalRounds - 1
        );

  if (progress < 0.34) {
    return createOpeningSegments();
  }

  if (progress < 0.67) {
    return createBuildingSegments();
  }

  if (progress < 0.9) {
    return createRiskySegments();
  }

  return createFinalSegments();
}

function createOpeningSegments() {
  return createWeightedWheel({
    totalSegments: 14,

    topSegment:
      extraSpinSegment(),

    bottomSegment:
      multiplyTwoSegment(),

    addValues: [
      1,
      1,
      2,
      2,
      3,
      3,
      4,
      4
    ],

    subtractValues: [
      1,
      1,
      2,
      2
    ]
  });
}

function createBuildingSegments() {
  return createWeightedWheel({
    totalSegments: 16,

    topSegment:
      extraSpinSegment(),

    bottomSegment:
      multiplyTwoSegment(),

    addValues: [
      2,
      3,
      3,
      4,
      4,
      5,
      5,
      6,
      7,
      8
    ],

    subtractValues: [
      1,
      2,
      3,
      4,
      5
    ]
  });
}

function createRiskySegments() {
  return createWeightedWheel({
    totalSegments: 18,

    topSegment:
      extraSpinSegment(),

    bottomSegment:
      multiplyThreeSegment(),

    specialSegments: [
      {
        index: 5,
        segment:
          multiplyTwoSegment()
      },
      {
        index: 14,
        segment:
          multiplyZeroSegment()
      }
    ],

    addValues: [
      4,
      5,
      5,
      6,
      7,
      8,
      9,
      10,
      12,
      15
    ],

    subtractValues: [
      3,
      4,
      5,
      6,
      8
    ]
  });
}

function createFinalSegments() {
  return createWeightedWheel({
    totalSegments: 20,

    topSegment:
      extraSpinSegment(),

    bottomSegment:
      multiplyThreeSegment(),

    specialSegments: [
      {
        index: 5,
        segment:
          multiplyTwoSegment()
      },
      {
        index: 15,
        segment:
          multiplyZeroSegment()
      }
    ],

    addValues: [
      5,
      7,
      8,
      10,
      12,
      15,
      18,
      20,
      25,
      30,
      35
    ],

    subtractValues: [
      5,
      7,
      10,
      12,
      15
    ]
  });
}

function createWeightedWheel({
  totalSegments,
  topSegment,
  bottomSegment,
  specialSegments = [],
  addValues,
  subtractValues,
  regularPattern = [
    "add",
    "subtract",
    "add"
  ]
}) {
  const segments = Array(
    totalSegments
  ).fill(null);

  segments[0] = topSegment;

  segments[
    totalSegments / 2
  ] = bottomSegment;

  specialSegments.forEach(
    ({ index, segment }) => {
      if (
        index >= 0 &&
        index < totalSegments &&
        segments[index] === null
      ) {
        segments[index] = segment;
      }
    }
  );

  let patternIndex = 0;
  let additionIndex = 0;
  let subtractionIndex = 0;

  for (
    let index = 0;
    index < segments.length;
    index++
  ) {
    if (segments[index] !== null) {
      continue;
    }

    const segmentType =
      regularPattern[
        patternIndex %
        regularPattern.length
      ];

    patternIndex++;

    if (segmentType === "subtract") {
      const value =
        subtractValues[
          subtractionIndex %
          subtractValues.length
        ];

      segments[index] =
        subtractSegment(value);

      subtractionIndex++;
      continue;
    }

    const value =
      addValues[
        additionIndex %
        addValues.length
      ];

    segments[index] =
      addSegment(value);

    additionIndex++;
  }

  return segments;
}

function addSegment(value) {
  return {
    label: `+${value}`,
    type: "add",
    value,
    colour: SEGMENT_COLOURS.add,
    textColour: "#ffffff"
  };
}

function subtractSegment(value) {
  return {
    label: `−${value}`,
    type: "subtract",
    value,
    colour: SEGMENT_COLOURS.subtract,
    textColour: "#ffffff"
  };
}

function multiplyTwoSegment() {
  return {
    label: "×2",
    type: "multiplyTwo",
    value: 2,
    colour:
      SEGMENT_COLOURS.multiplyTwo,
    textColour: "#ffffff"
  };
}

function multiplyThreeSegment() {
  return {
    label: "×3",
    type: "multiplyThree",
    value: 3,
    colour:
      SEGMENT_COLOURS.multiplyThree,
    textColour: "#181300"
  };
}

function multiplyZeroSegment() {
  return {
    label: "×0",
    type: "multiplyZero",
    value: 0,
    colour:
      SEGMENT_COLOURS.multiplyZero,
    glowColour: "#6f7a8b",
    textColour: "#ffffff"
  };
}

function extraSpinSegment() {
  return {
    label: "+5 ↻",
    type: "extra",
    value: 5,
    colour: SEGMENT_COLOURS.extra,
    textColour: "#ffffff"
  };
}

function buildWheel(segments) {
  wheelSvg.innerHTML = "";

  const centre = 250;
  const radius = 232;
  const textRadius = 164;

  const sliceAngle =
    360 / segments.length;

  const startOffset =
    -90 - sliceAngle / 2;

  const labelFontSize =
    segments.length >= 20
      ? 21
      : segments.length >= 18
        ? 23
        : segments.length >= 16
          ? 25
          : 27;

  wheelSvg.style.setProperty(
    "--wheel-label-size",
    `${labelFontSize}px`
  );

  segments.forEach(
    (segment, index) => {
      const middleAngle =
        -90 + index * sliceAngle;

      const startAngle =
        startOffset +
        index * sliceAngle;

      const endAngle =
        startAngle + sliceAngle;

      const path =
        document.createElementNS(
          SVG_NAMESPACE,
          "path"
        );

      path.setAttribute(
        "d",
        createSlicePath(
          centre,
          centre,
          radius,
          startAngle,
          endAngle
        )
      );

      path.setAttribute(
        "fill",
        segment.colour
      );

      path.setAttribute(
        "stroke",
        "#000000"
      );

      path.setAttribute(
        "stroke-width",
        "4"
      );

      path.setAttribute(
        "stroke-linejoin",
        "round"
      );

      wheelSvg.appendChild(path);

      const labelPosition =
        polarPoint(
          centre,
          centre,
          textRadius,
          middleAngle
        );

      const label =
        document.createElementNS(
          SVG_NAMESPACE,
          "text"
        );

      label.setAttribute(
        "x",
        labelPosition.x
      );

      label.setAttribute(
        "y",
        labelPosition.y
      );

      label.setAttribute(
        "text-anchor",
        "middle"
      );

      label.setAttribute(
        "dominant-baseline",
        "middle"
      );

      label.setAttribute(
        "class",
        "wheel-segment-label"
      );

      label.setAttribute(
        "transform",
        `rotate(${middleAngle} ` +
        `${labelPosition.x} ` +
        `${labelPosition.y})`
      );

      label.textContent =
        segment.label;

      wheelSvg.appendChild(label);
    }
  );
}

function createSlicePath(
  centreX,
  centreY,
  radius,
  startAngle,
  endAngle
) {
  const start = polarPoint(
    centreX,
    centreY,
    radius,
    startAngle
  );

  const end = polarPoint(
    centreX,
    centreY,
    radius,
    endAngle
  );

  const largeArcFlag =
    endAngle - startAngle > 180
      ? 1
      : 0;

  return [
    `M ${centreX} ${centreY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius}`,
    `0 ${largeArcFlag} 1`,
    `${end.x} ${end.y}`,
    "Z"
  ].join(" ");
}

function polarPoint(
  centreX,
  centreY,
  radius,
  angleInDegrees
) {
  const radians =
    angleInDegrees *
    Math.PI /
    180;

  return {
    x:
      centreX +
      radius * Math.cos(radians),

    y:
      centreY +
      radius * Math.sin(radians)
  };
}

function normaliseAngle(angle) {
  return (
    (angle % 360) + 360
  ) % 360;
}

function resetWheelRotation() {
  wheelRotation = 0;

  wheelSpinner.style.transition =
    "none";

  wheelSpinner.style.transform =
    "rotate(0deg)";

  void wheelSpinner.offsetWidth;

  wheelSpinner.style.transition =
    "none";
}

function clearPendingSpinTimer() {
  if (pendingSpinTimer !== null) {
    window.clearTimeout(
      pendingSpinTimer
    );

    pendingSpinTimer = null;
  }
}

function randomChoice(array) {
  return array[
    randomInt(0, array.length - 1)
  ];
}

function randomInt(
  minimum,
  maximum
) {
  return Math.floor(
    Math.random() *
    (
      maximum -
      minimum +
      1
    )
  ) + minimum;
}

function joinNames(names) {
  if (names.length <= 1) {
    return names[0] || "";
  }

  if (names.length === 2) {
    return (
      `${names[0]} and ${names[1]}`
    );
  }

  return (
    `${names.slice(0, -1).join(", ")} ` +
    `and ${names[names.length - 1]}`
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