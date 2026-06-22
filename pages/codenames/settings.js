const DEFAULT_SETTINGS = {
  mode: "teams",
  selectedCategoryIds: ["integers"]
};

let settings = loadValidatedSettings();
let previewState = null;
let currentState = CodenamesGame.loadState();
let displayWindow = null;
let renderToken = 0;

const form = document.querySelector("#codenamesSettingsForm");
const categoryChecklist = document.querySelector("#categoryChecklist");
const settingsMessage = document.querySelector("#settingsMessage");
const keyGrid = document.querySelector("#keyGrid");
const privateBoardHeading = document.querySelector("#privateBoardHeading");
const privateStatusStrip = document.querySelector("#privateStatusStrip");
const openDisplayButton = document.querySelector("#openDisplayButton");
const prepareBoardButton = document.querySelector("#prepareBoardButton");
const startGameButton = document.querySelector("#startGameButton");
const newGameButton = document.querySelector("#newGameButton");
const selectMathsButton = document.querySelector("#selectMathsButton");
const selectGeneralButton = document.querySelector("#selectGeneralButton");
const selectWordsButton = document.querySelector("#selectWordsButton");
const selectAllButton = document.querySelector("#selectAllButton");
const clearAllButton = document.querySelector("#clearAllButton");
const clueControlSection = document.querySelector("#clueControlSection");
const turnHeading = document.querySelector("#turnHeading");
const remainingCounters = document.querySelector("#remainingCounters");
const clueTextInput = document.querySelector("#clueTextInput");
const clueNumberInput = document.querySelector("#clueNumberInput");
const giveClueButton = document.querySelector("#giveClueButton");
const endTurnButton = document.querySelector("#endTurnButton");
const undoButton = document.querySelector("#undoButton");
const privateMessage = document.querySelector("#privateMessage");

buildCategoryChecklist();
applySettingsToForm();
renderPrivateView();

form.addEventListener("change", handleSettingsChange);
openDisplayButton.addEventListener("click", openDisplay);
prepareBoardButton.addEventListener("click", prepareBoard);
startGameButton.addEventListener("click", startPreparedGame);
newGameButton.addEventListener("click", resetGame);
selectMathsButton.addEventListener("click", () => selectGroup("mathematics"));
selectGeneralButton.addEventListener("click", () => selectGroup("general"));
selectWordsButton.addEventListener("click", selectWordsOnly);
selectAllButton.addEventListener("click", selectAllCategories);
clearAllButton.addEventListener("click", clearAllCategories);
giveClueButton.addEventListener("click", submitClue);
endTurnButton.addEventListener("click", endCurrentTurn);
undoButton.addEventListener("click", undoLastAction);
clueTextInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    submitClue();
  }
});

CodenamesGame.subscribe((state) => {
  currentState = state;
  if (state?.status && state.status !== "preview") previewState = null;
  renderPrivateView();
});

function buildCategoryChecklist() {
  categoryChecklist.innerHTML = "";

  const groups = ClueItemGenerator.getGroups();
  groups.forEach((group) => {
    appendCategoryGroup(
      group.id,
      group.name,
      ClueItemGenerator.getCategories(group.id)
    );
  });

  const wordsCategory = CodenamesLibrary.getSpecialCategory();
  appendCategoryGroup("codenames", "Codenames only", [wordsCategory]);
}

function appendCategoryGroup(groupId, groupName, categories) {
  const section = document.createElement("section");
  section.className = "category-paper-group";
  section.dataset.groupId = groupId;

  const heading = document.createElement("h3");
  heading.textContent = groupName;

  const grid = document.createElement("div");
  grid.className = "category-paper-grid";

  categories.forEach((category) => {
    const label = document.createElement("label");
    label.className = "category-paper-option";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "category";
    input.value = category.id;
    input.dataset.groupId = groupId;

    const text = document.createElement("span");
    const count = CodenamesLibrary.getCategoryCount(category.id);
    text.innerHTML = `<strong>${escapeHtml(category.name)}</strong><small>${count} available</small>`;

    label.append(input, text);
    grid.appendChild(label);
  });

  section.append(heading, grid);
  categoryChecklist.appendChild(section);
}

function loadValidatedSettings() {
  const loaded = CodenamesGame.loadSettings(DEFAULT_SETTINGS);
  const validIds = new Set([
    ...ClueItemGenerator.getCategories().map((category) => category.id),
    CodenamesLibrary.getSpecialCategory().id
  ]);

  const selected = Array.isArray(loaded.selectedCategoryIds)
    ? loaded.selectedCategoryIds.filter((id) => validIds.has(id))
    : [];

  return {
    mode: loaded.mode === "solo" ? "solo" : "teams",
    selectedCategoryIds: selected.length ? selected : ["integers"]
  };
}

