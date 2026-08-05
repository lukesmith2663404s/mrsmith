"use strict";

/* ============================================================
   CODEBREAKER
   Part 1 - Initialisation / Game State / Boot Sequence
   ============================================================ */

const state = {
    secretNumber: null,
    started: false,
    questionsAsked: 0,
    history: [],
    randomMode: false,
    min: 1,
    max: 100
};

/* ============================================================
   DOM REFERENCES
   ============================================================ */

const terminalOutput =
    document.getElementById("terminalOutput");

const terminalInput =
    document.getElementById("terminalInput");

const startButton =
    document.getElementById("startButton");

const manualSection =
    document.getElementById("manualSection");

const randomSection =
    document.getElementById("randomSection");

const manualNumber =
    document.getElementById("manualNumber");

const minimumNumber =
    document.getElementById("minimumNumber");

const maximumNumber =
    document.getElementById("maximumNumber");

const questionCount =
    document.getElementById("questionCount");

const historyContainer =
    document.getElementById("history");

const guessStatus =
    document.getElementById("guessStatus");

const resultOverlay =
    document.getElementById("resultOverlay");

const resultTitle =
    document.getElementById("resultTitle");

const resultText =
    document.getElementById("resultText");

const continueButton =
    document.getElementById("continueButton");

/* ============================================================
   INITIALISE
   ============================================================ */

initialise();

function initialise()
{
    setupModeButtons();

    startButton.addEventListener(
        "click",
        startGame
    );

    terminalInput.addEventListener(
        "keydown",
        handleTerminalKey
    );

    continueButton.addEventListener(
        "click",
        () =>
        {
            resultOverlay.classList.add("hidden");
            terminalInput.focus();
        }
    );

    bootScreen();
}

/* ============================================================
   BOOT SCREEN
   ============================================================ */

async function bootScreen()
{
    terminalOutput.innerHTML = "";

    await bootLine(
        "INITIALISING CODEBREAKER..."
    );

    await bootLine(
        "LOADING MATHEMATICAL DATABASE..."
    );

    await bootLine(
        "CHECKING SECURITY..."
    );

    await bootLine(
        "READY."
    );

    printPrompt(
        "Choose a secret number and press START."
    );
}

async function bootLine(text)
{
    const div =
        document.createElement("div");

    div.className = "boot-line";

    terminalOutput.appendChild(div);

    for (let i = 0; i < text.length; i++)
    {
        div.textContent += text[i];

        await sleep(18);
    }

    scrollTerminal();

    await sleep(180);
}

/* ============================================================
   GAME START
   ============================================================ */

function startGame()
{
    state.started = true;

    state.questionsAsked = 0;

    state.history = [];

    questionCount.textContent = "0";

    guessStatus.textContent = "—";

    historyContainer.innerHTML = "";

    state.randomMode =
        document.querySelector(
            "input[name='secretMode']:checked"
        ).value === "random";

    if (state.randomMode)
    {
        state.min =
            Number(minimumNumber.value);

        state.max =
            Number(maximumNumber.value);

        if (state.max < state.min)
        {
            const temp = state.min;

            state.min = state.max;

            state.max = temp;
        }

        state.secretNumber =
            randomInteger(
                state.min,
                state.max
            );
    }
    else
    {
        state.secretNumber =
            Number(
                manualNumber.value
            );

        state.min = state.secretNumber;
        state.max = state.secretNumber;
    }

    terminalOutput.innerHTML = "";

    printSystem(
        "NEW SESSION STARTED"
    );

    printSystem(
        "PASSWORD STORED"
    );

    printSystem(
        "AWAITING QUESTIONS..."
    );

    terminalInput.value = "";

    terminalInput.focus();

    console.log(
        "Secret Number:",
        state.secretNumber
    );
}

/* ============================================================
   SETTINGS
   ============================================================ */

function setupModeButtons()
{
    const radios =
        document.querySelectorAll(
            "input[name='secretMode']"
        );

    radios.forEach(
        radio =>
        {
            radio.addEventListener(
                "change",
                updateModeDisplay
            );
        }
    );

    updateModeDisplay();
}

function updateModeDisplay()
{
    const mode =
        document.querySelector(
            "input[name='secretMode']:checked"
        ).value;

    if (mode === "manual")
    {
        manualSection.classList.remove(
            "hidden"
        );

        randomSection.classList.add(
            "hidden"
        );
    }
    else
    {
        randomSection.classList.remove(
            "hidden"
        );

        manualSection.classList.add(
            "hidden"
        );
    }
}

