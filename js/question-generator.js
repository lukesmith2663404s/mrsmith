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

  function algebraType(
  id,
  name,
  expression,
  condition,
  family,
  variant
) {
  return questionType(
    id,
    name,
    expression,
    condition,
    () => generateAlgebraQuestion(family, variant)
  );
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
        algebraType("one-step-equation-addition", "Addition Equations", "x + a = b", "integer solutions", "oneStep", "addition"),
        algebraType("one-step-equation-subtraction", "Subtraction Equations", "x − a = b", "integer solutions", "oneStep", "subtraction"),
        algebraType("one-step-equation-subtracted-from-number", "Unknown Subtracted from a Number", "a − x = b", "integer solutions", "oneStep", "subtractedFromNumber"),
        algebraType("one-step-equation-multiplication", "Multiplication Equations", "ax = b", "integer solutions", "oneStep", "multiplication"),
        algebraType("one-step-equation-division", "Division Equations", "x ÷ a = b", "integer solutions", "oneStep", "division"),
        algebraType("one-step-equation-variable-divisor", "Variable as the Divisor", "a ÷ x = b", "integer solutions", "oneStep", "variableDivisor"),
        algebraType("one-step-equation-square", "Squaring Equations", "x² = a", "x > 0, integer solutions", "oneStep", "square"),
        algebraType("one-step-equation-square-root", "Square Root Equations", "√x = a", "integer solutions", "oneStep", "squareRoot"),
        algebraType("one-step-equation-negative-solution", "Negative Solutions", "one-step equations", "negative integer solutions", "oneStep", "negative"),
        algebraType("one-step-equation-fractional-solution", "Fractional Solutions", "one-step equations", "simplified fractional solutions", "oneStep", "fractional"),
        algebraType("one-step-equation-decimal-solution", "Decimal Solutions", "one-step equations", "terminating decimal solutions", "oneStep", "decimal"),
        algebraType("mixed-one-step-equations", "Mixed One Step Equations", "mixed one-step equations", "mixed solution types", "oneStep", "mixed")
      ]
    },
    {
      id: "two-step-equations",
      name: "Two Step Equations",
      questionTypes: [
        algebraType("two-step-equation-multiply-add", "Multiply then Add", "ax + b = c", "integer solutions", "twoStep", "multiplyAdd"),
        algebraType("two-step-equation-multiply-subtract", "Multiply then Subtract", "ax − b = c", "integer solutions", "twoStep", "multiplySubtract"),
        algebraType("two-step-equation-constant-before-term", "Constant before Variable Term", "a + bx = c", "integer solutions", "twoStep", "constantBefore"),
        algebraType("two-step-equation-variable-term-subtracted", "Variable Term Subtracted", "a − bx = c", "integer solutions", "twoStep", "variableTermSubtracted"),
        algebraType("two-step-equation-divide-add", "Divide then Add", "x ÷ a + b = c", "integer solutions", "twoStep", "divideAdd"),
        algebraType("two-step-equation-divide-subtract", "Divide then Subtract", "x ÷ a − b = c", "integer solutions", "twoStep", "divideSubtract"),
        algebraType("two-step-equation-constant-plus-divided-term", "Constant plus Divided Variable", "a + x ÷ b = c", "integer solutions", "twoStep", "constantPlusDivided"),
        algebraType("two-step-equation-constant-minus-divided-term", "Constant minus Divided Variable", "a − x ÷ b = c", "integer solutions", "twoStep", "constantMinusDivided"),
        algebraType("two-step-equation-negative-solution", "Negative Solutions", "two-step equations", "negative integer solutions", "twoStep", "negative"),
        algebraType("two-step-equation-fractional-solution", "Fractional Solutions", "two-step equations", "simplified fractional solutions", "twoStep", "fractional"),
        algebraType("two-step-equation-decimal-solution", "Decimal Solutions", "two-step equations", "terminating decimal solutions", "twoStep", "decimal"),
        algebraType("mixed-two-step-equations", "Mixed Two Step Equations", "mixed two-step equations", "mixed solution types", "twoStep", "mixed")
      ]
    },
    {
      id: "unknown-on-both-sides",
      name: "Unknown on Both Sides",
      questionTypes: [
        algebraType("both-sides-simple-cancellation", "Simple Cancellation to One x", "ax + b = (a − 1)x + c", "integer solutions", "bothSides", "simpleCancellation"),
        algebraType("both-sides-variable-term-only-right", "Variable Term Only on Right", "ax + b = cx", "integer solutions", "bothSides", "rightVariableOnly"),
        algebraType("both-sides-constant-only-right", "Constant Only on Right", "ax = cx + d", "integer solutions", "bothSides", "rightConstantOnly"),
        algebraType("both-sides-general", "General Form", "ax + b = cx + d", "integer solutions", "bothSides", "general"),
        algebraType("both-sides-coefficient-one", "Coefficient of 1 on One Side", "x + a = bx + c", "integer solutions", "bothSides", "coefficientOne"),
        algebraType("both-sides-negative-collected-coefficient", "Negative Coefficient after Collecting", "ax + b = cx + d", "a − c < 0", "bothSides", "negativeCollected"),
        algebraType("both-sides-negative-solution", "Negative Solutions", "ax + b = cx + d", "negative integer solutions", "bothSides", "negative"),
        algebraType("both-sides-fractional-solution", "Fractional Solutions", "ax + b = cx + d", "simplified fractional solutions", "bothSides", "fractional"),
        algebraType("both-sides-no-solution", "No Solution", "ax + b = ax + c", "different constants", "bothSides", "noSolution"),
        algebraType("both-sides-infinite-solutions", "Infinitely Many Solutions", "equivalent expressions", "all real values solve it", "bothSides", "infinite"),
        algebraType("mixed-both-sides-equations", "Mixed Unknown on Both Sides", "mixed forms", "mixed solution types", "bothSides", "mixed")
      ]
    },
    {
      id: "equations-with-brackets",
      name: "Equations with Brackets",
      questionTypes: [
        algebraType("bracket-equation-single-plus", "Single Bracket with Addition", "a(x + b) = c", "integer solutions", "brackets", "singlePlus"),
        algebraType("bracket-equation-single-minus", "Single Bracket with Subtraction", "a(x − b) = c", "integer solutions", "brackets", "singleMinus"),
        algebraType("bracket-equation-followed-by-addition", "Bracket followed by Addition", "a(x + b) + c = d", "integer solutions", "brackets", "followedByAddition"),
        algebraType("bracket-equation-followed-by-subtraction", "Bracket followed by Subtraction", "a(x − b) − c = d", "integer solutions", "brackets", "followedBySubtraction"),
        algebraType("bracket-equation-x-other-side", "Bracket on One Side, x on the Other", "a(x + b) = cx + d", "integer solutions", "brackets", "xOtherSide"),
        algebraType("bracket-equation-both-sides", "Brackets on Both Sides", "a(x + b) = c(x + d)", "integer solutions", "brackets", "bothSides"),
        algebraType("bracket-equation-negative-multiplier", "Negative Multiplier Outside Bracket", "−a(x + b) = c", "integer solutions", "brackets", "negativeMultiplier"),
        algebraType("bracket-equation-collect-after-expansion", "Collect after Expansion", "a(x + b) + cx = d", "integer solutions", "brackets", "collectAfterExpansion"),
        algebraType("bracket-equation-simplify-before-solving", "Simplify before Solving", "a(x + b) + c(x + d) = e", "integer solutions", "brackets", "simplifyBeforeSolving"),
        algebraType("mixed-bracket-equations", "Mixed Bracket Equations", "mixed bracket forms", "integer solutions", "brackets", "mixed")
      ]
    },
    {
      id: "fractional-and-decimal-equations",
      name: "Fractional and Decimal Equations",
      questionTypes: [
        algebraType("fractional-equation-whole-expression-divided", "Whole Expression Divided", "(x + a) ÷ b = c", "integer solutions", "fractionDecimal", "wholeExpressionDivided"),
        algebraType("fractional-equation-linear-expression-divided", "Linear Expression Divided", "(ax + b) ÷ c = d", "integer solutions", "fractionDecimal", "linearExpressionDivided"),
        algebraType("fractional-equation-variable-term", "Fractional Variable Term", "x/a + b = c", "integer solutions", "fractionDecimal", "fractionalVariableTerm"),
        algebraType("fractional-equation-terms-both-sides", "Fractional Terms on Both Sides", "x/a + b = x/c + d", "integer solutions", "fractionDecimal", "fractionalTermsBothSides"),
        algebraType("fractional-equation-fraction-equals-fraction", "Fraction Equal to Fraction", "(x + a)/b = c/d", "integer solutions", "fractionDecimal", "fractionEqualsFraction"),
        algebraType("decimal-equation-coefficient", "Decimal Coefficient", "ax = b", "decimal coefficient", "fractionDecimal", "decimalCoefficient"),
        algebraType("decimal-equation-constant", "Decimal Constant", "ax + b = c", "decimal constant", "fractionDecimal", "decimalConstant"),
        algebraType("decimal-equation-both-sides", "Decimals on Both Sides", "ax + b = c", "decimal values", "fractionDecimal", "decimalsBothSides"),
        algebraType("fractional-equation-fractional-solution", "Fractional Solution", "linear equation", "simplified fractional solution", "fractionDecimal", "fractionalSolution"),
        algebraType("decimal-equation-decimal-solution", "Decimal Solution", "linear equation", "terminating decimal solution", "fractionDecimal", "decimalSolution"),
        algebraType("mixed-fractional-decimal-equations", "Mixed Fraction and Decimal Equations", "mixed fraction and decimal forms", "mixed solutions", "fractionDecimal", "mixed")
      ]
    },
    {
      id: "special-linear-equations",
      name: "Special Linear Equation Cases",
      questionTypes: [
        algebraType("special-equation-solution-zero", "Solution is Zero", "linear equation", "x = 0", "specialLinear", "solutionZero"),
        algebraType("special-equation-solution-one", "Solution is One", "linear equation", "x = 1", "specialLinear", "solutionOne"),
        algebraType("special-equation-check-solution", "Check a Given Solution", "Is x = a a solution?", "Yes or No", "specialLinear", "checkSolution"),
        algebraType("special-equation-missing-constant", "Find a Missing Constant", "equation with □", "solution is given", "specialLinear", "missingConstant"),
        algebraType("special-equation-missing-coefficient", "Find a Missing Coefficient", "equation with □x", "solution is given", "specialLinear", "missingCoefficient"),
        algebraType("special-equation-choose-equation", "Choose the Equation with a Given Solution", "four equations", "answer A, B, C or D", "specialLinear", "chooseEquation"),
        algebraType("special-equation-identify-solution-count", "Identify the Number of Solutions", "linear equation", "one, none or infinitely many", "specialLinear", "identifySolutionCount"),
        algebraType("special-equation-always-true", "Equation that is Always True", "equivalent expressions", "identify as always true", "specialLinear", "alwaysTrue"),
        algebraType("special-equation-never-true", "Equation that is Never True", "same variable terms, different constants", "identify as never true", "specialLinear", "neverTrue")
      ]
    },
    {
      id: "simultaneous-equations",
      name: "Simultaneous Equations",
      questionTypes: [
        algebraType("simultaneous-x-given", "One Equation in the Form x = a", "x = a and linear equation", "integer solutions", "simultaneous", "xGiven"),
        algebraType("simultaneous-y-given", "One Equation in the Form y = a", "y = a and linear equation", "integer solutions", "simultaneous", "yGiven"),
        algebraType("simultaneous-elimination-matching", "Elimination with Matching Coefficients", "matching coefficients", "integer solutions", "simultaneous", "matchingCoefficients"),
        algebraType("simultaneous-elimination-opposite", "Elimination with Opposite Coefficients", "opposite coefficients", "integer solutions", "simultaneous", "oppositeCoefficients"),
        algebraType("simultaneous-one-equation-multiplied", "One Equation Must Be Multiplied", "elimination", "integer solutions", "simultaneous", "multiplyOne"),
        algebraType("simultaneous-both-equations-multiplied", "Both Equations Must Be Multiplied", "elimination", "integer solutions", "simultaneous", "multiplyBoth"),
        algebraType("simultaneous-substitution", "Substitution", "one equation rearranged", "integer solutions", "simultaneous", "substitution"),
        algebraType("simultaneous-negative-solutions", "Negative Solutions", "simultaneous equations", "both values negative", "simultaneous", "negative"),
        algebraType("simultaneous-mixed-sign-solutions", "One Positive and One Negative Solution", "simultaneous equations", "mixed signs", "simultaneous", "mixedSigns"),
        algebraType("simultaneous-fractional-solutions", "Fractional Solutions", "simultaneous equations", "fractional values", "simultaneous", "fractional"),
        algebraType("simultaneous-no-solution", "No Solution", "parallel equations", "inconsistent system", "simultaneous", "noSolution"),
        algebraType("simultaneous-infinite-solutions", "Infinitely Many Solutions", "equivalent equations", "dependent system", "simultaneous", "infinite"),
        algebraType("mixed-simultaneous-equations", "Mixed Simultaneous Equations", "mixed methods", "mixed solution types", "simultaneous", "mixed")
      ]
    },
    {
      id: "quadratic-equations",
      name: "Quadratic Equations",
      questionTypes: [
        algebraType("quadratic-square-equals-number", "Square Equals a Number", "x² = a", "two integer roots", "quadratic", "squareEqualsNumber"),
        algebraType("quadratic-common-factor", "Common Factor", "x² + ax = 0", "integer roots", "quadratic", "commonFactor"),
        algebraType("quadratic-difference-of-squares", "Difference of Two Squares", "x² − a² = 0", "integer roots", "quadratic", "differenceOfSquares"),
        algebraType("quadratic-monic-factorisable", "Monic Factorisable Quadratic", "x² + bx + c = 0", "integer roots", "quadratic", "monicFactorisable"),
        algebraType("quadratic-non-monic-factorisable", "Non-Monic Factorisable Quadratic", "ax² + bx + c = 0", "integer roots", "quadratic", "nonMonicFactorisable"),
        algebraType("quadratic-already-factorised", "Already Factorised", "(x + a)(x + b) = 0", "integer roots", "quadratic", "alreadyFactorised"),
        algebraType("quadratic-repeated-root", "Repeated Root", "(x + a)² = 0", "one repeated root", "quadratic", "repeatedRoot"),
        algebraType("quadratic-formula-integer-roots", "Quadratic Formula with Integer Roots", "ax² + bx + c = 0", "integer roots", "quadratic", "formulaInteger"),
        algebraType("quadratic-formula-surd-roots", "Quadratic Formula with Surd Roots", "x² = a", "exact surd roots", "quadratic", "surdRoots"),
        algebraType("quadratic-formula-decimal-roots", "Quadratic Formula with Decimal Roots", "ax² + bx + c = 0", "answers to 2 d.p.", "quadratic", "decimalRoots"),
        algebraType("quadratic-no-real-solutions", "No Real Solutions", "x² + a = 0", "no real roots", "quadratic", "noReal"),
        algebraType("mixed-quadratic-equations", "Mixed Quadratic Equations", "mixed quadratic forms", "mixed root types", "quadratic", "mixed")
      ]
    },
    {
      id: "one-step-inequations",
      name: "One Step Inequations",
      questionTypes: [
        algebraType("one-step-inequation-addition", "Addition Inequations", "x + a < b", "integer boundary", "oneStepInequality", "addition"),
        algebraType("one-step-inequation-subtraction", "Subtraction Inequations", "x − a < b", "integer boundary", "oneStepInequality", "subtraction"),
        algebraType("one-step-inequation-subtracted-from-number", "Unknown Subtracted from a Number", "a − x < b", "sign reversal required", "oneStepInequality", "subtractedFromNumber"),
        algebraType("one-step-inequation-positive-multiplication", "Multiply by a Positive Number", "ax < b", "positive coefficient", "oneStepInequality", "positiveMultiplication"),
        algebraType("one-step-inequation-positive-division", "Divide by a Positive Number", "x ÷ a < b", "positive divisor", "oneStepInequality", "positiveDivision"),
        algebraType("one-step-inequation-negative-multiplication", "Multiply by a Negative Number", "−ax < b", "reverse the inequality sign", "oneStepInequality", "negativeMultiplication"),
        algebraType("one-step-inequation-negative-division", "Divide by a Negative Number", "x ÷ (−a) < b", "reverse the inequality sign", "oneStepInequality", "negativeDivision"),
        algebraType("one-step-inequation-variable-right", "Variable on the Right", "a < x + b", "integer boundary", "oneStepInequality", "variableRight"),
        algebraType("one-step-inequation-negative-boundary", "Negative Boundary", "one-step inequation", "negative boundary", "oneStepInequality", "negativeBoundary"),
        algebraType("mixed-one-step-inequations", "Mixed One Step Inequations", "mixed one-step forms", "mixed boundaries", "oneStepInequality", "mixed")
      ]
    },
    {
      id: "two-step-inequations",
      name: "Two Step Inequations",
      questionTypes: [
        algebraType("two-step-inequation-multiply-add", "Multiply then Add", "ax + b < c", "positive coefficient", "twoStepInequality", "multiplyAdd"),
        algebraType("two-step-inequation-multiply-subtract", "Multiply then Subtract", "ax − b < c", "positive coefficient", "twoStepInequality", "multiplySubtract"),
        algebraType("two-step-inequation-variable-term-subtracted", "Variable Term Subtracted", "a − bx < c", "sign reversal required", "twoStepInequality", "variableTermSubtracted"),
        algebraType("two-step-inequation-negative-coefficient", "Negative Coefficient", "−ax + b < c", "reverse the inequality sign", "twoStepInequality", "negativeCoefficient"),
        algebraType("two-step-inequation-variable-right", "Variable on the Right", "a < bx + c", "integer boundary", "twoStepInequality", "variableRight"),
        algebraType("two-step-inequation-divided-term", "Divided Variable Term", "x ÷ a + b < c", "positive divisor", "twoStepInequality", "dividedTerm"),
        algebraType("two-step-inequation-brackets", "Brackets", "a(x + b) < c", "integer boundary", "twoStepInequality", "brackets"),
        algebraType("two-step-inequation-both-sides", "Unknown on Both Sides", "ax + b < cx + d", "linear inequation", "twoStepInequality", "bothSides"),
        algebraType("two-step-inequation-negative-boundary", "Negative Boundary", "two-step inequation", "negative boundary", "twoStepInequality", "negativeBoundary"),
        algebraType("two-step-inequation-fractional-boundary", "Fractional Boundary", "two-step inequation", "simplified fraction", "twoStepInequality", "fractionalBoundary"),
        algebraType("two-step-inequation-decimal-boundary", "Decimal Boundary", "two-step inequation", "terminating decimal", "twoStepInequality", "decimalBoundary"),
        algebraType("mixed-two-step-inequations", "Mixed Two Step Inequations", "mixed two-step forms", "mixed boundaries", "twoStepInequality", "mixed")
      ]
    },
    {
      id: "special-inequation-cases",
      name: "Special Inequation Cases",
      questionTypes: [
        algebraType("special-inequation-no-values", "No Values Satisfy", "equivalent variable terms", "no solution", "specialInequality", "noValues"),
        algebraType("special-inequation-all-real-values", "All Real Values Satisfy", "equivalent variable terms", "all real numbers", "specialInequality", "allValues"),
        algebraType("special-inequation-check-value", "Check Whether a Value Satisfies", "substitute a given value", "Yes or No", "specialInequality", "checkValue"),
        algebraType("special-inequation-greatest-integer", "Greatest Integer Solution", "strict upper bound", "one integer answer", "specialInequality", "greatestInteger"),
        algebraType("special-inequation-least-integer", "Least Integer Solution", "strict lower bound", "one integer answer", "specialInequality", "leastInteger"),
        algebraType("special-inequation-count-integers", "Count Integer Solutions in a Range", "bounded range", "one integer answer", "specialInequality", "countIntegers"),
        algebraType("special-inequation-list-integers", "List Integer Solutions in a Range", "small bounded range", "comma-separated answers", "specialInequality", "listIntegers"),
        algebraType("special-inequation-choose-sign", "Choose the Correct Inequality Sign", "complete a solution", "answer <, ≤, > or ≥", "specialInequality", "chooseSign"),
        algebraType("special-inequation-missing-value", "Find a Missing Boundary Value", "given value lies on boundary", "one number", "specialInequality", "missingValue"),
        algebraType("special-inequation-identify-reversal-error", "Identify a Sign-Reversal Error", "negative multiplication or division", "short text answer", "specialInequality", "reversalError")
      ]
    },
    {
      id: "compound-inequations",
      name: "Compound Inequations",
      questionTypes: [
        algebraType("compound-inequation-open-interval", "Open Interval", "a < x < b", "two strict boundaries", "compoundInequality", "open"),
        algebraType("compound-inequation-inclusive-lower", "Inclusive Lower Boundary", "a ≤ x < b", "mixed boundaries", "compoundInequality", "inclusiveLower"),
        algebraType("compound-inequation-inclusive-upper", "Inclusive Upper Boundary", "a < x ≤ b", "mixed boundaries", "compoundInequality", "inclusiveUpper"),
        algebraType("compound-inequation-closed-interval", "Closed Interval", "a ≤ x ≤ b", "two inclusive boundaries", "compoundInequality", "closed"),
        algebraType("compound-inequation-one-step", "Solve a Compound One-Step Inequation", "a < x + b < c", "integer boundaries", "compoundInequality", "oneStep"),
        algebraType("compound-inequation-two-step", "Solve a Compound Two-Step Inequation", "a < bx + c < d", "integer boundaries", "compoundInequality", "twoStep"),
        algebraType("compound-inequation-and", "Two Inequations Joined by and", "x > a and x < b", "bounded solution", "compoundInequality", "and"),
        algebraType("compound-inequation-or", "Two Inequations Joined by or", "x < a or x > b", "two rays", "compoundInequality", "or"),
        algebraType("compound-inequation-negative-values", "Negative Boundaries", "compound inequation", "negative values", "compoundInequality", "negative"),
        algebraType("compound-inequation-integer-solutions", "Integer Solutions to a Compound Inequation", "small interval", "list integer solutions", "compoundInequality", "integerSolutions"),
        algebraType("mixed-compound-inequations", "Mixed Compound Inequations", "mixed compound forms", "mixed boundaries", "compoundInequality", "mixed")
      ]
    },
    {
      id: "equations-and-inequations-in-context",
      name: "Equations and Inequations in Context",
      questionTypes: [
        algebraType("context-unknown-number", "Unknown Number Problems", "number relationships", "solve an equation", "context", "unknownNumber"),
        algebraType("context-age", "Age Problems", "ages", "solve an equation", "context", "age"),
        algebraType("context-perimeter", "Perimeter Problems", "rectangles and shapes", "solve an equation", "context", "perimeter"),
        algebraType("context-money-cost", "Money and Cost Problems", "fixed and variable costs", "solve an equation", "context", "money"),
        algebraType("context-sharing-grouping", "Sharing and Grouping", "equal groups", "solve an equation", "context", "sharing"),
        algebraType("context-rate-distance", "Rates and Distance", "distance = speed × time", "solve an equation", "context", "rateDistance"),
        algebraType("context-maximum-budget", "Maximum Budget", "at most", "solve an inequation", "context", "maximumBudget"),
        algebraType("context-minimum-requirement", "Minimum Requirement", "at least", "solve an inequation", "context", "minimumRequirement"),
        algebraType("context-capacity-limit", "Capacity or Attendance Limit", "maximum capacity", "solve an inequation", "context", "capacity"),
        algebraType("context-at-least-at-most", "At Least and At Most", "inequality language", "solve an inequation", "context", "atLeastAtMost"),
        algebraType("context-more-fewer-than", "More Than and Fewer Than", "strict inequality language", "solve an inequation", "context", "moreFewer"),
        algebraType("mixed-context-equations", "Mixed Contextual Equations", "mixed equation contexts", "solve an equation", "context", "mixedEquation"),
        algebraType("mixed-context-inequations", "Mixed Contextual Inequations", "mixed inequation contexts", "solve an inequation", "context", "mixedInequality")
      ]
    },
    {
      id: "mixed-equations-and-inequations",
      name: "Mixed Review",
      questionTypes: [
        algebraType("mixed-review-one-step-equations", "Mixed One-Step Equations", "all one-step forms", "mixed solutions", "mixedReview", "oneStepEquations"),
        algebraType("mixed-review-one-two-step-equations", "Mixed One- and Two-Step Equations", "one- and two-step forms", "mixed solutions", "mixedReview", "oneAndTwoStep"),
        algebraType("mixed-review-linear-equations", "Mixed Linear Equations", "linear equations", "mixed structures", "mixedReview", "linearEquations"),
        algebraType("mixed-review-equations-with-brackets", "Mixed Equations Including Brackets", "linear and bracket equations", "mixed structures", "mixedReview", "includingBrackets"),
        algebraType("mixed-review-equation-difficulty", "Mixed Equation Difficulty", "easy to advanced equations", "mixed structures", "mixedReview", "equationDifficulty"),
        algebraType("mixed-review-one-step-inequations", "Mixed One-Step Inequations", "one-step inequations", "mixed boundaries", "mixedReview", "oneStepInequalities"),
        algebraType("mixed-review-linear-inequations", "Mixed Linear Inequations", "one- and two-step inequations", "mixed boundaries", "mixedReview", "linearInequalities"),
        algebraType("mixed-review-equations-inequations", "Mixed Equations and Inequations", "linear equations and inequations", "mixed answers", "mixedReview", "equationsAndInequalities"),
        algebraType("mixed-review-advanced-equations", "Mixed Advanced Equations", "brackets, simultaneous and quadratics", "advanced answers", "mixedReview", "advancedEquations"),
        algebraType("mixed-review-full-category", "Full Category Mix", "all equations and inequations", "all supported answer types", "mixedReview", "fullCategory")
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

function generateAlgebraQuestion(family, variant) {
  const generators = {
    oneStep: generateOneStepEquation,
    twoStep: generateTwoStepEquation,
    bothSides: generateBothSidesEquation,
    brackets: generateBracketEquation,
    fractionDecimal: generateFractionDecimalEquation,
    specialLinear: generateSpecialLinearEquation,
    simultaneous: generateSimultaneousEquation,
    quadratic: generateQuadraticEquation,
    oneStepInequality: generateOneStepInequality,
    twoStepInequality: generateTwoStepInequality,
    specialInequality: generateSpecialInequality,
    compoundInequality: generateCompoundInequality,
    context: generateContextAlgebraQuestion,
    mixedReview: generateMixedAlgebraReview
  };

  const generator = generators[family];

  if (!generator) {
    throw new Error(`Unknown algebra question family: ${family}`);
  }

  return generator(variant);
}

function makeXQuestion(question, answer) {
  return makeQuestion(question, answer, {
    answerPrefix: "x = "
  });
}

function makeBoxQuestion(question, answer) {
  return makeQuestion(question, answer, {
    answerPrefix: "□ = "
  });
}

function makeInequalityQuestion(question, symbol, boundary) {
  return makeQuestion(question, boundary, {
    answerPrefix: `x ${symbol} `
  });
}

function makeSimultaneousQuestion(question, x, y) {
  return makeQuestion(
    question,
    `${formatAlgebraValue(x)}, ${formatAlgebraValue(y)}`,
    {
      answerPrefix: "(x, y) = (",
      answerSuffix: ")"
    }
  );
}

function makeRootsQuestion(question, roots) {
  const sortedRoots = [...roots].sort((a, b) => {
    const numericA = Number(a);
    const numericB = Number(b);

    if (Number.isFinite(numericA) && Number.isFinite(numericB)) {
      return numericA - numericB;
    }

    return String(a).localeCompare(String(b));
  });

  return makeQuestion(
    question,
    sortedRoots.map(formatAlgebraValue).join(", "),
    {
      answerPrefix: "x = "
    }
  );
}

function formatAlgebraValue(value) {
  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return String(value);
    }

    return String(Number(value.toFixed(4)));
  }

  return String(value);
}

