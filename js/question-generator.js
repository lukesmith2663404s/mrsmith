window.QuestionGenerator = (() => {
  function questionType(
    id,
    name,
    expression,
    condition,
    generate
  ) {
    return {
      id,
      name,
      expression,
      condition,
      generate
    };
  }

  const QUESTION_CATEGORIES = [
    {
      id: "arithmetic",
      name: "Arithmetic",
      subcategories: [
        {
          id: "addition",
          name: "Addition",
          questionTypes: [
            questionType(
              "positive-addition-under-20",
              "Positive Integer Addition",
              "a + b",
              "1 ≤ a, b ≤ 20",
              generatePositiveAdditionUnder20
            ),
            questionType(
              "positive-addition-under-100",
              "Positive Integer Addition",
              "a + b",
              "1 ≤ a, b < 100",
              generatePositiveAdditionUnder100
            ),
            questionType(
              "positive-addition-under-1000",
              "Positive Integer Addition",
              "a + b",
              "1 ≤ a, b < 1,000",
              generatePositiveAdditionUnder1000
            ),
            questionType(
              "positive-three-number-addition-under-20",
              "Three-Term Addition",
              "a + b + c",
              "1 ≤ a, b, c ≤ 20",
              generatePositiveThreeNumberAdditionUnder20
            ),
            questionType(
              "positive-three-number-addition-under-100",
              "Three-Term Addition",
              "a + b + c",
              "1 ≤ a, b, c < 100",
              generatePositiveThreeNumberAdditionUnder100
            ),
            questionType(
              "addition-multiples-of-10",
              "Adding Multiples of 10",
              "a + b",
              "a and b are multiples of 10",
              generateAdditionMultiplesOf10
            ),
            questionType(
              "integer-addition",
              "Directed Number Addition",
              "a + b",
              "−50 ≤ a, b ≤ 50",
              generateIntegerAddition
            ),
            questionType(
              "integer-three-number-addition",
              "Three-Term Directed Number Addition",
              "a + b + c",
              "−20 ≤ a, b, c ≤ 20",
              generateIntegerThreeNumberAddition
            )
          ]
        },
        {
          id: "subtraction",
          name: "Subtraction",
          questionTypes: [
            questionType(
              "positive-subtraction-under-20",
              "Positive Integer Subtraction",
              "a − b",
              "0 ≤ b ≤ a ≤ 20",
              generatePositiveSubtractionUnder20
            ),
            questionType(
              "positive-subtraction-under-100",
              "Positive Integer Subtraction",
              "a − b",
              "0 ≤ b ≤ a < 100",
              generatePositiveSubtractionUnder100
            ),
            questionType(
              "positive-subtraction-under-1000",
              "Positive Integer Subtraction",
              "a − b",
              "0 ≤ b ≤ a < 1,000",
              generatePositiveSubtractionUnder1000
            ),
            questionType(
              "positive-three-number-subtraction-under-100",
              "Three-Term Subtraction",
              "a − b − c",
              "answer ≥ 0, a < 100",
              generatePositiveThreeNumberSubtractionUnder100
            ),
            questionType(
              "subtraction-multiples-of-10",
              "Subtracting Multiples of 10",
              "a − b",
              "a and b are multiples of 10",
              generateSubtractionMultiplesOf10
            ),
            questionType(
              "integer-subtraction",
              "Directed Number Subtraction",
              "a − b",
              "−50 ≤ a, b ≤ 50",
              generateIntegerSubtraction
            ),
            questionType(
              "integer-three-number-subtraction",
              "Three-Term Directed Number Subtraction",
              "a − b − c",
              "−20 ≤ a, b, c ≤ 20",
              generateIntegerThreeNumberSubtraction
            )
          ]
        },
        {
          id: "multiplication",
          name: "Multiplication",
          questionTypes: [
            ...createTimesTableQuestionTypes(),
            questionType(
              "mixed-multiplication-to-10",
              "Mixed Multiplication",
              "a × b",
              "1 ≤ a, b ≤ 10",
              generateMixedMultiplicationTo10
            ),
            questionType(
              "multiplication-tables",
              "Mixed Multiplication",
              "a × b",
              "1 ≤ a, b ≤ 12",
              generateMixedMultiplicationTo12
            ),
            questionType(
              "multiplication-12-by-100",
              "Multiplication with a Larger Factor",
              "a × b",
              "1 ≤ a ≤ 12, 1 ≤ b ≤ 100",
              generateMultiplication12By100
            ),
            questionType(
              "positive-multiplication-under-20",
              "Positive Integer Multiplication",
              "a × b",
              "2 ≤ a, b < 20",
              generatePositiveMultiplicationUnder20
            ),
            questionType(
              "two-digit-by-one-digit",
              "Two-Digit by One-Digit Multiplication",
              "a × b",
              "10 ≤ a ≤ 99, 2 ≤ b ≤ 9",
              generateTwoDigitByOneDigit
            ),
            questionType(
              "three-digit-by-one-digit",
              "Three-Digit by One-Digit Multiplication",
              "a × b",
              "100 ≤ a ≤ 999, 2 ≤ b ≤ 9",
              generateThreeDigitByOneDigit
            ),
            questionType(
              "two-digit-by-two-digit",
              "Two-Digit Multiplication",
              "a × b",
              "10 ≤ a, b ≤ 99",
              generateTwoDigitByTwoDigit
            ),
            questionType(
              "multiply-by-10",
              "Multiplying by 10",
              "a × 10",
              "1 ≤ a ≤ 999",
              generateMultiplyBy10
            ),
            questionType(
              "multiply-by-100",
              "Multiplying by 100",
              "a × 100",
              "1 ≤ a ≤ 999",
              generateMultiplyBy100
            ),
            questionType(
              "multiply-by-multiple-of-10",
              "Multiplying by a Multiple of 10",
              "a × b",
              "b ∈ {20, 30, …, 90}",
              generateMultiplyByMultipleOf10
            ),
            questionType(
              "multiply-by-multiple-of-100",
              "Multiplying by a Multiple of 100",
              "a × b",
              "b ∈ {200, 300, …, 900}",
              generateMultiplyByMultipleOf100
            ),
            questionType(
              "positive-three-factor-multiplication",
              "Three-Factor Multiplication",
              "a × b × c",
              "1 ≤ a, b, c ≤ 10",
              generatePositiveThreeFactorMultiplication
            ),
            questionType(
              "integer-multiplication",
              "Directed Number Multiplication",
              "a × b",
              "−12 ≤ a, b ≤ 12",
              generateIntegerMultiplication
            ),
            questionType(
              "integer-three-factor-multiplication",
              "Three-Factor Directed Multiplication",
              "a × b × c",
              "−10 ≤ a, b, c ≤ 10",
              generateIntegerThreeFactorMultiplication
            )
          ]
        },
        {
          id: "division",
          name: "Division",
          questionTypes: [
            ...createDivisionTableQuestionTypes(),
            questionType(
              "mixed-division-to-10",
              "Mixed Division Facts",
              "a ÷ b",
              "2 ≤ b ≤ 10, answer ≤ 10",
              generateMixedDivisionTo10
            ),
            questionType(
              "division-facts",
              "Mixed Division Facts",
              "a ÷ b",
              "2 ≤ b ≤ 12, answer ≤ 12",
              generateMixedDivisionTo12
            ),
            questionType(
              "positive-exact-division",
              "Positive Exact Division",
              "a ÷ b",
              "2 ≤ b ≤ 12, answer < 100",
              generatePositiveExactDivision
            ),
            questionType(
              "two-digit-by-one-digit-exact-division",
              "Two-Digit Exact Division",
              "a ÷ b",
              "a has 2 digits, 2 ≤ b ≤ 9",
              generateTwoDigitByOneDigitExactDivision
            ),
            questionType(
              "three-digit-by-one-digit-exact-division",
              "Three-Digit Exact Division",
              "a ÷ b",
              "a has 3 digits, 2 ≤ b ≤ 9",
              generateThreeDigitByOneDigitExactDivision
            ),
            questionType(
              "two-digit-division-with-remainder",
              "Two-Digit Division with Remainder",
              "a ÷ b",
              "a has 2 digits, 2 ≤ b ≤ 9",
              generateTwoDigitDivisionWithRemainder
            ),
            questionType(
              "three-digit-division-with-remainder",
              "Three-Digit Division with Remainder",
              "a ÷ b",
              "a has 3 digits, 2 ≤ b ≤ 9",
              generateThreeDigitDivisionWithRemainder
            ),
            questionType(
              "divide-by-10",
              "Dividing by 10",
              "a ÷ 10",
              "a is a multiple of 10",
              generateDivideBy10
            ),
            questionType(
              "divide-by-100",
              "Dividing by 100",
              "a ÷ 100",
              "a is a multiple of 100",
              generateDivideBy100
            ),
            questionType(
              "divide-by-multiple-of-10",
              "Dividing by a Multiple of 10",
              "a ÷ b",
              "b ∈ {20, 30, …, 90}, exact answer",
              generateDivideByMultipleOf10
            ),
            questionType(
              "integer-exact-division",
              "Directed Number Division",
              "a ÷ b",
              "2 ≤ b ≤ 12, −12 ≤ answer ≤ 12",
              generateIntegerExactDivision
            )
          ]
        },
        {
          id: "missing-numbers",
          name: "Missing Numbers",
          questionTypes: [
            questionType(
              "missing-addend-under-100",
              "Missing Addend",
              "□ + a = b",
              "all values below 100",
              generateMissingAddendUnder100
            ),
            questionType(
              "missing-subtrahend-under-100",
              "Missing Subtrahend",
              "a − □ = b",
              "all values below 100",
              generateMissingSubtrahendUnder100
            ),
            questionType(
              "missing-factor-to-12",
              "Missing Factor",
              "□ × a = b",
              "times tables up to 12 × 12",
              generateMissingFactorTo12
            ),
            questionType(
              "missing-dividend-to-12",
              "Missing Dividend",
              "□ ÷ a = b",
              "division facts up to 12 × 12",
              generateMissingDividendTo12
            ),
            questionType(
              "missing-divisor-to-12",
              "Missing Divisor",
              "a ÷ □ = b",
              "division facts up to 12 × 12",
              generateMissingDivisorTo12
            )
          ]
        },
        {
          id: "mixed-arithmetic",
          name: "Mixed Arithmetic",
          questionTypes: [
            questionType(
              "mixed-addition-subtraction-under-100",
              "Mixed Addition and Subtraction",
              "a + b or a − b",
              "values below 100",
              generateMixedAdditionSubtractionUnder100
            ),
            questionType(
              "three-term-mixed-addition-subtraction",
              "Three-Term Addition and Subtraction",
              "a ± b ± c",
              "positive integers, answer ≥ 0",
              generateThreeTermMixedAdditionSubtraction
            ),
            questionType(
              "mixed-multiplication-division-to-12",
              "Mixed Multiplication and Division",
              "a × b or a ÷ b",
              "facts up to 12 × 12",
              generateMixedMultiplicationDivisionTo12
            ),
            questionType(
              "mixed-four-operations",
              "Mixed Four Operations",
              "+, −, × or ÷",
              "positive integer answers",
              generateMixedFourOperations
            )
          ]
        }
      ]
    },
    {
      id: "equations-and-inequations",
      name: "Equations and Inequations",
      subcategories: [
        {
          id: "one-step-equations",
          name: "One Step Equations",
          questionTypes: [
            questionType(
              "one-step-equation-addition",
              "Addition Equations",
              "x + a = b",
              "positive integer solutions",
              generateOneStepAdditionEquation
            ),
            questionType(
              "one-step-equation-subtraction",
              "Subtraction Equations",
              "x − a = b",
              "positive integer solutions",
              generateOneStepSubtractionEquation
            ),
            questionType(
              "one-step-equation-multiplication",
              "Multiplication Equations",
              "ax = b",
              "2 ≤ a ≤ 12, positive integer solutions",
              generateOneStepMultiplicationEquation
            ),
            questionType(
              "one-step-equation-division",
              "Division Equations",
              "a ÷ x = b",
              "2 ≤ x ≤ 12, positive integer solutions",
              generateOneStepDivisionEquation
            ),
            questionType(
              "mixed-one-step-equations",
              "Mixed One Step Equations",
              "x + a = b, x − a = b, ax = b or a ÷ x = b",
              "positive integer solutions",
              generateMixedOneStepEquation
            )
          ]
        }
      ]
    }
  ];

  function createTimesTableQuestionTypes() {
    return Array.from({ length: 11 }, (_, index) => {
      const table = index + 2;

      return questionType(
        `times-table-${table}`,
        `${table} Times Table`,
        `${table} × b`,
        "1 ≤ b ≤ 12",
        () => generateTimesTable(table)
      );
    });
  }

  function createDivisionTableQuestionTypes() {
    return Array.from({ length: 11 }, (_, index) => {
      const divisor = index + 2;

      return questionType(
        `division-table-${divisor}`,
        `Dividing by ${divisor}`,
        `a ÷ ${divisor}`,
        `a is a multiple of ${divisor}, answer 1–12`,
        () => generateDivisionTable(divisor)
      );
    });
  }

  function randomInt(minimum, maximum) {
    return Math.floor(
      Math.random() * (maximum - minimum + 1)
    ) + minimum;
  }

  function randomNonZeroInt(minimum, maximum) {
    let value = 0;

    while (value === 0) {
      value = randomInt(minimum, maximum);
    }

    return value;
  }

  function choice(array) {
    return array[randomInt(0, array.length - 1)];
  }

  function formatTerm(value) {
    return value < 0 ? `(${value})` : String(value);
  }

  function makeQuestion(
    question,
    answer,
    {
      answerPrefix = "",
      answerSuffix = ""
    } = {}
  ) {
    const answerText = String(answer);
    const displayAnswer =
      `${answerPrefix}${answerText}${answerSuffix}`;

    return {
      question,
      answer,
      answerText,
      answerPrefix,
      answerSuffix,
      displayAnswer,
      answerKey: displayAnswer
    };
  }

  function formatAnswer(question) {
    if (!question) {
      return "";
    }

    const answerPrefix =
      typeof question.answerPrefix === "string"
        ? question.answerPrefix
        : "";

    const answerText =
      question.answerText !== undefined
        ? String(question.answerText)
        : question.answer !== undefined
          ? String(question.answer)
          : "";

    const answerSuffix =
      typeof question.answerSuffix === "string"
        ? question.answerSuffix
        : "";

    return `${answerPrefix}${answerText}${answerSuffix}`;
  }

  function generatePositiveAdditionUnder20() {
    const a = randomInt(1, 20);
    const b = randomInt(1, 20);

    return makeQuestion(`${a} + ${b}`, a + b);
  }

  function generatePositiveAdditionUnder100() {
    const a = randomInt(1, 99);
    const b = randomInt(1, 99);

    return makeQuestion(`${a} + ${b}`, a + b);
  }

  function generatePositiveAdditionUnder1000() {
    const a = randomInt(1, 999);
    const b = randomInt(1, 999);

    return makeQuestion(`${a} + ${b}`, a + b);
  }

  function generatePositiveThreeNumberAdditionUnder20() {
    const a = randomInt(1, 20);
    const b = randomInt(1, 20);
    const c = randomInt(1, 20);

    return makeQuestion(`${a} + ${b} + ${c}`, a + b + c);
  }

  function generatePositiveThreeNumberAdditionUnder100() {
    const a = randomInt(1, 99);
    const b = randomInt(1, 99);
    const c = randomInt(1, 99);

    return makeQuestion(`${a} + ${b} + ${c}`, a + b + c);
  }

  function generateAdditionMultiplesOf10() {
    const a = randomInt(1, 99) * 10;
    const b = randomInt(1, 99) * 10;

    return makeQuestion(`${a} + ${b}`, a + b);
  }

  function generateIntegerAddition() {
    const a = randomInt(-50, 50);
    const b = randomInt(-50, 50);

    return makeQuestion(
      `${formatTerm(a)} + ${formatTerm(b)}`,
      a + b
    );
  }

  function generateIntegerThreeNumberAddition() {
    const a = randomInt(-20, 20);
    const b = randomInt(-20, 20);
    const c = randomInt(-20, 20);

    return makeQuestion(
      `${formatTerm(a)} + ${formatTerm(b)} + ${formatTerm(c)}`,
      a + b + c
    );
  }

  function generatePositiveSubtractionUnder20() {
    const a = randomInt(1, 20);
    const b = randomInt(0, a);

    return makeQuestion(`${a} − ${b}`, a - b);
  }

  function generatePositiveSubtractionUnder100() {
    const a = randomInt(1, 99);
    const b = randomInt(0, a);

    return makeQuestion(`${a} − ${b}`, a - b);
  }

  function generatePositiveSubtractionUnder1000() {
    const a = randomInt(1, 999);
    const b = randomInt(0, a);

    return makeQuestion(`${a} − ${b}`, a - b);
  }

  function generatePositiveThreeNumberSubtractionUnder100() {
    const a = randomInt(1, 99);
    const b = randomInt(0, a);
    const c = randomInt(0, a - b);

    return makeQuestion(`${a} − ${b} − ${c}`, a - b - c);
  }

  function generateSubtractionMultiplesOf10() {
    const a = randomInt(1, 99) * 10;
    const b = randomInt(0, Math.floor(a / 10)) * 10;

    return makeQuestion(`${a} − ${b}`, a - b);
  }

  function generateIntegerSubtraction() {
    const a = randomInt(-50, 50);
    const b = randomInt(-50, 50);

    return makeQuestion(
      `${formatTerm(a)} − ${formatTerm(b)}`,
      a - b
    );
  }

  function generateIntegerThreeNumberSubtraction() {
    const a = randomInt(-20, 20);
    const b = randomInt(-20, 20);
    const c = randomInt(-20, 20);

    return makeQuestion(
      `${formatTerm(a)} − ${formatTerm(b)} − ${formatTerm(c)}`,
      a - b - c
    );
  }

  function generateTimesTable(table) {
    const factor = randomInt(1, 12);

    return makeQuestion(
      `${table} × ${factor}`,
      table * factor
    );
  }

  function generateMixedMultiplicationTo10() {
    const a = randomInt(1, 10);
    const b = randomInt(1, 10);

    return makeQuestion(`${a} × ${b}`, a * b);
  }

  function generateMixedMultiplicationTo12() {
    const a = randomInt(1, 12);
    const b = randomInt(1, 12);

    return makeQuestion(`${a} × ${b}`, a * b);
  }

  function generateMultiplication12By100() {
    const a = randomInt(1, 12);
    const b = randomInt(1, 100);

    return makeQuestion(`${a} × ${b}`, a * b);
  }

  function generatePositiveMultiplicationUnder20() {
    const a = randomInt(2, 19);
    const b = randomInt(2, 19);

    return makeQuestion(`${a} × ${b}`, a * b);
  }

  function generateTwoDigitByOneDigit() {
    const a = randomInt(10, 99);
    const b = randomInt(2, 9);

    return makeQuestion(`${a} × ${b}`, a * b);
  }

  function generateThreeDigitByOneDigit() {
    const a = randomInt(100, 999);
    const b = randomInt(2, 9);

    return makeQuestion(`${a} × ${b}`, a * b);
  }

  function generateTwoDigitByTwoDigit() {
    const a = randomInt(10, 99);
    const b = randomInt(10, 99);

    return makeQuestion(`${a} × ${b}`, a * b);
  }

  function generateMultiplyBy10() {
    const a = randomInt(1, 999);

    return makeQuestion(`${a} × 10`, a * 10);
  }

  function generateMultiplyBy100() {
    const a = randomInt(1, 999);

    return makeQuestion(`${a} × 100`, a * 100);
  }

  function generateMultiplyByMultipleOf10() {
    const a = randomInt(1, 99);
    const b = randomInt(2, 9) * 10;

    return makeQuestion(`${a} × ${b}`, a * b);
  }

  function generateMultiplyByMultipleOf100() {
    const a = randomInt(1, 99);
    const b = randomInt(2, 9) * 100;

    return makeQuestion(`${a} × ${b}`, a * b);
  }

  function generatePositiveThreeFactorMultiplication() {
    const a = randomInt(1, 10);
    const b = randomInt(1, 10);
    const c = randomInt(1, 10);

    return makeQuestion(`${a} × ${b} × ${c}`, a * b * c);
  }

  function generateIntegerMultiplication() {
    const a = randomNonZeroInt(-12, 12);
    const b = randomNonZeroInt(-12, 12);

    return makeQuestion(
      `${formatTerm(a)} × ${formatTerm(b)}`,
      a * b
    );
  }

  function generateIntegerThreeFactorMultiplication() {
    const a = randomNonZeroInt(-10, 10);
    const b = randomNonZeroInt(-10, 10);
    const c = randomNonZeroInt(-10, 10);

    return makeQuestion(
      `${formatTerm(a)} × ${formatTerm(b)} × ${formatTerm(c)}`,
      a * b * c
    );
  }

  function generateDivisionTable(divisor) {
    const answer = randomInt(1, 12);
    const dividend = divisor * answer;

    return makeQuestion(`${dividend} ÷ ${divisor}`, answer);
  }

  function generateMixedDivisionTo10() {
    const divisor = randomInt(2, 10);
    const answer = randomInt(1, 10);

    return makeQuestion(
      `${divisor * answer} ÷ ${divisor}`,
      answer
    );
  }

  function generateMixedDivisionTo12() {
    const divisor = randomInt(2, 12);
    const answer = randomInt(1, 12);

    return makeQuestion(
      `${divisor * answer} ÷ ${divisor}`,
      answer
    );
  }

  function generatePositiveExactDivision() {
    const divisor = randomInt(2, 12);
    const answer = randomInt(1, 99);

    return makeQuestion(
      `${divisor * answer} ÷ ${divisor}`,
      answer
    );
  }

  function generateTwoDigitByOneDigitExactDivision() {
    return generateExactDivisionWithDividendRange(10, 99);
  }

  function generateThreeDigitByOneDigitExactDivision() {
    return generateExactDivisionWithDividendRange(100, 999);
  }

  function generateExactDivisionWithDividendRange(
    minimumDividend,
    maximumDividend
  ) {
    const divisor = randomInt(2, 9);
    const minimumAnswer = Math.ceil(minimumDividend / divisor);
    const maximumAnswer = Math.floor(maximumDividend / divisor);
    const answer = randomInt(minimumAnswer, maximumAnswer);
    const dividend = divisor * answer;

    return makeQuestion(`${dividend} ÷ ${divisor}`, answer);
  }

  function generateTwoDigitDivisionWithRemainder() {
    return generateDivisionWithRemainder(10, 99);
  }

  function generateThreeDigitDivisionWithRemainder() {
    return generateDivisionWithRemainder(100, 999);
  }

  function generateDivisionWithRemainder(
    minimumDividend,
    maximumDividend
  ) {
    for (let attempt = 0; attempt < 100; attempt++) {
      const divisor = randomInt(2, 9);
      const remainder = randomInt(1, divisor - 1);

      const minimumAnswer = Math.max(
        1,
        Math.ceil((minimumDividend - remainder) / divisor)
      );

      const maximumAnswer = Math.floor(
        (maximumDividend - remainder) / divisor
      );

      if (maximumAnswer < minimumAnswer) {
        continue;
      }

      const answer = randomInt(minimumAnswer, maximumAnswer);
      const dividend = answer * divisor + remainder;

      return makeQuestion(
        `${dividend} ÷ ${divisor}`,
        `${answer} r ${remainder}`
      );
    }

    return makeQuestion("17 ÷ 5", "3 r 2");
  }

  function generateDivideBy10() {
    const answer = randomInt(1, 999);

    return makeQuestion(`${answer * 10} ÷ 10`, answer);
  }

  function generateDivideBy100() {
    const answer = randomInt(1, 999);

    return makeQuestion(`${answer * 100} ÷ 100`, answer);
  }

  function generateDivideByMultipleOf10() {
    const divisor = randomInt(2, 9) * 10;
    const answer = randomInt(1, 30);

    return makeQuestion(
      `${divisor * answer} ÷ ${divisor}`,
      answer
    );
  }

  function generateIntegerExactDivision() {
    const divisor = randomInt(2, 12);
    const answer = randomNonZeroInt(-12, 12);
    const dividend = divisor * answer;

    return makeQuestion(
      `${formatTerm(dividend)} ÷ ${divisor}`,
      answer
    );
  }

  function generateMissingAddendUnder100() {
    const missing = randomInt(1, 99);
    const known = randomInt(1, 99);
    const total = missing + known;

    return makeQuestion(`□ + ${known} = ${total}`, missing);
  }

  function generateMissingSubtrahendUnder100() {
    const startingValue = randomInt(1, 99);
    const missing = randomInt(0, startingValue);
    const result = startingValue - missing;

    return makeQuestion(
      `${startingValue} − □ = ${result}`,
      missing
    );
  }

  function generateMissingFactorTo12() {
    const missing = randomInt(1, 12);
    const known = randomInt(1, 12);

    return makeQuestion(
      `□ × ${known} = ${missing * known}`,
      missing
    );
  }

  function generateMissingDividendTo12() {
    const divisor = randomInt(2, 12);
    const answer = randomInt(1, 12);
    const dividend = divisor * answer;

    return makeQuestion(
      `□ ÷ ${divisor} = ${answer}`,
      dividend
    );
  }

  function generateMissingDivisorTo12() {
    const divisor = randomInt(2, 12);
    const answer = randomInt(1, 12);
    const dividend = divisor * answer;

    return makeQuestion(
      `${dividend} ÷ □ = ${answer}`,
      divisor
    );
  }

  function generateMixedAdditionSubtractionUnder100() {
    return Math.random() < 0.5
      ? generatePositiveAdditionUnder100()
      : generatePositiveSubtractionUnder100();
  }

  function generateThreeTermMixedAdditionSubtraction() {
    const pattern = choice(["++", "+-", "-+", "--"]);

    if (pattern === "++") {
      const a = randomInt(1, 50);
      const b = randomInt(1, 50);
      const c = randomInt(1, 50);

      return makeQuestion(`${a} + ${b} + ${c}`, a + b + c);
    }

    if (pattern === "+-") {
      const a = randomInt(1, 50);
      const b = randomInt(1, 50);
      const c = randomInt(0, a + b);

      return makeQuestion(`${a} + ${b} − ${c}`, a + b - c);
    }

    if (pattern === "-+") {
      const a = randomInt(1, 50);
      const b = randomInt(0, a);
      const c = randomInt(1, 50);

      return makeQuestion(`${a} − ${b} + ${c}`, a - b + c);
    }

    const a = randomInt(1, 99);
    const b = randomInt(0, a);
    const c = randomInt(0, a - b);

    return makeQuestion(`${a} − ${b} − ${c}`, a - b - c);
  }

  function generateMixedMultiplicationDivisionTo12() {
    return Math.random() < 0.5
      ? generateMixedMultiplicationTo12()
      : generateMixedDivisionTo12();
  }

  function generateMixedFourOperations() {
    return choice([
      generatePositiveAdditionUnder100,
      generatePositiveSubtractionUnder100,
      generateMixedMultiplicationTo12,
      generateMixedDivisionTo12
    ])();
  }

  function generateOneStepAdditionEquation() {
    const solution = randomInt(1, 50);
    const amountAdded = randomInt(1, 30);
    const result = solution + amountAdded;

    return makeQuestion(
      `x + ${amountAdded} = ${result}`,
      solution,
      {
        answerPrefix: "x = "
      }
    );
  }

  function generateOneStepSubtractionEquation() {
    const result = randomInt(1, 50);
    const amountSubtracted = randomInt(1, 30);
    const solution = result + amountSubtracted;

    return makeQuestion(
      `x − ${amountSubtracted} = ${result}`,
      solution,
      {
        answerPrefix: "x = "
      }
    );
  }

  function generateOneStepMultiplicationEquation() {
    const coefficient = randomInt(2, 12);
    const solution = randomInt(1, 12);
    const result = coefficient * solution;

    return makeQuestion(
      `${coefficient}x = ${result}`,
      solution,
      {
        answerPrefix: "x = "
      }
    );
  }

  function generateOneStepDivisionEquation() {
    const solution = randomInt(2, 12);
    const result = randomInt(1, 12);
    const dividend = solution * result;

    return makeQuestion(
      `${dividend} ÷ x = ${result}`,
      solution,
      {
        answerPrefix: "x = "
      }
    );
  }

  function generateMixedOneStepEquation() {
    return choice([
      generateOneStepAdditionEquation,
      generateOneStepSubtractionEquation,
      generateOneStepMultiplicationEquation,
      generateOneStepDivisionEquation
    ])();
  }

  function getCategories() {
    return QUESTION_CATEGORIES;
  }

  function getAllQuestionTypes() {
    return QUESTION_CATEGORIES.flatMap((category) => {
      return category.subcategories.flatMap((subcategory) => {
        return subcategory.questionTypes.map((type) => ({
          ...type,
          categoryId: category.id,
          categoryName: category.name,
          subcategoryId: subcategory.id,
          subcategoryName: subcategory.name
        }));
      });
    });
  }

  function getQuestionType(typeId) {
    return getAllQuestionTypes().find((type) => {
      return type.id === typeId;
    }) || null;
  }

  function generateQuestion(typeId) {
    const type = getQuestionType(typeId);

    if (!type) {
      throw new Error(`Unknown question type: ${typeId}`);
    }

    const generatedQuestion = type.generate();

    const answerPrefix =
      typeof generatedQuestion.answerPrefix === "string"
        ? generatedQuestion.answerPrefix
        : "";

    const answerSuffix =
      typeof generatedQuestion.answerSuffix === "string"
        ? generatedQuestion.answerSuffix
        : "";

    const answerText =
      generatedQuestion.answerText !== undefined
        ? String(generatedQuestion.answerText)
        : generatedQuestion.answer !== undefined
          ? String(generatedQuestion.answer)
          : "";

    const displayAnswer =
      `${answerPrefix}${answerText}${answerSuffix}`;

    return {
      ...generatedQuestion,
      answerText,
      answerPrefix,
      answerSuffix,
      displayAnswer,
      answerKey: displayAnswer,
      typeId: type.id,
      typeName: type.name,
      categoryName: type.categoryName,
      subcategoryName: type.subcategoryName
    };
  }

  function generateUniqueQuestions(count, selectedTypeIds) {
    const validTypeIds = selectedTypeIds.filter((typeId) => {
      return getQuestionType(typeId) !== null;
    });

    if (validTypeIds.length === 0) {
      throw new Error("At least one question type must be selected.");
    }

    const questions = [];
    const usedAnswers = new Set();
    const usedQuestions = new Set();

    let attempts = 0;
    const maximumAttempts = count * 1500;

    while (
      questions.length < count &&
      attempts < maximumAttempts
    ) {
      attempts++;

      const typeId = choice(validTypeIds);
      const generatedQuestion = generateQuestion(typeId);

      if (usedAnswers.has(generatedQuestion.answerKey)) {
        continue;
      }

      if (usedQuestions.has(generatedQuestion.question)) {
        continue;
      }

      usedAnswers.add(generatedQuestion.answerKey);
      usedQuestions.add(generatedQuestion.question);
      questions.push(generatedQuestion);
    }

    if (questions.length < count) {
      throw new Error(
        "The selected question types could not produce enough different answers. Select more question types or use fewer cards."
      );
    }

    return questions;
  }

  return {
    getCategories,
    getAllQuestionTypes,
    getQuestionType,
    generateQuestion,
    generateUniqueQuestions,
    formatAnswer
  };
})();
