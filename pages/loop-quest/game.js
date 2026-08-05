"use strict";

const BOARD_SIZE = 28;
const BOARD_COLUMNS = 8;
const START_BONUS = 15;
const STARTING_COINS = 20;
const MOVE_DELAY_MS = 125;

const params = new URLSearchParams(window.location.search);

const boardElement = document.querySelector("#board");
const playerLabel = document.querySelector("#playerLabel");
const scoreValue = document.querySelector("#scoreValue");
const coinsValue = document.querySelector("#coinsValue");
const lapValue = document.querySelector("#lapValue");
const rollsLeftValue = document.querySelector("#rollsLeftValue");
const messageText = document.querySelector("#messageText");
const diceDisplay = document.querySelector("#diceDisplay");
const rollButton = document.querySelector("#rollButton");
const continueButton = document.querySelector("#continueButton");
const shopPanel = document.querySelector("#shopPanel");
const shopList = document.querySelector("#shopList");
const closeShopButton = document.querySelector("#closeShopButton");
const activeEffectsList = document.querySelector("#activeEffectsList");
const saveCodeOutput = document.querySelector("#saveCodeOutput");
const copyCodeButton = document.querySelector("#copyCodeButton");
const addRollsForm = document.querySelector("#addRollsForm");
const rollsToAddInput = document.querySelector("#rollsToAddInput");
const slotOverlay = document.querySelector("#slotOverlay");
const slotTitle = document.querySelector("#slotTitle");
const slotReel = document.querySelector("#slotReel");
const slotOutcome = document.querySelector("#slotOutcome");

const state = {
  playerName: readPlayerName(),
  progress: readWholeNumber(
    params.get("progress"),
    0
  ),
  coins: readWholeNumber(
    params.get("coins"),
    STARTING_COINS
  ),
  rollsRemaining: 0,
  avatar: readAvatarSelection(),
  activeEffects: [],
  boardEffects: [],
  pausedAtStart: false,
  isBusy: false
};

const shopItems = [
  {
    id: "octahedron-pass",
    name: "Octahedron Pass",
    price: 12,
    description: "D8 for next 3 rolls",
    effect: () => addActiveEffect({
      kind: "dieSides",
      id: uniqueId("octa"),
      name: "Octahedron Pass",
      value: 8,
      rolls: 3,
      good: true
    })
  },
  {
    id: "rocket-boots",
    name: "Rocket Boots",
    price: 10,
    description: "+5 to next roll",
    effect: () => addActiveEffect({
      kind: "add",
      id: uniqueId("rocket"),
      name: "Rocket Boots",
      value: 5,
      rolls: 1,
      good: true
    })
  },
  {
    id: "double-trouble",
    name: "Double Trouble",
    price: 14,
    description: "Double next roll",
    effect: () => addActiveEffect({
      kind: "multiply",
      id: uniqueId("double"),
      name: "Double Trouble",
      value: 2,
      rolls: 1,
      good: true
    })
  },
  {
    id: "duo-dice",
    name: "Duo Dice",
    price: 18,
    description: "Roll two dice and add for next 3 rolls",
    effect: () => addActiveEffect({
      kind: "diceMode",
      id: uniqueId("duo"),
      name: "Duo Dice",
      mode: "sum-two",
      rolls: 3,
      good: true
    })
  },
  {
    id: "product-dice",
    name: "Product Dice",
    price: 22,
    description: "Roll two dice and multiply next roll",
    effect: () => addActiveEffect({
      kind: "diceMode",
      id: uniqueId("product"),
      name: "Product Dice",
      mode: "product-two",
      rolls: 1,
      good: true
    })
  },
  {
    id: "lucky-charm",
    name: "Lucky Charm",
    price: 15,
    description: "Next unlucky space becomes lucky",
    effect: () => addActiveEffect({
      kind: "luckyShield",
      id: uniqueId("charm"),
      name: "Lucky Charm",
      uses: 1,
      good: true
    })
  },
  {
    id: "coin-magnet",
    name: "Coin Magnet",
    price: 12,
    description: "+3 coins after next 4 rolls",
    effect: () => addActiveEffect({
      kind: "coinAfterRoll",
      id: uniqueId("magnet"),
      name: "Coin Magnet",
      value: 3,
      rolls: 4,
      good: true
    })
  },
  {
    id: "spring-shoes",
    name: "Spring Shoes",
    price: 16,
    description: "+2 extra spaces after next 2 rolls",
    effect: () => addActiveEffect({
      kind: "springMove",
      id: uniqueId("spring"),
      name: "Spring Shoes",
      value: 2,
      rolls: 2,
      good: true
    })
  }
];

