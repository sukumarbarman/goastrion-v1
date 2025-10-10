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
  },

  about: {
    title: "About GoAstrion",
    tagline:
      "GoAstrion helps students and professionals make smarter life choices with clear, practical guidance—powered by Vedic astrology.",
    points: {
      career: "Career: find your strengths & learning path",
      finance: "Finance: plan habits and money decisions",
      marriage: "Marriage: understand compatibility patterns",
      health: "Health: build sustainable daily routines",
      education: "Education: pick subjects & skills confidently",
    },
    cta: { start: "Get Started", generate: "Generate My Chart" },
    imageAlt: "A student exploring career options on GoAstrion",
    mission: {
      title: "Our Mission",
      body:
        "We translate complex astrological signals into simple, actionable steps—so you can choose subjects, careers, and habits with clarity, not confusion.",
    },
  },

    steps: {
      "heading": "How it works",
        "stepLabel": "Step {{num}}",
        "1": {"title": "Enter birth details", "desc": "Date, time, and place (IST‑safe)"},
        "2": {"title": "Get chart & insights", "desc": "North‑Indian chart + Saturn & skills"},
        "3": {"title": "See ShubhDin windows", "desc": "Job change, marriage, property and more"}
    },
      shubhdin: {
        badge: "ShubhDin · Good Day",
        title: "Find your Shubh Din — feel the timing click",
        sub: "We read your chart and Saturn/Moon context to suggest windows that feel lighter and supportive — for study, interviews, launches, travel, or a calmer day.",
        pt1: "Smart windows from your birth details (IST/UTC handled)",
        pt2: "Gentle timing notes — action over anxiety",
        pt3: "Optional MD/AD context for longer trends",
        cta: "Check my ShubhDin",
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
      "headline": "Find ShubhDin (Auspicious Dates) & Free Vedic Birth Chart — Saturn & Sade Sati insights",
    "subline": "Plan job change, marriage or property with data‑backed windows from your natal chart. Fast, private, IST‑optimized.",
    "support": {"before": "Start with a free", "chart": "birth chart", "shubhdin": "ShubhDin (good dates)", "saturn": "Saturn/Sade Sati"},
    "createBtn": "Create Your Chart",
    "sampleBtn": "See Sample Report",
    "badgeSecure": "Secure", "badgePrivate": "Private", "badgeFast": "Fast"
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
            "badge": "ShubhDin · Good Day",
              "title": "Find your Shubh Din — feel the timing click",
              "sub": "Get auspicious date windows (ShubhDin) from your Vedic birth chart — optimized for job change, interviews, study, launches, travel and calmer days.",
              "pt1": "Smart windows from your birth details (IST/UTC handled)",
              "pt2": "Saturn/Moon context with gentle, actionable timing notes",
              "pt3": "Optional Vimshottari MD/AD for longer trends",
              "cta": "Check my ShubhDin",
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
    items: [
      { q: "Why should I use this?", a: "GoAstrion turns your birth details..." },
      { q: "Is the chart free?", a: "You can generate a basic chart..." },
      { q: "Do you use Vedic (sidereal) calculations and North Indian style?", a: "Yes. GoAstrion uses..." },
      { q: "What details do I need to generate a chart?", a: "Date of birth, time of birth..." },
      { q: "What is the Life Wheel?", a: "Life Wheel is our summary view..." },
      { q: "What is Skill?", a: "Skills are tendencies inferred..." },
      { q: "How does timezone work? Do I enter IST/UTC?", a: "Born in India: choose IST..." },
      { q: "Which languages are supported (India & international)?", a: "We support English and..." },
      { q: "Is latitude/longitude required?", a: "Not required. Selecting a city..." },
      { q: "What are MD and AD?", a: "MD (Maha Dasha) and AD..." },
      { q: "Where do I start?", a: "Go to the Create page..." },
    ],
  },


} as const;

export default enCore;
