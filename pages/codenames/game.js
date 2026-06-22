let gameState = CodenamesGame.loadState();
let renderedGameId = null;
let renderToken = 0;

const standbyPanel = document.querySelector("#standbyPanel");
const gamePanel = document.querySelector("#gamePanel");
const publicBoard = document.querySelector("#publicBoard");
const displayTurnPanel = document.querySelector("#displayTurnPanel");
const displayCounters = document.querySelector("#displayCounters");
const publicClueFile = document.querySelector("#publicClueFile");
const publicClueLabel = document.querySelector("#publicClueLabel");
const publicClueText = document.querySelector("#publicClueText");
const publicClueNumber = document.querySelector("#publicClueNumber");
const displayMessage = document.querySelector("#displayMessage");
const guessCounter = document.querySelector("#guessCounter");
const gameOverOverlay = document.querySelector("#gameOverOverlay");
const gameOverCard = document.querySelector("#gameOverCard");
const gameOverHeading = document.querySelector("#gameOverHeading");
const gameOverMessage = document.querySelector("#gameOverMessage");

CodenamesGame.subscribe((state) => {
  gameState = state;
  renderDisplay();
});

window.addEventListener("resize", fitBoardText);
renderDisplay();

async function renderDisplay() {
  const token = ++renderToken;

  if (!gameState || gameState.status === "preview") {
    renderedGameId = null;
    standbyPanel.classList.remove("hidden");
    gamePanel.classList.add("hidden");
    gameOverOverlay.classList.add("hidden");
    displayTurnPanel.innerHTML = "<span>Waiting</span><strong>Open the spymaster file</strong>";
    displayCounters.innerHTML = "";
    return;
  }

  standbyPanel.classList.add("hidden");
  gamePanel.classList.remove("hidden");

  if (renderedGameId !== gameState.gameId) {
    renderedGameId = gameState.gameId;
    await buildBoard(token);
  } else {
    updateBoardStates();
  }

  renderHeaderAndClue();
  renderGameOver();
  fitBoardText();
}

async function buildBoard(token) {
  publicBoard.innerHTML = "";

  for (let index = 0; index < gameState.board.length; index++) {
    if (token !== renderToken) return;

    const cardState = gameState.board[index];
    const entry = CodenamesLibrary.getItemById(cardState.itemId);
    if (!entry) continue;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "public-code-card";
    button.dataset.boardIndex = String(index);
    button.setAttribute("aria-label", entry.spokenName || entry.label);

    const inner = document.createElement("div");
    inner.className = "public-code-card-inner";

    const hiddenFace = document.createElement("div");
    hiddenFace.className = "public-code-face public-code-hidden-face";

    const content = document.createElement("div");
    content.className = "public-code-content";
    await CodenamesLibrary.renderItem(entry, content, {
      showLabel: false,
      lazy: false,
      includeAltText: false,
      imageWidth: 650
    });
    forceImagesToFit(content);
    hiddenFace.appendChild(content);

    const revealedFace = document.createElement("div");
    revealedFace.className = `public-code-face public-code-revealed-face role-${cardState.role}`;

    const stamp = document.createElement("div");
    stamp.className = "revealed-role-stamp";
    stamp.textContent = roleName(cardState.role);

    const label = document.createElement("div");
    label.className = "revealed-item-label";
    label.textContent = entry.label;

    revealedFace.append(stamp, label);
    inner.append(hiddenFace, revealedFace);
    button.appendChild(inner);

    button.addEventListener("click", () => revealCard(index));
    publicBoard.appendChild(button);
  }

  updateBoardStates();
}

function updateBoardStates() {
  publicBoard.querySelectorAll(".public-code-card").forEach((button) => {
    const index = Number(button.dataset.boardIndex);
    const cardState = gameState.board[index];
    if (!cardState) return;

    button.classList.toggle("is-revealed", cardState.revealed);
    button.disabled = cardState.revealed || !CodenamesGame.canGuess(gameState);
  });
}

function renderHeaderAndClue() {
  const counts = CodenamesGame.getCounts(gameState);

  if (gameState.mode === "solo") {
    displayTurnPanel.innerHTML = `<span>One-team mission</span><strong>Turn ${gameState.turnNumber} of ${gameState.maxTurns}</strong>`;
    displayCounters.innerHTML = `<span class="display-count-green">${counts.green} green left</span><span>${Math.max(0, gameState.maxTurns - gameState.turnNumber + 1)} turns available</span>`;
  } else {
    displayTurnPanel.innerHTML = `<span>Current team</span><strong class="turn-team-${gameState.currentTeam}">${CodenamesGame.capitalise(gameState.currentTeam)}</strong>`;
    displayCounters.innerHTML = `<span class="display-count-blue">${counts.blue} blue</span><span class="display-count-red">${counts.red} red</span>`;
  }

  const hasClue = Boolean(gameState.clueText && gameState.status === "playing");
  publicClueFile.classList.toggle("waiting-for-clue", !hasClue);
  publicClueFile.classList.toggle("clue-blue", hasClue && gameState.currentTeam === "blue");
  publicClueFile.classList.toggle("clue-red", hasClue && gameState.currentTeam === "red");
  publicClueFile.classList.toggle("clue-green", hasClue && gameState.currentTeam === "green");

  if (hasClue) {
    publicClueLabel.textContent = "Clue";
    publicClueText.textContent = gameState.clueText;
    publicClueNumber.textContent = String(gameState.clueNumber);
    guessCounter.textContent = `${gameState.guessesRemaining} guess${gameState.guessesRemaining === 1 ? "" : "es"} remaining`;
  } else {
    publicClueLabel.textContent = "Waiting for clue";
    publicClueText.textContent = "—";
    publicClueNumber.textContent = "";
    guessCounter.textContent = "";
  }

  displayMessage.textContent = gameState.message;
}

function renderGameOver() {
  const over = gameState.status === "won" || gameState.status === "lost";
  gameOverOverlay.classList.toggle("hidden", !over);

  if (!over) return;

  gameOverCard.className = "game-over-file";

  if (gameState.mode === "solo") {
    const won = gameState.status === "won";
    gameOverCard.classList.add(won ? "game-over-green" : "game-over-black");
    gameOverHeading.textContent = won ? "Mission complete" : "Mission failed";
  } else {
    gameOverCard.classList.add(`game-over-${gameState.winner || "black"}`);
    gameOverHeading.textContent = gameState.winner
      ? `${CodenamesGame.capitalise(gameState.winner)} team wins`
      : "Game over";
  }

  gameOverMessage.textContent = gameState.message;
}

function revealCard(index) {
  if (!gameState) return;
  const next = CodenamesGame.revealCard(gameState, index);
  if (next === gameState) return;
  gameState = next;
  CodenamesGame.saveState(gameState);
  renderDisplay();
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

function fitBoardText() {
  publicBoard.querySelectorAll('[data-display-type="text"], [data-display-type="symbol"]').forEach((container) => {
    const visual = container.querySelector(".clue-item-visual");
    if (!visual) return;

    let size = Math.min(30, Math.max(13, container.clientWidth / 6));
    visual.style.fontSize = `${size}px`;

    while ((visual.scrollWidth > container.clientWidth || visual.scrollHeight > container.clientHeight) && size > 11) {
      size -= 1;
      visual.style.fontSize = `${size}px`;
    }
  });
}