function greatestCommonDivisor(a, b) {
  let first = Math.abs(a);
  let second = Math.abs(b);

  while (second !== 0) {
    const remainder = first % second;
    first = second;
    second = remainder;
  }

  return first || 1;
}

function simplifyFraction(numerator, denominator) {
  if (denominator === 0) {
    throw new Error("A fraction cannot have a zero denominator.");
  }

  let top = numerator;
  let bottom = denominator;

  if (bottom < 0) {
    top *= -1;
    bottom *= -1;
  }

  const divisor = greatestCommonDivisor(top, bottom);
  top /= divisor;
  bottom /= divisor;

  return bottom === 1
    ? String(top)
    : `${top}/${bottom}`;
}

function leastCommonMultiple(a, b) {
  return Math.abs(a * b) / greatestCommonDivisor(a, b);
}

function formatSignedConstant(value) {
  if (value === 0) {
    return "";
  }

  return value > 0
    ? ` + ${value}`
    : ` − ${Math.abs(value)}`;
}

function formatCoefficientTerm(coefficient, variable = "x") {
  if (coefficient === 1) {
    return variable;
  }

  if (coefficient === -1) {
    return `−${variable}`;
  }

  return coefficient < 0
    ? `−${Math.abs(coefficient)}${variable}`
    : `${coefficient}${variable}`;
}

