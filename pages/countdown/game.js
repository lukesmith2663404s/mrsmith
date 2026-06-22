const COUNTDOWN_SETTINGS_KEY = "countdownSettingsV1";

const DEFAULT_SETTINGS = Object.freeze({
  roundTypes: ["numbers"],
  largeNumberCount: 2,
  vowelCount: 4,
  roundSeconds: 30,
  soundEnabled: false,
  showSolutionCount: false,
  showBestWordLength: false
});

const LARGE_NUMBERS = Object.freeze([25, 50, 75, 100]);
const SMALL_NUMBERS = Object.freeze([
  1, 1, 2, 2, 3, 3, 4, 4, 5, 5,
  6, 6, 7, 7, 8, 8, 9, 9, 10, 10
]);
const VOWEL_BAG = Object.freeze(
  "AAAAAAAAAAAAAAAEEEEEEEEEEEEEEEEEEEEEIIIIIIIIIIIIIOOOOOOOOOOOOOUUUUU".split("")
);
const CONSONANT_BAG = Object.freeze(
  "BBCCCDDDDDDFFGGGHHJKLLLLLMMMMNNNNNNNNPPPPQRRRRRRRRRSSSSSSSSSTTTTTTTTTVWWXYYZ".split("")
);

const settings = loadSettings();
const wordBank = Array.isArray(globalThis.CountdownWordBank)
  ? globalThis.CountdownWordBank
  : [];
const wordSet = new Set(wordBank);
const seedWords = Array.isArray(globalThis.CountdownSeedWords)
  ? globalThis.CountdownSeedWords
  : wordBank.filter((word) => word.length >= 7 && word.length <= 9);

let activeRoundType = settings.roundTypes[0];
let currentNumbersRound = null;
let currentLettersRound = null;
let generationId = 0;
let numberWorker = null;
let timerState = createTimerState();
let animationFrameId = null;
let audioContext = null;
let lastTickSecond = null;

const roundTypeSwitcher = document.querySelector("#roundTypeSwitcher");
const numbersRound = document.querySelector("#numbersRound");
const lettersRound = document.querySelector("#lettersRound");
const numberTiles = document.querySelector("#numberTiles");
const targetNumber = document.querySelector("#targetNumber");
const numbersStatus = document.querySelector("#numbersStatus");
const newNumbersButton = document.querySelector("#newNumbersButton");
const showSolutionsButton = document.querySelector("#showSolutionsButton");
const letterTiles = document.querySelector("#letterTiles");
const lettersStatus = document.querySelector("#lettersStatus");
const newLettersButton = document.querySelector("#newLettersButton");
const showWordsButton = document.querySelector("#showWordsButton");
const wordCheckForm = document.querySelector("#wordCheckForm");
const wordInput = document.querySelector("#wordInput");
const wordCheckMessage = document.querySelector("#wordCheckMessage");
const countdownClock = document.querySelector("#countdownClock");
const clockSeconds = document.querySelector("#clockSeconds");
const clockMessage = document.querySelector("#clockMessage");
const startClockButton = document.querySelector("#startClockButton");
const pauseClockButton = document.querySelector("#pauseClockButton");
const resetClockButton = document.querySelector("#resetClockButton");
const solutionsDialog = document.querySelector("#solutionsDialog");
const solutionsHeading = document.querySelector("#solutionsHeading");
const solutionsSummary = document.querySelector("#solutionsSummary");
const solutionsList = document.querySelector("#solutionsList");
const wordsDialog = document.querySelector("#wordsDialog");
const wordsHeading = document.querySelector("#wordsHeading");
const wordsSummary = document.querySelector("#wordsSummary");
const bestWordsList = document.querySelector("#bestWordsList");
const allWordsList = document.querySelector("#allWordsList");

buildRoundTypeSwitcher();
showRound(activeRoundType);
resetTimer();

if (settings.roundTypes.includes("numbers")) {
  generateNumbersRound();
}
if (settings.roundTypes.includes("letters")) {
  generateLettersRound();
}