/* ============================================================
   TERMINAL
   ============================================================ */

function printSystem(text)
{
    const line =
        document.createElement("div");

    line.className =
        "terminal-system";

    line.textContent =
        text;

    terminalOutput.appendChild(line);

    scrollTerminal();
}

function printPrompt(text)
{
    const line =
        document.createElement("div");

    line.className =
        "terminal-prompt";

    line.innerHTML =
        `<span>&gt;</span> ${text}`;

    terminalOutput.appendChild(line);

    scrollTerminal();
}

function printAnswer(
    text,
    success
)
{
    const line =
        document.createElement("div");

    line.className =
        success
            ? "terminal-yes"
            : "terminal-no";

    line.textContent =
        text;

    terminalOutput.appendChild(line);

    scrollTerminal();
}

function scrollTerminal()
{
    terminalOutput.scrollTop =
        terminalOutput.scrollHeight;
}

/* ============================================================
   INPUT
   ============================================================ */

function handleTerminalKey(event)
{
    if (event.key !== "Enter")
    {
        return;
    }

    event.preventDefault();

    if (!state.started)
    {
        return;
    }

    const text =
        terminalInput.value.trim();

    if (text.length === 0)
    {
        return;
    }

    terminalInput.value = "";

    printPrompt(text);

    processInput(text);
}

/* ============================================================
   HISTORY
   ============================================================ */

function addHistory(
    question,
    answer
)
{
    state.history.unshift({
        question,
        answer
    });

    state.questionsAsked++;

    questionCount.textContent =
        state.questionsAsked;

    const div =
        document.createElement("div");

    div.className =
        answer
            ? "history-yes"
            : "history-no";

    div.textContent =
        `${answer ? "✓" : "✗"} ${question}`;

    historyContainer.prepend(div);
}

/* ============================================================
   RESULT OVERLAY
   ============================================================ */

function showResult(
    title,
    text
)
{
    resultTitle.textContent =
        title;

    resultText.textContent =
        text;

    resultOverlay.classList.remove(
        "hidden"
    );
}

/* ============================================================
   HELPERS
   ============================================================ */

function randomInteger(
    min,
    max
)
{
    return (
        Math.floor(
            Math.random() *
            (max - min + 1)
        ) + min
    );
}

function sleep(ms)
{
    return new Promise(
        resolve =>
            setTimeout(resolve, ms)
    );
}

/* ============================================================
   PART 2
   INPUT PARSER
   ============================================================ */

function processInput(input)
{
    input = input
        .trim()
        .toLowerCase();

    printSystem("ANALYSING...");

    setTimeout(() =>
    {
        evaluateInput(input);
    }, 250);
}

function evaluateInput(input)
{
    // Guess?

    const guess = parseGuess(input);

    if (guess !== null)
    {
        checkGuess(guess);
        return;
    }

    // Question?

    const result =
        parseQuestion(input);

    if (result)
    {
        answerQuestion(
            result.question,
            result.answer
        );

        return;
    }

    printAnswer(
        "UNKNOWN QUESTION",
        false
    );
}

/* ============================================================
   ANSWERS
   ============================================================ */

function answerQuestion(
    question,
    answer
)
{
    addHistory(
        question,
        answer
    );

    if (answer)
    {
        printAnswer(
            "YES",
            true
        );
    }
    else
    {
        printAnswer(
            "NO",
            false
        );
    }
}

function checkGuess(
    guess
)
{
    if (
        guess === state.secretNumber
    )
    {
        guessStatus.textContent =
            "✓";

        showResult(
            "ACCESS GRANTED",
            `Correct! The number was ${state.secretNumber}.`
        );

        printAnswer(
            "PASSWORD ACCEPTED",
            true
        );

        state.started = false;

        return;
    }

    guessStatus.textContent =
        "✗";

    printAnswer(
        "ACCESS DENIED",
        false
    );

    addHistory(
        `Guess ${guess}`,
        false
    );
}

/* ============================================================
   PART 3
   MATHEMATICAL PROPERTY FUNCTIONS
   ============================================================ */