function applySettingsToForm() {
  const modeInput = form.querySelector(`input[name="gameMode"][value="${settings.mode}"]`);
  if (modeInput) modeInput.checked = true;

  const selected = new Set(settings.selectedCategoryIds);
  categoryChecklist.querySelectorAll('input[name="category"]').forEach((input) => {
    input.checked = selected.has(input.value);
  });
}

function handleSettingsChange() {
  const mode = form.querySelector('input[name="gameMode"]:checked')?.value || "teams";
  const selectedCategoryIds = [...categoryChecklist.querySelectorAll('input[name="category"]:checked')]
    .map((input) => input.value);

  settings = { mode, selectedCategoryIds };
  CodenamesGame.saveSettings(settings);
  previewState = null;
  startGameButton.disabled = true;
  settingsMessage.textContent = "Settings changed. Prepare a new board.";
  renderPrivateView();
}

function prepareBoard() {
  settingsMessage.textContent = "";

  try {
    if (!settings.selectedCategoryIds.length) {
      throw new Error("Select at least one category.");
    }

    const items = CodenamesLibrary.generateBoard(CodenamesGame.BOARD_SIZE, {
      categoryIds: settings.selectedCategoryIds
    });

    previewState = CodenamesGame.createGameState(items, settings.mode);
    currentState = null;
    startGameButton.disabled = false;
    settingsMessage.textContent = "Board prepared. Keep the right-hand key private.";
    renderPrivateView();
  } catch (error) {
    previewState = null;
    startGameButton.disabled = true;
    settingsMessage.textContent = error.message;
    renderPrivateView();
  }
}

function startPreparedGame() {
  if (!previewState) {
    settingsMessage.textContent = "Prepare a board first.";
    return;
  }

  currentState = CodenamesGame.startGame(previewState);
  previewState = null;
  CodenamesGame.saveState(currentState, "game-started");
  startGameButton.disabled = true;
  settingsMessage.textContent = "Game started on the classroom display.";
  renderPrivateView();
  openDisplay();
}

function openDisplay() {
  displayWindow = window.open(
    "game.html",
    "codenamesClassroomDisplay"
  );

  if (!displayWindow) {
    settingsMessage.textContent = "The display window was blocked. Allow pop-ups, then press Open Display again.";
  } else {
    displayWindow.focus();
  }
}

function resetGame() {
  previewState = null;
  currentState = null;
  CodenamesGame.clearState();
  startGameButton.disabled = true;
  clueTextInput.value = "";
  settingsMessage.textContent = "Game cleared. Prepare a new board when ready.";
  renderPrivateView();
}

function selectGroup(groupId) {
  categoryChecklist.querySelectorAll('input[name="category"]').forEach((input) => {
    input.checked = input.dataset.groupId === groupId;
  });
  handleSettingsChange();
}

function selectWordsOnly() {
  categoryChecklist.querySelectorAll('input[name="category"]').forEach((input) => {
    input.checked = input.value === "codenames-words";
  });
  handleSettingsChange();
}

function selectAllCategories() {
  categoryChecklist.querySelectorAll('input[name="category"]').forEach((input) => {
    input.checked = true;
  });
  handleSettingsChange();
}

function clearAllCategories() {
  categoryChecklist.querySelectorAll('input[name="category"]').forEach((input) => {
    input.checked = false;
  });
  handleSettingsChange();
}

async function renderPrivateView() {
  const token = ++renderToken;
  const state = currentState || previewState;

  if (!state) {
    privateBoardHeading.textContent = "Prepare a board";
    privateStatusStrip.innerHTML = "<span>25 cards</span><strong>Not started</strong>";
    keyGrid.innerHTML = '<p class="key-grid-empty">Press Prepare Board to create the secret key.</p>';
    clueControlSection.classList.add("is-disabled");
    turnHeading.textContent = "Waiting to start";
    remainingCounters.innerHTML = "";
    privateMessage.textContent = "The classroom display remains on standby until Start Game is pressed.";
    updateControlAvailability(null);
    return;
  }

  privateBoardHeading.textContent = state.status === "preview"
    ? "Prepared secret key"
    : "Live secret key";

  privateStatusStrip.innerHTML = buildPrivateStatus(state);
  keyGrid.innerHTML = "";

  for (let index = 0; index < state.board.length; index++) {
    if (token !== renderToken) return;

    const cardState = state.board[index];
    const entry = CodenamesLibrary.getItemById(cardState.itemId);
    if (!entry) continue;

    const card = document.createElement("button");
    card.type = "button";
    card.className = `key-card role-${cardState.role}`;
    card.dataset.boardIndex = String(index);
    card.disabled = !CodenamesGame.canGuess(state) || cardState.revealed;
    if (cardState.revealed) card.classList.add("is-revealed");

    const content = document.createElement("div");
    content.className = "key-card-content";

    await CodenamesLibrary.renderItem(entry, content, {
      showLabel: entry.displayType === "image",
      lazy: false,
      includeAltText: false,
      imageWidth: 500
    });

    forceImagesToFit(content);

    const roleLabel = document.createElement("span");
    roleLabel.className = "key-role-label";
    roleLabel.textContent = roleName(cardState.role);

    card.append(content, roleLabel);
    card.addEventListener("click", () => revealFromPrivate(index));
    keyGrid.appendChild(card);
  }

  renderTurnControls(state);
  updateControlAvailability(state);
}