function formatLinearExpression(coefficient, constant = 0) {
  return `${formatCoefficientTerm(coefficient)}${formatSignedConstant(constant)}`;
}

function formatTwoVariableExpression(xCoefficient, yCoefficient) {
  const xTerm = formatCoefficientTerm(xCoefficient, "x");

  if (yCoefficient === 0) {
    return xTerm;
  }

  const yMagnitude = Math.abs(yCoefficient);
  const yTerm = yMagnitude === 1 ? "y" : `${yMagnitude}y`;

  return yCoefficient > 0
    ? `${xTerm} + ${yTerm}`
    : `${xTerm} − ${yTerm}`;
}

function formatQuadraticExpression(a, b, c) {
  let expression = "";

  if (a === 1) {
    expression = "x²";
  } else if (a === -1) {
    expression = "−x²";
  } else {
    expression = `${a}x²`;
  }

  if (b !== 0) {
    const magnitude = Math.abs(b);
    const term = magnitude === 1 ? "x" : `${magnitude}x`;
    expression += b > 0 ? ` + ${term}` : ` − ${term}`;
  }

  if (c !== 0) {
    expression += c > 0 ? ` + ${c}` : ` − ${Math.abs(c)}`;
  }

  return expression;
}

function randomInequalitySymbol() {
  return choice(["<", "≤", ">", "≥"]);
}

