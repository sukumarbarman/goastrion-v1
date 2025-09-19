// app/lib/i18n/en.ts
export default {
  navbar: {
    pricing: "Pricing",
    about: "About",
    dashboard: "Dashboard",
    results: "Results",
    book: "Book appointment",
    login: "Log in",
    signup: "Sign up",
  },

  create: {
    title: "Generate Chart",
    note: "Enter your birth details to generate a North Indian style chart.",
    dob: "Date of birth",
    tob: "Time of birth",
    timezone: "Timezone",
    place: "Place",
    placePlaceholder: "City, Country (e.g., Kolkata, India)",
    find: "Find",
    finding: "Finding...",
    lat: "Latitude",
    lon: "Longitude",
    generate: "Generate",
    generating: "Generating...",
    reset: "Reset",
    validation: {
      missingFields: "Please enter date, time, latitude and longitude.",
      badDate: "Please enter date as YYYY-MM-DD.",
      badYearRange: "Year must be 4 digits and between 1000 and 2099.",
    },
    locationFound: "Location found.",
  },

  timezones: {
    ist: "IST (UTC+05:30)",
    utc: "UTC (UTC+00:00)",
  },

  results: {
    title: "Chart Summary",
    lagnaSign: "Ascendant (Lagna)",
    sunSign: "Sun sign",
    moonSign: "Moon sign",
    moonNakshatra: "Moon nakshatra",
    lagnaDeg: "Ascendant (deg)",
    sunDeg: "Sun (deg)",
    moonDeg: "Moon (deg)",
  },

  planets: {
    sun: "Sun",
    moon: "Moon",
    mars: "Mars",
    mercury: "Mercury",
    jupiter: "Jupiter",
    venus: "Venus",
    saturn: "Saturn",
    rahu: "Rahu",
    ketu: "Ketu",
  },

  dasha: {
    sectionTitle: "Dasha Timeline",
    titleFullTimeline: "Vimshottari Mahadasha — Full Timeline",
    colLord: "Lord",
    colStart: "Start",
    colEnd: "End",
    colDuration: "Duration",
    colADLord: "AD Lord",
    prevADTitle: "Previous Mahadasha — Antardasha",
    curADTitle: "Current Mahadasha — Antardasha",
    nextADTitle: "Next Mahadasha — Antardasha",
    noAntardasha: "No Antardasha data available.",
  },

  errors: {
    genericGeocode: "Could not look up that place.",
    genericGenerate: "Failed to generate chart.",
  },

  // value lists (used to localize summary values)
  zodiac: [
    "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
    "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
  ],
  nakshatras: [
    "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha",
    "Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
    "Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"
  ],

  common: {
    loading: "Loading...",
    search: "Search",
    retry: "Retry",
    notAvailable: "Not available",
  },

  insights: {

    copy: {
      // Sentence 1
      line1_template: "Right now, {domain} is in {phase} ({score}/100).",

      // Phase by tier
      phase_by_tier: {
        weak: "a building phase",
        moderate: "a shaping phase",
        strong: "strong momentum",
        excellent: "a peak phase",
        unknown: "an evolving phase",
      },

      // Houses sentence
      houses_intro: "The {houseList} spotlight {themes}.",
      housesWord: "house",
      housesWordPlural: "houses",
      join: { and: "and", comma: ", " },

      // Planets sentence
      planets_intro: "With {planetList} leading, focus on {adviceList}.",
      planet_advice: {
        Sun: "responsible leadership",
        Moon: "steady self-care",
        Mars: "focused action",
        Mercury: "clear communication",
        Jupiter: "learning and mentorship",
        Venus: "relationship-building",
        Saturn: "disciplined habits",
        Rahu: "ambitious targets",
        Ketu: "quiet reflection",
      },

      // Aspects sentence
      aspects_intro: "Notable aspects: {items}.",
      aspect_pair: "{p1}–{p2} ({tone} {name})",
      aspect_item: "{pair} — {hint}",
      aspect_tone: {
        Conjunction: "intense",
        Opposition: "polarizing",
        Trine: "harmonious",
        Square: "challenging",
        Sextile: "supportive",
      },
      aspect_hint_by_name: {
        Conjunction: "brings intensity—pace yourself",
        Opposition: "pulls in two directions—balance both sides",
        Trine: "flows easily—lean into it",
        Square: "adds friction—take it step by step",
        Sextile: "offers support—activate it with small actions",
      },
    },

     housesOrdinal: {
          1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th",
          7: "7th", 8: "8th", 9: "9th", 10: "10th", 11: "11th", 12: "12th",
        },
    // Tones for "harmonious/supportive/..." (used in text & chips)
    aspectTone: {
      Conjunction: "intense",
      Opposition: "polarizing",
      Trine: "harmonious",
      Square: "challenging",
      Sextile: "supportive",
    },

    // House gloss and short labels
    housesGloss: {
      1: "Self, vitality",
      2: "Wealth, speech",
      3: "Courage, skills",
      4: "Home, foundations",
      5: "Creativity, studies",
      6: "Work, health",
      7: "Partnerships",
      8: "Depth, transformations",
      9: "Dharma, higher learning",
      10: "Career, status",
      11: "Gains, networks",
      12: "Retreat, expenses",
    },

    // Planet gloss (tooltip/inline)
    planetsGloss: {
      Sun: "authority, vitality",
      Moon: "mind, flow",
      Mars: "drive, initiative",
      Mercury: "analysis, communication",
      Jupiter: "growth, wisdom",
      Venus: "art, harmony",
      Saturn: "discipline, structure",
      Rahu: "ambition, surge",
      Ketu: "detachment, insight",
    },


    pages: {
      domainsTitle: "Life Domains",
      domainsSubtitle: "Pick a domain to see your score, highlights, and time windows.",
      skillsTitle: "Skill Spotlights",
      skillsSubtitle: "Foundational capabilities inferred from your chart.",
      highlightsTitle: "Highlights",
      highlightPlanets: "Key Planets",
      highlightHouses: "Key Houses",
      timeWindowsTitle: "Time Windows",
      noExactYet: "No exact date yet",
      highlightAspects: "Key Aspects",
      chartTitle: "Chart",
    },
    ui: {
        clearHighlights: "Clear highlights",
        highlightPlanetsBtn: "Highlight planets",
        highlightHousesBtn: "Highlight houses’ planets",
        highlightAspectsBtn: "Highlight aspects",
        notableAspects: "Notable aspects",
        keyHousesLabel: "Key houses",
        keyPlanetsLabel: "Key planets",
        highlightAll: "Highlight all",
         house: "House",
     },
    aspect:      { Conjunction: "Conjunction", Opposition: "Opposition", Trine: "Trine", Square: "Square", Sextile: "Sextile" },
    tiers: {
      weak: "Weak",
      moderate: "Moderate",
      strong: "Strong",
      excellent: "Excellent",
    },
    actions: {
        highlightAllDomain: "Highlight all for this domain",
    },

    // Domain titles + house chips (nested)
    domains: {
      career:    { title: "Career",    chip10th: "10th House", chip6th: "6th House", chip11th: "11th House" },
      finance:   { title: "Finance",   chip2nd: "2nd House",   chip11th: "11th House" },
      health:    { title: "Health",    chipAsc: "Ascendant",   chip6th: "6th House" },
      marriage:  { title: "Marriage",  chip7th: "7th House" },
      education: { title: "Education", chip5th: "5th House" },
    },

    // Aliases to match backend flat keys like "insights.career.chip10th"
    career:    { chip10th: "10th House", chip6th: "6th House", chip11th: "11th House" },
    finance:   { chip2nd: "2nd House",   chip11th: "11th House" },
    health:    { chipAsc: "Ascendant",   chip6th: "6th House" },
    marriage:  { chip7th: "7th House" },
    education: { chip5th: "5th House" },

    // CENTRALIZED chip labels (domains + skills)
    chip: {
      // Domain-level generic chips (used in /domains)
      house_presence: {
        career: "Planets in Career Houses",
        finance: "Planets in Wealth Houses",
        health: "Planets in Health Houses",
        marriage: "Planets in Marriage House",
        education: "Planets in Education Houses",
      },
      benefic_harmony: "Benefic trines/sextiles",
      aspect:      { Conjunction: "Conjunction", Opposition: "Opposition", Trine: "Trine", Square: "Square", Sextile: "Sextile" },
      aspectClass: { benefic: "Benefic influence" },
      house: "House",

      // Skill chips (used in /skills)
      skill: {
        // primitive/strength chips
        mercury: "Mercury strength",
        venus: "Venus strength",
        sun: "Sun strength",
        saturn: "Saturn strength",
        mars: "Mars strength",
        jupiter: "Jupiter strength",
        rahu10or11: "Rahu in 10th/11th (with support)",

        // aspect-based chips
        mercuryJupiterTrine: "Mercury–Jupiter trine",
        mercurySaturnTrine: "Mercury–Saturn trine",
        mercuryVenusTrine: "Mercury–Venus trine",
        mercuryMoonTrine: "Mercury–Moon trine",
        venusMercuryTrine: "Venus–Mercury trine",
        venusMoonTrine: "Venus–Moon trine",
        venusJupiterTrine: "Venus–Jupiter trine",
        sunMarsTrine: "Sun–Mars trine",
        sunJupiterTrine: "Sun–Jupiter trine",
        saturnMercuryTrine: "Saturn–Mercury trine",
      },
    },

    // Skill card titles
    skills: {
      Analytical: "Analytical Ability",
      Communication: "Communication",
      Leadership: "Leadership",
      Creativity: "Creativity",
      Focus: "Focus & Discipline",
      Entrepreneurial: "Entrepreneurial Drive",

      // Compatibility alias: if some components still call t("insights.skills.chip.*")
      chip: {
        mercury: "Mercury strength",
        venus: "Venus strength",
        sun: "Sun strength",
        saturn: "Saturn strength",
        mars: "Mars strength",
        jupiter: "Jupiter strength",
        rahu10or11: "Rahu in 10th/11th (with support)",

        mercuryJupiterTrine: "Mercury–Jupiter trine",
        mercurySaturnTrine: "Mercury–Saturn trine",
        mercuryVenusTrine: "Mercury–Venus trine",
        mercuryMoonTrine: "Mercury–Moon trine",
        venusMercuryTrine: "Venus–Mercury trine",
        venusMoonTrine: "Venus–Moon trine",
        venusJupiterTrine: "Venus–Jupiter trine",
        sunMarsTrine: "Sun–Mars trine",
        sunJupiterTrine: "Sun–Jupiter trine",
        saturnMercuryTrine: "Saturn–Mercury trine",
      },
    },
    aspects: {
        Conjunction: "Conjunction",
        Opposition: "Opposition",
        Trine: "Trine",
        Square: "Square",
        Sextile: "Sextile",
      },
  },

  // ===== Root-level CHIP ALIASES (so t("chip.skill.mercury") works with no code change) =====
  chip: {
    house_presence: {
      career: "Planets in Career Houses",
      finance: "Planets in Wealth Houses",
      health: "Planets in Health Houses",
      marriage: "Planets in Marriage House",
      education: "Planets in Education Houses",
    },
    benefic_harmony: "Benefic trines/sextiles",
    aspect:      { Conjunction: "Conjunction", Opposition: "Opposition", Trine: "Trine", Square: "Square", Sextile: "Sextile" },
    aspectClass: { benefic: "Benefic influence" },

    skill: {
      mercury: "Mercury strength",
      venus: "Venus strength",
      sun: "Sun strength",
      saturn: "Saturn strength",
      mars: "Mars strength",
      jupiter: "Jupiter strength",
      rahu10or11: "Rahu in 10th/11th (with support)",

      mercuryJupiterTrine: "Mercury–Jupiter trine",
      mercurySaturnTrine: "Mercury–Saturn trine",
      mercuryVenusTrine: "Mercury–Venus trine",
      mercuryMoonTrine: "Mercury–Moon trine",
      venusMercuryTrine: "Venus–Mercury trine",
      venusMoonTrine: "Venus–Moon trine",
      venusJupiterTrine: "Venus–Jupiter trine",
      sunMarsTrine: "Sun–Mars trine",
      sunJupiterTrine: "Sun–Jupiter trine",
      saturnMercuryTrine: "Saturn–Mercury trine",
    },
  },
} as const;