const luckyOutcomes = [
  {
    name: "Coin Shower",
    text: "+12 coins",
    apply: async () => addCoins(12)
  },
  {
    name: "Treasure Chest",
    text: "+20 coins",
    apply: async () => addCoins(20)
  },
  {
    name: "Bonus Roll",
    text: "+1 roll",
    apply: async () => {
      state.rollsRemaining += 1;
    }
  },
  {
    name: "Shortcut",
    text: "Move forward 4",
    apply: async () => {
      await moveForwardOnly(4);
      await handleLanding(1);
    }
  },
  {
    name: "Springboard",
    text: "Move forward 6",
    apply: async () => {
      await moveForwardOnly(6);
      await handleLanding(1);
    }
  },
  {
    name: "Clean Boots",
    text: "Clear one bad effect",
    apply: async () => clearOneBadEffect()
  },
  {
    name: "Supercharge",
    text: "Double next roll",
    apply: async () => addActiveEffect({
      kind: "multiply",
      id: uniqueId("lucky-double"),
      name: "Supercharge",
      value: 2,
      rolls: 1,
      good: true
    })
  },
  {
    name: "Gift Shop",
    text: "Free random power-up",
    apply: async () => {
      const item = randomFrom(shopItems);
      item.effect();

      messageText.textContent =
        `Gift Shop: ${item.name} activated.`;
    }
  }
];

const unluckyOutcomes = [
  {
    name: "Toll Troll",
    text: "-10 coins",
    apply: async () => addCoins(-10)
  },
  {
    name: "Slip Back",
    text: "Move back 5",
    apply: async () => moveBackwardOnly(5)
  },
  {
    name: "Sticky Shoes",
    text: "-3 for next 3 rolls",
    apply: async () => addActiveEffect({
      kind: "add",
      id: uniqueId("sticky"),
      name: "Sticky Shoes",
      value: -3,
      rolls: 3,
      bad: true
    })
  },
  {
    name: "Tiny Tetra",
    text: "D4 for next 3 rolls",
    apply: async () => addActiveEffect({
      kind: "dieSides",
      id: uniqueId("tetra"),
      name: "Tiny Tetra",
      value: 4,
      rolls: 3,
      bad: true
    })
  },
  {
    name: "Heavy Backpack",
    text: "-2 for next 5 rolls",
    apply: async () => addActiveEffect({
      kind: "add",
      id: uniqueId("backpack"),
      name: "Heavy Backpack",
      value: -2,
      rolls: 5,
      bad: true
    })
  },
  {
    name: "Coin Leak",
    text: "-2 coins after next 3 rolls",
    apply: async () => addActiveEffect({
      kind: "coinAfterRoll",
      id: uniqueId("leak"),
      name: "Coin Leak",
      value: -2,
      rolls: 3,
      bad: true
    })
  },
  {
    name: "Foggy Path",
    text: "Maximum 3 for next 2 rolls",
    apply: async () => addActiveEffect({
      kind: "cap",
      id: uniqueId("fog"),
      name: "Foggy Path",
      value: 3,
      rolls: 2,
      bad: true
    })
  }
];

rollButton.addEventListener("click", rollTurn);
addRollsForm.addEventListener("submit", addRollsFromForm);
continueButton.addEventListener("click", continueFromStart);
closeShopButton.addEventListener("click", () => {
  shopPanel.classList.add("hidden");
});
copyCodeButton.addEventListener("click", copySaveCode);

initialise();