function reverseInequalitySymbol(symbol) {
  return {
    "<": ">",
    "≤": "≥",
    ">": "<",
    "≥": "≤"
  }[symbol];
}

function evaluateInequality(left, symbol, right) {
  if (symbol === "<") {
    return left < right;
  }

  if (symbol === "≤") {
    return left <= right;
  }

  if (symbol === ">") {
    return left > right;
  }

  return left >= right;
}

function generateOneStepEquation(variant) {
  if (variant === "mixed") {
    return generateOneStepEquation(choice([
      "addition",
      "subtraction",
      "subtractedFromNumber",
      "multiplication",
      "division",
      "variableDivisor",
      "square",
      "squareRoot",
      "negative",
      "fractional",
      "decimal"
    ]));
  }

  if (variant === "addition") {
    const solution = randomInt(1, 50);
    const amount = randomInt(1, 30);
    return makeXQuestion(`x + ${amount} = ${solution + amount}`, solution);
  }

  if (variant === "subtraction") {
    const solution = randomInt(1, 60);
    const amount = randomInt(1, 30);
    return makeXQuestion(`x − ${amount} = ${solution - amount}`, solution);
  }

  if (variant === "subtractedFromNumber") {
    const solution = randomInt(1, 40);
    const result = randomInt(1, 40);
    return makeXQuestion(`${solution + result} − x = ${result}`, solution);
  }

  if (variant === "multiplication") {
    const coefficient = randomInt(2, 12);
    const solution = randomInt(1, 15);
    return makeXQuestion(`${coefficient}x = ${coefficient * solution}`, solution);
  }

  if (variant === "division") {
    const divisor = randomInt(2, 12);
    const result = randomInt(1, 15);
    return makeXQuestion(`x ÷ ${divisor} = ${result}`, divisor * result);
  }

  if (variant === "variableDivisor") {
    const solution = randomInt(2, 12);
    const result = randomInt(1, 12);
    return makeXQuestion(`${solution * result} ÷ x = ${result}`, solution);
  }

  if (variant === "square") {
    const solution = randomInt(1, 15);
    return makeXQuestion(`x² = ${solution * solution}, x > 0`, solution);
  }

  if (variant === "squareRoot") {
    const result = randomInt(1, 15);
    return makeXQuestion(`√x = ${result}`, result * result);
  }

  if (variant === "negative") {
    const solution = -randomInt(1, 20);
    const form = choice(["addition", "subtraction", "multiplication"]);

    if (form === "addition") {
      const amount = randomInt(1, 20);
      return makeXQuestion(`x + ${amount} = ${solution + amount}`, solution);
    }

    if (form === "subtraction") {
      const amount = randomInt(1, 20);
      return makeXQuestion(`x − ${amount} = ${solution - amount}`, solution);
    }

    const coefficient = randomInt(2, 12);
    return makeXQuestion(`${coefficient}x = ${coefficient * solution}`, solution);
  }

  if (variant === "fractional") {
    const denominator = randomInt(2, 12);
    let numerator = randomInt(1, 30);

    while (numerator % denominator === 0) {
      numerator = randomInt(1, 30);
    }

    return makeXQuestion(
      `${denominator}x = ${numerator}`,
      simplifyFraction(numerator, denominator)
    );
  }

  if (variant === "decimal") {
    const solution = randomInt(1, 90) / 10;
    const amount = randomInt(1, 50) / 10;
    const result = Number((solution + amount).toFixed(1));
    return makeXQuestion(`x + ${amount} = ${result}`, solution);
  }

  throw new Error(`Unknown one-step equation variant: ${variant}`);
}

function generateTwoStepEquation(variant) {
  if (variant === "mixed") {
    return generateTwoStepEquation(choice([
      "multiplyAdd",
      "multiplySubtract",
      "constantBefore",
      "variableTermSubtracted",
      "divideAdd",
      "divideSubtract",
      "constantPlusDivided",
      "constantMinusDivided",
      "negative",
      "fractional",
      "decimal"
    ]));
  }

  if (variant === "fractional") {
    const denominator = randomInt(2, 9);
    let numerator = randomInt(1, 25);

    while (numerator % denominator === 0) {
      numerator = randomInt(1, 25);
    }

    const constant = randomInt(1, 15);
    return makeXQuestion(
      `${denominator}x + ${constant} = ${numerator + constant}`,
      simplifyFraction(numerator, denominator)
    );
  }

  if (variant === "decimal") {
    const solution = randomInt(1, 90) / 10;
    const coefficient = randomInt(2, 6);
    const constant = randomInt(1, 40) / 10;
    const result = Number((coefficient * solution + constant).toFixed(1));
    return makeXQuestion(`${coefficient}x + ${constant} = ${result}`, solution);
  }

  const solution = variant === "negative"
    ? -randomInt(1, 15)
    : randomInt(1, 15);

  const coefficient = randomInt(2, 9);
  const constant = randomInt(1, 20);

  if (variant === "multiplyAdd" || variant === "negative") {
    return makeXQuestion(
      `${coefficient}x + ${constant} = ${coefficient * solution + constant}`,
      solution
    );
  }

  if (variant === "multiplySubtract") {
    return makeXQuestion(
      `${coefficient}x − ${constant} = ${coefficient * solution - constant}`,
      solution
    );
  }

  if (variant === "constantBefore") {
    return makeXQuestion(
      `${constant} + ${coefficient}x = ${constant + coefficient * solution}`,
      solution
    );
  }

  if (variant === "variableTermSubtracted") {
    const result = constant - coefficient * solution;
    return makeXQuestion(`${constant} − ${coefficient}x = ${result}`, solution);
  }

  const divisor = randomInt(2, 9);
  const quotient = randomInt(1, 15);
  const dividedSolution = divisor * quotient;

  if (variant === "divideAdd") {
    return makeXQuestion(`x ÷ ${divisor} + ${constant} = ${quotient + constant}`, dividedSolution);
  }

  if (variant === "divideSubtract") {
    return makeXQuestion(`x ÷ ${divisor} − ${constant} = ${quotient - constant}`, dividedSolution);
  }

  if (variant === "constantPlusDivided") {
    return makeXQuestion(`${constant} + x ÷ ${divisor} = ${constant + quotient}`, dividedSolution);
  }

  if (variant === "constantMinusDivided") {
    return makeXQuestion(`${constant} − x ÷ ${divisor} = ${constant - quotient}`, dividedSolution);
  }

  throw new Error(`Unknown two-step equation variant: ${variant}`);
}

