"use strict";

/* ==========================================================
   SECRET NUMBER SETTINGS
   ========================================================== */

const SETTINGS_KEY =
    "secretNumberSettings";

const modeRadios =
    document.querySelectorAll(
        "input[name='mode']"
    );

const manualSection =
    document.getElementById(
        "manualSection"
    );

const randomSection =
    document.getElementById(
        "randomSection"
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

const startButton =
    document.getElementById(
        "startButton"
    );

/* ==========================================================
   INITIALISE
   ========================================================== */

initialise();

function initialise() {

    modeRadios.forEach(
        (radio) => {

            radio.addEventListener(
                "change",
                updateMode
            );

        }
    );

    startButton.addEventListener(
        "click",
        startGame
    );

    updateMode();

}

/* ==========================================================
   MODE
   ========================================================== */

function updateMode() {

    const mode =
        getMode();

    const isManual =
        mode === "manual";

    manualSection.classList.toggle(
        "hidden",
        !isManual
    );

    randomSection.classList.toggle(
        "hidden",
        isManual
    );

    if (isManual) {
        manualNumber.focus();
    } else {
        minimumNumber.focus();
    }

}

/* ==========================================================
   START GAME
   ========================================================== */

function startGame() {

    const mode =
        getMode();

    if (mode === "manual") {

        startManualGame();

        return;
    }

    startRandomGame();

}

/* ==========================================================
   MANUAL GAME
   ========================================================== */

function startManualGame() {

    const rawValue =
        manualNumber.value.trim();

    if (!rawValue) {

        manualNumber.focus();

        return;
    }

    const secret =
        Number(rawValue);

    if (
        !Number.isInteger(secret)
    ) {

        manualNumber.focus();

        return;
    }

    const settings = {

        mode: "manual",

        manualNumber: secret,

        minimum: 1,

        maximum: 100

    };

    saveSettings(settings);

    window.location.href =
        "game.html";

}

/* ==========================================================
   RANDOM GAME
   ========================================================== */

function startRandomGame() {

    let minimum =
        Number(
            minimumNumber.value
        );

    let maximum =
        Number(
            maximumNumber.value
        );

    if (
        !Number.isInteger(minimum) ||
        !Number.isInteger(maximum)
    ) {

        minimumNumber.focus();

        return;
    }

    if (minimum > maximum) {

        [
            minimum,
            maximum
        ] = [
            maximum,
            minimum
        ];

    }

    const settings = {

        mode: "random",

        manualNumber: null,

        minimum,

        maximum

    };

    saveSettings(settings);

    window.location.href =
        "game.html";

}

/* ==========================================================
   SAVE
   ========================================================== */

function saveSettings(settings) {

    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );

}

/* ==========================================================
   HELPERS
   ========================================================== */

function getMode() {

    const selected =
        document.querySelector(
            "input[name='mode']:checked"
        );

    return selected
        ? selected.value
        : "manual";

}