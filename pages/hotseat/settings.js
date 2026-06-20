const HOTSEAT_SETTINGS_KEY = "hotseatSettings";
const HOTSEAT_GAME_STATE_KEY = "hotseatGameState";
const HOTSEAT_CHANNEL_NAME = "hotseatGameChannel";
const HOTSEAT_SETTINGS_VERSION = 3;

const DEFAULT_HOTSEAT_SETTINGS = {
  settingsVersion: HOTSEAT_SETTINGS_VERSION,
  itemCount: 6,
  teamCount: 2,
  timerEnabled: true,
  timerDuration: 60,
  selectedCategoryIds: []
};

const TEAM_THEMES = [
  {
    name: "Blue",
    accent: "#60a5fa",
    dark: "#061a38",
    mid: "#0b3974",
    light: "#1558b0"
  },
  {
    name: "Red",
    accent: "#f87171",
    dark: "#350a0d",
    mid: "#74151d",
    light: "#ad2828"
  },
  {
    name: "Cyan",
    accent: "#67e8f9",
    dark: "#06343d",
    mid: "#056878",
    light: "#078fa7"
  },
  {
    name: "Pink",
    accent: "#f9a8d4",
    dark: "#3d0c29",
    mid: "#78194d",
    light: "#b92f78"
  },
  {
    name: "Green",
    accent: "#86efac",
    dark: "#062c19",
    mid: "#09582f",
    light: "#168647"
  },
  {
    name: "Orange",
    accent: "#fdba74",
    dark: "#3c1803",
    mid: "#743305",
    light: "#b95a0b"
  },
  {
    name: "Yellow",
    accent: "#fde96e",
    dark: "#3b3000",
    mid: "#796100",
    light: "#b89400"
  },
  {
    name: "Light Purple",
    accent: "#d8b4fe",
    dark: "#291941",
    mid: "#503478",
    light: "#8060ac"
  }
];

const channel = "BroadcastChannel" in window
  ? new BroadcastChannel(HOTSEAT_CHANNEL_NAME)
  : null;

let settings = loadSettings();
let previewItems = [];
let displayWindow = null;
let currentGameState = loadGameState();
let previewFitAnimationFrame = null;

const form = document.querySelector("#hotseatSettingsForm");
const itemCountInput = document.querySelector("#itemCountInput");
const teamCountSelect = document.querySelector("#teamCountSelect");
const timerEnabledInput = document.querySelector("#timerEnabledInput");
const timerDurationInput = document.querySelector("#timerDurationInput");
const categoryChecklist = document.querySelector("#categoryChecklist");
const settingsMessage = document.querySelector("#settingsMessage");
const previewGrid = document.querySelector("#previewGrid");
const previewButton = document.querySelector("#previewButton");
const startRoundButton = document.querySelector("#startRoundButton");
const openDisplayButton = document.querySelector("#openDisplayButton");
const newGameButton = document.querySelector("#newGameButton");
const selectMathsButton = document.querySelector("#selectMathsButton");
const selectAllButton = document.querySelector("#selectAllButton");
const clearAllButton = document.querySelector("#clearAllButton");
const nextRoundDisplay = document.querySelector("#nextRoundDisplay");
const nextTeamDisplay = document.querySelector("#nextTeamDisplay");
const controllerScoreboard = document.querySelector("#controllerScoreboard");
const roundStatusMessage = document.querySelector("#roundStatusMessage");

buildTeamOptions();
buildCategoryChecklist();
applySettingsToForm();
renderControllerState();

form.addEventListener("change", handleSettingsChange);
form.addEventListener("input", handleSettingsChange);
previewButton.addEventListener("click", preparePreview);
startRoundButton.addEventListener("click", startRound);
openDisplayButton.addEventListener("click", openDisplay);
newGameButton.addEventListener("click", resetGame);
selectMathsButton.addEventListener("click", selectMathsCategories);
selectAllButton.addEventListener("click", selectAllCategories);
clearAllButton.addEventListener("click", clearAllCategories);
window.addEventListener("resize", schedulePreviewTextFitting);

window.addEventListener("storage", (event) => {
  if (event.key !== HOTSEAT_GAME_STATE_KEY) {
    return;
  }

  currentGameState = loadGameState();
  renderControllerState();
});

if (channel) {
  channel.addEventListener("message", (event) => {
    if (event.data?.type !== "state-updated") {
      return;
    }

    currentGameState = event.data.state || loadGameState();
    renderControllerState();
  });
}

