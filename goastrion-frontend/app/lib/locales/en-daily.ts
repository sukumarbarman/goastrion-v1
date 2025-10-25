// goastrion-frontend/app/lib/locales/en-daily.ts
export type DailyArgs = Record<string, string | number | undefined>;

export const formatDaily = (tpl: string, args: DailyArgs = {}) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => (args[k] ?? "").toString());

const enDaily = {
  navbar: { daily: "YourDay" },

  daily: {
    // Used as dynamic add-ons for optional remedies
    optionalAddons: {
      travel: "Leave 10-min early; confirm route",
      detox: "10-min digital detox",
      roadSafety: "Support road-safety/blanket charity",
    },

    title: "Your Day",
    subtitle: "Supportive windows, highlights, and remedies for your day.",
    changeBirth: "Change birth details",
    forDate: "For date (YYYY-MM-DD)",
    persona: "Persona",
    get: "Get daily",
    getting: "Getting…",

    missingBirth: {
      title: "Birth details needed",
      desc: "Please generate your chart first so we can personalize your daily windows.",
      cta: "Generate Chart",
    },

    ui: {
      dobLabel: "DOB",
      today: "Today",
      loading: "Loading…",
      tryAgain: "Try again",
      headline: "Headline",
      windowsToday: "Today’s Windows",
      best: "Best",
      green: "Green",
      caution: "Caution",
      wear: "Wear",

      // NEW: Panchang block
      panchang: {
        title: "Panchang",
        desc:
          "Panchang lists traditional daily time windows from the Vedic almanac. Rahu Kalam, Yamaganda, and Gulika are generally considered cautious periods for starting new tasks or travel, while Abhijit is often an auspicious (good) window for important actions.",
        rahuLabel: "Rahu Kalam",
        yamaLabel: "Yamaganda",
        gulikaLabel: "Gulika",
        abhijitLabel: "Abhijit",
        cautious: "Cautious",
        auspicious: "Auspicious",
      },

      energy: {
        label: "Energy",
        caption: "How easy it feels to push today",
        sentences: {
          low: "Energy {val}: go easy; keep tasks small.",
          solid: "Energy {val}: solid — push meaningful work inside the best window.",
          strong: "Energy {val}: strong — schedule big moves in the best window.",
          peak: "Energy {val}: peak — launch, negotiate, or present; block distractions.",
        },
      },

      sections: { goodTimes: "Good times", caution: "Caution", remedies: "Remedies" },
      remedies: {
        wear: "Wear",
        say: "Say",
        puja: "Puja",
        do: "Do",
        alt: "Alt",
        optionalPrefix: "Optional:",
        disclaimer: "This is guidance, not a substitute for professional advice.",
        copyPlan: "Copy plan",
      },

      debug: {
        title: "Why (debug)",
        hide: "Hide",
        show: "Show",
        tspmsp: "Top Support (tsp) / Top Stress (msp)",
        mdad: "MD / AD",
        tagsSupport: "Tags (support)",
        tagsStress: "Tags (stress)",
        supportPct: "Support %",
        stressPct: "Stress %",
      },

      avoidWindows: "Avoid windows",
      avoid: "Avoid",
      and: "and",
      sensitiveConversations: "sensitive conversations",
      travel: "travel",

      topics: {
        sensitiveConversations: "sensitive conversations",
        travel: "travel",
        trading: "risky trades",
        legal: "paperwork/contracts",
        creative: "creative gambles",
        networking: "cold outreach",
        familyKids: "family/children topics",
        finance: "big money decisions",
        health: "strenuous workouts",
        tech: "tech changes",
        doomscroll: "doomscrolling and impulsive posts",
        msp: "over-commitment and late-night work",
      },

      deities: {
        Shani: "Shani",
        Durga: "Durga",
        Shiva: "Shiva",
        Vishnu: "Vishnu",
        Lakshmi: "Lakshmi",
        Hanuman: "Hanuman",
        Surya: "Surya",
        Ganesha: "Ganesha",
      },

      yourDay: "Your Day",
    },

    phrases: {
      HEADLINE_COMM_GOOD: "Good for conversations {start}-{end}",
      HEADLINE_TRAVEL_AVOID: "Avoid travel {start}-{end}",
      HEADLINE_REASON: "{planet} {aspect} {target}",
      HEADLINE_REASON_TEXT: "{reason}",

      NOTE_COMM_BEST: "Use the best window for official and personal talks.",
      NOTE_TRAVEL_AVOID: "Delay non-essential travel in the avoid windows.",
      NOTE_TRADING: "Stay disciplined; avoid trades in the marked windows.",

      DO_TALK_MEET_WINDOW: "Talk or meet {start}-{end}.",
      DO_TRADING_PREFER_WINDOW: "If trading, prefer {start}-{end} with strict stops.",
      DO_CREATIVE_WINDOW: "Use {start}-{end} for creative work. Make a first draft.",
      DO_PAPERWORK_WINDOW: "Paperwork {start}-{end}. Check names, dates, and amounts.",
      DO_CREATIVE_SHORT: "Create for 30–45 min. Share a preview.",
      DO_STUDY_30MIN: "Study for 30 minutes. Review one tough topic.",
      DO_ADMIN_CLEAR_SMALL: "Clear 1-2 small admin tasks today.",
      DO_FOLLOWUP_SHORT: "Send a short follow-up by {time}.",
      DO_WALK_20MIN: "15–20 min mobility or a brisk walk.",
      DO_CONTRACTS_WINDOW: "Review contracts {start}-{end}. Read before you sign.",
      DO_FAMILY_TIME_WINDOW: "Family time {start}-{end}. Keep the phone away.",

      DONT_AVOID_SENSITIVE_CONVOS_WINDOW: "Avoid sensitive conversations {start}-{end}.",
      DONT_AVOID_TRAVEL_WINDOW: "Avoid travel {start}-{end}.",
      DONT_AVOID_TRADING_WINDOW: "Avoid trading {start}-{end}.",
      DONT_DRIVE_DEFENSIVE_WINDOW: "Drive carefully {start}-{end}. Avoid confrontations.",
      DONT_BLOCK_SPAM: "Ignore spam/unknown callers; block and report.",

      DH_CLIENT_MEETING_TRY_WINDOW_SIMPLE: "Client meeting? Try {start}-{end}. Keep it simple.",
      DH_CLIENT_WARM_NOTE: "Send a warm note to one client. Ask for a simple next step.",
      DH_INVOICES_FOLLOWUP_POLITE:
        "Follow up on pending invoices before lunch. Be polite and clear.",

      ASPECT_REASON: "{planet} {aspect} {target}",
      ASPECT_REASON_TEXT: "{reason}",
      REMEDY_OPTIONAL_DYNAMIC: "{text}",
    },
  },
};

export type DailyLocale = typeof enDaily;
export default enDaily;
