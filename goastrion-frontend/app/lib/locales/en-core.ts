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
    heading: "How it works",
    stepLabel: "Step {num}",
    "1": { title: "Enter birth details", desc: "Date, time, and location. We handle timezones." },
    "2": { title: "We compute your chart", desc: "Fast, private calculations—no signup needed." },
    "3": { title: "Get skills & guidance", desc: "Clear scores, study tips, and career direction." },
  },

  hero: {
    headline: "Find Your True Strengths.",
    subline: "Your chart reveals the path where you can shine brightest.",
    support: "Study smarter, grow faster, and choose the right path with confidence.",
    createBtn: "Create Your Chart",
    sampleBtn: "See Sample Report",
    badgeSecure: "Secure",
    badgePrivate: "Private",
    badgeFast: "Fast",
  },

  skills: {
    title: "Skill spotlight",
    note: 'Hover to preview. Click <span class="text-slate-200">“See Sample Report”</span> for full details.',
    sampleReport: "See Sample Report →",
    list: {
      analytical: { name: "Analytical Ability", blurb: "Strong pattern recognition and logical breakdown—great for STEM & data tasks." },
      communication: { name: "Communication", blurb: "Clear articulation; benefits from more public practice." },
      leadership: { name: "Leadership", blurb: "Emerging leadership; improve by owning small team tasks." },
      creativity: { name: "Creativity", blurb: "Good idea flow; schedule unstructured brainstorming time." },
      focus: { name: "Focus", blurb: "Solid focus windows; try 25–30 min deep-work sprints." },
      entrepreneurial: { name: "Entrepreneurial Drive", blurb: "Initiative & risk tolerance; ship mini-projects often." },
    },
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

} as const;

export default enCore;
