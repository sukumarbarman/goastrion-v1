export type DailyArgs = Record<string, string | number | undefined>;

export const formatDaily = (tpl: string, args: DailyArgs = {}) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => (args[k] ?? "").toString());

const bnDaily = {
  // --------------------------
  // Profile Quick View (merged)
  // --------------------------
  profile: {
    daily: {
      title: "দৈনিক সংক্ষিপ্ত দেখা",
      subtitle: "আপনার জন্ম তথ্য অনুযায়ী ব্যক্তিগত শুভ সময় ও সতর্কতা।",
      region: "দৈনিক সংক্ষিপ্ত দেখা",
      empty: "দৈনিক ফল দেখতে জন্মের তথ্য যোগ করুন।",
      cta: {
        open: "আজ জানুন",
        tomorrow: "আগামীকাল পরিকল্পনা করুন",
      },
    },

    account: {
      actions: {
        editBirth: "জন্ম তথ্য সম্পাদনা করুন",
      },
    },
  },

  history: {
    dailyOpened: "প্রোফাইল থেকে দৈনিক পৃষ্ঠা খোলা হয়েছে",
  },

  // --------------------------
  // Daily Page (translated)
  // --------------------------
  daily: {
    optionalAddons: {
      travel: "১০ মিনিট আগে বের হন; পথ নিশ্চিত করুন",
      detox: "১০ মিনিটের ডিজিটাল বিশ্রাম",
      roadSafety: "সড়ক নিরাপত্তা বা কম্বল দান করুন",
    },

    title: "আপনার দিন",
    subtitle: "আজকের শুভ সময়, সতর্কতা ও করণীয় সমাধান।",
    changeBirth: "জন্মের তথ্য পরিবর্তন করুন",
    forDate: "তারিখ অনুযায়ী (YYYY-MM-DD)",
    persona: "ব্যক্তিত্ব",
    get: "দৈনিক ফল পান",
    getting: "আনা হচ্ছে…",

    missingBirth: {
      title: "জন্মের তথ্য প্রয়োজন",
      desc: "দয়া করে প্রথমে আপনার জন্মছক তৈরি করুন, যাতে আমরা আপনার জন্য ব্যক্তিগত দৈনিক সময় জানাতে পারি।",
      cta: "জন্মছক তৈরি করুন",
    },

    ui: {
      dobLabel: "জন্মতারিখ",
      today: "আজ",
      loading: "লোড হচ্ছে…",
      tryAgain: "আবার চেষ্টা করুন",
      headline: "মূল বক্তব্য",
      windowsToday: "আজকের সময়সমূহ",
      best: "সেরা",
      green: "শুভ",
      caution: "সতর্কতা",
      wear: "পোশাক",

      panchang: {
        title: "পঞ্চাং",
        desc:
          "পঞ্চাং অনুযায়ী প্রতিদিনের শুভ ও অশুভ সময় নির্দেশ করে। রাহু কাল, যমগণ্ড, গুলিক সাধারণত নতুন কাজ বা যাত্রা শুরু করার জন্য অশুভ বলে ধরা হয়, অন্যদিকে অভিজিত মুহূর্তকে শুভ (মঙ্গলজনক) সময় মনে করা হয়।",
        rahuLabel: "রাহু কাল",
        yamaLabel: "যমগণ্ড",
        gulikaLabel: "গুলিক",
        abhijitLabel: "অভিজিত",
        cautious: "সতর্ক",
        auspicious: "শুভ",
      },

      energy: {
        label: "শক্তি",
        caption: "আজ কাজের গতি কেমন লাগছে",
        sentences: {
          low: "শক্তি {val}: ধীরে চলুন; ছোট কাজ করুন।",
          solid: "শক্তি {val}: স্থির — শুভ সময়ে গুরুত্বপূর্ণ কাজ করুন।",
          strong: "শক্তি {val}: প্রবল — বড় পরিকল্পনা আজ করুন।",
          peak: "শক্তি {val}: সর্বোচ্চ — উপস্থাপনা বা আলোচনার জন্য উপযুক্ত সময়।",
        },
      },

      sections: {
        goodTimes: "শুভ সময়",
        caution: "সতর্কতা",
        remedies: "সমাধান",
      },

      remedies: {
        wear: "পরিধান করুন",
        say: "মন্ত্র বলুন",
        puja: "পূজা করুন",
        do: "করুন",
        alt: "বিকল্প",
        optionalPrefix: "ঐচ্ছিক:",
        disclaimer: "এটি একটি নির্দেশনা, পেশাদার পরামর্শের বিকল্প নয়।",
        copyPlan: "পরিকল্পনা কপি করুন",
      },

      debug: {
        title: "কারণ",
        hide: "লুকান",
        show: "দেখান",
        tspmsp: "শ্রেষ্ঠ সহায়তা (tsp) / সর্বাধিক চাপ (msp)",
        mdad: "মহাদশা / অন্তর্দশা",
        tagsSupport: "সহায়ক ট্যাগ",
        tagsStress: "চাপ ট্যাগ",
        supportPct: "সহায়তা %",
        stressPct: "চাপ %",
      },

      avoidWindows: "অশুভ সময় এড়ান",
      avoid: "এড়ান",
      and: "এবং",
      sensitiveConversations: "সংবেদনশীল আলোচনা",
      travel: "ভ্রমণ",

      topics: {
        sensitiveConversations: "সংবেদনশীল আলোচনা",
        travel: "ভ্রমণ",
        trading: "ঝুঁকিপূর্ণ লেনদেন",
        legal: "কাগজপত্র / চুক্তি",
        creative: "সৃজনশীল প্রচেষ্টা",
        networking: "নতুন যোগাযোগ",
        familyKids: "পরিবার / সন্তান সম্পর্কিত বিষয়",
        finance: "বড় আর্থিক সিদ্ধান্ত",
        health: "কঠোর ব্যায়াম",
        tech: "প্রযুক্তি পরিবর্তন",
        doomscroll: "নেতিবাচক পোস্ট / স্ক্রলিং",
        msp: "অতিরিক্ত দায়িত্ব বা রাত জেগে কাজ",
      },

      deities: {
        Shani: "শনি",
        Durga: "দুর্গা",
        Shiva: "শিব",
        Vishnu: "বিষ্ণু",
        Lakshmi: "লক্ষ্মী",
        Hanuman: "হনুমান",
        Surya: "সূর্য",
        Ganesha: "গণেশ",
      },

      yourDay: "আজ",
    },

    phrases: {
      HEADLINE_COMM_GOOD: "আলোচনার জন্য শুভ {start}-{end}",
      HEADLINE_TRAVEL_AVOID: "ভ্রমণ এড়ান {start}-{end}",
      HEADLINE_REASON: "{planet} {aspect} {target}",
      HEADLINE_REASON_TEXT: "{reason}",

      NOTE_COMM_BEST: "ব্যক্তিগত ও অফিসিয়াল আলোচনার জন্য সেরা সময়টি ব্যবহার করুন।",
      NOTE_TRAVEL_AVOID: "অপ্রয়োজনীয় ভ্রমণ আজ এড়িয়ে চলুন।",
      NOTE_TRADING: "চিহ্নিত সময়ে লেনদেন থেকে বিরত থাকুন; শৃঙ্খলা বজায় রাখুন।",

      DO_TALK_MEET_WINDOW: "{start}-{end} এর মধ্যে কথা বলুন বা দেখা করুন।",
      DO_TRADING_PREFER_WINDOW:
        "লেনদেন করলে, {start}-{end} সময় পছন্দ করুন (কঠোর স্টপ লস রাখুন)।",
      DO_CREATIVE_WINDOW: "{start}-{end} সময় সৃজনশীল কাজে ব্যবহার করুন। প্রথম খসড়া তৈরি করুন।",
      DO_PAPERWORK_WINDOW: "কাগজপত্র {start}-{end} সময় করুন। নাম, তারিখ ও পরিমাণ যাচাই করুন।",
      DO_CREATIVE_SHORT: "৩০–৪৫ মিনিট কিছু তৈরি করুন। প্রিভিউ শেয়ার করুন।",
      DO_STUDY_30MIN: "৩০ মিনিট পড়াশোনা করুন। একটি কঠিন বিষয় পুনরায় দেখুন।",
      DO_ADMIN_CLEAR_SMALL: "আজ ১–২টি ছোট প্রশাসনিক কাজ শেষ করুন।",
      DO_FOLLOWUP_SHORT: "{time} এর মধ্যে একটি সংক্ষিপ্ত অনুস্মারক পাঠান।",
      DO_WALK_20MIN: "১৫–২০ মিনিট হালকা হাঁটুন বা স্ট্রেচ করুন।",
      DO_CONTRACTS_WINDOW: "চুক্তি {start}-{end} সময় পর্যালোচনা করুন। সই করার আগে পড়ে নিন।",
      DO_FAMILY_TIME_WINDOW: "পরিবারের সঙ্গে সময় কাটান {start}-{end}। ফোন দূরে রাখুন।",

      DONT_AVOID_SENSITIVE_CONVOS_WINDOW: "সংবেদনশীল আলোচনা এড়ান {start}-{end}।",
      DONT_AVOID_TRAVEL_WINDOW: "ভ্রমণ এড়ান {start}-{end}।",
      DONT_AVOID_TRADING_WINDOW: "লেনদেন এড়ান {start}-{end}।",
      DONT_DRIVE_DEFENSIVE_WINDOW:
        "গাড়ি সাবধানে চালান {start}-{end}। বিতর্ক এড়ান।",
      DONT_BLOCK_SPAM: "অজানা কল উপেক্ষা করুন; ব্লক ও রিপোর্ট করুন।",

      DH_CLIENT_MEETING_TRY_WINDOW_SIMPLE:
        "ক্লায়েন্ট মিটিং? চেষ্টা করুন {start}-{end}। সংক্ষিপ্ত রাখুন।",
      DH_CLIENT_WARM_NOTE:
        "একজন ক্লায়েন্টকে বন্ধুত্বপূর্ণ বার্তা পাঠান। সহজ পরবর্তী পদক্ষেপ জিজ্ঞাসা করুন।",
      DH_INVOICES_FOLLOWUP_POLITE:
        "দুপুরের আগে বাকি বিল সম্পর্কে ভদ্রভাবে অনুস্মারক পাঠান। পরিষ্কার থাকুন।",

      ASPECT_REASON: "{planet} {aspect} {target}",
      ASPECT_REASON_TEXT: "{reason}",
      REMEDY_OPTIONAL_DYNAMIC: "{text}",
    },
  },
};

export type DailyLocale = typeof bnDaily;
export default bnDaily;
