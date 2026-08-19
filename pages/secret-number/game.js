"use strict";

/*==========================================================
    SECRET NUMBER
==========================================================*/

const SETTINGS_KEY = "secretNumberSettings";

let settings;

let secretNumber = 0;
let gameWon = false;

let history = [];
let questionCount = 0;

/*==========================================================
    ELEMENTS
==========================================================*/

const historyElement =
    document.getElementById("history");

const input =
    document.getElementById("terminalInput");

const resultDialog =
    document.getElementById("resultDialog");

const resultTitle =
    document.getElementById("resultTitle");

const resultText =
    document.getElementById("resultText");

const playAgainButton =
    document.getElementById("playAgainButton");

/*==========================================================
    START
==========================================================*/

initialise();

function initialise() {

    loadSettings();

    generateSecretNumber();

    attachEvents();

    input.focus();

}

/*==========================================================
    SETTINGS
==========================================================*/

function loadSettings() {

    const stored =
        localStorage.getItem(
            SETTINGS_KEY
        );

    if (!stored) {

        settings = {

            mode: "random",

            minimum: 1,
            maximum: 100,

            revealAnswer: true,

            theme: "Green CRT"

        };

        return;

    }

    settings =
        JSON.parse(stored);

}

function generateSecretNumber() {

    if (
        settings.mode ===
        "manual"
    ) {

        secretNumber =
            Number(
                settings.manualNumber
            );

        return;

    }

    secretNumber =
        randomInteger(
            Number(settings.minimum),
            Number(settings.maximum)
        );

}

/*==========================================================
    EVENTS
==========================================================*/

function attachEvents() {

    input.addEventListener(
        "keydown",
        handleKeyDown
    );

    playAgainButton?.addEventListener(
        "click",
        () => {

            location.href =
                "settings.html";

        }
    );

}

function handleKeyDown(event) {

    if (event.key !== "Enter") {
        return;
    }

    event.preventDefault();

    if (gameWon) {
        return;
    }

    const text =
        input.value.trim();

    input.value = "";

    if (!text.length) {
        return;
    }

    processInput(text);

}

/*==========================================================
    MAIN INPUT
==========================================================*/

function processInput(text) {

    const result =
        interpretInput(text);

    if (!result) {

        addHistoryLine(
            "Unknown question",
            "ERROR"
        );

        return;

    }

    if (
        result.type ===
        "guess"
    ) {

        handleGuess(
            result.value
        );

        return;

    }

    questionCount++;

    addHistoryLine(
        result.question,
        result.answer
            ? "YES"
            : "NO"
    );

}

/*==========================================================
    GUESS
==========================================================*/

function handleGuess(value) {

    if (
        value ===
        secretNumber
    ) {

        gameWon = true;

        addHistoryLine(
            "Guess " + value,
            "CORRECT"
        );

        showWin();

        return;

    }

    addHistoryLine(
        "Guess " + value,
        "WRONG"
    );

}

function showWin() {

    if (!resultDialog) {
        return;
    }

    resultTitle.textContent =
        "Correct!";

    resultText.textContent =
        settings.revealAnswer
            ? "The secret number was " +
              secretNumber
            : "";

    resultDialog.showModal();

}

/*==========================================================
    HISTORY
==========================================================*/

function addHistoryLine(
    question,
    answer
) {

    history.push({

        question,
        answer

    });

    const row =
        document.createElement(
            "div"
        );

    row.className =
        "history-row";

    const left =
        document.createElement(
            "span"
        );

    left.className =
        "history-question";

    left.textContent =
        question;

    const right =
        document.createElement(
            "span"
        );

    right.className =
        "history-answer";

    right.textContent =
        answer;

    switch (answer) {

        case "YES":

            row.classList.add(
                "answer-yes"
            );

            break;

        case "NO":

            row.classList.add(
                "answer-no"
            );

            break;

        case "CORRECT":

            row.classList.add(
                "answer-correct"
            );

            break;

        case "WRONG":

            row.classList.add(
                "answer-wrong"
            );

            break;

    }

row.append(left, right);

    historyElement.appendChild(
        row
    );

    historyElement.scrollTop =
        historyElement.scrollHeight;

}

