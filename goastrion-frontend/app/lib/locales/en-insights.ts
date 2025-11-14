
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
      1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th",
      7: "7th", 8: "8th", 9: "9th", 10: "10th", 11: "11th", 12: "12th",
    },

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

    aspect: {
      Conjunction: "Conjunction",
      Opposition: "Opposition",
      Trine: "Trine",
      Square: "Square",
      Sextile: "Sextile",
    },

    tiers: {
      weak: "Weak",
      moderate: "Moderate",
      strong: "Strong",
      excellent: "Excellent",
    },

    actions: { highlightAllDomain: "Highlight all for this domain" },

// adsense  content of skill page - start
    skillsDescription: {
      fallback: "This skill reflects a natural tendency shaped by your planetary patterns.",

      Analytical:
        "A Mercury-driven ability that sharpens your intellect. Strong analytical patterns show capacity for pattern-recognition, structured thinking, and decoding complex information with ease. Benefic support strengthens memory, logic, and detailed evaluation.",

      Communication:
        "Primarily influenced by Mercury and Moon. This skill reflects your natural clarity of speech, writing flow, articulation, and ability to influence others through words. Benefic aspects boost diplomacy, humor, and expressive intelligence.",

      Leadership:
        "A Sun-powered competence shaped by confidence, authority, and visibility. Strong leadership signatures show an innate ability to guide teams, take responsibility, and make decisive choices. Supporting Jupiter aspects improve mentorship qualities.",

      Creativity:
        "Ruled by Venus and Moon. Creativity emerges as aesthetic sensitivity, imagination, and original problem-solving. Benefic lunar influence enhances artistic flow; Venus-driven patterns boost taste, harmony, and design thinking.",

      Focus:
        "A Saturn-Mars synergy indicating discipline, endurance, and the ability to stay committed. Strong patterns show resilience, consistency, and an ability to block distractions. Saturn gives structure; Mars adds drive and execution force.",

      Entrepreneurial:
        "Influenced by Mars, Rahu, and Mercury. This skill reflects risk-taking ability, strategic thinking, bold decision-making, and opportunity recognition. Strong signatures show capacity to initiate ventures and pursue growth paths fearlessly.",

      mercury:
        "Pure Mercury expression—intellect, logic, analysis, communication, and adaptability. Strong Mercury gives sharp thinking, quick learning, and problem-solving ability.",

      venus:
        "Venus strengthens creativity, diplomacy, relationship-building, and an eye for design. A powerful Venus enhances charm, aesthetic judgment, and harmonious expression.",

      sun:
        "Sun enhances leadership, confidence, authority, and individuality. Strong solar influence brings visibility, recognition, and self-direction.",

      saturn:
        "Saturn grants discipline, patience, long-term planning, and mastery through consistent effort. Strong Saturn improves focus, persistence, and responsibility.",

      mars:
        "Mars empowers action, courage, initiative, and competitive energy. Strong Mars gives sharp execution skills and high determination.",

      jupiter:
        "Jupiter enhances wisdom, teaching ability, mentorship, growth mindset, and higher understanding. A strong Jupiter expands knowledge and brings good judgment.",

      rahu10or11:
        "Rahu in 10th or 11th (with support) amplifies ambition, visibility, futuristic thinking, and the ability to leverage opportunities rapidly. It boosts networking, social reach, and unconventional success pathways.",
    },


    skillsPageCalculation: {
      title: "How These Skills Are Calculated",
      body1:
        "Each skill score is computed from multiple astrological factors connected to your chart:",
      item1: "Planetary strength (dignity, Shadbala, house placement)",
      item2:
        "Active houses influencing intelligence, focus, creativity, and discipline",
      item3: "Aspects and conjunctions that enhance or challenge traits",
      item4: "Nakshatra energies shaping mindset and behaviour",
      item5: "Planet–Skill mapping based on CHIP_TO_PLANETS associations",
      body2:
        "All these factors are processed through a weighted model that classifies each ability as Excellent, Strong, Moderate, or Emerging.",
    },


    skillsUsage: {
      title: "How to Use These Skill Insights",
      p1: "These scores highlight the strengths you naturally express based on planetary influences—not guarantees of behaviour.",
      p2: "Use higher-rated skills to guide career decisions, academics, and personal development.",
      p3: "Areas marked as “emerging” show where deliberate practice, habit-building, or life experience can create major improvements.",
      p4: "Treat these insights as a self-awareness tool, not predictions of destiny.",
    },