function initialise() {
  playerLabel.textContent = state.playerName;
  applyBackgroundForLap(getLap());
  state.boardEffects = generateBoard(getLap());
  renderBoard();
  renderAll();
  updateRollButtonState();
}

async function rollTurn() {
  if (
    state.isBusy ||
    state.pausedAtStart ||
    state.rollsRemaining <= 0
  ) {
    if (state.rollsRemaining <= 0) {
      messageText.textContent =
        "Add rolls before rolling.";
      updateRollButtonState();
    }

    return;
  }

  state.rollsRemaining -= 1;
  state.isBusy = true;
  rollButton.disabled = true;
  renderStats();
  shopPanel.classList.add("hidden");

  const rollSnapshot = cloneRollEffects();
  const rollResult = calculateRoll(rollSnapshot);

  messageText.textContent = "Rolling…";

  await playDiceAnimation(rollResult);

  messageText.textContent = rollResult.message;

  await sleep(250);

  await moveForwardOnly(rollResult.total);

  if (!state.pausedAtStart) {
    const springSpaces = totalEffectValue(
      rollSnapshot,
      "springMove"
    );

    if (springSpaces > 0) {
      messageText.textContent =
        `Spring Shoes bounce you ${springSpaces} extra spaces.`;

      await sleep(350);
      await moveForwardOnly(springSpaces);
    }
  }

  applyAfterRollCoinEffects(rollSnapshot);
  decrementRollEffects(rollSnapshot);

  if (!state.pausedAtStart) {
    await handleLanding(0);
  }

  state.isBusy = false;
  updateRollButtonState();
  renderAll();
}

async function handleLanding(depth) {
  if (
    state.pausedAtStart ||
    depth > 4
  ) {
    return;
  }

  const position = getPosition();
  const effect = state.boardEffects[position];

  if (!effect) {
    messageText.textContent = "Safe space.";
    return;
  }

  if (effect.type === "start") {
    messageText.textContent = "Start square.";
    return;
  }

  if (effect.type === "coin") {
    addCoins(effect.amount);
    messageText.textContent =
      `${effect.name}: +${effect.amount} coins.`;
    return;
  }

  if (effect.type === "boost") {
    messageText.textContent =
      `${effect.name}: move forward ${effect.amount}.`;

    await sleep(350);
    await moveForwardOnly(effect.amount);

    if (!state.pausedAtStart) {
      await handleLanding(depth + 1);
    }

    return;
  }

  if (effect.type === "shop") {
    messageText.textContent = "Shop space.";
    renderShop();
    shopPanel.classList.remove("hidden");
    return;
  }

  if (effect.type === "lucky") {
    await spinOutcome(
      "Lucky space",
      luckyOutcomes,
      "lucky"
    );

    return;
  }

  if (effect.type === "unlucky") {
    const shield = state.activeEffects.find(
      (active) => active.kind === "luckyShield"
    );

    if (shield) {
      removeActiveEffect(shield.id);
      messageText.textContent =
        "Lucky Charm changed the unlucky space into a lucky one.";

      await sleep(600);

      await spinOutcome(
        "Lucky Charm",
        luckyOutcomes,
        "lucky"
      );

      return;
    }

    await spinOutcome(
      "Unlucky space",
      unluckyOutcomes,
      "unlucky"
    );
  }
}

async function spinOutcome(title, outcomes, tone) {
  const chosen = randomFrom(outcomes);
  const lineHeight = 58;
  const repeats = 4;
  const items = [];

  for (let index = 0; index < repeats; index += 1) {
    outcomes.forEach((outcome) => {
      items.push(outcome.name);
    });
  }

  items.push(chosen.name);

  slotTitle.textContent = title;
  slotOutcome.textContent = "";
  slotReel.innerHTML = "";

  items.forEach((item) => {
    const line = document.createElement("div");
    line.className = "loop-slot-line";
    line.textContent = item;
    slotReel.append(line);
  });

  slotOverlay.classList.remove("hidden");
  slotOverlay.setAttribute("aria-hidden", "false");
  slotOverlay.dataset.tone = tone;

  slotReel.style.transition = "none";
  slotReel.style.transform = "translateY(0)";

  await sleep(50);

  const target = (items.length - 1) * lineHeight;

  slotReel.style.transition =
    "transform 2s cubic-bezier(0.12, 0.72, 0.14, 1)";
  slotReel.style.transform = `translateY(-${target}px)`;

  await sleep(2150);

  slotOutcome.textContent = chosen.text;
  messageText.textContent =
    `${chosen.name}: ${chosen.text}.`;

  await sleep(750);

  slotOverlay.classList.add("hidden");
  slotOverlay.setAttribute("aria-hidden", "true");

  await chosen.apply();

  renderAll();
}

