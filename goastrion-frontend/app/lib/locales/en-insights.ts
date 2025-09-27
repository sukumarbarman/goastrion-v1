// app/lib/locales/en-insights.ts
//insights/Life-Wheel
const enInsights = {
  insights: {
    copy: {
      line1_template: "Right now, {domain} is in {phase} ({score}/100).",
      phase_by_tier: {
        weak: "a building phase", moderate: "a shaping phase",
        strong: "strong momentum", excellent: "a peak phase", unknown: "an evolving phase",
      },
      houses_intro: "The {houseList} spotlight {themes}.",
      housesWord: "house", housesWordPlural: "houses",
      join: { and: "and", comma: ", " },
      planets_intro: "With {planetList} leading, focus on {adviceList}.",
      planet_advice: {
        Sun: "responsible leadership", Moon: "steady self-care", Mars: "focused action",
        Mercury: "clear communication", Jupiter: "learning and mentorship",
        Venus: "relationship-building", Saturn: "disciplined habits",
        Rahu: "ambitious targets", Ketu: "quiet reflection",
      },
      aspects_intro: "Notable aspects: {items}.",
      aspect_pair: "{p1}–{p2} ({tone} {name})",
      aspect_item: "{pair} — {hint}",
      aspect_tone: {
        Conjunction: "intense", Opposition: "polarizing", Trine: "harmonious",
        Square: "challenging", Sextile: "supportive",
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

    // chip tone used by UI & copy
    aspectTone: {
      Conjunction: "intense", Opposition: "polarizing", Trine: "harmonious", Square: "challenging", Sextile: "supportive",
    },

    housesGloss: {
      1: "Self, vitality", 2: "Wealth, speech", 3: "Courage, skills", 4: "Home, foundations", 5: "Creativity, studies",
      6: "Work, health", 7: "Partnerships", 8: "Depth, transformations", 9: "Dharma, higher learning",
      10: "Career, status", 11: "Gains, networks", 12: "Retreat, expenses",
    },

    planetsGloss: {
      Sun: "authority, vitality", Moon: "mind, flow", Mars: "drive, initiative", Mercury: "analysis, communication",
      Jupiter: "growth, wisdom", Venus: "art, harmony", Saturn: "discipline, structure",
      Rahu: "ambition, surge", Ketu: "detachment, insight",
    },

    pages: {
      domainsTitle: "Life Wheel",
      domainsSubtitle: "Choose a life wheel to explore your score, highlights, and timing.",
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

    // labels for the aspects list
    aspect: { Conjunction: "Conjunction", Opposition: "Opposition", Trine: "Trine", Square: "Square", Sextile: "Sextile" },

    // used by any tier badge
    tiers: { weak: "Weak", moderate: "Moderate", strong: "Strong", excellent: "Excellent" },

    actions: { highlightAllDomain: "Highlight all for this domain" },

    // Domain cards + per-domain housePresence for insights-i18n fallback
    domains: {
      career:    { title: "Career",    chip10th: "10th House", chip6th: "6th House", chip11th: "11th House", housePresence: "Planets in Career Houses" },
      finance:   { title: "Finance",   chip2nd: "2nd House",   chip11th: "11th House",                           housePresence: "Planets in Wealth Houses" },
      health:    { title: "Health",    chipAsc: "Ascendant",   chip6th: "6th House",                              housePresence: "Planets in Health Houses" },
      marriage:  { title: "Marriage",  chip7th: "7th House",                                                   housePresence: "Planets in Marriage House" },
      education: { title: "Education", chip5th: "5th House",                                                   housePresence: "Planets in Education Houses" },
    },

    // Backend flat-key aliases
    career:    { chip10th: "10th House", chip6th: "6th House", chip11th: "11th House" },
    finance:   { chip2nd: "2nd House",   chip11th: "11th House" },
    health:    { chipAsc: "Ascendant",   chip6th: "6th House" },
    marriage:  { chip7th: "7th House" },
    education: { chip5th: "5th House" },

    // centralized chip labels
    chip: {
      house_presence: {
        career: "Planets in Career Houses",
        finance: "Planets in Wealth Houses",
        health: "Planets in Health Houses",
        marriage: "Planets in Marriage House",
        education: "Planets in Education Houses",
      },
      benefic_harmony: "Benefic trines/sextiles",
      aspect: { Conjunction: "Conjunction", Opposition: "Opposition", Trine: "Trine", Square: "Square", Sextile: "Sextile" },
      aspectClass: { benefic: "Benefic influence" },
      house: "House",

      // skills chips
      skill: {
        mercury: "Mercury strength", venus: "Venus strength", sun: "Sun strength",
        saturn: "Saturn strength", mars: "Mars strength", jupiter: "Jupiter strength",
        rahu10or11: "Rahu in 10th/11th (with support)",
        mercuryJupiterTrine: "Mercury–Jupiter trine", mercurySaturnTrine: "Mercury–Saturn trine",
        mercuryVenusTrine: "Mercury–Venus trine", mercuryMoonTrine: "Mercury–Moon trine",
        venusMercuryTrine: "Venus–Mercury trine", venusMoonTrine: "Venus–Moon trine",
        venusJupiterTrine: "Venus–Jupiter trine", sunMarsTrine: "Sun–Mars trine",
        sunJupiterTrine: "Sun–Jupiter trine", saturnMercuryTrine: "Saturn–Mercury trine",
      },
    },

    // skill card titles (+ alias so insights-i18n can map)
    skills: {
      Analytical: "Analytical Ability",
      Communication: "Communication",
      Leadership: "Leadership",
      Creativity: "Creativity",
      Focus: "Focus & Discipline",
      Entrepreneurial: "Entrepreneurial Drive",
      // allow t('insights.skills.mercury') etc. as label fallbacks
      mercury: "Mercury strength", venus: "Venus strength", sun: "Sun strength",
      saturn: "Saturn strength", mars: "Mars strength", jupiter: "Jupiter strength",
      rahu10or11: "Rahu in 10th/11th (with support)",
    },

    // for insights-i18n fallback `t('insights.aspectClass.*')`
    aspectClass: { benefic: "Benefic influence" },
  },

  // root-level aliases so existing calls like t("chip.skill.mercury") still work
  chip: {
    house_presence: {
      career: "Planets in Career Houses",
      finance: "Planets in Wealth Houses",
      health: "Planets in Health Houses",
      marriage: "Planets in Marriage House",
      education: "Planets in Education Houses",
    },
    benefic_harmony: "Benefic trines/sextiles",
    aspect: { Conjunction: "Conjunction", Opposition: "Opposition", Trine: "Trine", Square: "Square", Sextile: "Sextile" },
    aspectClass: { benefic: "Benefic influence" },
    skill: {
      mercury: "Mercury strength", venus: "Venus strength", sun: "Sun strength",
      saturn: "Saturn strength", mars: "Mars strength", jupiter: "Jupiter strength",
      rahu10or11: "Rahu in 10th/11th (with support)",
      mercuryJupiterTrine: "Mercury–Jupiter trine", mercurySaturnTrine: "Mercury–Saturn trine",
      mercuryVenusTrine: "Mercury–Venus trine", mercuryMoonTrine: "Mercury–Moon trine",
      venusMercuryTrine: "Venus–Mercury trine", venusMoonTrine: "Venus–Moon trine",
      venusJupiterTrine: "Venus–Jupiter trine", sunMarsTrine: "Sun–Mars trine",
      sunJupiterTrine: "Sun–Jupiter trine", saturnMercuryTrine: "Saturn–Mercury trine",
    },
  },
} as const;

export default enInsights;
