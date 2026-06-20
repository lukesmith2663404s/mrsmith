/*
  Reusable Hotseat / Codenames prompt generator.

  Put this file at: js/clue-item-generator.js

  Image items use an approved list of exact English Wikipedia page titles.
  The generator asks Wikipedia for the page image, then Wikimedia Commons
  for a thumbnail and licence metadata. It does not perform open-ended image
  searches.
*/

globalThis.ClueItemGenerator = (() => {
  "use strict";

  const CACHE_KEY = "clueItemGeneratorImageCacheV3";
  const CACHE_AGE = 30 * 24 * 60 * 60 * 1000;
  const REQUEST_TIMEOUT = 12000;

  const GROUPS = [
    { id: "mathematics", name: "Mathematics" },
    { id: "general", name: "General Knowledge" }
  ];

  const CATEGORIES = [
    category("integers", "mathematics", "Integers", [
      ["integers", "Integers"]
    ]),
    category("fractions", "mathematics", "Fractions", [
      ["fractions", "Fractions"]
    ]),
    category("decimals", "mathematics", "Decimals", [
      ["decimals", "Decimals"]
    ]),
    category("percentages", "mathematics", "Percentages", [
      ["percentages", "Percentages"]
    ]),
    category("number-words", "mathematics", "Number Words", [
      ["number-words", "Number Words"]
    ]),
    category("fdp-words", "mathematics", "Fraction, Decimal and Percentage Words", [
      ["fdp-words", "FDP Words"]
    ]),
    category("mathematical-symbols", "mathematics", "Mathematical Symbols", [
      ["mathematical-symbols", "Mathematical Symbols"]
    ]),
    category("operation-words", "mathematics", "Operation Words", [
      ["operation-words", "Operation Words"]
    ]),
    category("algebra-expressions", "mathematics", "Algebra Expressions", [
      ["algebra-expressions", "Algebra Expressions"]
    ]),
    category("algebra-words", "mathematics", "Algebra Words", [
      ["algebra-words", "Algebra Words"]
    ]),
    category("2d-shapes", "mathematics", "2D Shapes", [
      ["2d-shapes", "2D Shapes"]
    ]),
    category("3d-shapes", "mathematics", "3D Shapes", [
      ["3d-shapes", "3D Shapes"]
    ]),
    category("data-words", "mathematics", "Data and Probability Words", [
      ["data-words", "Data and Probability Words"]
    ]),
    category("animals", "general", "Animals", [
      ["animals", "Animals"]
    ]),
    category("landmarks", "general", "Landmarks", [
      ["landmarks", "Landmarks"]
    ]),
    category("celebrities", "general", "Famous People", [
      ["music", "Music"],
      ["screen-online", "Film, Television and Online"],
      ["sporting-people", "Sporting Figures"]
    ]),
    category("characters", "general", "Characters", [
      ["animated-characters", "Cartoon and Animated Characters"],
      ["film-characters", "Film Characters"],
      ["television-characters", "Television Characters"],
      ["video-game-characters", "Video Game Characters"],
      ["anime-characters", "Anime and Manga Characters"],
      ["icons-and-mascots", "Icons and Mascots"]
    ]),
    category("colours", "general", "Colours", [
      ["colours", "Colours"]
    ]),
    category("foods", "general", "Foods", [
      ["foods", "Foods"]
    ]),
    category("flags", "general", "Countries and Flags", [
      ["flags", "Flags"]
    ]),
    category("sports", "general", "Sports", [
      ["sports", "Sports"]
    ]),
    category("objects", "general", "Everyday Objects", [
      ["objects", "Everyday Objects"]
    ])
  ];

  function category(id, groupId, name, subcategories) {
    return {
      id,
      groupId,
      name,
      subcategories: subcategories.map(([subcategoryId, subcategoryName]) => ({
        id: subcategoryId,
        name: subcategoryName
      }))
    };
  }

  function item({
    id,
    label,
    groupId,
    categoryId,
    subcategoryId,
    displayType = "text",
    displayValue = label,
    spokenName = label,
    tags = [],
    difficulty = "easy",
    recognisability = "high",
    familyId = id,
    svgKey = null,
    flagCode = null,
    colourValue = null,
    wikipediaTitle = null,
    allowWikipediaThumbnail = false,
    approvalStatus = "approved",
    classroomSafe = true
  }) {
    return Object.freeze({
      id,
      label,
      groupId,
      categoryId,
      subcategoryId,
      displayType,
      displayValue,
      spokenName,
      tags: Object.freeze([...tags]),
      difficulty,
      recognisability,
      familyId,
      svgKey,
      flagCode,
      colourValue,
      wikipediaTitle,
      allowWikipediaThumbnail,
      approvalStatus,
      classroomSafe
    });
  }

  const ITEMS = [];

  function addText(categoryId, subcategoryId, entries) {
    entries.forEach((entry) => {
      const [id, label, options = {}] = entry;
      ITEMS.push(item({
        id,
        label,
        groupId: "mathematics",
        categoryId,
        subcategoryId,
        ...options
      }));
    });
  }

  function addGeneralText(categoryId, subcategoryId, entries) {
    entries.forEach((entry) => {
      const [id, label, options = {}] = entry;
      ITEMS.push(item({
        id,
        label,
        groupId: "general",
        categoryId,
        subcategoryId,
        ...options
      }));
    });
  }

  function addColours(entries) {
    entries.forEach(([id, label, colourValue, options = {}]) => {
      ITEMS.push(item({
        id,
        label,
        spokenName: label,
        colourValue,
        tags: ["colour", ...(options.tags || [])],
        groupId: "general",
        categoryId: "colours",
        subcategoryId: "colours",
        displayType: "colour",
        recognisability: options.recognisability || "high"
      }));
    });
  }

  function addSymbols(categoryId, subcategoryId, entries) {
    entries.forEach((entry) => {
      const [id, label, spokenName, tags = []] = entry;
      ITEMS.push(item({
        id,
        label,
        spokenName,
        tags,
        groupId: "mathematics",
        categoryId,
        subcategoryId,
        displayType: "symbol"
      }));
    });
  }

  function addShapes(categoryId, subcategoryId, entries) {
    entries.forEach(([id, label, svgKey, tags = []]) => {
      ITEMS.push(item({
        id,
        label,
        svgKey,
        tags: ["shape", ...tags],
        groupId: "mathematics",
        categoryId,
        subcategoryId,
        displayType: "svg"
      }));
    });
  }

  function addImages(categoryId, subcategoryId, entries) {
    entries.forEach((entry) => {
      const [id, label, wikipediaTitle, options = {}] = entry;
      ITEMS.push(item({
        id,
        label,
        wikipediaTitle,
        groupId: "general",
        categoryId,
        subcategoryId,
        displayType: "image",
        ...options
      }));
    });
  }

  function addCharacterImages(subcategoryId, entries) {
    entries.forEach((entry) => {
      const [id, label, wikipediaTitle, options = {}] = entry;
      ITEMS.push(item({
        id,
        label,
        wikipediaTitle,
        groupId: "general",
        categoryId: "characters",
        subcategoryId,
        displayType: "image",
        allowWikipediaThumbnail: true,
        tags: [
          "character",
          subcategoryId,
          ...(options.tags || [])
        ],
        familyId: options.familyId || `character:${wikipediaTitle}`,
        ...options
      }));
    });
  }

  function addFlags(entries) {
    entries.forEach(([id, label, flagCode]) => {
      ITEMS.push(item({
        id,
        label,
        spokenName: label,
        flagCode,
        tags: ["country", "flag"],
        groupId: "general",
        categoryId: "flags",
        subcategoryId: "flags",
        displayType: "flag",
        recognisability: "very-high"
      }));
    });
  }

  addText("integers", "integers", [
    ["number-minus-20", "−20", { tags: ["negative", "integer"] }],
    ["number-minus-12", "−12", { tags: ["negative", "integer"] }],
    ["number-minus-8", "−8", { tags: ["negative", "integer"] }],
    ["number-minus-3", "−3", { tags: ["negative", "integer"] }],
    ["number-zero", "0", { tags: ["zero", "integer"] }],
    ["number-one", "1", { tags: ["integer", "square", "cube"] }],
    ["number-two", "2", { tags: ["integer", "prime"] }],
    ["number-seven", "7", { tags: ["integer", "prime"] }],
    ["number-twelve", "12", { tags: ["integer", "multiple"] }],
    ["number-sixteen", "16", { tags: ["square-number"] }],
    ["number-twenty-five", "25", { tags: ["square-number"] }],
    ["number-thirty-six", "36", { tags: ["square-number"] }],
    ["number-forty-nine", "49", { tags: ["square-number"] }],
    ["number-sixty-four", "64", { tags: ["square-number", "cube-number"] }],
    ["number-eighty-one", "81", { tags: ["square-number"] }],
    ["number-one-hundred", "100", { tags: ["square-number"] }],
    ["number-one-hundred-twenty-five", "125", { tags: ["cube-number"] }],
    ["number-one-hundred-forty-four", "144", { tags: ["square-number"] }],
    ["number-two-hundred-fifty-six", "256", { tags: ["square-number"] }]
  ]);

  addText("number-words", "number-words", [
    ["word-integer", "integer", { tags: ["number"] }],
    ["word-negative", "negative", { tags: ["less-than-zero"] }],
    ["word-positive", "positive", { tags: ["greater-than-zero"] }],
    ["word-zero", "zero", { tags: ["origin"] }],
    ["word-opposite", "opposite", { tags: ["inverse"] }],
    ["word-absolute-value", "absolute value", { difficulty: "medium", tags: ["distance-from-zero"] }],
    ["word-prime", "prime", { tags: ["factors"] }],
    ["word-factor", "factor", { tags: ["division"] }],
    ["word-multiple", "multiple", { tags: ["times-table"] }],
    ["word-square-number", "square number", { tags: ["power"] }],
    ["word-cube-number", "cube number", { tags: ["power"] }]
  ]);

  addText("fractions", "fractions", [
    ["fraction-half", "1/2", { spokenName: "one half", familyId: "half", tags: ["fraction", "half"] }],
    ["fraction-quarter", "1/4", { spokenName: "one quarter", familyId: "quarter", tags: ["fraction", "quarter"] }],
    ["fraction-three-quarters", "3/4", { familyId: "three-quarters", tags: ["fraction"] }],
    ["fraction-one-third", "1/3", { tags: ["fraction", "third"] }],
    ["fraction-two-thirds", "2/3", { tags: ["fraction", "third"] }],
    ["fraction-two-fifths", "2/5", { familyId: "two-fifths", tags: ["fraction"] }],
    ["fraction-five-eighths", "5/8", { difficulty: "medium", tags: ["fraction"] }],
    ["mixed-number", "1 1/2", { difficulty: "medium", tags: ["mixed-number"] }]
  ]);

  addText("decimals", "decimals", [
    ["decimal-point-one", "0.1", { tags: ["decimal", "tenth"] }],
    ["decimal-point-two-five", "0.25", { familyId: "quarter", tags: ["decimal", "quarter"] }],
    ["decimal-point-four", "0.4", { familyId: "two-fifths", tags: ["decimal"] }],
    ["decimal-point-five", "0.5", { familyId: "half", tags: ["decimal", "half"] }],
    ["decimal-point-seven-five", "0.75", { familyId: "three-quarters", tags: ["decimal"] }],
    ["decimal-one-point-two", "1.2", { tags: ["decimal"] }]
  ]);

  addText("percentages", "percentages", [
    ["percentage-ten", "10%", { tags: ["percentage"] }],
    ["percentage-twenty-five", "25%", { familyId: "quarter", tags: ["percentage", "quarter"] }],
    ["percentage-forty", "40%", { familyId: "two-fifths", tags: ["percentage"] }],
    ["percentage-fifty", "50%", { familyId: "half", tags: ["percentage", "half"] }],
    ["percentage-seventy-five", "75%", { familyId: "three-quarters", tags: ["percentage"] }],
    ["percentage-one-hundred", "100%", { tags: ["percentage", "whole"] }]
  ]);

  addText("fdp-words", "fdp-words", [
    ["word-fraction", "fraction", { tags: ["numerator", "denominator"] }],
    ["word-decimal", "decimal", { tags: ["place-value"] }],
    ["word-percentage", "percentage", { tags: ["out-of-100"] }],
    ["word-equivalent", "equivalent", { tags: ["same-value"] }],
    ["word-numerator", "numerator", { difficulty: "medium", tags: ["fraction"] }],
    ["word-denominator", "denominator", { difficulty: "medium", tags: ["fraction"] }],
    ["word-simplify", "simplify", { tags: ["lowest-terms"] }]
  ]);

  addSymbols("mathematical-symbols", "mathematical-symbols", [
    ["symbol-plus", "+", "plus", ["addition", "sum"]],
    ["symbol-minus", "−", "minus", ["subtraction", "difference"]],
    ["symbol-times", "×", "times", ["multiplication", "product"]],
    ["symbol-divide", "÷", "divide", ["division", "quotient"]],
    ["symbol-equals", "=", "equals", ["equality"]],
    ["symbol-less-than", "<", "less than", ["comparison", "inequality"]],
    ["symbol-greater-than", ">", "greater than", ["comparison", "inequality"]],
    ["symbol-less-equal", "≤", "less than or equal to", ["comparison", "inequality"]],
    ["symbol-greater-equal", "≥", "greater than or equal to", ["comparison", "inequality"]],
    ["symbol-square-root", "√", "square root", ["root"]],
    ["symbol-squared", "²", "squared", ["power"]]
  ]);

  addText("operation-words", "operation-words", [
    ["word-sum", "sum", { tags: ["addition"] }],
    ["word-difference", "difference", { tags: ["subtraction"] }],
    ["word-product", "product", { tags: ["multiplication"] }],
    ["word-quotient", "quotient", { tags: ["division"] }],
    ["word-total", "total", { tags: ["addition"] }],
    ["word-share", "share", { tags: ["division"] }],
    ["word-square", "square", { tags: ["power"] }],
    ["word-square-root", "square root", { tags: ["root"] }]
  ]);

  addText("algebra-expressions", "algebra-expressions", [
    ["algebra-x", "x", { tags: ["variable"] }],
    ["algebra-y", "y", { tags: ["variable"] }],
    ["algebra-a", "a", { tags: ["variable"] }],
    ["algebra-two-x", "2x", { tags: ["coefficient", "term"] }],
    ["algebra-three-y", "3y", { tags: ["coefficient", "term"] }],
    ["algebra-five-a", "5a", { tags: ["coefficient", "term"] }],
    ["algebra-x-plus-three", "x + 3", { tags: ["expression"] }],
    ["algebra-x-minus-seven", "x − 7", { tags: ["expression"] }],
    ["algebra-four-x-plus-one", "4x + 1", { tags: ["expression"] }],
    ["algebra-three-x-minus-five", "3x − 5", { tags: ["expression"] }],
    ["algebra-two-y-minus-three", "2y − 3", { tags: ["expression"] }],
    ["algebra-five-a-plus-two", "5a + 2", { tags: ["expression"] }],
    ["algebra-x-over-two", "x/2", { tags: ["expression", "division"] }],
    ["algebra-x-plus-three-over-four", "(x + 3)/4", { difficulty: "medium", tags: ["expression", "division"] }],
    ["algebra-x-squared", "x²", { tags: ["power"] }],
    ["algebra-x-squared-plus-one", "x² + 1", { tags: ["power", "expression"] }],
    ["algebra-two-x-squared", "2x²", { tags: ["power", "coefficient"] }],
    ["algebra-x-y", "xy", { tags: ["product", "variables"] }],
    ["algebra-three-bracket-x-plus-two", "3(x + 2)", { difficulty: "medium", tags: ["brackets", "expression"] }],
    ["algebra-a-plus-b", "a + b", { tags: ["expression", "variables"] }],
    ["algebra-two-m-minus-n", "2m − n", { tags: ["expression", "variables"] }]
  ]);

  addText("algebra-words", "algebra-words", [
    ["word-equation", "equation", { tags: ["equals", "solve"] }],
    ["word-inequality", "inequality", { tags: ["comparison"] }],
    ["word-expression", "expression", { tags: ["terms"] }],
    ["word-term", "term", { tags: ["expression"] }],
    ["word-coefficient", "coefficient", { difficulty: "medium" }],
    ["word-variable", "variable", { tags: ["letter", "unknown"] }],
    ["word-substitute", "substitute", { tags: ["replace"] }],
    ["word-solve", "solve", { tags: ["equation"] }],
    ["word-expand", "expand", { tags: ["brackets"] }],
    ["word-factorise", "factorise", { difficulty: "medium", tags: ["brackets"] }]
  ]);

  addShapes("2d-shapes", "2d-shapes", [
    ["shape-triangle", "triangle", "triangle", ["3-sides"]],
    ["shape-square", "square", "square", ["4-equal-sides"]],
    ["shape-rectangle", "rectangle", "rectangle", ["right-angles"]],
    ["shape-circle", "circle", "circle", ["curved"]],
    ["shape-semicircle", "semicircle", "semicircle", ["half-circle"]],
    ["shape-pentagon", "pentagon", "pentagon", ["5-sides"]],
    ["shape-hexagon", "hexagon", "hexagon", ["6-sides"]],
    ["shape-octagon", "octagon", "octagon", ["8-sides"]],
    ["shape-parallelogram", "parallelogram", "parallelogram", ["parallel-sides"]],
    ["shape-rhombus", "rhombus", "rhombus", ["equal-sides"]],
    ["shape-trapezium", "trapezium", "trapezium", ["parallel-sides"]],
    ["shape-kite", "kite", "kite", ["equal-adjacent-sides"]]
  ]);

  addShapes("3d-shapes", "3d-shapes", [
    ["shape-cube", "cube", "cube", ["6-faces"]],
    ["shape-cuboid", "cuboid", "cuboid", ["rectangular-prism"]],
    ["shape-sphere", "sphere", "sphere", ["curved"]],
    ["shape-cylinder", "cylinder", "cylinder", ["circular-faces"]],
    ["shape-cone", "cone", "cone", ["circular-base"]],
    ["shape-triangular-prism", "triangular prism", "triangular-prism", ["prism"]],
    ["shape-square-pyramid", "square-based pyramid", "square-pyramid", ["pyramid"]],
    ["shape-tetrahedron", "tetrahedron", "tetrahedron", ["triangular-faces"]]
  ]);

  addText("data-words", "data-words", [
    ["word-mean", "mean", { tags: ["average"] }],
    ["word-median", "median", { tags: ["average", "middle"] }],
    ["word-mode", "mode", { tags: ["average", "most-common"] }],
    ["word-range", "range", { tags: ["spread"] }],
    ["word-bar-chart", "bar chart", { tags: ["graph"] }],
    ["word-pie-chart", "pie chart", { tags: ["graph"] }],
    ["word-line-graph", "line graph", { tags: ["graph"] }],
    ["word-scatter-graph", "scatter graph", { difficulty: "medium", tags: ["correlation"] }],
    ["word-frequency-table", "frequency table", { tags: ["count"] }],
    ["word-tally-chart", "tally chart", { tags: ["count"] }],
    ["word-sample", "sample", { tags: ["data"] }],
    ["word-population", "population", { tags: ["data"] }],
    ["word-correlation", "correlation", { difficulty: "medium", tags: ["scatter-graph"] }],
    ["word-probability", "probability", { tags: ["chance"] }],
    ["word-certain", "certain", { tags: ["probability", "1"] }],
    ["word-impossible", "impossible", { tags: ["probability", "0"] }],
    ["word-likely", "likely", { tags: ["probability"] }],
    ["word-unlikely", "unlikely", { tags: ["probability"] }],
    ["word-equally-likely", "equally likely", { tags: ["probability"] }],
    ["word-outcome", "outcome", { tags: ["probability"] }],
    ["word-event", "event", { tags: ["probability"] }],
    ["word-random", "random", { tags: ["probability"] }]
  ]);

  addImages("animals", "animals", [
    ["animal-elephant", "elephant", "African elephant"],
    ["animal-lion", "lion", "Lion"],
    ["animal-tiger", "tiger", "Tiger"],
    ["animal-giraffe", "giraffe", "Giraffe"],
    ["animal-zebra", "zebra", "Zebra"],
    ["animal-panda", "giant panda", "Giant panda"],
    ["animal-red-panda", "red panda", "Red panda"],
    ["animal-koala", "koala", "Koala"],
    ["animal-kangaroo", "kangaroo", "Kangaroo"],
    ["animal-gorilla", "gorilla", "Gorilla"],
    ["animal-sloth", "sloth", "Sloth"],
    ["animal-meerkat", "meerkat", "Meerkat"],
    ["animal-dolphin", "dolphin", "Dolphin"],
    ["animal-shark", "great white shark", "Great white shark"],
    ["animal-polar-bear", "polar bear", "Polar bear"],
    ["animal-penguin", "penguin", "Penguin"],
    ["animal-flamingo", "flamingo", "Flamingo"],
    ["animal-owl", "owl", "Owl"],
    ["animal-cheetah", "cheetah", "Cheetah", { recognisability: "medium" }],
    ["animal-leopard", "leopard", "Leopard", { recognisability: "medium" }],
    ["animal-rhino", "rhinoceros", "Rhinoceros"],
    ["animal-hippo", "hippopotamus", "Hippopotamus"],
    ["animal-crocodile", "crocodile", "Crocodile"],
    ["animal-alligator", "alligator", "Alligator", { recognisability: "medium" }],
    ["animal-octopus", "octopus", "Octopus"],
    ["animal-sea-turtle", "sea turtle", "Sea turtle"],
    ["animal-jellyfish", "jellyfish", "Jellyfish"],
    ["animal-clownfish", "clownfish", "Clownfish"],
    ["animal-seahorse", "seahorse", "Seahorse"],
    ["animal-whale", "whale", "Whale"],
    ["animal-seal", "seal", "True seal"],
    ["animal-otter", "otter", "Otter"],
    ["animal-fox", "fox", "Fox"],
    ["animal-wolf", "wolf", "Wolf"],
    ["animal-rabbit", "rabbit", "Rabbit"],
    ["animal-hedgehog", "hedgehog", "Hedgehog"],
    ["animal-squirrel", "squirrel", "Squirrel"],
    ["animal-raccoon", "raccoon", "Raccoon"],
    ["animal-camel", "camel", "Camel"],
    ["animal-llama", "llama", "Llama"],
    ["animal-alpaca", "alpaca", "Alpaca", { recognisability: "medium" }],
    ["animal-goat", "goat", "Goat"],
    ["animal-cow", "cow", "Cattle"],
    ["animal-horse", "horse", "Horse"],
    ["animal-donkey", "donkey", "Donkey"],
    ["animal-pig", "pig", "Pig"],
    ["animal-chicken", "chicken", "Chicken"],
    ["animal-eagle", "eagle", "Eagle"],
    ["animal-parrot", "parrot", "Parrot"],
    ["animal-peacock", "peacock", "Peafowl"]
  ]);

  addImages("landmarks", "landmarks", [
    ["landmark-eiffel", "Eiffel Tower", "Eiffel Tower"],
    ["landmark-liberty", "Statue of Liberty", "Statue of Liberty"],
    ["landmark-great-wall", "Great Wall of China", "Great Wall of China"],
    ["landmark-taj-mahal", "Taj Mahal", "Taj Mahal"],
    ["landmark-colosseum", "Colosseum", "Colosseum"],
    ["landmark-sydney-opera", "Sydney Opera House", "Sydney Opera House"],
    ["landmark-golden-gate", "Golden Gate Bridge", "Golden Gate Bridge"],
    ["landmark-redeemer", "Christ the Redeemer", "Christ the Redeemer (statue)"],
    ["landmark-giza", "Pyramids of Giza", "Giza pyramid complex"],
    ["landmark-pisa", "Leaning Tower of Pisa", "Leaning Tower of Pisa"],
    ["landmark-burj", "Burj Khalifa", "Burj Khalifa"],
    ["landmark-rushmore", "Mount Rushmore", "Mount Rushmore"],
    ["landmark-big-ben", "Big Ben", "Big Ben"],
    ["landmark-stonehenge", "Stonehenge", "Stonehenge"],
    ["landmark-buckingham", "Buckingham Palace", "Buckingham Palace"],
    ["landmark-london-eye", "London Eye", "London Eye"],
    ["landmark-edinburgh-castle", "Edinburgh Castle", "Edinburgh Castle"],
    ["landmark-machu-picchu", "Machu Picchu", "Machu Picchu"],
    ["landmark-petra", "Petra", "Petra"],
    ["landmark-angkor-wat", "Angkor Wat", "Angkor Wat"],
    ["landmark-sagrada-familia", "Sagrada Família", "Sagrada Família"],
    ["landmark-empire-state", "Empire State Building", "Empire State Building"],
    ["landmark-white-house", "White House", "White House"],
    ["landmark-tower-bridge", "Tower Bridge", "Tower Bridge"],
    ["landmark-louvre", "Louvre", "Louvre"],
    ["landmark-arc-de-triomphe", "Arc de Triomphe", "Arc de Triomphe"],
    ["landmark-brandenburg-gate", "Brandenburg Gate", "Brandenburg Gate"],
    ["landmark-acropolis", "Acropolis of Athens", "Acropolis of Athens"],
    ["landmark-hagia-sophia", "Hagia Sophia", "Hagia Sophia"],
    ["landmark-mount-fuji", "Mount Fuji", "Mount Fuji"],
    ["landmark-niagara-falls", "Niagara Falls", "Niagara Falls"],
    ["landmark-grand-canyon", "Grand Canyon", "Grand Canyon"],
    ["landmark-uluru", "Uluru", "Uluru"],
    ["landmark-moai", "Easter Island statues", "Moai"],
    ["landmark-neuschwanstein", "Neuschwanstein Castle", "Neuschwanstein Castle"]
  ]);

  addImages("celebrities", "music", [
    ["person-taylor-swift", "Taylor Swift", "Taylor Swift", { recognisability: "very-high" }],
    ["person-ed-sheeran", "Ed Sheeran", "Ed Sheeran", { recognisability: "very-high" }],
    ["person-adele", "Adele", "Adele", { recognisability: "very-high" }],
    ["person-beyonce", "Beyoncé", "Beyoncé", { recognisability: "very-high" }],
    ["person-billie-eilish", "Billie Eilish", "Billie Eilish", { recognisability: "very-high" }],
    ["person-harry-styles", "Harry Styles", "Harry Styles", { recognisability: "very-high" }],
    ["person-dua-lipa", "Dua Lipa", "Dua Lipa"],
    ["person-ariana-grande", "Ariana Grande", "Ariana Grande", { recognisability: "very-high" }],
    ["person-rihanna", "Rihanna", "Rihanna"],
    ["person-drake", "Drake", "Drake (musician)"],
    ["person-bruno-mars", "Bruno Mars", "Bruno Mars"],
    ["person-justin-bieber", "Justin Bieber", "Justin Bieber"],
    ["person-lady-gaga", "Lady Gaga", "Lady Gaga"],
    ["person-selena-gomez", "Selena Gomez", "Selena Gomez"],
    ["person-miley-cyrus", "Miley Cyrus", "Miley Cyrus"],
    ["person-olivia-rodrigo", "Olivia Rodrigo", "Olivia Rodrigo"],
    ["person-sabrina-carpenter", "Sabrina Carpenter", "Sabrina Carpenter", { recognisability: "medium" }],
    ["person-the-weeknd", "The Weeknd", "The Weeknd"],
    ["person-eminem", "Eminem", "Eminem"],
    ["person-snoop-dogg", "Snoop Dogg", "Snoop Dogg"],
    ["person-elton-john", "Elton John", "Elton John"],
    ["person-paul-mccartney", "Paul McCartney", "Paul McCartney"]
  ]);

  addImages("celebrities", "screen-online", [
    ["person-dwayne-johnson", "Dwayne Johnson", "Dwayne Johnson", { recognisability: "very-high" }],
    ["person-emma-watson", "Emma Watson", "Emma Watson", { recognisability: "very-high" }],
    ["person-tom-holland", "Tom Holland", "Tom Holland", { recognisability: "very-high" }],
    ["person-zendaya", "Zendaya", "Zendaya", { recognisability: "very-high" }],
    ["person-mrbeast", "MrBeast", "MrBeast", { recognisability: "very-high" }],
    ["person-jenna-ortega", "Jenna Ortega", "Jenna Ortega"],
    ["person-ryan-reynolds", "Ryan Reynolds", "Ryan Reynolds"],
    ["person-margot-robbie", "Margot Robbie", "Margot Robbie"],
    ["person-chris-hemsworth", "Chris Hemsworth", "Chris Hemsworth"],
    ["person-robert-downey-jr", "Robert Downey Jr.", "Robert Downey Jr."],
    ["person-keanu-reeves", "Keanu Reeves", "Keanu Reeves"],
    ["person-jennifer-lawrence", "Jennifer Lawrence", "Jennifer Lawrence"],
    ["person-will-smith", "Will Smith", "Will Smith"],
    ["person-leonardo-dicaprio", "Leonardo DiCaprio", "Leonardo DiCaprio"],
    ["person-pedro-pascal", "Pedro Pascal", "Pedro Pascal", { recognisability: "medium" }],
    ["person-jack-black", "Jack Black", "Jack Black"],
    ["person-millie-bobby-brown", "Millie Bobby Brown", "Millie Bobby Brown"],
    ["person-gordon-ramsay", "Gordon Ramsay", "Gordon Ramsay"],
    ["person-ksi", "KSI", "KSI"],
    ["person-logan-paul", "Logan Paul", "Logan Paul", { recognisability: "medium" }],
    ["person-markiplier", "Markiplier", "Markiplier", { recognisability: "medium" }],
    ["person-pewdiepie", "PewDiePie", "PewDiePie", { recognisability: "medium" }]
  ]);

  addImages("celebrities", "sporting-people", [
    ["person-ronaldo", "Cristiano Ronaldo", "Cristiano Ronaldo", { recognisability: "very-high" }],
    ["person-messi", "Lionel Messi", "Lionel Messi", { recognisability: "very-high" }],
    ["person-lebron", "LeBron James", "LeBron James", { recognisability: "very-high" }],
    ["person-serena", "Serena Williams", "Serena Williams", { recognisability: "very-high" }],
    ["person-beckham", "David Beckham", "David Beckham", { recognisability: "very-high" }],
    ["person-lewis-hamilton", "Lewis Hamilton", "Lewis Hamilton"],
    ["person-max-verstappen", "Max Verstappen", "Max Verstappen", { recognisability: "medium" }],
    ["person-usain-bolt", "Usain Bolt", "Usain Bolt"],
    ["person-simone-biles", "Simone Biles", "Simone Biles"],
    ["person-tyson-fury", "Tyson Fury", "Tyson Fury"],
    ["person-anthony-joshua", "Anthony Joshua", "Anthony Joshua"],
    ["person-mohamed-salah", "Mohamed Salah", "Mohamed Salah"],
    ["person-erling-haaland", "Erling Haaland", "Erling Haaland"],
    ["person-kylian-mbappe", "Kylian Mbappé", "Kylian Mbappé"],
    ["person-andy-murray", "Andy Murray", "Andy Murray"],
    ["person-emma-raducanu", "Emma Raducanu", "Emma Raducanu", { recognisability: "medium" }]
  ]);

  addCharacterImages("animated-characters", [
    ["character-animated-mickey-mouse", "Mickey Mouse", "Mickey Mouse"],
    ["character-animated-minnie-mouse", "Minnie Mouse", "Minnie Mouse"],
    ["character-animated-donald-duck", "Donald Duck", "Donald Duck"],
    ["character-animated-daisy-duck", "Daisy Duck", "Daisy Duck"],
    ["character-animated-goofy", "Goofy", "Goofy"],
    ["character-animated-pluto", "Pluto", "Pluto (Disney)"],
    ["character-animated-scrooge-mcduck", "Scrooge McDuck", "Scrooge McDuck"],
    ["character-animated-stitch", "Stitch", "Stitch (Lilo & Stitch)"],
    ["character-animated-lilo-pelekai", "Lilo Pelekai", "Lilo Pelekai"],
    ["character-animated-elsa", "Elsa", "Elsa (Frozen)"],
    ["character-animated-anna", "Anna", "Anna (Frozen)"],
    ["character-animated-olaf", "Olaf", "Olaf (Frozen)"],
    ["character-animated-moana", "Moana", "Moana (Disney character)"],
    ["character-animated-maui", "Maui", "Maui (Moana)"],
    ["character-animated-rapunzel", "Rapunzel", "Rapunzel (Tangled)"],
    ["character-animated-flynn-rider", "Flynn Rider", "Flynn Rider"],
    ["character-animated-ariel", "Ariel", "Ariel (The Little Mermaid)"],
    ["character-animated-sebastian", "Sebastian", "Sebastian (The Little Mermaid)"],
    ["character-animated-simba", "Simba", "Simba"],
    ["character-animated-timon", "Timon", "Timon and Pumbaa"],
    ["character-animated-pumbaa", "Pumbaa", "Timon and Pumbaa"],
    ["character-animated-aladdin", "Aladdin", "Aladdin (Disney character)"],
    ["character-animated-princess-jasmine", "Princess Jasmine", "Jasmine (Aladdin)"],
    ["character-animated-genie", "Genie", "Genie (Disney)"],
    ["character-animated-belle", "Belle", "Belle (Beauty and the Beast)"],
    ["character-animated-the-beast", "The Beast", "Beast (Beauty and the Beast)"],
    ["character-animated-mulan", "Mulan", "Mulan (Disney character)"],
    ["character-animated-mushu", "Mushu", "Mushu"],
    ["character-animated-tiana", "Tiana", "Tiana (The Princess and the Frog)"],
    ["character-animated-baymax", "Baymax", "Baymax"],
    ["character-animated-wreck-it-ralph", "Wreck-It Ralph", "Wreck-It Ralph"],
    ["character-animated-vanellope", "Vanellope", "Vanellope von Schweetz"],
    ["character-animated-mirabel", "Mirabel", "Mirabel Madrigal"],
    ["character-animated-bruno-madrigal", "Bruno Madrigal", "Bruno Madrigal"],
    ["character-animated-lightning-mcqueen", "Lightning McQueen", "Lightning McQueen"],
    ["character-animated-mater", "Mater", "Mater (Cars)"],
    ["character-animated-woody", "Woody", "Woody (Toy Story)"],
    ["character-animated-buzz-lightyear", "Buzz Lightyear", "Buzz Lightyear"],
    ["character-animated-jessie", "Jessie", "Jessie (Toy Story)"],
    ["character-animated-mr-incredible", "Mr. Incredible", "Mr. Incredible"],
    ["character-animated-elastigirl", "Elastigirl", "Elastigirl"],
    ["character-animated-violet-parr", "Violet Parr", "Violet Parr"],
    ["character-animated-dash-parr", "Dash Parr", "Dash Parr"],
    ["character-animated-frozone", "Frozone", "Frozone"],
    ["character-animated-nemo", "Nemo", "Nemo (Disney)"],
    ["character-animated-dory", "Dory", "Dory (Finding Nemo)"],
    ["character-animated-sulley", "Sulley", "James P. Sullivan"],
    ["character-animated-mike-wazowski", "Mike Wazowski", "Mike Wazowski"],
    ["character-animated-remy", "Remy", "Remy (Ratatouille)"],
    ["character-animated-wall-e", "WALL-E", "WALL-E (character)"],
    ["character-animated-eve", "EVE", "EVE (WALL-E)"],
    ["character-animated-joy", "Joy", "Joy (Inside Out)"],
    ["character-animated-sadness", "Sadness", "Sadness (Inside Out)"],
    ["character-animated-miguel", "Miguel", "Miguel Rivera"],
    ["character-animated-shrek", "Shrek", "Shrek (character)"],
    ["character-animated-princess-fiona", "Princess Fiona", "Princess Fiona"],
    ["character-animated-donkey", "Donkey", "Donkey (Shrek)"],
    ["character-animated-puss-in-boots", "Puss in Boots", "Puss in Boots"],
    ["character-animated-po", "Po", "Po (Kung Fu Panda)"],
    ["character-animated-toothless", "Toothless", "Toothless (How to Train Your Dragon)"],
    ["character-animated-hiccup", "Hiccup", "Hiccup Horrendous Haddock III"],
    ["character-animated-alex-the-lion", "Alex the Lion", "Alex (Madagascar)"],
    ["character-animated-king-julien", "King Julien", "King Julien"],
    ["character-animated-gru", "Gru", "Gru"],
    ["character-animated-minion", "Minion", "Minions (Despicable Me)"],
    ["character-animated-megamind", "Megamind", "Megamind"],
    ["character-animated-boss-baby", "Boss Baby", "The Boss Baby"],
    ["character-animated-spongebob", "SpongeBob", "SpongeBob SquarePants (character)"],
    ["character-animated-patrick-star", "Patrick Star", "Patrick Star"],
    ["character-animated-squidward", "Squidward", "Squidward Tentacles"],
    ["character-animated-mr-krabs", "Mr. Krabs", "Mr. Krabs"],
    ["character-animated-sandy-cheeks", "Sandy Cheeks", "Sandy Cheeks"],
    ["character-animated-aang", "Aang", "Aang"],
    ["character-animated-katara", "Katara", "Katara (Avatar: The Last Airbender)"],
    ["character-animated-zuko", "Zuko", "Zuko"],
    ["character-animated-korra", "Korra", "Korra"],
    ["character-animated-leonardo", "Leonardo", "Leonardo (Teenage Mutant Ninja Turtles)"],
    ["character-animated-michelangelo", "Michelangelo", "Michelangelo (Teenage Mutant Ninja Turtles)"],
    ["character-animated-raphael", "Raphael", "Raphael (Teenage Mutant Ninja Turtles)"],
    ["character-animated-donatello", "Donatello", "Donatello (Teenage Mutant Ninja Turtles)"],
    ["character-animated-scooby-doo", "Scooby-Doo", "Scooby-Doo (character)"],
    ["character-animated-shaggy", "Shaggy", "Shaggy Rogers"],
    ["character-animated-tom", "Tom", "Tom Cat"],
    ["character-animated-jerry", "Jerry", "Jerry Mouse"],
    ["character-animated-bugs-bunny", "Bugs Bunny", "Bugs Bunny"],
    ["character-animated-daffy-duck", "Daffy Duck", "Daffy Duck"],
    ["character-animated-tweety", "Tweety", "Tweety"],
    ["character-animated-wile-e-coyote", "Wile E. Coyote", "Wile E. Coyote"],
    ["character-animated-road-runner", "Road Runner", "Road Runner (character)"],
    ["character-animated-popeye", "Popeye", "Popeye"],
    ["character-animated-garfield", "Garfield", "Garfield (character)"],
    ["character-animated-snoopy", "Snoopy", "Snoopy"],
    ["character-animated-charlie-brown", "Charlie Brown", "Charlie Brown"],
    ["character-animated-homer-simpson", "Homer Simpson", "Homer Simpson"],
    ["character-animated-bart-simpson", "Bart Simpson", "Bart Simpson"],
    ["character-animated-lisa-simpson", "Lisa Simpson", "Lisa Simpson"],
    ["character-animated-marge-simpson", "Marge Simpson", "Marge Simpson"],
    ["character-animated-stewie-griffin", "Stewie Griffin", "Stewie Griffin"],
    ["character-animated-peter-griffin", "Peter Griffin", "Peter Griffin"],
    ["character-animated-rick-sanchez", "Rick Sanchez", "Rick Sanchez"],
    ["character-animated-morty-smith", "Morty Smith", "Morty Smith"],
    ["character-animated-finn-the-human", "Finn the Human", "Finn the Human"],
    ["character-animated-jake-the-dog", "Jake the Dog", "Jake the Dog"],
    ["character-animated-gumball", "Gumball", "Gumball Watterson"],
    ["character-animated-darwin", "Darwin", "Darwin Watterson"],
    ["character-animated-ben-10", "Ben 10", "Ben Tennyson"],
    ["character-animated-blossom", "Blossom", "Blossom (The Powerpuff Girls)"],
    ["character-animated-bubbles", "Bubbles", "Bubbles (The Powerpuff Girls)"],
    ["character-animated-buttercup", "Buttercup", "Buttercup (The Powerpuff Girls)"],
    ["character-animated-dora-the-explorer", "Dora the Explorer", "Dora the Explorer (character)"],
    ["character-animated-peppa-pig", "Peppa Pig", "Peppa Pig (character)"],
    ["character-animated-bluey", "Bluey", "Bluey (2018 TV series)"],
    ["character-animated-shaun-the-sheep", "Shaun the Sheep", "Shaun the Sheep"],
    ["character-animated-wallace", "Wallace", "Wallace and Gromit"],
    ["character-animated-gromit", "Gromit", "Wallace and Gromit"],
    ["character-animated-thomas-the-tank-engine", "Thomas the Tank Engine", "Thomas the Tank Engine"],
    ["character-animated-bob-the-builder", "Bob the Builder", "Bob the Builder"],
    ["character-animated-postman-pat", "Postman Pat", "Postman Pat"]
  ]);

  addCharacterImages("film-characters", [
    ["character-film-harry-potter", "Harry Potter", "Harry Potter (character)"],
    ["character-film-hermione-granger", "Hermione Granger", "Hermione Granger"],
    ["character-film-ron-weasley", "Ron Weasley", "Ron Weasley"],
    ["character-film-albus-dumbledore", "Albus Dumbledore", "Albus Dumbledore"],
    ["character-film-rubeus-hagrid", "Rubeus Hagrid", "Rubeus Hagrid"],
    ["character-film-lord-voldemort", "Lord Voldemort", "Lord Voldemort"],
    ["character-film-dobby", "Dobby", "Dobby (Harry Potter)"],
    ["character-film-darth-vader", "Darth Vader", "Darth Vader"],
    ["character-film-luke-skywalker", "Luke Skywalker", "Luke Skywalker"],
    ["character-film-princess-leia", "Princess Leia", "Princess Leia"],
    ["character-film-han-solo", "Han Solo", "Han Solo"],
    ["character-film-yoda", "Yoda", "Yoda"],
    ["character-film-chewbacca", "Chewbacca", "Chewbacca"],
    ["character-film-r2-d2", "R2-D2", "R2-D2"],
    ["character-film-c-3po", "C-3PO", "C-3PO"],
    ["character-film-grogu", "Grogu", "Grogu"],
    ["character-film-the-mandalorian", "The Mandalorian", "The Mandalorian (character)"],
    ["character-film-indiana-jones", "Indiana Jones", "Indiana Jones (character)"],
    ["character-film-e-t", "E.T.", "E.T. the Extra-Terrestrial (character)"],
    ["character-film-marty-mcfly", "Marty McFly", "Marty McFly"],
    ["character-film-doc-brown", "Doc Brown", "Emmett Brown"],
    ["character-film-jack-sparrow", "Jack Sparrow", "Jack Sparrow"],
    ["character-film-willy-wonka", "Willy Wonka", "Willy Wonka"],
    ["character-film-james-bond", "James Bond", "James Bond"],
    ["character-film-mary-poppins", "Mary Poppins", "Mary Poppins (character)"],
    ["character-film-paddington-bear", "Paddington Bear", "Paddington Bear"],
    ["character-film-peter-pan", "Peter Pan", "Peter Pan"],
    ["character-film-tinker-bell", "Tinker Bell", "Tinker Bell"],
    ["character-film-alice", "Alice", "Alice (Alice's Adventures in Wonderland)"],
    ["character-film-mad-hatter", "Mad Hatter", "Hatter (Alice's Adventures in Wonderland)"],
    ["character-film-dorothy", "Dorothy", "Dorothy Gale"],
    ["character-film-the-scarecrow", "The Scarecrow", "Scarecrow (Oz)"],
    ["character-film-gandalf", "Gandalf", "Gandalf"],
    ["character-film-frodo-baggins", "Frodo Baggins", "Frodo Baggins"],
    ["character-film-gollum", "Gollum", "Gollum"],
    ["character-film-aragorn", "Aragorn", "Aragorn"],
    ["character-film-legolas", "Legolas", "Legolas"],
    ["character-film-neo", "Neo", "Neo (The Matrix)"],
    ["character-film-rocky-balboa", "Rocky Balboa", "Rocky Balboa"],
    ["character-film-daniel-larusso", "Daniel LaRusso", "Daniel LaRusso"],
    ["character-film-slimer", "Slimer", "Slimer"],
    ["character-film-barbie", "Barbie", "Barbie"],
    ["character-film-ken", "Ken", "Ken (doll)"],
    ["character-film-emmet", "Emmet", "Emmet (The Lego Movie)"],
    ["character-film-batman", "Batman", "Batman"],
    ["character-film-superman", "Superman", "Superman"],
    ["character-film-wonder-woman", "Wonder Woman", "Wonder Woman"],
    ["character-film-the-joker", "The Joker", "Joker (character)"],
    ["character-film-harley-quinn", "Harley Quinn", "Harley Quinn"],
    ["character-film-spider-man", "Spider-Man", "Spider-Man"],
    ["character-film-iron-man", "Iron Man", "Iron Man"],
    ["character-film-captain-america", "Captain America", "Captain America"],
    ["character-film-hulk", "Hulk", "Hulk"],
    ["character-film-thor", "Thor", "Thor (Marvel Comics)"],
    ["character-film-black-panther", "Black Panther", "Black Panther (character)"],
    ["character-film-doctor-strange", "Doctor Strange", "Doctor Strange"],
    ["character-film-groot", "Groot", "Groot"],
    ["character-film-rocket-raccoon", "Rocket Raccoon", "Rocket Raccoon"],
    ["character-film-star-lord", "Star-Lord", "Star-Lord"],
    ["character-film-thanos", "Thanos", "Thanos"],
    ["character-film-wolverine", "Wolverine", "Wolverine (character)"],
    ["character-film-storm", "Storm", "Storm (Marvel Comics)"],
    ["character-film-shuri", "Shuri", "Shuri (character)"],
    ["character-film-ant-man", "Ant-Man", "Ant-Man"],
    ["character-film-aquaman", "Aquaman", "Aquaman"],
    ["character-film-shazam", "Shazam", "Captain Marvel (DC Comics)"],
    ["character-film-optimus-prime", "Optimus Prime", "Optimus Prime"],
    ["character-film-bumblebee", "Bumblebee", "Bumblebee (Transformers)"],
    ["character-film-katniss-everdeen", "Katniss Everdeen", "Katniss Everdeen"],
    ["character-film-lara-jean", "Lara Jean", "Lara Jean Covey"],
    ["character-film-matilda", "Matilda", "Matilda Wormwood"],
    ["character-film-the-grinch", "The Grinch", "Grinch"],
    ["character-film-kevin-mccallister", "Kevin McCallister", "Kevin McCallister"],
    ["character-film-forrest-gump", "Forrest Gump", "Forrest Gump (character)"],
    ["character-film-mrs-doubtfire", "Mrs Doubtfire", "Mrs. Doubtfire"],
    ["character-film-ace-ventura", "Ace Ventura", "Ace Ventura"],
    ["character-film-the-mask", "The Mask", "The Mask (comics)"],
    ["character-film-buddy-the-elf", "Buddy the Elf", "Elf (film)"]
  ]);

  addCharacterImages("television-characters", [
    ["character-tv-the-doctor", "The Doctor", "The Doctor (Doctor Who)"],
    ["character-tv-dalek", "Dalek", "Dalek"],
    ["character-tv-cyberman", "Cyberman", "Cyberman"],
    ["character-tv-sherlock-holmes", "Sherlock Holmes", "Sherlock Holmes"],
    ["character-tv-john-watson", "John Watson", "Dr. Watson"],
    ["character-tv-wednesday-addams", "Wednesday Addams", "Wednesday Addams"],
    ["character-tv-eleven", "Eleven", "Eleven (Stranger Things)"],
    ["character-tv-jim-hopper", "Jim Hopper", "Jim Hopper (Stranger Things)"],
    ["character-tv-steve-harrington", "Steve Harrington", "Steve Harrington"],
    ["character-tv-mr-bean", "Mr Bean", "Mr. Bean (character)"],
    ["character-tv-del-boy", "Del Boy", "Del Boy"],
    ["character-tv-rodney-trotter", "Rodney Trotter", "Rodney Trotter"],
    ["character-tv-basil-fawlty", "Basil Fawlty", "Basil Fawlty"],
    ["character-tv-david-brent", "David Brent", "David Brent"],
    ["character-tv-sheldon-cooper", "Sheldon Cooper", "Sheldon Cooper"],
    ["character-tv-penny", "Penny", "Penny (The Big Bang Theory)"],
    ["character-tv-rachel-green", "Rachel Green", "Rachel Green"],
    ["character-tv-ross-geller", "Ross Geller", "Ross Geller"],
    ["character-tv-joey-tribbiani", "Joey Tribbiani", "Joey Tribbiani"],
    ["character-tv-monica-geller", "Monica Geller", "Monica Geller"],
    ["character-tv-chandler-bing", "Chandler Bing", "Chandler Bing"],
    ["character-tv-phoebe-buffay", "Phoebe Buffay", "Phoebe Buffay"],
    ["character-tv-jake-peralta", "Jake Peralta", "Jake Peralta"],
    ["character-tv-captain-holt", "Captain Holt", "Raymond Holt"],
    ["character-tv-michael-scott", "Michael Scott", "Michael Scott (The Office)"],
    ["character-tv-dwight-schrute", "Dwight Schrute", "Dwight Schrute"],
    ["character-tv-leslie-knope", "Leslie Knope", "Leslie Knope"],
    ["character-tv-ron-swanson", "Ron Swanson", "Ron Swanson"],
    ["character-tv-ted-lasso", "Ted Lasso", "Ted Lasso (character)"],
    ["character-tv-will-smith", "Will Smith", "The Fresh Prince of Bel-Air"],
    ["character-tv-spock", "Spock", "Spock"],
    ["character-tv-captain-kirk", "Captain Kirk", "James T. Kirk"],
    ["character-tv-jean-luc-picard", "Jean-Luc Picard", "Jean-Luc Picard"],
    ["character-tv-kermit-the-frog", "Kermit the Frog", "Kermit the Frog"],
    ["character-tv-miss-piggy", "Miss Piggy", "Miss Piggy"],
    ["character-tv-elmo", "Elmo", "Elmo"],
    ["character-tv-cookie-monster", "Cookie Monster", "Cookie Monster"],
    ["character-tv-big-bird", "Big Bird", "Big Bird"],
    ["character-tv-oscar-the-grouch", "Oscar the Grouch", "Oscar the Grouch"],
    ["character-tv-mr-blobby", "Mr Blobby", "Mr Blobby"],
    ["character-tv-anne-robinson", "Anne Robinson", "The Weakest Link"],
    ["character-tv-the-stig", "The Stig", "The Stig"],
    ["character-tv-ant-and-dec", "Ant and Dec", "Ant & Dec"],
    ["character-tv-doctor-who-weeping-angel", "Doctor Who Weeping Angel", "Weeping Angel"],
    ["character-tv-the-teletubbies", "The Teletubbies", "Teletubbies"],
    ["character-tv-tinky-winky", "Tinky Winky", "Tinky Winky"],
    ["character-tv-pingu", "Pingu", "Pingu"],
    ["character-tv-mr-tumble", "Mr Tumble", "Justin Fletcher"],
    ["character-tv-fireman-sam", "Fireman Sam", "Fireman Sam"],
    ["character-tv-danger-mouse", "Danger Mouse", "Danger Mouse (1981 TV series)"],
    ["character-tv-count-duckula", "Count Duckula", "Count Duckula"],
    ["character-tv-bagpuss", "Bagpuss", "Bagpuss"],
    ["character-tv-sooty", "Sooty", "Sooty"],
    ["character-tv-basil-brush", "Basil Brush", "Basil Brush"]
  ]);

  addCharacterImages("video-game-characters", [
    ["character-game-mario", "Mario", "Mario"],
    ["character-game-luigi", "Luigi", "Luigi"],
    ["character-game-princess-peach", "Princess Peach", "Princess Peach"],
    ["character-game-bowser", "Bowser", "Bowser"],
    ["character-game-yoshi", "Yoshi", "Yoshi"],
    ["character-game-toad", "Toad", "Toad (Nintendo)"],
    ["character-game-wario", "Wario", "Wario"],
    ["character-game-waluigi", "Waluigi", "Waluigi"],
    ["character-game-donkey-kong", "Donkey Kong", "Donkey Kong (character)"],
    ["character-game-diddy-kong", "Diddy Kong", "Diddy Kong"],
    ["character-game-rosalina", "Rosalina", "Rosalina (Mario)"],
    ["character-game-link", "Link", "Link (The Legend of Zelda)"],
    ["character-game-princess-zelda", "Princess Zelda", "Princess Zelda"],
    ["character-game-ganondorf", "Ganondorf", "Ganon"],
    ["character-game-kirby", "Kirby", "Kirby (character)"],
    ["character-game-samus-aran", "Samus Aran", "Samus Aran"],
    ["character-game-fox-mccloud", "Fox McCloud", "Fox McCloud"],
    ["character-game-pikachu", "Pikachu", "Pikachu"],
    ["character-game-charizard", "Charizard", "Charizard"],
    ["character-game-eevee", "Eevee", "Eevee"],
    ["character-game-mewtwo", "Mewtwo", "Mewtwo"],
    ["character-game-jigglypuff", "Jigglypuff", "Jigglypuff"],
    ["character-game-snorlax", "Snorlax", "Snorlax"],
    ["character-game-psyduck", "Psyduck", "Psyduck"],
    ["character-game-meowth", "Meowth", "Meowth"],
    ["character-game-sonic", "Sonic", "Sonic the Hedgehog"],
    ["character-game-tails", "Tails", "Tails (Sonic the Hedgehog)"],
    ["character-game-knuckles", "Knuckles", "Knuckles the Echidna"],
    ["character-game-shadow", "Shadow", "Shadow the Hedgehog"],
    ["character-game-amy-rose", "Amy Rose", "Amy Rose"],
    ["character-game-dr-eggman", "Dr. Eggman", "Doctor Eggman"],
    ["character-game-crash-bandicoot", "Crash Bandicoot", "Crash Bandicoot (character)"],
    ["character-game-coco-bandicoot", "Coco Bandicoot", "Coco Bandicoot"],
    ["character-game-spyro", "Spyro", "Spyro (character)"],
    ["character-game-lara-croft", "Lara Croft", "Lara Croft"],
    ["character-game-master-chief", "Master Chief", "Master Chief (Halo)"],
    ["character-game-steve", "Steve", "Steve (Minecraft)"],
    ["character-game-alex", "Alex", "Alex (Minecraft)"],
    ["character-game-creeper", "Creeper", "Creeper (Minecraft)"],
    ["character-game-enderman", "Enderman", "Enderman"],
    ["character-game-sackboy", "Sackboy", "Sackboy"],
    ["character-game-aloy", "Aloy", "Aloy"],
    ["character-game-jonesy", "Jonesy", "Jonesy (Fortnite)"],
    ["character-game-peely", "Peely", "Peely"],
    ["character-game-among-us-crewmate", "Among Us Crewmate", "Among Us"],
    ["character-game-pac-man", "Pac-Man", "Pac-Man (character)"],
    ["character-game-ms-pac-man", "Ms. Pac-Man", "Ms. Pac-Man"],
    ["character-game-mega-man", "Mega Man", "Mega Man (character)"],
    ["character-game-ryu", "Ryu", "Ryu (Street Fighter)"],
    ["character-game-chun-li", "Chun-Li", "Chun-Li"],
    ["character-game-cloud-strife", "Cloud Strife", "Cloud Strife"],
    ["character-game-sephiroth", "Sephiroth", "Sephiroth (Final Fantasy)"],
    ["character-game-sora", "Sora", "Sora (Kingdom Hearts)"],
    ["character-game-ratchet", "Ratchet", "Ratchet (Ratchet & Clank)"],
    ["character-game-clank", "Clank", "Clank (Ratchet & Clank)"],
    ["character-game-jak", "Jak", "Jak (Jak and Daxter)"],
    ["character-game-daxter", "Daxter", "Daxter (Jak and Daxter)"],
    ["character-game-rayman", "Rayman", "Rayman (character)"],
    ["character-game-banjo", "Banjo", "Banjo (character)"],
    ["character-game-kazooie", "Kazooie", "Kazooie"],
    ["character-game-cuphead", "Cuphead", "Cuphead (character)"],
    ["character-game-mugman", "Mugman", "Cuphead"],
    ["character-game-shovel-knight", "Shovel Knight", "Shovel Knight (character)"],
    ["character-game-the-knight", "The Knight", "Hollow Knight (video game)"],
    ["character-game-sans", "Sans", "Sans (Undertale)"],
    ["character-game-papyrus", "Papyrus", "Papyrus (Undertale)"],
    ["character-game-freddy-fazbear", "Freddy Fazbear", "Freddy Fazbear"],
    ["character-game-isabelle", "Isabelle", "Isabelle (Animal Crossing)"],
    ["character-game-tom-nook", "Tom Nook", "Tom Nook"],
    ["character-game-villager", "Villager", "Villager (Animal Crossing)"],
    ["character-game-inkling", "Inkling", "Inkling (Splatoon)"],
    ["character-game-captain-olimar", "Captain Olimar", "Captain Olimar"],
    ["character-game-captain-falcon", "Captain Falcon", "Captain Falcon"],
    ["character-game-solid-snake", "Solid Snake", "Solid Snake"],
    ["character-game-ezio-auditore", "Ezio Auditore", "Ezio Auditore da Firenze"],
    ["character-game-professor-layton", "Professor Layton", "Professor Layton"],
    ["character-game-phoenix-wright", "Phoenix Wright", "Phoenix Wright"],
    ["character-game-guybrush-threepwood", "Guybrush Threepwood", "Guybrush Threepwood"],
    ["character-game-red-bird", "Red Bird", "Red (Angry Birds)"],
    ["character-game-king-pig", "King Pig", "King Pig"],
    ["character-game-peashooter", "Peashooter", "Plants vs. Zombies"],
    ["character-game-crazy-dave", "Crazy Dave", "Crazy Dave"],
    ["character-game-fall-guy", "Fall Guy", "Fall Guys"],
    ["character-game-roblox-noob", "Roblox Noob", "Roblox"],
    ["character-game-little-mac", "Little Mac", "Little Mac"],
    ["character-game-princess-daisy", "Princess Daisy", "Princess Daisy"],
    ["character-game-king-dedede", "King Dedede", "King Dedede"],
    ["character-game-meta-knight", "Meta Knight", "Meta Knight"],
    ["character-game-midna", "Midna", "Midna"],
    ["character-game-tingle", "Tingle", "Tingle (The Legend of Zelda)"],
    ["character-game-mii", "Mii", "Mii"],
    ["character-game-pyramid-head", "Pyramid Head", "Pyramid Head"],
    ["character-game-chocobo", "Chocobo", "Chocobo"],
    ["character-game-moogle", "Moogle", "Moogle"],
    ["character-game-tifa-lockhart", "Tifa Lockhart", "Tifa Lockhart"],
    ["character-game-aerith-gainsborough", "Aerith Gainsborough", "Aerith Gainsborough"],
    ["character-game-jin-kazama", "Jin Kazama", "Jin Kazama"],
    ["character-game-heihachi", "Heihachi", "Heihachi Mishima"]
  ]);

  addCharacterImages("anime-characters", [
    ["character-anime-ash-ketchum", "Ash Ketchum", "Ash Ketchum"],
    ["character-anime-naruto", "Naruto", "Naruto Uzumaki"],
    ["character-anime-sasuke", "Sasuke", "Sasuke Uchiha"],
    ["character-anime-sakura", "Sakura", "Sakura Haruno"],
    ["character-anime-kakashi", "Kakashi", "Kakashi Hatake"],
    ["character-anime-goku", "Goku", "Goku"],
    ["character-anime-vegeta", "Vegeta", "Vegeta"],
    ["character-anime-gohan", "Gohan", "Gohan"],
    ["character-anime-frieza", "Frieza", "Frieza"],
    ["character-anime-sailor-moon", "Sailor Moon", "Sailor Moon (character)"],
    ["character-anime-totoro", "Totoro", "My Neighbor Totoro"],
    ["character-anime-no-face", "No-Face", "No-Face"],
    ["character-anime-kiki", "Kiki", "Kiki's Delivery Service"],
    ["character-anime-ponyo", "Ponyo", "Ponyo (character)"],
    ["character-anime-luffy", "Luffy", "Monkey D. Luffy"],
    ["character-anime-zoro", "Zoro", "Roronoa Zoro"],
    ["character-anime-nami", "Nami", "Nami (One Piece)"],
    ["character-anime-tony-tony-chopper", "Tony Tony Chopper", "Tony Tony Chopper"],
    ["character-anime-tanjiro", "Tanjiro", "Tanjiro Kamado"],
    ["character-anime-nezuko", "Nezuko", "Nezuko Kamado"],
    ["character-anime-zenitsu", "Zenitsu", "Zenitsu Agatsuma"],
    ["character-anime-gojo", "Gojo", "Satoru Gojo"],
    ["character-anime-yuji-itadori", "Yuji Itadori", "Yuji Itadori"],
    ["character-anime-deku", "Deku", "Izuku Midoriya"],
    ["character-anime-bakugo", "Bakugo", "Katsuki Bakugo"],
    ["character-anime-all-might", "All Might", "All Might"],
    ["character-anime-saitama", "Saitama", "Saitama (One-Punch Man)"],
    ["character-anime-genos", "Genos", "Genos"],
    ["character-anime-edward-elric", "Edward Elric", "Edward Elric"],
    ["character-anime-alphonse-elric", "Alphonse Elric", "Alphonse Elric"],
    ["character-anime-light-yagami", "Light Yagami", "Light Yagami"],
    ["character-anime-l", "L", "L (Death Note)"],
    ["character-anime-anya-forger", "Anya Forger", "Anya Forger"],
    ["character-anime-loid-forger", "Loid Forger", "Loid Forger"],
    ["character-anime-yor-forger", "Yor Forger", "Yor Forger"],
    ["character-anime-doraemon", "Doraemon", "Doraemon (character)"],
    ["character-anime-astro-boy", "Astro Boy", "Astro Boy (character)"],
    ["character-anime-hatsune-miku", "Hatsune Miku", "Hatsune Miku"],
    ["character-anime-inuyasha", "Inuyasha", "Inuyasha (character)"],
    ["character-anime-kagome", "Kagome", "Kagome Higurashi"],
    ["character-anime-ichigo-kurosaki", "Ichigo Kurosaki", "Ichigo Kurosaki"],
    ["character-anime-rukia-kuchiki", "Rukia Kuchiki", "Rukia Kuchiki"],
    ["character-anime-gon-freecss", "Gon Freecss", "Gon Freecss"],
    ["character-anime-killua-zoldyck", "Killua Zoldyck", "Killua Zoldyck"],
    ["character-anime-jotaro-kujo", "Jotaro Kujo", "Jotaro Kujo"],
    ["character-anime-dio-brando", "Dio Brando", "Dio Brando"],
    ["character-anime-spike-spiegel", "Spike Spiegel", "Spike Spiegel"],
    ["character-anime-sakura-kinomoto", "Sakura Kinomoto", "Sakura Kinomoto"],
    ["character-anime-conan-edogawa", "Conan Edogawa", "Jimmy Kudo"]
  ]);

  addCharacterImages("icons-and-mascots", [
    ["character-icon-hello-kitty", "Hello Kitty", "Hello Kitty"],
    ["character-icon-my-melody", "My Melody", "My Melody"],
    ["character-icon-kuromi", "Kuromi", "Kuromi"],
    ["character-icon-cinnamoroll", "Cinnamoroll", "Cinnamoroll"],
    ["character-icon-gudetama", "Gudetama", "Gudetama"],
    ["character-icon-keroppi", "Keroppi", "Keroppi"],
    ["character-icon-pompompurin", "Pompompurin", "Pompompurin"],
    ["character-icon-winnie-the-pooh", "Winnie-the-Pooh", "Winnie-the-Pooh"],
    ["character-icon-tigger", "Tigger", "Tigger"],
    ["character-icon-eeyore", "Eeyore", "Eeyore"],
    ["character-icon-piglet", "Piglet", "Piglet (Winnie-the-Pooh)"],
    ["character-icon-peter-rabbit", "Peter Rabbit", "Peter Rabbit"],
    ["character-icon-miffy", "Miffy", "Miffy"],
    ["character-icon-curious-george", "Curious George", "Curious George"],
    ["character-icon-the-gruffalo", "The Gruffalo", "The Gruffalo"],
    ["character-icon-the-very-hungry-caterpillar", "The Very Hungry Caterpillar", "The Very Hungry Caterpillar"],
    ["character-icon-where-s-wally", "Where's Wally", "Where's Wally?"],
    ["character-icon-mr-happy", "Mr. Happy", "Mr. Men"],
    ["character-icon-little-miss-sunshine", "Little Miss Sunshine", "Little Miss Sunshine (Mr. Men)"],
    ["character-icon-michelin-man", "Michelin Man", "Michelin Man"],
    ["character-icon-monopoly-man", "Monopoly Man", "Rich Uncle Pennybags"],
    ["character-icon-pringles-man", "Pringles Man", "Julius Pringles"],
    ["character-icon-duolingo-owl", "Duolingo Owl", "Duolingo"],
    ["character-icon-android-robot", "Android Robot", "Android (operating system)"],
    ["character-icon-kool-aid-man", "Kool-Aid Man", "Kool-Aid Man"],
    ["character-icon-tony-the-tiger", "Tony the Tiger", "Tony the Tiger"],
    ["character-icon-chester-cheetah", "Chester Cheetah", "Chester Cheetah"],
    ["character-icon-m-and-m-s-characters", "M&M's Characters", "M&M's"],
    ["character-icon-pudsey-bear", "Pudsey Bear", "Pudsey Bear"],
    ["character-icon-children-in-need-blush-bear", "Children in Need Blush Bear", "Children in Need"],
    ["character-icon-the-snowman", "The Snowman", "The Snowman"],
    ["character-icon-mr-bump", "Mr. Bump", "Mr. Men"],
    ["character-icon-little-miss-naughty", "Little Miss Naughty", "Mr. Men"],
    ["character-icon-mr-strong", "Mr. Strong", "Mr. Men"],
    ["character-icon-rilakkuma", "Rilakkuma", "Rilakkuma"],
    ["character-icon-pusheen", "Pusheen", "Pusheen"],
    ["character-icon-nyan-cat", "Nyan Cat", "Nyan Cat"],
    ["character-icon-domo", "Domo", "Domo (NHK)"],
    ["character-icon-moomintroll", "Moomintroll", "Moomins"],
    ["character-icon-babar", "Babar", "Babar the Elephant"],
    ["character-icon-spot-the-dog", "Spot the Dog", "Spot (franchise)"],
    ["character-icon-elmer-the-elephant", "Elmer the Elephant", "Elmer the Patchwork Elephant"],
    ["character-icon-maisy-mouse", "Maisy Mouse", "Maisy"],
    ["character-icon-mog-the-cat", "Mog the Cat", "Mog (Judith Kerr)"],
    ["character-icon-the-cat-in-the-hat", "The Cat in the Hat", "The Cat in the Hat"],
    ["character-icon-the-lorax", "The Lorax", "The Lorax"],
    ["character-icon-captain-underpants", "Captain Underpants", "Captain Underpants"],
    ["character-icon-dog-man", "Dog Man", "Dog Man"]
  ]);

  addColours([
    ["colour-red", "red", "#e52521"],
    ["colour-orange", "orange", "#f47c20"],
    ["colour-yellow", "yellow", "#ffd928"],
    ["colour-lime", "lime", "#9be21b"],
    ["colour-green", "green", "#1fa64a"],
    ["colour-turquoise", "turquoise", "#25cbbd"],
    ["colour-cyan", "cyan", "#22d3ee"],
    ["colour-blue", "blue", "#2563eb"],
    ["colour-navy", "navy", "#172554"],
    ["colour-purple", "purple", "#7e22ce"],
    ["colour-violet", "violet", "#8b5cf6"],
    ["colour-pink", "pink", "#ec4899"],
    ["colour-magenta", "magenta", "#d100b7"],
    ["colour-brown", "brown", "#7c4a2d"],
    ["colour-black", "black", "#090909"],
    ["colour-white", "white", "#ffffff"],
    ["colour-grey", "grey", "#7b8494"],
    ["colour-gold", "gold", "#d4a514"],
    ["colour-silver", "silver", "#b9c0c9"],
    ["colour-beige", "beige", "#d8c7a5"]
  ]);

  addImages("foods", "foods", [
    ["food-pizza", "pizza", "Pizza"],
    ["food-hamburger", "hamburger", "Hamburger"],
    ["food-sushi", "sushi", "Sushi"],
    ["food-taco", "taco", "Taco"],
    ["food-spaghetti", "spaghetti", "Spaghetti"],
    ["food-pancake", "pancake", "Pancake"],
    ["food-popcorn", "popcorn", "Popcorn"],
    ["food-croissant", "croissant", "Croissant"],
    ["food-ice-cream", "ice cream", "Ice cream"],
    ["food-chocolate", "chocolate", "Chocolate"],
    ["food-doughnut", "doughnut", "Doughnut"],
    ["food-apple", "apple", "Apple"],
    ["food-banana", "banana", "Banana"],
    ["food-watermelon", "watermelon", "Watermelon"],
    ["food-fish-and-chips", "fish and chips", "Fish and chips"],
    ["food-curry", "curry", "Curry"],
    ["food-ramen", "ramen", "Ramen"],
    ["food-noodles", "noodles", "Noodle"],
    ["food-fried-rice", "fried rice", "Fried rice"],
    ["food-paella", "paella", "Paella"],
    ["food-lasagna", "lasagna", "Lasagna"],
    ["food-steak", "steak", "Steak"],
    ["food-roast-chicken", "roast chicken", "Roast chicken"],
    ["food-sausage", "sausage", "Sausage"],
    ["food-bacon", "bacon", "Bacon"],
    ["food-sandwich", "sandwich", "Sandwich"],
    ["food-toast", "toast", "Toast (food)"],
    ["food-breakfast-cereal", "cereal", "Breakfast cereal"],
    ["food-waffle", "waffle", "Waffle"],
    ["food-muffin", "muffin", "Muffin"],
    ["food-cupcake", "cupcake", "Cupcake"],
    ["food-cheesecake", "cheesecake", "Cheesecake"],
    ["food-brownie", "brownie", "Chocolate brownie"],
    ["food-cookie", "cookie", "Cookie"],
    ["food-crisps", "crisps", "Potato chip"],
    ["food-fries", "chips", "French fries"],
    ["food-salad", "salad", "Salad"],
    ["food-soup", "soup", "Soup"],
    ["food-avocado", "avocado", "Avocado"],
    ["food-strawberry", "strawberry", "Strawberry"],
    ["food-pineapple", "pineapple", "Pineapple"],
    ["food-grapes", "grapes", "Grape"],
    ["food-orange", "orange", "Orange (fruit)"],
    ["food-pear", "pear", "Pear"],
    ["food-carrot", "carrot", "Carrot"],
    ["food-broccoli", "broccoli", "Broccoli"],
    ["food-cheese", "cheese", "Cheese"]
  ]);

  addFlags([
    ["flag-uk", "United Kingdom", "gb"],
    ["flag-usa", "United States", "us"],
    ["flag-france", "France", "fr"],
    ["flag-germany", "Germany", "de"],
    ["flag-italy", "Italy", "it"],
    ["flag-spain", "Spain", "es"],
    ["flag-japan", "Japan", "jp"],
    ["flag-china", "China", "cn"],
    ["flag-india", "India", "in"],
    ["flag-brazil", "Brazil", "br"],
    ["flag-canada", "Canada", "ca"],
    ["flag-australia", "Australia", "au"],
    ["flag-south-africa", "South Africa", "za"],
    ["flag-ireland", "Ireland", "ie"],
    ["flag-south-korea", "South Korea", "kr"]
  ]);

  addImages("sports", "sports", [
    ["sport-football", "football", "Association football"],
    ["sport-basketball", "basketball", "Basketball"],
    ["sport-rugby", "rugby", "Rugby union"],
    ["sport-cricket", "cricket", "Cricket"],
    ["sport-volleyball", "volleyball", "Volleyball"],
    ["sport-tennis", "tennis", "Tennis"],
    ["sport-golf", "golf", "Golf"],
    ["sport-swimming", "swimming", "Swimming (sport)"],
    ["sport-boxing", "boxing", "Boxing"],
    ["sport-badminton", "badminton", "Badminton"],
    ["sport-gymnastics", "gymnastics", "Gymnastics"],
    ["sport-baseball", "baseball", "Baseball"],
    ["sport-field-hockey", "hockey", "Field hockey"],
    ["sport-ice-hockey", "ice hockey", "Ice hockey"],
    ["sport-table-tennis", "table tennis", "Table tennis"],
    ["sport-athletics", "athletics", "Sport of athletics"],
    ["sport-cycling", "cycling", "Cycle sport"],
    ["sport-skiing", "skiing", "Skiing"],
    ["sport-snowboarding", "snowboarding", "Snowboarding"],
    ["sport-surfing", "surfing", "Surfing"],
    ["sport-skateboarding", "skateboarding", "Skateboarding"],
    ["sport-archery", "archery", "Archery"]
  ]);

  addImages("objects", "objects", [
    ["object-smartphone", "smartphone", "Smartphone"],
    ["object-laptop", "laptop", "Laptop"],
    ["object-camera", "camera", "Camera"],
    ["object-headphones", "headphones", "Headphones"],
    ["object-television", "television", "Television"],
    ["object-bicycle", "bicycle", "Bicycle"],
    ["object-umbrella", "umbrella", "Umbrella"],
    ["object-alarm-clock", "alarm clock", "Alarm clock"],
    ["object-backpack", "backpack", "Backpack"],
    ["object-guitar", "guitar", "Guitar"],
    ["object-key", "key", "Key (lock)"],
    ["object-toothbrush", "toothbrush", "Toothbrush"],
    ["object-watch", "watch", "Watch"],
    ["object-glasses", "glasses", "Glasses"],
    ["object-scissors", "scissors", "Scissors"],
    ["object-pencil", "pencil", "Pencil"],
    ["object-calculator", "calculator", "Calculator"],
    ["object-keyboard", "keyboard", "Computer keyboard"],
    ["object-computer-mouse", "computer mouse", "Computer mouse"],
    ["object-game-controller", "game controller", "Game controller"],
    ["object-microwave", "microwave", "Microwave oven"],
    ["object-toaster", "toaster", "Toaster"],
    ["object-kettle", "kettle", "Kettle"],
    ["object-fridge", "fridge", "Refrigerator"],
    ["object-washing-machine", "washing machine", "Washing machine"],
    ["object-vacuum-cleaner", "vacuum cleaner", "Vacuum cleaner"],
    ["object-chair", "chair", "Chair"],
    ["object-table", "table", "Table (furniture)"],
    ["object-lamp", "lamp", "Lamp"],
    ["object-mirror", "mirror", "Mirror"],
    ["object-suitcase", "suitcase", "Suitcase"],
    ["object-skateboard", "skateboard", "Skateboard"]
  ]);

  const ITEM_BY_ID = new Map(ITEMS.map((entry) => [entry.id, entry]));
  const RECOGNISABILITY = { medium: 1, high: 2, "very-high": 3 };
  const DIFFICULTY = { easy: 1, medium: 2, hard: 3 };

  const SVG_RENDERERS = {
    triangle: () => polygonSvg(3, -90),
    square: () => polygonSvg(4, -45),
    rectangle: () => svg('<rect x="24" y="50" width="152" height="100" rx="3"/>'),
    circle: () => svg('<circle cx="100" cy="100" r="72"/>'),
    semicircle: () => svg('<path d="M24 116 A76 76 0 0 1 176 116 L24 116 Z"/>'),
    pentagon: () => polygonSvg(5, -90),
    hexagon: () => polygonSvg(6, -90),
    octagon: () => polygonSvg(8, -22.5),
    parallelogram: () => svg('<polygon points="50,44 174,44 146,156 22,156"/>'),
    rhombus: () => svg('<polygon points="100,38 178,100 100,162 22,100"/>'),
    trapezium: () => svg('<polygon points="58,42 142,42 178,158 22,158"/>'),
    kite: () => svg('<polygon points="100,18 158,82 100,182 42,82"/>'),
    cube: () => svg('<polygon points="54,58 128,36 164,66 88,90"/><polygon points="54,58 88,90 88,164 54,132"/><polygon points="88,90 164,66 164,140 88,164"/>'),
    cuboid: () => svg('<polygon points="34,68 128,42 170,70 76,98"/><polygon points="34,68 76,98 76,154 34,124"/><polygon points="76,98 170,70 170,126 76,154"/>'),
    sphere: () => svg('<circle cx="100" cy="100" r="72"/><ellipse cx="100" cy="100" rx="72" ry="24" fill="none"/><path d="M100 28 C72 48 72 152 100 172" fill="none"/><path d="M100 28 C128 48 128 152 100 172" fill="none"/>'),
    cylinder: () => svg('<ellipse cx="100" cy="45" rx="62" ry="24"/><path d="M38 45 V148" fill="none"/><path d="M162 45 V148" fill="none"/><ellipse cx="100" cy="148" rx="62" ry="24"/>'),
    cone: () => svg('<path d="M100 24 L38 150" fill="none"/><path d="M100 24 L162 150" fill="none"/><ellipse cx="100" cy="150" rx="62" ry="23"/>'),
    "triangular-prism": () => svg('<polygon points="38,142 76,68 114,142"/><polygon points="86,112 124,38 162,112"/><path d="M38 142 L86 112 M76 68 L124 38 M114 142 L162 112" fill="none"/>'),
    "square-pyramid": () => svg('<polygon points="42,136 104,166 162,132 100,108"/><path d="M100 24 L42 136 M100 24 L104 166 M100 24 L162 132 M100 24 L100 108" fill="none"/>'),
    tetrahedron: () => svg('<polygon points="100,24 36,158 164,158"/><path d="M100 24 L100 118 M36 158 L100 118 M164 158 L100 118" fill="none"/>')
  };

  function svg(content) {
    return `<svg viewBox="0 0 200 200" role="img" aria-hidden="true"><g fill="rgba(255,255,255,.12)" stroke="currentColor" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">${content}</g></svg>`;
  }

  function polygonSvg(sides, rotation) {
    const points = [];
    for (let index = 0; index < sides; index++) {
      const angle = (rotation + index * 360 / sides) * Math.PI / 180;
      points.push(`${100 + 78 * Math.cos(angle)},${100 + 78 * Math.sin(angle)}`);
    }
    return svg(`<polygon points="${points.join(" ")}"/>`);
  }

  function getFlagMarkup(itemOrCode) {
    const code = typeof itemOrCode === "string"
      ? itemOrCode
      : itemOrCode?.flagCode;

    const content = getFlagContent(code);

    if (!content) {
      return "";
    }

    return (
      '<svg class="clue-item-flag-svg" ' +
      'viewBox="0 0 60 40" role="img" ' +
      'aria-hidden="true" preserveAspectRatio="xMidYMid meet">' +
      content +
      '<rect x="0.75" y="0.75" width="58.5" height="38.5" ' +
      'rx="1.5" fill="none" stroke="rgba(0,0,0,.38)" ' +
      'stroke-width="1.5"/>' +
      '</svg>'
    );
  }

  function getFlagContent(code) {
    switch (code) {
      case "gb":
        return (
          '<rect width="60" height="40" fill="#012169"/>' +
          '<path d="M0 0 L60 40 M60 0 L0 40" ' +
          'stroke="#ffffff" stroke-width="9"/>' +
          '<path d="M0 0 L60 40 M60 0 L0 40" ' +
          'stroke="#c8102e" stroke-width="4"/>' +
          '<path d="M30 0 V40 M0 20 H60" ' +
          'stroke="#ffffff" stroke-width="12"/>' +
          '<path d="M30 0 V40 M0 20 H60" ' +
          'stroke="#c8102e" stroke-width="6"/>'
        );

      case "us":
        return usaFlagContent();

      case "fr":
        return (
          '<rect width="20" height="40" x="0" fill="#0055a4"/>' +
          '<rect width="20" height="40" x="20" fill="#ffffff"/>' +
          '<rect width="20" height="40" x="40" fill="#ef4135"/>'
        );

      case "de":
        return (
          '<rect width="60" height="13.34" y="0" fill="#000000"/>' +
          '<rect width="60" height="13.34" y="13.33" fill="#dd0000"/>' +
          '<rect width="60" height="13.34" y="26.66" fill="#ffce00"/>'
        );

      case "it":
        return (
          '<rect width="20" height="40" x="0" fill="#009246"/>' +
          '<rect width="20" height="40" x="20" fill="#ffffff"/>' +
          '<rect width="20" height="40" x="40" fill="#ce2b37"/>'
        );

      case "ie":
        return (
          '<rect width="20" height="40" x="0" fill="#169b62"/>' +
          '<rect width="20" height="40" x="20" fill="#ffffff"/>' +
          '<rect width="20" height="40" x="40" fill="#ff883e"/>'
        );

      case "es":
        return (
          '<rect width="60" height="10" y="0" fill="#aa151b"/>' +
          '<rect width="60" height="20" y="10" fill="#f1bf00"/>' +
          '<rect width="60" height="10" y="30" fill="#aa151b"/>' +
          '<rect x="17" y="15" width="3" height="10" fill="#aa151b"/>'
        );

      case "jp":
        return (
          '<rect width="60" height="40" fill="#ffffff"/>' +
          '<circle cx="30" cy="20" r="10.5" fill="#bc002d"/>'
        );

      case "cn":
        return (
          '<rect width="60" height="40" fill="#de2910"/>' +
          `<polygon points="${starPoints(12, 11, 6.1, 2.5)}" fill="#ffde00"/>` +
          `<polygon points="${starPoints(23, 5.8, 2.6, 1.05)}" fill="#ffde00"/>` +
          `<polygon points="${starPoints(28, 11, 2.6, 1.05)}" fill="#ffde00"/>` +
          `<polygon points="${starPoints(27, 18, 2.6, 1.05)}" fill="#ffde00"/>` +
          `<polygon points="${starPoints(21.5, 23, 2.6, 1.05)}" fill="#ffde00"/>`
        );

      case "in":
        return (
          '<rect width="60" height="13.34" y="0" fill="#ff9933"/>' +
          '<rect width="60" height="13.34" y="13.33" fill="#ffffff"/>' +
          '<rect width="60" height="13.34" y="26.66" fill="#138808"/>' +
          '<circle cx="30" cy="20" r="5" fill="none" ' +
          'stroke="#000080" stroke-width="1.25"/>' +
          '<circle cx="30" cy="20" r="1" fill="#000080"/>' +
          '<path d="M30 15 V25 M25 20 H35 M26.5 16.5 L33.5 23.5 ' +
          'M33.5 16.5 L26.5 23.5" stroke="#000080" stroke-width="0.7"/>'
        );

      case "br":
        return (
          '<rect width="60" height="40" fill="#009b3a"/>' +
          '<polygon points="30,4 55,20 30,36 5,20" fill="#ffdf00"/>' +
          '<circle cx="30" cy="20" r="9.5" fill="#002776"/>' +
          '<path d="M21 18 C28 15 37 17 39 22" fill="none" ' +
          'stroke="#ffffff" stroke-width="1.7"/>'
        );

      case "ca":
        return (
          '<rect width="60" height="40" fill="#ffffff"/>' +
          '<rect width="15" height="40" x="0" fill="#d80621"/>' +
          '<rect width="15" height="40" x="45" fill="#d80621"/>' +
          '<polygon points="30,7 33,14 38,11 36,18 42,20 35,24 ' +
          '37,31 31.5,28 30,35 28.5,28 23,31 25,24 18,20 ' +
          '24,18 22,11 27,14" fill="#d80621"/>'
        );

      case "au":
        return australiaFlagContent();

      case "za":
        return (
          '<rect width="60" height="20" y="0" fill="#de3831"/>' +
          '<rect width="60" height="20" y="20" fill="#002395"/>' +
          '<path d="M0 4 L24 20 L0 36" fill="none" ' +
          'stroke="#ffffff" stroke-width="13"/>' +
          '<path d="M0 4 L24 20 L60 20 M0 36 L24 20" fill="none" ' +
          'stroke="#007a4d" stroke-width="8"/>' +
          '<path d="M0 8 L18 20 L0 32 Z" fill="#000000" ' +
          'stroke="#ffb612" stroke-width="4"/>'
        );

      case "kr":
        return (
          '<rect width="60" height="40" fill="#ffffff"/>' +
          '<path d="M21 20 A9 9 0 0 1 39 20 A4.5 4.5 0 0 1 30 20 ' +
          'A4.5 4.5 0 0 0 21 20" fill="#cd2e3a"/>' +
          '<path d="M39 20 A9 9 0 0 1 21 20 A4.5 4.5 0 0 1 30 20 ' +
          'A4.5 4.5 0 0 0 39 20" fill="#0047a0"/>' +
          koreanTrigrams()
        );

      default:
        return "";
    }
  }

  function usaFlagContent() {
    let content = '<rect width="60" height="40" fill="#ffffff"/>';

    for (let index = 0; index < 13; index++) {
      if (index % 2 === 0) {
        content += `<rect x="0" y="${index * (40 / 13)}" ` +
          `width="60" height="${40 / 13 + 0.2}" fill="#b22234"/>`;
      }
    }

    content += '<rect width="25.5" height="21.55" fill="#3c3b6e"/>';

    for (let row = 0; row < 5; row++) {
      for (let column = 0; column < 6; column++) {
        const x = 2.4 + column * 4.1;
        const y = 2.2 + row * 4.2;
        content += `<circle cx="${x}" cy="${y}" r="0.72" fill="#ffffff"/>`;
      }
    }

    return content;
  }

  function australiaFlagContent() {
    return (
      '<rect width="60" height="40" fill="#012169"/>' +
      '<g transform="scale(.47)">' +
      getFlagContent("gb") +
      '</g>' +
      `<polygon points="${starPoints(13, 29, 4.6, 1.9, 7)}" fill="#ffffff"/>` +
      `<polygon points="${starPoints(43, 10, 3.1, 1.25, 7)}" fill="#ffffff"/>` +
      `<polygon points="${starPoints(50, 19, 3.1, 1.25, 7)}" fill="#ffffff"/>` +
      `<polygon points="${starPoints(42, 29, 3.1, 1.25, 7)}" fill="#ffffff"/>` +
      `<polygon points="${starPoints(53, 33, 2.4, 1, 5)}" fill="#ffffff"/>`
    );
  }

  function koreanTrigrams() {
    const bars = [
      [8, 7, 0], [8, 10, 0], [8, 13, 0],
      [46, 27, 0], [46, 30, 1], [46, 33, 0],
      [46, 7, 1], [46, 10, 0], [46, 13, 1],
      [8, 27, 1], [8, 30, 1], [8, 33, 1]
    ];

    return bars.map(([x, y, split]) => {
      if (!split) {
        return `<rect x="${x}" y="${y}" width="7" height="1.8" fill="#000000"/>`;
      }

      return (
        `<rect x="${x}" y="${y}" width="2.7" height="1.8" fill="#000000"/>` +
        `<rect x="${x + 4.3}" y="${y}" width="2.7" height="1.8" fill="#000000"/>`
      );
    }).join("");
  }

  function starPoints(
    centreX,
    centreY,
    outerRadius,
    innerRadius,
    pointCount = 5,
    rotation = -90
  ) {
    const points = [];
    const totalPoints = pointCount * 2;

    for (let index = 0; index < totalPoints; index++) {
      const radius = index % 2 === 0
        ? outerRadius
        : innerRadius;

      const angle = (
        rotation + index * 180 / pointCount
      ) * Math.PI / 180;

      points.push(
        `${centreX + Math.cos(angle) * radius},` +
        `${centreY + Math.sin(angle) * radius}`
      );
    }

    return points.join(" ");
  }


  function getGroups() {
    return GROUPS.map((group) => ({ ...group }));
  }

  function getCategories(groupId = null) {
    return CATEGORIES
      .filter((entry) => !groupId || entry.groupId === groupId)
      .map((entry) => ({
        ...entry,
        subcategories: entry.subcategories.map((subcategory) => ({ ...subcategory }))
      }));
  }

  function getAllItems() {
    return [...ITEMS];
  }

  function getItemById(id) {
    return ITEM_BY_ID.get(id) || null;
  }

  function getItems(options = {}) {
    const excluded = new Set(options.excludeIds || []);
    const groupIds = options.groupIds || null;
    const categoryIds = options.categoryIds || null;
    const subcategoryIds = options.subcategoryIds || null;
    const displayTypes = options.displayTypes || null;
    const minimumRecognisability = options.minimumRecognisability || "medium";
    const maximumDifficulty = options.maximumDifficulty || "hard";

    return ITEMS.filter((entry) => {
      if (excluded.has(entry.id)) return false;
      if (entry.approvalStatus !== "approved" || !entry.classroomSafe) return false;
      if (groupIds?.length && !groupIds.includes(entry.groupId)) return false;
      if (categoryIds?.length && !categoryIds.includes(entry.categoryId)) return false;
      if (subcategoryIds?.length && !subcategoryIds.includes(entry.subcategoryId)) return false;
      if (displayTypes?.length && !displayTypes.includes(entry.displayType)) return false;
      if (RECOGNISABILITY[entry.recognisability] < RECOGNISABILITY[minimumRecognisability]) return false;
      if (DIFFICULTY[entry.difficulty] > DIFFICULTY[maximumDifficulty]) return false;
      if (options.tags?.length && !options.tags.every((tag) => entry.tags.includes(tag))) return false;
      return true;
    });
  }

  function generateHotseatRound(count = 6, options = {}) {
    const wanted = clamp(count, 1, 50);
    const candidates = getItems(options);

    if (candidates.length < wanted) {
      throw new Error(`Only ${candidates.length} suitable items were available, but ${wanted} were requested.`);
    }

    const selected = [];
    const selectedIds = new Set();
    const selectedFamilies = new Set();

    if (options.requireCategoryVariety !== false) {
      const buckets = groupBy(shuffle(candidates), (entry) => entry.categoryId);
      for (const categoryId of shuffle([...buckets.keys()])) {
        if (selected.length >= wanted) break;
        const choice = buckets.get(categoryId).find((entry) => !selectedFamilies.has(entry.familyId));
        if (choice) addChoice(choice, selected, selectedIds, selectedFamilies);
      }
    }

    for (const entry of shuffle(candidates)) {
      if (selected.length >= wanted) break;
      if (selectedIds.has(entry.id)) continue;
      if (options.avoidSameFamily !== false && selectedFamilies.has(entry.familyId)) continue;
      addChoice(entry, selected, selectedIds, selectedFamilies);
    }

    for (const entry of shuffle(candidates)) {
      if (selected.length >= wanted) break;
      if (!selectedIds.has(entry.id)) addChoice(entry, selected, selectedIds, selectedFamilies);
    }

    return shuffle(selected).slice(0, wanted);
  }

  function generateCodenamesBoard(count = 16, options = {}) {
    const wanted = clamp(count, 4, 40);
    const categoryIds = options.categoryId ? [options.categoryId] : options.categoryIds;
    const candidates = getItems({ ...options, categoryIds });

    if (candidates.length < wanted) {
      throw new Error(`Only ${candidates.length} suitable items were available in this category, but ${wanted} were requested.`);
    }

    const maximumPerFamily = clamp(options.maximumPerFamily ?? 2, 1, 10);
    const familyCounts = new Map();
    const selected = [];

    for (const entry of shuffle(candidates)) {
      if (selected.length >= wanted) break;
      const current = familyCounts.get(entry.familyId) || 0;
      if (current >= maximumPerFamily) continue;
      selected.push(entry);
      familyCounts.set(entry.familyId, current + 1);
    }

    if (selected.length < wanted) {
      const ids = new Set(selected.map((entry) => entry.id));
      for (const entry of shuffle(candidates)) {
        if (selected.length >= wanted) break;
        if (!ids.has(entry.id)) {
          selected.push(entry);
          ids.add(entry.id);
        }
      }
    }

    return shuffle(selected).slice(0, wanted);
  }

  function addChoice(entry, selected, ids, families) {
    selected.push(entry);
    ids.add(entry.id);
    families.add(entry.familyId);
  }

  function getSvgMarkup(itemOrKey) {
    const key = typeof itemOrKey === "string" ? itemOrKey : itemOrKey?.svgKey;
    return SVG_RENDERERS[key]?.() || "";
  }

  async function renderItem(itemOrId, container, options = {}) {
    const entry = typeof itemOrId === "string" ? getItemById(itemOrId) : itemOrId;
    if (!entry) throw new Error("Unknown clue item.");
    if (!(container instanceof Element)) throw new Error("renderItem requires a DOM element.");

    container.innerHTML = "";
    container.dataset.itemId = entry.id;
    container.dataset.displayType = entry.displayType;
    container.setAttribute("aria-label", entry.spokenName);

    const visual = document.createElement("div");
    visual.className = "clue-item-visual";

    if (entry.displayType === "text" || entry.displayType === "symbol") {
      visual.textContent = entry.displayValue;
    } else if (entry.displayType === "svg") {
      visual.innerHTML = getSvgMarkup(entry);
    } else if (entry.displayType === "flag") {
      visual.innerHTML = getFlagMarkup(entry);
    } else if (entry.displayType === "colour") {
      visual.classList.add("clue-item-colour-wrapper");
      visual.style.setProperty("--clue-item-colour", entry.colourValue);
      visual.innerHTML = '<span class="clue-item-colour-swatch" aria-hidden="true"></span>';
    } else {
      await renderImage(entry, visual, options);
    }

    container.appendChild(visual);

    const showLabel = options.showLabel ?? ["text", "symbol"].includes(entry.displayType);
    if (showLabel) {
      const label = document.createElement("div");
      label.className = "clue-item-label";
      label.textContent = entry.label;
      container.appendChild(label);
    }

    return container;
  }

  async function renderImage(entry, visual, options) {
    visual.classList.add("clue-item-image-wrapper");
    visual.textContent = options.loadingText || "Loading…";

    try {
      const asset = await resolveImageAsset(entry, options);
      visual.innerHTML = "";
      const image = document.createElement("img");
      image.className = "clue-item-image";
      image.src = asset.url;
      image.alt = options.includeAltText ? entry.label : "";
      image.loading = options.lazy === false ? "eager" : "lazy";
      image.decoding = "async";
      visual.appendChild(image);
      visual.dataset.licence = asset.licence || "";
      visual.dataset.creator = asset.creator || "";
      visual.dataset.sourcePage = asset.sourcePage || "";
    } catch (error) {
      visual.classList.add("clue-item-image-fallback");
      visual.innerHTML = '<span class="clue-item-image-unavailable" aria-hidden="true">Image unavailable</span>';
      visual.dataset.imageError = error.message;
    }
  }

  async function resolveImageAsset(itemOrId, options = {}) {
    const entry = typeof itemOrId === "string" ? getItemById(itemOrId) : itemOrId;
    if (!entry || entry.displayType !== "image") throw new Error("This clue item is not image-backed.");
    if (entry.approvalStatus !== "approved" || !entry.classroomSafe) throw new Error("This image is not approved for classroom use.");

    const width = clamp(options.width || options.imageWidth || 720, 200, 1600);
    const cacheId = `${entry.id}:${width}`;
    const cache = loadCache();

    if (!options.forceRefresh && cache[cacheId] && Date.now() - cache[cacheId].savedAt < CACHE_AGE) {
      return cache[cacheId].asset;
    }

    const imageSources = [];
    const sourceErrors = [];

    try {
      imageSources.push(await getWikipediaPageImage(entry.wikipediaTitle, width));
    } catch (error) {
      sourceErrors.push(error.message);
    }

    try {
      const wikidataImage = await getWikidataImage(entry.wikipediaTitle);
      if (!imageSources.some((source) => source.fileName === wikidataImage.fileName)) {
        imageSources.push(wikidataImage);
      }
    } catch (error) {
      sourceErrors.push(error.message);
    }

    for (const source of imageSources) {
      try {
        const commonsAsset = await getCommonsAsset(source.fileName, width);

        if (!allowedLicence(commonsAsset.licence)) {
          sourceErrors.push(`The image licence “${commonsAsset.licence || "unknown"}” is not approved.`);
          continue;
        }

        const asset = Object.freeze({
          ...commonsAsset,
          itemId: entry.id,
          wikipediaTitle: entry.wikipediaTitle,
          wikipediaPage: source.pageUrl || "",
          imagePolicy: "freely-licensed"
        });

        cache[cacheId] = { savedAt: Date.now(), asset };
        saveCache(cache);
        return asset;
      } catch (error) {
        sourceErrors.push(error.message);
      }
    }

    if (entry.allowWikipediaThumbnail) {
      const referenceSource = imageSources.find((source) => {
        return typeof source.thumbnailUrl === "string" && source.thumbnailUrl !== "";
      });

      if (referenceSource) {
        const asset = Object.freeze({
          itemId: entry.id,
          wikipediaTitle: entry.wikipediaTitle,
          wikipediaPage: referenceSource.pageUrl || "",
          fileName: referenceSource.fileName || "",
          url: referenceSource.thumbnailUrl,
          originalUrl: referenceSource.thumbnailUrl,
          sourcePage: referenceSource.pageUrl || "",
          creator: "",
          credit: "Wikipedia page thumbnail",
          licence: "See source page",
          licenceUrl: referenceSource.pageUrl || "",
          attributionRequired: false,
          imagePolicy: "reference-thumbnail",
          usageNote: "This thumbnail may be non-free. It is linked from the source page for temporary classroom display and is not downloaded into the project."
        });

        cache[cacheId] = { savedAt: Date.now(), asset };
        saveCache(cache);
        return asset;
      }
    }

    throw new Error(
      `No approved image could be loaded for ${entry.label}. ` +
      sourceErrors.filter(Boolean).join(" ")
    );
  }

  async function prefetchImages(entries, options = {}) {
    const images = entries.filter((entry) => entry.displayType === "image");
    const results = [];
    const concurrency = clamp(options.concurrency || 4, 1, 8);
    let nextIndex = 0;

    async function worker() {
      while (nextIndex < images.length) {
        const index = nextIndex++;
        try {
          results[index] = { item: images[index], asset: await resolveImageAsset(images[index], options), error: null };
        } catch (error) {
          results[index] = { item: images[index], asset: null, error };
        }
      }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, images.length) }, worker));
    return results;
  }

  async function getWikipediaPageImage(title, width) {
    const query = new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      origin: "*",
      redirects: "1",
      prop: "pageimages|info",
      piprop: "name|thumbnail",
      pithumbsize: String(width),
      pilicense: "any",
      inprop: "url",
      titles: title
    });

    const data = await fetchJson(`https://en.wikipedia.org/w/api.php?${query}`);
    const page = data?.query?.pages?.[0];

    if (!page || page.missing) throw new Error(`Wikipedia page not found: ${title}`);
    if (!page.pageimage) throw new Error(`No suitable page image was found for ${title}.`);

    return {
      fileName: page.pageimage,
      pageUrl: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      thumbnailUrl: page.thumbnail?.source || ""
    };
  }

  async function getWikidataImage(searchText) {
    const searchQuery = new URLSearchParams({
      action: "wbsearchentities",
      format: "json",
      origin: "*",
      language: "en",
      uselang: "en",
      type: "item",
      limit: "10",
      search: searchText
    });

    const searchData = await fetchJson(`https://www.wikidata.org/w/api.php?${searchQuery}`);
    const results = searchData?.search || [];

    if (results.length === 0) {
      throw new Error(`No Wikidata item was found for ${searchText}.`);
    }

    const normalisedSearch = normaliseEntityName(searchText);
    const match = results.find((result) => {
      return normaliseEntityName(result.label) === normalisedSearch;
    }) || results[0];

    const entityQuery = new URLSearchParams({
      action: "wbgetentities",
      format: "json",
      origin: "*",
      ids: match.id,
      props: "claims|sitelinks"
    });

    const entityData = await fetchJson(`https://www.wikidata.org/w/api.php?${entityQuery}`);
    const entity = entityData?.entities?.[match.id];
    const fileName = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;

    if (!fileName) {
      throw new Error(`No Wikidata image was found for ${searchText}.`);
    }

    const wikipediaTitle = entity?.sitelinks?.enwiki?.title;

    return {
      fileName,
      pageUrl: wikipediaTitle
        ? `https://en.wikipedia.org/wiki/${encodeURIComponent(wikipediaTitle.replace(/ /g, "_"))}`
        : ""
    };
  }

  function normaliseEntityName(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\([^)]*\)/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  async function getCommonsAsset(fileName, width) {
    const query = new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      origin: "*",
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: String(width),
      iiextmetadatalanguage: "en",
      iiextmetadatafilter: "Artist|Credit|LicenseShortName|LicenseUrl|UsageTerms|AttributionRequired",
      titles: fileName.startsWith("File:") ? fileName : `File:${fileName}`
    });

    const data = await fetchJson(`https://commons.wikimedia.org/w/api.php?${query}`);
    const page = data?.query?.pages?.[0];
    const info = page?.imageinfo?.[0];

    if (!page || page.missing || !info) {
      throw new Error(`The image “${fileName}” was not available on Wikimedia Commons.`);
    }

    const metadata = info.extmetadata || {};
    return {
      fileName,
      url: info.thumburl || info.url,
      originalUrl: info.url,
      sourcePage: info.descriptionurl || "",
      creator: metadataValue(metadata.Artist),
      credit: metadataValue(metadata.Credit),
      licence: metadataValue(metadata.LicenseShortName) || metadataValue(metadata.UsageTerms),
      licenceUrl: metadataValue(metadata.LicenseUrl),
      attributionRequired: metadataValue(metadata.AttributionRequired).toLowerCase() === "true"
    };
  }

  async function fetchJson(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        mode: "cors",
        credentials: "omit",
        signal: controller.signal,
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error(`Image service returned ${response.status}.`);
      return await response.json();
    } catch (error) {
      if (error.name === "AbortError") throw new Error("The image request timed out.");
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  function allowedLicence(licence) {
    const value = String(licence || "").toLowerCase();
    return [
      "public domain",
      "cc0",
      "cc by",
      "cc-by",
      "cc by-sa",
      "cc-by-sa",
      "creative commons attribution",
      "gfdl"
    ].some((allowed) => value.includes(allowed));
  }

  function metadataValue(field) {
    return stripHtml(field?.value || "").trim();
  }

  function stripHtml(value) {
    if (typeof document !== "undefined") {
      const element = document.createElement("div");
      element.innerHTML = String(value);
      return element.textContent || "";
    }
    return String(value).replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");
  }

  function getAttribution(asset) {
    return [asset.creator, asset.licence, asset.sourcePage].filter(Boolean).join(" — ");
  }

  function loadCache() {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}") || {};
    } catch {
      return {};
    }
  }

  function saveCache(cache) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
      // Persistent caching is optional.
    }
  }

  function clearImageCache() {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {
      // Ignore unavailable storage.
    }
  }

  function validateData() {
    const errors = [];
    const ids = new Set();
    const categoryIds = new Set(CATEGORIES.map((entry) => entry.id));

    ITEMS.forEach((entry) => {
      if (ids.has(entry.id)) errors.push(`Duplicate item id: ${entry.id}`);
      ids.add(entry.id);
      if (!categoryIds.has(entry.categoryId)) errors.push(`${entry.id} uses unknown category ${entry.categoryId}`);
      if (entry.displayType === "svg" && !SVG_RENDERERS[entry.svgKey]) errors.push(`${entry.id} uses unknown SVG key ${entry.svgKey}`);
      if (entry.displayType === "flag" && !getFlagContent(entry.flagCode)) errors.push(`${entry.id} uses unknown flag code ${entry.flagCode}`);
      if (entry.displayType === "colour" && !entry.colourValue) errors.push(`${entry.id} has no colour value`);
      if (entry.displayType === "image" && !entry.wikipediaTitle) errors.push(`${entry.id} has no Wikipedia title`);
      if (entry.categoryId === "characters" && entry.displayType !== "image") {
        errors.push(`${entry.id} is a character but is not image-backed`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  function groupBy(array, keyFunction) {
    const result = new Map();
    array.forEach((entry) => {
      const key = keyFunction(entry);
      if (!result.has(key)) result.set(key, []);
      result.get(key).push(entry);
    });
    return result;
  }

  function shuffle(array) {
    const result = [...array];
    for (let index = result.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }
    return result;
  }

  function clamp(value, minimum, maximum) {
    const number = Number(value);
    if (!Number.isFinite(number)) return minimum;
    return Math.min(maximum, Math.max(minimum, Math.round(number)));
  }

  const validation = validateData();
  if (!validation.valid) console.error("ClueItemGenerator data errors:", validation.errors);

  return Object.freeze({
    getGroups,
    getCategories,
    getAllItems,
    getItemById,
    getItems,
    generateHotseatRound,
    generateCodenamesBoard,
    getSvgMarkup,
    getFlagMarkup,
    renderItem,
    resolveImageAsset,
    prefetchImages,
    getAttribution,
    clearImageCache,
    validateData
  });
})();
