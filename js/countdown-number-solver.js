globalThis.CountdownNumberSolver = (() => {
  "use strict";

  function addExpression(states, mask, value, expression) {
    if (!Number.isInteger(value) || value <= 0) return;

    let expressionsByKey = states[mask].get(value);
    if (!expressionsByKey) {
      expressionsByKey = new Map();
      states[mask].set(value, expressionsByKey);
    }

    if (!expressionsByKey.has(expression.key)) {
      expressionsByKey.set(expression.key, expression);
    }
  }

  function formatOperand(expression, operation, isRightOperand) {
    let needsParentheses = false;

    if (operation === "+") {
      needsParentheses = expression.precedence < 1;
    } else if (operation === "-") {
      needsParentheses = expression.precedence < 1 ||
        (isRightOperand && expression.precedence <= 1);
    } else if (operation === "*") {
      needsParentheses = expression.precedence < 2;
    } else if (operation === "/") {
      needsParentheses = expression.precedence < 2 ||
        (isRightOperand && expression.precedence <= 2);
    }

    return needsParentheses
      ? `(${expression.text})`
      : expression.text;
  }

  function combineExpressions(left, right, operation, value) {
    let key;
    let terms = null;

    if (operation === "+" || operation === "*") {
      const leftTerms = left.operation === operation
        ? left.terms
        : [left.key];
      const rightTerms = right.operation === operation
        ? right.terms
        : [right.key];

      terms = [...leftTerms, ...rightTerms].sort();
      key = `${operation}(${terms.join(",")})`;
    } else {
      key = `${operation}(${left.key},${right.key})`;
    }

    const symbol = operation === "*"
      ? "×"
      : operation === "/"
        ? "÷"
        : operation;

    return {
      value,
      text: `${formatOperand(left, operation, false)} ${symbol} ${formatOperand(right, operation, true)}`,
      key,
      precedence: operation === "+" || operation === "-" ? 1 : 2,
      operation,
      terms,
      usedCount: left.usedCount + right.usedCount
    };
  }

  function buildAllStates(numbers) {
    const stateCount = 1 << numbers.length;
    const states = Array.from(
      { length: stateCount },
      () => new Map()
    );

    numbers.forEach((number, index) => {
      addExpression(states, 1 << index, number, {
        value: number,
        text: String(number),
        key: `number:${number}`,
        precedence: 3,
        operation: "number",
        terms: [`number:${number}`],
        usedCount: 1
      });
    });

    for (let mask = 1; mask < stateCount; mask += 1) {
      if ((mask & (mask - 1)) === 0) continue;

      for (
        let leftMask = (mask - 1) & mask;
        leftMask;
        leftMask = (leftMask - 1) & mask
      ) {
        const rightMask = mask ^ leftMask;

        if (!rightMask || leftMask > rightMask) continue;

        for (const [leftValue, leftExpressions] of states[leftMask]) {
          for (const [rightValue, rightExpressions] of states[rightMask]) {
            for (const left of leftExpressions.values()) {
              for (const right of rightExpressions.values()) {
                addExpression(
                  states,
                  mask,
                  leftValue + rightValue,
                  combineExpressions(left, right, "+", leftValue + rightValue)
                );

                addExpression(
                  states,
                  mask,
                  leftValue * rightValue,
                  combineExpressions(left, right, "*", leftValue * rightValue)
                );

                if (leftValue > rightValue) {
                  addExpression(
                    states,
                    mask,
                    leftValue - rightValue,
                    combineExpressions(left, right, "-", leftValue - rightValue)
                  );
                }

                if (rightValue > leftValue) {
                  addExpression(
                    states,
                    mask,
                    rightValue - leftValue,
                    combineExpressions(right, left, "-", rightValue - leftValue)
                  );
                }

                if (leftValue % rightValue === 0) {
                  addExpression(
                    states,
                    mask,
                    leftValue / rightValue,
                    combineExpressions(left, right, "/", leftValue / rightValue)
                  );
                }

                if (rightValue % leftValue === 0) {
                  addExpression(
                    states,
                    mask,
                    rightValue / leftValue,
                    combineExpressions(right, left, "/", rightValue / leftValue)
                  );
                }
              }
            }
          }
        }
      }
    }

    return states;
  }

  function collectTargetExpressions(states, target) {
    const expressionsByKey = new Map();
    const displayKeys = new Set();

    for (let mask = 1; mask < states.length; mask += 1) {
      const expressions = states[mask].get(target);
      if (!expressions) continue;

      for (const expression of expressions.values()) {
        if (expression.usedCount < 2) continue;

        const displayKey = expression.text
          .replace(/\s+/g, " ")
          .trim();

        if (
          expressionsByKey.has(expression.key) ||
          displayKeys.has(displayKey)
        ) {
          continue;
        }

        expressionsByKey.set(expression.key, expression);
        displayKeys.add(displayKey);
      }
    }

    return [...expressionsByKey.values()];
  }

  function chooseTarget(numbers, states) {
    const preferred = [];
    const acceptable = [];
    const fallback = [];
    const sourceNumbers = new Set(numbers);

    for (let target = 101; target <= 999; target += 1) {
      if (sourceNumbers.has(target)) continue;

      const expressions = collectTargetExpressions(states, target);
      if (!expressions.length) continue;

      const maximumNumbersUsed = Math.max(
        ...expressions.map((expression) => expression.usedCount)
      );
      const minimumNumbersUsed = Math.min(
        ...expressions.map((expression) => expression.usedCount)
      );

      const candidate = {
        target,
        expressions,
        maximumNumbersUsed,
        minimumNumbersUsed
      };

      fallback.push(candidate);

      if (
        expressions.length <= 160 &&
        maximumNumbersUsed >= 4
      ) {
        acceptable.push(candidate);
      }

      if (
        expressions.length >= 2 &&
        expressions.length <= 80 &&
        maximumNumbersUsed >= 5 &&
        minimumNumbersUsed >= 2
      ) {
        preferred.push(candidate);
      }
    }

    const pool = preferred.length
      ? preferred
      : acceptable.length
        ? acceptable
        : fallback;

    if (!pool.length) {
      throw new Error("No reachable three-digit target could be generated.");
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  function createGuaranteedRound(numbers) {
    if (!Array.isArray(numbers) || numbers.length !== 6) {
      throw new Error("A numbers round requires exactly six numbers.");
    }

    const cleanNumbers = numbers.map(Number);
    if (cleanNumbers.some((number) => !Number.isInteger(number) || number <= 0)) {
      throw new Error("All source numbers must be positive integers.");
    }

    const states = buildAllStates(cleanNumbers);
    const selected = chooseTarget(cleanNumbers, states);

    const uniqueSolutions = new Map();

    selected.expressions
      .sort((left, right) => (
        right.usedCount - left.usedCount ||
        left.text.localeCompare(right.text)
      ))
      .forEach((expression) => {
        const displayKey = expression.text
          .replace(/\s+/g, " ")
          .trim();

        if (!uniqueSolutions.has(displayKey)) {
          uniqueSolutions.set(displayKey, {
            expression: expression.text,
            usedCount: expression.usedCount
          });
        }
      });

    const solutions = [...uniqueSolutions.values()];

    return {
      numbers: cleanNumbers,
      target: selected.target,
      solutions
    };
  }

  return Object.freeze({
    createGuaranteedRound
  });
})();
