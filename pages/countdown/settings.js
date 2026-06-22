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

const form = document.querySelector("#countdownSettingsForm");
const numbersEnabled = document.querySelector("#numbersEnabled");
const lettersEnabled = document.querySelector("#lettersEnabled");
const numbersOptions = document.querySelector("#numbersOptions");
const lettersOptions = document.querySelector("#lettersOptions");
const largeNumberCount = document.querySelector("#largeNumberCount");
const vowelCount = document.querySelector("#vowelCount");
const roundSeconds = document.querySelector("#roundSeconds");
const soundEnabled = document.querySelector("#soundEnabled");
const showSolutionCount = document.querySelector("#showSolutionCount");
const showBestWordLength = document.querySelector("#showBestWordLength");
const settingsMessage = document.querySelector("#settingsMessage");

const settings = loadSettings();
applySettings(settings);
updateOptionAvailability();

numbersEnabled.addEventListener("change", updateOptionAvailability);
lettersEnabled.addEventListener("change", updateOptionAvailability);
form.addEventListener("submit", saveAndStart);

function loadSettings() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(COUNTDOWN_SETTINGS_KEY)
    );

    if (!parsed || typeof parsed !== "object") {
      return { ...DEFAULT_SETTINGS };
    }

    const validRoundTypes = Array.isArray(parsed.roundTypes)
      ? parsed.roundTypes.filter((type) => (
        type === "numbers" || type === "letters"
      ))
      : [];

    return {
      roundTypes: validRoundTypes.length
        ? [...new Set(validRoundTypes)]
        : ["numbers"],
      largeNumberCount: clampInteger(
        parsed.largeNumberCount,
        0,
        4,
        DEFAULT_SETTINGS.largeNumberCount
      ),
      vowelCount: clampInteger(
        parsed.vowelCount,
        3,
        5,
        DEFAULT_SETTINGS.vowelCount
      ),
      roundSeconds: clampInteger(
        parsed.roundSeconds,
        10,
        120,
        DEFAULT_SETTINGS.roundSeconds
      ),
      soundEnabled: Boolean(parsed.soundEnabled),
      showSolutionCount: Boolean(parsed.showSolutionCount),
      showBestWordLength: Boolean(parsed.showBestWordLength)
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function applySettings(currentSettings) {
  numbersEnabled.checked = currentSettings.roundTypes.includes("numbers");
  lettersEnabled.checked = currentSettings.roundTypes.includes("letters");
  largeNumberCount.value = String(currentSettings.largeNumberCount);
  vowelCount.value = String(currentSettings.vowelCount);
  roundSeconds.value = String(currentSettings.roundSeconds);
  soundEnabled.checked = currentSettings.soundEnabled;
  showSolutionCount.checked = currentSettings.showSolutionCount;
  showBestWordLength.checked = currentSettings.showBestWordLength;
}

function updateOptionAvailability() {
  numbersOptions.classList.toggle(
    "is-disabled",
    !numbersEnabled.checked
  );
  lettersOptions.classList.toggle(
    "is-disabled",
    !lettersEnabled.checked
  );
  settingsMessage.textContent = "";
}

function saveAndStart(event) {
  event.preventDefault();

  const roundTypes = [];
  if (numbersEnabled.checked) roundTypes.push("numbers");
  if (lettersEnabled.checked) roundTypes.push("letters");

  if (!roundTypes.length) {
    settingsMessage.textContent = "Select Numbers, Letters or both.";
    return;
  }

  const nextSettings = {
    roundTypes,
    largeNumberCount: clampInteger(
      largeNumberCount.value,
      0,
      4,
      DEFAULT_SETTINGS.largeNumberCount
    ),
    vowelCount: clampInteger(
      vowelCount.value,
      3,
      5,
      DEFAULT_SETTINGS.vowelCount
    ),
    roundSeconds: clampInteger(
      roundSeconds.value,
      10,
      120,
      DEFAULT_SETTINGS.roundSeconds
    ),
    soundEnabled: soundEnabled.checked,
    showSolutionCount: showSolutionCount.checked,
    showBestWordLength: showBestWordLength.checked
  };

  localStorage.setItem(
    COUNTDOWN_SETTINGS_KEY,
    JSON.stringify(nextSettings)
  );

  window.location.href = "game.html";
}

function clampInteger(value, minimum, maximum, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}