/*==========================================================
    HELPERS
==========================================================*/

function randomInteger(
    minimum,
    maximum
) {

    return (
        Math.floor(
            Math.random() *
            (maximum - minimum + 1)
        ) +
        minimum
    );

}

/*==========================================================
    PARSER
==========================================================*/

function interpretInput(text) {

    const original =
        text.trim();

    const input =
        original
            .toLowerCase()
            .replace(/\s+/g, "");

    /*--------------------------
        Direct number guess
    --------------------------*/

    if (/^-?\d+$/.test(input)) {

        return {

            type: "guess",

            value: Number(input)

        };

    }

    /*--------------------------
        Greater than
    --------------------------*/

    let match =
        input.match(
            /^>(-?\d+)$/
        );

    if (match) {

        const value =
            Number(match[1]);

        return buildQuestion(

            `Is it greater than ${value}?`,

            secretNumber > value

        );

    }

    match =
        input.match(
            /^greaterthan(-?\d+)$/
        );

    if (match) {

        const value =
            Number(match[1]);

        return buildQuestion(

            `Is it greater than ${value}?`,

            secretNumber > value

        );

    }

    /*--------------------------
        Less than
    --------------------------*/

    match =
        input.match(
            /^<(-?\d+)$/
        );

    if (match) {

        const value =
            Number(match[1]);

        return buildQuestion(

            `Is it less than ${value}?`,

            secretNumber < value

        );

    }

    match =
        input.match(
            /^lessthan(-?\d+)$/
        );

    if (match) {

        const value =
            Number(match[1]);

        return buildQuestion(

            `Is it less than ${value}?`,

            secretNumber < value

        );

    }

    /*--------------------------
        Even
    --------------------------*/

    if (

        input === "even"

    ) {

        return buildQuestion(

            "Is it even?",

            isEven(secretNumber)

        );

    }

    /*--------------------------
        Odd
    --------------------------*/

    if (

        input === "odd"

    ) {

        return buildQuestion(

            "Is it odd?",

            isOdd(secretNumber)

        );

    }

    /*--------------------------
        Prime
    --------------------------*/

    if (

        input === "prime"

    ) {

        return buildQuestion(

            "Is it prime?",

            isPrime(secretNumber)

        );

    }

    /*--------------------------
        Square
    --------------------------*/

    if (

        input === "square" ||
        input === "squarenumber"

    ) {

        return buildQuestion(

            "Is it a square number?",

            isSquare(secretNumber)

        );

    }

    /*--------------------------
        Cube
    --------------------------*/

    if (

        input === "cube" ||
        input === "cubenumber"

    ) {

        return buildQuestion(

            "Is it a cube number?",

            isCube(secretNumber)

        );

    }

    /*--------------------------
        Triangular
    --------------------------*/

    if (

        input === "triangular"

    ) {

        return buildQuestion(

            "Is it a triangular number?",

            isTriangular(secretNumber)

        );

    }

    /*--------------------------
        Fibonacci
    --------------------------*/

    if (

        input === "fibonacci" ||
        input === "fib"

    ) {

        return buildQuestion(

            "Is it a Fibonacci number?",

            isFibonacci(secretNumber)

        );

    }

    /*--------------------------
        Perfect
    --------------------------*/

    if (

        input === "perfect"

    ) {

        return buildQuestion(

            "Is it a perfect number?",

            isPerfect(secretNumber)

        );

    }

    /*--------------------------
        Multiple

        multiple7
        multipleof7
        7x
        7times
        7timestable

    --------------------------*/

    match =
        input.match(

            /^multiple(of)?(-?\d+)$/

        );

    if (match) {

        const value =
            Number(match[2]);

        return buildQuestion(

            `Is it a multiple of ${value}?`,

            isMultiple(secretNumber, value)

        );

    }

    match =
        input.match(

            /^(-?\d+)x$/

        );

    if (match) {

        const value =
            Number(match[1]);

        return buildQuestion(

            `Is it a multiple of ${value}?`,

            isMultiple(secretNumber, value)

        );

    }

    match =
        input.match(

            /^(-?\d+)times(table)?$/

        );

    if (match) {

        const value =
            Number(match[1]);

        return buildQuestion(

            `Is it a multiple of ${value}?`,

            isMultiple(secretNumber, value)

        );

    }

    /*--------------------------
        Factor

        factor60
        factorof60

    --------------------------*/

    match =
        input.match(

            /^factor(of)?(-?\d+)$/

        );

    if (match) {

        const value =
            Number(match[2]);

        return buildQuestion(

            `Is it a factor of ${value}?`,

            value % secretNumber === 0

        );

    }

    /*--------------------------
        Divisible by

        divisible7
        divisibleby7

    --------------------------*/

    match =
        input.match(

            /^divisible(by)?(-?\d+)$/

        );

    if (match) {

        const value =
            Number(match[2]);

        return buildQuestion(

            `Is it divisible by ${value}?`,

            isMultiple(secretNumber, value)

        );

    }

        /*----------------------------------
        STARTS WITH

        starts with t
        starts with th
        starts with 3
        begins with...
        first letter...
        first digit...
    ----------------------------------*/

    match = original.match(
        /^(starts?\s*with|begins?\s*with|first\s*(letter|digit)?)(?:\s+)?(.+)$/i
    );

    if (match) {

        const value = match[3]
            .trim()
            .toLowerCase();

        const answer =
            /^\d+$/.test(value)
                ? startsWithDigit(secretNumber, value)
                : startsWithText(secretNumber, value);

        return buildQuestion(
            `Does it start with "${value}"?`,
            answer
        );

    }

    /*----------------------------------
        ENDS WITH

        ends with...
        last letter...
        last digit...
    ----------------------------------*/

    match = original.match(
        /^(ends?\s*with|last\s*(letter|digit)?)(?:\s+)?(.+)$/i
    );

    if (match) {

        const value = match[3]
            .trim()
            .toLowerCase();

        const answer =
            /^\d+$/.test(value)
                ? endsWithDigit(secretNumber, value)
                : endsWithText(secretNumber, value);

        return buildQuestion(
            `Does it end with "${value}"?`,
            answer
        );

    }



    /*----------------------------------
        CONTAINS

        contains...
        has...
        includes...
    ----------------------------------*/

    match = original.match(
        /^(contains?|has|includes?)(?:\s+)?(.+)$/i
    );

    if (match) {

        const value = match[2]
            .trim()
            .toLowerCase();

        const answer =
            /^\d+$/.test(value)
                ? containsDigit(secretNumber, value)
                : containsText(secretNumber, value);

        return buildQuestion(
            `Does it contain "${value}"?`,
            answer
        );

    }


    return null;

}