function buildTeamOptions() {
  teamCountSelect.innerHTML = "";

  for (let count = 1; count <= 8; count++) {
    const option = document.createElement("option");
    option.value = String(count);
    option.textContent = count === 1
      ? "1 team"
      : `${count} teams`;
    teamCountSelect.appendChild(option);
  }
}

function buildCategoryChecklist() {
  categoryChecklist.innerHTML = "";

  const groups = ClueItemGenerator.getGroups();

  groups.forEach((group) => {
    const groupSection = document.createElement("section");
    groupSection.className = "hotseat-category-group";

    const heading = document.createElement("h3");
    heading.textContent = group.name;
    groupSection.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "hotseat-category-grid";

    ClueItemGenerator.getCategories(group.id).forEach((category) => {
      const label = document.createElement("label");
      label.className = "hotseat-category-option";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "category";
      input.value = category.id;
      input.dataset.groupId = group.id;

      const text = document.createElement("span");
      text.textContent = category.name;

      label.append(input, text);
      grid.appendChild(label);
    });

    groupSection.appendChild(grid);
    categoryChecklist.appendChild(groupSection);
  });
}

function getDefaultMathsCategoryIds() {
  return ClueItemGenerator
    .getCategories("mathematics")
    .map((category) => category.id);
}

function loadSettings() {
  const defaults = {
    ...DEFAULT_HOTSEAT_SETTINGS,
    selectedCategoryIds: getDefaultMathsCategoryIds()
  };

  try {
    const saved = JSON.parse(
      localStorage.getItem(HOTSEAT_SETTINGS_KEY) || "null"
    );

    if (
      !saved ||
      saved.settingsVersion !== HOTSEAT_SETTINGS_VERSION
    ) {
      return defaults;
    }

    const validCategoryIds = new Set(
      ClueItemGenerator.getCategories().map((category) => category.id)
    );

    const selectedCategoryIds = Array.isArray(saved.selectedCategoryIds)
      ? saved.selectedCategoryIds.filter((id) => validCategoryIds.has(id))
      : [];

    return {
      ...defaults,
      ...saved,
      itemCount: clampNumber(saved.itemCount, 4, 20),
      teamCount: clampNumber(saved.teamCount, 1, 8),
      timerDuration: clampNumber(saved.timerDuration, 10, 600),
      timerEnabled: saved.timerEnabled !== false,
      selectedCategoryIds: selectedCategoryIds.length > 0
        ? selectedCategoryIds
        : getDefaultMathsCategoryIds()
    };
  } catch {
    return defaults;
  }
}

function saveSettings() {
  localStorage.setItem(
    HOTSEAT_SETTINGS_KEY,
    JSON.stringify(settings)
  );
}

function applySettingsToForm() {
  itemCountInput.value = String(settings.itemCount);
  teamCountSelect.value = String(settings.teamCount);
  timerEnabledInput.checked = settings.timerEnabled;
  timerDurationInput.value = String(settings.timerDuration);
  timerDurationInput.disabled = !settings.timerEnabled;

  categoryChecklist
    .querySelectorAll('input[name="category"]')
    .forEach((input) => {
      input.checked = settings.selectedCategoryIds.includes(input.value);
    });
}

function handleSettingsChange() {
  settings = readSettingsFromForm();
  saveSettings();
  timerDurationInput.disabled = !settings.timerEnabled;
  clearMessage();

  if (
    currentGameState &&
    currentGameState.teamCount !== settings.teamCount
  ) {
    roundStatusMessage.textContent =
      "Changing the number of teams will reset the game when the next round starts.";
  }

  renderControllerState();
}

function readSettingsFromForm() {
  const selectedCategoryIds = [
    ...categoryChecklist.querySelectorAll(
      'input[name="category"]:checked'
    )
  ].map((input) => input.value);

  return {
    settingsVersion: HOTSEAT_SETTINGS_VERSION,
    itemCount: clampNumber(itemCountInput.value, 4, 20),
    teamCount: clampNumber(teamCountSelect.value, 1, 8),
    timerEnabled: timerEnabledInput.checked,
    timerDuration: clampNumber(timerDurationInput.value, 10, 600),
    selectedCategoryIds
  };
}

function selectMathsCategories() {
  categoryChecklist
    .querySelectorAll('input[name="category"]')
    .forEach((input) => {
      input.checked = input.dataset.groupId === "mathematics";
    });

  handleSettingsChange();
}

function selectAllCategories() {
  categoryChecklist
    .querySelectorAll('input[name="category"]')
    .forEach((input) => {
      input.checked = true;
    });

  handleSettingsChange();
}

function clearAllCategories() {
  categoryChecklist
    .querySelectorAll('input[name="category"]')
    .forEach((input) => {
      input.checked = false;
    });

  handleSettingsChange();
}

