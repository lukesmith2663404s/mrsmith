const PairsGenerator = (() => {
  const MAXIMUM_PAIR_COUNT = 27;

  const DIFFICULTIES = [
    {
      id: "easy",
      name: "Easy",
      description: "Familiar values and straightforward matching."
    },
    {
      id: "medium",
      name: "Medium",
      description: "A wider variety of values and representations."
    },
    {
      id: "hard",
      name: "Hard",
      description: "Less obvious equivalents and more demanding values."
    }
  ];

  const MODES = [
    {
      id: "equivalent-fractions",
      name: "Equivalent Fractions",
      description:
        "Match two fractions that have the same value.",
      generatePairs: generateEquivalentFractionPairs
    },
    {
      id: "fractions-decimals-percentages",
      name: "Fractions, Decimals and Percentages",
      description:
        "Match two different representations of the same value.",
      generatePairs: generateFdpPairs
    }
  ];

  function getModes() {
    return MODES.map((mode) => ({
      id: mode.id,
      name: mode.name,
      description: mode.description
    }));
  }

  function getMode(modeId) {
    return MODES.find((mode) => mode.id === modeId) || null;
  }

  function getDifficulties() {
    return DIFFICULTIES.map((difficulty) => ({
      ...difficulty
    }));
  }

  function getDifficulty(difficultyId) {
    return DIFFICULTIES.find((difficulty) => {
      return difficulty.id === difficultyId;
    }) || null;
  }

  function getMaximumPairCount(modeId, difficultyId) {
    if (
      modeId === "fractions-decimals-percentages" &&
      difficultyId === "easy"
    ) {
      return 12;
    }

    return MAXIMUM_PAIR_COUNT;
  }

  function generateDeck(modeId, difficultyId, pairCount) {
    const mode = getMode(modeId);
    const difficulty = getDifficulty(difficultyId);

    if (!mode) {
      throw new Error(`Unknown pairs mode: ${modeId}`);
    }

    if (!difficulty) {
      throw new Error(`Unknown difficulty: ${difficultyId}`);
    }

    const maximumPairCount = getMaximumPairCount(
      modeId,
      difficultyId
    );

    const safePairCount = clampNumber(
      pairCount,
      2,
      maximumPairCount
    );

    const generatedPairs = mode.generatePairs(
      safePairCount,
      difficultyId
    );

    const cards = generatedPairs.flatMap((pair, pairIndex) => {
      const pairId = `pair-${pairIndex}`;

      return pair.cards.map((card, cardIndex) => ({
        id: `${pairId}-card-${cardIndex}`,
        pairId,
        text: card.text,
        format: card.format
      }));
    });

    return {
      mode: {
        id: mode.id,
        name: mode.name
      },
      difficulty: {
        id: difficulty.id,
        name: difficulty.name
      },
      pairCount: safePairCount,
      cards: shuffle(cards)
    };
  }

  function generateEquivalentFractionPairs(
    pairCount,
    difficultyId
  ) {
    if (difficultyId === "easy") {
      return generateEasyEquivalentFractionPairs(pairCount);
    }

    if (difficultyId === "medium") {
      return generateMediumEquivalentFractionPairs(pairCount);
    }

    return generateHardEquivalentFractionPairs(pairCount);
  }

  function generateEasyEquivalentFractionPairs(pairCount) {
    return collectUniquePairs(
      pairCount,
      () => {
        const denominator = randomInt(2, 30);

        const possibleMultipliers = [2, 3, 4, 5, 6].filter(
          (multiplier) => {
            return denominator * multiplier <= 120;
          }
        );

        if (possibleMultipliers.length === 0) {
          return null;
        }

        const multiplier = choice(possibleMultipliers);

        const firstCard = {
          text: formatFraction(1, denominator),
          format: "fraction"
        };

        const secondCard = {
          text: formatFraction(
            multiplier,
            denominator * multiplier
          ),
          format: "fraction"
        };

        return {
          valueKey: `1/${denominator}`,
          cards: shuffle([firstCard, secondCard])
        };
      },
      "Could not generate enough easy equivalent-fraction pairs."
    );
  }

  function generateMediumEquivalentFractionPairs(pairCount) {
    return collectUniquePairs(
      pairCount,
      () => {
        const baseFraction = randomReducedProperFraction(
          2,
          20,
          1
        );

        if (!baseFraction) {
          return null;
        }

        const possibleMultipliers = [2, 3, 4, 5, 6].filter(
          (multiplier) => {
            return (
              baseFraction.denominator * multiplier <= 72 &&
              baseFraction.numerator * multiplier <= 72
            );
          }
        );

        if (possibleMultipliers.length === 0) {
          return null;
        }

        const multiplier = choice(possibleMultipliers);

        const simplestCard = {
          text: formatFraction(
            baseFraction.numerator,
            baseFraction.denominator
          ),
          format: "fraction"
        };

        const equivalentCard = {
          text: formatFraction(
            baseFraction.numerator * multiplier,
            baseFraction.denominator * multiplier
          ),
          format: "fraction"
        };

        return {
          valueKey: fractionKey(
            baseFraction.numerator,
            baseFraction.denominator
          ),
          cards: shuffle([simplestCard, equivalentCard])
        };
      },
      "Could not generate enough medium equivalent-fraction pairs."
    );
  }

  function generateHardEquivalentFractionPairs(pairCount) {
    return collectUniquePairs(
      pairCount,
      () => {
        const baseFraction = randomReducedProperFraction(
          4,
          18,
          2
        );

        if (!baseFraction) {
          return null;
        }

        const possibleMultipliers = [2, 3, 4, 5, 6].filter(
          (multiplier) => {
            return (
              baseFraction.denominator * multiplier <= 72 &&
              baseFraction.numerator * multiplier <= 72
            );
          }
        );

        if (possibleMultipliers.length < 2) {
          return null;
        }

        const selectedMultipliers = shuffle(
          possibleMultipliers
        ).slice(0, 2);

        const firstMultiplier = selectedMultipliers[0];
        const secondMultiplier = selectedMultipliers[1];

        return {
          valueKey: fractionKey(
            baseFraction.numerator,
            baseFraction.denominator
          ),
          cards: shuffle([
            {
              text: formatFraction(
                baseFraction.numerator * firstMultiplier,
                baseFraction.denominator * firstMultiplier
              ),
              format: "fraction"
            },
            {
              text: formatFraction(
                baseFraction.numerator * secondMultiplier,
                baseFraction.denominator * secondMultiplier
              ),
              format: "fraction"
            }
          ])
        };
      },
      "Could not generate enough hard equivalent-fraction pairs."
    );
  }

  function generateFdpPairs(pairCount, difficultyId) {
    if (difficultyId === "easy") {
      return generateEasyFdpPairs(pairCount);
    }

    if (difficultyId === "medium") {
      return generateMediumFdpPairs(pairCount);
    }

    return generateHardFdpPairs(pairCount);
  }

  function generateEasyFdpPairs(pairCount) {
    const candidates = [
      makeRational(1, 10),
      makeRational(1, 5),
      makeRational(1, 4),
      makeRational(3, 10),
      makeRational(2, 5),
      makeRational(1, 2),
      makeRational(3, 5),
      makeRational(7, 10),
      makeRational(3, 4),
      makeRational(4, 5),
      makeRational(9, 10),
      makeRational(1, 1)
    ];

    return shuffle(candidates)
      .slice(0, pairCount)
      .map((rational) => {
        return makeStandardFdpPair(rational);
      });
  }

  function generateMediumFdpPairs(pairCount) {
    const fivePercentCandidates = [];
    const onePercentCandidates = [];

    for (let percentage = 1; percentage < 100; percentage++) {
      const rational = makeRational(percentage, 100);

      if (percentage % 5 === 0) {
        fivePercentCandidates.push(rational);
      } else {
        onePercentCandidates.push(rational);
      }
    }

    const selectedCandidates = [];
    const onePercentCount = Math.max(
      2,
      Math.round(pairCount / 3)
    );

    selectedCandidates.push(
      ...shuffle(onePercentCandidates).slice(
        0,
        onePercentCount
      )
    );

    const selectedKeys = new Set(
      selectedCandidates.map((rational) => {
        return rational.key;
      })
    );

    const remainingCandidates = shuffle([
      ...fivePercentCandidates,
      ...onePercentCandidates
    ]).filter((rational) => {
      return !selectedKeys.has(rational.key);
    });

    selectedCandidates.push(
      ...remainingCandidates.slice(
        0,
        pairCount - selectedCandidates.length
      )
    );

    return shuffle(selectedCandidates).map((rational) => {
      return makeStandardFdpPair(rational);
    });
  }

  function generateHardFdpPairs(pairCount) {
    const improperCandidates = createImproperHardCandidates();
    const properCandidates = createProperHardCandidates();

    const selectedCandidates = [];
    const selectedKeys = new Set();

    const improperCount = Math.max(
      1,
      Math.round(pairCount * 0.4)
    );

    addUniqueCandidates(
      selectedCandidates,
      selectedKeys,
      shuffle(improperCandidates),
      improperCount
    );

    const eighthAndSixteenthCandidates =
      properCandidates.filter((rational) => {
        return (
          rational.denominator === 8 ||
          rational.denominator === 16
        );
      });

    const eighthCount = Math.min(
      2,
      pairCount - selectedCandidates.length
    );

    addUniqueCandidates(
      selectedCandidates,
      selectedKeys,
      shuffle(eighthAndSixteenthCandidates),
      eighthCount
    );

    const remainingCandidates = shuffle([
      ...properCandidates,
      ...improperCandidates
    ]);

    addUniqueCandidates(
      selectedCandidates,
      selectedKeys,
      remainingCandidates,
      pairCount - selectedCandidates.length
    );

    if (selectedCandidates.length < pairCount) {
      throw new Error(
        "Could not generate enough hard fraction, decimal and percentage pairs."
      );
    }

    return shuffle(selectedCandidates).map(
      (rational, index) => {
        return makeHardFdpPair(rational, index);
      }
    );
  }

  function createImproperHardCandidates() {
    const candidates = [];
    const denominators = [4, 5, 8, 10, 16, 20, 25];

    denominators.forEach((denominator) => {
      for (
        let numerator = denominator + 1;
        numerator < denominator * 3;
        numerator++
      ) {
        if (
          greatestCommonDivisor(
            numerator,
            denominator
          ) !== 1
        ) {
          continue;
        }

        candidates.push(
          makeRational(numerator, denominator)
        );
      }
    });

    return removeDuplicateRationals(candidates);
  }

  function createProperHardCandidates() {
    const candidates = [];
    const denominators = [
      8,
      16,
      20,
      25,
      40,
      50,
      80
    ];

    denominators.forEach((denominator) => {
      for (
        let numerator = 1;
        numerator < denominator;
        numerator++
      ) {
        if (
          greatestCommonDivisor(
            numerator,
            denominator
          ) !== 1
        ) {
          continue;
        }

        candidates.push(
          makeRational(numerator, denominator)
        );
      }
    });

    return removeDuplicateRationals(candidates);
  }

  function makeStandardFdpPair(rational) {
    const representations = [
      makeFractionRepresentation(rational),
      makeDecimalRepresentation(rational),
      makePercentageRepresentation(rational)
    ];

    return {
      valueKey: rational.key,
      cards: shuffle(representations).slice(0, 2)
    };
  }

  function makeHardFdpPair(rational, pairIndex) {
    const fractionRepresentation =
      makeFractionRepresentation(rational);

    const decimalRepresentation =
      makeDecimalRepresentation(rational);

    const percentageRepresentation =
      makePercentageRepresentation(rational);

    if (rational.numerator > rational.denominator) {
      const mixedRepresentation =
        makeMixedNumberRepresentation(rational);

      if (pairIndex % 2 === 0) {
        return {
          valueKey: rational.key,
          cards: shuffle([
            fractionRepresentation,
            mixedRepresentation
          ])
        };
      }

      const firstRepresentation = choice([
        fractionRepresentation,
        mixedRepresentation
      ]);

      const secondRepresentation = choice(
        [
          fractionRepresentation,
          mixedRepresentation,
          decimalRepresentation,
          percentageRepresentation
        ].filter((representation) => {
          return (
            representation.format !==
            firstRepresentation.format
          );
        })
      );

      return {
        valueKey: rational.key,
        cards: shuffle([
          firstRepresentation,
          secondRepresentation
        ])
      };
    }

    return {
      valueKey: rational.key,
      cards: shuffle([
        fractionRepresentation,
        decimalRepresentation,
        percentageRepresentation
      ]).slice(0, 2)
    };
  }

  function makeFractionRepresentation(rational) {
    return {
      text: formatFraction(
        rational.numerator,
        rational.denominator
      ),
      format:
        rational.numerator > rational.denominator
          ? "improper-fraction"
          : "fraction"
    };
  }

  function makeMixedNumberRepresentation(rational) {
    const wholeNumber = Math.floor(
      rational.numerator / rational.denominator
    );

    const remainder =
      rational.numerator % rational.denominator;

    return {
      text:
        `${wholeNumber} ` +
        formatFraction(
          remainder,
          rational.denominator
        ),
      format: "mixed-number"
    };
  }

  function makeDecimalRepresentation(rational) {
    return {
      text: formatNumber(
        rational.numerator / rational.denominator
      ),
      format: "decimal"
    };
  }

  function makePercentageRepresentation(rational) {
    return {
      text:
        `${formatNumber(
          (
            rational.numerator /
            rational.denominator
          ) * 100
        )}%`,
      format: "percentage"
    };
  }

  function collectUniquePairs(
    pairCount,
    createPair,
    errorMessage
  ) {
    const pairs = [];
    const usedValues = new Set();
    const usedCardTexts = new Set();

    let attempts = 0;
    const maximumAttempts = pairCount * 2000;

    while (
      pairs.length < pairCount &&
      attempts < maximumAttempts
    ) {
      attempts++;

      const pair = createPair();

      if (!pair || usedValues.has(pair.valueKey)) {
        continue;
      }

      if (
        pair.cards.some((card) => {
          return usedCardTexts.has(card.text);
        })
      ) {
        continue;
      }

      usedValues.add(pair.valueKey);

      pair.cards.forEach((card) => {
        usedCardTexts.add(card.text);
      });

      pairs.push(pair);
    }

    if (pairs.length < pairCount) {
      throw new Error(errorMessage);
    }

    return pairs;
  }

  function randomReducedProperFraction(
    minimumDenominator,
    maximumDenominator,
    minimumNumerator
  ) {
    for (let attempt = 0; attempt < 200; attempt++) {
      const denominator = randomInt(
        minimumDenominator,
        maximumDenominator
      );

      const numerator = randomInt(
        minimumNumerator,
        denominator - 1
      );

      if (
        greatestCommonDivisor(
          numerator,
          denominator
        ) !== 1
      ) {
        continue;
      }

      return {
        numerator,
        denominator
      };
    }

    return null;
  }

  function makeRational(numerator, denominator) {
    const reduced = reduceFraction(
      numerator,
      denominator
    );

    return {
      numerator: reduced.numerator,
      denominator: reduced.denominator,
      key: fractionKey(
        reduced.numerator,
        reduced.denominator
      )
    };
  }

  function reduceFraction(numerator, denominator) {
    const divisor = greatestCommonDivisor(
      Math.abs(numerator),
      Math.abs(denominator)
    );

    return {
      numerator: numerator / divisor,
      denominator: denominator / divisor
    };
  }

  function greatestCommonDivisor(a, b) {
    let x = a;
    let y = b;

    while (y !== 0) {
      const remainder = x % y;
      x = y;
      y = remainder;
    }

    return x || 1;
  }

  function fractionKey(numerator, denominator) {
    const reduced = reduceFraction(
      numerator,
      denominator
    );

    return `${reduced.numerator}/${reduced.denominator}`;
  }

  function formatFraction(numerator, denominator) {
    return `${numerator}/${denominator}`;
  }

  function formatNumber(value) {
    return value
      .toFixed(6)
      .replace(/0+$/, "")
      .replace(/\.$/, "");
  }

  function removeDuplicateRationals(rationals) {
    const seenKeys = new Set();

    return rationals.filter((rational) => {
      if (seenKeys.has(rational.key)) {
        return false;
      }

      seenKeys.add(rational.key);
      return true;
    });
  }

  function addUniqueCandidates(
    selectedCandidates,
    selectedKeys,
    candidates,
    amount
  ) {
    for (const candidate of candidates) {
      if (amount <= 0) {
        return;
      }

      if (selectedKeys.has(candidate.key)) {
        continue;
      }

      selectedKeys.add(candidate.key);
      selectedCandidates.push(candidate);
      amount--;
    }
  }

  function randomInt(minimum, maximum) {
    return Math.floor(
      Math.random() * (maximum - minimum + 1)
    ) + minimum;
  }

  function choice(array) {
    return array[randomInt(0, array.length - 1)];
  }

  function shuffle(array) {
    const shuffled = [...array];

    for (
      let index = shuffled.length - 1;
      index > 0;
      index--
    ) {
      const randomIndex = randomInt(0, index);

      [
        shuffled[index],
        shuffled[randomIndex]
      ] = [
        shuffled[randomIndex],
        shuffled[index]
      ];
    }

    return shuffled;
  }

  function clampNumber(value, minimum, maximum) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return minimum;
    }

    return Math.min(
      maximum,
      Math.max(minimum, Math.round(numericValue))
    );
  }

  return {
    getModes,
    getMode,
    getDifficulties,
    getDifficulty,
    getMaximumPairCount,
    generateDeck
  };
})();