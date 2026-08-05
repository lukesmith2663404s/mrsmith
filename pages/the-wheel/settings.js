const WHEEL_SETTINGS_KEY = "wheelGameSettings";
const WHEEL_SETTINGS_VERSION = 3;

const DEFAULT_WHEEL_QUESTION_TYPE_IDS = [
  "positive-addition-under-100"
];

const DEFAULT_WHEEL_SETTINGS = {
  settingsVersion: WHEEL_SETTINGS_VERSION,
  roundCount: 6,
  playerCount: 1,
  questionMode: "external",
  selectedQuestionTypeIds: [
    ...DEFAULT_WHEEL_QUESTION_TYPE_IDS
  ]
};

const form = document.querySelector(
  "#wheelSettingsForm"
);

const roundCountInput = document.querySelector(
  "#roundCountInput"
);

const playerCountInput = document.querySelector(
  "#playerCountInput"
);

const questionSection = document.querySelector(
  "#wheelQuestionSection"
);

const questionChecklist = document.querySelector(
  "#questionChecklist"
);

const selectAllButton = document.querySelector(
  "#selectAllButton"
);

const clearAllButton = document.querySelector(
  "#clearAllButton"
);

const settingsError = document.querySelector(
  "#settingsError"
);

const savedSettings = loadSettings();

renderQuestionTypes();
applySettings(savedSettings);
updateQuestionModeDisplay();

form.addEventListener("submit", saveSettings);

selectAllButton.addEventListener("click", () => {
  getQuestionCheckboxes().forEach((checkbox) => {
    checkbox.checked = true;
  });
});

clearAllButton.addEventListener("click", () => {
  getQuestionCheckboxes().forEach((checkbox) => {
    checkbox.checked = false;
  });
});

document
  .querySelectorAll('input[name="questionMode"]')
  .forEach((input) => {
    input.addEventListener(
      "change",
      updateQuestionModeDisplay
    );
  });

function loadSettings() {
  const storedSettings = localStorage.getItem(
    WHEEL_SETTINGS_KEY
  );

  if (!storedSettings) {
    return createDefaultSettings();
  }

  try {
    const parsedSettings = JSON.parse(
      storedSettings
    );

    return {
      settingsVersion: WHEEL_SETTINGS_VERSION,
      roundCount: clampNumber(
        parsedSettings.roundCount,
        1,
        20,
        DEFAULT_WHEEL_SETTINGS.roundCount
      ),
      playerCount: clampNumber(
        parsedSettings.playerCount,
        1,
        8,
        DEFAULT_WHEEL_SETTINGS.playerCount
      ),
      questionMode:
        parsedSettings.questionMode === "external"
          ? "external"
          : "built-in",
      selectedQuestionTypeIds:
        getValidQuestionTypeIds(
          parsedSettings.selectedQuestionTypeIds
        )
    };
  } catch {
    return createDefaultSettings();
  }
}

function createDefaultSettings() {
  return {
    ...DEFAULT_WHEEL_SETTINGS,
    selectedQuestionTypeIds: [
      ...DEFAULT_WHEEL_QUESTION_TYPE_IDS
    ]
  };
}

function renderQuestionTypes() {
  const categories = QuestionGenerator.getCategories();
  const fragment = document.createDocumentFragment();

  categories.forEach((category) => {
    const categoryPanel = document.createElement("section");
    categoryPanel.className = "wheel-question-category";

    const categoryHeading = document.createElement("h3");
    categoryHeading.textContent = category.name;
    categoryPanel.appendChild(categoryHeading);

    category.subcategories.forEach((subcategory) => {
      const subcategoryPanel = document.createElement("section");
      subcategoryPanel.className = "wheel-question-subcategory";

      const subcategoryHeading = document.createElement("div");
      subcategoryHeading.className = "wheel-subcategory-heading";

      const subcategoryTitle = document.createElement("h4");
      subcategoryTitle.textContent = subcategory.name;

      const shortcutGroup = document.createElement("div");
      shortcutGroup.className = "wheel-subcategory-shortcuts";

      const selectButton = document.createElement("button");
      selectButton.type = "button";
      selectButton.textContent = "Select";
      selectButton.addEventListener("click", () => {
        setSubcategoryChecked(subcategory.id, true);
      });

      const clearButton = document.createElement("button");
      clearButton.type = "button";
      clearButton.textContent = "Clear";
      clearButton.addEventListener("click", () => {
        setSubcategoryChecked(subcategory.id, false);
      });

      shortcutGroup.append(selectButton, clearButton);
      subcategoryHeading.append(subcategoryTitle, shortcutGroup);

      const typeList = document.createElement("div");
      typeList.className = "wheel-question-type-list";

      subcategory.questionTypes.forEach((type) => {
        const option = document.createElement("label");
        option.className = "wheel-question-type-option";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "questionType";
        checkbox.value = type.id;
        checkbox.dataset.subcategoryId = subcategory.id;

        const description = document.createElement("span");
        description.className = "wheel-question-type-description";

        const name = document.createElement("strong");
        name.textContent = type.name;

        const expression = document.createElement("span");
        expression.className = "wheel-question-type-expression";
        expression.textContent = type.expression;

        const condition = document.createElement("span");
        condition.className = "wheel-question-type-condition";
        condition.textContent = type.condition;

        description.append(name, expression, condition);
        option.append(checkbox, description);
        typeList.appendChild(option);
      });

      subcategoryPanel.append(
        subcategoryHeading,
        typeList
      );

      categoryPanel.appendChild(subcategoryPanel);
    });

    fragment.appendChild(categoryPanel);
  });

  questionChecklist.replaceChildren(fragment);
}