function isPrime(number)
{
    if (!Number.isInteger(number))
    {
        return false;
    }

    if (number < 2)
    {
        return false;
    }

    if (number === 2)
    {
        return true;
    }

    if (number % 2 === 0)
    {
        return false;
    }

    const limit =
        Math.floor(Math.sqrt(number));

    for (
        let i = 3;
        i <= limit;
        i += 2
    )
    {
        if (number % i === 0)
        {
            return false;
        }
    }

    return true;
}

/* ============================================================ */

function isSquare(number)
{
    if (!Number.isInteger(number))
    {
        return false;
    }

    if (number < 0)
    {
        return false;
    }

    const root =
        Math.sqrt(number);

    return Number.isInteger(root);
}

/* ============================================================ */

function isCube(number)
{
    if (!Number.isInteger(number))
    {
        return false;
    }

    const root =
        Math.cbrt(number);

    return Math.abs(
        Math.round(root) - root
    ) < 1e-10;
}

/* ============================================================ */

function isTriangular(number)
{
    if (
        !Number.isInteger(number) ||
        number < 0
    )
    {
        return false;
    }

    const n =
        (Math.sqrt(
            8 * number + 1
        ) - 1) / 2;

    return Number.isInteger(n);
}

/* ============================================================ */

function isFibonacci(number)
{
    if (
        !Number.isInteger(number) ||
        number < 0
    )
    {
        return false;
    }

    return (
        isSquare(
            5 * number * number + 4
        ) ||
        isSquare(
            5 * number * number - 4
        )
    );
}

/* ============================================================ */

function isFactorial(number)
{
    if (
        !Number.isInteger(number) ||
        number < 1
    )
    {
        return false;
    }

    let value = number;

    let divisor = 2;

    while (value > 1)
    {
        if (value % divisor !== 0)
        {
            return false;
        }

        value /= divisor;

        divisor++;
    }

    return true;
}

/* ============================================================ */

function digitSum(number)
{
    return Math.abs(number)
        .toString()
        .split("")
        .reduce(
            (sum, digit) =>
                sum + Number(digit),
            0
        );
}

/* ============================================================ */

function digitProduct(number)
{
    return Math.abs(number)
        .toString()
        .split("")
        .reduce(
            (product, digit) =>
                product * Number(digit),
            1
        );
}

/* ============================================================ */

function digitCount(number)
{
    return Math.abs(number)
        .toString()
        .length;
}

/* ============================================================ */

function containsDigit(
    number,
    digit
)
{
    return Math.abs(number)
        .toString()
        .includes(
            String(digit)
        );
}

/* ============================================================ */

function startsWithDigit(
    number,
    digit
)
{
    return Math.abs(number)
        .toString()
        .startsWith(
            String(digit)
        );
}

/* ============================================================ */

function endsWithDigit(
    number,
    digit
)
{
    return Math.abs(number)
        .toString()
        .endsWith(
            String(digit)
        );
}

/* ============================================================ */

function isPalindrome(number)
{
    const text =
        Math.abs(number)
        .toString();

    return (
        text ===
        text
            .split("")
            .reverse()
            .join("")
    );
}

/* ============================================================ */

function reverseNumber(number)
{
    return Number(
        Math.abs(number)
            .toString()
            .split("")
            .reverse()
            .join("")
    );
}

/* ============================================================ */

function isPowerOf(base, number)
{
    if (
        base <= 1 ||
        number < 1
    )
    {
        return false;
    }

    let value = 1;

    while (value < number)
    {
        value *= base;
    }

    return value === number;
}

/* ============================================================ */

function gcd(a, b)
{
    a = Math.abs(a);
    b = Math.abs(b);

    while (b !== 0)
    {
        const temp = b;
        b = a % b;
        a = temp;
    }

    return a;
}

/* ============================================================ */

function lcm(a, b)
{
    return Math.abs(a * b) / gcd(a, b);
}

/* ============================================================
   PART 4
   QUESTION PARSER
   ============================================================ */