// adsense end content of skill page




 domainsPage: {
  intro1:
    "GoAstrion Domains helps you understand how your birth chart influences key areas of life such as Career, Finance, Health, Relationships, and Personal Growth. Each domain is generated using planetary placements, house activity, and astrological aspects. The insights below are personalized, astrologically derived, and updated dynamically based on your birth details.",
  intro2:
    "This page provides in-depth explanations—not predictions—so you can make balanced decisions with clarity. All highlights, themes, and planetary influences shown here are unique to your chart.",

  headingDetailed: "Your Life Domains — Detailed Analysis",

  /* ⭐ NEW — PER DOMAIN EXPLAINERS (all lowercase keys) */
  domainExplainer: {
    career:
      "Your career domain reflects how planets influence professional growth, stability, recognition, and long-term achievements. This explainer summarizes how active houses and planets shape your career direction.",
    finance:
      "Your finance domain highlights wealth-building, income stability, savings, and material growth. Planetary influences show how financial opportunities and challenges develop over time.",
    health:
      "Your health domain reflects physical vitality, stamina, mental balance, and overall wellbeing. Planetary activity indicates where strength or imbalance may arise.",
    marriage:
      "Your marriage domain examines compatibility, bonding, emotional harmony, commitment, and partnership dynamics influenced by planetary placements.",
    education:
      "Your education domain covers learning ability, academic growth, curiosity, memory, and higher studies uplifted or challenged by planetary forces.",
    property:
      "Your property domain deals with assets, home, land, real estate, and long-term stability shaped by foundation-related houses and planets.",
    relationships:
      "Your relationships domain highlights connections, bonding, communication, and emotional exchange with others based on planetary interactions.",
    business:
      "Your business domain focuses on entrepreneurship, risk-taking ability, expansion, profitability, and leadership in business ventures.",
    outreach:
      "Your outreach domain reflects social visibility, network building, public image, digital influence, and communication-driven growth.",
    home:
      "Your home domain reflects domestic peace, comfort, security, and emotional grounding influenced by inner-life planets.",
    research:
      "Your research domain highlights deep thinking, analysis, investigation, and solitary work supported by transformative planetary energies.",
    "inner-work":
      "Your inner-work domain shows self-reflection, emotional healing, spiritual development, and clarity arising from internal planetary guidance.",
    "long-term-plans":
      "This domain reflects strategy, patience, discipline, and structured growth for future planning shaped by long-term planetary influences.",
    "hard-negotiations":
      "This domain reveals negotiation capacity, conflict resolution, decision pressure, and assertive communication influenced by challenging planetary combinations.",
    "quick-wins":
      "Your quick-wins domain highlights short-term efforts, small gains, rapid action, and tactical opportunities driven by fast-moving planets.",
    "steady-routines":
      "This domain focuses on daily habits, discipline, consistency, routines, and long-term maintenance shaped by stabilizing planetary patterns.",
  },

  faqTitle: "Frequently Asked Questions",

  faq: {
    q1: "How does GoAstrion calculate these domains?",
    a1: "We use your birth chart, planetary positions, house strengths, nakshatra influences, and aspect patterns. A weighted algorithm transforms these into domain scores and narrative insights.",

    q2: "Is this the same as predictions?",
    a2: "No. We focus on interpreting your inherent tendencies—not forecasting events. These insights help support decisions, not predict outcomes.",

    q3: "Why are some domains stronger than others?",
    a3: "Strength depends on benefic influence, dignities, lordships, and supporting aspects. Weak scores show areas needing attention, not failure.",
  },
},


    domains: {
      career:   { title: "Career",   chip10th: "10th House", chip6th: "6th House", chip11th: "11th House", housePresence: "Planets in Career Houses" },
      finance:  { title: "Finance",  chip2nd: "2nd House", chip11th: "11th House", housePresence: "Planets in Wealth Houses" },
      health:   { title: "Health",   chipAsc: "Ascendant", chip6th: "6th House", housePresence: "Planets in Health Houses" },
      marriage: { title: "Marriage", chip7th: "7th House", housePresence: "Planets in Marriage House" },
      education:{ title: "Education",chip5th: "5th House", housePresence: "Planets in Education Houses" },
      property: { title: "Property", housePresence: "Property-related houses" },
      relationships: { title: "Relationships" },
      business: { title: "Business" },
      outreach: { title: "Outreach" },
      home: { title: "Home" },
      research: { title: "Research" },
      "inner-work": { title: "Inner work" },
      "long-term-plans": { title: "Long-term plans" },
      "hard-negotiations": { title: "Hard negotiations" },
      "quick-wins": { title: "Quick wins" },
      "steady-routines": { title: "Steady routines" },
    },

    career:   { chip10th: "10th House", chip6th: "6th House", chip11th: "11th House" },
    finance:  { chip2nd: "2nd House", chip11th: "11th House" },
    health:   { chipAsc: "Ascendant", chip6th: "6th House" },
    marriage: { chip7th: "7th House" },
    education:{ chip5th: "5th House" },

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

    skills: {
      Analytical: "Analytical Ability",
      Communication: "Communication",
      Leadership: "Leadership",
      Creativity: "Creativity",
      Focus: "Focus & Discipline",
      Entrepreneurial: "Entrepreneurial Drive",
      mercury: "Mercury strength",
      venus: "Venus strength",
      sun: "Sun strength",
      saturn: "Saturn strength",
      mars: "Mars strength",
      jupiter: "Jupiter strength",
      rahu10or11: "Rahu in 10th/11th (with support)",
    },

    aspectClass: { benefic: "Benefic influence" },
  },

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

  sd: {
    title: "ShubhDin — Smart Windows",

    // NEW: page-level heading & subtitle for /shubhdin
    page: {
      title: "ShubhDin — Next 2 yrs",
      sub: "Pick the right month, not just a date — data-backed Vedic windows for promotions, job change, property, marriage and more.",
    },

    join: { comma: ", " },
    view: { label: "View", aria: "Select view mode", all: "All goals", single: "Single goal" },
    goal: { aria: "Select goal" },

    goals: {
      job_change: "Job change",
      promotion: "Promotion",
      business_start: "Business start",
      business_expand: "Business expansion",
      startup: "Startup",
      property: "Property / Home",
      marriage: "Marriage",
      new_relationship: "New relationship",
    },

    // keep existing key…
    prompt_fill_create: "Please fill the Create tab first so we can read your lat/lon/tz from the saved state.",
    // …and alias some components use
    fill_create_first: "Please fill the Create tab first so we can read your lat/lon/tz from the saved state.",

    windows: { title: "Best windows" },
    topday: { title: "Top day" },
    why: { title: "Why these days?" },

    caution: {
      title: "Caution",
      days: "Caution day(s)",
      rahukaal: "Avoid {start}-{end} (Rahu Kaal)",
      watch_combust: "Watch Mercury combust days for clarity",
      skip_rahukaal_gulika: "Skip Rahu/Gulika windows",
      no_big_txn: "Please don't finalize deals or make large transactions on: {dates}{more}.",
    },

    score: { label: "Score {score}" },

    headline: { prefix: "Best windows: ", span: "{start} - {end} ({days}d)", best_windows: "{spans}" },

    aspect: { tag: "{p1} {name} -> {p2}" },

    // Works for both callers: some pass {dt}, others pass {ts}
    generated_at: "Generated {dt}{ts} • TZ: {tz}",

    empty: { goal: "No notable windows for this goal." },

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

  dasha: {
    sectionTitle: "Vimshottari — Timeline",
    subtitle: "Your Vimshottari Mahadasha & Antardasha timeline",
    titleFullTimeline: "Vimshottari Mahadasha — Full Timeline",
    colLord: "Lord",
    colStart: "Start",
    colEnd: "End",
    colDuration: "Duration",
    colADLord: "Antardasha Lord",
    noAntardasha: "No antardasha data",
    prevADTitle: "Previous AD",
    curADTitle: "Current AD",
    nextADTitle: "Next AD",
    mdLabel: "MD",
    adLabel: "AD",
    noCurrentAD: "No current AD found",
    nextADShort: "Next AD",

    summary: {
      readable: "You're in {md} Mahadasha, {ad} Antardasha.",
      prevReadable: "Last AD in {md} Mahadasha: {ad}.",
      nextReadable: "First AD in {md} Mahadasha will be: {ad}.",

      themesLabel: "Themes",
      adviceLabel: "Advice",
      goodFor: "Good for",
      goSlow: "Go-slow in",
      firstADLabel: "First AD",
      lastADLabel: "Last AD",

      planet: {
        Sun:    { themes: "visibility, leadership, authority", advice: "own responsibilities; present confidently" },
        Moon:   { themes: "nurture, rhythm, wellbeing",        advice: "prioritize rest and steady routines" },
        Mars:   { themes: "drive, initiative, courage",         advice: "channel energy; act with focus" },
        Mercury:{ themes: "study, writing, negotiation",        advice: "clarify details; document decisions" },
        Jupiter:{ themes: "growth, teaching, guidance",         advice: "learn, mentor, and expand wisely" },
        Venus:  { themes: "harmony, partnership, aesthetics",   advice: "invest in relationships and goodwill" },
        Saturn: { themes: "structure, duty, perseverance",      advice: "show up consistently; build habits" },
        Rahu:   { themes: "ambition, outreach, unconventional", advice: "aim high; manage risks and optics" },
        Ketu:   { themes: "focus, detachment, insight",         advice: "simplify, reflect, and refine" }
      },

      affinities: {
        Sun:    { good: ["career", "leadership", "education"],          slow: ["relationships"] },
        Moon:   { good: ["health", "relationships", "home"],            slow: ["career"] },
        Mars:   { good: ["career", "business", "property"],             slow: ["relationships"] },
        Mercury:{ good: ["career", "education", "business"],            slow: ["property"] },
        Jupiter:{ good: ["education", "career", "finance"],             slow: [] },
        Venus:  { good: ["relationships", "marriage", "property"],      slow: ["hard-negotiations"] },
        Saturn: { good: ["career", "long-term-plans", "property"],      slow: ["quick-wins", "relationships"] },
        Rahu:   { good: ["career", "business", "outreach"],             slow: ["steady-routines"] },
        Ketu:   { good: ["research", "education", "inner-work"],        slow: ["flashy-launches"] },
      },

      affinitiesText: {
        Sun:    { good: "Career, Leadership, Education",          slow: "Relationships" },
        Moon:   { good: "Health, Relationships, Home",            slow: "Career" },
        Mars:   { good: "Career, Business, Property",             slow: "Relationships" },
        Mercury:{ good: "Career, Education, Business",            slow: "Property" },
        Jupiter:{ good: "Education, Career, Finance",             slow: "" },
        Venus:  { good: "Relationships, Marriage, Property",      slow: "Hard negotiations" },
        Saturn: { good: "Career, Long-term plans, Property",      slow: "Quick wins, Relationships" },
        Rahu:   { good: "Career, Business, Outreach",             slow: "Steady routines" },
        Ketu:   { good: "Research, Education, Inner work",        slow: "Flashy launches" },
      },
    },
  },
} as const;

export default enInsights;