function applySettings(settings) {
  roundCountInput.value = String(settings.roundCount);
  playerCountInput.value = String(settings.playerCount);

  const modeInput = document.querySelector(
    `input[name="questionMode"][value="${settings.questionMode}"]`
  );

  if (modeInput) {
    modeInput.checked = true;
  }

  const selectedQuestionTypes = new Set(
    settings.selectedQuestionTypeIds.length > 0
      ? settings.selectedQuestionTypeIds
      : DEFAULT_WHEEL_QUESTION_TYPE_IDS
  );

  getQuestionCheckboxes().forEach((checkbox) => {
    checkbox.checked = selectedQuestionTypes.has(
      checkbox.value
    );
  });
}

function saveSettings(event) {
  event.preventDefault();

  const questionMode = getSelectedQuestionMode();
  const selectedQuestionTypeIds = getQuestionCheckboxes()
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  if (
    questionMode === "built-in" &&
    selectedQuestionTypeIds.length === 0
  ) {
    settingsError.textContent =
      "Select at least one question type, or use external-question mode.";
    return;
  }

  const settings = {
    settingsVersion: WHEEL_SETTINGS_VERSION,
    roundCount: clampNumber(
      roundCountInput.value,
      1,
      20,
      DEFAULT_WHEEL_SETTINGS.roundCount
    ),
    playerCount: clampNumber(
      playerCountInput.value,
      1,
      8,
      DEFAULT_WHEEL_SETTINGS.playerCount
    ),
    questionMode,
    selectedQuestionTypeIds:
      selectedQuestionTypeIds.length > 0
        ? selectedQuestionTypeIds
        : [
            ...DEFAULT_WHEEL_QUESTION_TYPE_IDS
          ]
  };

  localStorage.setItem(
    WHEEL_SETTINGS_KEY,
    JSON.stringify(settings)
  );

  window.location.href = "game.html";
}

function updateQuestionModeDisplay() {
  const builtInMode = (
    getSelectedQuestionMode() === "built-in"
  );

  questionSection.classList.toggle(
    "hidden",
    !builtInMode
  );

  settingsError.textContent = "";
}

function getSelectedQuestionMode() {
  const checkedInput = document.querySelector(
    'input[name="questionMode"]:checked'
  );

  return checkedInput?.value === "external"
    ? "external"
    : "built-in";
}

function getQuestionCheckboxes() {
  return Array.from(
    document.querySelectorAll(
      'input[name="questionType"]'
    )
  );
}

function setSubcategoryChecked(
  subcategoryId,
  checked
) {
  getQuestionCheckboxes()
    .filter((checkbox) => {
      return (
        checkbox.dataset.subcategoryId ===
        subcategoryId
      );
    })
    .forEach((checkbox) => {
      checkbox.checked = checked;
    });
}

function getValidQuestionTypeIds(typeIds) {
  if (!Array.isArray(typeIds)) {
    return [];
  }

  return typeIds.filter((typeId) => {
    return (
      QuestionGenerator.getQuestionType(typeId) !==
      null
    );
  });
}

function clampNumber(
  value,
  minimum,
  maximum,
  fallback
) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(
    minimum,
    Math.min(
      maximum,
      Math.round(numberValue)
    )
  );
}