const QUESTION_TYPES =
[
    {
        patterns:
        [
            /^even$/,
            /^is ?it ?even$/,
            /^2x$/,
            /^multiple2$/,
            /^divisible2$/
        ],

        question:
            "Is it even?",

        test:
            n => n % 2 === 0
    },

    {
        patterns:
        [
            /^odd$/,
            /^is ?it ?odd$/
        ],

        question:
            "Is it odd?",

        test:
            n => Math.abs(n % 2) === 1
    },

    {
        patterns:
        [
            /^prime$/,
            /^is ?it ?prime$/
        ],

        question:
            "Is it prime?",

        test:
            n => isPrime(n)
    },

    {
        patterns:
        [
            /^square$/,
            /^perfect ?square$/
        ],

        question:
            "Is it a square number?",

        test:
            n => isSquare(n)
    },

    {
        patterns:
        [
            /^cube$/,
            /^perfect ?cube$/
        ],

        question:
            "Is it a cube number?",

        test:
            n => isCube(n)
    },

    {
        patterns:
        [
            /^triangular$/,
            /^triangle$/
        ],

        question:
            "Is it triangular?",

        test:
            n => isTriangular(n)
    },

    {
        patterns:
        [
            /^fibonacci$/,
            /^fib$/
        ],

        question:
            "Is it a Fibonacci number?",

        test:
            n => isFibonacci(n)
    },

    {
        patterns:
        [
            /^factorial$/
        ],

        question:
            "Is it a factorial?",

        test:
            n => isFactorial(n)
    }
];

function parseQuestion(input)
{
    input =
        input
        .trim()
        .toLowerCase();

    // Static questions

    for (const type of QUESTION_TYPES)
    {
        for (const pattern of type.patterns)
        {
            if (pattern.test(input))
            {
                return {

                    question:
                        type.question,

                    answer:
                        type.test(
                            state.secretNumber
                        )

                };
            }
        }
    }

    // Dynamic ones

    let result;

    result =
        parseComparison(input);

    if (result)
        return result;

    result =
        parseMultiple(input);

    if (result)
        return result;

    result =
        parseFactor(input);

    if (result)
        return result;

    result =
        parseBetween(input);

    if (result)
        return result;

    return null;
}

function parseGuess(input)
{
    input =
        input.trim();

    if (/^-?\d+$/.test(input))
    {
        return Number(input);
    }

    const match =
        input.match(
            /^guess\s*(-?\d+)$/i
        );

    if (match)
    {
        return Number(match[1]);
    }

    return null;
}

function parseComparison(input)
{
    let match;

    match =
        input.match(/^>\s*(-?\d+)$/);

    if (match)
    {
        const x =
            Number(match[1]);

        return {

            question:
                `Is it greater than ${x}?`,

            answer:
                state.secretNumber > x

        };
    }

    match =
        input.match(/^>=\s*(-?\d+)$/);

    if (match)
    {
        const x =
            Number(match[1]);

        return {

            question:
                `Is it at least ${x}?`,

            answer:
                state.secretNumber >= x

        };
    }

    match =
        input.match(/^<\s*(-?\d+)$/);

    if (match)
    {
        const x =
            Number(match[1]);

        return {

            question:
                `Is it less than ${x}?`,

            answer:
                state.secretNumber < x

        };
    }

    match =
        input.match(/^<=\s*(-?\d+)$/);

    if (match)
    {
        const x =
            Number(match[1]);

        return {

            question:
                `Is it at most ${x}?`,

            answer:
                state.secretNumber <= x

        };
    }

    return null;
}

function parseMultiple(input)
{
    let match =
        input.match(
            /^multiple\s*(\d+)$/
        );

    if (!match)
        match =
            input.match(/^(\d+)x$/);

    if (!match)
        match =
            input.match(
                /^(\d+)times$/
            );

    if (!match)
        match =
            input.match(
                /^divisible\s*(\d+)$/
            );

    if (!match)
        return null;

    const value =
        Number(match[1]);

    return {

        question:
            `Is it a multiple of ${value}?`,

        answer:
            state.secretNumber % value === 0

    };
}

function parseFactor(input)
{
    const match =
        input.match(
            /^factor\s*(\d+)$/
        );

    if (!match)
        return null;

    const value =
        Number(match[1]);

    return {

        question:
            `Is ${value} a factor?`,

        answer:
            state.secretNumber % value === 0

    };
}

function parseBetween(input)
{
    const match =
        input.match(
            /^between\s*(-?\d+)\s*[-, ]\s*(-?\d+)$/
        );

    if (!match)
        return null;

    let a =
        Number(match[1]);

    let b =
        Number(match[2]);

    if (a > b)
    {
        [a, b] = [b, a];
    }

    return {

        question:
            `Is it between ${a} and ${b}?`,

        answer:
            state.secretNumber >= a &&
            state.secretNumber <= b

    };
}

