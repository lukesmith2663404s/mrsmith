"use strict";

/* ==========================================================
   SECRET NUMBER SETTINGS
   ========================================================== */

const modeRadios =
    document.querySelectorAll(
        "input[name='mode']"
    );

const manualSection =
    document.getElementById(
        "manualSection"
    );

const manualNumber =
    document.getElementById(
        "manualNumber"
    );

const minimumNumber =
    document.getElementById(
        "minimumNumber"
    );

const maximumNumber =
    document.getElementById(
        "maximumNumber"
    );

const difficulty =
    document.getElementById(
        "difficulty"
    );

const allowNegative =
    document.getElementById(
        "allowNegative"
    );

const allowDecimals =
    document.getElementById(
        "allowDecimals"
    );

const revealAnswer =
    document.getElementById(
        "revealAnswer"
    );

const theme =
    document.getElementById(
        "theme"
    );

const startButton =
    document.getElementById(
        "startButton"
    );

/* ==========================================================
   INITIALISE
   ========================================================== */

initialise();

function initialise()
{
    modeRadios.forEach(
        radio =>
        {
            radio.addEventListener(
                "change",
                updateMode
            );
        }
    );

    difficulty.addEventListener(
        "change",
        updateDifficulty
    );

    startButton.addEventListener(
        "click",
        startGame
    );

    updateMode();
    updateDifficulty();
}

/* ==========================================================
   MODE
   ========================================================== */

function updateMode()
{
    const manual =
        getMode() === "manual";

    manualSection.classList.toggle(
        "hidden",
        !manual
    );
}

/* ==========================================================
   DIFFICULTY
   ========================================================== */

function updateDifficulty()
{
    const custom =
        difficulty.value === "custom";

    minimumNumber.disabled = !custom;
    maximumNumber.disabled = !custom;

    if (custom)
    {
        return;
    }

    switch (difficulty.value)
    {
        case "easy":

            minimumNumber.value = 1;
            maximumNumber.value = 20;

            break;

        case "medium":

            minimumNumber.value = 1;
            maximumNumber.value = 100;

            break;

        case "hard":

            minimumNumber.value = 1;
            maximumNumber.value = 1000;

            break;
    }
}

/* ==========================================================
   START
   ========================================================== */

function startGame()
{
    let minimum =
        Number(
            minimumNumber.value
        );

    let maximum =
        Number(
            maximumNumber.value
        );

    if (minimum > maximum)
    {
        [minimum, maximum] =
        [
            maximum,
            minimum
        ];
    }

    const settings =
    {
        mode:
            getMode(),

        manualNumber:
            Number(
                manualNumber.value
            ),

        minimum,

        maximum,

        allowNegative:
            allowNegative.checked,

        allowDecimals:
            allowDecimals.checked,

        revealAnswer:
            revealAnswer.checked,

        difficulty:
            difficulty.value,

        theme:
            theme.value
    };

    localStorage.setItem(
        "secretNumberSettings",
        JSON.stringify(settings)
    );

    location.href =
        "game.html";
}

/* ==========================================================
   HELPERS
   ========================================================== */

function getMode()
{
    return document.querySelector(
        "input[name='mode']:checked"
    ).value;
}