async function preparePreview() {
  settings = readSettingsFromForm();
  saveSettings();
  clearMessage();

  if (settings.selectedCategoryIds.length === 0) {
    showMessage("Select at least one category.");
    return;
  }

  setPreviewButtonsDisabled(true);
  previewGrid.innerHTML = '<p class="hotseat-preview-empty">Preparing prompts…</p>';

  try {
    previewItems = ClueItemGenerator.generateHotseatRound(
      settings.itemCount,
      {
        categoryIds: settings.selectedCategoryIds,
        requireCategoryVariety: true,
        avoidSameFamily: true,
        minimumRecognisability: "medium",
        maximumDifficulty: "hard"
      }
    );

    previewItems = await replaceUnavailableImages(previewItems);
    await renderPreviewItems(previewItems);
  } catch (error) {
    previewItems = [];
    previewGrid.innerHTML = '<p class="hotseat-preview-empty">No preview available.</p>';
    showMessage(error.message);
  } finally {
    setPreviewButtonsDisabled(false);
  }
}

async function renderPreviewItems(items) {
  previewGrid.innerHTML = "";

  for (const [index, entry] of items.entries()) {
    const card = document.createElement("article");
    card.className = "hotseat-preview-card";
    card.dataset.previewIndex = String(index);

    const replaceButton = document.createElement("button");
    replaceButton.type = "button";
    replaceButton.className = "hotseat-preview-replace";
    replaceButton.textContent = "↻ Replace";
    replaceButton.setAttribute(
      "aria-label",
      `Replace ${entry.label}`
    );

    replaceButton.addEventListener("click", async () => {
      await replacePreviewItem(index, replaceButton);
    });

    const visual = document.createElement("div");
    visual.className = "hotseat-preview-visual";

    await ClueItemGenerator.renderItem(entry, visual, {
      showLabel: false,
      lazy: false,
      includeAltText: false,
      imageWidth: 500
    });

    const label = document.createElement("strong");
    label.textContent = entry.label;

    const category = ClueItemGenerator
      .getCategories()
      .find((item) => item.id === entry.categoryId);

    const meta = document.createElement("span");
    meta.textContent = category?.name || entry.categoryId;

    card.append(replaceButton, visual, label, meta);
    previewGrid.appendChild(card);
  }

  schedulePreviewTextFitting();

  previewGrid
    .querySelectorAll("img")
    .forEach((image) => {
      if (!image.complete) {
        image.addEventListener(
          "load",
          schedulePreviewTextFitting,
          { once: true }
        );
      }
    });
}

async function replacePreviewItem(index, button) {
  const currentItem = previewItems[index];

  if (!currentItem) {
    return;
  }

  settings = readSettingsFromForm();
  saveSettings();
  clearMessage();

  button.disabled = true;
  button.closest(".hotseat-preview-card")?.classList.add("is-replacing");

  try {
    const replacement = await getRandomUsableReplacement(
      index,
      previewItems
    );

    previewItems[index] = replacement;
    await renderPreviewItems(previewItems);
  } catch (error) {
    showMessage(error.message);
    button.disabled = false;
    button.closest(".hotseat-preview-card")?.classList.remove("is-replacing");
  }
}

async function replaceUnavailableImages(items) {
  const result = [...items];
  const failedIds = new Set();

  for (let index = 0; index < result.length; index++) {
    const entry = result[index];

    if (entry.displayType !== "image") {
      continue;
    }

    try {
      await ClueItemGenerator.resolveImageAsset(entry, {
        imageWidth: 500
      });
    } catch {
      failedIds.add(entry.id);
      result[index] = await getRandomUsableReplacement(
        index,
        result,
        failedIds
      );
    }
  }

  return result;
}

async function getRandomUsableReplacement(
  index,
  items,
  additionalExcludedIds = new Set()
) {
  const currentItem = items[index];
  const strictExcludedIds = new Set(
    items.map((entry) => entry.id)
  );

  additionalExcludedIds.forEach((id) => {
    strictExcludedIds.add(id);
  });

  const relaxedExcludedIds = new Set([
    currentItem.id,
    ...additionalExcludedIds
  ]);

  const exclusionSets = [
    strictExcludedIds,
    relaxedExcludedIds
  ];

  for (const excludedIds of exclusionSets) {
    const candidates = ClueItemGenerator.getItems({
      categoryIds: settings.selectedCategoryIds,
      excludeIds: [...excludedIds],
      minimumRecognisability: "medium",
      maximumDifficulty: "hard"
    });

    while (candidates.length > 0) {
      const candidateIndex = Math.floor(
        Math.random() * candidates.length
      );

      const [candidate] = candidates.splice(
        candidateIndex,
        1
      );

      if (additionalExcludedIds.has(candidate.id)) {
        continue;
      }

      if (candidate.displayType !== "image") {
        return candidate;
      }

      try {
        await ClueItemGenerator.resolveImageAsset(candidate, {
          imageWidth: 500
        });

        return candidate;
      } catch {
        additionalExcludedIds.add(candidate.id);
      }
    }
  }

  throw new Error(
    "No other usable item could be found in the selected categories."
  );
}

