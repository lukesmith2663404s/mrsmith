const PAIRS_SETTINGS_KEY = "pairsGameSettings";
const PAIRS_SETTINGS_VERSION = 2;

const DEFAULT_PAIRS_SETTINGS = {
  settingsVersion: PAIRS_SETTINGS_VERSION,
  pairCount: 8,
  mode: "equivalent-fractions",
  difficulty: "easy",
  playerCount: 1
};

const form = document.querySelector(
  "#pairsSettingsForm"
);

const pairCountInput = document.querySelector(
  "#pairCount"
);

const modeInput = document.querySelector("#mode");

const difficultyInput = document.querySelector(
  "#difficulty"
);

const playerCountInput = document.querySelector(
  "#playerCount"
);

const modeDescription = document.querySelector(
  "#modeDescription"
);

const settingsError = document.querySelector(
  "#settingsError"
);

renderModeOptions();
renderDifficultyOptions();
loadSavedSettings();
updateModeInformation();

modeInput.addEventListener(
  "change",
  updateModeInformation
);

difficultyInput.addEventListener(
  "change",
  updateModeInformation
);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  settingsError.textContent = "";

  const mode = modeInput.value;
  const difficulty = difficultyInput.value;
  const pairCount = Number(pairCountInput.value);
  const playerCount = Number(
    playerCountInput.value
  );

  const maximumPairCount =
    PairsGenerator.getMaximumPairCount(
      mode,
      difficulty
    );

  if (
    !Number.isInteger(pairCount) ||
    pairCount < 2 ||
    pairCount > maximumPairCount
  ) {
    settingsError.textContent =
      `Choose between 2 and ${maximumPairCount} pairs.`;

    return;
  }

  if (
    !Number.isInteger(playerCount) ||
    playerCount < 1 ||
    playerCount > 8
  ) {
    settingsError.textContent =
      "Choose between 1 and 8 players or teams.";

    return;
  }

  if (!PairsGenerator.getMode(mode)) {
    settingsError.textContent =
      "Choose a valid game mode.";

    return;
  }

  if (!PairsGenerator.getDifficulty(difficulty)) {
    settingsError.textContent =
      "Choose a valid difficulty.";

    return;
  }

  const settings = {
    settingsVersion: PAIRS_SETTINGS_VERSION,
    pairCount,
    mode,
    difficulty,
    playerCount
  };

  localStorage.setItem(
    PAIRS_SETTINGS_KEY,
    JSON.stringify(settings)
  );

  window.location.href = "game.html";
});

function renderModeOptions() {
  modeInput.innerHTML = "";

  PairsGenerator.getModes().forEach((mode) => {
    const option = document.createElement("option");

    option.value = mode.id;
    option.textContent = mode.name;

    modeInput.appendChild(option);
  });
}

function renderDifficultyOptions() {
  difficultyInput.innerHTML = "";

  PairsGenerator
    .getDifficulties()
    .forEach((difficulty) => {
      const option = document.createElement("option");

      option.value = difficulty.id;
      option.textContent = difficulty.name;

      difficultyInput.appendChild(option);
    });
}

function loadSavedSettings() {
  const savedSettings = localStorage.getItem(
    PAIRS_SETTINGS_KEY
  );

  if (!savedSettings) {
    applySettings(DEFAULT_PAIRS_SETTINGS);
    return;
  }

  try {
    const parsedSettings = JSON.parse(savedSettings);

    if (
      parsedSettings.settingsVersion !==
      PAIRS_SETTINGS_VERSION
    ) {
      applySettings(DEFAULT_PAIRS_SETTINGS);
      return;
    }

    applySettings({
      ...DEFAULT_PAIRS_SETTINGS,
      ...parsedSettings
    });
  } catch {
    applySettings(DEFAULT_PAIRS_SETTINGS);
  }
}

function applySettings(settings) {
  const validMode = PairsGenerator.getMode(
    settings.mode
  );

  const validDifficulty =
    PairsGenerator.getDifficulty(
      settings.difficulty
    );

  modeInput.value = validMode
    ? settings.mode
    : DEFAULT_PAIRS_SETTINGS.mode;

  difficultyInput.value = validDifficulty
    ? settings.difficulty
    : DEFAULT_PAIRS_SETTINGS.difficulty;

  playerCountInput.value = String(
    clampNumber(settings.playerCount, 1, 8)
  );

  updatePairCountLimit();

  pairCountInput.value = clampNumber(
    settings.pairCount,
    2,
    Number(pairCountInput.max)
  );

  updateModeDescription();
}

function updateModeInformation() {
  updatePairCountLimit();
  updateModeDescription();
}

function updatePairCountLimit() {
  const maximumPairCount =
    PairsGenerator.getMaximumPairCount(
      modeInput.value,
      difficultyInput.value
    );

  pairCountInput.max = String(maximumPairCount);

  if (Number(pairCountInput.value) > maximumPairCount) {
    pairCountInput.value = String(maximumPairCount);
  }
}

function updateModeDescription() {
  const selectedMode = PairsGenerator.getMode(
    modeInput.value
  );

  const selectedDifficulty =
    PairsGenerator.getDifficulty(
      difficultyInput.value
    );

  const maximumPairCount =
    PairsGenerator.getMaximumPairCount(
      modeInput.value,
      difficultyInput.value
    );

  const descriptions = [];

  if (selectedMode) {
    descriptions.push(selectedMode.description);
  }

  if (selectedDifficulty) {
    descriptions.push(selectedDifficulty.description);
  }

  if (maximumPairCount < 18) {
    descriptions.push(
      `This option supports up to ${maximumPairCount} pairs.`
    );
  }

  modeDescription.textContent =
    descriptions.join(" ");
}

function clampNumber(value, minimum, maximum) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return minimum;
  }

  return Math.min(
    maximum,
    Math.max(minimum, Math.round(numericValue))
  );
}