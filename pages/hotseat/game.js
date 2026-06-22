const HOTSEAT_GAME_STATE_KEY = "hotseatGameState";
const HOTSEAT_CHANNEL_NAME = "hotseatGameChannel";

const SOLO_HOT_THEME = {
  accent: "#ff6b35",
  dark: "#210000",
  mid: "#640b08",
  light: "#bd2b12"
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

let gameState = null;
let activeRoundToken = null;
let timerInterval = null;
let endingRound = false;
let fitAnimationFrame = null;

const roundHeading = document.querySelector("#roundHeading");
const displayScoreboard = document.querySelector("#displayScoreboard");
const timerDisplay = document.querySelector("#timerDisplay");
const standbyPanel = document.querySelector("#standbyPanel");
const roundPanel = document.querySelector("#roundPanel");
const promptGrid = document.querySelector("#promptGrid");
const displayMessage = document.querySelector("#displayMessage");
const endRoundButton = document.querySelector("#endRoundButton");
const roundCompleteOverlay = document.querySelector("#roundCompleteOverlay");
const roundCompleteHeading = document.querySelector("#roundCompleteHeading");
const roundCompleteSummary = document.querySelector("#roundCompleteSummary");

setupEmberField();

endRoundButton.addEventListener("click", () => {
  finishRound("ended");
});

window.addEventListener("resize", schedulePromptFitting);

if ("ResizeObserver" in window) {
  const promptResizeObserver = new ResizeObserver(() => {
    schedulePromptFitting();
  });

  promptResizeObserver.observe(roundPanel);
  promptResizeObserver.observe(promptGrid);
}

window.addEventListener("storage", (event) => {
  if (event.key !== HOTSEAT_GAME_STATE_KEY) {
    return;
  }

  const state = loadGameState();
  handleIncomingState(state);
});

if (channel) {
  channel.addEventListener("message", (event) => {
    if (
      event.data?.type === "start-round" ||
      event.data?.type === "reset-game"
    ) {
      handleIncomingState(event.data.state);
    }
  });
}

handleIncomingState(loadGameState());

function handleIncomingState(state) {
  if (!state) {
    showStandby();
    return;
  }

  gameState = state;

  if (state.roundActive) {
    if (state.roundToken !== activeRoundToken) {
      renderRound(state);
    } else {
      renderScoreboard();
    }

    return;
  }

  if (state.endedReason === "reset" || state.roundNumber === 0) {
    showStandby();
    return;
  }

  renderScoreboard();

  if (state.roundToken !== activeRoundToken) {
    activeRoundToken = state.roundToken;
  }

  showRoundComplete(state.endedReason || "ended");
}

async function renderRound(state) {
  clearTimer();
  endingRound = false;
  activeRoundToken = state.roundToken;
  gameState = state;

  applyTheme();
  renderScoreboard();

  roundCompleteOverlay.classList.add("hidden");
  standbyPanel.classList.add("hidden");
  roundPanel.classList.remove("hidden");
  endRoundButton.classList.remove("hidden");

  roundHeading.textContent = state.teamCount === 1
    ? `Round ${state.roundNumber}`
    : `Round ${state.roundNumber} — Team ${state.currentTeamIndex + 1}`;

  displayMessage.textContent =
    "Click a prompt when it has been correctly described.";

  promptGrid.innerHTML = "";

  const items = state.itemIds
    .map((id) => ClueItemGenerator.getItemById(id))
    .filter(Boolean);

  const gridLayout = getGridLayout(items.length);

  promptGrid.style.setProperty(
    "--hotseat-columns",
    String(gridLayout.columns)
  );

  promptGrid.style.setProperty(
    "--hotseat-rows",
    String(gridLayout.rows)
  );

  for (const entry of items) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "hotseat-prompt-card";
    card.dataset.itemId = entry.id;

    if (state.completedItemIds.includes(entry.id)) {
      card.classList.add("is-complete");
    }

    const content = document.createElement("div");
    content.className = "hotseat-prompt-content";

    await ClueItemGenerator.renderItem(entry, content, {
      showLabel: false,
      lazy: false,
      includeAltText: false,
      imageWidth: 900
    });

    forceContainedImages(content);

    const tick = document.createElement("span");
    tick.className = "hotseat-prompt-tick";
    tick.textContent = "✓";
    tick.setAttribute("aria-hidden", "true");

    card.append(content, tick);

    card.addEventListener("click", () => {
      togglePrompt(entry.id, card);
    });

    promptGrid.appendChild(card);
  }

  schedulePromptFitting();

  promptGrid
    .querySelectorAll("img")
    .forEach((image) => {
      if (!image.complete) {
        image.addEventListener(
          "load",
          () => {
            forceContainedImages(image.parentElement || promptGrid);
            schedulePromptFitting();
          },
          { once: true }
        );
      }
    });

  updateTimerDisplay();

  if (state.timerEnabled) {
    startTimer();
  } else {
    timerDisplay.textContent = "∞";
  }

  if (state.completedItemIds.length >= state.itemIds.length) {
    finishRound("completed");
  }
}