async function playDiceAnimation(rollResult) {
  const animation = renderDiceAnimation(
    rollResult,
    false
  );

  await animateDiceSprites(
    animation.sprites,
    980
  );

  renderDiceAnimation(
    rollResult,
    true
  );

  await sleep(420);
}

function renderDiceAnimation(rollResult, showResult) {
  const diceCount = rollResult.rolls.length;
  const diceClass = getDieShapeClass(rollResult.sides);
  const sprites = [];

  diceDisplay.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = diceCount > 1
    ? "loop-dice-animation two-dice"
    : "loop-dice-animation";

  rollResult.rolls.forEach((value, index) => {
    const dieWrap = document.createElement("div");
    dieWrap.className = "loop-die-wrap";

    const sprite = document.createElement("div");

    sprite.className = showResult
      ? `loop-die-sprite ${diceClass} is-resting`
      : `loop-die-sprite ${diceClass} is-rolling`;

    const startFrame = showResult
      ? 47
      : (index * 11) % 48;

    updateDiceSpriteFrame(
      sprite,
      startFrame
    );

    dieWrap.append(sprite);
    wrapper.append(dieWrap);
    sprites.push(sprite);
  });

  const result = document.createElement("div");
  result.className = showResult
    ? "loop-dice-result visible"
    : "loop-dice-result";

  const total = document.createElement("strong");
  total.className =
    `loop-dice-total-face ${diceClass}`;
  total.textContent = showResult
    ? rollResult.display
    : "";

  result.append(total);

  if (
    showResult &&
    rollResult.rolls.length > 1
  ) {
    const expression = document.createElement("span");
    expression.textContent = rollResult.expression;
    result.append(expression);
  }

  wrapper.append(result);
  diceDisplay.append(wrapper);

  return {
    sprites
  };
}

function animateDiceSprites(sprites, durationMs) {
  if (sprites.length === 0) {
    return Promise.resolve();
  }

  const frameCount = 48;
  const extraLoops = 1;

  return new Promise((resolve) => {
    const startedAt = performance.now();

    function step(now) {
      const elapsed = now - startedAt;
      const progress = Math.min(
        1,
        elapsed / durationMs
      );

      const eased = 1 - Math.pow(
        1 - progress,
        3
      );

      sprites.forEach((sprite, index) => {
        const frame = Math.min(
          frameCount - 1,
          Math.floor(
            eased *
            (
              (frameCount * (extraLoops + 1)) -
              1
            )
          )
        );

        updateDiceSpriteFrame(
          sprite,
          (frame + (index * 11)) % frameCount
        );
      });

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        resolve();
      }
    }

    window.requestAnimationFrame(step);
  });
}

function updateDiceSpriteFrame(sprite, frameIndex) {
  const rows = 6;
  const columns = 8;

  const normalisedFrame = (
    (frameIndex % (rows * columns)) +
    (rows * columns)
  ) % (rows * columns);

  const row = normalisedFrame % rows;
  const column = Math.floor(
    normalisedFrame / rows
  );

  const x = columns === 1
    ? 0
    : (column / (columns - 1)) * 100;

  const y = rows === 1
    ? 0
    : (row / (rows - 1)) * 100;

  sprite.style.backgroundPosition =
    `${x}% ${y}%`;
}

function getDieShapeClass(sides) {
  if (sides <= 4) {
    return "d4";
  }

  if (sides >= 8) {
    return "d8";
  }

  return "d6";
}