function generateBothSidesEquation(variant) {
  if (variant === "mixed") {
    return generateBothSidesEquation(choice([
      "simpleCancellation",
      "rightVariableOnly",
      "rightConstantOnly",
      "general",
      "coefficientOne",
      "negativeCollected",
      "negative",
      "fractional",
      "noSolution",
      "infinite"
    ]));
  }

  if (variant === "noSolution") {
    const coefficient = randomInt(1, 9);
    const leftConstant = randomInt(1, 20);
    let rightConstant = randomInt(1, 20);

    while (rightConstant === leftConstant) {
      rightConstant = randomInt(1, 20);
    }

    return makeQuestion(
      `${formatLinearExpression(coefficient, leftConstant)} = ${formatLinearExpression(coefficient, rightConstant)}`,
      "no solution"
    );
  }

  if (variant === "infinite") {
    const coefficient = randomInt(1, 8);
    const constant = randomInt(1, 15);
    const multiplier = randomInt(2, 4);

    return makeQuestion(
      `${formatLinearExpression(coefficient, constant)} = ${multiplier}(${formatLinearExpression(coefficient, constant)}) ÷ ${multiplier}`,
      "infinitely many solutions"
    );
  }

  if (variant === "fractional") {
    const difference = randomInt(2, 8);
    let numerator = randomInt(1, 20);

    while (numerator % difference === 0) {
      numerator = randomInt(1, 20);
    }

    const rightCoefficient = randomInt(1, 6);
    const leftCoefficient = rightCoefficient + difference;
    const leftConstant = randomInt(1, 15);
    const rightConstant = leftConstant + numerator;

    return makeXQuestion(
      `${formatLinearExpression(leftCoefficient, leftConstant)} = ${formatLinearExpression(rightCoefficient, rightConstant)}`,
      simplifyFraction(numerator, difference)
    );
  }

  const solution = variant === "negative"
    ? -randomInt(1, 15)
    : randomInt(1, 15);

  let leftCoefficient = randomInt(1, 9);
  let rightCoefficient = randomInt(1, 9);

  if (variant === "simpleCancellation") {
    leftCoefficient = randomInt(2, 9);
    rightCoefficient = leftCoefficient - 1;
  } else if (variant === "coefficientOne") {
    leftCoefficient = 1;
    rightCoefficient = randomInt(2, 8);
  } else if (variant === "negativeCollected") {
    leftCoefficient = randomInt(1, 5);
    rightCoefficient = randomInt(leftCoefficient + 1, 9);
  } else {
    while (leftCoefficient === rightCoefficient) {
      rightCoefficient = randomInt(1, 9);
    }
  }

  if (variant === "rightVariableOnly") {
    const difference = rightCoefficient - leftCoefficient || 1;
    if (difference === 0) {
      rightCoefficient++;
    }
    const constant = (rightCoefficient - leftCoefficient) * solution;
    return makeXQuestion(`${formatLinearExpression(leftCoefficient, constant)} = ${formatLinearExpression(rightCoefficient, 0)}`, solution);
  }

  if (variant === "rightConstantOnly") {
    const constant = (leftCoefficient - rightCoefficient) * solution;
    return makeXQuestion(`${formatLinearExpression(leftCoefficient, 0)} = ${formatLinearExpression(rightCoefficient, constant)}`, solution);
  }

  const leftConstant = randomInt(-15, 15);
  const rightConstant = leftConstant + (leftCoefficient - rightCoefficient) * solution;

  return makeXQuestion(
    `${formatLinearExpression(leftCoefficient, leftConstant)} = ${formatLinearExpression(rightCoefficient, rightConstant)}`,
    solution
  );
}

function generateBracketEquation(variant) {
  if (variant === "mixed") {
    return generateBracketEquation(choice([
      "singlePlus",
      "singleMinus",
      "followedByAddition",
      "followedBySubtraction",
      "xOtherSide",
      "bothSides",
      "negativeMultiplier",
      "collectAfterExpansion",
      "simplifyBeforeSolving"
    ]));
  }

  const solution = randomInt(-8, 15);
  const a = randomInt(2, 7);
  const b = randomInt(1, 10);
  const c = randomInt(1, 12);

  if (variant === "singlePlus") {
    return makeXQuestion(`${a}(x + ${b}) = ${a * (solution + b)}`, solution);
  }

  if (variant === "singleMinus") {
    return makeXQuestion(`${a}(x − ${b}) = ${a * (solution - b)}`, solution);
  }

  if (variant === "followedByAddition") {
    return makeXQuestion(`${a}(x + ${b}) + ${c} = ${a * (solution + b) + c}`, solution);
  }

  if (variant === "followedBySubtraction") {
    return makeXQuestion(`${a}(x − ${b}) − ${c} = ${a * (solution - b) - c}`, solution);
  }

  if (variant === "negativeMultiplier") {
    return makeXQuestion(`−${a}(x + ${b}) = ${-a * (solution + b)}`, solution);
  }

  if (variant === "collectAfterExpansion") {
    const extraCoefficient = randomInt(1, 6);
    const result = a * (solution + b) + extraCoefficient * solution;
    return makeXQuestion(`${a}(x + ${b}) + ${extraCoefficient}x = ${result}`, solution);
  }

  if (variant === "simplifyBeforeSolving") {
    const secondCoefficient = randomInt(2, 6);
    const d = randomInt(1, 8);
    const result = a * (solution + b) + secondCoefficient * (solution + d);
    return makeXQuestion(`${a}(x + ${b}) + ${secondCoefficient}(x + ${d}) = ${result}`, solution);
  }

  if (variant === "xOtherSide") {
    let rightCoefficient = randomInt(1, 8);
    while (rightCoefficient === a) {
      rightCoefficient = randomInt(1, 8);
    }
    const rightConstant = a * (solution + b) - rightCoefficient * solution;
    return makeXQuestion(`${a}(x + ${b}) = ${formatLinearExpression(rightCoefficient, rightConstant)}`, solution);
  }

  if (variant === "bothSides") {
    for (let attempt = 0; attempt < 100; attempt++) {
      let rightCoefficient = randomInt(2, 7);
      while (rightCoefficient === a) {
        rightCoefficient = randomInt(2, 7);
      }
      const numerator = a * (solution + b) - rightCoefficient * solution;
      if (numerator % rightCoefficient !== 0) {
        continue;
      }
      const d = numerator / rightCoefficient;
      const rightBracket = d >= 0 ? `(x + ${d})` : `(x − ${Math.abs(d)})`;
      return makeXQuestion(`${a}(x + ${b}) = ${rightCoefficient}${rightBracket}`, solution);
    }

    return makeXQuestion(`2(x + 3) = 3(x + 1)`, 3);
  }

  throw new Error(`Unknown bracket equation variant: ${variant}`);
}

function generateFractionDecimalEquation(variant) {
  if (variant === "mixed") {
    return generateFractionDecimalEquation(choice([
      "wholeExpressionDivided",
      "linearExpressionDivided",
      "fractionalVariableTerm",
      "fractionalTermsBothSides",
      "fractionEqualsFraction",
      "decimalCoefficient",
      "decimalConstant",
      "decimalsBothSides",
      "fractionalSolution",
      "decimalSolution"
    ]));
  }

  if (variant === "wholeExpressionDivided") {
    const divisor = randomInt(2, 9);
    const result = randomInt(2, 15);
    const constant = randomInt(1, 15);
    return makeXQuestion(`(x + ${constant}) ÷ ${divisor} = ${result}`, divisor * result - constant);
  }

  if (variant === "linearExpressionDivided") {
    const coefficient = randomInt(2, 6);
    const divisor = randomInt(2, 8);
    const solution = randomInt(1, 12);
    const constant = randomInt(1, 12);
    const numeratorValue = coefficient * solution + constant;
    const result = numeratorValue / divisor;

    if (!Number.isInteger(result)) {
      return generateFractionDecimalEquation(variant);
    }

    return makeXQuestion(`(${coefficient}x + ${constant}) ÷ ${divisor} = ${result}`, solution);
  }

  if (variant === "fractionalVariableTerm") {
    const divisor = randomInt(2, 9);
    const quotient = randomInt(1, 12);
    const constant = randomInt(1, 12);
    return makeXQuestion(`x/${divisor} + ${constant} = ${quotient + constant}`, divisor * quotient);
  }

  if (variant === "fractionalTermsBothSides") {
    let firstDivisor = randomInt(2, 8);
    let secondDivisor = randomInt(2, 8);

    while (secondDivisor === firstDivisor) {
      secondDivisor = randomInt(2, 8);
    }

    const solution = leastCommonMultiple(firstDivisor, secondDivisor) * randomInt(1, 4);
    const leftConstant = randomInt(15, 25);
    const rightConstant = solution / firstDivisor + leftConstant - solution / secondDivisor;

    return makeXQuestion(`x/${firstDivisor} + ${leftConstant} = x/${secondDivisor} + ${rightConstant}`, solution);
  }

  if (variant === "fractionEqualsFraction") {
    const rightDenominator = randomInt(3, 8);
    const rightNumerator = randomInt(1, rightDenominator - 1);
    const multiplier = randomInt(2, 6);
    const leftDenominator = rightDenominator * multiplier;
    const constant = randomInt(1, 12);
    const solution = multiplier * rightNumerator - constant;

    return makeXQuestion(`(x + ${constant})/${leftDenominator} = ${rightNumerator}/${rightDenominator}`, solution);
  }

  if (variant === "decimalCoefficient") {
    const coefficient = randomInt(2, 9) / 10;
    const solution = randomInt(2, 20);
    const result = Number((coefficient * solution).toFixed(2));
    return makeXQuestion(`${coefficient}x = ${result}`, solution);
  }

  if (variant === "decimalConstant") {
    const coefficient = randomInt(2, 7);
    const solution = randomInt(1, 12);
    const constant = randomInt(1, 30) / 10;
    const result = Number((coefficient * solution + constant).toFixed(1));
    return makeXQuestion(`${coefficient}x + ${constant} = ${result}`, solution);
  }

  if (variant === "decimalsBothSides") {
    const coefficient = randomInt(2, 9) / 10;
    const solution = randomInt(1, 20);
    const constant = randomInt(1, 30) / 10;
    const result = Number((coefficient * solution + constant).toFixed(2));
    return makeXQuestion(`${coefficient}x + ${constant} = ${result}`, solution);
  }

  if (variant === "fractionalSolution") {
    const coefficient = randomInt(2, 9);
    const constant = randomInt(1, 12);
    let difference = randomInt(1, 25);

    while (difference % coefficient === 0) {
      difference = randomInt(1, 25);
    }

    return makeXQuestion(`${coefficient}x + ${constant} = ${constant + difference}`, simplifyFraction(difference, coefficient));
  }

  if (variant === "decimalSolution") {
    const solution = randomInt(1, 90) / 10;
    const coefficient = randomInt(2, 5);
    const constant = randomInt(1, 20) / 10;
    const result = Number((coefficient * solution + constant).toFixed(1));
    return makeXQuestion(`${coefficient}x + ${constant} = ${result}`, solution);
  }

  throw new Error(`Unknown fraction/decimal equation variant: ${variant}`);
}