function togglePrompt(itemId, card) {
  if (!gameState?.roundActive || endingRound) {
    return;
  }

  const completed = new Set(gameState.completedItemIds);
  const wasComplete = completed.has(itemId);

  if (wasComplete) {
    completed.delete(itemId);
    gameState.scores[gameState.currentTeamIndex] = Math.max(
      0,
      gameState.scores[gameState.currentTeamIndex] - 1
    );
    gameState.roundPoints = Math.max(0, gameState.roundPoints - 1);
  } else {
    completed.add(itemId);
    gameState.scores[gameState.currentTeamIndex] += 1;
    gameState.roundPoints += 1;
  }

  gameState.completedItemIds = [...completed];
  card.classList.toggle("is-complete", !wasComplete);

  saveAndBroadcastState();
  renderScoreboard();

  if (gameState.completedItemIds.length >= gameState.itemIds.length) {
    finishRound("completed");
  }
}

function startTimer() {
  clearTimer();

  timerInterval = window.setInterval(() => {
    updateTimerDisplay();
  }, 250);
}

function updateTimerDisplay() {
  if (!gameState) {
    timerDisplay.textContent = "1:00";
    return;
  }

  if (!gameState.timerEnabled) {
    timerDisplay.textContent = "∞";
    return;
  }

  const elapsedSeconds = Math.floor(
    (Date.now() - gameState.roundStartedAt) / 1000
  );

  const remaining = Math.max(
    0,
    gameState.timerDuration - elapsedSeconds
  );

  timerDisplay.textContent = formatTime(remaining);
  timerDisplay.classList.toggle("is-low", remaining <= 10);

  if (remaining <= 0 && gameState.roundActive) {
    finishRound("time");
  }
}

function finishRound(reason) {
  if (!gameState?.roundActive || endingRound) {
    return;
  }

  endingRound = true;
  clearTimer();

  gameState.roundActive = false;
  gameState.endedReason = reason;
  gameState.roundEndedAt = Date.now();

  saveAndBroadcastState();

  promptGrid
    .querySelectorAll(".hotseat-prompt-card")
    .forEach((card) => {
      card.disabled = true;
    });

  endRoundButton.classList.add("hidden");
  showRoundComplete(reason);
}

function showRoundComplete(reason) {
  if (!gameState || gameState.roundNumber === 0) {
    return;
  }

  roundCompleteOverlay.classList.remove("hidden");

  if (reason === "time") {
    roundCompleteHeading.textContent = "Time!";
  } else if (reason === "completed") {
    roundCompleteHeading.textContent = "All Clear!";
  } else {
    roundCompleteHeading.textContent = "Round Complete";
  }

  const teamName = gameState.teamCount === 1
    ? "The team"
    : `Team ${gameState.currentTeamIndex + 1}`;

  roundCompleteSummary.textContent =
    `${teamName} scored ${gameState.roundPoints} point${gameState.roundPoints === 1 ? "" : "s"} this round.`;

  displayMessage.textContent =
    "Prepare the next round from the teacher controls.";
}

function showStandby() {
  clearTimer();
  activeRoundToken = null;
  endingRound = false;

  document.body.style.setProperty("--team-accent", SOLO_HOT_THEME.accent);
  document.body.style.setProperty("--team-dark", SOLO_HOT_THEME.dark);
  document.body.style.setProperty("--team-mid", SOLO_HOT_THEME.mid);
  document.body.style.setProperty("--team-light", SOLO_HOT_THEME.light);
  applyEmberPalette(SOLO_HOT_THEME, true);

  roundHeading.textContent = "Waiting for a round";
  timerDisplay.textContent = "1:00";
  timerDisplay.classList.remove("is-low");
  displayScoreboard.innerHTML = "";
  promptGrid.innerHTML = "";

  standbyPanel.classList.remove("hidden");
  roundPanel.classList.add("hidden");
  endRoundButton.classList.add("hidden");
  roundCompleteOverlay.classList.add("hidden");

  displayMessage.textContent =
    "Correctly described prompts can be clicked to award points.";
}

