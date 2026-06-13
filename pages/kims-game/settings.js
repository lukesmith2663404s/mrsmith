const KIMS_SETTINGS_VERSION = 3;
const KIMS_SETTINGS_KEY = "kimsGameSettings";

const DEFAULT_KIMS_QUESTION_TYPE_IDS = [
  "positive-addition-under-100"
];

const DEFAULT_KIMS_SETTINGS = {
  settingsVersion: KIMS_SETTINGS_VERSION,
  cardCount: 4,
  timerEnabled: false,
  timerDuration: 20,
  selectedQuestionTypeIds: [...DEFAULT_KIMS_QUESTION_TYPE_IDS]
};

const form = document.querySelector("#kimsSettingsForm");
const cardCountInput = document.querySelector("#cardCount");
const timerEnabledInput = document.querySelector("#timerEnabled");
const timerDurationInput = document.querySelector("#timerDuration");
const checklist = document.querySelector("#questionTypeChecklist");
const settingsError = document.querySelector("#settingsError");
const selectAllButton = document.querySelector("#selectAllButton");
const clearAllButton = document.querySelector("#clearAllButton");

renderQuestionChecklist();
loadSavedSettings();
updateTimerInputState();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  settingsError.textContent = "";

  const cardCount = clampNumber(
    Number(cardCountInput.value),
    4,
    20
  );

  const timerDuration = clampNumber(
    Number(timerDurationInput.value),
    1,
    600
  );

  const selectedQuestionTypeIds = getSelectedQuestionTypeIds();

  if (selectedQuestionTypeIds.length === 0) {
    settingsError.textContent =
      "Select at least one question type.";
    return;
  }

  if (
    timerEnabledInput.checked &&
    !isValidTimerDuration(timerDurationInput.value)
  ) {
    settingsError.textContent =
      "Enter a timer duration between 1 and 600 seconds.";
    return;
  }

  const settings = {
    settingsVersion: KIMS_SETTINGS_VERSION,
    cardCount,
    timerEnabled: timerEnabledInput.checked,
    timerDuration,
    selectedQuestionTypeIds
  };

  localStorage.setItem(
    KIMS_SETTINGS_KEY,
    JSON.stringify(settings)
  );

  window.location.href = "game.html";
});

timerEnabledInput.addEventListener("change", () => {
  updateTimerInputState();

  if (timerEnabledInput.checked) {
    timerDurationInput.focus();
    timerDurationInput.select();
  }
});

selectAllButton.addEventListener("click", () => {
  const allIds = QuestionGenerator
    .getAllQuestionTypes()
    .map((questionType) => {
      return questionType.id;
    });

  setSelectedQuestionTypes(allIds);
});

clearAllButton.addEventListener("click", () => {
  setSelectedQuestionTypes([]);
});

function renderQuestionChecklist() {
  checklist.innerHTML = "";

  QuestionGenerator.getCategories().forEach((category) => {
    const categorySection = document.createElement("section");
    categorySection.className = "question-category";

    const categoryHeading = document.createElement("h3");
    categoryHeading.textContent = category.name;

    categorySection.appendChild(categoryHeading);

    category.subcategories.forEach((subcategory) => {
      const subcategorySection = document.createElement("section");
      subcategorySection.className = "question-subcategory";

      const subcategoryHeading =
        createSubcategoryHeading(subcategory);

      const typeList = document.createElement("div");
      typeList.className = "question-type-list";

      subcategory.questionTypes.forEach((questionType) => {
        typeList.appendChild(
          createQuestionTypeOption(questionType)
        );
      });

      subcategorySection.append(
        subcategoryHeading,
        typeList
      );

      categorySection.appendChild(subcategorySection);
    });

    checklist.appendChild(categorySection);
  });
}

