// app/lib/locales/en-core.ts
//common UI
const enCore = {
  navbar: {
    lifeSpheres: "Life Wheel",
    skills: "Skills",
    pricing: "Pricing",
    about: "About",
    dashboard: "Dashboard",
    results: "Results",
    book: "Book appointment",
    login: "Log in",
    signup: "Sign up",
    guides: "Guides",
    faq: "FAQ",
    saturn: "Saturn",
    vimshottari: "Vimshottari",
    daily: "Today",
    shubhdin: "Next 2 yrs",
    create: "Create",
   },
   footer: {
      guides: "Guides",
      about: "About",
      contact: "Contact",
      terms: "Terms",
    },


    contact: {
    thanks: "Thanks! We'll get back to you soon.",
  },
about: {
  title: "About GoAstrion",
  subtitle: "Clarity for students and professionals—without the jargon",

  badge: {
    shubhdin: "ShubhDin · Good Day",
    saturn: "Saturn · Sade Sati",
  },

  tagline: {
    main:
      "GoAstrion helps students and professionals make smarter life choices with clear, practical guidance—powered by Vedic astrology.",
    spotlight:
      "Find calmer, more supportive days—then act. GoAstrion reads your chart and Saturn/Moon context to plan Next 2 yrs  for studies, interviews, launches, or simply a more focused day.",
  },

  list: {
    why: {
      title: "Why explore now?",
      body: "Know your next 1–2 good windows and use them—no guesswork, no fear.",
    },
    saturn: {
      title: "Saturn · Sade Sati",
      body: "We frame it as structure, not scare: small, repeatable habits that compound.",
    },
    practical: {
      title: "Made practical",
      body: "Clear language, Life Wheel focus, optional MD/AD timing—action over anxiety.",
    },
  },

  points: {
    career: "Career: find your strengths & learning path",
    finance: "Finance: plan habits and money decisions",
    marriage: "Marriage: understand compatibility patterns",
    health: "Health: build sustainable daily routines",
    education: "Education: pick subjects & skills confidently",
  },

  cta: {
    start: "Get Started",
    generate: "Generate My Chart",
    checkShubhdin: "✨ Plan next 2 yrs",
    howItWorks: "How it works",
  },

  timezone: {
    note:
      "India: choose IST (UTC+05:30). Outside India: convert your birth time to UTC and choose UTC.",
  },

  imageAlt: "A student exploring career options on GoAstrion",

  mission: {
    title: "Our Mission",
    body:
      "We translate complex astrological signals into simple, actionable steps—so you can choose subjects, careers, and habits with clarity, not confusion.",
  },
  },


// about end

    steps: {
      "heading": "How it works",
        "stepLabel": "Step {{num}}",
        "1": {"title": "Enter birth details", "desc": "Date, time, and place (IST‑safe)"},
        "2": {"title": "Get chart & insights", "desc": "North‑Indian chart + Saturn & skills"},
        "3": {"title": "Plan Next 2 yrs", "desc": "Job change, marriage, property and more"}
    },
      shubhdin: {
        badge: "ShubhDin · Good Day",
        title: "Find your Shubh Din — feel the timing click",
        sub: "We read your chart and Saturn/Moon context to suggest windows that feel lighter and supportive — for study, interviews, launches, travel, or a calmer day.",
        pt1: "Smart windows from your birth details (IST/UTC handled)",
        pt2: "Gentle timing notes — action over anxiety",
        pt3: "Optional MD/AD context for longer trends",
        cta: "Plan next 2 yrs",
        how: "How it works",
        tz: "India: choose IST (UTC+05:30). Outside India: convert your birth time to UTC and choose UTC.",
        alt: "Smiling young woman checking a calendar on her phone, hopeful about a good day"
      },
      domains: {
        badge: "Life Wheel",
        title: "See where to focus first",
        sub: "Your Life Wheel highlights Career, Finance, Marriage, and Health from house strengths and planetary aspects—so you know where small efforts pay off big.",
        career: "Career",
        careerSub: "strengths & learning path",
        finance: "Finance",
        financeSub: "habits & money decisions",
        marriage: "Marriage",
        marriageSub: "compatibility patterns",
        health: "Health",
        healthSub: "sustainable routines",
        cta: "Explore Life Wheel"
      },

  hero: {
      "headline": "Know Your Today !!!",
    "subline": "See supportive windows and avoid risky slots.",
    "support": {"before": "Start with a free", "chart": "birth chart", "shubhdin": "ShubhDin (good dates)", "saturn": "Saturn/Sade Sati"},
    "createBtn": "Show my best time",
    "sampleBtn": "See Sample Report",
    "badgeSecure": "Secure", "badgePrivate": "Private", "badgeFast": "Fast"
  },

      /* === Cards used on Create page (Deep Links) === */
    cards: {
      daily: {
        title: "Know Today",
        desc:
          "Make the most of today: see your supportive time windows, recommended actions and cautions, plus your focus mantra.",
        cta: "Open Daily",
      },

      shubhdin: {
        title: "Next 2 yrs",
        desc:
          "Plan job changes, marriage, relationships, and starting or expanding a business — plus interviews, launches, travel, purchases, and other key decisions — over the next 24 months.",
        cta: "Plan Next 2 yrs",
      },

      life: {
        title: "Life Wheel (Domains)",
        desc:
          "See strengths across Career, Finance, Health, Relationships and more—at a glance.",
        cta: "Open Life Wheel",
      },

      skills: {
        title: "Top Skills",
        desc:
          "Discover your standout abilities and how to use them for jobs, business or growth.",
        cta: "See Skills",
      },

      saturn: {
        title: "Saturn Phases",
        desc:
          "Track Sade Sati, transits and caution days to plan moves wisely.",
        cta: "Open Saturn",
      },
    },

    /* === Horizon labels (for compact badges like “Next 2 yrs”) === */
    horizonLabels: {
      short: {
        next2yrs: "Next 2 yrs",
      },
    },

    /* === VImshottari card strings used by the Dasha link === */
    vimshottari: {
      openCta: "Open Dasha Timeline",
      cardTitle: "Dasha Timeline",
      cardDesc: "See your Vimshottari sequence and key periods.",
    },


  skills: {
        "title": "Skill Spotlight",
        "note": "<span class='text-slate-300'>Top abilities from natal placements — see where to double‑down.</span>",
        "sampleReport": "See sample report",
        "list": {
        "analytical": {"name": "Analytical", "blurb": "Pattern‑finding & logic."},
        "communication": {"name": "Communication", "blurb": "Clear writing & speaking."},
        "leadership": {"name": "Leadership", "blurb": "Direct, organize, inspire."},
        "creativity": {"name": "Creativity", "blurb": "Ideas & aesthetics."},
        "focus": {"name": "Focus", "blurb": "Deep work stamina."},
        "entrepreneurial": {"name": "Entrepreneurial", "blurb": "Build & ship."}
    },
  },

  "home": {
    "domains": {
        "badge": "Life Wheel",
        "title": "See where to focus first",
        "sub": "Your Life Wheel highlights Career, Finance, Marriage, and Health from house strengths and planetary aspects—so you know where small efforts pay off big.",
        "career": "Career", "careerSub": "strengths & learning path",
        "finance": "Finance", "financeSub": "habits & money decisions",
        "marriage": "Marriage", "marriageSub": "compatibility patterns",
        "health": "Health", "healthSub": "sustainable routines",
        "cta": "Explore Life Wheel"
        },
         "shubhdin": {
            "badge": "Next 2 yrs",
              "title": "Pick the Right Month, Not Just a Date",
              "sub": "Data-backed Vedic windows for commitments—marriage, job Change, home purchase, study plans",
              "pt1": "Smart windows from your birth details (IST/UTC handled)",
              "pt2": "Saturn/Moon context with gentle, actionable timing notes",
              "pt3": "Extend with Vimshottari MD/AD for trend alignment",
              "cta": "Plan Next 2 yrs",
              "learn": "Learn more",
              "how": "How it works",
              "tz": "India: choose IST (UTC+05:30). Outside India: convert your birth time to UTC and choose UTC.",
              "alt": "Smiling young woman checking a calendar on her phone, hopeful about a good day"
            }
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
    saveTip: "If you want to avoid entering your details again, save this chart to your account.",
    validation: {
      missingFields: "Please enter date, time, latitude and longitude.",
      badDate: "Please enter date as YYYY-MM-DD.",
      badYearRange: "Year must be 4 digits and between 1000 and 2099.",
    },
    locationFound: "Location found.",
  },

    cta: {
        "domains": {
          "title": "Life Wheel (Domains)",
          "desc": "See strengths across Career, Finance, Health, Relationships and more—at a glance.",
          "btn": "Open Life Wheel"
        },
        "skills": {
          "title": "Top Skills",
          "desc": "Discover your standout abilities and how to use them for jobs, business or growth.",
          "btn": "See Skills"
        },
        "saturn": {
          "title": "Saturn Phases (Sade Sati & More)",
          "desc": "See your Sade Sati windows, Saturn transits, station days and caution periods—personalized from your birth details.",
          "desc.short": "Track Sade Sati, transits and caution days to plan moves wisely.",
          "btn": "Open Saturn"
        }
  },


  timezones: { ist: "IST (UTC+05:30)", utc: "UTC (UTC+00:00)" },

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
    sun: "Sun", moon: "Moon", mars: "Mars", mercury: "Mercury", jupiter: "Jupiter",
    venus: "Venus", saturn: "Saturn", rahu: "Rahu", ketu: "Ketu",
  },

  dasha: {
    sectionTitle: "Dasha Timeline",
    titleFullTimeline: "Vimshottari Mahadasha — Full Timeline",
    colLord: "Lord", colStart: "Start", colEnd: "End", colDuration: "Duration", colADLord: "AD Lord",
    prevADTitle: "Previous Mahadasha — Antardasha",
    curADTitle: "Current Mahadasha — Antardasha",
    nextADTitle: "Next Mahadasha — Antardasha",
    noAntardasha: "No Antardasha data available.",
  },

  errors: { genericGeocode: "Could not look up that place.", genericGenerate: "Failed to generate chart." },

  zodiac: ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"],
  nakshatras: [
    "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha",
    "Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
    "Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"
  ],

  common: { loading: "Loading...", search: "Search", retry: "Retry", notAvailable: "Not available" },
  guides: {
  title: "Guides",
  hero: {
    blurb:
      "Short, practical guides to help you use GoAstrion for better decisions in career, finance, marriage, health, and education.",
    ctaGenerate: "Generate My Chart",
  },
  how: {
    title: "How GoAstrion Works",
    step1: {
      title: "1. Enter Birth Details",
      desc: "Date, time, and location help us compute your North-Indian style chart.",
    },
    step2: {
      title: "2. Get Insights",
      desc: "We highlight key houses, planets, and aspects that shape focus areas.",
    },
    step3: {
      title: "3. Act with Clarity",
      desc: "Follow simple, actionable steps aligned to your strengths and timing.",
    },
  },
  topics: {
    title: "Start with a Topic",
    cards: {
      career: {
        title: "Career",
        blurb: "Map strengths to roles, choose skills, and track growth windows.",
      },
      finance: {
        title: "Finance",
        blurb: "Understand earning windows and align money habits with rhythms.",
      },
      marriage: {
        title: "Marriage",
        blurb: "View compatibility factors and build better communication patterns.",
      },
      health: {
        title: "Health",
        blurb: "Create sustainable routines synced with energy and stress cycles.",
      },
    },
  },
  qa: {
    q1: {
      q: "Do I need exact birth time?",
      a: "Closer is better for ascendant and house accuracy. If unknown, try a time window and compare which feels most accurate.",
    },
    q2: {
      q: "Is this predictive?",
      a: "We emphasize timing + tendencies, then translate them into practical steps you can control.",
    },
    q3: {
      q: "Will it tell me one job to pick?",
      a: "We map strengths to multiple paths and suggest experiments so you can validate quickly.",
    },
    q4: {
      q: "Can I use it for students?",
      a: "Yes—use the Education focus to choose subjects and skill tracks with confidence.",
    },
  },
  cta: {
    title: "Ready to see your chart?",
    blurb: "Generate your chart and explore tailored insights in minutes.",
    btn: "Generate My Chart",
  },
},
// ⬇️ MOVE THIS BLOCK OUT OF `guides` (root-level sibling)
faqPage: {
    heading: "Frequently Asked Questions",
    introPrefix: "New to GoAstrion? Start on the",
    introMiddle: "page, then explore the",
    introAnd: "and",
    linkCreate: "Create",
    linkLifeWheel: "Life Wheel",
    linkSkills: "Skills",
    featured: [
      {
        q: "What is ShubhDin (auspicious day)?",
        a: "ShubhDin is a supportive time window suggested from your birth details and current Saturn/Moon context. Use it for focused study, interviews, launches, travel planning, or simply a calmer day to move important tasks forward.",
      },
      {
        q: "How does GoAstrion plan for next 2 yrs?",
        a: "We compute your chart in UTC or IST, then scan for lighter lunar context and clean aspects within your chosen horizon. We avoid heavy station days and highlight windows where friction is lower so small efforts compound.",
      },
      {
        q: "What is Saturn · Sade Sati and how should I use it?",
        a: "We treat Sade Sati as structure, not scare: a period to prune distractions and build routines. Expect more review/discipline days. Pair ShubhDin windows with tiny repeatable actions—sleep, blocks of study, budgeting—to exit stronger.",
      },
      {
        q: "What are ‘station’ or ‘retro overlap’ cautions in the app?",
        a: "Station days = momentum unstable; avoid fresh, high-risk commitments and double-check paperwork. Retro overlaps = great for reviews, fixes, and renegotiations—just pad timelines for rework.",
      },
    ],
    items: [
      { q: "Why should I use this?", a: "GoAstrion turns your birth details into clear, practical guidance—daily context, skill tendencies, and supportive windows—so you can focus efforts where they pay off." },
      { q: "Is the chart free?", a: "Yes. You can generate a basic chart for free; some advanced timelines or pro insights may be offered later." },
      { q: "Do you use Vedic (sidereal) calculations and North Indian style?", a: "Yes. GoAstrion uses sidereal calculations and renders charts in the North Indian style." },
      { q: "What details do I need to generate a chart?", a: "Date of birth, time of birth, and birthplace (city). Latitude/longitude help but city is enough for most users." },
      { q: "What is the Life Wheel?", a: "Life Wheel is our summary view of domains (Career, Finance, Health, etc.) with highlights to explore." },
      { q: "What are Skills?", a: "Skills are tendencies inferred from your chart to help you lean into strengths (e.g., Analytical, Communication, Leadership)." },
      { q: "How does timezone work? Do I enter IST/UTC?", a: "Born in India: choose IST. Otherwise pick UTC or your local time zone used at birth for best accuracy." },
      { q: "Which languages are supported (India & international)?", a: "We currently support English, Hindi, and Bengali, with more coming soon." },
      { q: "Is latitude/longitude required?", a: "Not required. Selecting your birthplace city is usually enough; you can add lat/lon for precision." },
      { q: "What are MD and AD?", a: "MD (Maha Dasha) and AD (Antar Dasha) are Vedic planetary periods that color themes; we display current/next periods in timelines." },
      { q: "Where do I start?", a: "Go to the Create page, generate your chart, then open Life Wheel and Skills for guided summaries." },
    ],
  },

   resultsPage: {
    title: "Sample Report",
    hero: {
      alt: "Smiling young woman checking ShubhDin on GoAstrion",
    },
    cta: {
      generate: "Generate my chart",
    },
    labels: {
      name: "Name",
      dob: "DOB",
      time: "Time",
      place: "Place",
    },
    sample: {
      nameValue: "Sample: Reene",
      placeValue: "Kolkata, India",
      tzValue: "IST (UTC+05:30)",
    },

    lifeWheel: {
      heading: "Life Wheel",
      badge: "focus first",
      sub: "Where small efforts pay off big. Scores are illustrative.",
    },
    domains: {
      career: {
        title: "Career",
        summary:
          "Strong 1st/10th/6th houses. Good for analytical & structured roles.",
      },
      finance: {
        title: "Finance",
        summary:
          "Steady habit potential; watch impulse spends during Venus AD.",
      },
      marriage: {
        title: "Marriage",
        summary: "Balanced 7th; communication routines improve harmony.",
      },
      health: {
        title: "Health",
        summary:
          "Saturn supports discipline; sleep + walking compound gains.",
      },
    },
    scoreAria: "Score {score} out of 100",

    skills: {
      heading: "Top Skills",
      badge: "strengths",
      analytical: {
        name: "Analytical Thinking",
        note: "Clear pattern recognition; enjoys breaking problems down.",
      },
      communication: {
        name: "Communication",
        note: "Crisp written summaries; benefit from weekly sharing cadence.",
      },
      focus: {
        name: "Focus & Consistency",
        note:
          "Saturn-backed—small routines compound (50–60 min blocks).",
      },
      entrepreneurship: {
        name: "Entrepreneurial Drive",
        note:
          "Good bias to action; add a monthly review for traction.",
      },
    },

    shubhdin: {
      heading: "ShubhDin · Good Days",
      badge: "next 2 weeks",
      tip:
        "Tip: lock one keystone habit (e.g., focused study 50 min) into at least one ShubhDin window each week.",
      row1: {
        date: "2025-10-11 (Sat)",
        window: "10:30–13:00",
        focus: "Study / Interviews",
        note: "Moon support + clean aspects",
      },
      row2: {
        date: "2025-10-14 (Tue)",
        window: "09:15–11:45",
        focus: "Launch / Applications",
        note: "Mercury backed window",
      },
      row3: {
        date: "2025-10-18 (Sat)",
        window: "08:40–12:10",
        focus: "Travel / Planning",
        note: "Light Saturn pressure, still fine",
      },
    },
    table: {
      date: "Date",
      window: "Window",
      bestFor: "Best for",
      note: "Note",
    },

    dasha: {
      heading: "Timing Context · MD / AD",
      badge: "backdrop",
      mdBackdrop: "MD (Backdrop)",
      currentAd: "Current AD",
      nextAd: "Next AD",
      mdLord: "Saturn",
      currentLord: "Venus",
      nextLord: "Sun",
    },

    saturn: {
      heading: "Saturn · Sade Sati (Sade Saati / Sadasathi)",
      copy:
        "We frame Sade Sati as structure, not scare: pruning distractions, building routines, and committing to what matters. Pair ShubhDin windows with small, repeatable actions—sleep, study blocks, budgeting—to exit stronger.",
    },

    footer: {
      startFree: "Start free — generate my chart",
      readFaqs: "Read FAQs",
    },
  },




} as const;

export default enCore;