function applyTheme() {
  const theme = gameState.teamCount === 1
    ? SOLO_HOT_THEME
    : TEAM_THEMES[gameState.currentTeamIndex];

  document.body.style.setProperty("--team-accent", theme.accent);
  document.body.style.setProperty("--team-dark", theme.dark);
  document.body.style.setProperty("--team-mid", theme.mid);
  document.body.style.setProperty("--team-light", theme.light);
  applyEmberPalette(theme, gameState.teamCount === 1);
}

function renderScoreboard() {
  displayScoreboard.innerHTML = "";

  if (!gameState) {
    return;
  }

  gameState.scores.forEach((score, index) => {
    const theme = gameState.teamCount === 1
      ? SOLO_HOT_THEME
      : TEAM_THEMES[index];

    const card = document.createElement("div");
    card.className = "hotseat-display-score";
    card.classList.toggle(
      "is-current",
      gameState.roundActive && index === gameState.currentTeamIndex
    );
    card.style.setProperty("--score-accent", theme.accent);

    const name = document.createElement("span");
    name.textContent = gameState.teamCount === 1
      ? "Score"
      : `Team ${index + 1}`;

    const value = document.createElement("strong");
    value.textContent = String(score);

    card.append(name, value);
    displayScoreboard.appendChild(card);
  });
}

function getGridLayout(itemCount) {
  let columns;

  if (itemCount <= 4) {
    columns = 2;
  } else if (itemCount <= 6) {
    columns = 3;
  } else if (itemCount <= 8) {
    columns = 4;
  } else if (itemCount === 9) {
    columns = 3;
  } else if (itemCount <= 12) {
    columns = 4;
  } else if (itemCount <= 15) {
    columns = 5;
  } else if (itemCount === 16) {
    columns = 4;
  } else {
    columns = 5;
  }

  const availableWidth = Math.max(
    1,
    roundPanel.clientWidth
  );

  const availableHeight = Math.max(
    1,
    roundPanel.clientHeight
  );

  if (
    availableWidth < 850 &&
    columns > 4
  ) {
    columns = 4;
  }

  if (
    availableWidth < 620 &&
    columns > 3
  ) {
    columns = 3;
  }

  const rows = Math.ceil(
    itemCount / columns
  );

  const cardWidth =
    availableWidth / columns;

  const cardHeight =
    availableHeight / rows;

  if (
    cardHeight < 86 &&
    columns < Math.min(itemCount, 6)
  ) {
    columns++;
  }

  return {
    columns,
    rows: Math.ceil(itemCount / columns)
  };
}

function schedulePromptFitting() {
  if (fitAnimationFrame !== null) {
    window.cancelAnimationFrame(
      fitAnimationFrame
    );
  }

  fitAnimationFrame =
    window.requestAnimationFrame(() => {
      fitAnimationFrame = null;
      fitAllPromptContents();
    });
}

function fitAllPromptContents() {
  promptGrid
    .querySelectorAll(
      ".hotseat-prompt-content"
    )
    .forEach((content) => {
      const visual = content.querySelector(
        ".clue-item-visual"
      );

      if (!visual) {
        return;
      }

      const displayType =
        content.dataset.displayType ||
        content.querySelector(
          "[data-display-type]"
        )?.dataset.displayType ||
        "";

      const isText =
        displayType === "text" ||
        displayType === "symbol" ||
        visual.classList.contains(
          "clue-item-image-fallback"
        );

      if (isText) {
        fitTextToContainer(visual);
      }
    });
}

function fitTextToContainer(element) {
  const text = element.textContent.trim();

  if (!text) {
    return;
  }

  const availableWidth = Math.max(
    1,
    element.clientWidth - 20
  );

  const availableHeight = Math.max(
    1,
    element.clientHeight - 20
  );

  const styles = window.getComputedStyle(element);
  const canvas = fitTextToContainer.canvas ||
    (fitTextToContainer.canvas = document.createElement("canvas"));
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
    availableHeight * 0.76;

  const fittedSize = Math.min(
    180,
    widthSize * 0.94,
    heightSize
  );

  element.style.whiteSpace = "nowrap";
  element.style.lineHeight = "0.94";
  element.style.fontSize =
    `${Math.max(14, fittedSize)}px`;
}