/*==========================================================
    QUESTION OBJECT
==========================================================*/

function buildQuestion(
    question,
    answer
) {

    return {

        type: "question",

        question,

        answer

    };

}

/*==========================================================
    PARSER
==========================================================*/

function interpretInput(rawText) {

        const digitCountValue =
        parseDigitCountQuestion(rawText);

    if (digitCountValue !== null) {

        return buildQuestion(
            `Does it have ${digitCountValue} digit${
                digitCountValue === 1
                    ? ""
                    : "s"
            }?`,
            digitCount(secretNumber) ===
                digitCountValue
        );

    }

    const original = rawText.trim();

    const input = normaliseInput(original);

    /*----------------------------------
        Direct Guess
    ----------------------------------*/

    if (/^-?\d+$/.test(input)) {

        return {
            type: "guess",
            value: Number(input)
        };

    }

    /*----------------------------------
        Greater Than
    ----------------------------------*/

    let match =
        input.match(
            /^>(-?\d+)$/
        );

    if (match) {

        const value =
            Number(match[1]);

        return buildQuestion(

            `Is it greater than ${value}?`,

            secretNumber > value

        );

    }

    /*----------------------------------
        Less Than
    ----------------------------------*/

    match =
        input.match(
            /^<(-?\d+)$/
        );

    if (match) {

        const value =
            Number(match[1]);

        return buildQuestion(

            `Is it less than ${value}?`,

            secretNumber < value

        );

    }

    /*----------------------------------
        Greater / Less Than Or Equal
    ----------------------------------*/

    match =
        input.match(
            /^>=(\-?\d+)$/
        );

    if (match) {

        const value =
            Number(match[1]);

        return buildQuestion(

            `Is it at least ${value}?`,

            secretNumber >= value

        );

    }

    match =
        input.match(
            /^<=(\-?\d+)$/
        );

    if (match) {

        const value =
            Number(match[1]);

        return buildQuestion(

            `Is it at most ${value}?`,

            secretNumber <= value

        );

    }

    /*----------------------------------
        Between
    ----------------------------------*/

    match =
        input.match(
            /^between(-?\d+)and(-?\d+)$/
        );

    if (match) {

        const a =
            Number(match[1]);

        const b =
            Number(match[2]);

        const low =
            Math.min(a,b);

        const high =
            Math.max(a,b);

        return buildQuestion(

            `Is it between ${low} and ${high}?`,

            secretNumber >= low &&
            secretNumber <= high

        );

    }

    /*----------------------------------
        Even / Odd
    ----------------------------------*/

    if (input === "even") {

        return buildQuestion(
            "Is it even?",
            isEven(secretNumber)
        );

    }

    if (input === "odd") {

        return buildQuestion(
            "Is it odd?",
            isOdd(secretNumber)
        );

    }

    /*----------------------------------
        Prime
    ----------------------------------*/

    if (input === "prime") {

        return buildQuestion(
            "Is it prime?",
            isPrime(secretNumber)
        );

    }

    /*----------------------------------
        Square
    ----------------------------------*/

    if (input === "square") {

        return buildQuestion(
            "Is it a square number?",
            isSquare(secretNumber)
        );

    }

    /*----------------------------------
        Cube
    ----------------------------------*/

    if (input === "cube") {

        return buildQuestion(
            "Is it a cube number?",
            isCube(secretNumber)
        );

    }

    /*----------------------------------
        Triangular
    ----------------------------------*/

    if (input === "triangular") {

        return buildQuestion(
            "Is it a triangular number?",
            isTriangular(secretNumber)
        );

    }

    /*----------------------------------
        Fibonacci
    ----------------------------------*/

    if (input === "fibonacci") {

        return buildQuestion(
            "Is it a Fibonacci number?",
            isFibonacci(secretNumber)
        );

    }

    /*----------------------------------
        Multiple
    ----------------------------------*/

    match =
        input.match(
            /^multiple(-?\d+)$/
        );

    if (match) {

        const value =
            Number(match[1]);

        return buildQuestion(

            `Is it a multiple of ${value}?`,

            isMultiple(secretNumber,value)

        );

    }

    /*----------------------------------
        Factor
    ----------------------------------*/

    match =
        input.match(
            /^factor(-?\d+)$/
        );

    if (match) {

        const value =
            Number(match[1]);

        return buildQuestion(

            `Is it a factor of ${value}?`,

            value % secretNumber === 0

        );

    }

    return null;

}

