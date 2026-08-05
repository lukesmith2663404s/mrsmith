"use strict";

const form = document.querySelector("#settingsForm");
const playerNameInput = document.querySelector("#playerName");
const saveCodeInput = document.querySelector("#saveCodeInput");
const codeField = document.querySelector("#codeField");
const decodeMessage = document.querySelector("#decodeMessage");

const avatarPreview = document.querySelector("#avatarPreview");
const rerollAllAvatarButton = document.querySelector("#rerollAllAvatar");
const rerollBodyButton = document.querySelector("#rerollBody");
const rerollFaceButton = document.querySelector("#rerollFace");
const rerollHeadwearButton = document.querySelector("#rerollHeadwear");
const bodyPartName = document.querySelector("#bodyPartName");
const facePartName = document.querySelector("#facePartName");
const headwearPartName = document.querySelector("#headwearPartName");

const NEW_GAME_COINS = 20;

const avatarParts = normaliseAvatarParts(
  window.LOOP_QUEST_AVATAR_PARTS || {}
);

const avatarSelection = {
  body: randomPart("bodies"),
  face: randomPart("faces"),
  headwear: randomPart("headwear")
};

document.querySelectorAll('input[name="startMode"]').forEach((input) => {
  input.addEventListener("change", updateVisibleFields);
});

rerollAllAvatarButton.addEventListener("click", () => {
  avatarSelection.body = randomPart("bodies");
  avatarSelection.face = randomPart("faces");
  avatarSelection.headwear = randomPart("headwear");
  renderAvatarPreview();
});

rerollBodyButton.addEventListener("click", () => {
  avatarSelection.body = randomPart("bodies");
  renderAvatarPreview();
});

rerollFaceButton.addEventListener("click", () => {
  avatarSelection.face = randomPart("faces");
  renderAvatarPreview();
});

rerollHeadwearButton.addEventListener("click", () => {
  avatarSelection.headwear = randomPart("headwear");
  renderAvatarPreview();
});

form.addEventListener("submit", startGame);

updateVisibleFields();
renderAvatarPreview();

function updateVisibleFields() {
  const mode = getStartMode();

  codeField.classList.toggle(
    "hidden",
    mode !== "code"
  );

  decodeMessage.textContent = "";
}

function startGame(event) {
  event.preventDefault();

  const playerName = sanitiseName(playerNameInput.value);
  const mode = getStartMode();

  let progress = 0;
  let coins = NEW_GAME_COINS;

  if (mode === "code") {
    const decoded = decodeSaveCode(saveCodeInput.value);

    if (!decoded) {
      decodeMessage.textContent = "That save code was not recognised.";
      return;
    }

    progress = decoded.progress;
    coins = decoded.coins;
  }

  const params = new URLSearchParams({
    name: playerName,
    progress: String(progress),
    coins: String(coins),
    body: avatarSelection.body || "",
    face: avatarSelection.face || "",
    headwear: avatarSelection.headwear || ""
  });

  window.location.href = `game.html?${params.toString()}`;
}

function getStartMode() {
  return document.querySelector('input[name="startMode"]:checked').value;
}

function sanitiseName(value) {
  const trimmed = String(value || "").trim();

  return trimmed || "Class";
}

function decodeSaveCode(code) {
  const cleaned = String(code || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  const match = cleaned.match(/^LQ-([0-9A-Z]+)\.([0-9A-Z]+)-([0-9A-Z]{2})$/);

  if (!match) {
    return null;
  }

  const raw = `${match[1]}.${match[2]}`;
  const expected = checksum(raw);

  if (expected !== match[3]) {
    return null;
  }

  const progress = parseInt(match[1], 36);
  const coins = parseInt(match[2], 36);

  if (
    !Number.isFinite(progress) ||
    !Number.isFinite(coins)
  ) {
    return null;
  }

  return {
    progress,
    coins
  };
}

function normaliseAvatarParts(rawParts) {
  return {
    bodies: normalisePartList(
      rawParts.bodies ||
      rawParts.body ||
      []
    ),
    faces: normalisePartList(
      rawParts.faces ||
      rawParts.face ||
      []
    ),
    headwear: normalisePartList(
      rawParts.headwear ||
      rawParts.hats ||
      []
    )
  };
}

function normalisePartList(parts) {
  return parts
    .map((part) => {
      if (typeof part === "string") {
        return {
          src: part,
          name: nameFromPath(part)
        };
      }

      if (
        part &&
        typeof part.src === "string"
      ) {
        return {
          src: part.src,
          name: part.name || nameFromPath(part.src)
        };
      }

      return null;
    })
    .filter(Boolean);
}

function randomPart(kind) {
  const options = avatarParts[kind] || [];

  if (options.length === 0) {
    return "";
  }

  return options[Math.floor(Math.random() * options.length)].src;
}

function renderAvatarPreview() {
  renderAvatarLayers(
    avatarPreview,
    avatarSelection,
    "../../"
  );

  bodyPartName.textContent = getPartName("bodies", avatarSelection.body);
  facePartName.textContent = getPartName("faces", avatarSelection.face);
  headwearPartName.textContent = getPartName("headwear", avatarSelection.headwear);
}

function renderAvatarLayers(container, selection, prefix) {
  container.innerHTML = "";

  const layers = [
    ["body", selection.body],
    ["face", selection.face],
    ["headwear", selection.headwear]
  ];

  let hasLayer = false;

  layers.forEach(([kind, src]) => {
    if (!src) {
      return;
    }

    const image = document.createElement("img");

    image.className =
      `loop-avatar-layer loop-avatar-layer-${kind}`;

    image.src = `${prefix}${src}`;
    image.alt = "";
    image.draggable = false;

    container.append(image);
    hasLayer = true;
  });

  if (!hasLayer) {
    const fallback = document.createElement("div");
    fallback.className = "loop-avatar-fallback";
    fallback.textContent = "🙂";
    container.append(fallback);
  }
}

function getPartName(kind, src) {
  if (!src) {
    return "None";
  }

  const part = (avatarParts[kind] || []).find(
    (candidate) => candidate.src === src
  );

  return part
    ? part.name
    : nameFromPath(src);
}

function nameFromPath(path) {
  return String(path || "")
    .split("/")
    .pop()
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function checksum(raw) {
  let total = 17;

  for (const character of raw) {
    total = (
      (total * 31) +
      character.charCodeAt(0)
    ) % 1296;
  }

  return total
    .toString(36)
    .toUpperCase()
    .padStart(2, "0")
    .slice(-2);
}
