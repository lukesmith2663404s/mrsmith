const HauntedGenerator = (() => {
  const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const ALL_OPERATORS = ["+", "-", "×", "÷"];
  const BASIC_OPERATORS = ["+", "-"];
  const ALL_PLAYABLE_BUTTONS = [...DIGITS, ...ALL_OPERATORS];

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function choice(array) {
    return array[randomInt(0, array.length - 1)];
  }

  function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  function evaluateExpression(expression) {
    const safeExpression = expression
      .replaceAll("×", "*")
      .replaceAll("÷", "/");

    if (!/^[0-9+\-*/.\s]+$/.test(safeExpression)) {
      return null;
    }

    if (/^[+\-*/]/.test(safeExpression) || /[+\-*/]$/.test(safeExpression)) {
      return null;
    }

    if (/[+\-*/]{2,}/.test(safeExpression)) {
      return null;
    }

    try {
      const value = Function(`"use strict"; return (${safeExpression});`)();

      if (!Number.isFinite(value)) {
        return null;
      }

      return value;
    } catch {
      return null;
    }
  }

  function getDifficultyConfig(difficulty) {
    if (difficulty === "easy") {
      return {
        digitCount: 5,
        operatorCount: 2,
        digitRepeatChance: 0.35,
        operatorRepeatChance: 0.45,
        maxNumberLength: 2,
        minSolutions: 4,
        maxSolutions: 10,
        idealSolutions: 7,
        expressionLimit: 30000,
        selectionPoolSize: 12
      };
    }

    if (difficulty === "hard") {
      return {
        digitCount: 4,
        operatorCount: 3,
        digitRepeatChance: 0.1,
        operatorRepeatChance: 0.1,
        maxNumberLength: 2,
        minSolutions: 1,
        maxSolutions: 4,
        idealSolutions: 1,
        expressionLimit: 30000,
        selectionPoolSize: 8
      };
    }

    return {
      digitCount: 4,
      operatorCount: 3,
      digitRepeatChance: 0.2,
      operatorRepeatChance: 0.25,
      maxNumberLength: 2,
      minSolutions: 2,
      maxSolutions: 7,
      idealSolutions: 3,
      expressionLimit: 30000,
      selectionPoolSize: 10
    };
  }

  function makeButtonLimits(settings) {
    const config = getDifficultyConfig(settings.difficulty);
    const operators = settings.allowMultiplyDivide ? ALL_OPERATORS : BASIC_OPERATORS;

    const chosenDigits = shuffle(DIGITS).slice(0, config.digitCount);
    const chosenOperators = shuffle(operators).slice(0, Math.min(config.operatorCount, operators.length));

    const buttonLimits = {};

    chosenDigits.forEach((digit) => {
      buttonLimits[digit] = Math.random() < config.digitRepeatChance ? 2 : 1;
    });

    chosenOperators.forEach((operator) => {
      buttonLimits[operator] = Math.random() < config.operatorRepeatChance ? 2 : 1;
    });

    return buttonLimits;
  }

  function cloneLimits(buttonLimits) {
    return { ...buttonLimits };
  }

  function serializeLimits(buttonLimits) {
    return ALL_PLAYABLE_BUTTONS
      .map((button) => `${button}:${buttonLimits[button] || 0}`)
      .join("|");
  }

  function getAvailableOperators(remainingLimits) {
    return ALL_OPERATORS.filter((operator) => remainingLimits[operator] > 0);
  }

  function getMaximumTermCount(buttonLimits) {
    const operatorUses = ALL_OPERATORS.reduce((total, operator) => {
      return total + (buttonLimits[operator] || 0);
    }, 0);

    return operatorUses + 1;
  }

  function makeNumberOptions(remainingLimits, maxNumberLength) {
    const options = [];
    const seenOptions = new Set();

    function addOption(numberString, newLimits) {
      const key = `${numberString}|${serializeLimits(newLimits)}`;

      if (seenOptions.has(key)) {
        return;
      }

      seenOptions.add(key);

      options.push({
        numberString,
        remainingLimits: newLimits
      });
    }

    function build(prefix, currentLimits) {
      if (prefix.length > 0) {
        addOption(prefix, currentLimits);
      }

      if (prefix.length >= maxNumberLength) {
        return;
      }

      if (prefix === "0") {
        return;
      }

      DIGITS.forEach((digit) => {
        if ((currentLimits[digit] || 0) <= 0) {
          return;
        }

        const newLimits = cloneLimits(currentLimits);
        newLimits[digit]--;

        build(prefix + digit, newLimits);
      });
    }

    build("", remainingLimits);

    return options;
  }

  function findAllExpressions(buttonLimits, settings, config) {
    const expressions = new Set();
    const maximumTermCount = getMaximumTermCount(buttonLimits);
    let stoppedEarly = false;

    function addExpression(expression, termsUsed) {
      if (termsUsed < 2) {
        return;
      }

      expressions.add(expression);
    }

    function extendExpression(expression, remainingLimits, termsUsed) {
      if (expressions.size >= config.expressionLimit) {
        stoppedEarly = true;
        return;
      }

      addExpression(expression, termsUsed);

      if (termsUsed >= maximumTermCount) {
        return;
      }

      const availableOperators = getAvailableOperators(remainingLimits);

      availableOperators.forEach((operator) => {
        if (stoppedEarly) {
          return;
        }

        const limitsAfterOperator = cloneLimits(remainingLimits);
        limitsAfterOperator[operator]--;

        const nextNumbers = makeNumberOptions(
          limitsAfterOperator,
          config.maxNumberLength
        );

        nextNumbers.forEach((nextNumber) => {
          if (stoppedEarly) {
            return;
          }

          extendExpression(
            expression + operator + nextNumber.numberString,
            nextNumber.remainingLimits,
            termsUsed + 1
          );
        });
      });
    }

    const startingNumbers = makeNumberOptions(buttonLimits, config.maxNumberLength);

    startingNumbers.forEach((startingNumber) => {
      if (stoppedEarly) {
        return;
      }

      extendExpression(
        startingNumber.numberString,
        startingNumber.remainingLimits,
        1
      );
    });

    return {
      expressions: [...expressions],
      stoppedEarly
    };
  }

  function tokenizeExpression(expression) {
    const tokens = [];
    let currentNumber = "";

    for (const char of expression) {
      if (DIGITS.includes(char)) {
        currentNumber += char;
        continue;
      }

      if (ALL_OPERATORS.includes(char)) {
        if (currentNumber !== "") {
          tokens.push(currentNumber);
          currentNumber = "";
        }

        tokens.push(char);
      }
    }

    if (currentNumber !== "") {
      tokens.push(currentNumber);
    }

    return tokens;
  }

  function parseExpression(expression) {
    const tokens = tokenizeExpression(expression);
    let position = 0;

    function parseFactor() {
      const token = tokens[position];
      position++;

      return {
        type: "number",
        value: Number(token)
      };
    }

    function parseTerm() {
      let node = parseFactor();

      while (tokens[position] === "×" || tokens[position] === "÷") {
        const operator = tokens[position];
        position++;

        node = {
          type: "operator",
          operator,
          left: node,
          right: parseFactor()
        };
      }

      return node;
    }

    function parseSum() {
      let node = parseTerm();

      while (tokens[position] === "+" || tokens[position] === "-") {
        const operator = tokens[position];
        position++;

        node = {
          type: "operator",
          operator,
          left: node,
          right: parseTerm()
        };
      }

      return node;
    }

    return parseSum();
  }

  function makeNumberNode(value) {
    return {
      type: "number",
      value
    };
  }

  function isNumberNode(node, value) {
    return node.type === "number" && node.value === value;
  }

  function getNodeKey(node) {
    return canonicaliseNode(node);
  }

  function flattenOperator(node, operator) {
    if (node.type === "operator" && node.operator === operator) {
      return [
        ...flattenOperator(node.left, operator),
        ...flattenOperator(node.right, operator)
      ];
    }

    return [node];
  }

  function flattenSignedAdditiveTerms(node, sign = 1) {
    if (node.type === "operator" && node.operator === "+") {
      return [
        ...flattenSignedAdditiveTerms(node.left, sign),
        ...flattenSignedAdditiveTerms(node.right, sign)
      ];
    }

    if (node.type === "operator" && node.operator === "-") {
      return [
        ...flattenSignedAdditiveTerms(node.left, sign),
        ...flattenSignedAdditiveTerms(node.right, sign * -1)
      ];
    }

    return [
      {
        sign,
        node
      }
    ];
  }

  function simplifyNode(node) {
    if (node.type === "number") {
      return makeNumberNode(node.value);
    }

    const left = simplifyNode(node.left);
    const right = simplifyNode(node.right);

    if (node.operator === "+" || node.operator === "-") {
      const signedTerms = flattenSignedAdditiveTerms({
        type: "operator",
        operator: node.operator,
        left,
        right
      })
        .map((term) => ({
          sign: term.sign,
          node: simplifyNode(term.node)
        }))
        .filter((term) => !isNumberNode(term.node, 0));

      if (signedTerms.length === 0) {
        return makeNumberNode(0);
      }

      if (signedTerms.length === 1 && signedTerms[0].sign === 1) {
        return signedTerms[0].node;
      }

      const positiveTerms = signedTerms
        .filter((term) => term.sign === 1)
        .map((term) => term.node)
        .sort((a, b) => getNodeKey(a).localeCompare(getNodeKey(b)));

      const negativeTerms = signedTerms
        .filter((term) => term.sign === -1)
        .map((term) => term.node)
        .sort((a, b) => getNodeKey(a).localeCompare(getNodeKey(b)));

      let rebuiltExpression = null;

      positiveTerms.forEach((term) => {
        if (rebuiltExpression === null) {
          rebuiltExpression = term;
          return;
        }

        rebuiltExpression = {
          type: "operator",
          operator: "+",
          left: rebuiltExpression,
          right: term
        };
      });

      negativeTerms.forEach((term) => {
        if (rebuiltExpression === null) {
          rebuiltExpression = {
            type: "operator",
            operator: "-",
            left: makeNumberNode(0),
            right: term
          };
          return;
        }

        rebuiltExpression = {
          type: "operator",
          operator: "-",
          left: rebuiltExpression,
          right: term
        };
      });

      return rebuiltExpression;
    }

    if (node.operator === "×") {
      const parts = [
        ...flattenOperator(left, "×"),
        ...flattenOperator(right, "×")
      ]
        .map(simplifyNode)
        .filter((part) => !isNumberNode(part, 1));

      if (parts.some((part) => isNumberNode(part, 0))) {
        return makeNumberNode(0);
      }

      if (parts.length === 0) {
        return makeNumberNode(1);
      }

      if (parts.length === 1) {
        return parts[0];
      }

      const sortedParts = parts.sort((a, b) => {
        return getNodeKey(a).localeCompare(getNodeKey(b));
      });

      return sortedParts.slice(1).reduce((current, part) => {
        return {
          type: "operator",
          operator: "×",
          left: current,
          right: part
        };
      }, sortedParts[0]);
    }

    if (node.operator === "÷") {
      if (isNumberNode(right, 1)) {
        return left;
      }

      if (isNumberNode(left, 0) && !isNumberNode(right, 0)) {
        return makeNumberNode(0);
      }

      return {
        type: "operator",
        operator: "÷",
        left,
        right
      };
    }

    return {
      type: "operator",
      operator: node.operator,
      left,
      right
    };
  }

  function canonicaliseNode(node) {
    if (node.type === "number") {
      return `n:${node.value}`;
    }

    if (node.operator === "+" || node.operator === "-") {
      const signedTerms = flattenSignedAdditiveTerms(node)
        .filter((term) => !isNumberNode(term.node, 0));

      if (signedTerms.length === 0) {
        return "n:0";
      }

      const positiveTerms = signedTerms
        .filter((term) => term.sign === 1)
        .map((term) => canonicaliseNode(term.node))
        .sort();

      const negativeTerms = signedTerms
        .filter((term) => term.sign === -1)
        .map((term) => canonicaliseNode(term.node))
        .sort();

      if (negativeTerms.length === 0 && positiveTerms.length === 1) {
        return positiveTerms[0];
      }

      return `sum(+${positiveTerms.join(",")};-${negativeTerms.join(",")})`;
    }

    if (node.operator === "×") {
      const parts = flattenOperator(node, "×")
        .map(canonicaliseNode)
        .sort();

      return `×(${parts.join(",")})`;
    }

    if (node.operator === "÷") {
      return `÷(${canonicaliseNode(node.left)},${canonicaliseNode(node.right)})`;
    }

    return `${node.operator}(${canonicaliseNode(node.left)},${canonicaliseNode(node.right)})`;
  }

  function getCanonicalExpression(expression) {
    try {
      const parsedExpression = parseExpression(expression);
      const simplifiedExpression = simplifyNode(parsedExpression);

      return canonicaliseNode(simplifiedExpression);
    } catch {
      return expression;
    }
  }

  function canTypeNumberDirectly(number, buttonLimits) {
    const numberString = String(number);
    const requiredUses = {};

    for (const digit of numberString) {
      requiredUses[digit] = (requiredUses[digit] || 0) + 1;
    }

    return Object.entries(requiredUses).every(([digit, uses]) => {
      return (buttonLimits[digit] || 0) >= uses;
    });
  }

  function getExpressionComplexity(expression) {
    const operatorCount = [...expression].filter((char) => ALL_OPERATORS.includes(char)).length;
    const digitCount = [...expression].filter((char) => DIGITS.includes(char)).length;

    return operatorCount * 2 + digitCount;
  }

  function sortSolutions(solutions) {
    return [...solutions].sort((a, b) => {
      const complexityDifference = getExpressionComplexity(a) - getExpressionComplexity(b);

      if (complexityDifference !== 0) {
        return complexityDifference;
      }

      return a.localeCompare(b);
    });
  }

  function groupExpressionsByTarget(expressions, buttonLimits, settings) {
    const targets = new Map();

    expressions.forEach((expression) => {
      const value = evaluateExpression(expression);

      if (!Number.isInteger(value)) {
        return;
      }

      if (value <= 0 || value > settings.maxTarget) {
        return;
      }

      if (canTypeNumberDirectly(value, buttonLimits)) {
        return;
      }

      if (!targets.has(value)) {
        targets.set(value, new Map());
      }

      const canonicalExpression = getCanonicalExpression(expression);
      const solutionsForTarget = targets.get(value);

      if (!solutionsForTarget.has(canonicalExpression)) {
        solutionsForTarget.set(canonicalExpression, expression);
        return;
      }

      const existingExpression = solutionsForTarget.get(canonicalExpression);

      if (expression.length < existingExpression.length) {
        solutionsForTarget.set(canonicalExpression, expression);
      }
    });

    return targets;
  }

  function chooseTargetFromSolutions(expressions, buttonLimits, settings, config, relaxedMinimum = false) {
    const groupedTargets = groupExpressionsByTarget(expressions, buttonLimits, settings);
    const candidates = [];

    groupedTargets.forEach((solutionsMap, target) => {
      const solutions = sortSolutions([...solutionsMap.values()]);
      const solutionCount = solutions.length;

      const minimumSolutions = relaxedMinimum ? 1 : config.minSolutions;

      if (solutionCount < minimumSolutions) {
        return;
      }

      if (solutionCount > config.maxSolutions || solutionCount > 10) {
        return;
      }

      candidates.push({
        target,
        solutions,
        solutionCount,
        bestComplexity: Math.max(...solutions.map(getExpressionComplexity))
      });
    });

    if (candidates.length === 0) {
      return null;
    }

    candidates.sort((a, b) => {
      const aDistanceFromIdeal = Math.abs(a.solutionCount - config.idealSolutions);
      const bDistanceFromIdeal = Math.abs(b.solutionCount - config.idealSolutions);

      if (aDistanceFromIdeal !== bDistanceFromIdeal) {
        return aDistanceFromIdeal - bDistanceFromIdeal;
      }

      if (a.solutionCount !== b.solutionCount) {
        return a.solutionCount - b.solutionCount;
      }

      return b.bestComplexity - a.bestComplexity;
    });

    return choice(candidates.slice(0, config.selectionPoolSize));
  }

  function getMissingButtons(buttonLimits) {
    return ALL_PLAYABLE_BUTTONS.filter((button) => buttonLimits[button] === undefined);
  }

  function generatePuzzle(settings) {
    const safeSettings = {
      difficulty: settings.difficulty || "medium",
      maxTarget: Number(settings.maxTarget) || 999,
      allowMultiplyDivide: settings.allowMultiplyDivide !== false
    };

    const config = getDifficultyConfig(safeSettings.difficulty);

    for (let attempt = 0; attempt < 160; attempt++) {
      const buttonLimits = makeButtonLimits(safeSettings);
      const expressionSearch = findAllExpressions(buttonLimits, safeSettings, config);

      if (expressionSearch.stoppedEarly) {
        continue;
      }

      const relaxedMinimum = attempt > 80;

      const chosenTarget = chooseTargetFromSolutions(
        expressionSearch.expressions,
        buttonLimits,
        safeSettings,
        config,
        relaxedMinimum
      );

      if (chosenTarget !== null) {
        return {
          target: chosenTarget.target,
          solution: chosenTarget.solutions[0],
          solutions: chosenTarget.solutions,
          buttonLimits,
          missingButtons: getMissingButtons(buttonLimits),
          solutionCount: chosenTarget.solutionCount
        };
      }
    }

    const fallbackButtonLimits = {
      "2": 1,
      "7": 1,
      "+": 1
    };

    return {
      target: 9,
      solution: "2+7",
      solutions: ["2+7"],
      buttonLimits: fallbackButtonLimits,
      missingButtons: getMissingButtons(fallbackButtonLimits),
      solutionCount: 1
    };
  }

  function getRemainingUsesAfterExpression(buttonLimits, expression) {
    const remainingUses = cloneLimits(buttonLimits);

    for (const char of expression) {
      if (remainingUses[char] !== undefined) {
        remainingUses[char]--;
      }
    }

    return remainingUses;
  }

  return {
    generatePuzzle,
    evaluateExpression,
    getCanonicalExpression,
    getRemainingUsesAfterExpression
  };
})();