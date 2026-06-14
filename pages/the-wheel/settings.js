const WHEEL_SETTINGS_KEY = "wheelGameSettings";
const WHEEL_SETTINGS_VERSION = 1;

const DEFAULT_WHEEL_QUESTION_TYPE_IDS = [
  "positive-addition-under-100"
];

const DEFAULT_WHEEL_SETTINGS = {
  settingsVersion: WHEEL_SETTINGS_VERSION,
  roundCount: 6,
  playerCount: 1,
  selectedQuestionTypeIds: [
    ...DEFAULT_WHEEL_QUESTION_TYPE_IDS
  ]
};

const form = document.querySelector(
  "#wheelSettingsForm"
);

const roundCountInput = document.querySelector(
  "#roundCount"
);

const playerCountInput = document.querySelector(
  "#playerCount"
);

const checklist = document.querySelector(
  "#questionTypeChecklist"
);

const settingsError = document.querySelector(
  "#settingsError"
);

const selectAllButton = document.querySelector(
  "#selectAllButton"
);

const clearAllButton = document.querySelector(
  "#clearAllButton"
);

renderQuestionChecklist();
loadSavedSettings();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  settingsError.textContent = "";

  const roundCount = Number(
    roundCountInput.value
  );

  const playerCount = Number(
    playerCountInput.value
  );

  const selectedQuestionTypeIds =
    getSelectedQuestionTypeIds();

  if (
    !Number.isInteger(roundCount) ||
    roundCount < 1 ||
    roundCount > 20
  ) {
    settingsError.textContent =
      "Choose between 1 and 20 rounds.";

    return;
  }

  if (
    !Number.isInteger(playerCount) ||
    playerCount < 1 ||
    playerCount > 8
  ) {
    settingsError.textContent =
      "Choose between 1 and 8 players or teams.";

    return;
  }

  if (selectedQuestionTypeIds.length === 0) {
    settingsError.textContent =
      "Select at least one question type.";

    return;
  }

  const settings = {
    settingsVersion: WHEEL_SETTINGS_VERSION,
    roundCount,
    playerCount,
    selectedQuestionTypeIds
  };

  localStorage.setItem(
    WHEEL_SETTINGS_KEY,
    JSON.stringify(settings)
  );

  window.location.href = "game.html";
});

selectAllButton.addEventListener("click", () => {
  const allQuestionTypeIds =
    QuestionGenerator
      .getAllQuestionTypes()
      .map((questionType) => {
        return questionType.id;
      });

  setSelectedQuestionTypes(
    allQuestionTypeIds
  );
});

clearAllButton.addEventListener("click", () => {
  setSelectedQuestionTypes([]);
});

function renderQuestionChecklist() {
  checklist.innerHTML = "";

  QuestionGenerator
    .getCategories()
    .forEach((category) => {
      const categorySection =
        document.createElement("section");

      categorySection.className =
        "wheel-question-category";

      const categoryHeading =
        document.createElement("h3");

      categoryHeading.textContent =
        category.name;

      categorySection.appendChild(
        categoryHeading
      );

      category.subcategories.forEach(
        (subcategory) => {
          const subcategorySection =
            document.createElement("section");

          subcategorySection.className =
            "wheel-question-subcategory";

          const subcategoryHeading =
            createSubcategoryHeading(
              subcategory
            );

          const typeList =
            document.createElement("div");

          typeList.className =
            "wheel-question-type-list";

          subcategory.questionTypes.forEach(
            (questionType) => {
              typeList.appendChild(
                createQuestionTypeOption(
                  questionType
                )
              );
            }
          );

          subcategorySection.append(
            subcategoryHeading,
            typeList
          );

          categorySection.appendChild(
            subcategorySection
          );
        }
      );

      checklist.appendChild(
        categorySection
      );
    });
}

