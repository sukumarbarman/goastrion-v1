// goastrion-frontend/app/lib/locales/bn-daily.ts
import type { DailyLocale } from "./en-daily";
export { formatDaily } from "./en-daily";

const bnDaily: DailyLocale = {
  navbar: { daily: "আপনারদিন" },

  daily: {
    // ✅ New: localized add-ons used by DailyResults.tsx
    optionalAddons: {
      travel: "১০-মিনিট আগে বের হন; রুট নিশ্চিত করুন",
      detox: "১০-মিনিট ডিজিটাল ডিটক্স",
      roadSafety: "সড়ক-নিরাপত্তা/কম্বল চ্যারিটি সমর্থন করুন",
    },

    title: "আপনার দিন",
    subtitle: "আপনার日の সহায়ক সময়-জানালা, হাইলাইট ও প্রতিকার।",
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
          solid: "শক্তি {val}: স্থির — সেরা সময়ে অর্থপূর্ণ কাজ এগিয়ে নিন।",
          strong: "শক্তি {val}: জোরালো — বড় কাজগুলো সেরা সময়ে রাখুন।",
          peak: "শক্তি {val}: শীর্ষ — লঞ্চ/আলোচনা/প্রেজেন্টেশন; বিঘ্ন আটকান।",
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
      // (Optional) deity labels if you later localize them in UI
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

    // ✅ New: planet/period “optional” one-liners so Bengali never falls back to English
    optional: {
      Saturn: {
        morning: "২-মিনিট ভঙ্গি ঠিক করুন; শুধু শীর্ষ ৩টি কাজ লিখুন।",
        afternoon: "একটি ছোট বাকি পরিশোধ করুন; ১০-মিনিট ডেস্ক গুছিয়ে নিন।",
        evening: "সূর্যাস্তে ১০-মিনিট হাঁটুন; সময়মতো ঘুমান।",
        night: "হালকা রাতের খাবার; ঘুমের ৩০-মিনিট আগে স্ক্রিন নয়।",
        generic: "দিনমজুরকে সহায়তা/ন্যায্য টিপ দিন।",
      },
      Rahu: {
        morning: "সোশ্যাল ১০টা পর্যন্ত বিলম্ব; প্রথম ৩০-মিনিট একক কাজে দিন।",
        afternoon: "২টি বিভ্রান্তিকর চ্যাট ৪ঘণ্টা মিউট করুন।",
        evening: "ডিজিটাল সানসেট: রাত ৯টার পর স্ক্রল নয়।",
        night: "ঘুমের আগে এয়ারপ্লেন-মোড; কৃতজ্ঞতার ১টি লাইন লিখুন।",
        generic: "৫টি জিনিস ডিক্লাটার; গসিপ লুপ এড়ান।",
      },
      Ketu: {
        morning: "১০-মিনিটের কম লাগে এমন একটি ঝুলে থাকা কাজ শেষ করুন।",
        afternoon: "২০টি পুরোনো ইমেল/ফাইল আর্কাইভ করুন।",
        evening: "হালকা ডিক্লাটার; আগামীকালের একটি কাজ পরিকল্পনা করুন।",
        night: "৫-মিনিট জার্নালিং; বেডসাইড মিনিমাল রাখুন।",
        generic: "ডেস্ক থেকে একটি বিভ্রান্তি সরান।",
      },
      Mars: {
        morning: "সংক্ষিপ্ত দ্রুত হাঁটা; মশলাদার লাঞ্চ এড়ান।",
        afternoon: "জবাব দেওয়ার আগে শান্ত হন; ১০ পর্যন্ত গুনুন।",
        evening: "হালকা ওয়ার্কআউট বা ১০-মিনিট স্ট্রেচ।",
        night: "গরম জল দিয়ে স্নান; রাতে তর্ক নয়।",
        generic: "তপ্ত বার্তা পাঠানোর আগে বিরতি নিন।",
      },
      Mercury: {
        morning: "১০-মিনিট ইনবক্স-জিরো; নাম ও অঙ্ক যাচাই করুন।",
        afternoon: "প্রথম খসড়া লিখুন; সম্পাদনা পরে।",
        evening: "আগামীকালের ৩টি কল পরিকল্পনা করুন; ছোট রাখুন।",
        night: "৫টি বুলেট ব্রেইন-ডাম্প করুন; নিশ্চিন্তে ঘুমান।",
        generic: "ভ্রমণের সময় ও ভেন্যু পিন আবার যাচাই করুন।",
      },
      Venus: {
        morning: "হালকা/প্যাস্টেল কিছু পরুন; আপনার জায়গা গুছিয়ে নিন।",
        afternoon: "একটি সদয় নোট/প্রশংসা যোগ করুন।",
        evening: "কিছু মিষ্টি রান্না/শেয়ার করুন।",
        night: "মৃদু সঙ্গীত; শিথিলের জন্য নরম আলো।",
        generic: "বিউটি ডেস্ক ডিক্লাটার; শান্ত রং বেছে নিন।",
      },
      Jupiter: {
        morning: "১ পৃষ্ঠা পড়ুন; একটি শেখার লক্ষ্য ঠিক করুন।",
        afternoon: "একজন বন্ধুকে একটি সহায়ক রিসোর্স শেয়ার করুন।",
        evening: "শিক্ষা/স্বাস্থ্য খাতে ₹৫০/₹১০০ দান করুন।",
        night: "একজন মেন্টরকে কৃতজ্ঞতার নোট পাঠান।",
        generic: "আজ একটি উদার কাজ করুন।",
      },
      Moon: {
        morning: "২ গ্লাস জল; ৫টি ধীর শ্বাস।",
        afternoon: "হালকা রোদে একটু হাঁটা; তাজা ফল খান।",
        evening: "আগেভাগে ডিনার; স্নিগ্ধ চা।",
        night: "বিছানায় স্ক্রিন নয়; ১১টি ধীর শ্বাস।",
        generic: "পরিবারের খোঁজ নিন; ৫-মিনিটের কল।",
      },
      Sun: {
        morning: "১০-মিনিট রোদ; দিনের ৩টি লক্ষ্য ঠিক করুন।",
        afternoon: "১৫-মিনিট দাঁড়িয়ে কাজ; কাঁধ সোজা।",
        evening: "সময়ে কাজ গুটিয়ে নিন; আজ বীরত্ব নয়।",
        night: "আগামীকালের কাপড় গুছিয়ে রাখুন।",
        generic: "একটি দৃঢ় পদক্ষেপ > অনেক খসড়া।",
      },
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
      DO_TRADING_PREFER_WINDOW: "ট্রেড হলে {start}-{end} পছন্দ করুন; স্টপ কঠোর রাখুন।",
      DO_CREATIVE_WINDOW: "{start}-{end} সৃজনশীল কাজে দিন। প্রথম খসড়া বানান।",
      DO_PAPERWORK_WINDOW: "কাগজপত্র {start}-{end}। নাম, তারিখ, পরিমাণ যাচাই করুন।",
      DO_CREATIVE_SHORT: "৩০–৪৫ মিনিট তৈরি করুন। একটি প্রিভিউ শেয়ার করুন।",
      DO_STUDY_30MIN: "৩০ মিনিট পড়াশোনা। একটি কঠিন টপিক রিভিউ করুন।",
      DO_ADMIN_CLEAR_SMALL: "আজ ১–২টি ছোট অ্যাডমিন কাজ সেরে ফেলুন।",
      DO_FOLLOWUP_SHORT: "{time}-এর মধ্যে ছোট ফলো-আপ পাঠান।",
      DO_WALK_20MIN: "১৫–২০ মিনিট মবিলিটি বা brisk walk।",

      DONT_AVOID_SENSITIVE_CONVOS_WINDOW: "সংবেদনশীল আলাপ এড়িয়ে চলুন {start}-{end}।",
      DONT_AVOID_TRAVEL_WINDOW: "ভ্রমণ এড়িয়ে চলুন {start}-{end}।",
      DONT_AVOID_TRADING_WINDOW: "ট্রেডিং এড়িয়ে চলুন {start}-{end}।",
      DONT_DRIVE_DEFENSIVE_WINDOW: "{start}-{end} সাবধানে গাড়ি চালান; বিবাদ এড়ান।",
      DONT_BLOCK_SPAM: "স্প্যাম/অচেনা কল উপেক্ষা করুন; ব্লক ও রিপোর্ট করুন।",

      DH_CLIENT_MEETING_TRY_WINDOW_SIMPLE: "ক্লায়েন্ট মিটিং? চেষ্টা করুন {start}-{end}। সরল রাখুন।",
      DH_CLIENT_WARM_NOTE: "একজন ক্লায়েন্টকে উষ্ণ নোট পাঠান। সহজ পরবর্তী ধাপ জিজ্ঞেস করুন।",
      DH_INVOICES_FOLLOWUP_POLITE: "দুপুরের আগে ইনভয়েসে ভদ্র ফলো-আপ দিন। স্পষ্ট থাকুন।",

      ASPECT_REASON: "{planet} {aspect} {target}",
      ASPECT_REASON_TEXT: "{reason}",

      REMEDY_OPTIONAL_DYNAMIC: "{text}",
      DO_CONTRACTS_WINDOW: "চুক্তি/কাগজপত্র {start}-{end}। সইয়ের আগে পড়ে নিন।",
      DO_FAMILY_TIME_WINDOW: "পরিবারের সময় {start}-{end}। ফোন দূরে রাখুন।",
    },
  },
};

export default bnDaily;
