const enResultsPage = {
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
        note: "Saturn-backed—small routines compound (50–60 min blocks).",
      },
      entrepreneurship: {
        name: "Entrepreneurial Drive",
        note: "Good bias to action; add a monthly review for traction.",
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

export default enResultsPage;
