// app/lib/locales/en-insights.ts

const enInsights = {
  insights: {
    copy: {
      line1_template: "Right now, {domain} is in {phase} ({score}/100).",
      phase_by_tier: {
        weak: "a building phase",
        moderate: "a shaping phase",
        strong: "strong momentum",
        excellent: "a peak phase",
        unknown: "an evolving phase",
      },
      houses_intro: "The {houseList} spotlight {themes}.",
      housesWord: "house",
      housesWordPlural: "houses",
      join: { and: "and", comma: ", " },
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
      1: "1st",
      2: "2nd",
      3: "3rd",
      4: "4th",
      5: "5th",
      6: "6th",
      7: "7th",
      8: "8th",
      9: "9th",
      10: "10th",
      11: "11th",
      12: "12th",
    },

    // chip tone used by UI & copy
    aspectTone: {
      Conjunction: "intense",
      Opposition: "polarizing",
      Trine: "harmonious",
      Square: "challenging",
      Sextile: "supportive",
    },

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
    aspect: {
      Conjunction: "Conjunction",
      Opposition: "Opposition",
      Trine: "Trine",
      Square: "Square",
      Sextile: "Sextile",
    },

    // used by any tier badge
    tiers: {
      weak: "Weak",
      moderate: "Moderate",
      strong: "Strong",
      excellent: "Excellent",
    },

    actions: { highlightAllDomain: "Highlight all for this domain" },

    // Domain cards + per-domain housePresence for insights-i18n fallback
    domains: {
      career: {
        title: "Career",
        chip10th: "10th House",
        chip6th: "6th House",
        chip11th: "11th House",
        housePresence: "Planets in Career Houses",
      },
      finance: {
        title: "Finance",
        chip2nd: "2nd House",
        chip11th: "11th House",
        housePresence: "Planets in Wealth Houses",
      },
      health: {
        title: "Health",
        chipAsc: "Ascendant",
        chip6th: "6th House",
        housePresence: "Planets in Health Houses",
      },
      marriage: {
        title: "Marriage",
        chip7th: "7th House",
        housePresence: "Planets in Marriage House",
      },
      education: {
        title: "Education",
        chip5th: "5th House",
        housePresence: "Planets in Education Houses",
      },
    },

    // Backend flat-key aliases (kept for compatibility)
    career: { chip10th: "10th House", chip6th: "6th House", chip11th: "11th House" },
    finance: { chip2nd: "2nd House", chip11th: "11th House" },
    health: { chipAsc: "Ascendant", chip6th: "6th House" },
    marriage: { chip7th: "7th House" },
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
      aspect: {
        Conjunction: "Conjunction",
        Opposition: "Opposition",
        Trine: "Trine",
        Square: "Square",
        Sextile: "Sextile",
      },
      aspectClass: { benefic: "Benefic influence" },
      house: "House",

      // skills chips
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

    // skill card titles (+ alias so insights-i18n can map)
    skills: {
      Analytical: "Analytical Ability",
      Communication: "Communication",
      Leadership: "Leadership",
      Creativity: "Creativity",
      Focus: "Focus & Discipline",
      Entrepreneurial: "Entrepreneurial Drive",
      // fallbacks
      mercury: "Mercury strength",
      venus: "Venus strength",
      sun: "Sun strength",
      saturn: "Saturn strength",
      mars: "Mars strength",
      jupiter: "Jupiter strength",
      rahu10or11: "Rahu in 10th/11th (with support)",
    },

    // for insights-i18n fallback `t('insights.aspectClass.*')`
    aspectClass: { benefic: "Benefic influence" },
  },

  // ----- Root-level aliases so existing calls like t("chip.skill.mercury") still work
  chip: {
    house_presence: {
      career: "Planets in Career Houses",
      finance: "Planets in Wealth Houses",
      health: "Planets in Health Houses",
      marriage: "Planets in Marriage House",
      education: "Planets in Education Houses",
    },
    benefic_harmony: "Benefic trines/sextiles",
    aspect: {
      Conjunction: "Conjunction",
      Opposition: "Opposition",
      Trine: "Trine",
      Square: "Square",
      Sextile: "Sextile",
    },
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

  // ----- Concise one-liners for goal tooltips/help
  goalHelp: {
    job_change: "Target interview/offer windows; polish résumé and schedule calls.",
    promotion: "Propose raises or new responsibilities; performance reviews land better.",
    business_start: "Green lights to register, launch, or sign the first paying clients.",
    business_expand: "Windows to hire, open a branch, add products, or scale capacity.",
    startup: "Good moments to prototype, pitch investors, or apply to incubators/grants.",
    property: "Better days for site visits, booking, loan processing, or registration.",
    marriage: "Supportive dates for engagement, wedding plans, and family discussions.",
    new_relationship: "Warm social openings for meeting, dating, and commitment talks.",
  },

  /**
   * ----- ShubhDin (SD) keys — used across client + server
   * These cover: titles, goal labels, card headings, dynamic strings, and
   * all server-emitted *_t keys (sd.headline.*, sd.aspect.tag, sd.dasha.*,
   * sd.caution.*, sd.explain.*).
   */
  sd: {
  title: "ShubhDin — Smart Windows",
  join: { comma: ", " },
  view: { label: "View", aria: "Select view mode", all: "All goals", single: "Single goal" },
  goal: { aria: "Select goal" },
  goals: {
    job_change: "Job change",
    promotion: "Promotion",
    business_start: "Business start",
    business_expand: "Business expand",
    startup: "Startup",
    property: "Property / Home",
    marriage: "Marriage",
    new_relationship: "New relationship",
  },
  prompt_fill_create: "Please fill the Create tab first so we can read your lat/lon/tz from the saved state.",
  windows: { title: "Best windows" },
  topday: { title: "Top day" },
  why: { title: "Why these days?" },

  // ✅ merged into ONE object
  caution: {
    title: "Caution",
    days: "Caution day(s)",
    rahukaal: "Avoid {start}-{end} (Rahu Kaal)",
    watch_combust: "Watch Mercury combust days for clarity",
    skip_rahukaal_gulika: "Skip Rahu/Gulika windows",
    no_big_txn: "Please don't finalize deals or make large transactions on: {dates}{more}.",
  },

  score: { label: "Score {score}" },
  headline: {
    prefix: "Best windows: ",
    span: "{start} - {end} ({days}d)",
    best_windows: "{spans}",
  },

  aspect: { tag: "{p1} {name} -> {p2}" },
  dasha: { md: "MD:{lord}", ad: "AD:{lord}" },

  generated_at: "Generated {ts} • TZ: {tz}",
  empty: { goal: "No notable windows for this goal." },

  // (optional) explanations used by explain_t
  explain: {
    career_houses: "Transit + dasha support career houses (10th/6th).",
    leverage_date: "Leverage appraisal talks near {date}.",
    jobchange_core: "Mercury + Jupiter favor offers/interviews; Mars gives momentum (with supportive MD/AD).",
    startup_green: "Jupiter trine to your natal Sun/Asc with supportive dasha signals green light.",
    incop_near: "Incorporate near {date} (strong Moon/Nakshatra).",
    property_core: "Venus + Moon auspicious; Saturn steady for paperwork (dasha-boosted where applicable).",
    marriage_core: "Venus/Moon strengthened; benefic aspect to 7th lord (dasha-aligned).",
    particularly_good: "{date} is particularly good.",
    expand_core: "Jupiter (growth) + Mercury (sales/ops) supportive; Venus aids customer appeal.",
    use_spans_launches: "Use these spans for launches, partnerships, and opening new locations (dasha-aligned).",
    start_core_typed: "{type}: Jupiter (expansion) + Mercury (ops/legal) supportive; Venus aids brand/UX (dasha-aligned).",
    incop_commence_near: "Incorporate/commence near {date} for a strong lunar/nakshatra tone.",
    relationship_core: "Venus/Moon benefic patterns boost connection and openness (dasha-aligned).",
    use_spans_social: "Use these spans for first meets, dates, and social events.",
  },
  },
} as const;

export default enInsights;