/*==========================================================
    INPUT NORMALISATION
==========================================================*/

function normaliseInput(text) {

    let input =
        text
        .toLowerCase()
        .trim();

    input =
        input.replace(/[?.,]/g,"");

    input =
        input.replace(/\s+/g," ");

    /*------------------------
        GREATER THAN
    ------------------------*/

    input =
        input.replace(
            /greater than|more than|larger than|bigger than|above|over/g,
            ">"
        );

    /*------------------------
        LESS THAN
    ------------------------*/

    input =
        input.replace(
            /less than|smaller than|below|under/g,
            "<"
        );

    /*------------------------
        AT LEAST
    ------------------------*/

    input =
        input.replace(
            /at least|minimum of|minimum/g,
            ">="
        );

    /*------------------------
        AT MOST
    ------------------------*/

    input =
        input.replace(
            /at most|maximum of|maximum/g,
            "<="
        );

    /*------------------------
        BETWEEN
    ------------------------*/

    input =
        input.replace(
            /from/g,
            "between"
        );

    input =
        input.replace(
            /to/g,
            "and"
        );

    /*------------------------
        MULTIPLE
    ------------------------*/

    input =
        input.replace(
            /divisible by|divisible|times table|timestable|times|x/g,
            "multiple"
        );

    input =
        input.replace(
            /multiple of/g,
            "multiple"
        );

    /*------------------------
        FACTOR
    ------------------------*/

    input =
        input.replace(
            /factor of/g,
            "factor"
        );

    /*------------------------
        SQUARE
    ------------------------*/

    input =
        input.replace(
            /square number/g,
            "square"
        );

    /*------------------------
        CUBE
    ------------------------*/

    input =
        input.replace(
            /cube number|cubic/g,
            "cube"
        );

    /*------------------------
        FIBONACCI
    ------------------------*/

    input =
        input.replace(
            /fib/g,
            "fibonacci"
        );

    input =
        input.replace(/\s+/g,"");

    return input;

}