function calculateRoll(effects) {
  const sides = getDieSides(effects);
  const diceMode = getDiceMode(effects);

  let rolls = [];
  let base = 0;
  let diceLabel = "";

  if (diceMode === "product-two") {
    rolls = [
      rollDie(sides),
      rollDie(sides)
    ];

    base = rolls[0] * rolls[1];
    diceLabel = `${rolls[0]} × ${rolls[1]}`;
  } else if (diceMode === "sum-two") {
    rolls = [
      rollDie(sides),
      rollDie(sides)
    ];

    base = rolls[0] + rolls[1];
    diceLabel = `${rolls[0]} + ${rolls[1]}`;
  } else {
    rolls = [rollDie(sides)];
    base = rolls[0];
    diceLabel = `${rolls[0]}`;
  }

  const addAmount = totalAddAmount(effects);
  const multiplier = totalMultiplier(effects);
  const cap = getCap(effects);

  let total = base + addAmount;

  if (multiplier !== 1) {
    total *= multiplier;
  }

  if (cap !== null) {
    total = Math.min(total, cap);
  }

  total = Math.max(1, Math.floor(total));

  const parts = [`Rolled ${diceLabel}`];

  if (addAmount > 0) {
    parts.push(`+${addAmount}`);
  } else if (addAmount < 0) {
    parts.push(String(addAmount));
  }

  if (multiplier !== 1) {
    parts.push(`×${multiplier}`);
  }

  if (cap !== null) {
    parts.push(`max ${cap}`);
  }

  return {
    total,
    sides,
    diceMode,
    rolls,
    base,
    expression: diceLabel,
    display: String(total),
    message: `${parts.join(" ")} = ${total} spaces.`
  };
}

async function moveForwardOnly(spaces) {
  let remaining = Math.max(0, Math.floor(spaces));

  while (remaining > 0) {
    const position = getPosition();
    const stepsToStart = position === 0
      ? BOARD_SIZE
      : BOARD_SIZE - position;

    if (remaining >= stepsToStart) {
      for (let step = 0; step < stepsToStart; step += 1) {
        state.progress += 1;
        renderBoard();
        renderStats();
        await sleep(MOVE_DELAY_MS);
      }

      state.coins += START_BONUS;
      state.rollsRemaining += 1;
      state.pausedAtStart = true;
      applyBackgroundForLap(getLap());
      state.boardEffects = generateBoard(getLap());

      messageText.textContent =
        `Back to Start! +${START_BONUS} coins and +1 roll. The board has changed.`;

      continueButton.classList.remove("hidden");
      rollButton.disabled = true;
      renderAll();

      return;
    }

    for (let step = 0; step < remaining; step += 1) {
      state.progress += 1;
      renderBoard();
      renderStats();
      await sleep(MOVE_DELAY_MS);
    }

    remaining = 0;
  }
}

async function moveBackwardOnly(spaces) {
  const lapStart = getLap() * BOARD_SIZE;
  const target = Math.max(
    lapStart,
    state.progress - Math.max(0, Math.floor(spaces))
  );

  while (state.progress > target) {
    state.progress -= 1;
    renderBoard();
    renderStats();
    await sleep(MOVE_DELAY_MS);
  }
}

function addRollsFromForm(event) {
  event.preventDefault();

  const amount = readWholeNumber(
    rollsToAddInput.value,
    0
  );

  if (amount <= 0) {
    messageText.textContent =
      "Enter a positive number of rolls.";
    return;
  }

  state.rollsRemaining += amount;
  rollsToAddInput.value = "1";

  messageText.textContent =
    `Added ${amount} roll${amount === 1 ? "" : "s"}.`;

  updateRollButtonState();
  renderAll();
}

function updateRollButtonState() {
  rollButton.disabled = (
    state.isBusy ||
    state.pausedAtStart ||
    state.rollsRemaining <= 0
  );

  rollButton.classList.toggle(
    "no-rolls-left",
    state.rollsRemaining <= 0
  );
}