function renderTurnControls(state) {
  const active = state.status === "playing";
  clueControlSection.classList.toggle("is-disabled", !active);

  if (state.mode === "solo") {
    turnHeading.textContent = active
      ? `Turn ${state.turnNumber} of ${state.maxTurns}`
      : state.status === "preview"
        ? "Five-turn mission"
        : "Mission ended";
  } else {
    turnHeading.textContent = state.status === "preview"
      ? `${CodenamesGame.capitalise(state.startingTeam)} team starts`
      : `${CodenamesGame.capitalise(state.currentTeam)} team`;
  }

  const counts = CodenamesGame.getCounts(state);
  remainingCounters.innerHTML = state.mode === "solo"
    ? `<span class="counter-green">${counts.green} green</span><span>${state.maxTurns - state.turnNumber + 1} turns left</span>`
    : `<span class="counter-blue">${counts.blue} blue</span><span class="counter-red">${counts.red} red</span>`;

  privateMessage.textContent = state.message;

  if (active && state.clueText) {
    clueTextInput.value = state.clueText;
    clueNumberInput.value = String(state.clueNumber);
  } else if (!active || !state.clueText) {
    clueTextInput.value = "";
  }
}

function updateControlAvailability(state) {
  const active = state?.status === "playing";
  const clueActive = Boolean(active && state.clueText);

  giveClueButton.disabled = !active || clueActive;
  clueTextInput.disabled = !active || clueActive;
  clueNumberInput.disabled = !active || clueActive;
  endTurnButton.disabled = !active || !clueActive;
  undoButton.disabled = !active || !state.lastAction;
  prepareBoardButton.disabled = active;
  startGameButton.disabled = !previewState;
}

function submitClue() {
  if (!currentState) return;

  try {
    currentState = CodenamesGame.giveClue(
      currentState,
      clueTextInput.value,
      clueNumberInput.value
    );
    CodenamesGame.saveState(currentState);
    renderPrivateView();
  } catch (error) {
    privateMessage.textContent = error.message;
  }
}

function endCurrentTurn() {
  if (!currentState) return;
  currentState = CodenamesGame.endTurn(currentState, "manual");
  CodenamesGame.saveState(currentState);
  renderPrivateView();
}

function undoLastAction() {
  if (!currentState) return;
  currentState = CodenamesGame.undoLastAction(currentState);
  CodenamesGame.saveState(currentState);
  renderPrivateView();
}

function revealFromPrivate(index) {
  if (!currentState) return;
  const next = CodenamesGame.revealCard(currentState, index);
  if (next === currentState) return;
  currentState = next;
  CodenamesGame.saveState(currentState);
  renderPrivateView();
}

function buildPrivateStatus(state) {
  if (state.status === "preview") {
    const startText = state.mode === "solo"
      ? "1 team · 5 turns"
      : `${CodenamesGame.capitalise(state.startingTeam)} starts`;
    return `<span>${startText}</span><strong>Ready to start</strong>`;
  }

  if (state.status === "playing") {
    const clueText = state.clueText
      ? `${escapeHtml(state.clueText)}: ${state.clueNumber}`
      : "Waiting for clue";
    return `<span>${state.mode === "solo" ? "One team" : "Two teams"}</span><strong>${clueText}</strong>`;
  }

  return `<span>Game over</span><strong>${escapeHtml(state.message)}</strong>`;
}

function roleName(role) {
  return ({
    blue: "Blue agent",
    red: "Red agent",
    green: "Green target",
    neutral: "Bystander",
    assassin: "Black card"
  })[role] || role;
}

function forceImagesToFit(container) {
  container.querySelectorAll("img").forEach((image) => {
    image.removeAttribute("width");
    image.removeAttribute("height");
    image.style.width = "100%";
    image.style.height = "100%";
    image.style.objectFit = "contain";
    image.style.objectPosition = "center";
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