function generateSpecialLinearEquation(variant) {
  if (variant === "solutionZero") {
    const coefficient = randomInt(2, 9);
    const constant = randomInt(1, 20);
    return makeXQuestion(`${coefficient}x + ${constant} = ${constant}`, 0);
  }

  if (variant === "solutionOne") {
    const coefficient = randomInt(2, 9);
    const constant = randomInt(1, 20);
    return makeXQuestion(`${coefficient}x + ${constant} = ${coefficient + constant}`, 1);
  }

  if (variant === "checkSolution") {
    const proposed = randomInt(-10, 15);
    const coefficient = randomInt(2, 8);
    const constant = randomInt(1, 15);
    const isCorrect = Math.random() < 0.5;
    const rightSide = coefficient * proposed + constant + (isCorrect ? 0 : choice([-3, -2, -1, 1, 2, 3]));

    return makeQuestion(
      `Is x = ${proposed} a solution of ${coefficient}x + ${constant} = ${rightSide}?`,
      isCorrect ? "Yes" : "No"
    );
  }

  if (variant === "missingConstant") {
    const solution = randomInt(1, 15);
    const missing = randomInt(1, 20);
    const result = solution + missing;
    return makeBoxQuestion(`x + □ = ${result}, when x = ${solution}`, missing);
  }

  if (variant === "missingCoefficient") {
    const solution = randomInt(2, 12);
    const missing = randomInt(2, 9);
    return makeBoxQuestion(`□x = ${missing * solution}, when x = ${solution}`, missing);
  }

  if (variant === "chooseEquation") {
    const solution = randomInt(1, 12);
    const correctIndex = randomInt(0, 3);
    const labels = ["A", "B", "C", "D"];
    const options = labels.map((label, index) => {
      const coefficient = index + 2;
      const offset = index === correctIndex ? 0 : index - correctIndex || 1;
      const result = coefficient * solution + offset;
      return `${label}) ${coefficient}x = ${result}`;
    });

    return makeQuestion(
      `Which equation has x = ${solution} as its solution? ${options.join("   ")}`,
      labels[correctIndex]
    );
  }

  if (variant === "identifySolutionCount") {
    const type = choice(["one", "none", "infinite"]);

    if (type === "none") {
      const coefficient = randomInt(2, 8);
      return makeQuestion(`${coefficient}x + 3 = ${coefficient}x + 7`, "no solution");
    }

    if (type === "infinite") {
      const coefficient = randomInt(2, 8);
      const constant = randomInt(1, 10);
      return makeQuestion(`${coefficient}(x + ${constant}) = ${coefficient}x + ${coefficient * constant}`, "infinitely many solutions");
    }

    const coefficient = randomInt(2, 8);
    const solution = randomInt(1, 12);
    return makeQuestion(`${coefficient}x = ${coefficient * solution}`, "one solution");
  }

  if (variant === "alwaysTrue") {
    const coefficient = randomInt(2, 8);
    const constant = randomInt(1, 10);
    return makeQuestion(`${coefficient}(x + ${constant}) = ${coefficient}x + ${coefficient * constant}`, "always true");
  }

  if (variant === "neverTrue") {
    const coefficient = randomInt(2, 8);
    const firstConstant = randomInt(1, 10);
    let secondConstant = randomInt(1, 10);
    while (secondConstant === firstConstant) {
      secondConstant = randomInt(1, 10);
    }
    return makeQuestion(`${coefficient}x + ${firstConstant} = ${coefficient}x + ${secondConstant}`, "never true");
  }

  throw new Error(`Unknown special linear equation variant: ${variant}`);
}

function makeSystemEquation(a, b, x, y) {
  return `${formatTwoVariableExpression(a, b)} = ${a * x + b * y}`;
}

function generateSimultaneousEquation(variant) {
  if (variant === "mixed") {
    return generateSimultaneousEquation(choice([
      "xGiven",
      "yGiven",
      "matchingCoefficients",
      "oppositeCoefficients",
      "multiplyOne",
      "multiplyBoth",
      "substitution",
      "negative",
      "mixedSigns",
      "fractional",
      "noSolution",
      "infinite"
    ]));
  }

  if (variant === "noSolution") {
    const a = randomInt(1, 5);
    const b = randomInt(1, 5);
    const c = randomInt(2, 12);
    const multiplier = randomInt(2, 4);
    return makeQuestion(
      `Solve simultaneously: ${formatTwoVariableExpression(a, b)} = ${c}; ${formatTwoVariableExpression(a * multiplier, b * multiplier)} = ${c * multiplier + 1}`,
      "no solution"
    );
  }

  if (variant === "infinite") {
    const a = randomInt(1, 5);
    const b = randomInt(1, 5);
    const c = randomInt(2, 12);
    const multiplier = randomInt(2, 4);
    return makeQuestion(
      `Solve simultaneously: ${formatTwoVariableExpression(a, b)} = ${c}; ${formatTwoVariableExpression(a * multiplier, b * multiplier)} = ${c * multiplier}`,
      "infinitely many solutions"
    );
  }

  if (variant === "fractional") {
    const x = simplifyFraction(1, 2);
    const y = simplifyFraction(3, 2);
    return makeSimultaneousQuestion(
      "Solve simultaneously: 2x + 2y = 4; 2x − 2y = −2",
      x,
      y
    );
  }

  let x = randomInt(1, 10);
  let y = randomInt(1, 10);

  if (variant === "negative") {
    x = -randomInt(1, 8);
    y = -randomInt(1, 8);
  }

  if (variant === "mixedSigns") {
    x = -randomInt(1, 8);
    y = randomInt(1, 8);
  }

  if (variant === "xGiven") {
    return makeSimultaneousQuestion(`Solve simultaneously: x = ${x}; x + y = ${x + y}`, x, y);
  }

  if (variant === "yGiven") {
    return makeSimultaneousQuestion(`Solve simultaneously: y = ${y}; x + y = ${x + y}`, x, y);
  }

  if (variant === "substitution") {
    const offset = y - x;
    const offsetText = offset >= 0 ? `x + ${offset}` : `x − ${Math.abs(offset)}`;
    return makeSimultaneousQuestion(`Solve simultaneously: y = ${offsetText}; 2x + y = ${2 * x + y}`, x, y);
  }

  if (variant === "matchingCoefficients") {
    const coefficient = randomInt(2, 5);
    return makeSimultaneousQuestion(
      `Solve simultaneously: ${coefficient}x + y = ${coefficient * x + y}; ${coefficient}x − y = ${coefficient * x - y}`,
      x,
      y
    );
  }

  if (variant === "oppositeCoefficients") {
    const coefficient = randomInt(2, 5);
    return makeSimultaneousQuestion(
      `Solve simultaneously: x + ${coefficient}y = ${x + coefficient * y}; 2x − ${coefficient}y = ${2 * x - coefficient * y}`,
      x,
      y
    );
  }

  if (variant === "multiplyOne") {
    return makeSimultaneousQuestion(
      `Solve simultaneously: x + y = ${x + y}; 2x + 3y = ${2 * x + 3 * y}`,
      x,
      y
    );
  }

  if (variant === "multiplyBoth") {
    return makeSimultaneousQuestion(
      `Solve simultaneously: 2x + 3y = ${2 * x + 3 * y}; 3x − 2y = ${3 * x - 2 * y}`,
      x,
      y
    );
  }

  if (variant === "negative" || variant === "mixedSigns") {
    return makeSimultaneousQuestion(
      `Solve simultaneously: x + y = ${x + y}; 2x − y = ${2 * x - y}`,
      x,
      y
    );
  }

  throw new Error(`Unknown simultaneous equation variant: ${variant}`);
}

function generateQuadraticEquation(variant) {
  if (variant === "mixed") {
    return generateQuadraticEquation(choice([
      "squareEqualsNumber",
      "commonFactor",
      "differenceOfSquares",
      "monicFactorisable",
      "nonMonicFactorisable",
      "alreadyFactorised",
      "repeatedRoot",
      "formulaInteger",
      "surdRoots",
      "decimalRoots",
      "noReal"
    ]));
  }

  if (variant === "squareEqualsNumber") {
    const root = randomInt(2, 15);
    return makeRootsQuestion(`x² = ${root * root}`, [-root, root]);
  }

  if (variant === "commonFactor") {
    const otherRoot = choice([-1, 1]) * randomInt(2, 12);
    return makeRootsQuestion(`x² ${otherRoot < 0 ? "−" : "+"} ${Math.abs(otherRoot)}x = 0`, [0, -otherRoot]);
  }

  if (variant === "differenceOfSquares") {
    const root = randomInt(2, 15);
    return makeRootsQuestion(`x² − ${root * root} = 0`, [-root, root]);
  }

  if (variant === "repeatedRoot") {
    const root = choice([-1, 1]) * randomInt(1, 10);
    const bracket = root < 0 ? `(x + ${Math.abs(root)})² = 0` : `(x − ${root})² = 0`;
    return makeXQuestion(bracket, root);
  }

  if (variant === "surdRoots") {
    const nonSquares = [2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15];
    const value = choice(nonSquares);
    return makeRootsQuestion(`x² − ${value} = 0`, [`−√${value}`, `√${value}`]);
  }

  if (variant === "decimalRoots") {
    const nonSquares = [2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15];
    const value = choice(nonSquares);
    const root = Number(Math.sqrt(value).toFixed(2));
    return makeRootsQuestion(`x² − ${value} = 0. Give answers to 2 d.p.`, [-root, root]);
  }

  if (variant === "noReal") {
    const constant = randomInt(1, 20);
    return makeQuestion(`x² + ${constant} = 0`, "no real solutions");
  }

  let rootOne = choice([-1, 1]) * randomInt(1, 10);
  let rootTwo = choice([-1, 1]) * randomInt(1, 10);

  while (rootTwo === rootOne) {
    rootTwo = choice([-1, 1]) * randomInt(1, 10);
  }

  if (variant === "alreadyFactorised") {
    const first = rootOne < 0 ? `(x + ${Math.abs(rootOne)})` : `(x − ${rootOne})`;
    const second = rootTwo < 0 ? `(x + ${Math.abs(rootTwo)})` : `(x − ${rootTwo})`;
    return makeRootsQuestion(`${first}${second} = 0`, [rootOne, rootTwo]);
  }

  const leadingCoefficient = variant === "nonMonicFactorisable" || variant === "formulaInteger"
    ? randomInt(2, 5)
    : 1;

  const b = -leadingCoefficient * (rootOne + rootTwo);
  const c = leadingCoefficient * rootOne * rootTwo;

  return makeRootsQuestion(
    `${formatQuadraticExpression(leadingCoefficient, b, c)} = 0`,
    [rootOne, rootTwo]
  );
}

