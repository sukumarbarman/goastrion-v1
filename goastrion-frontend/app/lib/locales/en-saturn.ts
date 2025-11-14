//goastrion-frontend/app/lib/locales/en-saturn.ts
const enSaturn = {
  zodiac: {
    aries: "Aries",
    taurus: "Taurus",
    gemini: "Gemini",
    cancer: "Cancer",
    leo: "Leo",
    virgo: "Virgo",
    libra: "Libra",
    scorpio: "Scorpio",
    sagittarius: "Sagittarius",
    capricorn: "Capricorn",
    aquarius: "Aquarius",
    pisces: "Pisces",
  },

  // Optional: short labels (if you ever need them)
  zodiac_short: {
    aries: "Ari",
    taurus: "Tau",
    gemini: "Gem",
    cancer: "Can",
    leo: "Leo",
    virgo: "Vir",
    libra: "Lib",
    scorpio: "Sco",
    sagittarius: "Sag",
    capricorn: "Cap",
    aquarius: "Aqu",
    pisces: "Pis",
  },

  // Alias in case other parts of your app use "rashi.*"
  rashi: {
    aries: "Aries",
    taurus: "Taurus",
    gemini: "Gemini",
    cancer: "Cancer",
    leo: "Leo",
    virgo: "Virgo",
    libra: "Libra",
    scorpio: "Scorpio",
    sagittarius: "Sagittarius",
    capricorn: "Capricorn",
    aquarius: "Aquarius",
    pisces: "Pisces",
  },

  saturn: {
    sadesati: {
      title: "Saturn · Sade Sati",
      subtitle:
        "Compact view of your Sade Sati windows with station days & retro overlaps.",

      // Helper text and controls on page
      fast_preview: "Fast preview (20 yrs from today). Load full history when ready.",
      full_view_helper: "Full history (~100 yrs from birth).",
      view: "View",
      "view.preview": "Preview: 20 yrs from today",
      "view.preview.tip": "Preview range from today",
      "view.full": "Show full (100 yrs from birth)",
      "view.full.tip": "Full history from birth",
      export: "Export CSV",
      "export.tip": "Export visible rows to CSV",

      meta: { anchor: "Anchor", start: "Start", horizon: "Horizon" },
      years: "yrs",
      horizon_years: "{y} yrs",

      caution_dates: "Caution dates",
      no_station_in_view: "No station days in view",

      col: {
        phase: "Phase",
        start: "Start",
        end: "End",
        duration: "Duration",
        moon_sign: "Moon Sign",
        saturn_sign: "Saturn Sign",
        stations: "Stations",
        retros: "Retro overlaps",
      },

      empty: "No Sade Sati windows in the selected horizon.",

      phase: {
        start: "start — First Dhaiyya",
        peak: "peak — Second Dhaiyya (on Moon sign)",
        end: "end — Third Dhaiyya",
      },

      chip: { clear: "Clear flow", review: "Review/Revise", caution: "Caution day(s)" },

      good_pct: "{pct}% clear days",
      samples: "sample clear days",
      more: "+{n} more",
      all_station_dates: "All station dates",
      all_retro_overlaps: "All retro overlaps",

      tip: {
        clear: "Clear flow.",
        combo:
          "Stations: momentum is unstable—avoid brand-new commitments; finalize ongoing work; double-check paperwork.\nRetro overlap: great for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines.",
        station: {
          full:
            "Station day(s): momentum is unstable. Avoid brand-new commitments; review and finalize ongoing work; double-check paperwork.",
          short:
            "Tip: Avoid brand-new commitments; finalize ongoing work; double-check paperwork.",
        },
        retro: {
          full:
            "Retro overlap: great for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines.",
          short:
            "Tip: Best for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines.",
        },
        col: {
          phase: "Phase of Sade Sati window and overall flow chip.",
          start: "Start date of the window.",
          end: "End date of the window.",
          duration: "Total span (in days) for this window.",
          moon_sign: "Your natal Moon sign relevant to this window.",
          saturn_sign: "Sign where Saturn is transiting during this window.",
          stations: "Dates when Saturn is stationary (turning retrograde/direct).",
          retros: "Periods overlapping Saturn retrograde.",
        },
      },

      foot: {
        station: {
          label: "Stations",
          text:
            "Momentum is unstable. Avoid brand-new commitments; review and finalize ongoing work; double-check paperwork.",
        },
        retro: {
          label: "Retro overlaps",
          text:
            "Great for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines.",
        },
      },

      duration_days: "{d}d",
      extra: {
      howTitle: "How to use this page",
      howBody:
        "Green windows are periods of stability and clarity—ideal for decisions, communication, financial planning, or long-term commitments. Amber windows are review zones: restructure, renegotiate, or complete pending tasks. Red windows show pressure pockets where emotional load or delays increase. Avoid rushing important commitments here.",

      benefitsTitle: "Benefits",
      b1: "See the full 7½-year flow in one clean timeline.",
      b2: "Understand where pressure rises and where relief enters.",
      b3: "Use review windows to correct or renegotiate old issues.",
      b4: "Choose your best months for growth, planning and decisions.",

      exampleTitle: "Example",
      exampleBody:
        "If your peak Dhaiyya shows both stations and retro overlaps, avoid major commitments and use this period for review. When the next green window appears, clarity and flow return—ideal for decisions or forward movement."
    },

      // About (inline section/modal)
      about: {
        title: "What is Sade Sati?",
        blurb:
          "Sade Sati is a ~7½-year period when Saturn transits around your Moon sign: the sign before it, the sign itself, and the sign after it. It is often experienced in three phases—start, peak, and end—each with a different flavor of lessons, responsibilities, and pressure. Use this view to see the spans and critical dates at a glance.",
        termsTitle: "Key terms",
        terms: {
          start:
            "Saturn in the sign before your Moon sign—sets the stage; more preparation and groundwork.",
          peak:
            "Saturn over your Moon sign—core lessons, higher pressure, and restructuring.",
          end:
            "Saturn in the sign after your Moon sign—consolidation and stabilization.",
          station:
            "Saturn appears to pause (turning retrograde/direct). Momentum can be unstable—avoid brand-new commitments; finalize ongoing work.",
          retro:
            "Best for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines.",
        },
      },

      // Errors
      error: {
        create_first: "Please create your birth chart first (Create tab).",
        missing_birth: "Missing birth details. Please re-generate your chart.",
        fetch: "Failed to fetch Saturn overview.",
      },
    },
  },
};

export default enSaturn;