function continueFromStart() {
  state.pausedAtStart = false;
  continueButton.classList.add("hidden");
  messageText.textContent = "New board ready.";
  updateRollButtonState();
  renderAll();
}

function renderBoard() {
  const position = getPosition();

  boardElement.innerHTML = "";

  state.boardEffects.forEach((effect, index) => {
    const space = document.createElement("div");
    const coordinates = getBoardCoordinates(index);

    space.className =
      `loop-space loop-space-${effect.type}`;

    space.style.setProperty(
      "--row",
      String(coordinates.row + 1)
    );

    space.style.setProperty(
      "--col",
      String(coordinates.column + 1)
    );

    const label = document.createElement("span");
    label.className = "loop-space-label";
    label.textContent = effect.label;

    const name = document.createElement("strong");
    name.textContent = effect.shortName;

    space.append(label, name);

    if (index === position) {
      const player = document.createElement("div");
      player.className = "loop-player-token";

      const avatar = createAvatarElement();
      const nameLabel = document.createElement("span");

      nameLabel.className = "loop-token-name";
      nameLabel.textContent = state.playerName;

      player.append(avatar, nameLabel);
      space.append(player);
    }

    boardElement.append(space);
  });
}

function renderAll() {
  renderStats();
  renderActiveEffects();
  renderSaveCode();

  if (!shopPanel.classList.contains("hidden")) {
    renderShop();
  }
}

function renderStats() {
  scoreValue.textContent = state.progress.toLocaleString("en-GB");
  coinsValue.textContent = state.coins.toLocaleString("en-GB");
  lapValue.textContent = getLap().toLocaleString("en-GB");
  rollsLeftValue.textContent = state.rollsRemaining.toLocaleString("en-GB");
}

function renderActiveEffects() {
  activeEffectsList.innerHTML = "";

  if (state.activeEffects.length === 0) {
    activeEffectsList.append(emptyNote("No active effects."));
    return;
  }

  state.activeEffects.forEach((effect) => {
    const chip = document.createElement("div");
    chip.className = effect.bad
      ? "loop-chip loop-bad-chip"
      : "loop-chip loop-good-chip";

    const detail = effect.uses
      ? `${effect.uses} use`
      : `${effect.rolls} roll${effect.rolls === 1 ? "" : "s"}`;

    chip.innerHTML =
      `<strong>${effect.name}</strong><span>${detail}</span>`;

    activeEffectsList.append(chip);
  });
}

function renderShop() {
  shopList.innerHTML = "";

  shopItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "loop-shop-item";

    const copy = document.createElement("div");
    copy.innerHTML =
      `<strong>${item.name}</strong><span>${item.description}</span>`;

    const button = document.createElement("button");
    button.type = "button";
    button.disabled = state.coins < item.price;
    button.textContent = `${item.price} coins`;
    button.addEventListener("click", () => buyPowerUp(item));

    row.append(copy, button);
    shopList.append(row);
  });
}

function buyPowerUp(item) {
  if (state.coins < item.price) {
    return;
  }

  state.coins -= item.price;
  item.effect();

  shopPanel.classList.add("hidden");

  messageText.textContent =
    `${item.name} activated.`;

  renderAll();
}

function generateBoard(lap) {
  const random = seededRandom(
    13007 + (lap * 7919)
  );

  const effects = [
    {
      type: "start",
      label: "Start",
      shortName: "START",
      name: "Start"
    }
  ];

  const pool = [
    ...repeat("coin", 8),
    ...repeat("lucky", 5),
    ...repeat("unlucky", 5),
    ...repeat("shop", 3),
    ...repeat("boost", 6)
  ];

  shuffleWithRandom(pool, random);

  pool.slice(0, BOARD_SIZE - 1).forEach((type) => {
    effects.push(createSpaceEffect(type, random));
  });

  return effects;
}