function generateOneStepInequality(variant) {
  if (variant === "mixed") {
    return generateOneStepInequality(choice([
      "addition",
      "subtraction",
      "subtractedFromNumber",
      "positiveMultiplication",
      "positiveDivision",
      "negativeMultiplication",
      "negativeDivision",
      "variableRight",
      "negativeBoundary"
    ]));
  }

  const symbol = randomInequalitySymbol();
  const boundary = variant === "negativeBoundary"
    ? -randomInt(1, 20)
    : randomInt(1, 20);
  const constant = randomInt(1, 15);
  const coefficient = randomInt(2, 8);

  if (variant === "addition" || variant === "negativeBoundary") {
    return makeInequalityQuestion(`x + ${constant} ${symbol} ${boundary + constant}`, symbol, boundary);
  }

  if (variant === "subtraction") {
    return makeInequalityQuestion(`x − ${constant} ${symbol} ${boundary - constant}`, symbol, boundary);
  }

  if (variant === "subtractedFromNumber") {
    const shownSymbol = reverseInequalitySymbol(symbol);
    const leftConstant = randomInt(10, 30);
    const rightValue = leftConstant - boundary;
    return makeInequalityQuestion(`${leftConstant} − x ${shownSymbol} ${rightValue}`, symbol, boundary);
  }

  if (variant === "positiveMultiplication") {
    return makeInequalityQuestion(`${coefficient}x ${symbol} ${coefficient * boundary}`, symbol, boundary);
  }

  if (variant === "positiveDivision") {
    return makeInequalityQuestion(`x ÷ ${coefficient} ${symbol} ${boundary}`, symbol, coefficient * boundary);
  }

  if (variant === "negativeMultiplication") {
    const shownSymbol = reverseInequalitySymbol(symbol);
    return makeInequalityQuestion(`−${coefficient}x ${shownSymbol} ${-coefficient * boundary}`, symbol, boundary);
  }

  if (variant === "negativeDivision") {
    const shownSymbol = reverseInequalitySymbol(symbol);
    return makeInequalityQuestion(`x ÷ (−${coefficient}) ${shownSymbol} ${-boundary / coefficient}`, symbol, boundary);
  }

  if (variant === "variableRight") {
    const shownSymbol = reverseInequalitySymbol(symbol);
    return makeInequalityQuestion(`${boundary + constant} ${shownSymbol} x + ${constant}`, symbol, boundary);
  }

  throw new Error(`Unknown one-step inequation variant: ${variant}`);
}

function generateTwoStepInequality(variant) {
  if (variant === "mixed") {
    return generateTwoStepInequality(choice([
      "multiplyAdd",
      "multiplySubtract",
      "variableTermSubtracted",
      "negativeCoefficient",
      "variableRight",
      "dividedTerm",
      "brackets",
      "bothSides",
      "negativeBoundary",
      "fractionalBoundary",
      "decimalBoundary"
    ]));
  }

  const symbol = randomInequalitySymbol();
  const coefficient = randomInt(2, 8);
  const constant = randomInt(1, 15);

  if (variant === "fractionalBoundary") {
    let numerator = randomInt(1, 20);
    while (numerator % coefficient === 0) {
      numerator = randomInt(1, 20);
    }
    return makeInequalityQuestion(`${coefficient}x + ${constant} ${symbol} ${numerator + constant}`, symbol, simplifyFraction(numerator, coefficient));
  }

  if (variant === "decimalBoundary") {
    const boundary = randomInt(1, 90) / 10;
    const result = Number((coefficient * boundary + constant).toFixed(1));
    return makeInequalityQuestion(`${coefficient}x + ${constant} ${symbol} ${result}`, symbol, boundary);
  }

  const boundary = variant === "negativeBoundary"
    ? -randomInt(1, 15)
    : randomInt(1, 15);

  if (variant === "multiplyAdd" || variant === "negativeBoundary") {
    return makeInequalityQuestion(`${coefficient}x + ${constant} ${symbol} ${coefficient * boundary + constant}`, symbol, boundary);
  }

  if (variant === "multiplySubtract") {
    return makeInequalityQuestion(`${coefficient}x − ${constant} ${symbol} ${coefficient * boundary - constant}`, symbol, boundary);
  }

  if (variant === "variableTermSubtracted") {
    const shownSymbol = reverseInequalitySymbol(symbol);
    const leftConstant = randomInt(10, 30);
    return makeInequalityQuestion(`${leftConstant} − ${coefficient}x ${shownSymbol} ${leftConstant - coefficient * boundary}`, symbol, boundary);
  }

  if (variant === "negativeCoefficient") {
    const shownSymbol = reverseInequalitySymbol(symbol);
    return makeInequalityQuestion(`−${coefficient}x + ${constant} ${shownSymbol} ${-coefficient * boundary + constant}`, symbol, boundary);
  }

  if (variant === "variableRight") {
    const shownSymbol = reverseInequalitySymbol(symbol);
    return makeInequalityQuestion(`${coefficient * boundary + constant} ${shownSymbol} ${coefficient}x + ${constant}`, symbol, boundary);
  }

  if (variant === "dividedTerm") {
    const divisor = randomInt(2, 8);
    const quotientBoundary = randomInt(1, 12);
    return makeInequalityQuestion(`x ÷ ${divisor} + ${constant} ${symbol} ${quotientBoundary + constant}`, symbol, divisor * quotientBoundary);
  }

  if (variant === "brackets") {
    const bracketConstant = randomInt(1, 8);
    return makeInequalityQuestion(`${coefficient}(x + ${bracketConstant}) ${symbol} ${coefficient * (boundary + bracketConstant)}`, symbol, boundary);
  }

  if (variant === "bothSides") {
    let rightCoefficient = randomInt(1, 8);
    while (rightCoefficient === coefficient) {
      rightCoefficient = randomInt(1, 8);
    }
    const leftConstant = randomInt(-10, 10);
    const rightConstant = leftConstant + (coefficient - rightCoefficient) * boundary;
    const answerSymbol = coefficient - rightCoefficient < 0
      ? reverseInequalitySymbol(symbol)
      : symbol;
    return makeInequalityQuestion(`${formatLinearExpression(coefficient, leftConstant)} ${symbol} ${formatLinearExpression(rightCoefficient, rightConstant)}`, answerSymbol, boundary);
  }

  throw new Error(`Unknown two-step inequation variant: ${variant}`);
}

function generateSpecialInequality(variant) {
  if (variant === "noValues") {
    const coefficient = randomInt(1, 8);
    const larger = randomInt(6, 15);
    const smaller = randomInt(1, 5);
    return makeQuestion(`${coefficient}x + ${larger} < ${coefficient}x + ${smaller}`, "no values");
  }

  if (variant === "allValues") {
    const coefficient = randomInt(1, 8);
    const smaller = randomInt(1, 5);
    const larger = randomInt(6, 15);
    return makeQuestion(`${coefficient}x + ${smaller} < ${coefficient}x + ${larger}`, "all real numbers");
  }

  if (variant === "checkValue") {
    const value = randomInt(-10, 15);
    const boundary = randomInt(-5, 10);
    const symbol = randomInequalitySymbol();
    return makeQuestion(`Does x = ${value} satisfy x ${symbol} ${boundary}?`, evaluateInequality(value, symbol, boundary) ? "Yes" : "No");
  }

  if (variant === "greatestInteger") {
    const greatest = randomInt(-5, 15);
    return makeQuestion(`What is the greatest integer satisfying x < ${greatest + 0.5}?`, greatest);
  }

  if (variant === "leastInteger") {
    const least = randomInt(-5, 15);
    return makeQuestion(`What is the least integer satisfying x > ${least - 0.5}?`, least);
  }

  if (variant === "countIntegers" || variant === "listIntegers") {
    const lower = randomInt(-5, 5);
    const upper = lower + randomInt(3, 8);
    const values = [];

    for (let value = lower + 1; value < upper; value++) {
      values.push(value);
    }

    if (variant === "countIntegers") {
      return makeQuestion(`How many integer values satisfy ${lower} < x < ${upper}?`, values.length);
    }

    return makeQuestion(`List the integer values satisfying ${lower} < x < ${upper}.`, values.join(", "));
  }

  if (variant === "chooseSign") {
    const symbol = randomInequalitySymbol();
    const boundary = randomInt(-10, 15);
    const coefficient = randomInt(2, 8);
    return makeQuestion(
      `Solve ${coefficient}x ${symbol} ${coefficient * boundary}, then complete: x □ ${boundary}`,
      symbol
    );
  }

  if (variant === "missingValue") {
    const value = randomInt(-10, 15);
    const constant = randomInt(1, 15);
    return makeBoxQuestion(`x + ${constant} < □, with x = ${value} on the boundary`, value + constant);
  }

  if (variant === "reversalError") {
    const coefficient = randomInt(2, 8);
    const boundary = randomInt(1, 10);
    return makeQuestion(`A pupil solves −${coefficient}x < ${-coefficient * boundary} as x < ${boundary}. What was the error?`, "the inequality sign was not reversed");
  }

  throw new Error(`Unknown special inequation variant: ${variant}`);
}