/*==========================================================
    QUESTION HANDLERS
==========================================================*/

function isEven(n) {
    return n % 2 === 0;
}

function isOdd(n) {
    return n % 2 !== 0;
}

function isMultiple(n, divisor) {

    if (divisor === 0) {
        return false;
    }

    return n % divisor === 0;

}

function isPrime(n) {

    if (n < 2) {
        return false;
    }

    for (let i = 2; i * i <= n; i++) {

        if (n % i === 0) {
            return false;
        }

    }

    return true;

}

function isSquare(n) {

    if (n < 0) {
        return false;
    }

    return Number.isInteger(
        Math.sqrt(n)
    );

}

function isCube(n) {

    const root =
        Math.cbrt(n);

    return Math.abs(
        root - Math.round(root)
    ) < 1e-10;

}

function isTriangular(n) {

    if (n < 0) {
        return false;
    }

    const test =
        (Math.sqrt(8 * n + 1) - 1) / 2;

    return Number.isInteger(test);

}

function isFibonacci(n) {

    if (n < 0) {
        return false;
    }

    return isSquare(
        5 * n * n + 4
    ) ||
    isSquare(
        5 * n * n - 4
    );

}

/*==========================================================
    DIGITS
==========================================================*/

function digitSum(n) {

    return Math.abs(n)
        .toString()
        .split("")
        .reduce(
            (a,b)=>a+Number(b),
            0
        );

}

function digitProduct(n) {

    return Math.abs(n)
        .toString()
        .split("")
        .reduce(
            (a,b)=>a*Number(b),
            1
        );

}

function startsWithDigit(
    n,
    digit
) {

    return Math.abs(n)
        .toString()
        .startsWith(
            String(digit)
        );

}

function endsWithDigit(
    n,
    digit
) {

    return Math.abs(n)
        .toString()
        .endsWith(
            String(digit)
        );

}

function containsDigit(
    n,
    digit
) {

    return Math.abs(n)
        .toString()
        .includes(
            String(digit)
        );

}

function digitCount(n) {

    return Math.abs(n)
        .toString()
        .length;

}

function isPalindrome(n) {

    const text =
        Math.abs(n)
        .toString();

    return text ===
        text
        .split("")
        .reverse()
        .join("");

}