function createSubcategoryHeading(
  subcategory
) {
  const headingRow =
    document.createElement("div");

  headingRow.className =
    "wheel-subcategory-heading";

  const heading =
    document.createElement("h4");

  heading.textContent = subcategory.name;

  const actions =
    document.createElement("div");

  actions.className =
    "wheel-subcategory-shortcuts";

  const selectButton =
    document.createElement("button");

  selectButton.type = "button";
  selectButton.textContent = "Select all";

  const clearButton =
    document.createElement("button");

  clearButton.type = "button";
  clearButton.textContent = "Clear";

  selectButton.addEventListener(
    "click",
    () => {
      setSubcategorySelection(
        subcategory,
        true
      );
    }
  );

  clearButton.addEventListener(
    "click",
    () => {
      setSubcategorySelection(
        subcategory,
        false
      );
    }
  );

  actions.append(
    selectButton,
    clearButton
  );

  headingRow.append(
    heading,
    actions
  );

  return headingRow;
}

function createQuestionTypeOption(
  questionType
) {
  const label =
    document.createElement("label");

  label.className =
    "wheel-question-type-option";

  const checkbox =
    document.createElement("input");

  checkbox.type = "checkbox";
  checkbox.name = "questionType";
  checkbox.value = questionType.id;

  const description =
    document.createElement("span");

  description.className =
    "wheel-question-type-description";

  const name =
    document.createElement("strong");

  name.textContent = questionType.name;

  const expression =
    document.createElement("span");

  expression.className =
    "wheel-question-type-expression";

  expression.textContent =
    questionType.expression;

  const condition =
    document.createElement("span");

  condition.className =
    "wheel-question-type-condition";

  condition.textContent =
    `(${questionType.condition})`;

  description.append(
    name,
    expression,
    condition
  );

  label.append(
    checkbox,
    description
  );

  return label;
}

function setSubcategorySelection(
  subcategory,
  selected
) {
  const typeIds = new Set(
    subcategory.questionTypes.map(
      (questionType) => {
        return questionType.id;
      }
    )
  );

  document
    .querySelectorAll(
      'input[name="questionType"]'
    )
    .forEach((checkbox) => {
      if (typeIds.has(checkbox.value)) {
        checkbox.checked = selected;
      }
    });
}

function loadSavedSettings() {
  const savedSettings =
    localStorage.getItem(
      WHEEL_SETTINGS_KEY
    );

  if (!savedSettings) {
    applySettings(
      DEFAULT_WHEEL_SETTINGS
    );

    return;
  }

  try {
    const parsedSettings =
      JSON.parse(savedSettings);

    if (
      parsedSettings.settingsVersion !==
      WHEEL_SETTINGS_VERSION
    ) {
      applySettings(
        DEFAULT_WHEEL_SETTINGS
      );

      return;
    }

    applySettings({
      ...DEFAULT_WHEEL_SETTINGS,
      ...parsedSettings
    });
  } catch {
    applySettings(
      DEFAULT_WHEEL_SETTINGS
    );
  }
}

function applySettings(settings) {
  roundCountInput.value = clampNumber(
    settings.roundCount,
    1,
    20
  );

  playerCountInput.value = String(
    clampNumber(
      settings.playerCount,
      1,
      8
    )
  );

  const validSelectedIds =
    getValidQuestionTypeIds(
      settings.selectedQuestionTypeIds
    );

  setSelectedQuestionTypes(
    validSelectedIds.length > 0
      ? validSelectedIds
      : DEFAULT_WHEEL_QUESTION_TYPE_IDS
  );
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
    return (
      QuestionGenerator.getQuestionType(
        typeId
      ) !== null
    );
  });
}

function setSelectedQuestionTypes(typeIds) {
  const selectedIds = new Set(typeIds);

  document
    .querySelectorAll(
      'input[name="questionType"]'
    )
    .forEach((checkbox) => {
      checkbox.checked =
        selectedIds.has(checkbox.value);
    });
}

function clampNumber(
  value,
  minimum,
  maximum
) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return minimum;
  }

  return Math.min(
    maximum,
    Math.max(
      minimum,
      Math.round(numericValue)
    )
  );
}