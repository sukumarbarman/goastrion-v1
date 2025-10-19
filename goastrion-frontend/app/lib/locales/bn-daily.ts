// goastrion-frontend/app/lib/locales/bn-daily.ts
import type { DailyLocale } from "./en-daily";
export { formatDaily } from "./en-daily";

const bnDaily: DailyLocale = {
  navbar: { daily: "আপনারদিন" },

  daily: {
    // ✅ same keys as en-daily.ts
    optionalAddons: {
      travel: "১০-মিনিট আগে বের হন; রুট নিশ্চিত করুন",
      detox: "১০-মিনিট ডিজিটাল ডিটক্স",
      roadSafety: "সড়ক-নিরাপত্তা/কম্বল চ্যারিটি সমর্থন করুন",
    },

    title: "আপনার দিন",
    subtitle: "আপনার দিনের সহায়ক সময়-জানালা, হাইলাইট ও প্রতিকার।",
    changeBirth: "জন্মতথ্য পরিবর্তন",
    forDate: "তারিখ (YYYY-MM-DD)",
    persona: "পার্সোনা",
    get: "দিন দেখুন",
    getting: "আনা হচ্ছে…",

    missingBirth: {
      title: "জন্মতথ্য প্রয়োজন",
      desc: "দৈনিক সময়-জানালা ব্যক্তিগতকরণের জন্য আগে আপনার চার্ট তৈরি করুন।",
      cta: "চার্ট তৈরি করুন",
    },

    ui: {
      dobLabel: "জন্ম",
      today: "আজ",
      loading: "লোড হচ্ছে…",
      tryAgain: "আবার চেষ্টা করুন",
      headline: "শিরোনাম",
      windowsToday: "আজকের সময়-জানালা",
      best: "সেরা",
      green: "সবুজ",
      caution: "সতর্কতা",
      wear: "রং পরুন",
      energy: {
        label: "শক্তি",
        caption: "আজ এগোনো কতটা সহজ মনে হবে",
        sentences: {
          low: "শক্তি {val}: আরাম করে চলুন; কাজ ছোট রাখুন।",
          solid:
            "শক্তি {val}: স্থির — সেরা সময়ে অর্থপূর্ণ কাজ এগিয়ে নিন।",
          strong:
            "শক্তি {val}: জোরালো — বড় কাজগুলো সেরা সময়ে রাখুন।",
          peak:
            "শক্তি {val}: শীর্ষ — লঞ্চ/আলোচনা/প্রেজেন্টেশন; বিঘ্ন আটকান।",
        },
      },
      sections: { goodTimes: "ভালো সময়", caution: "সতর্কতা", remedies: "প্রতিকার" },
      remedies: {
        wear: "রং পরুন",
        say: "বলুন",
        puja: "পূজা",
        do: "করুন",
        alt: "বিকল্প",
        optionalPrefix: "ঐচ্ছিক:",
        disclaimer: "এটি কেবল দিকনির্দেশ; পেশাদার পরামর্শের বিকল্প নয়।",
        copyPlan: "প্ল্যান কপি করুন",
      },
      debug: {
        title: "কেন (ডিবাগ)",
        hide: "লুকান",
        show: "দেখান",
        tspmsp: "সর্বোচ্চ সমর্থন (tsp) / সর্বোচ্চ চাপ (msp)",
        mdad: "MD / AD",
        tagsSupport: "ট্যাগ (সমর্থন)",
        tagsStress: "ট্যাগ (চাপ)",
        supportPct: "সমর্থন %",
        stressPct: "চাপ %",
      },
      avoidWindows: "এড়ানোর সময়",
      avoid: "এড়িয়ে চলুন",
      and: "এবং",
      sensitiveConversations: "সংবেদনশীল আলাপ",
      travel: "ভ্রমণ",
      topics: {
        sensitiveConversations: "সংবেদনশীল আলাপ",
        travel: "ভ্রমণ",
        trading: "ঝুঁকিপূর্ণ ট্রেড",
        legal: "কাগজপত্র/চুক্তি",
        creative: "সৃজনশীল ঝুঁকি",
        networking: "কোল্ড আউটরিচ",
        familyKids: "পরিবার/শিশু বিষয়",
        finance: "বড় অর্থনৈতিক সিদ্ধান্ত",
        health: "কঠিন ওয়ার্কআউট",
        tech: "প্রযুক্তি পরিবর্তন",
        doomscroll: "ডুমস্ক্রলিং ও আবেগপ্রবণ পোস্ট",
        msp: "অতিরিক্ত প্রতিশ্রুতি ও রাতজাগা কাজ",
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
      yourDay: "আপনার দিন",
    },

    phrases: {
      HEADLINE_COMM_GOOD: "আলাপের জন্য ভালো {start}-{end}",
      HEADLINE_TRAVEL_AVOID: "ভ্রমণ এড়িয়ে চলুন {start}-{end}",
      HEADLINE_REASON: "{planet} {aspect} {target}",
      HEADLINE_REASON_TEXT: "{reason}",
      NOTE_COMM_BEST: "আনুষ্ঠানিক/ব্যক্তিগত আলাপের জন্য সেরা সময় ব্যবহার করুন।",
      NOTE_TRAVEL_AVOID: "এড়ানোর সময়ে অপ্রয়োজনীয় ভ্রমণ পিছিয়ে দিন।",
      NOTE_TRADING: "নিয়মানুবর্তী থাকুন; চিহ্নিত সময়ে ট্রেড এড়িয়ে চলুন।",

      DO_TALK_MEET_WINDOW: "আলাপ বা মিটিং {start}-{end}।",
      DO_TRADING_PREFER_WINDOW:
        "ট্রেড হলে {start}-{end} পছন্দ করুন; স্টপ কঠোর রাখুন।",
      DO_CREATIVE_WINDOW:
        "{start}-{end} সৃজনশীল কাজে দিন। প্রথম খসড়া বানান।",
      DO_PAPERWORK_WINDOW:
        "কাগজপত্র {start}-{end}। নাম, তারিখ, পরিমাণ যাচাই করুন।",
      DO_CREATIVE_SHORT: "৩০–৪৫ মিনিট তৈরি করুন। একটি প্রিভিউ শেয়ার করুন।",
      DO_STUDY_30MIN: "৩০ মিনিট পড়াশোনা। একটি কঠিন টপিক রিভিউ করুন।",
      DO_ADMIN_CLEAR_SMALL: "আজ ১–২টি ছোট অ্যাডমিন কাজ সেরে ফেলুন।",
      DO_FOLLOWUP_SHORT: "{time}-এর মধ্যে ছোট ফলো-আপ পাঠান।",
      DO_WALK_20MIN: "১৫–২০ মিনিট মবিলিটি বা brisk walk।",

      DO_CONTRACTS_WINDOW:
        "চুক্তি/কাগজপত্র {start}-{end}। সইয়ের আগে পড়ে নিন।",
      DO_FAMILY_TIME_WINDOW: "পরিবারের সময় {start}-{end}। ফোন দূরে রাখুন।",

      DONT_AVOID_SENSITIVE_CONVOS_WINDOW:
        "সংবেদনশীল আলাপ এড়িয়ে চলুন {start}-{end}।",
      DONT_AVOID_TRAVEL_WINDOW: "ভ্রমণ এড়িয়ে চলুন {start}-{end}।",
      DONT_AVOID_TRADING_WINDOW: "ট্রেডিং এড়িয়ে চলুন {start}-{end}।",
      DONT_DRIVE_DEFENSIVE_WINDOW:
        "{start}-{end} সাবধানে গাড়ি চালান; বিবাদ এড়ান।",
      DONT_BLOCK_SPAM:
        "স্প্যাম/অচেনা কল উপেক্ষা করুন; ব্লক ও রিপোর্ট করুন।",

      DH_CLIENT_MEETING_TRY_WINDOW_SIMPLE:
        "ক্লায়েন্ট মিটিং? চেষ্টা করুন {start}-{end}। সরল রাখুন।",
      DH_CLIENT_WARM_NOTE:
        "একজন ক্লায়েন্টকে উষ্ণ নোট পাঠান। সহজ পরবর্তী ধাপ জিজ্ঞেস করুন।",
      DH_INVOICES_FOLLOWUP_POLITE:
        "দুপুরের আগে ইনভয়েসে ভদ্র ফলো-আপ দিন। স্পষ্ট থাকুন।",

      ASPECT_REASON: "{planet} {aspect} {target}",
      ASPECT_REASON_TEXT: "{reason}",
      REMEDY_OPTIONAL_DYNAMIC: "{text}",
    },
  },
};

export default bnDaily;
