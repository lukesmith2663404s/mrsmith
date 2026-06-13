const TreasureTrackerGenerator = (() => {
  class Fraction {
    constructor(numerator, denominator = 1) {
      if (denominator === 0) {
        throw new Error("Denominator cannot be zero.");
      }

      let normalisedNumerator = numerator;
      let normalisedDenominator = denominator;

      if (normalisedDenominator < 0) {
        normalisedNumerator *= -1;
        normalisedDenominator *= -1;
      }

      const divisor = gcd(
        Math.abs(normalisedNumerator),
        Math.abs(normalisedDenominator)
      );

      this.n = normalisedNumerator / divisor;
      this.d = normalisedDenominator / divisor;
    }

    add(other) {
      const fraction = toFraction(other);
      return new Fraction(
        this.n * fraction.d + fraction.n * this.d,
        this.d * fraction.d
      );
    }

    subtract(other) {
      const fraction = toFraction(other);
      return new Fraction(
        this.n * fraction.d - fraction.n * this.d,
        this.d * fraction.d
      );
    }

    multiply(other) {
      const fraction = toFraction(other);
      return new Fraction(this.n * fraction.n, this.d * fraction.d);
    }

    divide(other) {
      const fraction = toFraction(other);
      return new Fraction(this.n * fraction.d, this.d * fraction.n);
    }

    equals(other) {
      const fraction = toFraction(other);
      return this.n === fraction.n && this.d === fraction.d;
    }
  }

  const OPERATOR_WEIGHTS = {
    "+": 42,
    "-": 42,
    "×": 12,
    "÷": 4
  };

  function gcd(a, b) {
    if (a === 0 && b === 0) {
      return 1;
    }

    let x = a;
    let y = b;

    while (y !== 0) {
      const remainder = x % y;
      x = y;
      y = remainder;
    }

    return x || 1;
  }

  function toFraction(value) {
    if (value instanceof Fraction) {
      return value;
    }

    return new Fraction(value, 1);
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function choice(array) {
    return array[randomInt(0, array.length - 1)];
  }

  function weightedChoice(items) {
    const totalWeight = items.reduce((total, item) => {
      return total + item.weight;
    }, 0);

    let randomValue = Math.random() * totalWeight;

    for (const item of items) {
      randomValue -= item.weight;

      if (randomValue <= 0) {
        return item.value;
      }
    }

    return items[items.length - 1].value;
  }

  function coordKey(row, column) {
    return `${row},${column}`;
  }

  function generatePuzzle(settings) {
    const safeSettings = getSafeSettings(settings);

    for (let attempt = 0; attempt < 250; attempt++) {
      const solutionPath = makeSolutionPath(safeSettings.gridSize);
      const operationCells = solutionPath.slice(0, -1);

      let value = new Fraction(0, 1);
      const solutionOperations = [];

      operationCells.forEach((coord, index) => {
        const operation = choosePathOperation(value, safeSettings, index);
        solutionOperations.push(operation);
        value = applyOperation(value, operation);
      });

      if (!isTargetAllowed(value, safeSettings)) {
        continue;
      }

      const grid = buildGrid(
        safeSettings,
        solutionPath,
        solutionOperations,
        value
      );

      return {
        gridSize: safeSettings.gridSize,
        grid,
        target: value,
        solutionPath,
        solutionOperations,
        solutionExpression: buildExpression(solutionOperations, value)
      };
    }

    return makeFallbackPuzzle(safeSettings);
  }

  function getSafeSettings(settings) {
    const chosenGridSize = Number(settings.gridSize) || 5;
    const allowedGridSizes = [3, 5, 7, 9];

    return {
      gridSize: allowedGridSizes.includes(chosenGridSize) ? chosenGridSize : 5,
      allowNegativeTargets: settings.allowNegativeTargets !== false,
      allowFractionTargets: settings.allowFractionTargets === true
    };
  }

  function makeSolutionPath(gridSize) {
    const minimumOperations = {
      3: 2,
      5: 4,
      7: 6,
      9: 8
    }[gridSize];

    const maximumCells = gridSize * 2 + 5;
    const centre = getCentreCoord(gridSize);

    for (let attempt = 0; attempt < 400; attempt++) {
      const start = getRandomEdgeCoord(gridSize);
      const path = [start];
      const visited = new Set([coordKey(start.row, start.column)]);

      while (path.length < maximumCells) {
        const current = path[path.length - 1];

        if (isSameCoord(current, centre)) {
          break;
        }

        let neighbours = getNeighbours(current, gridSize).filter((coord) => {
          return !visited.has(coordKey(coord.row, coord.column));
        });

        if (neighbours.length === 0) {
          break;
        }

        const operationsSoFar = path.length - 1;
        const withoutCentreTooEarly = neighbours.filter((coord) => {
          return !isSameCoord(coord, centre) || operationsSoFar >= minimumOperations;
        });

        if (withoutCentreTooEarly.length > 0) {
          neighbours = withoutCentreTooEarly;
        }

        const currentDistance = getDistance(current, centre);
        const closerNeighbours = neighbours.filter((coord) => {
          return getDistance(coord, centre) <= currentDistance;
        });

        let nextCoord;

        if (closerNeighbours.length > 0 && Math.random() < 0.78) {
          const bestDistance = Math.min(
            ...closerNeighbours.map((coord) => getDistance(coord, centre))
          );

          const bestNeighbours = closerNeighbours.filter((coord) => {
            return getDistance(coord, centre) <= bestDistance + 1;
          });

          nextCoord = choice(bestNeighbours);
        } else {
          nextCoord = choice(neighbours);
        }

        path.push(nextCoord);
        visited.add(coordKey(nextCoord.row, nextCoord.column));
      }

      const reachedCentre = isSameCoord(path[path.length - 1], centre);
      const operationCount = path.length - 1;

      if (reachedCentre && operationCount >= minimumOperations) {
        return path;
      }
    }

    return makeDirectPath(gridSize);
  }

  function makeDirectPath(gridSize) {
    const centre = getCentreCoord(gridSize);
    const start = getRandomEdgeCoord(gridSize);
    const path = [start];
    const current = { ...start };

    const rowFirst = Math.random() < 0.5;

    if (rowFirst) {
      moveTowardsCentreByRows(current, centre, path);
      moveTowardsCentreByColumns(current, centre, path);
    } else {
      moveTowardsCentreByColumns(current, centre, path);
      moveTowardsCentreByRows(current, centre, path);
    }

    return path;
  }

  function moveTowardsCentreByRows(current, centre, path) {
    while (current.row !== centre.row) {
      current.row += current.row < centre.row ? 1 : -1;
      path.push({ row: current.row, column: current.column });
    }
  }

  function moveTowardsCentreByColumns(current, centre, path) {
    while (current.column !== centre.column) {
      current.column += current.column < centre.column ? 1 : -1;
      path.push({ row: current.row, column: current.column });
    }
  }

  function getCentreCoord(gridSize) {
    const centre = Math.floor(gridSize / 2);

    return {
      row: centre,
      column: centre
    };
  }

  function getRandomEdgeCoord(gridSize) {
    const side = randomInt(0, 3);

    if (side === 0) {
      return {
        row: 0,
        column: randomInt(0, gridSize - 1)
      };
    }

    if (side === 1) {
      return {
        row: gridSize - 1,
        column: randomInt(0, gridSize - 1)
      };
    }

    if (side === 2) {
      return {
        row: randomInt(0, gridSize - 1),
        column: 0
      };
    }

    return {
      row: randomInt(0, gridSize - 1),
      column: gridSize - 1
    };
  }

  function getNeighbours(coord, gridSize) {
    const possibleNeighbours = [
      { row: coord.row - 1, column: coord.column },
      { row: coord.row + 1, column: coord.column },
      { row: coord.row, column: coord.column - 1 },
      { row: coord.row, column: coord.column + 1 }
    ];

    return possibleNeighbours.filter((neighbour) => {
      return (
        neighbour.row >= 0 &&
        neighbour.row < gridSize &&
        neighbour.column >= 0 &&
        neighbour.column < gridSize
      );
    });
  }

  function getDistance(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.column - b.column);
  }

  function isSameCoord(a, b) {
    return a.row === b.row && a.column === b.column;
  }

  function choosePathOperation(currentValue, settings, stepIndex) {
    const operationGroups = {
      "+": [],
      "-": [],
      "×": [],
      "÷": []
    };

    function addCandidate(operator, amount) {
      const operation = {
        operator,
        amount: new Fraction(amount, 1)
      };

      const result = applyOperation(currentValue, operation);

      if (!isIntermediateAllowed(result, settings)) {
        return;
      }

      operationGroups[operator].push(operation);
    }

    for (let value = 1; value <= 12; value++) {
      addCandidate("+", value);
      addCandidate("-", value);
    }

    if (currentValue.n !== 0 && stepIndex > 0) {
      for (let value = 2; value <= 5; value++) {
        addCandidate("×", value);
      }

      for (let value = 2; value <= 9; value++) {
        addCandidate("÷", value);
      }
    }

    const availableOperatorChoices = Object.entries(operationGroups)
      .filter(([, operations]) => operations.length > 0)
      .map(([operator, operations]) => ({
        value: {
          operator,
          operations
        },
        weight: OPERATOR_WEIGHTS[operator]
      }));

    if (availableOperatorChoices.length === 0) {
      return {
        operator: "+",
        amount: new Fraction(randomInt(1, 12), 1)
      };
    }

    const chosenGroup = weightedChoice(availableOperatorChoices);

    return choice(chosenGroup.operations);
  }

  function applyOperation(value, operation) {
    if (operation.operator === "+") {
      return value.add(operation.amount);
    }

    if (operation.operator === "-") {
      return value.subtract(operation.amount);
    }

    if (operation.operator === "×") {
      return value.multiply(operation.amount);
    }

    if (operation.operator === "÷") {
      return value.divide(operation.amount);
    }

    return value;
  }

  function isIntermediateAllowed(value, settings) {
    if (!settings.allowNegativeTargets && value.n < 0) {
      return false;
    }

    if (!settings.allowFractionTargets && value.d !== 1) {
      return false;
    }

    return Math.abs(value.n) <= 250 && value.d <= 99;
  }

  function isTargetAllowed(value, settings) {
    if (value.n === 0) {
      return false;
    }

    if (!settings.allowNegativeTargets && value.n < 0) {
      return false;
    }

    if (!settings.allowFractionTargets && value.d !== 1) {
      return false;
    }

    return Math.abs(value.n) <= 99 && value.d <= 99;
  }

  function buildGrid(settings, solutionPath, solutionOperations, target) {
    const grid = [];
    const centre = getCentreCoord(settings.gridSize);
    const solutionOperationMap = new Map();

    solutionPath.slice(0, -1).forEach((coord, index) => {
      solutionOperationMap.set(
        coordKey(coord.row, coord.column),
        solutionOperations[index]
      );
    });

    for (let row = 0; row < settings.gridSize; row++) {
      const gridRow = [];

      for (let column = 0; column < settings.gridSize; column++) {
        const key = coordKey(row, column);

        if (row === centre.row && column === centre.column) {
          gridRow.push({
            row,
            column,
            isTarget: true,
            target
          });

          continue;
        }

        const operation = solutionOperationMap.get(key) || makeDistractorOperation();

        gridRow.push({
          row,
          column,
          isTarget: false,
          operation
        });
      }

      grid.push(gridRow);
    }

    return grid;
  }

  function makeDistractorOperation() {
    const operator = weightedChoice([
      {
        value: "+",
        weight: OPERATOR_WEIGHTS["+"]
      },
      {
        value: "-",
        weight: OPERATOR_WEIGHTS["-"]
      },
      {
        value: "×",
        weight: OPERATOR_WEIGHTS["×"]
      },
      {
        value: "÷",
        weight: OPERATOR_WEIGHTS["÷"]
      }
    ]);

    if (operator === "×") {
      return {
        operator,
        amount: new Fraction(randomInt(2, 6), 1)
      };
    }

    if (operator === "÷") {
      return {
        operator,
        amount: new Fraction(randomInt(2, 9), 1)
      };
    }

    return {
      operator,
      amount: new Fraction(randomInt(1, 15), 1)
    };
  }

  function makeFallbackPuzzle(settings) {
    const centre = getCentreCoord(settings.gridSize);
    let path;

    if (settings.gridSize === 3) {
      path = [
        { row: 0, column: centre.column },
        { row: 0, column: centre.column - 1 },
        { row: centre.row, column: centre.column - 1 },
        { row: centre.row, column: centre.column }
      ];
    } else {
      path = [
        { row: centre.row - 2, column: centre.column },
        { row: centre.row - 1, column: centre.column },
        { row: centre.row - 1, column: centre.column - 1 },
        { row: centre.row, column: centre.column - 1 },
        { row: centre.row, column: centre.column }
      ].filter((coord) => {
        return (
          coord.row >= 0 &&
          coord.row < settings.gridSize &&
          coord.column >= 0 &&
          coord.column < settings.gridSize
        );
      });
    }

    const operations = [
      { operator: "+", amount: new Fraction(10, 1) },
      { operator: "-", amount: new Fraction(9, 1) },
      { operator: "×", amount: new Fraction(3, 1) },
      { operator: "+", amount: new Fraction(0, 1) }
    ].slice(0, path.length - 1);

    let target = new Fraction(0, 1);

    operations.forEach((operation) => {
      target = applyOperation(target, operation);
    });

    const grid = buildGrid(settings, path, operations, target);

    return {
      gridSize: settings.gridSize,
      grid,
      target,
      solutionPath: path,
      solutionOperations: operations,
      solutionExpression: buildExpression(operations, target)
    };
  }

  function buildExpression(operations, target) {
    let expression = "0";

    operations.forEach((operation) => {
      expression = `(${expression} ${operation.operator} ${formatFraction(operation.amount)})`;
    });

    return `${expression} = ${formatFraction(target)}`;
  }

  function formatFraction(value) {
    const fraction = toFraction(value);

    if (fraction.d === 1) {
      return String(fraction.n);
    }

    return `${fraction.n}/${fraction.d}`;
  }

  function operationToCellText(operation) {
    return `${operation.operator}${formatFraction(operation.amount)}`;
  }

  function operationToExpressionText(operation) {
    return `${operation.operator} ${formatFraction(operation.amount)}`;
  }

  return {
    Fraction,
    generatePuzzle,
    applyOperation,
    formatFraction,
    operationToCellText,
    operationToExpressionText,
    coordKey
  };
})();