newNumbersButton.addEventListener("click", generateNumbersRound);
showSolutionsButton.addEventListener("click", showEverySolution);
newLettersButton.addEventListener("click", generateLettersRound);
showWordsButton.addEventListener("click", showBestWords);
wordCheckForm.addEventListener("submit", checkEnteredWord);
startClockButton.addEventListener("click", startClock);
pauseClockButton.addEventListener("click", togglePauseClock);
resetClockButton.addEventListener("click", resetTimer);

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById(button.dataset.closeDialog)?.close();
  });
});

[solutionsDialog, wordsDialog].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

function loadSettings() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(COUNTDOWN_SETTINGS_KEY)
    );
    const roundTypes = Array.isArray(parsed?.roundTypes)
      ? parsed.roundTypes.filter((type) => type === "numbers" || type === "letters")
      : [];

    return {
      roundTypes: roundTypes.length
        ? [...new Set(roundTypes)]
        : [...DEFAULT_SETTINGS.roundTypes],
      largeNumberCount: clampInteger(parsed?.largeNumberCount, 0, 4, 2),
      vowelCount: clampInteger(parsed?.vowelCount, 3, 5, 4),
      roundSeconds: clampInteger(parsed?.roundSeconds, 10, 120, 30),
      soundEnabled: Boolean(parsed?.soundEnabled),
      showSolutionCount: Boolean(parsed?.showSolutionCount),
      showBestWordLength: Boolean(parsed?.showBestWordLength)
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function buildRoundTypeSwitcher() {
  roundTypeSwitcher.innerHTML = "";

  if (settings.roundTypes.length < 2) {
    roundTypeSwitcher.hidden = true;
    return;
  }

  settings.roundTypes.forEach((type) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "round-type-button";
    button.dataset.roundType = type;
    button.textContent = type === "numbers" ? "Numbers" : "Letters";
    button.addEventListener("click", () => showRound(type));
    roundTypeSwitcher.appendChild(button);
  });
}