function createSpaceEffect(type, random) {
  if (type === "coin") {
    const amount = randomChoice(
      [4, 5, 6, 7, 8, 9, 10],
      random
    );

    return {
      type,
      amount,
      label: `+${amount}`,
      shortName: "Coins",
      name: "Coin cache"
    };
  }

  if (type === "boost") {
    const amount = randomChoice(
      [2, 3, 4],
      random
    );

    return {
      type,
      amount,
      label: `+${amount}`,
      shortName: "Dash",
      name: "Dash pad"
    };
  }

  if (type === "shop") {
    return {
      type,
      label: "Shop",
      shortName: "SHOP",
      name: "Shop"
    };
  }

  if (type === "lucky") {
    return {
      type,
      label: "Lucky",
      shortName: "LUCKY",
      name: "Lucky space"
    };
  }

  return {
    type,
    label: "Oops",
    shortName: "OOPS",
    name: "Unlucky space"
  };
}

function getBoardCoordinates(index) {
  if (index < 8) {
    return {
      row: 0,
      column: index
    };
  }

  if (index < 15) {
    return {
      row: index - 7,
      column: 7
    };
  }

  if (index < 22) {
    return {
      row: 7,
      column: 21 - index
    };
  }

  return {
    row: 28 - index,
    column: 0
  };
}

function getDieSides(effects) {
  const badSides = effects
    .filter((effect) => (
      effect.kind === "dieSides" &&
      effect.bad
    ))
    .map((effect) => effect.value);

  if (badSides.length > 0) {
    return Math.min(...badSides);
  }

  const goodSides = effects
    .filter((effect) => (
      effect.kind === "dieSides" &&
      effect.good
    ))
    .map((effect) => effect.value);

  if (goodSides.length > 0) {
    return Math.max(...goodSides);
  }

  return 6;
}

function getDiceMode(effects) {
  const product = effects.find(
    (effect) => (
      effect.kind === "diceMode" &&
      effect.mode === "product-two"
    )
  );

  if (product) {
    return "product-two";
  }

  const sumTwo = effects.find(
    (effect) => (
      effect.kind === "diceMode" &&
      effect.mode === "sum-two"
    )
  );

  return sumTwo ? "sum-two" : "single";
}

function totalAddAmount(effects) {
  return effects
    .filter((effect) => effect.kind === "add")
    .reduce(
      (total, effect) => total + effect.value,
      0
    );
}

function totalMultiplier(effects) {
  return effects
    .filter((effect) => effect.kind === "multiply")
    .reduce(
      (total, effect) => total * effect.value,
      1
    );
}

function getCap(effects) {
  const caps = effects
    .filter((effect) => effect.kind === "cap")
    .map((effect) => effect.value);

  if (caps.length === 0) {
    return null;
  }

  return Math.min(...caps);
}

function totalEffectValue(effects, kind) {
  return effects
    .filter((effect) => effect.kind === kind)
    .reduce(
      (total, effect) => total + effect.value,
      0
    );
}

function cloneRollEffects() {
  return state.activeEffects
    .filter((effect) => typeof effect.rolls === "number")
    .map((effect) => ({ ...effect }));
}

function applyAfterRollCoinEffects(effects) {
  effects
    .filter((effect) => effect.kind === "coinAfterRoll")
    .forEach((effect) => {
      addCoins(effect.value);
    });
}

function decrementRollEffects(effectsUsed) {
  const usedIds = new Set(
    effectsUsed.map((effect) => effect.id)
  );

  state.activeEffects = state.activeEffects
    .map((effect) => {
      if (!usedIds.has(effect.id)) {
        return effect;
      }

      return {
        ...effect,
        rolls: effect.rolls - 1
      };
    })
    .filter((effect) => (
      typeof effect.rolls !== "number" ||
      effect.rolls > 0
    ));
}

function addActiveEffect(effect) {
  state.activeEffects.push(effect);
}

function removeActiveEffect(id) {
  state.activeEffects = state.activeEffects.filter(
    (effect) => effect.id !== id
  );
}

function clearOneBadEffect() {
  const index = state.activeEffects.findIndex(
    (effect) => effect.bad
  );

  if (index >= 0) {
    state.activeEffects.splice(index, 1);
  }
}

function addCoins(amount) {
  state.coins = Math.max(
    0,
    state.coins + amount
  );
}

