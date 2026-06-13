const GHOST_PREVIEW_FOLDER = "assets/images/ghosts";
const EASTER_EGG_PREVIEW_CHANCE = 1 / 50;

const NORMAL_GHOST_PREVIEW_FILES = [
  "g0.png",
  "g1.png",
  "g2.png",
  "g3.png",
  "g4.png",
  "g5.png",
  "g6.png",
  "g7.png",
  "g8.png",
  "g9.png",
  "gplus.png",
  "gminus.png",
  "gtimes.png",
  "gdivide.png"
];

const EASTER_EGG_GHOST_PREVIEW_FILES = [
  "napstablook.png",
  "gengar.png",
  "boo.png"
];

const ghostHoverTiles = document.querySelectorAll("[data-ghost-hover]");

ghostHoverTiles.forEach((tile) => {
  const ghostImage = tile.querySelector(".tile-ghost-preview");

  if (!ghostImage) {
    return;
  }

  tile.addEventListener("mouseenter", () => {
    ghostImage.src = getRandomGhostPreviewPath();
  });

  tile.addEventListener("focus", () => {
    ghostImage.src = getRandomGhostPreviewPath();
  });
});

function getRandomGhostPreviewPath() {
  const shouldShowEasterEgg = Math.random() < EASTER_EGG_PREVIEW_CHANCE;
  const ghostFiles = shouldShowEasterEgg
    ? EASTER_EGG_GHOST_PREVIEW_FILES
    : NORMAL_GHOST_PREVIEW_FILES;

  const randomIndex = Math.floor(Math.random() * ghostFiles.length);
  const fileName = ghostFiles[randomIndex];

  return `${GHOST_PREVIEW_FOLDER}/${fileName}`;
}