function forceContainedImages(root) {
  if (!root) {
    return;
  }

  root
    .querySelectorAll("img")
    .forEach((image) => {
      image.removeAttribute("width");
      image.removeAttribute("height");

      image.style.setProperty("display", "block", "important");
      image.style.setProperty("width", "auto", "important");
      image.style.setProperty("height", "auto", "important");
      image.style.setProperty("min-width", "0", "important");
      image.style.setProperty("min-height", "0", "important");
      image.style.setProperty("max-width", "100%", "important");
      image.style.setProperty("max-height", "100%", "important");
      image.style.setProperty("aspect-ratio", "auto", "important");
      image.style.setProperty("object-fit", "contain", "important");
      image.style.setProperty("object-position", "center center", "important");
    });
}

function setupEmberField() {
  if (document.querySelector(".hotseat-ember-field")) {
    return;
  }

  const field = document.createElement("div");
  field.className = "hotseat-ember-field";
  field.setAttribute("aria-hidden", "true");

  const particleCount = window.matchMedia(
    "(max-width: 720px)"
  ).matches
    ? 38
    : 64;

  for (let index = 0; index < particleCount; index++) {
    const ember = document.createElement("span");
    ember.className = "hotseat-ember";

    const size = randomBetween(1.5, 6.2);
    const duration = randomBetween(4.8, 11.5);
    const colourNumber = randomChoiceWeighted([1, 1, 1, 1, 2, 2, 2, 3]);

    ember.style.setProperty(
      "--ember-left",
      `${randomBetween(-2, 102).toFixed(2)}%`
    );
    ember.style.setProperty(
      "--ember-size",
      `${size.toFixed(2)}px`
    );
    ember.style.setProperty(
      "--ember-duration",
      `${duration.toFixed(2)}s`
    );
    ember.style.setProperty(
      "--ember-delay",
      `${(-randomBetween(0, duration)).toFixed(2)}s`
    );
    ember.style.setProperty(
      "--ember-flicker-duration",
      `${randomBetween(0.38, 1.15).toFixed(2)}s`
    );
    ember.style.setProperty(
      "--ember-flicker-delay",
      `${(-randomBetween(0, 1.2)).toFixed(2)}s`
    );
    ember.style.setProperty(
      "--ember-drift",
      `${randomBetween(-115, 115).toFixed(1)}px`
    );
    ember.style.setProperty(
      "--ember-opacity",
      randomBetween(0.38, 0.96).toFixed(2)
    );
    ember.style.setProperty(
      "--ember-colour",
      `var(--ember-colour-${colourNumber})`
    );

    field.appendChild(ember);
  }

  document.body.prepend(field);
}

function applyEmberPalette(theme, useDefaultHotPalette) {
  if (useDefaultHotPalette) {
    document.body.style.setProperty("--ember-colour-1", "#ff8a1f");
    document.body.style.setProperty("--ember-colour-2", "#ffd166");
    document.body.style.setProperty("--ember-colour-3", "#fff8df");
    return;
  }

  document.body.style.setProperty(
    "--ember-colour-1",
    mixHexWithWhite(theme.accent, 0.22)
  );
  document.body.style.setProperty(
    "--ember-colour-2",
    mixHexWithWhite(theme.accent, 0.5)
  );
  document.body.style.setProperty(
    "--ember-colour-3",
    mixHexWithWhite(theme.accent, 0.78)
  );
}

function mixHexWithWhite(hexColour, whiteAmount) {
  const cleaned = String(hexColour).replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return "#ffffff";
  }

  const red = parseInt(cleaned.slice(0, 2), 16);
  const green = parseInt(cleaned.slice(2, 4), 16);
  const blue = parseInt(cleaned.slice(4, 6), 16);

  const mix = (channel) => {
    return Math.round(
      channel + (255 - channel) * whiteAmount
    );
  };

  return `#${[mix(red), mix(green), mix(blue)]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function randomBetween(minimum, maximum) {
  return minimum + Math.random() * (maximum - minimum);
}

function randomChoiceWeighted(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function clearTimer() {
  if (timerInterval !== null) {
    window.clearInterval(timerInterval);
    timerInterval = null;
  }
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

function saveAndBroadcastState() {
  localStorage.setItem(
    HOTSEAT_GAME_STATE_KEY,
    JSON.stringify(gameState)
  );

  channel?.postMessage({
    type: "state-updated",
    state: gameState
  });
}