function showRound(type) {
  activeRoundType = type;
  numbersRound.hidden = type !== "numbers";
  lettersRound.hidden = type !== "letters";

  roundTypeSwitcher.querySelectorAll("button").forEach((button) => {
    const selected = button.dataset.roundType === type;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  resetTimer();
}

async function generateNumbersRound() {
  const requestId = ++generationId;
  resetTimer();
  currentNumbersRound = null;
  targetNumber.textContent = "---";
  numbersStatus.textContent = "Generating a guaranteed round…";
  newNumbersButton.disabled = true;
  showSolutionsButton.disabled = true;

  const numbers = selectNumbers(settings.largeNumberCount);
  renderNumberTiles(numbers, true);

  try {
    const result = await solveNumbersInWorker(numbers);
    if (requestId !== generationId) return;

    currentNumbersRound = result;
    targetNumber.textContent = String(result.target);
    renderNumberTiles(result.numbers, false);
    numbersStatus.textContent = settings.showSolutionCount
      ? `${result.solutions.length} distinct exact ${pluralise(result.solutions.length, "solution")} available.`
      : "";
    showSolutionsButton.disabled = false;
  } catch (error) {
    if (requestId !== generationId) return;

    numbersStatus.textContent = error instanceof Error
      ? error.message
      : "The round could not be generated.";
    renderNumberTiles(numbers, false);
  } finally {
    if (requestId === generationId) {
      newNumbersButton.disabled = false;
    }
  }
}

function selectNumbers(largeCount) {
  const largePool = shuffle([...LARGE_NUMBERS]);
  const smallPool = shuffle([...SMALL_NUMBERS]);
  return shuffle([
    ...largePool.slice(0, largeCount),
    ...smallPool.slice(0, 6 - largeCount)
  ]);
}

function solveNumbersInWorker(numbers) {
  return new Promise((resolve, reject) => {
    const solveOnMainThread = () => {
      window.setTimeout(() => {
        try {
          resolve(
            CountdownNumberSolver.createGuaranteedRound(numbers)
          );
        } catch (error) {
          reject(error);
        }
      }, 0);
    };

    const canUseWorker = (
      typeof Worker !== "undefined" &&
      window.location.protocol !== "file:"
    );

    if (!canUseWorker) {
      solveOnMainThread();
      return;
    }

    numberWorker?.terminate();

    try {
      numberWorker = new Worker("number-worker.js");
    } catch {
      numberWorker = null;
      solveOnMainThread();
      return;
    }

    numberWorker.addEventListener("message", (event) => {
      numberWorker?.terminate();
      numberWorker = null;

      if (event.data?.ok) {
        resolve(event.data.result);
      } else {
        reject(
          new Error(
            event.data?.error ||
            "The round could not be generated."
          )
        );
      }
    }, { once: true });

    numberWorker.addEventListener("error", () => {
      numberWorker?.terminate();
      numberWorker = null;
      solveOnMainThread();
    }, { once: true });

    try {
      numberWorker.postMessage({ numbers });
    } catch {
      numberWorker?.terminate();
      numberWorker = null;
      solveOnMainThread();
    }
  });
}

function renderNumberTiles(numbers, loading) {
  numberTiles.innerHTML = "";

  numbers.forEach((number, index) => {
    const tile = document.createElement("span");
    tile.className = "countdown-number-tile";
    tile.style.setProperty("--tile-delay", `${index * 55}ms`);

    if (loading) {
      tile.classList.add("is-loading");
    } else {
      tile.textContent = String(number);
    }

    numberTiles.appendChild(tile);
  });
}

function showEverySolution() {
  if (!currentNumbersRound) return;

  solutionsHeading.textContent = `Make ${currentNumbersRound.target}`;
  solutionsSummary.textContent = `${currentNumbersRound.solutions.length} distinct exact ${pluralise(currentNumbersRound.solutions.length, "solution")} using each tile no more than once.`;
  solutionsList.innerHTML = "";

  currentNumbersRound.solutions.forEach((solution) => {
    const listItem = document.createElement("li");
    const expression = document.createElement("span");
    const equals = document.createElement("strong");

    expression.textContent = solution.expression;
    equals.textContent = `= ${currentNumbersRound.target}`;
    listItem.append(expression, equals);
    solutionsList.appendChild(listItem);
  });

  solutionsDialog.showModal();
}

function generateLettersRound() {
  resetTimer();
  wordInput.value = "";
  wordCheckMessage.textContent = "";

  const letters = createGuaranteedLetterSet(settings.vowelCount);
  const availableWords = findAvailableWords(letters);
  const bestLength = availableWords.length
    ? availableWords[0].length
    : 0;
  const bestWords = availableWords.filter((word) => word.length === bestLength);

  currentLettersRound = {
    letters,
    availableWords,
    bestWords,
    bestLength
  };

  renderLetterTiles(letters);
  lettersStatus.textContent = settings.showBestWordLength && bestLength
    ? `At least one ${bestLength}-letter word is available.`
    : "";
}

function createGuaranteedLetterSet(vowelTarget) {
  const consonantTarget = 9 - vowelTarget;
  const eligibleSeeds = seedWords.filter((word) => {
    const vowelCount = countVowels(word);
    const consonantCount = word.length - vowelCount;
    return vowelCount <= vowelTarget &&
      consonantCount <= consonantTarget &&
      canDrawFromBags(word);
  });

  const seed = eligibleSeeds.length
    ? eligibleSeeds[Math.floor(Math.random() * eligibleSeeds.length)]
    : "reaction";

  const letters = seed.toUpperCase().split("");
  let currentVowels = letters.filter(isVowel).length;
  let currentConsonants = letters.length - currentVowels;

  const vowelPool = removeUsedLetters([...VOWEL_BAG], letters.filter(isVowel));
  const consonantPool = removeUsedLetters([...CONSONANT_BAG], letters.filter((letter) => !isVowel(letter)));

  while (currentVowels < vowelTarget) {
    letters.push(drawRandom(vowelPool));
    currentVowels += 1;
  }

  while (currentConsonants < consonantTarget) {
    letters.push(drawRandom(consonantPool));
    currentConsonants += 1;
  }

  return shuffle(letters.slice(0, 9));
}

function canDrawFromBags(word) {
  const needed = letterCounts(word.toUpperCase().split(""));
  const available = letterCounts([...VOWEL_BAG, ...CONSONANT_BAG]);
  return [...needed].every(([letter, count]) => (
    count <= (available.get(letter) || 0)
  ));
}

function removeUsedLetters(pool, usedLetters) {
  const remaining = [...pool];
  usedLetters.forEach((letter) => {
    const index = remaining.indexOf(letter);
    if (index >= 0) remaining.splice(index, 1);
  });
  return remaining;
}

function findAvailableWords(letters) {
  const availableCounts = letterCounts(letters);

  return wordBank
    .filter((word) => {
      if (word.length > letters.length) return false;
      const needed = letterCounts(word.toUpperCase().split(""));
      return [...needed].every(([letter, count]) => (
        count <= (availableCounts.get(letter) || 0)
      ));
    })
    .sort((left, right) => (
      right.length - left.length ||
      left.localeCompare(right)
    ));
}

function renderLetterTiles(letters) {
  letterTiles.innerHTML = "";

  letters.forEach((letter, index) => {
    const tile = document.createElement("span");
    tile.className = "countdown-letter-tile";
    tile.style.setProperty("--tile-delay", `${index * 55}ms`);
    tile.textContent = letter;
    letterTiles.appendChild(tile);
  });
}

function checkEnteredWord(event) {
  event.preventDefault();

  if (!currentLettersRound) return;

  const word = wordInput.value
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  wordCheckMessage.classList.remove("is-success", "is-error");

  if (word.length < 2) {
    setWordMessage("Enter a word with at least two letters.", false);
    return;
  }

  if (!canFormWord(word, currentLettersRound.letters)) {
    setWordMessage("That word uses letters that are not available.", false);
    return;
  }

  if (!wordSet.has(word)) {
    setWordMessage("That word is not in the built-in classroom dictionary.", false);
    return;
  }

  setWordMessage(
    `${word.toUpperCase()} scores ${word.length}.`,
    true
  );
}

function canFormWord(word, letters) {
  const available = letterCounts(letters);
  const needed = letterCounts(word.toUpperCase().split(""));
  return [...needed].every(([letter, count]) => (
    count <= (available.get(letter) || 0)
  ));
}

function setWordMessage(message, success) {
  wordCheckMessage.textContent = message;
  wordCheckMessage.classList.add(success ? "is-success" : "is-error");
}

function showBestWords() {
  if (!currentLettersRound) return;

  wordsHeading.textContent = `${currentLettersRound.bestLength}-letter words`;
  wordsSummary.textContent = `${currentLettersRound.bestWords.length} best ${pluralise(currentLettersRound.bestWords.length, "word")} found from ${currentLettersRound.letters.join(" ")}.`;

  bestWordsList.innerHTML = "";
  currentLettersRound.bestWords.forEach((word) => {
    const span = document.createElement("span");
    span.textContent = word.toUpperCase();
    bestWordsList.appendChild(span);
  });

  allWordsList.innerHTML = "";
  const byLength = new Map();
  currentLettersRound.availableWords.forEach((word) => {
    if (!byLength.has(word.length)) byLength.set(word.length, []);
    byLength.get(word.length).push(word);
  });

  [...byLength.entries()]
    .sort((left, right) => right[0] - left[0])
    .forEach(([length, words]) => {
      const section = document.createElement("section");
      const heading = document.createElement("h3");
      const paragraph = document.createElement("p");
      heading.textContent = `${length} letters`;
      paragraph.textContent = words.map((word) => word.toUpperCase()).join(" · ");
      section.append(heading, paragraph);
      allWordsList.appendChild(section);
    });

  wordsDialog.showModal();
}

function createTimerState() {
  return {
    durationMs: settings.roundSeconds * 1000,
    remainingMs: settings.roundSeconds * 1000,
    running: false,
    startedAt: 0
  };
}

function startClock() {
  ensureAudioContext();

  if (timerState.remainingMs <= 0) {
    timerState.remainingMs = timerState.durationMs;
  }

  timerState.running = true;
  timerState.startedAt = performance.now();
  lastTickSecond = Math.ceil(timerState.remainingMs / 1000);
  startClockButton.disabled = true;
  pauseClockButton.disabled = false;
  pauseClockButton.textContent = "Pause";
  clockMessage.textContent = "Clock running";
  countdownClock.classList.add("is-running");
  countdownClock.classList.remove("is-finished");
  tickTimer();
}

function togglePauseClock() {
  if (timerState.running) {
    updateRemainingTime(performance.now());
    timerState.running = false;
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    startClockButton.disabled = false;
    startClockButton.textContent = "Resume";
    pauseClockButton.disabled = true;
    clockMessage.textContent = "Paused";
    countdownClock.classList.remove("is-running");
  }
}

function resetTimer() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  timerState = createTimerState();
  lastTickSecond = null;
  startClockButton.disabled = false;
  startClockButton.textContent = "Start Clock";
  pauseClockButton.disabled = true;
  pauseClockButton.textContent = "Pause";
  clockMessage.textContent = "Ready";
  countdownClock.classList.remove("is-running", "is-finished");
  renderTimer();
}

function tickTimer(now = performance.now()) {
  if (!timerState.running) return;

  updateRemainingTime(now);
  renderTimer();

  const currentSecond = Math.ceil(timerState.remainingMs / 1000);
  if (
    settings.soundEnabled &&
    currentSecond !== lastTickSecond &&
    currentSecond > 0
  ) {
    playTick(currentSecond <= 5);
  }
  lastTickSecond = currentSecond;

  if (timerState.remainingMs <= 0) {
    finishTimer();
    return;
  }

  animationFrameId = requestAnimationFrame(tickTimer);
}

function updateRemainingTime(now) {
  const elapsed = now - timerState.startedAt;
  timerState.remainingMs = Math.max(0, timerState.remainingMs - elapsed);
  timerState.startedAt = now;
}

function renderTimer() {
  const remainingRatio = Math.max(
    0,
    Math.min(
      1,
      timerState.durationMs > 0
        ? timerState.remainingMs / timerState.durationMs
        : 0
    )
  );
  const elapsedDegrees = (1 - remainingRatio) * 360;
  const colourHue = remainingRatio * 120;
  const seconds = Math.ceil(timerState.remainingMs / 1000);

  countdownClock.style.setProperty(
    "--clock-elapsed",
    `${elapsedDegrees}deg`
  );
  countdownClock.style.setProperty(
    "--clock-colour",
    `hsl(${colourHue} 82% 45%)`
  );
  clockSeconds.textContent = String(seconds);
}

function finishTimer() {
  timerState.running = false;
  timerState.remainingMs = 0;
  animationFrameId = null;
  startClockButton.disabled = false;
  startClockButton.textContent = "Restart";
  pauseClockButton.disabled = true;
  countdownClock.classList.remove("is-running");
  countdownClock.classList.add("is-finished");
  clockMessage.textContent = "Time!";
  renderTimer();
  if (settings.soundEnabled) playFinishTone();
}

function ensureAudioContext() {
  if (!settings.soundEnabled) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!audioContext && AudioContextClass) audioContext = new AudioContextClass();
  if (audioContext?.state === "suspended") audioContext.resume();
}

function playTick(urgent) {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(urgent ? 760 : 520, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.085);
}

function playFinishTone() {
  if (!audioContext) return;
  [0, 0.13, 0.26].forEach((delay, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = audioContext.currentTime + delay;
    oscillator.type = "triangle";
    oscillator.frequency.value = [440, 554, 659][index];
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.12, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.2);
  });
}

function countVowels(word) {
  return [...word].filter((letter) => "aeiou".includes(letter)).length;
}

function isVowel(letter) {
  return "AEIOU".includes(letter);
}

function letterCounts(letters) {
  const counts = new Map();
  letters.forEach((letter) => {
    counts.set(letter, (counts.get(letter) || 0) + 1);
  });
  return counts;
}

function drawRandom(pool) {
  if (!pool.length) throw new Error("The letter bag is empty.");
  const index = Math.floor(Math.random() * pool.length);
  return pool.splice(index, 1)[0];
}

function shuffle(values) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[randomIndex]] = [values[randomIndex], values[index]];
  }
  return values;
}

function clampInteger(value, minimum, maximum, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

function pluralise(count, singular) {
  return count === 1 ? singular : `${singular}s`;
}