function makeCompoundAnswer(lower, lowerSymbol, upperSymbol, upper) {
  return `${lower} ${lowerSymbol} x ${upperSymbol} ${upper}`;
}

function generateCompoundInequality(variant) {
  if (variant === "mixed") {
    return generateCompoundInequality(choice([
      "open",
      "inclusiveLower",
      "inclusiveUpper",
      "closed",
      "oneStep",
      "twoStep",
      "and",
      "or",
      "negative",
      "integerSolutions"
    ]));
  }

  const lower = variant === "negative"
    ? -randomInt(10, 20)
    : randomInt(-5, 5);
  const upper = lower + randomInt(3, 10);

  if (variant === "open" || variant === "negative") {
    return makeQuestion(`Write the solution interval for values between ${lower} and ${upper}, excluding both boundaries.`, makeCompoundAnswer(lower, "<", "<", upper));
  }

  if (variant === "inclusiveLower") {
    return makeQuestion(`Write the solution interval from ${lower} inclusive to ${upper} exclusive.`, makeCompoundAnswer(lower, "≤", "<", upper));
  }

  if (variant === "inclusiveUpper") {
    return makeQuestion(`Write the solution interval from ${lower} exclusive to ${upper} inclusive.`, makeCompoundAnswer(lower, "<", "≤", upper));
  }

  if (variant === "closed") {
    return makeQuestion(`Write the solution interval from ${lower} to ${upper}, including both boundaries.`, makeCompoundAnswer(lower, "≤", "≤", upper));
  }

  if (variant === "oneStep") {
    const shift = randomInt(1, 8);
    return makeQuestion(`${lower + shift} < x + ${shift} < ${upper + shift}`, makeCompoundAnswer(lower, "<", "<", upper));
  }

  if (variant === "twoStep") {
    const coefficient = randomInt(2, 5);
    const shift = randomInt(1, 8);
    return makeQuestion(`${coefficient * lower + shift} < ${coefficient}x + ${shift} < ${coefficient * upper + shift}`, makeCompoundAnswer(lower, "<", "<", upper));
  }

  if (variant === "and") {
    return makeQuestion(`Solve: x > ${lower} and x < ${upper}`, makeCompoundAnswer(lower, "<", "<", upper));
  }

  if (variant === "or") {
    return makeQuestion(`Solve: x < ${lower} or x > ${upper}`, `x < ${lower} or x > ${upper}`);
  }

  if (variant === "integerSolutions") {
    const values = [];
    for (let value = lower + 1; value < upper; value++) {
      values.push(value);
    }
    return makeQuestion(`List the integer solutions to ${lower} < x < ${upper}.`, values.join(", "));
  }

  throw new Error(`Unknown compound inequation variant: ${variant}`);
}

function generateContextAlgebraQuestion(variant) {
  if (variant === "mixedEquation") {
    return generateContextAlgebraQuestion(choice([
      "unknownNumber",
      "age",
      "perimeter",
      "money",
      "sharing",
      "rateDistance"
    ]));
  }

  if (variant === "mixedInequality") {
    return generateContextAlgebraQuestion(choice([
      "maximumBudget",
      "minimumRequirement",
      "capacity",
      "atLeastAtMost",
      "moreFewer"
    ]));
  }

  if (variant === "unknownNumber") {
    const solution = randomInt(1, 50);
    const added = randomInt(1, 30);
    return makeXQuestion(`A number is increased by ${added} to give ${solution + added}. Find the number.`, solution);
  }

  if (variant === "age") {
    const age = randomInt(8, 18);
    const years = randomInt(2, 8);
    return makeQuestion(`In ${years} years, Sam will be ${age + years}. How old is Sam now?`, age, { answerSuffix: " years" });
  }

  if (variant === "perimeter") {
    const width = randomInt(2, 12);
    const length = width + randomInt(2, 10);
    const perimeter = 2 * (length + width);
    return makeQuestion(`A rectangle has length ${length} cm and perimeter ${perimeter} cm. Find its width.`, width, { answerSuffix: " cm" });
  }

  if (variant === "money") {
    const itemCost = randomInt(2, 12);
    const fixedCost = randomInt(1, 10);
    const quantity = randomInt(2, 10);
    const total = fixedCost + itemCost * quantity;
    return makeQuestion(`A booking costs £${fixedCost} plus £${itemCost} per person. The total is £${total}. How many people are there?`, quantity);
  }

  if (variant === "sharing") {
    const groups = randomInt(2, 12);
    const inEach = randomInt(2, 15);
    return makeQuestion(`${groups * inEach} counters are shared equally among ${groups} groups. How many are in each group?`, inEach);
  }

  if (variant === "rateDistance") {
    const speed = randomInt(20, 70);
    const time = randomInt(2, 6);
    return makeQuestion(`A vehicle travels ${speed * time} km at ${speed} km/h. How many hours does it travel for?`, time, { answerSuffix: " hours" });
  }

  if (variant === "maximumBudget") {
    const cost = randomInt(2, 12);
    const budget = cost * randomInt(3, 12) + randomInt(0, cost - 1);
    return makeQuestion(`Tickets cost £${cost} each and the budget is at most £${budget}. What is the greatest number of tickets that can be bought?`, Math.floor(budget / cost));
  }

  if (variant === "minimumRequirement") {
    const current = randomInt(1, 20);
    const target = current + randomInt(3, 15);
    return makeQuestion(`A team has ${current} points and needs at least ${target}. What is the minimum number of additional points needed?`, target - current);
  }

  if (variant === "capacity") {
    const occupied = randomInt(10, 40);
    const capacity = occupied + randomInt(5, 25);
    return makeQuestion(`A room holds at most ${capacity} people. ${occupied} are already inside. What is the greatest number who can still enter?`, capacity - occupied);
  }

  if (variant === "atLeastAtMost") {
    const boundary = randomInt(5, 30);
    const isAtLeast = Math.random() < 0.5;
    return makeQuestion(
      `Write an inequation for: x is ${isAtLeast ? "at least" : "at most"} ${boundary}.`,
      isAtLeast ? `x ≥ ${boundary}` : `x ≤ ${boundary}`
    );
  }

  if (variant === "moreFewer") {
    const boundary = randomInt(5, 30);
    const isMore = Math.random() < 0.5;
    return makeQuestion(
      `Write an inequation for: x is ${isMore ? "more than" : "fewer than"} ${boundary}.`,
      isMore ? `x > ${boundary}` : `x < ${boundary}`
    );
  }

  throw new Error(`Unknown contextual algebra variant: ${variant}`);
}

function generateMixedAlgebraReview(variant) {
  if (variant === "oneStepEquations") {
    return generateOneStepEquation("mixed");
  }

  if (variant === "oneAndTwoStep") {
    return Math.random() < 0.5
      ? generateOneStepEquation("mixed")
      : generateTwoStepEquation("mixed");
  }

  if (variant === "linearEquations") {
    return choice([
      () => generateOneStepEquation("mixed"),
      () => generateTwoStepEquation("mixed"),
      () => generateBothSidesEquation("mixed"),
      () => generateFractionDecimalEquation("mixed")
    ])();
  }

  if (variant === "includingBrackets") {
    return choice([
      () => generateTwoStepEquation("mixed"),
      () => generateBothSidesEquation("mixed"),
      () => generateBracketEquation("mixed")
    ])();
  }

  if (variant === "equationDifficulty") {
    return choice([
      () => generateOneStepEquation("mixed"),
      () => generateTwoStepEquation("mixed"),
      () => generateBothSidesEquation("mixed"),
      () => generateBracketEquation("mixed"),
      () => generateFractionDecimalEquation("mixed"),
      () => generateQuadraticEquation("mixed")
    ])();
  }

  if (variant === "oneStepInequalities") {
    return generateOneStepInequality("mixed");
  }

  if (variant === "linearInequalities") {
    return Math.random() < 0.5
      ? generateOneStepInequality("mixed")
      : generateTwoStepInequality("mixed");
  }

  if (variant === "equationsAndInequalities") {
    return choice([
      () => generateOneStepEquation("mixed"),
      () => generateTwoStepEquation("mixed"),
      () => generateOneStepInequality("mixed"),
      () => generateTwoStepInequality("mixed")
    ])();
  }

  if (variant === "advancedEquations") {
    return choice([
      () => generateBracketEquation("mixed"),
      () => generateSimultaneousEquation("mixed"),
      () => generateQuadraticEquation("mixed")
    ])();
  }

  if (variant === "fullCategory") {
    return choice([
      () => generateOneStepEquation("mixed"),
      () => generateTwoStepEquation("mixed"),
      () => generateBothSidesEquation("mixed"),
      () => generateBracketEquation("mixed"),
      () => generateFractionDecimalEquation("mixed"),
      () => generateSpecialLinearEquation(choice([
        "solutionZero",
        "solutionOne",
        "checkSolution",
        "missingConstant",
        "missingCoefficient",
        "chooseEquation",
        "identifySolutionCount",
        "alwaysTrue",
        "neverTrue"
      ])),
      () => generateSimultaneousEquation("mixed"),
      () => generateQuadraticEquation("mixed"),
      () => generateOneStepInequality("mixed"),
      () => generateTwoStepInequality("mixed"),
      () => generateSpecialInequality(choice([
        "noValues",
        "allValues",
        "checkValue",
        "greatestInteger",
        "leastInteger",
        "countIntegers",
        "listIntegers",
        "chooseSign",
        "missingValue",
        "reversalError"
      ])),
      () => generateCompoundInequality("mixed"),
      () => generateContextAlgebraQuestion(Math.random() < 0.5 ? "mixedEquation" : "mixedInequality")
    ])();
  }

  throw new Error(`Unknown mixed algebra review variant: ${variant}`);
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