/*==========================================================
    NUMBER WORDS
==========================================================*/

const NUMBER_WORDS = [

    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
    "twenty"

];

/*==========================================================
    NUMBER TO WORDS
==========================================================*/

const ONES = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen"
];

const TENS = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety"
];

function numberWord(number) {

    number = Math.trunc(number);

    if (number < 0) {

        return (
            "minus " +
            numberWord(-number)
        );

    }

    if (number < 20) {

        return ONES[number];

    }

    if (number < 100) {

        const tens =
            Math.floor(number / 10);

        const ones =
            number % 10;

        return ones === 0
            ? TENS[tens]
            : TENS[tens] +
              "-" +
              ONES[ones];

    }

    if (number < 1000) {

        const hundreds =
            Math.floor(number / 100);

        const remainder =
            number % 100;

        let text =
            ONES[hundreds] +
            " hundred";

        if (remainder > 0) {

            text +=
                " and " +
                numberWord(remainder);

        }

        return text;

    }

    if (number < 1000000) {

        const thousands =
            Math.floor(number / 1000);

        const remainder =
            number % 1000;

        let text =
            numberWord(thousands) +
            " thousand";

        if (remainder > 0) {

            if (remainder < 100) {

                text +=
                    " and ";

            } else {

                text +=
                    " ";

            }

            text +=
                numberWord(remainder);

        }

        return text;

    }

    return number.toLocaleString();

}



function normalisedNumberWord(number) {

    return numberWord(number)
        .toLowerCase()
        .replace(/[^a-z]/g, "");

}

function startsWithText(
    number,
    text
) {

    return normalisedNumberWord(number)
        .startsWith(
            text
                .toLowerCase()
                .replace(/[^a-z]/g, "")
        );

}

function endsWithText(
    number,
    text
) {

    return normalisedNumberWord(number)
        .endsWith(
            text
                .toLowerCase()
                .replace(/[^a-z]/g, "")
        );

}

function containsText(
    number,
    text
) {

    return normalisedNumberWord(number)
        .includes(
            text
                .toLowerCase()
                .replace(/[^a-z]/g, "")
        );

}

/*==========================================================
    HELPERS
==========================================================*/

function buildQuestion(
    question,
    answer
) {

    return {

        type: "question",

        question,

        answer

    };

}

function clamp(
    value,
    minimum,
    maximum
) {

    return Math.max(
        minimum,
        Math.min(
            maximum,
            value
        )
    );

}

function digitCount(number) {

    return Math.abs(number)
        .toString()
        .length;

}

function parseDigitCountQuestion(text) {

    const input =
        String(text)
            .trim()
            .toLowerCase()
            .replace(/\?+$/, "");

    const digitWords = {
        zero: 0,
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10
    };

    let match;

    /*
        3 digits
        3 digit
    */
    match = input.match(
        /^(\d+)\s+digits?$/
    );

    if (match) {
        return Number(match[1]);
    }

    /*
        has 3 digits
        has 3 digit
    */
    match = input.match(
        /^has\s+(\d+)\s+digits?$/
    );

    if (match) {
        return Number(match[1]);
    }

    /*
        digits3
        digit3
    */
    match = input.match(
        /^digits?(\d+)$/
    );

    if (match) {
        return Number(match[1]);
    }

    /*
        three digits
        three digit
    */
    match = input.match(
        /^([a-z]+)\s+digits?$/
    );

    if (
        match &&
        Object.prototype.hasOwnProperty.call(
            digitWords,
            match[1]
        )
    ) {
        return digitWords[match[1]];
    }

    /*
        has three digits
        has three digit
    */
    match = input.match(
        /^has\s+([a-z]+)\s+digits?$/
    );

    if (
        match &&
        Object.prototype.hasOwnProperty.call(
            digitWords,
            match[1]
        )
    ) {
        return digitWords[match[1]];
    }

    return null;
}