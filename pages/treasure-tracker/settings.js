const DEFAULT_TREASURE_TRACKER_SETTINGS = {
  gridSize: 5,
  allowNegativeTargets: true,
  allowFractionTargets: false,
  useStartSquare: false
};

const TREASURE_TRACKER_SETTINGS_KEY = "treasureTrackerSettings";
const OLD_NAVIGATOR_SETTINGS_KEY = "navigatorSettings";

const form = document.querySelector("#treasureTrackerSettingsForm");
const gridSizeInput = document.querySelector("#gridSize");
const allowNegativeTargetsInput = document.querySelector("#allowNegativeTargets");
const allowFractionTargetsInput = document.querySelector("#allowFractionTargets");
const useStartSquareInput = document.querySelector("#useStartSquare");

loadSavedSettings();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const settings = {
    gridSize: Number(gridSizeInput.value),
    allowNegativeTargets: allowNegativeTargetsInput.checked,
    allowFractionTargets: allowFractionTargetsInput.checked,
    useStartSquare: useStartSquareInput.checked
  };

  localStorage.setItem(TREASURE_TRACKER_SETTINGS_KEY, JSON.stringify(settings));

  window.location.href = "game.html";
});

function loadSavedSettings() {
  const savedSettings =
    localStorage.getItem(TREASURE_TRACKER_SETTINGS_KEY) ||
    localStorage.getItem(OLD_NAVIGATOR_SETTINGS_KEY);

  if (!savedSettings) {
    applySettingsToForm(DEFAULT_TREASURE_TRACKER_SETTINGS);
    return;
  }

  applySettingsToForm({
    ...DEFAULT_TREASURE_TRACKER_SETTINGS,
    ...JSON.parse(savedSettings)
  });
}

function applySettingsToForm(settings) {
  gridSizeInput.value = String(settings.gridSize);
  allowNegativeTargetsInput.checked = settings.allowNegativeTargets;
  allowFractionTargetsInput.checked = settings.allowFractionTargets;
  useStartSquareInput.checked = settings.useStartSquare;
}