function createAvatarElement() {
  const avatar = document.createElement("div");
  avatar.className = "loop-board-avatar";

  const layers = [
    ["body", state.avatar.body],
    ["face", state.avatar.face],
    ["headwear", state.avatar.headwear]
  ];

  let hasLayer = false;

  layers.forEach(([kind, src]) => {
    if (!src) {
      return;
    }

    const image = document.createElement("img");

    image.className =
      `loop-avatar-layer loop-avatar-layer-${kind}`;

    image.src = `../../${src}`;
    image.alt = "";
    image.draggable = false;

    avatar.append(image);
    hasLayer = true;
  });

  if (!hasLayer) {
    const fallback = document.createElement("div");
    fallback.className = "loop-avatar-fallback";
    fallback.textContent = "🙂";
    avatar.append(fallback);
  }

  return avatar;
}

function readAvatarSelection() {
  return {
    body: safeAvatarPath(params.get("body")),
    face: safeAvatarPath(params.get("face")),
    headwear: safeAvatarPath(params.get("headwear"))
  };
}

function safeAvatarPath(value) {
  const path = String(value || "").trim();

  if (!path) {
    return "";
  }

  if (
    !path.startsWith("assets/images/loop-quest/") ||
    !path.toLowerCase().endsWith(".png")
  ) {
    return "";
  }

  return path.replace(/\\/g, "/");
}

function applyBackgroundForLap(lap) {
  const random = seededRandom(
    9403 + (lap * 6113)
  );

  const hueA = Math.floor(random() * 360);
  const hueB = (hueA + 90 + Math.floor(random() * 80)) % 360;
  const hueC = (hueA + 190 + Math.floor(random() * 80)) % 360;
  const hueD = (hueA + 270 + Math.floor(random() * 70)) % 360;

  document.body.style.setProperty(
    "--loop-bg-a",
    String(hueA)
  );

  document.body.style.setProperty(
    "--loop-bg-b",
    String(hueB)
  );

  document.body.style.setProperty(
    "--loop-bg-c",
    String(hueC)
  );

  document.body.style.setProperty(
    "--loop-bg-d",
    String(hueD)
  );
}

function renderSaveCode() {
  saveCodeOutput.value = encodeSaveCode(
    state.progress,
    state.coins
  );
}

async function copySaveCode() {
  const code = encodeSaveCode(
    state.progress,
    state.coins
  );

  saveCodeOutput.value = code;

  try {
    await navigator.clipboard.writeText(code);
    copyCodeButton.textContent = "Copied";
  } catch {
    saveCodeOutput.select();
    copyCodeButton.textContent = "Select code";
  }

  window.setTimeout(() => {
    copyCodeButton.textContent = "Copy code";
  }, 1300);
}

function encodeSaveCode(progress, coins) {
  const raw = `${progress.toString(36)}.${coins.toString(36)}`.toUpperCase();
  return `LQ-${raw}-${checksum(raw)}`;
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

function getLap() {
  return Math.floor(state.progress / BOARD_SIZE);
}

function getPosition() {
  return state.progress % BOARD_SIZE;
}

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomChoice(array, random) {
  return array[Math.floor(random() * array.length)];
}

function repeat(value, count) {
  return Array.from(
    { length: count },
    () => value
  );
}

function shuffleWithRandom(array, random) {
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
}

function seededRandom(seed) {
  let value = seed >>> 0;

  return () => {
    value += 0x6D2B79F5;

    let result = value;
    result = Math.imul(
      result ^ (result >>> 15),
      result | 1
    );

    result ^= result + Math.imul(
      result ^ (result >>> 7),
      result | 61
    );

    return (
      (result ^ (result >>> 14)) >>> 0
    ) / 4294967296;
  };
}

function uniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function emptyNote(text) {
  const note = document.createElement("p");
  note.className = "loop-empty-note";
  note.textContent = text;
  return note;
}

function readPlayerName() {
  const name = String(params.get("name") || "")
    .trim();

  return name || "Class";
}

function readWholeNumber(value, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.max(0, Math.floor(number));
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