function createSubcategoryHeading(subcategory) {
  const headingRow = document.createElement("div");
  headingRow.className = "question-subcategory-heading";

  const heading = document.createElement("h4");
  heading.textContent = subcategory.name;

  const actions = document.createElement("div");
  actions.className = "subcategory-shortcuts";

  const selectButton = document.createElement("button");
  selectButton.type = "button";
  selectButton.textContent = "Select all";

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.textContent = "Clear";

  selectButton.addEventListener("click", () => {
    setSubcategorySelection(subcategory, true);
  });

  clearButton.addEventListener("click", () => {
    setSubcategorySelection(subcategory, false);
  });

  actions.append(selectButton, clearButton);
  headingRow.append(heading, actions);

  return headingRow;
}

function createQuestionTypeOption(questionType) {
  const label = document.createElement("label");
  label.className = "question-type-option";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.name = "questionType";
  checkbox.value = questionType.id;

  const description = document.createElement("span");
  description.className = "question-type-description";

  const name = document.createElement("strong");
  name.textContent = questionType.name;

  const expression = document.createElement("span");
  expression.className = "question-type-expression";
  expression.textContent = questionType.expression;

  const condition = document.createElement("span");
  condition.className = "question-type-condition";
  condition.textContent = `(${questionType.condition})`;

  description.append(name, expression, condition);
  label.append(checkbox, description);

  return label;
}

function setSubcategorySelection(subcategory, selected) {
  const typeIds = new Set(
    subcategory.questionTypes.map((questionType) => {
      return questionType.id;
    })
  );

  document
    .querySelectorAll('input[name="questionType"]')
    .forEach((checkbox) => {
      if (typeIds.has(checkbox.value)) {
        checkbox.checked = selected;
      }
    });
}

function loadSavedSettings() {
  const savedSettings = localStorage.getItem(KIMS_SETTINGS_KEY);

  if (!savedSettings) {
    applySettings(DEFAULT_KIMS_SETTINGS);
    return;
  }

  try {
    const parsedSettings = JSON.parse(savedSettings);

    if (
      parsedSettings.settingsVersion !==
      KIMS_SETTINGS_VERSION
    ) {
      applySettings(DEFAULT_KIMS_SETTINGS);
      return;
    }

    applySettings({
      ...DEFAULT_KIMS_SETTINGS,
      ...parsedSettings
    });
  } catch {
    applySettings(DEFAULT_KIMS_SETTINGS);
  }
}

function applySettings(settings) {
  cardCountInput.value = clampNumber(
    Number(settings.cardCount),
    4,
    20
  );

  timerEnabledInput.checked =
    settings.timerEnabled === true;

  timerDurationInput.value = clampNumber(
    Number(settings.timerDuration),
    1,
    600
  );

  const validSelectedIds = getValidQuestionTypeIds(
    settings.selectedQuestionTypeIds
  );

  setSelectedQuestionTypes(
    validSelectedIds.length > 0
      ? validSelectedIds
      : DEFAULT_KIMS_QUESTION_TYPE_IDS
  );

  updateTimerInputState();
}

function updateTimerInputState() {
  timerDurationInput.disabled =
    !timerEnabledInput.checked;
}

function getSelectedQuestionTypeIds() {
  return [
    ...document.querySelectorAll(
      'input[name="questionType"]:checked'
    )
  ].map((checkbox) => {
    return checkbox.value;
  });
}

function getValidQuestionTypeIds(typeIds) {
  if (!Array.isArray(typeIds)) {
    return [];
  }

  return typeIds.filter((typeId) => {
    return QuestionGenerator.getQuestionType(typeId) !== null;
  });
}

function setSelectedQuestionTypes(typeIds) {
  const selectedIds = new Set(typeIds);

  document
    .querySelectorAll('input[name="questionType"]')
    .forEach((checkbox) => {
      checkbox.checked = selectedIds.has(checkbox.value);
    });
}

function isValidTimerDuration(value) {
  const numericValue = Number(value);

  return (
    Number.isInteger(numericValue) &&
    numericValue >= 1 &&
    numericValue <= 600
  );
}

function clampNumber(value, minimum, maximum) {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.min(
    maximum,
    Math.max(minimum, Math.round(value))
  );
}