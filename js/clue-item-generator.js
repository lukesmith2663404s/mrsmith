/*
  Reusable Hotseat / Codenames prompt generator.

  Put this file at: js/clue-item-generator.js

  Real-world image items use approved Wikipedia titles.

  Fictional-character items are generated locally by the Fandom character
  downloader. The downloader stores approved images in the project and
  inserts their item records into the marked section below.
*/

globalThis.ClueItemGenerator = (() => {
  "use strict";

  const CACHE_KEY = "clueItemGeneratorImageCacheV4";
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
    imagePath = null,
    sourcePage = null,
    imageSource = null,
    franchise = null,
    fandomWiki = null,
    fandomPage = null,
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
      imagePath,
      sourcePage,
      imageSource,
      franchise,
      fandomWiki,
      fandomPage,
      wikipediaTitle,
      allowWikipediaThumbnail,
      approvalStatus,
      classroomSafe
    });
  }

  const ITEMS = [];

  const GENERATED_CHARACTER_ITEMS = [
    // FANDOM_CHARACTER_ITEMS_START
      {
          "id": "character-animated-mickey-mouse",
          "label": "Mickey Mouse",
          "spokenName": "Mickey Mouse",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-mickey-mouse.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Mickey_Mouse",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Mickey Mouse",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-minnie-mouse",
          "label": "Minnie Mouse",
          "spokenName": "Minnie Mouse",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-minnie-mouse.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Minnie_Mouse",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Minnie Mouse",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-donald-duck",
          "label": "Donald Duck",
          "spokenName": "Donald Duck",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-donald-duck.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Donald_Duck",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Donald Duck",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-daisy-duck",
          "label": "Daisy Duck",
          "spokenName": "Daisy Duck",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-daisy-duck.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Daisy_Duck",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Daisy Duck",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-goofy",
          "label": "Goofy",
          "spokenName": "Goofy",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-goofy.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Goofy",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Goofy",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-pluto",
          "label": "Pluto",
          "spokenName": "Pluto",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-pluto.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Pluto",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Pluto",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-scrooge-mcduck",
          "label": "Scrooge McDuck",
          "spokenName": "Scrooge McDuck",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-scrooge-mcduck.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Scrooge_McDuck",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Scrooge McDuck",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-stitch",
          "label": "Stitch",
          "spokenName": "Stitch",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-stitch.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Stitch",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Stitch",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-lilo-pelekai",
          "label": "Lilo Pelekai",
          "spokenName": "Lilo Pelekai",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-lilo-pelekai.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Lilo_Pelekai",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Lilo Pelekai",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-elsa",
          "label": "Elsa",
          "spokenName": "Elsa",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-elsa.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Elsa",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Elsa",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-anna",
          "label": "Anna",
          "spokenName": "Anna",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-anna.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Anna",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Anna",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-olaf",
          "label": "Olaf",
          "spokenName": "Olaf",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-olaf.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Olaf",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Olaf",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-maui",
          "label": "Maui",
          "spokenName": "Maui",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-maui.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Maui",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Maui",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-rapunzel",
          "label": "Rapunzel",
          "spokenName": "Rapunzel",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-rapunzel.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Rapunzel",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Rapunzel",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-flynn-rider",
          "label": "Flynn Rider",
          "spokenName": "Flynn Rider",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-flynn-rider.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Flynn_Rider",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Flynn Rider",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-ariel",
          "label": "Ariel",
          "spokenName": "Ariel",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-ariel.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Ariel",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Ariel",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-sebastian",
          "label": "Sebastian",
          "spokenName": "Sebastian",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-sebastian.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Sebastian",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Sebastian",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-simba",
          "label": "Simba",
          "spokenName": "Simba",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-simba.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Simba",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Simba",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-timon",
          "label": "Timon",
          "spokenName": "Timon",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-timon.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Timon",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Timon",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-pumbaa",
          "label": "Pumbaa",
          "spokenName": "Pumbaa",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-pumbaa.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Pumbaa",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Pumbaa",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-genie",
          "label": "Genie",
          "spokenName": "Genie",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-genie.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Genie",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Genie",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-belle",
          "label": "Belle",
          "spokenName": "Belle",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-belle.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Belle",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Belle",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-the-beast",
          "label": "The Beast",
          "spokenName": "The Beast",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-the-beast.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Beast",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Beast",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-mushu",
          "label": "Mushu",
          "spokenName": "Mushu",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-mushu.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Mushu",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Mushu",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-baymax",
          "label": "Baymax",
          "spokenName": "Baymax",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-baymax.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Baymax",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Baymax",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-vanellope",
          "label": "Vanellope",
          "spokenName": "Vanellope",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-vanellope.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Vanellope_von_Schweetz",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Vanellope von Schweetz",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-mirabel",
          "label": "Mirabel",
          "spokenName": "Mirabel",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-mirabel.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Mirabel_Madrigal",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Mirabel Madrigal",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-bruno-madrigal",
          "label": "Bruno Madrigal",
          "spokenName": "Bruno Madrigal",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-bruno-madrigal.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Bruno_Madrigal",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Bruno Madrigal",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-lightning-mcqueen",
          "label": "Lightning McQueen",
          "spokenName": "Lightning McQueen",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-lightning-mcqueen.webp",
          "sourcePage": "https://pixar.fandom.com/wiki/Lightning_McQueen",
          "imageSource": "local-fandom-download",
          "franchise": "Pixar",
          "fandomWiki": "pixar",
          "fandomPage": "Lightning McQueen",
          "recognisability": "high",
          "familyId": "franchise:pixar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-mater",
          "label": "Mater",
          "spokenName": "Mater",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-mater.webp",
          "sourcePage": "https://pixar.fandom.com/wiki/Tow_Mater",
          "imageSource": "local-fandom-download",
          "franchise": "Pixar",
          "fandomWiki": "pixar",
          "fandomPage": "Tow Mater",
          "recognisability": "high",
          "familyId": "franchise:pixar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-buzz-lightyear",
          "label": "Buzz Lightyear",
          "spokenName": "Buzz Lightyear",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-buzz-lightyear.webp",
          "sourcePage": "https://pixar.fandom.com/wiki/Buzz_Lightyear",
          "imageSource": "local-fandom-download",
          "franchise": "Pixar",
          "fandomWiki": "pixar",
          "fandomPage": "Buzz Lightyear",
          "recognisability": "high",
          "familyId": "franchise:pixar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-jessie",
          "label": "Jessie",
          "spokenName": "Jessie",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-jessie.webp",
          "sourcePage": "https://pixar.fandom.com/wiki/Jessie",
          "imageSource": "local-fandom-download",
          "franchise": "Pixar",
          "fandomWiki": "pixar",
          "fandomPage": "Jessie",
          "recognisability": "high",
          "familyId": "franchise:pixar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-mr-incredible",
          "label": "Mr. Incredible",
          "spokenName": "Mr. Incredible",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-mr-incredible.webp",
          "sourcePage": "https://pixar.fandom.com/wiki/Bob_Parr",
          "imageSource": "local-fandom-download",
          "franchise": "Pixar",
          "fandomWiki": "pixar",
          "fandomPage": "Bob Parr",
          "recognisability": "high",
          "familyId": "franchise:pixar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-elastigirl",
          "label": "Elastigirl",
          "spokenName": "Elastigirl",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-elastigirl.webp",
          "sourcePage": "https://pixar.fandom.com/wiki/Helen_Parr",
          "imageSource": "local-fandom-download",
          "franchise": "Pixar",
          "fandomWiki": "pixar",
          "fandomPage": "Helen Parr",
          "recognisability": "high",
          "familyId": "franchise:pixar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-violet-parr",
          "label": "Violet Parr",
          "spokenName": "Violet Parr",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-violet-parr.webp",
          "sourcePage": "https://pixar.fandom.com/wiki/Violet_Parr",
          "imageSource": "local-fandom-download",
          "franchise": "Pixar",
          "fandomWiki": "pixar",
          "fandomPage": "Violet Parr",
          "recognisability": "high",
          "familyId": "franchise:pixar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-dash-parr",
          "label": "Dash Parr",
          "spokenName": "Dash Parr",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-dash-parr.webp",
          "sourcePage": "https://pixar.fandom.com/wiki/Dash_Parr",
          "imageSource": "local-fandom-download",
          "franchise": "Pixar",
          "fandomWiki": "pixar",
          "fandomPage": "Dash Parr",
          "recognisability": "high",
          "familyId": "franchise:pixar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-frozone",
          "label": "Frozone",
          "spokenName": "Frozone",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-frozone.webp",
          "sourcePage": "https://pixar.fandom.com/wiki/Lucius_Best",
          "imageSource": "local-fandom-download",
          "franchise": "Pixar",
          "fandomWiki": "pixar",
          "fandomPage": "Lucius Best",
          "recognisability": "high",
          "familyId": "franchise:pixar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-nemo",
          "label": "Nemo",
          "spokenName": "Nemo",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-nemo.webp",
          "sourcePage": "https://pixar.fandom.com/wiki/Nemo",
          "imageSource": "local-fandom-download",
          "franchise": "Pixar",
          "fandomWiki": "pixar",
          "fandomPage": "Nemo",
          "recognisability": "high",
          "familyId": "franchise:pixar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-dory",
          "label": "Dory",
          "spokenName": "Dory",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-dory.webp",
          "sourcePage": "https://pixar.fandom.com/wiki/Dory",
          "imageSource": "local-fandom-download",
          "franchise": "Pixar",
          "fandomWiki": "pixar",
          "fandomPage": "Dory",
          "recognisability": "high",
          "familyId": "franchise:pixar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-sulley",
          "label": "Sulley",
          "spokenName": "Sulley",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-sulley.webp",
          "sourcePage": "https://pixar.fandom.com/wiki/James_P._Sullivan",
          "imageSource": "local-fandom-download",
          "franchise": "Pixar",
          "fandomWiki": "pixar",
          "fandomPage": "James P. Sullivan",
          "recognisability": "high",
          "familyId": "franchise:pixar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-mike-wazowski",
          "label": "Mike Wazowski",
          "spokenName": "Mike Wazowski",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-mike-wazowski.webp",
          "sourcePage": "https://pixar.fandom.com/wiki/Mike_Wazowski",
          "imageSource": "local-fandom-download",
          "franchise": "Pixar",
          "fandomWiki": "pixar",
          "fandomPage": "Mike Wazowski",
          "recognisability": "high",
          "familyId": "franchise:pixar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-remy",
          "label": "Remy",
          "spokenName": "Remy",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-remy.webp",
          "sourcePage": "https://pixar.fandom.com/wiki/Remy",
          "imageSource": "local-fandom-download",
          "franchise": "Pixar",
          "fandomWiki": "pixar",
          "fandomPage": "Remy",
          "recognisability": "high",
          "familyId": "franchise:pixar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-wall-e",
          "label": "WALL-E",
          "spokenName": "WALL-E",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-wall-e.webp",
          "sourcePage": "https://pixar.fandom.com/wiki/WALL%E2%80%A2E",
          "imageSource": "local-fandom-download",
          "franchise": "Pixar",
          "fandomWiki": "pixar",
          "fandomPage": "WALL•E",
          "recognisability": "high",
          "familyId": "franchise:pixar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-eve",
          "label": "EVE",
          "spokenName": "EVE",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-eve.webp",
          "sourcePage": "https://pixar.fandom.com/wiki/EVE",
          "imageSource": "local-fandom-download",
          "franchise": "Pixar",
          "fandomWiki": "pixar",
          "fandomPage": "EVE",
          "recognisability": "high",
          "familyId": "franchise:pixar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-joy",
          "label": "Joy",
          "spokenName": "Joy",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-joy.webp",
          "sourcePage": "https://pixar.fandom.com/wiki/Joy",
          "imageSource": "local-fandom-download",
          "franchise": "Pixar",
          "fandomWiki": "pixar",
          "fandomPage": "Joy",
          "recognisability": "high",
          "familyId": "franchise:pixar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-sadness",
          "label": "Sadness",
          "spokenName": "Sadness",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-sadness.webp",
          "sourcePage": "https://pixar.fandom.com/wiki/Sadness",
          "imageSource": "local-fandom-download",
          "franchise": "Pixar",
          "fandomWiki": "pixar",
          "fandomPage": "Sadness",
          "recognisability": "high",
          "familyId": "franchise:pixar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-princess-fiona",
          "label": "Princess Fiona",
          "spokenName": "Princess Fiona",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-princess-fiona.webp",
          "sourcePage": "https://dreamworks.fandom.com/wiki/Fiona",
          "imageSource": "local-fandom-download",
          "franchise": "DreamWorks",
          "fandomWiki": "dreamworks",
          "fandomPage": "Fiona",
          "recognisability": "high",
          "familyId": "franchise:dreamworks",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-donkey",
          "label": "Donkey",
          "spokenName": "Donkey",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-donkey.webp",
          "sourcePage": "https://dreamworks.fandom.com/wiki/Donkey",
          "imageSource": "local-fandom-download",
          "franchise": "DreamWorks",
          "fandomWiki": "dreamworks",
          "fandomPage": "Donkey",
          "recognisability": "high",
          "familyId": "franchise:dreamworks",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-puss-in-boots",
          "label": "Puss in Boots",
          "spokenName": "Puss in Boots",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-puss-in-boots.webp",
          "sourcePage": "https://dreamworks.fandom.com/wiki/Puss_in_Boots",
          "imageSource": "local-fandom-download",
          "franchise": "DreamWorks",
          "fandomWiki": "dreamworks",
          "fandomPage": "Puss in Boots",
          "recognisability": "high",
          "familyId": "franchise:dreamworks",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-toothless",
          "label": "Toothless",
          "spokenName": "Toothless",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-toothless.webp",
          "sourcePage": "https://dreamworks.fandom.com/wiki/Toothless",
          "imageSource": "local-fandom-download",
          "franchise": "DreamWorks",
          "fandomWiki": "dreamworks",
          "fandomPage": "Toothless",
          "recognisability": "high",
          "familyId": "franchise:dreamworks",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-alex-the-lion",
          "label": "Alex the Lion",
          "spokenName": "Alex the Lion",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-alex-the-lion.webp",
          "sourcePage": "https://dreamworks.fandom.com/wiki/Alex_(Madagascar)",
          "imageSource": "local-fandom-download",
          "franchise": "DreamWorks",
          "fandomWiki": "dreamworks",
          "fandomPage": "Alex (Madagascar)",
          "recognisability": "high",
          "familyId": "franchise:dreamworks",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-king-julien",
          "label": "King Julien",
          "spokenName": "King Julien",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-king-julien.webp",
          "sourcePage": "https://dreamworks.fandom.com/wiki/King_Julien_the_13th",
          "imageSource": "local-fandom-download",
          "franchise": "DreamWorks",
          "fandomWiki": "dreamworks",
          "fandomPage": "King Julien the 13th",
          "recognisability": "high",
          "familyId": "franchise:dreamworks",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-megamind",
          "label": "Megamind",
          "spokenName": "Megamind",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-megamind.webp",
          "sourcePage": "https://dreamworks.fandom.com/wiki/Megamind_(franchise)",
          "imageSource": "local-fandom-download",
          "franchise": "DreamWorks",
          "fandomWiki": "dreamworks",
          "fandomPage": "Megamind (franchise)",
          "recognisability": "high",
          "familyId": "franchise:dreamworks",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-spongebob",
          "label": "SpongeBob",
          "spokenName": "SpongeBob",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-spongebob.webp",
          "sourcePage": "https://spongebob.fandom.com/wiki/SpongeBob_SquarePants_(character)",
          "imageSource": "local-fandom-download",
          "franchise": "SpongeBob SquarePants",
          "fandomWiki": "spongebob",
          "fandomPage": "SpongeBob SquarePants (character)",
          "recognisability": "high",
          "familyId": "franchise:spongebob-squarepants",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-patrick-star",
          "label": "Patrick Star",
          "spokenName": "Patrick Star",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-patrick-star.webp",
          "sourcePage": "https://spongebob.fandom.com/wiki/Patrick_Star",
          "imageSource": "local-fandom-download",
          "franchise": "SpongeBob SquarePants",
          "fandomWiki": "spongebob",
          "fandomPage": "Patrick Star",
          "recognisability": "high",
          "familyId": "franchise:spongebob-squarepants",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-squidward",
          "label": "Squidward",
          "spokenName": "Squidward",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-squidward.webp",
          "sourcePage": "https://spongebob.fandom.com/wiki/Squidward_Tentacles",
          "imageSource": "local-fandom-download",
          "franchise": "SpongeBob SquarePants",
          "fandomWiki": "spongebob",
          "fandomPage": "Squidward Tentacles",
          "recognisability": "high",
          "familyId": "franchise:spongebob-squarepants",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-mr-krabs",
          "label": "Mr. Krabs",
          "spokenName": "Mr. Krabs",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-mr-krabs.webp",
          "sourcePage": "https://spongebob.fandom.com/wiki/Eugene_H._Krabs",
          "imageSource": "local-fandom-download",
          "franchise": "SpongeBob SquarePants",
          "fandomWiki": "spongebob",
          "fandomPage": "Eugene H. Krabs",
          "recognisability": "high",
          "familyId": "franchise:spongebob-squarepants",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-sandy-cheeks",
          "label": "Sandy Cheeks",
          "spokenName": "Sandy Cheeks",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-sandy-cheeks.webp",
          "sourcePage": "https://spongebob.fandom.com/wiki/Sandy_Cheeks",
          "imageSource": "local-fandom-download",
          "franchise": "SpongeBob SquarePants",
          "fandomWiki": "spongebob",
          "fandomPage": "Sandy Cheeks",
          "recognisability": "high",
          "familyId": "franchise:spongebob-squarepants",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-aang",
          "label": "Aang",
          "spokenName": "Aang",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-aang.webp",
          "sourcePage": "https://avatar.fandom.com/wiki/Aang",
          "imageSource": "local-fandom-download",
          "franchise": "Avatar",
          "fandomWiki": "avatar",
          "fandomPage": "Aang",
          "recognisability": "high",
          "familyId": "franchise:avatar",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-scooby-doo",
          "label": "Scooby-Doo",
          "spokenName": "Scooby-Doo",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-scooby-doo.webp",
          "sourcePage": "https://scoobydoo.fandom.com/wiki/Scooby-Doo",
          "imageSource": "local-fandom-download",
          "franchise": "Scooby-Doo",
          "fandomWiki": "scoobydoo",
          "fandomPage": "Scooby-Doo",
          "recognisability": "high",
          "familyId": "franchise:scooby-doo",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-tom",
          "label": "Tom",
          "spokenName": "Tom",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-tom.webp",
          "sourcePage": "https://tomandjerry.fandom.com/wiki/Tom_Cat",
          "imageSource": "local-fandom-download",
          "franchise": "Tom and Jerry",
          "fandomWiki": "tomandjerry",
          "fandomPage": "Tom Cat",
          "recognisability": "high",
          "familyId": "franchise:tom-and-jerry",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-jerry",
          "label": "Jerry",
          "spokenName": "Jerry",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-jerry.webp",
          "sourcePage": "https://tomandjerry.fandom.com/wiki/Jerry_Mouse",
          "imageSource": "local-fandom-download",
          "franchise": "Tom and Jerry",
          "fandomWiki": "tomandjerry",
          "fandomPage": "Jerry Mouse",
          "recognisability": "high",
          "familyId": "franchise:tom-and-jerry",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-bugs-bunny",
          "label": "Bugs Bunny",
          "spokenName": "Bugs Bunny",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-bugs-bunny.webp",
          "sourcePage": "https://looneytunes.fandom.com/wiki/Bugs_Bunny",
          "imageSource": "local-fandom-download",
          "franchise": "Looney Tunes",
          "fandomWiki": "looneytunes",
          "fandomPage": "Bugs Bunny",
          "recognisability": "high",
          "familyId": "franchise:looney-tunes",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-daffy-duck",
          "label": "Daffy Duck",
          "spokenName": "Daffy Duck",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-daffy-duck.webp",
          "sourcePage": "https://looneytunes.fandom.com/wiki/Daffy_Duck",
          "imageSource": "local-fandom-download",
          "franchise": "Looney Tunes",
          "fandomWiki": "looneytunes",
          "fandomPage": "Daffy Duck",
          "recognisability": "high",
          "familyId": "franchise:looney-tunes",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-wile-e-coyote",
          "label": "Wile E. Coyote",
          "spokenName": "Wile E. Coyote",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-wile-e-coyote.webp",
          "sourcePage": "https://looneytunes.fandom.com/wiki/Wile_E._Coyote",
          "imageSource": "local-fandom-download",
          "franchise": "Looney Tunes",
          "fandomWiki": "looneytunes",
          "fandomPage": "Wile E. Coyote",
          "recognisability": "high",
          "familyId": "franchise:looney-tunes",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-road-runner",
          "label": "Road Runner",
          "spokenName": "Road Runner",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-road-runner.webp",
          "sourcePage": "https://looneytunes.fandom.com/wiki/Road_Runner",
          "imageSource": "local-fandom-download",
          "franchise": "Looney Tunes",
          "fandomWiki": "looneytunes",
          "fandomPage": "Road Runner",
          "recognisability": "high",
          "familyId": "franchise:looney-tunes",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-garfield",
          "label": "Garfield",
          "spokenName": "Garfield",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-garfield.webp",
          "sourcePage": "https://garfield.fandom.com/wiki/Garfield_(character)",
          "imageSource": "local-fandom-download",
          "franchise": "Garfield",
          "fandomWiki": "garfield",
          "fandomPage": "Garfield (character)",
          "recognisability": "high",
          "familyId": "franchise:garfield",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-snoopy",
          "label": "Snoopy",
          "spokenName": "Snoopy",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-snoopy.webp",
          "sourcePage": "https://peanuts.fandom.com/wiki/Snoopy",
          "imageSource": "local-fandom-download",
          "franchise": "Peanuts",
          "fandomWiki": "peanuts",
          "fandomPage": "Snoopy",
          "recognisability": "high",
          "familyId": "franchise:peanuts",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-charlie-brown",
          "label": "Charlie Brown",
          "spokenName": "Charlie Brown",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-charlie-brown.webp",
          "sourcePage": "https://peanuts.fandom.com/wiki/Charlie_Brown",
          "imageSource": "local-fandom-download",
          "franchise": "Peanuts",
          "fandomWiki": "peanuts",
          "fandomPage": "Charlie Brown",
          "recognisability": "high",
          "familyId": "franchise:peanuts",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-homer-simpson",
          "label": "Homer Simpson",
          "spokenName": "Homer Simpson",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-homer-simpson.webp",
          "sourcePage": "https://simpsons.fandom.com/wiki/Homer_Simpson",
          "imageSource": "local-fandom-download",
          "franchise": "The Simpsons",
          "fandomWiki": "simpsons",
          "fandomPage": "Homer Simpson",
          "recognisability": "high",
          "familyId": "franchise:the-simpsons",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-bart-simpson",
          "label": "Bart Simpson",
          "spokenName": "Bart Simpson",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-bart-simpson.webp",
          "sourcePage": "https://simpsons.fandom.com/wiki/Bart_Simpson",
          "imageSource": "local-fandom-download",
          "franchise": "The Simpsons",
          "fandomWiki": "simpsons",
          "fandomPage": "Bart Simpson",
          "recognisability": "high",
          "familyId": "franchise:the-simpsons",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-lisa-simpson",
          "label": "Lisa Simpson",
          "spokenName": "Lisa Simpson",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-lisa-simpson.webp",
          "sourcePage": "https://simpsons.fandom.com/wiki/Lisa_Simpson",
          "imageSource": "local-fandom-download",
          "franchise": "The Simpsons",
          "fandomWiki": "simpsons",
          "fandomPage": "Lisa Simpson",
          "recognisability": "high",
          "familyId": "franchise:the-simpsons",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-marge-simpson",
          "label": "Marge Simpson",
          "spokenName": "Marge Simpson",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-marge-simpson.webp",
          "sourcePage": "https://simpsons.fandom.com/wiki/Marge_Simpson",
          "imageSource": "local-fandom-download",
          "franchise": "The Simpsons",
          "fandomWiki": "simpsons",
          "fandomPage": "Marge Simpson",
          "recognisability": "high",
          "familyId": "franchise:the-simpsons",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-stewie-griffin",
          "label": "Stewie Griffin",
          "spokenName": "Stewie Griffin",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-stewie-griffin.webp",
          "sourcePage": "https://familyguy.fandom.com/wiki/Stewie_Griffin",
          "imageSource": "local-fandom-download",
          "franchise": "Family Guy",
          "fandomWiki": "familyguy",
          "fandomPage": "Stewie Griffin",
          "recognisability": "high",
          "familyId": "franchise:family-guy",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-peter-griffin",
          "label": "Peter Griffin",
          "spokenName": "Peter Griffin",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-peter-griffin.webp",
          "sourcePage": "https://familyguy.fandom.com/wiki/Peter_Griffin",
          "imageSource": "local-fandom-download",
          "franchise": "Family Guy",
          "fandomWiki": "familyguy",
          "fandomPage": "Peter Griffin",
          "recognisability": "high",
          "familyId": "franchise:family-guy",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-rick-sanchez",
          "label": "Rick Sanchez",
          "spokenName": "Rick Sanchez",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-rick-sanchez.webp",
          "sourcePage": "https://rickandmorty.fandom.com/wiki/Rick_Sanchez",
          "imageSource": "local-fandom-download",
          "franchise": "Rick and Morty",
          "fandomWiki": "rickandmorty",
          "fandomPage": "Rick Sanchez",
          "recognisability": "high",
          "familyId": "franchise:rick-and-morty",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-morty-smith",
          "label": "Morty Smith",
          "spokenName": "Morty Smith",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-morty-smith.webp",
          "sourcePage": "https://rickandmorty.fandom.com/wiki/Morty_Smith",
          "imageSource": "local-fandom-download",
          "franchise": "Rick and Morty",
          "fandomWiki": "rickandmorty",
          "fandomPage": "Morty Smith",
          "recognisability": "high",
          "familyId": "franchise:rick-and-morty",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-finn-the-human",
          "label": "Finn the Human",
          "spokenName": "Finn the Human",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-finn-the-human.webp",
          "sourcePage": "https://adventuretime.fandom.com/wiki/Finn",
          "imageSource": "local-fandom-download",
          "franchise": "Adventure Time",
          "fandomWiki": "adventuretime",
          "fandomPage": "Finn",
          "recognisability": "high",
          "familyId": "franchise:adventure-time",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-jake-the-dog",
          "label": "Jake the Dog",
          "spokenName": "Jake the Dog",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-jake-the-dog.webp",
          "sourcePage": "https://adventuretime.fandom.com/wiki/Jake",
          "imageSource": "local-fandom-download",
          "franchise": "Adventure Time",
          "fandomWiki": "adventuretime",
          "fandomPage": "Jake",
          "recognisability": "high",
          "familyId": "franchise:adventure-time",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-peppa-pig",
          "label": "Peppa Pig",
          "spokenName": "Peppa Pig",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-peppa-pig.webp",
          "sourcePage": "https://peppapig.fandom.com/wiki/Peppa_Pig_(character)",
          "imageSource": "local-fandom-download",
          "franchise": "Peppa Pig",
          "fandomWiki": "peppapig",
          "fandomPage": "Peppa Pig (character)",
          "recognisability": "high",
          "familyId": "franchise:peppa-pig",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-bluey",
          "label": "Bluey",
          "spokenName": "Bluey",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-bluey.webp",
          "sourcePage": "https://blueypedia.fandom.com/wiki/Bluey_Heeler",
          "imageSource": "local-fandom-download",
          "franchise": "Bluey",
          "fandomWiki": "blueypedia",
          "fandomPage": "Bluey Heeler",
          "recognisability": "high",
          "familyId": "franchise:bluey",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-wallace",
          "label": "Wallace",
          "spokenName": "Wallace",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-wallace.webp",
          "sourcePage": "https://wallaceandgromit.fandom.com/wiki/Wallace",
          "imageSource": "local-fandom-download",
          "franchise": "Wallace and Gromit",
          "fandomWiki": "wallaceandgromit",
          "fandomPage": "Wallace",
          "recognisability": "high",
          "familyId": "franchise:wallace-and-gromit",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-animated-gromit",
          "label": "Gromit",
          "spokenName": "Gromit",
          "subcategoryId": "animated-characters",
          "imagePath": "../../assets/images/clue-items/characters/animated-characters/character-animated-gromit.webp",
          "sourcePage": "https://wallaceandgromit.fandom.com/wiki/Gromit",
          "imageSource": "local-fandom-download",
          "franchise": "Wallace and Gromit",
          "fandomWiki": "wallaceandgromit",
          "fandomPage": "Gromit",
          "recognisability": "high",
          "familyId": "franchise:wallace-and-gromit",
          "tags": [
            "character",
            "animated-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-harry-potter",
          "label": "Harry Potter",
          "spokenName": "Harry Potter",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-harry-potter.webp",
          "sourcePage": "https://harrypotter.fandom.com/wiki/Harry_Potter",
          "imageSource": "local-fandom-download",
          "franchise": "Harry Potter",
          "fandomWiki": "harrypotter",
          "fandomPage": "Harry Potter",
          "recognisability": "high",
          "familyId": "franchise:harry-potter",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-hermione-granger",
          "label": "Hermione Granger",
          "spokenName": "Hermione Granger",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-hermione-granger.webp",
          "sourcePage": "https://harrypotter.fandom.com/wiki/Hermione_Granger",
          "imageSource": "local-fandom-download",
          "franchise": "Harry Potter",
          "fandomWiki": "harrypotter",
          "fandomPage": "Hermione Granger",
          "recognisability": "high",
          "familyId": "franchise:harry-potter",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-ron-weasley",
          "label": "Ron Weasley",
          "spokenName": "Ron Weasley",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-ron-weasley.webp",
          "sourcePage": "https://harrypotter.fandom.com/wiki/Ronald_Weasley",
          "imageSource": "local-fandom-download",
          "franchise": "Harry Potter",
          "fandomWiki": "harrypotter",
          "fandomPage": "Ronald Weasley",
          "recognisability": "high",
          "familyId": "franchise:harry-potter",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-albus-dumbledore",
          "label": "Albus Dumbledore",
          "spokenName": "Albus Dumbledore",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-albus-dumbledore.webp",
          "sourcePage": "https://harrypotter.fandom.com/wiki/Albus_Dumbledore",
          "imageSource": "local-fandom-download",
          "franchise": "Harry Potter",
          "fandomWiki": "harrypotter",
          "fandomPage": "Albus Dumbledore",
          "recognisability": "high",
          "familyId": "franchise:harry-potter",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-rubeus-hagrid",
          "label": "Rubeus Hagrid",
          "spokenName": "Rubeus Hagrid",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-rubeus-hagrid.webp",
          "sourcePage": "https://harrypotter.fandom.com/wiki/Rubeus_Hagrid",
          "imageSource": "local-fandom-download",
          "franchise": "Harry Potter",
          "fandomWiki": "harrypotter",
          "fandomPage": "Rubeus Hagrid",
          "recognisability": "high",
          "familyId": "franchise:harry-potter",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-lord-voldemort",
          "label": "Lord Voldemort",
          "spokenName": "Lord Voldemort",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-lord-voldemort.webp",
          "sourcePage": "https://harrypotter.fandom.com/wiki/Tom_Riddle",
          "imageSource": "local-fandom-download",
          "franchise": "Harry Potter",
          "fandomWiki": "harrypotter",
          "fandomPage": "Tom Riddle",
          "recognisability": "high",
          "familyId": "franchise:harry-potter",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-dobby",
          "label": "Dobby",
          "spokenName": "Dobby",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-dobby.webp",
          "sourcePage": "https://harrypotter.fandom.com/wiki/Dobby",
          "imageSource": "local-fandom-download",
          "franchise": "Harry Potter",
          "fandomWiki": "harrypotter",
          "fandomPage": "Dobby",
          "recognisability": "high",
          "familyId": "franchise:harry-potter",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-darth-vader",
          "label": "Darth Vader",
          "spokenName": "Darth Vader",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-darth-vader.webp",
          "sourcePage": "https://starwars.fandom.com/wiki/Anakin_Skywalker",
          "imageSource": "local-fandom-download",
          "franchise": "Star Wars",
          "fandomWiki": "starwars",
          "fandomPage": "Anakin Skywalker",
          "recognisability": "high",
          "familyId": "franchise:star-wars",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-han-solo",
          "label": "Han Solo",
          "spokenName": "Han Solo",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-han-solo.webp",
          "sourcePage": "https://starwars.fandom.com/wiki/Han_Solo",
          "imageSource": "local-fandom-download",
          "franchise": "Star Wars",
          "fandomWiki": "starwars",
          "fandomPage": "Han Solo",
          "recognisability": "high",
          "familyId": "franchise:star-wars",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-yoda",
          "label": "Yoda",
          "spokenName": "Yoda",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-yoda.webp",
          "sourcePage": "https://starwars.fandom.com/wiki/Yoda",
          "imageSource": "local-fandom-download",
          "franchise": "Star Wars",
          "fandomWiki": "starwars",
          "fandomPage": "Yoda",
          "recognisability": "high",
          "familyId": "franchise:star-wars",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-chewbacca",
          "label": "Chewbacca",
          "spokenName": "Chewbacca",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-chewbacca.webp",
          "sourcePage": "https://starwars.fandom.com/wiki/Chewbacca",
          "imageSource": "local-fandom-download",
          "franchise": "Star Wars",
          "fandomWiki": "starwars",
          "fandomPage": "Chewbacca",
          "recognisability": "high",
          "familyId": "franchise:star-wars",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-r2-d2",
          "label": "R2-D2",
          "spokenName": "R2-D2",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-r2-d2.webp",
          "sourcePage": "https://starwars.fandom.com/wiki/R2-D2",
          "imageSource": "local-fandom-download",
          "franchise": "Star Wars",
          "fandomWiki": "starwars",
          "fandomPage": "R2-D2",
          "recognisability": "high",
          "familyId": "franchise:star-wars",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-c-3po",
          "label": "C-3PO",
          "spokenName": "C-3PO",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-c-3po.webp",
          "sourcePage": "https://starwars.fandom.com/wiki/C-3PO",
          "imageSource": "local-fandom-download",
          "franchise": "Star Wars",
          "fandomWiki": "starwars",
          "fandomPage": "C-3PO",
          "recognisability": "high",
          "familyId": "franchise:star-wars",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-grogu",
          "label": "Grogu",
          "spokenName": "Grogu",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-grogu.webp",
          "sourcePage": "https://starwars.fandom.com/wiki/Din_Grogu",
          "imageSource": "local-fandom-download",
          "franchise": "Star Wars",
          "fandomWiki": "starwars",
          "fandomPage": "Din Grogu",
          "recognisability": "high",
          "familyId": "franchise:star-wars",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-indiana-jones",
          "label": "Indiana Jones",
          "spokenName": "Indiana Jones",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-indiana-jones.webp",
          "sourcePage": "https://indianajones.fandom.com/wiki/Indiana_Jones",
          "imageSource": "local-fandom-download",
          "franchise": "Indiana Jones",
          "fandomWiki": "indianajones",
          "fandomPage": "Indiana Jones",
          "recognisability": "high",
          "familyId": "franchise:indiana-jones",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-e-t",
          "label": "E.T.",
          "spokenName": "E.T.",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-e-t.webp",
          "sourcePage": "https://ettheextraterrestrial.fandom.com/wiki/E.T.",
          "imageSource": "local-fandom-download",
          "franchise": "E.T.",
          "fandomWiki": "ettheextraterrestrial",
          "fandomPage": "E.T.",
          "recognisability": "high",
          "familyId": "franchise:e-t",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-marty-mcfly",
          "label": "Marty McFly",
          "spokenName": "Marty McFly",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-marty-mcfly.webp",
          "sourcePage": "https://backtothefuture.fandom.com/wiki/Marty_McFly",
          "imageSource": "local-fandom-download",
          "franchise": "Back to the Future",
          "fandomWiki": "backtothefuture",
          "fandomPage": "Marty McFly",
          "recognisability": "high",
          "familyId": "franchise:back-to-the-future",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-doc-brown",
          "label": "Doc Brown",
          "spokenName": "Doc Brown",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-doc-brown.webp",
          "sourcePage": "https://backtothefuture.fandom.com/wiki/Emmett_Brown",
          "imageSource": "local-fandom-download",
          "franchise": "Back to the Future",
          "fandomWiki": "backtothefuture",
          "fandomPage": "Emmett Brown",
          "recognisability": "high",
          "familyId": "franchise:back-to-the-future",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-jack-sparrow",
          "label": "Jack Sparrow",
          "spokenName": "Jack Sparrow",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-jack-sparrow.webp",
          "sourcePage": "https://pirates.fandom.com/wiki/Jack_Sparrow",
          "imageSource": "local-fandom-download",
          "franchise": "Pirates of the Caribbean",
          "fandomWiki": "pirates",
          "fandomPage": "Jack Sparrow",
          "recognisability": "high",
          "familyId": "franchise:pirates-of-the-caribbean",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-willy-wonka",
          "label": "Willy Wonka",
          "spokenName": "Willy Wonka",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-willy-wonka.webp",
          "sourcePage": "https://roalddahl.fandom.com/wiki/Willy_Wonka",
          "imageSource": "local-fandom-download",
          "franchise": "Roald Dahl",
          "fandomWiki": "roalddahl",
          "fandomPage": "Willy Wonka",
          "recognisability": "high",
          "familyId": "franchise:roald-dahl",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-paddington-bear",
          "label": "Paddington Bear",
          "spokenName": "Paddington Bear",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-paddington-bear.webp",
          "sourcePage": "https://paddingtonbear.fandom.com/wiki/Paddington_Brown",
          "imageSource": "local-fandom-download",
          "franchise": "Paddington",
          "fandomWiki": "paddingtonbear",
          "fandomPage": "Paddington Brown",
          "recognisability": "high",
          "familyId": "franchise:paddington",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-tinker-bell",
          "label": "Tinker Bell",
          "spokenName": "Tinker Bell",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-tinker-bell.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Tinker_Bell",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Tinker Bell",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-alice",
          "label": "Alice",
          "spokenName": "Alice",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-alice.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Alice",
          "imageSource": "local-fandom-download",
          "franchise": "Disney",
          "fandomWiki": "disney",
          "fandomPage": "Alice",
          "recognisability": "high",
          "familyId": "franchise:disney",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-frodo-baggins",
          "label": "Frodo Baggins",
          "spokenName": "Frodo Baggins",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-frodo-baggins.webp",
          "sourcePage": "https://lotr.fandom.com/wiki/Frodo_Baggins",
          "imageSource": "local-fandom-download",
          "franchise": "The Lord of the Rings",
          "fandomWiki": "lotr",
          "fandomPage": "Frodo Baggins",
          "recognisability": "high",
          "familyId": "franchise:the-lord-of-the-rings",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-neo",
          "label": "Neo",
          "spokenName": "Neo",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-neo.webp",
          "sourcePage": "https://matrix.fandom.com/wiki/Neo",
          "imageSource": "local-fandom-download",
          "franchise": "The Matrix",
          "fandomWiki": "matrix",
          "fandomPage": "Neo",
          "recognisability": "high",
          "familyId": "franchise:the-matrix",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-emmet",
          "label": "Emmet",
          "spokenName": "Emmet",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-emmet.webp",
          "sourcePage": "https://thelegomovie.fandom.com/wiki/Emmet_Brickowski",
          "imageSource": "local-fandom-download",
          "franchise": "The Lego Movie",
          "fandomWiki": "thelegomovie",
          "fandomPage": "Emmet Brickowski",
          "recognisability": "high",
          "familyId": "franchise:the-lego-movie",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-batman",
          "label": "Batman",
          "spokenName": "Batman",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-batman.webp",
          "sourcePage": "https://dc.fandom.com/wiki/Batman",
          "imageSource": "local-fandom-download",
          "franchise": "DC",
          "fandomWiki": "dc",
          "fandomPage": "Batman",
          "recognisability": "high",
          "familyId": "franchise:dc",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-superman",
          "label": "Superman",
          "spokenName": "Superman",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-superman.webp",
          "sourcePage": "https://dc.fandom.com/wiki/Superman",
          "imageSource": "local-fandom-download",
          "franchise": "DC",
          "fandomWiki": "dc",
          "fandomPage": "Superman",
          "recognisability": "high",
          "familyId": "franchise:dc",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-wonder-woman",
          "label": "Wonder Woman",
          "spokenName": "Wonder Woman",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-wonder-woman.webp",
          "sourcePage": "https://dc.fandom.com/wiki/Wonder_Woman",
          "imageSource": "local-fandom-download",
          "franchise": "DC",
          "fandomWiki": "dc",
          "fandomPage": "Wonder Woman",
          "recognisability": "high",
          "familyId": "franchise:dc",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-thanos",
          "label": "Thanos",
          "spokenName": "Thanos",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-thanos.webp",
          "sourcePage": "https://marvel.fandom.com/wiki/Thanos_(Earth-TRN666)",
          "imageSource": "local-fandom-download",
          "franchise": "Marvel",
          "fandomWiki": "marvel",
          "fandomPage": "Thanos (Earth-TRN666)",
          "recognisability": "high",
          "familyId": "franchise:marvel",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-wolverine",
          "label": "Wolverine",
          "spokenName": "Wolverine",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-wolverine.webp",
          "sourcePage": "https://marvel.fandom.com/wiki/Wolverine_Vol_1_1",
          "imageSource": "local-fandom-download",
          "franchise": "Marvel",
          "fandomWiki": "marvel",
          "fandomPage": "Wolverine Vol 1 1",
          "recognisability": "high",
          "familyId": "franchise:marvel",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-ant-man",
          "label": "Ant-Man",
          "spokenName": "Ant-Man",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-ant-man.webp",
          "sourcePage": "https://marvel.fandom.com/wiki/Ant-Man_(film)",
          "imageSource": "local-fandom-download",
          "franchise": "Marvel",
          "fandomWiki": "marvel",
          "fandomPage": "Ant-Man (film)",
          "recognisability": "high",
          "familyId": "franchise:marvel",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-aquaman",
          "label": "Aquaman",
          "spokenName": "Aquaman",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-aquaman.webp",
          "sourcePage": "https://dc.fandom.com/wiki/Aquaman",
          "imageSource": "local-fandom-download",
          "franchise": "DC",
          "fandomWiki": "dc",
          "fandomPage": "Aquaman",
          "recognisability": "high",
          "familyId": "franchise:dc",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-shazam",
          "label": "Shazam",
          "spokenName": "Shazam",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-shazam.webp",
          "sourcePage": "https://dc.fandom.com/wiki/Shazam",
          "imageSource": "local-fandom-download",
          "franchise": "DC",
          "fandomWiki": "dc",
          "fandomPage": "Shazam",
          "recognisability": "high",
          "familyId": "franchise:dc",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-katniss-everdeen",
          "label": "Katniss Everdeen",
          "spokenName": "Katniss Everdeen",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-katniss-everdeen.webp",
          "sourcePage": "https://thehungergames.fandom.com/wiki/Katniss_Everdeen",
          "imageSource": "local-fandom-download",
          "franchise": "The Hunger Games",
          "fandomWiki": "thehungergames",
          "fandomPage": "Katniss Everdeen",
          "recognisability": "high",
          "familyId": "franchise:the-hunger-games",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-the-grinch",
          "label": "The Grinch",
          "spokenName": "The Grinch",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-the-grinch.webp",
          "sourcePage": "https://seuss.fandom.com/wiki/The_Grinch",
          "imageSource": "local-fandom-download",
          "franchise": "Dr. Seuss",
          "fandomWiki": "seuss",
          "fandomPage": "The Grinch",
          "recognisability": "high",
          "familyId": "franchise:dr-seuss",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-film-kevin-mccallister",
          "label": "Kevin McCallister",
          "spokenName": "Kevin McCallister",
          "subcategoryId": "film-characters",
          "imagePath": "../../assets/images/clue-items/characters/film-characters/character-film-kevin-mccallister.webp",
          "sourcePage": "https://homealone.fandom.com/wiki/Kevin_McCallister",
          "imageSource": "local-fandom-download",
          "franchise": "Home Alone",
          "fandomWiki": "homealone",
          "fandomPage": "Kevin McCallister",
          "recognisability": "high",
          "familyId": "franchise:home-alone",
          "tags": [
            "character",
            "film-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-tv-dalek",
          "label": "Dalek",
          "spokenName": "Dalek",
          "subcategoryId": "television-characters",
          "imagePath": "../../assets/images/clue-items/characters/television-characters/character-tv-dalek.webp",
          "sourcePage": "https://tardis.fandom.com/wiki/Dalek",
          "imageSource": "local-fandom-download",
          "franchise": "Doctor Who",
          "fandomWiki": "tardis",
          "fandomPage": "Dalek",
          "recognisability": "high",
          "familyId": "franchise:doctor-who",
          "tags": [
            "character",
            "television-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-tv-eleven",
          "label": "Eleven",
          "spokenName": "Eleven",
          "subcategoryId": "television-characters",
          "imagePath": "../../assets/images/clue-items/characters/television-characters/character-tv-eleven.webp",
          "sourcePage": "https://strangerthings.fandom.com/wiki/Eleven",
          "imageSource": "local-fandom-download",
          "franchise": "Stranger Things",
          "fandomWiki": "strangerthings",
          "fandomPage": "Eleven",
          "recognisability": "high",
          "familyId": "franchise:stranger-things",
          "tags": [
            "character",
            "television-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-tv-mr-bean",
          "label": "Mr Bean",
          "spokenName": "Mr Bean",
          "subcategoryId": "television-characters",
          "imagePath": "../../assets/images/clue-items/characters/television-characters/character-tv-mr-bean.webp",
          "sourcePage": "https://mrbean.fandom.com/wiki/Mr._Bean_(character)",
          "imageSource": "local-fandom-download",
          "franchise": "Mr Bean",
          "fandomWiki": "mrbean",
          "fandomPage": "Mr. Bean (character)",
          "recognisability": "high",
          "familyId": "franchise:mr-bean",
          "tags": [
            "character",
            "television-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-tv-sheldon-cooper",
          "label": "Sheldon Cooper",
          "spokenName": "Sheldon Cooper",
          "subcategoryId": "television-characters",
          "imagePath": "../../assets/images/clue-items/characters/television-characters/character-tv-sheldon-cooper.webp",
          "sourcePage": "https://bigbangtheory.fandom.com/wiki/Sheldon_Cooper",
          "imageSource": "local-fandom-download",
          "franchise": "The Big Bang Theory",
          "fandomWiki": "bigbangtheory",
          "fandomPage": "Sheldon Cooper",
          "recognisability": "high",
          "familyId": "franchise:the-big-bang-theory",
          "tags": [
            "character",
            "television-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-tv-joey-tribbiani",
          "label": "Joey Tribbiani",
          "spokenName": "Joey Tribbiani",
          "subcategoryId": "television-characters",
          "imagePath": "../../assets/images/clue-items/characters/television-characters/character-tv-joey-tribbiani.webp",
          "sourcePage": "https://friends.fandom.com/wiki/Joey_Tribbiani",
          "imageSource": "local-fandom-download",
          "franchise": "Friends",
          "fandomWiki": "friends",
          "fandomPage": "Joey Tribbiani",
          "recognisability": "high",
          "familyId": "franchise:friends",
          "tags": [
            "character",
            "television-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-tv-jake-peralta",
          "label": "Jake Peralta",
          "spokenName": "Jake Peralta",
          "subcategoryId": "television-characters",
          "imagePath": "../../assets/images/clue-items/characters/television-characters/character-tv-jake-peralta.webp",
          "sourcePage": "https://brooklyn99.fandom.com/wiki/Jake_Peralta",
          "imageSource": "local-fandom-download",
          "franchise": "Brooklyn Nine-Nine",
          "fandomWiki": "brooklyn99",
          "fandomPage": "Jake Peralta",
          "recognisability": "high",
          "familyId": "franchise:brooklyn-nine-nine",
          "tags": [
            "character",
            "television-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-tv-dwight-schrute",
          "label": "Dwight Schrute",
          "spokenName": "Dwight Schrute",
          "subcategoryId": "television-characters",
          "imagePath": "../../assets/images/clue-items/characters/television-characters/character-tv-dwight-schrute.webp",
          "sourcePage": "https://theoffice.fandom.com/wiki/Dwight_Schrute",
          "imageSource": "local-fandom-download",
          "franchise": "The Office",
          "fandomWiki": "theoffice",
          "fandomPage": "Dwight Schrute",
          "recognisability": "high",
          "familyId": "franchise:the-office",
          "tags": [
            "character",
            "television-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-tv-spock",
          "label": "Spock",
          "spokenName": "Spock",
          "subcategoryId": "television-characters",
          "imagePath": "../../assets/images/clue-items/characters/television-characters/character-tv-spock.webp",
          "sourcePage": "https://memoryalpha.fandom.com/wiki/Spock",
          "imageSource": "local-fandom-download",
          "franchise": "Star Trek",
          "fandomWiki": "memoryalpha",
          "fandomPage": "Spock",
          "recognisability": "high",
          "familyId": "franchise:star-trek",
          "tags": [
            "character",
            "television-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-tv-kermit-the-frog",
          "label": "Kermit the Frog",
          "spokenName": "Kermit the Frog",
          "subcategoryId": "television-characters",
          "imagePath": "../../assets/images/clue-items/characters/television-characters/character-tv-kermit-the-frog.webp",
          "sourcePage": "https://muppet.fandom.com/wiki/Kermit_the_Frog",
          "imageSource": "local-fandom-download",
          "franchise": "The Muppets / Sesame Street",
          "fandomWiki": "muppet",
          "fandomPage": "Kermit the Frog",
          "recognisability": "high",
          "familyId": "franchise:the-muppets-sesame-street",
          "tags": [
            "character",
            "television-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-tv-miss-piggy",
          "label": "Miss Piggy",
          "spokenName": "Miss Piggy",
          "subcategoryId": "television-characters",
          "imagePath": "../../assets/images/clue-items/characters/television-characters/character-tv-miss-piggy.webp",
          "sourcePage": "https://muppet.fandom.com/wiki/Miss_Piggy",
          "imageSource": "local-fandom-download",
          "franchise": "The Muppets / Sesame Street",
          "fandomWiki": "muppet",
          "fandomPage": "Miss Piggy",
          "recognisability": "high",
          "familyId": "franchise:the-muppets-sesame-street",
          "tags": [
            "character",
            "television-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-tv-elmo",
          "label": "Elmo",
          "spokenName": "Elmo",
          "subcategoryId": "television-characters",
          "imagePath": "../../assets/images/clue-items/characters/television-characters/character-tv-elmo.webp",
          "sourcePage": "https://muppet.fandom.com/wiki/Elmo",
          "imageSource": "local-fandom-download",
          "franchise": "The Muppets / Sesame Street",
          "fandomWiki": "muppet",
          "fandomPage": "Elmo",
          "recognisability": "high",
          "familyId": "franchise:the-muppets-sesame-street",
          "tags": [
            "character",
            "television-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-tv-big-bird",
          "label": "Big Bird",
          "spokenName": "Big Bird",
          "subcategoryId": "television-characters",
          "imagePath": "../../assets/images/clue-items/characters/television-characters/character-tv-big-bird.webp",
          "sourcePage": "https://muppet.fandom.com/wiki/Big_Bird",
          "imageSource": "local-fandom-download",
          "franchise": "The Muppets / Sesame Street",
          "fandomWiki": "muppet",
          "fandomPage": "Big Bird",
          "recognisability": "high",
          "familyId": "franchise:the-muppets-sesame-street",
          "tags": [
            "character",
            "television-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-tv-oscar-the-grouch",
          "label": "Oscar the Grouch",
          "spokenName": "Oscar the Grouch",
          "subcategoryId": "television-characters",
          "imagePath": "../../assets/images/clue-items/characters/television-characters/character-tv-oscar-the-grouch.webp",
          "sourcePage": "https://muppet.fandom.com/wiki/Oscar_the_Grouch",
          "imageSource": "local-fandom-download",
          "franchise": "The Muppets / Sesame Street",
          "fandomWiki": "muppet",
          "fandomPage": "Oscar the Grouch",
          "recognisability": "high",
          "familyId": "franchise:the-muppets-sesame-street",
          "tags": [
            "character",
            "television-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-tv-pingu",
          "label": "Pingu",
          "spokenName": "Pingu",
          "subcategoryId": "television-characters",
          "imagePath": "../../assets/images/clue-items/characters/television-characters/character-tv-pingu.webp",
          "sourcePage": "https://pingu.fandom.com/wiki/Pingu",
          "imageSource": "local-fandom-download",
          "franchise": "Pingu",
          "fandomWiki": "pingu",
          "fandomPage": "Pingu",
          "recognisability": "high",
          "familyId": "franchise:pingu",
          "tags": [
            "character",
            "television-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-tv-fireman-sam",
          "label": "Fireman Sam",
          "spokenName": "Fireman Sam",
          "subcategoryId": "television-characters",
          "imagePath": "../../assets/images/clue-items/characters/television-characters/character-tv-fireman-sam.webp",
          "sourcePage": "https://firemansam.fandom.com/wiki/Fireman_Sam",
          "imageSource": "local-fandom-download",
          "franchise": "Fireman Sam",
          "fandomWiki": "firemansam",
          "fandomPage": "Fireman Sam",
          "recognisability": "high",
          "familyId": "franchise:fireman-sam",
          "tags": [
            "character",
            "television-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-tv-danger-mouse",
          "label": "Danger Mouse",
          "spokenName": "Danger Mouse",
          "subcategoryId": "television-characters",
          "imagePath": "../../assets/images/clue-items/characters/television-characters/character-tv-danger-mouse.webp",
          "sourcePage": "https://dangermouse.fandom.com/wiki/Danger_Mouse",
          "imageSource": "local-fandom-download",
          "franchise": "Danger Mouse",
          "fandomWiki": "dangermouse",
          "fandomPage": "Danger Mouse",
          "recognisability": "high",
          "familyId": "franchise:danger-mouse",
          "tags": [
            "character",
            "television-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-mario",
          "label": "Mario",
          "spokenName": "Mario",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-mario.webp",
          "sourcePage": "https://mario.fandom.com/wiki/Mario",
          "imageSource": "local-fandom-download",
          "franchise": "Super Mario",
          "fandomWiki": "mario",
          "fandomPage": "Mario",
          "recognisability": "high",
          "familyId": "franchise:super-mario",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-luigi",
          "label": "Luigi",
          "spokenName": "Luigi",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-luigi.webp",
          "sourcePage": "https://mario.fandom.com/wiki/Luigi",
          "imageSource": "local-fandom-download",
          "franchise": "Super Mario",
          "fandomWiki": "mario",
          "fandomPage": "Luigi",
          "recognisability": "high",
          "familyId": "franchise:super-mario",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-princess-peach",
          "label": "Princess Peach",
          "spokenName": "Princess Peach",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-princess-peach.webp",
          "sourcePage": "https://mario.fandom.com/wiki/Princess_Peach",
          "imageSource": "local-fandom-download",
          "franchise": "Super Mario",
          "fandomWiki": "mario",
          "fandomPage": "Princess Peach",
          "recognisability": "high",
          "familyId": "franchise:super-mario",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-bowser",
          "label": "Bowser",
          "spokenName": "Bowser",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-bowser.webp",
          "sourcePage": "https://mario.fandom.com/wiki/Bowser",
          "imageSource": "local-fandom-download",
          "franchise": "Super Mario",
          "fandomWiki": "mario",
          "fandomPage": "Bowser",
          "recognisability": "high",
          "familyId": "franchise:super-mario",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-yoshi",
          "label": "Yoshi",
          "spokenName": "Yoshi",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-yoshi.webp",
          "sourcePage": "https://mario.fandom.com/wiki/Yoshi_(character)",
          "imageSource": "local-fandom-download",
          "franchise": "Super Mario",
          "fandomWiki": "mario",
          "fandomPage": "Yoshi (character)",
          "recognisability": "high",
          "familyId": "franchise:super-mario",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-toad",
          "label": "Toad",
          "spokenName": "Toad",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-toad.webp",
          "sourcePage": "https://mario.fandom.com/wiki/Toad_(character)",
          "imageSource": "local-fandom-download",
          "franchise": "Super Mario",
          "fandomWiki": "mario",
          "fandomPage": "Toad (character)",
          "recognisability": "high",
          "familyId": "franchise:super-mario",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-wario",
          "label": "Wario",
          "spokenName": "Wario",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-wario.webp",
          "sourcePage": "https://mario.fandom.com/wiki/Wario",
          "imageSource": "local-fandom-download",
          "franchise": "Super Mario",
          "fandomWiki": "mario",
          "fandomPage": "Wario",
          "recognisability": "high",
          "familyId": "franchise:super-mario",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-waluigi",
          "label": "Waluigi",
          "spokenName": "Waluigi",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-waluigi.webp",
          "sourcePage": "https://mario.fandom.com/wiki/Waluigi",
          "imageSource": "local-fandom-download",
          "franchise": "Super Mario",
          "fandomWiki": "mario",
          "fandomPage": "Waluigi",
          "recognisability": "high",
          "familyId": "franchise:super-mario",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-donkey-kong",
          "label": "Donkey Kong",
          "spokenName": "Donkey Kong",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-donkey-kong.webp",
          "sourcePage": "https://mario.fandom.com/wiki/Donkey_Kong_(character)",
          "imageSource": "local-fandom-download",
          "franchise": "Super Mario",
          "fandomWiki": "mario",
          "fandomPage": "Donkey Kong (character)",
          "recognisability": "high",
          "familyId": "franchise:super-mario",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-diddy-kong",
          "label": "Diddy Kong",
          "spokenName": "Diddy Kong",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-diddy-kong.webp",
          "sourcePage": "https://mario.fandom.com/wiki/Diddy_Kong",
          "imageSource": "local-fandom-download",
          "franchise": "Super Mario",
          "fandomWiki": "mario",
          "fandomPage": "Diddy Kong",
          "recognisability": "high",
          "familyId": "franchise:super-mario",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-rosalina",
          "label": "Rosalina",
          "spokenName": "Rosalina",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-rosalina.webp",
          "sourcePage": "https://mario.fandom.com/wiki/Rosalina",
          "imageSource": "local-fandom-download",
          "franchise": "Super Mario",
          "fandomWiki": "mario",
          "fandomPage": "Rosalina",
          "recognisability": "high",
          "familyId": "franchise:super-mario",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-link",
          "label": "Link",
          "spokenName": "Link",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-link.webp",
          "sourcePage": "https://zelda.fandom.com/wiki/Link",
          "imageSource": "local-fandom-download",
          "franchise": "The Legend of Zelda",
          "fandomWiki": "zelda",
          "fandomPage": "Link",
          "recognisability": "high",
          "familyId": "franchise:the-legend-of-zelda",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-princess-zelda",
          "label": "Princess Zelda",
          "spokenName": "Princess Zelda",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-princess-zelda.webp",
          "sourcePage": "https://zelda.fandom.com/wiki/Princess_Zelda",
          "imageSource": "local-fandom-download",
          "franchise": "The Legend of Zelda",
          "fandomWiki": "zelda",
          "fandomPage": "Princess Zelda",
          "recognisability": "high",
          "familyId": "franchise:the-legend-of-zelda",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-ganondorf",
          "label": "Ganondorf",
          "spokenName": "Ganondorf",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-ganondorf.webp",
          "sourcePage": "https://zelda.fandom.com/wiki/Ganondorf",
          "imageSource": "local-fandom-download",
          "franchise": "The Legend of Zelda",
          "fandomWiki": "zelda",
          "fandomPage": "Ganondorf",
          "recognisability": "high",
          "familyId": "franchise:the-legend-of-zelda",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-kirby",
          "label": "Kirby",
          "spokenName": "Kirby",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-kirby.webp",
          "sourcePage": "https://kirby.fandom.com/wiki/Kirby",
          "imageSource": "local-fandom-download",
          "franchise": "Kirby",
          "fandomWiki": "kirby",
          "fandomPage": "Kirby",
          "recognisability": "high",
          "familyId": "franchise:kirby",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-samus-aran",
          "label": "Samus Aran",
          "spokenName": "Samus Aran",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-samus-aran.webp",
          "sourcePage": "https://metroid.fandom.com/wiki/Samus_Aran",
          "imageSource": "local-fandom-download",
          "franchise": "Metroid",
          "fandomWiki": "metroid",
          "fandomPage": "Samus Aran",
          "recognisability": "high",
          "familyId": "franchise:metroid",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-fox-mccloud",
          "label": "Fox McCloud",
          "spokenName": "Fox McCloud",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-fox-mccloud.webp",
          "sourcePage": "https://starfox.fandom.com/wiki/Fox_McCloud",
          "imageSource": "local-fandom-download",
          "franchise": "Star Fox",
          "fandomWiki": "starfox",
          "fandomPage": "Fox McCloud",
          "recognisability": "high",
          "familyId": "franchise:star-fox",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-pikachu",
          "label": "Pikachu",
          "spokenName": "Pikachu",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-pikachu.webp",
          "sourcePage": "https://pokemon.fandom.com/wiki/Pikachu",
          "imageSource": "local-fandom-download",
          "franchise": "Pokémon",
          "fandomWiki": "pokemon",
          "fandomPage": "Pikachu",
          "recognisability": "high",
          "familyId": "franchise:pok-mon",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-charizard",
          "label": "Charizard",
          "spokenName": "Charizard",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-charizard.webp",
          "sourcePage": "https://pokemon.fandom.com/wiki/Charizard",
          "imageSource": "local-fandom-download",
          "franchise": "Pokémon",
          "fandomWiki": "pokemon",
          "fandomPage": "Charizard",
          "recognisability": "high",
          "familyId": "franchise:pok-mon",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-eevee",
          "label": "Eevee",
          "spokenName": "Eevee",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-eevee.webp",
          "sourcePage": "https://pokemon.fandom.com/wiki/Eevee",
          "imageSource": "local-fandom-download",
          "franchise": "Pokémon",
          "fandomWiki": "pokemon",
          "fandomPage": "Eevee",
          "recognisability": "high",
          "familyId": "franchise:pok-mon",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-mewtwo",
          "label": "Mewtwo",
          "spokenName": "Mewtwo",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-mewtwo.webp",
          "sourcePage": "https://pokemon.fandom.com/wiki/Mewtwo",
          "imageSource": "local-fandom-download",
          "franchise": "Pokémon",
          "fandomWiki": "pokemon",
          "fandomPage": "Mewtwo",
          "recognisability": "high",
          "familyId": "franchise:pok-mon",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-jigglypuff",
          "label": "Jigglypuff",
          "spokenName": "Jigglypuff",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-jigglypuff.webp",
          "sourcePage": "https://pokemon.fandom.com/wiki/Jigglypuff",
          "imageSource": "local-fandom-download",
          "franchise": "Pokémon",
          "fandomWiki": "pokemon",
          "fandomPage": "Jigglypuff",
          "recognisability": "high",
          "familyId": "franchise:pok-mon",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-snorlax",
          "label": "Snorlax",
          "spokenName": "Snorlax",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-snorlax.webp",
          "sourcePage": "https://pokemon.fandom.com/wiki/Snorlax",
          "imageSource": "local-fandom-download",
          "franchise": "Pokémon",
          "fandomWiki": "pokemon",
          "fandomPage": "Snorlax",
          "recognisability": "high",
          "familyId": "franchise:pok-mon",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-psyduck",
          "label": "Psyduck",
          "spokenName": "Psyduck",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-psyduck.webp",
          "sourcePage": "https://pokemon.fandom.com/wiki/Psyduck",
          "imageSource": "local-fandom-download",
          "franchise": "Pokémon",
          "fandomWiki": "pokemon",
          "fandomPage": "Psyduck",
          "recognisability": "high",
          "familyId": "franchise:pok-mon",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-meowth",
          "label": "Meowth",
          "spokenName": "Meowth",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-meowth.webp",
          "sourcePage": "https://pokemon.fandom.com/wiki/Meowth",
          "imageSource": "local-fandom-download",
          "franchise": "Pokémon",
          "fandomWiki": "pokemon",
          "fandomPage": "Meowth",
          "recognisability": "high",
          "familyId": "franchise:pok-mon",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-sonic",
          "label": "Sonic",
          "spokenName": "Sonic",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-sonic.webp",
          "sourcePage": "https://sonic.fandom.com/wiki/Sonic_the_Hedgehog",
          "imageSource": "local-fandom-download",
          "franchise": "Sonic the Hedgehog",
          "fandomWiki": "sonic",
          "fandomPage": "Sonic the Hedgehog",
          "recognisability": "high",
          "familyId": "franchise:sonic-the-hedgehog",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-tails",
          "label": "Tails",
          "spokenName": "Tails",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-tails.webp",
          "sourcePage": "https://sonic.fandom.com/wiki/Miles_%22Tails%22_Prower",
          "imageSource": "local-fandom-download",
          "franchise": "Sonic the Hedgehog",
          "fandomWiki": "sonic",
          "fandomPage": "Miles \"Tails\" Prower",
          "recognisability": "high",
          "familyId": "franchise:sonic-the-hedgehog",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-knuckles",
          "label": "Knuckles",
          "spokenName": "Knuckles",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-knuckles.webp",
          "sourcePage": "https://sonic.fandom.com/wiki/Knuckles_the_Echidna",
          "imageSource": "local-fandom-download",
          "franchise": "Sonic the Hedgehog",
          "fandomWiki": "sonic",
          "fandomPage": "Knuckles the Echidna",
          "recognisability": "high",
          "familyId": "franchise:sonic-the-hedgehog",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-shadow",
          "label": "Shadow",
          "spokenName": "Shadow",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-shadow.webp",
          "sourcePage": "https://sonic.fandom.com/wiki/Shadow_the_Hedgehog",
          "imageSource": "local-fandom-download",
          "franchise": "Sonic the Hedgehog",
          "fandomWiki": "sonic",
          "fandomPage": "Shadow the Hedgehog",
          "recognisability": "high",
          "familyId": "franchise:sonic-the-hedgehog",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-amy-rose",
          "label": "Amy Rose",
          "spokenName": "Amy Rose",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-amy-rose.webp",
          "sourcePage": "https://sonic.fandom.com/wiki/Amy_Rose",
          "imageSource": "local-fandom-download",
          "franchise": "Sonic the Hedgehog",
          "fandomWiki": "sonic",
          "fandomPage": "Amy Rose",
          "recognisability": "high",
          "familyId": "franchise:sonic-the-hedgehog",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-dr-eggman",
          "label": "Dr. Eggman",
          "spokenName": "Dr. Eggman",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-dr-eggman.webp",
          "sourcePage": "https://sonic.fandom.com/wiki/Doctor_Eggman",
          "imageSource": "local-fandom-download",
          "franchise": "Sonic the Hedgehog",
          "fandomWiki": "sonic",
          "fandomPage": "Doctor Eggman",
          "recognisability": "high",
          "familyId": "franchise:sonic-the-hedgehog",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-crash-bandicoot",
          "label": "Crash Bandicoot",
          "spokenName": "Crash Bandicoot",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-crash-bandicoot.webp",
          "sourcePage": "https://crashbandicoot.fandom.com/wiki/Crash_Bandicoot",
          "imageSource": "local-fandom-download",
          "franchise": "Crash Bandicoot",
          "fandomWiki": "crashbandicoot",
          "fandomPage": "Crash Bandicoot",
          "recognisability": "high",
          "familyId": "franchise:crash-bandicoot",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-master-chief",
          "label": "Master Chief",
          "spokenName": "Master Chief",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-master-chief.webp",
          "sourcePage": "https://halo.fandom.com/wiki/John-117",
          "imageSource": "local-fandom-download",
          "franchise": "Halo",
          "fandomWiki": "halo",
          "fandomPage": "John-117",
          "recognisability": "high",
          "familyId": "franchise:halo",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-steve",
          "label": "Steve",
          "spokenName": "Steve",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-steve.webp",
          "sourcePage": "https://minecraft.fandom.com/wiki/Player",
          "imageSource": "local-fandom-download",
          "franchise": "Minecraft",
          "fandomWiki": "minecraft",
          "fandomPage": "Player",
          "recognisability": "high",
          "familyId": "franchise:minecraft",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-alex",
          "label": "Alex",
          "spokenName": "Alex",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-alex.webp",
          "sourcePage": "https://minecraft.fandom.com/wiki/Player",
          "imageSource": "local-fandom-download",
          "franchise": "Minecraft",
          "fandomWiki": "minecraft",
          "fandomPage": "Player",
          "recognisability": "high",
          "familyId": "franchise:minecraft",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-creeper",
          "label": "Creeper",
          "spokenName": "Creeper",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-creeper.webp",
          "sourcePage": "https://minecraft.fandom.com/wiki/Creeper",
          "imageSource": "local-fandom-download",
          "franchise": "Minecraft",
          "fandomWiki": "minecraft",
          "fandomPage": "Creeper",
          "recognisability": "high",
          "familyId": "franchise:minecraft",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-enderman",
          "label": "Enderman",
          "spokenName": "Enderman",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-enderman.webp",
          "sourcePage": "https://minecraft.fandom.com/wiki/Enderman",
          "imageSource": "local-fandom-download",
          "franchise": "Minecraft",
          "fandomWiki": "minecraft",
          "fandomPage": "Enderman",
          "recognisability": "high",
          "familyId": "franchise:minecraft",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-sackboy",
          "label": "Sackboy",
          "spokenName": "Sackboy",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-sackboy.webp",
          "sourcePage": "https://littlebigplanet.fandom.com/wiki/Sackboy",
          "imageSource": "local-fandom-download",
          "franchise": "LittleBigPlanet",
          "fandomWiki": "littlebigplanet",
          "fandomPage": "Sackboy",
          "recognisability": "high",
          "familyId": "franchise:littlebigplanet",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-jonesy",
          "label": "Jonesy",
          "spokenName": "Jonesy",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-jonesy.webp",
          "sourcePage": "https://fortnite.fandom.com/wiki/Jonesy_(Save_the_World)",
          "imageSource": "local-fandom-download",
          "franchise": "Fortnite",
          "fandomWiki": "fortnite",
          "fandomPage": "Jonesy (Save the World)",
          "recognisability": "high",
          "familyId": "franchise:fortnite",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-pac-man",
          "label": "Pac-Man",
          "spokenName": "Pac-Man",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-pac-man.webp",
          "sourcePage": "https://pacman.fandom.com/wiki/Pac-Man",
          "imageSource": "local-fandom-download",
          "franchise": "Pac-Man",
          "fandomWiki": "pacman",
          "fandomPage": "Pac-Man",
          "recognisability": "high",
          "familyId": "franchise:pac-man",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-cloud-strife",
          "label": "Cloud Strife",
          "spokenName": "Cloud Strife",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-cloud-strife.webp",
          "sourcePage": "https://finalfantasy.fandom.com/wiki/Cloud_Strife",
          "imageSource": "local-fandom-download",
          "franchise": "Final Fantasy",
          "fandomWiki": "finalfantasy",
          "fandomPage": "Cloud Strife",
          "recognisability": "high",
          "familyId": "franchise:final-fantasy",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-sephiroth",
          "label": "Sephiroth",
          "spokenName": "Sephiroth",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-sephiroth.webp",
          "sourcePage": "https://finalfantasy.fandom.com/wiki/Sephiroth",
          "imageSource": "local-fandom-download",
          "franchise": "Final Fantasy",
          "fandomWiki": "finalfantasy",
          "fandomPage": "Sephiroth",
          "recognisability": "high",
          "familyId": "franchise:final-fantasy",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-sora",
          "label": "Sora",
          "spokenName": "Sora",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-sora.webp",
          "sourcePage": "https://kingdomhearts.fandom.com/wiki/Sora",
          "imageSource": "local-fandom-download",
          "franchise": "Kingdom Hearts",
          "fandomWiki": "kingdomhearts",
          "fandomPage": "Sora",
          "recognisability": "high",
          "familyId": "franchise:kingdom-hearts",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-banjo",
          "label": "Banjo",
          "spokenName": "Banjo",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-banjo.webp",
          "sourcePage": "https://banjokazooie.fandom.com/wiki/Banjo",
          "imageSource": "local-fandom-download",
          "franchise": "Banjo-Kazooie",
          "fandomWiki": "banjokazooie",
          "fandomPage": "Banjo",
          "recognisability": "high",
          "familyId": "franchise:banjo-kazooie",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-shovel-knight",
          "label": "Shovel Knight",
          "spokenName": "Shovel Knight",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-shovel-knight.webp",
          "sourcePage": "https://shovelknight.fandom.com/wiki/Shovel_Knight",
          "imageSource": "local-fandom-download",
          "franchise": "Shovel Knight",
          "fandomWiki": "shovelknight",
          "fandomPage": "Shovel Knight",
          "recognisability": "high",
          "familyId": "franchise:shovel-knight",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-papyrus",
          "label": "Papyrus",
          "spokenName": "Papyrus",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-papyrus.webp",
          "sourcePage": "https://undertale.fandom.com/wiki/Papyrus",
          "imageSource": "local-fandom-download",
          "franchise": "Undertale",
          "fandomWiki": "undertale",
          "fandomPage": "Papyrus",
          "recognisability": "high",
          "familyId": "franchise:undertale",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-isabelle",
          "label": "Isabelle",
          "spokenName": "Isabelle",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-isabelle.webp",
          "sourcePage": "https://animalcrossing.fandom.com/wiki/Isabelle",
          "imageSource": "local-fandom-download",
          "franchise": "Animal Crossing",
          "fandomWiki": "animalcrossing",
          "fandomPage": "Isabelle",
          "recognisability": "high",
          "familyId": "franchise:animal-crossing",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-tom-nook",
          "label": "Tom Nook",
          "spokenName": "Tom Nook",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-tom-nook.webp",
          "sourcePage": "https://animalcrossing.fandom.com/wiki/Tom_Nook",
          "imageSource": "local-fandom-download",
          "franchise": "Animal Crossing",
          "fandomWiki": "animalcrossing",
          "fandomPage": "Tom Nook",
          "recognisability": "high",
          "familyId": "franchise:animal-crossing",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-inkling",
          "label": "Inkling",
          "spokenName": "Inkling",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-inkling.webp",
          "sourcePage": "https://splatoon.fandom.com/wiki/Inklings",
          "imageSource": "local-fandom-download",
          "franchise": "Splatoon",
          "fandomWiki": "splatoon",
          "fandomPage": "Inklings",
          "recognisability": "high",
          "familyId": "franchise:splatoon",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-captain-olimar",
          "label": "Captain Olimar",
          "spokenName": "Captain Olimar",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-captain-olimar.webp",
          "sourcePage": "https://pikmin.fandom.com/wiki/Captain_Olimar",
          "imageSource": "local-fandom-download",
          "franchise": "Pikmin",
          "fandomWiki": "pikmin",
          "fandomPage": "Captain Olimar",
          "recognisability": "high",
          "familyId": "franchise:pikmin",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-professor-layton",
          "label": "Professor Layton",
          "spokenName": "Professor Layton",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-professor-layton.webp",
          "sourcePage": "https://layton.fandom.com/wiki/Professor_Hershel_Layton",
          "imageSource": "local-fandom-download",
          "franchise": "Professor Layton",
          "fandomWiki": "layton",
          "fandomPage": "Professor Hershel Layton",
          "recognisability": "high",
          "familyId": "franchise:professor-layton",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-phoenix-wright",
          "label": "Phoenix Wright",
          "spokenName": "Phoenix Wright",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-phoenix-wright.webp",
          "sourcePage": "https://aceattorney.fandom.com/wiki/Phoenix_Wright",
          "imageSource": "local-fandom-download",
          "franchise": "Ace Attorney",
          "fandomWiki": "aceattorney",
          "fandomPage": "Phoenix Wright",
          "recognisability": "high",
          "familyId": "franchise:ace-attorney",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-red-bird",
          "label": "Red Bird",
          "spokenName": "Red Bird",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-red-bird.webp",
          "sourcePage": "https://angrybirds.fandom.com/wiki/Red",
          "imageSource": "local-fandom-download",
          "franchise": "Angry Birds",
          "fandomWiki": "angrybirds",
          "fandomPage": "Red",
          "recognisability": "high",
          "familyId": "franchise:angry-birds",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-king-pig",
          "label": "King Pig",
          "spokenName": "King Pig",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-king-pig.webp",
          "sourcePage": "https://angrybirds.fandom.com/wiki/King_Pig",
          "imageSource": "local-fandom-download",
          "franchise": "Angry Birds",
          "fandomWiki": "angrybirds",
          "fandomPage": "King Pig",
          "recognisability": "high",
          "familyId": "franchise:angry-birds",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-crazy-dave",
          "label": "Crazy Dave",
          "spokenName": "Crazy Dave",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-crazy-dave.webp",
          "sourcePage": "https://plantsvszombies.fandom.com/wiki/Crazy_Dave",
          "imageSource": "local-fandom-download",
          "franchise": "Plants vs. Zombies",
          "fandomWiki": "plantsvszombies",
          "fandomPage": "Crazy Dave",
          "recognisability": "high",
          "familyId": "franchise:plants-vs-zombies",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-princess-daisy",
          "label": "Princess Daisy",
          "spokenName": "Princess Daisy",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-princess-daisy.webp",
          "sourcePage": "https://mario.fandom.com/wiki/Princess_Daisy",
          "imageSource": "local-fandom-download",
          "franchise": "Super Mario",
          "fandomWiki": "mario",
          "fandomPage": "Princess Daisy",
          "recognisability": "high",
          "familyId": "franchise:super-mario",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-king-dedede",
          "label": "King Dedede",
          "spokenName": "King Dedede",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-king-dedede.webp",
          "sourcePage": "https://kirby.fandom.com/wiki/King_Dedede",
          "imageSource": "local-fandom-download",
          "franchise": "Kirby",
          "fandomWiki": "kirby",
          "fandomPage": "King Dedede",
          "recognisability": "high",
          "familyId": "franchise:kirby",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-game-meta-knight",
          "label": "Meta Knight",
          "spokenName": "Meta Knight",
          "subcategoryId": "video-game-characters",
          "imagePath": "../../assets/images/clue-items/characters/video-game-characters/character-game-meta-knight.webp",
          "sourcePage": "https://kirby.fandom.com/wiki/Meta_Knight",
          "imageSource": "local-fandom-download",
          "franchise": "Kirby",
          "fandomWiki": "kirby",
          "fandomPage": "Meta Knight",
          "recognisability": "high",
          "familyId": "franchise:kirby",
          "tags": [
            "character",
            "video-game-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-anime-ash-ketchum",
          "label": "Ash Ketchum",
          "spokenName": "Ash Ketchum",
          "subcategoryId": "anime-characters",
          "imagePath": "../../assets/images/clue-items/characters/anime-characters/character-anime-ash-ketchum.webp",
          "sourcePage": "https://pokemon.fandom.com/wiki/Ash_Ketchum",
          "imageSource": "local-fandom-download",
          "franchise": "Pokémon",
          "fandomWiki": "pokemon",
          "fandomPage": "Ash Ketchum",
          "recognisability": "high",
          "familyId": "franchise:pok-mon",
          "tags": [
            "character",
            "anime-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-anime-goku",
          "label": "Goku",
          "spokenName": "Goku",
          "subcategoryId": "anime-characters",
          "imagePath": "../../assets/images/clue-items/characters/anime-characters/character-anime-goku.webp",
          "sourcePage": "https://dragonball.fandom.com/wiki/Goku",
          "imageSource": "local-fandom-download",
          "franchise": "Dragon Ball",
          "fandomWiki": "dragonball",
          "fandomPage": "Goku",
          "recognisability": "high",
          "familyId": "franchise:dragon-ball",
          "tags": [
            "character",
            "anime-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-anime-totoro",
          "label": "Totoro",
          "spokenName": "Totoro",
          "subcategoryId": "anime-characters",
          "imagePath": "../../assets/images/clue-items/characters/anime-characters/character-anime-totoro.webp",
          "sourcePage": "https://ghibli.fandom.com/wiki/Totoro",
          "imageSource": "local-fandom-download",
          "franchise": "Studio Ghibli",
          "fandomWiki": "ghibli",
          "fandomPage": "Totoro",
          "recognisability": "high",
          "familyId": "franchise:studio-ghibli",
          "tags": [
            "character",
            "anime-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-anime-luffy",
          "label": "Luffy",
          "spokenName": "Luffy",
          "subcategoryId": "anime-characters",
          "imagePath": "../../assets/images/clue-items/characters/anime-characters/character-anime-luffy.webp",
          "sourcePage": "https://onepiece.fandom.com/wiki/Monkey_D._Luffy",
          "imageSource": "local-fandom-download",
          "franchise": "One Piece",
          "fandomWiki": "onepiece",
          "fandomPage": "Monkey D. Luffy",
          "recognisability": "high",
          "familyId": "franchise:one-piece",
          "tags": [
            "character",
            "anime-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-anime-hatsune-miku",
          "label": "Hatsune Miku",
          "spokenName": "Hatsune Miku",
          "subcategoryId": "anime-characters",
          "imagePath": "../../assets/images/clue-items/characters/anime-characters/character-anime-hatsune-miku.webp",
          "sourcePage": "https://vocaloid.fandom.com/wiki/Hatsune_Miku",
          "imageSource": "local-fandom-download",
          "franchise": "Vocaloid",
          "fandomWiki": "vocaloid",
          "fandomPage": "Hatsune Miku",
          "recognisability": "high",
          "familyId": "franchise:vocaloid",
          "tags": [
            "character",
            "anime-characters",
            "fandom-local"
          ]
        },
        {
          "id": "character-icon-hello-kitty",
          "label": "Hello Kitty",
          "spokenName": "Hello Kitty",
          "subcategoryId": "icons-and-mascots",
          "imagePath": "../../assets/images/clue-items/characters/icons-and-mascots/character-icon-hello-kitty.webp",
          "sourcePage": "https://hellokitty.fandom.com/wiki/Hello_Kitty",
          "imageSource": "local-fandom-download",
          "franchise": "Sanrio",
          "fandomWiki": "hellokitty",
          "fandomPage": "Hello Kitty",
          "recognisability": "high",
          "familyId": "franchise:sanrio",
          "tags": [
            "character",
            "icons-and-mascots",
            "fandom-local"
          ]
        },
        {
          "id": "character-icon-kuromi",
          "label": "Kuromi",
          "spokenName": "Kuromi",
          "subcategoryId": "icons-and-mascots",
          "imagePath": "../../assets/images/clue-items/characters/icons-and-mascots/character-icon-kuromi.webp",
          "sourcePage": "https://hellokitty.fandom.com/wiki/Kuromi",
          "imageSource": "local-fandom-download",
          "franchise": "Sanrio",
          "fandomWiki": "hellokitty",
          "fandomPage": "Kuromi",
          "recognisability": "high",
          "familyId": "franchise:sanrio",
          "tags": [
            "character",
            "icons-and-mascots",
            "fandom-local"
          ]
        },
        {
          "id": "character-icon-cinnamoroll",
          "label": "Cinnamoroll",
          "spokenName": "Cinnamoroll",
          "subcategoryId": "icons-and-mascots",
          "imagePath": "../../assets/images/clue-items/characters/icons-and-mascots/character-icon-cinnamoroll.webp",
          "sourcePage": "https://hellokitty.fandom.com/wiki/Cinnamoroll",
          "imageSource": "local-fandom-download",
          "franchise": "Sanrio",
          "fandomWiki": "hellokitty",
          "fandomPage": "Cinnamoroll",
          "recognisability": "high",
          "familyId": "franchise:sanrio",
          "tags": [
            "character",
            "icons-and-mascots",
            "fandom-local"
          ]
        },
        {
          "id": "character-icon-pompompurin",
          "label": "Pompompurin",
          "spokenName": "Pompompurin",
          "subcategoryId": "icons-and-mascots",
          "imagePath": "../../assets/images/clue-items/characters/icons-and-mascots/character-icon-pompompurin.webp",
          "sourcePage": "https://hellokitty.fandom.com/wiki/Pompompurin",
          "imageSource": "local-fandom-download",
          "franchise": "Sanrio",
          "fandomWiki": "hellokitty",
          "fandomPage": "Pompompurin",
          "recognisability": "high",
          "familyId": "franchise:sanrio",
          "tags": [
            "character",
            "icons-and-mascots",
            "fandom-local"
          ]
        },
        {
          "id": "character-icon-winnie-the-pooh",
          "label": "Winnie-the-Pooh",
          "spokenName": "Winnie-the-Pooh",
          "subcategoryId": "icons-and-mascots",
          "imagePath": "../../assets/images/clue-items/characters/icons-and-mascots/character-icon-winnie-the-pooh.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Winnie_the_Pooh",
          "imageSource": "local-fandom-download",
          "franchise": "Winnie the Pooh",
          "fandomWiki": "disney",
          "fandomPage": "Winnie the Pooh",
          "recognisability": "high",
          "familyId": "franchise:winnie-the-pooh",
          "tags": [
            "character",
            "icons-and-mascots",
            "fandom-local"
          ]
        },
        {
          "id": "character-icon-tigger",
          "label": "Tigger",
          "spokenName": "Tigger",
          "subcategoryId": "icons-and-mascots",
          "imagePath": "../../assets/images/clue-items/characters/icons-and-mascots/character-icon-tigger.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Tigger",
          "imageSource": "local-fandom-download",
          "franchise": "Winnie the Pooh",
          "fandomWiki": "disney",
          "fandomPage": "Tigger",
          "recognisability": "high",
          "familyId": "franchise:winnie-the-pooh",
          "tags": [
            "character",
            "icons-and-mascots",
            "fandom-local"
          ]
        },
        {
          "id": "character-icon-eeyore",
          "label": "Eeyore",
          "spokenName": "Eeyore",
          "subcategoryId": "icons-and-mascots",
          "imagePath": "../../assets/images/clue-items/characters/icons-and-mascots/character-icon-eeyore.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Eeyore",
          "imageSource": "local-fandom-download",
          "franchise": "Winnie the Pooh",
          "fandomWiki": "disney",
          "fandomPage": "Eeyore",
          "recognisability": "high",
          "familyId": "franchise:winnie-the-pooh",
          "tags": [
            "character",
            "icons-and-mascots",
            "fandom-local"
          ]
        },
        {
          "id": "character-icon-piglet",
          "label": "Piglet",
          "spokenName": "Piglet",
          "subcategoryId": "icons-and-mascots",
          "imagePath": "../../assets/images/clue-items/characters/icons-and-mascots/character-icon-piglet.webp",
          "sourcePage": "https://disney.fandom.com/wiki/Piglet",
          "imageSource": "local-fandom-download",
          "franchise": "Winnie the Pooh",
          "fandomWiki": "disney",
          "fandomPage": "Piglet",
          "recognisability": "high",
          "familyId": "franchise:winnie-the-pooh",
          "tags": [
            "character",
            "icons-and-mascots",
            "fandom-local"
          ]
        },
        {
          "id": "character-icon-tony-the-tiger",
          "label": "Tony the Tiger",
          "spokenName": "Tony the Tiger",
          "subcategoryId": "icons-and-mascots",
          "imagePath": "../../assets/images/clue-items/characters/icons-and-mascots/character-icon-tony-the-tiger.webp",
          "sourcePage": "https://admascots.fandom.com/wiki/Tony_the_Tiger",
          "imageSource": "local-fandom-download",
          "franchise": "Brand mascots",
          "fandomWiki": "admascots",
          "fandomPage": "Tony the Tiger",
          "recognisability": "high",
          "familyId": "franchise:brand-mascots",
          "tags": [
            "character",
            "icons-and-mascots",
            "fandom-local"
          ]
        },
        {
          "id": "character-icon-pusheen",
          "label": "Pusheen",
          "spokenName": "Pusheen",
          "subcategoryId": "icons-and-mascots",
          "imagePath": "../../assets/images/clue-items/characters/icons-and-mascots/character-icon-pusheen.webp",
          "sourcePage": "https://pusheen.fandom.com/wiki/Pusheen",
          "imageSource": "local-fandom-download",
          "franchise": "Pusheen",
          "fandomWiki": "pusheen",
          "fandomPage": "Pusheen",
          "recognisability": "high",
          "familyId": "franchise:pusheen",
          "tags": [
            "character",
            "icons-and-mascots",
            "fandom-local"
          ]
        },
        {
          "id": "character-icon-nyan-cat",
          "label": "Nyan Cat",
          "spokenName": "Nyan Cat",
          "subcategoryId": "icons-and-mascots",
          "imagePath": "../../assets/images/clue-items/characters/icons-and-mascots/character-icon-nyan-cat.webp",
          "sourcePage": "https://nyancat.fandom.com/wiki/Nyan_Cat",
          "imageSource": "local-fandom-download",
          "franchise": "Nyan Cat",
          "fandomWiki": "nyancat",
          "fandomPage": "Nyan Cat",
          "recognisability": "high",
          "familyId": "franchise:nyan-cat",
          "tags": [
            "character",
            "icons-and-mascots",
            "fandom-local"
          ]
        },
        {
          "id": "character-icon-moomintroll",
          "label": "Moomintroll",
          "spokenName": "Moomintroll",
          "subcategoryId": "icons-and-mascots",
          "imagePath": "../../assets/images/clue-items/characters/icons-and-mascots/character-icon-moomintroll.webp",
          "sourcePage": "https://moomin.fandom.com/wiki/Moomintroll",
          "imageSource": "local-fandom-download",
          "franchise": "Moomins",
          "fandomWiki": "moomin",
          "fandomPage": "Moomintroll",
          "recognisability": "high",
          "familyId": "franchise:moomins",
          "tags": [
            "character",
            "icons-and-mascots",
            "fandom-local"
          ]
        },
        {
          "id": "character-icon-the-cat-in-the-hat",
          "label": "The Cat in the Hat",
          "spokenName": "The Cat in the Hat",
          "subcategoryId": "icons-and-mascots",
          "imagePath": "../../assets/images/clue-items/characters/icons-and-mascots/character-icon-the-cat-in-the-hat.webp",
          "sourcePage": "https://seuss.fandom.com/wiki/The_Cat_in_the_Hat",
          "imageSource": "local-fandom-download",
          "franchise": "Dr. Seuss",
          "fandomWiki": "seuss",
          "fandomPage": "The Cat in the Hat",
          "recognisability": "high",
          "familyId": "franchise:dr-seuss",
          "tags": [
            "character",
            "icons-and-mascots",
            "fandom-local"
          ]
        },
        {
          "id": "character-icon-the-lorax",
          "label": "The Lorax",
          "spokenName": "The Lorax",
          "subcategoryId": "icons-and-mascots",
          "imagePath": "../../assets/images/clue-items/characters/icons-and-mascots/character-icon-the-lorax.webp",
          "sourcePage": "https://seuss.fandom.com/wiki/The_Lorax_(film)",
          "imageSource": "local-fandom-download",
          "franchise": "Dr. Seuss",
          "fandomWiki": "seuss",
          "fandomPage": "The Lorax (film)",
          "recognisability": "high",
          "familyId": "franchise:dr-seuss",
          "tags": [
            "character",
            "icons-and-mascots",
            "fandom-local"
          ]
        }
    // FANDOM_CHARACTER_ITEMS_END
  ];

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


  function addGeneratedCharacterItems(entries) {
    entries.forEach((entry) => {
      ITEMS.push(item({
        groupId: "general",
        categoryId: "characters",
        displayType: "image",
        approvalStatus: "approved",
        classroomSafe: true,
        ...entry,
        tags: Object.freeze([
          "character",
          entry.subcategoryId,
          ...(entry.tags || [])
        ])
      }));
    });
  }

  addGeneratedCharacterItems(GENERATED_CHARACTER_ITEMS);

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

    if (entry.imagePath) {
      return Object.freeze({
        itemId: entry.id,
        url: entry.imagePath,
        originalUrl: entry.imagePath,
        sourcePage: entry.sourcePage || "",
        creator: "",
        credit: entry.franchise || "",
        licence: "Local classroom asset",
        licenceUrl: entry.sourcePage || "",
        attributionRequired: false,
        imagePolicy: entry.imageSource || "local-fandom-download",
        fandomWiki: entry.fandomWiki || "",
        fandomPage: entry.fandomPage || ""
      });
    }

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

  function getCharacterLibraryStatus() {
    const characters = ITEMS.filter(
      (entry) => entry.categoryId === "characters"
    );

    return {
      count: characters.length,
      localImageCount: characters.filter(
        (entry) => Boolean(entry.imagePath)
      ).length,
      subcategoryCounts: Object.fromEntries(
        CATEGORIES
          .find((entry) => entry.id === "characters")
          .subcategories
          .map((subcategory) => [
            subcategory.id,
            characters.filter(
              (entry) =>
                entry.subcategoryId === subcategory.id
            ).length
          ])
      )
    };
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
      if (entry.displayType === "image" && !entry.imagePath && !entry.wikipediaTitle) errors.push(`${entry.id} has no image source`);
      if (entry.categoryId === "characters" && entry.displayType !== "image") {
        errors.push(`${entry.id} is a character but is not image-backed`);
      }
      if (entry.categoryId === "characters" && !entry.imagePath) {
        errors.push(`${entry.id} is a character but has no local image path`);
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
    getCharacterLibraryStatus,
    validateData
  });
})();