function schedulePreviewTextFitting() {
  if (previewFitAnimationFrame !== null) {
    window.cancelAnimationFrame(
      previewFitAnimationFrame
    );
  }

  previewFitAnimationFrame =
    window.requestAnimationFrame(() => {
      previewFitAnimationFrame = null;
      fitPreviewText();
    });
}

function fitPreviewText() {
  previewGrid
    .querySelectorAll(
      ".hotseat-preview-visual"
    )
    .forEach((container) => {
      const visual = container.querySelector(
        ".clue-item-visual"
      );

      if (!visual) {
        return;
      }

      const displayType =
        container.dataset.displayType ||
        "";

      if (
        displayType !== "text" &&
        displayType !== "symbol" &&
        !visual.classList.contains(
          "clue-item-image-fallback"
        )
      ) {
        return;
      }

      fitPreviewTextElement(visual);
    });
}

function fitPreviewTextElement(element) {
  fitTextUsingCanvas(element, {
    minimumFontSize: 12,
    maximumFontSize: 72,
    widthPadding: 14,
    heightScale: 0.72
  });
}

function fitTextUsingCanvas(
  element,
  {
    minimumFontSize,
    maximumFontSize,
    widthPadding,
    heightScale
  }
) {
  const text = element.textContent.trim();

  if (!text) {
    return;
  }

  const availableWidth = Math.max(
    1,
    element.clientWidth - widthPadding
  );

  const availableHeight = Math.max(
    1,
    element.clientHeight - widthPadding
  );

  const styles = window.getComputedStyle(element);
  const canvas = fitTextUsingCanvas.canvas ||
    (fitTextUsingCanvas.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  const testSize = 100;

  context.font = `${styles.fontWeight} ${testSize}px ${styles.fontFamily}`;

  const measuredWidth = Math.max(
    1,
    context.measureText(text).width
  );

  const widthSize =
    testSize * availableWidth / measuredWidth;

  const heightSize =
    availableHeight * heightScale;

  const fittedSize = Math.min(
    maximumFontSize,
    widthSize * 0.94,
    heightSize
  );

  element.style.whiteSpace = "nowrap";
  element.style.lineHeight = "0.95";
  element.style.fontSize =
    `${Math.max(minimumFontSize, fittedSize)}px`;
}

async function startRound() {
  settings = readSettingsFromForm();
  saveSettings();
  clearMessage();

  if (settings.selectedCategoryIds.length === 0) {
    showMessage("Select at least one category.");
    return;
  }

  if (currentGameState?.roundActive) {
    showMessage("The current round is still active.");
    return;
  }

  if (previewItems.length === 0) {
    await preparePreview();
  }

  if (previewItems.length === 0) {
    return;
  }

  const previousState = loadGameState();
  const teamCountChanged =
    previousState && previousState.teamCount !== settings.teamCount;

  const scores = teamCountChanged || !previousState
    ? Array(settings.teamCount).fill(0)
    : resizeScores(previousState.scores, settings.teamCount);

  const roundNumber = teamCountChanged || !previousState
    ? 1
    : previousState.roundNumber + 1;

  const currentTeamIndex = teamCountChanged || !previousState
    ? 0
    : (previousState.currentTeamIndex + 1) % settings.teamCount;

  const state = {
    version: 1,
    roundToken: createToken(),
    roundNumber,
    currentTeamIndex,
    teamCount: settings.teamCount,
    scores,
    itemIds: previewItems.map((entry) => entry.id),
    completedItemIds: [],
    roundPoints: 0,
    roundActive: true,
    timerEnabled: settings.timerEnabled,
    timerDuration: settings.timerDuration,
    roundStartedAt: Date.now(),
    endedReason: null
  };

  saveGameState(state);
  currentGameState = state;

  channel?.postMessage({
    type: "start-round",
    state
  });

  openDisplay();

  previewItems = [];
  previewGrid.innerHTML =
    '<p class="hotseat-preview-empty">Round sent to the classroom display. You can preview the next round while this one is running.</p>';

  renderControllerState();
}

function openDisplay() {
  if (!displayWindow || displayWindow.closed) {
    displayWindow = window.open(
      "game.html",
      "hotseatDisplay"
    );
  } else {
    displayWindow.focus();
  }

  if (!displayWindow) {
    showMessage(
      "The display window was blocked. Allow pop-ups for this site and press Open Display again."
    );
  }
}

function resetGame() {
  const confirmed = window.confirm(
    "Start a new game and reset every team score to zero?"
  );

  if (!confirmed) {
    return;
  }

  settings = readSettingsFromForm();
  saveSettings();

  const state = {
    version: 1,
    roundToken: createToken(),
    roundNumber: 0,
    currentTeamIndex: settings.teamCount - 1,
    teamCount: settings.teamCount,
    scores: Array(settings.teamCount).fill(0),
    itemIds: [],
    completedItemIds: [],
    roundPoints: 0,
    roundActive: false,
    timerEnabled: settings.timerEnabled,
    timerDuration: settings.timerDuration,
    roundStartedAt: null,
    endedReason: "reset"
  };

  saveGameState(state);
  currentGameState = state;
  previewItems = [];

  previewGrid.innerHTML =
    '<p class="hotseat-preview-empty">Press Preview to prepare Round 1.</p>';

  channel?.postMessage({
    type: "reset-game",
    state
  });

  renderControllerState();
}

function renderControllerState() {
  const state = currentGameState;
  const teamCountChanged = state && state.teamCount !== settings.teamCount;

  let nextRound = 1;
  let nextTeamIndex = 0;
  let scores = Array(settings.teamCount).fill(0);

  if (state && !teamCountChanged) {
    scores = resizeScores(state.scores, settings.teamCount);

    if (state.roundActive) {
      nextRound = state.roundNumber;
      nextTeamIndex = state.currentTeamIndex;
    } else {
      nextRound = state.roundNumber + 1;
      nextTeamIndex = (state.currentTeamIndex + 1) % settings.teamCount;
    }
  }

  nextRoundDisplay.textContent = `Round ${nextRound}`;
  nextTeamDisplay.textContent = settings.teamCount === 1
    ? "One Team"
    : `Team ${nextTeamIndex + 1}`;

  controllerScoreboard.innerHTML = "";

  scores.forEach((score, index) => {
    const theme = settings.teamCount === 1
      ? TEAM_THEMES[1]
      : TEAM_THEMES[index];

    const card = document.createElement("div");
    card.className = "hotseat-controller-score";
    card.style.setProperty("--team-accent", theme.accent);

    const name = document.createElement("span");
    name.textContent = settings.teamCount === 1
      ? "Score"
      : `Team ${index + 1}`;

    const value = document.createElement("strong");
    value.textContent = String(score);

    card.append(name, value);
    controllerScoreboard.appendChild(card);
  });

  const isActive = Boolean(state?.roundActive && !teamCountChanged);
  startRoundButton.disabled = isActive;
  startRoundButton.textContent = isActive
    ? "Round in Progress"
    : "Start Round";

  if (teamCountChanged) {
    roundStatusMessage.textContent =
      "The team count has changed. Starting the next round will begin a new game with scores reset to zero.";
  } else if (isActive) {
    roundStatusMessage.textContent =
      `Round ${state.roundNumber} is live for ${settings.teamCount === 1 ? "the team" : `Team ${state.currentTeamIndex + 1}`}.`;
  } else if (state?.roundNumber > 0) {
    roundStatusMessage.textContent =
      `Round ${state.roundNumber} finished with ${state.roundPoints || 0} point${state.roundPoints === 1 ? "" : "s"} scored.`;
  } else {
    roundStatusMessage.textContent =
      "The classroom display will remain on standby until a round starts.";
  }
}

function setPreviewButtonsDisabled(disabled) {
  previewButton.disabled = disabled;
}

function loadGameState() {
  try {
    return JSON.parse(
      localStorage.getItem(HOTSEAT_GAME_STATE_KEY) || "null"
    );
  } catch {
    return null;
  }
}

function saveGameState(state) {
  localStorage.setItem(
    HOTSEAT_GAME_STATE_KEY,
    JSON.stringify(state)
  );
}

function resizeScores(scores, teamCount) {
  return Array.from({ length: teamCount }, (_, index) => {
    const value = Number(scores?.[index]);
    return Number.isFinite(value) ? value : 0;
  });
}

function createToken() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function clampNumber(value, minimum, maximum) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return minimum;
  }

  return Math.min(
    maximum,
    Math.max(minimum, Math.round(number))
  );
}

function showMessage(message) {
  settingsMessage.textContent = message;
}

function clearMessage() {
  settingsMessage.textContent = "";
}
