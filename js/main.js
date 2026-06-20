const STANDARD_GHOST_IMAGES = [
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

const EASTER_EGG_GHOST_IMAGES = [
  "napstablook.png",
  "gengar.png",
  "boo.png"
];

const PAIRS_PREVIEW_VALUES = [
  ["1/2", "50%"],
  ["3/4", "0.75"],
  ["1/3", "2/6"],
  ["80%", "0.8"]
];

setupHauntedTilePreviews();
setupPairsTilePreviews();

function setupHauntedTilePreviews() {
  document
    .querySelectorAll("[data-ghost-hover]")
    .forEach((tile) => {
      const image = tile.querySelector(
        ".tile-ghost-preview"
      );

      if (!image) {
        return;
      }

      setRandomGhostImage(image);

      tile.addEventListener("mouseenter", () => {
        setRandomGhostImage(image);
      });

      tile.addEventListener("focus", () => {
        setRandomGhostImage(image);
      });
    });
}

function setRandomGhostImage(image) {
  const useEasterEgg =
    Math.floor(Math.random() * 50) === 0;

  const imageList = useEasterEgg
    ? EASTER_EGG_GHOST_IMAGES
    : STANDARD_GHOST_IMAGES;

  const imageName = randomChoice(imageList);

  image.src =
    `assets/images/ghosts/${imageName}`;
}

function setupPairsTilePreviews() {
  document
    .querySelectorAll("[data-pairs-preview]")
    .forEach((tile) => {
      const cards = [
        ...tile.querySelectorAll(
          "[data-pairs-card]"
        )
      ];

      if (cards.length < 4) {
        return;
      }

      const startPreview = () => {
        configureRandomPairsPreview(
          tile,
          cards
        );
      };

      const stopPreview = () => {
        tile.classList.remove(
          "is-previewing"
        );
      };

      tile.addEventListener(
        "mouseenter",
        startPreview
      );

      tile.addEventListener(
        "mouseleave",
        stopPreview
      );

      tile.addEventListener(
        "focus",
        startPreview
      );

      tile.addEventListener(
        "blur",
        stopPreview
      );
    });
}

function configureRandomPairsPreview(
  tile,
  cards
) {
  tile.classList.remove("is-previewing");

  cards.forEach((card) => {
    card.classList.remove("is-match");

    const value = card.querySelector(
      "[data-pair-value]"
    );

    if (value) {
      value.textContent = "";
    }
  });

  const matchingValues = randomChoice(
    PAIRS_PREVIEW_VALUES
  );

  const shuffledCardIndices = shuffle([
    0,
    1,
    2,
    3
  ]);

  const firstMatchIndex =
    shuffledCardIndices[0];

  const secondMatchIndex =
    shuffledCardIndices[1];

  setPreviewCardValue(
    cards[firstMatchIndex],
    matchingValues[0]
  );

  setPreviewCardValue(
    cards[secondMatchIndex],
    matchingValues[1]
  );

  void tile.offsetWidth;

  window.requestAnimationFrame(() => {
    tile.classList.add("is-previewing");
  });
}

function setPreviewCardValue(card, value) {
  card.classList.add("is-match");

  const valueElement = card.querySelector(
    "[data-pair-value]"
  );

  if (valueElement) {
    valueElement.textContent = value;
  }
}

function randomChoice(array) {
  return array[
    Math.floor(Math.random() * array.length)
  ];
}

function shuffle(array) {
  const shuffledArray = [...array];

  for (
    let index = shuffledArray.length - 1;
    index > 0;
    index--
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1)
    );

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