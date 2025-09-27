// app/lib/locales/bn-insights.ts
// ইনসাইটস / লাইফ-হুইল
const bnInsights = {
  insights: {
    copy: {
      line1_template: "এই মুহূর্তে {domain} {phase} পর্যায়ে আছে ({score}/100)।",
      phase_by_tier: {
        weak: "গড়ে ওঠার পর্যায়",
        moderate: "গড়ন/শেপিং পর্যায়",
        strong: "জোরালো গতি",
        excellent: "শিখর পর্যায়",
        unknown: "বিবর্তিত হওয়ার পর্যায়",
      },
      houses_intro: "{houseList} {themes}-এ আলোকপাত করে।",
      housesWord: "ভাব",
      housesWordPlural: "ভাব",
      join: { and: "এবং", comma: ", " },
      planets_intro: "{planetList} এগিয়ে থাকায়, ফোকাস করুন: {adviceList}।",
      planet_advice: {
        Sun: "দায়িত্বশীল নেতৃত্ব",
        Moon: "স্থিতিশীল আত্ম-যত্ন",
        Mars: "কেন্দ্রিত পদক্ষেপ",
        Mercury: "পরিষ্কার যোগাযোগ",
        Jupiter: "শেখা ও মেন্টরশিপ",
        Venus: "সম্পর্ক-নির্মাণ",
        Saturn: "অনুশাসিত অভ্যাস",
        Rahu: "উচ্চাকাঙ্ক্ষী লক্ষ্য",
        Ketu: "নীরব আত্মমনন",
      },
      aspects_intro: "উল্লেখযোগ্য অ্যাসপেক্ট: {items}।",
      aspect_pair: "{p1}–{p2} ({tone} {name})",
      aspect_item: "{pair} — {hint}",
      aspect_tone: {
        Conjunction: "তীব্র",
        Opposition: "দ্বিমুখী টান",
        Trine: "সামঞ্জস্যপূর্ণ",
        Square: "চ্যালেঞ্জিং",
        Sextile: "সহায়ক",
      },
      aspect_hint_by_name: {
        Conjunction: "তীব্রতা আনে—গতি সামলে চলুন",
        Opposition: "দুই দিকে টানে—দুই পাশ সামঞ্জস্য রাখুন",
        Trine: "সহজে প্রবাহিত—এটাকে কাজে লাগান",
        Square: "ঘর্ষণ বাড়ায়—ধাপে ধাপে এগোন",
        Sextile: "সহায়তা দেয়—ছোট পদক্ষেপে সক্রিয় করুন",
      },
    },

    housesOrdinal: {
      1: "১ম", 2: "২য়", 3: "৩য়", 4: "৪র্থ", 5: "৫ম", 6: "৬ষ্ঠ",
      7: "৭ম", 8: "৮ম", 9: "৯ম", 10: "১০ম", 11: "১১তম", 12: "১২তম",
    },

    // চিপ টোন (UI + কপি)
    aspectTone: {
      Conjunction: "তীব্র",
      Opposition: "দ্বিমুখী টান",
      Trine: "সামঞ্জস্যপূর্ণ",
      Square: "চ্যালেঞ্জিং",
      Sextile: "সহায়ক",
    },

    housesGloss: {
      1: "স্ব, প্রাণশক্তি",
      2: "ধন, বাক্‌শক্তি",
      3: "সাহস, দক্ষতা",
      4: "গৃহ, ভিত্তি",
      5: "সৃজনশীলতা, অধ্যয়ন",
      6: "কর্ম, স্বাস্থ্য",
      7: "সহযোগিতা/সঙ্গ",
      8: "গভীরতা, রূপান্তর",
      9: "ধর্ম, উচ্চ শিক্ষা",
      10: "ক্যারিয়ার, মর্যাদা",
      11: "লাভ, নেটওয়ার্ক",
      12: "নিবৃত্তি, ব্যয়",
    },

    planetsGloss: {
      Sun: "কর্তৃত্ব, প্রাণশক্তি",
      Moon: "মন, প্রবাহ",
      Mars: "উদ্যম, উদ্যোগ",
      Mercury: "বিশ্লেষণ, যোগাযোগ",
      Jupiter: "বিকাশ, জ্ঞান",
      Venus: "কলা, সাম্য",
      Saturn: "শৃঙ্খলা, গঠন",
      Rahu: "উদ্বেল উচ্চাকাঙ্ক্ষা",
      Ketu: "বৈরাগ্য, অন্তর্দৃষ্টি",
    },

    pages: {
      domainsTitle: "লাইফ হুইল",
      domainsSubtitle: "আপনার স্কোর, হাইলাইট ও টাইমিং দেখার জন্য একটি লাইফ-হুইল বেছে নিন।",
      skillsTitle: "স্কিল স্পটলাইট",
      skillsSubtitle: "আপনার চার্ট থেকে অনুমিত ভিত্তিগত সক্ষমতা।",
      highlightsTitle: "হাইলাইটস",
      highlightPlanets: "মূল গ্রহ",
      highlightHouses: "মূল ভাব",
      timeWindowsTitle: "সময়ের জানালা",
      noExactYet: "এখনও নির্দিষ্ট তারিখ নেই",
      highlightAspects: "মূল অ্যাসপেক্ট",
      chartTitle: "চার্ট",
    },

    ui: {
      clearHighlights: "হাইলাইট পরিষ্কার করুন",
      highlightPlanetsBtn: "গ্রহ হাইলাইট করুন",
      highlightHousesBtn: "ভাবের গ্রহ হাইলাইট করুন",
      highlightAspectsBtn: "অ্যাসপেক্ট হাইলাইট করুন",
      notableAspects: "উল্লেখযোগ্য অ্যাসপেক্ট",
      keyHousesLabel: "মূল ভাব",
      keyPlanetsLabel: "মূল গ্রহ",
      highlightAll: "সব হাইলাইট করুন",
      house: "ভাব",
    },

    // অ্যাসপেক্ট তালিকার লেবেল
    aspect: {
      Conjunction: "সংযোগ (Conjunction)",
      Opposition: "বিপরীত (Opposition)",
      Trine: "ত্রিকোণ (Trine)",
      Square: "চতুষ্কোণ (Square)",
      Sextile: "ষড়াষ্টক (Sextile)",
    },

    // টিয়ার ব্যাজ
    tiers: { weak: "দুর্বল", moderate: "মধ্যম", strong: "শক্তিশালী", excellent: "অসাধারণ" },

    actions: { highlightAllDomain: "এই ডোমেইনের সব হাইলাইট করুন" },

    // ডোমেইন কার্ড + housePresence
    domains: {
      career:    { title: "ক্যারিয়ার",    chip10th: "১০ম ভাব", chip6th: "৬ষ্ঠ ভাব", chip11th: "১১তম ভাব", housePresence: "ক্যারিয়ার-ভাবের গ্রহ" },
      finance:   { title: "ফাইন্যান্স",   chip2nd: "২য় ভাব",  chip11th: "১১তম ভাব",                       housePresence: "ধন-ভাবের গ্রহ" },
      health:    { title: "স্বাস্থ্য",     chipAsc: "লগ্ন",     chip6th: "৬ষ্ঠ ভাব",                        housePresence: "স্বাস্থ্য-ভাবের গ্রহ" },
      marriage:  { title: "বিবাহ",        chip7th: "৭ম ভাব",                                          housePresence: "বিবাহ-ভাবের গ্রহ" },
      education: { title: "শিক্ষা",       chip5th: "৫ম ভাব",                                          housePresence: "শিক্ষা-ভাবের গ্রহ" },
    },

    // ব্যাকএন্ড ফ্ল্যাট-কি এলিয়াস
    career:    { chip10th: "১০ম ভাব", chip6th: "৬ষ্ঠ ভাব", chip11th: "১১তম ভাব" },
    finance:   { chip2nd: "২য় ভাব",  chip11th: "১১তম ভাব" },
    health:    { chipAsc: "লগ্ন",     chip6th: "৬ষ্ঠ ভাব" },
    marriage:  { chip7th: "৭ম ভাব" },
    education: { chip5th: "৫ম ভাব" },

    // কেন্দ্রীভূত চিপ লেবেল
    chip: {
      house_presence: {
        career: "ক্যারিয়ার-ভাবের গ্রহ",
        finance: "ধন-ভাবের গ্রহ",
        health: "স্বাস্থ্য-ভাবের গ্রহ",
        marriage: "বিবাহ-ভাবের গ্রহ",
        education: "শিক্ষা-ভাবের গ্রহ",
      },
      benefic_harmony: "শুভ ত্রিকোণ/ষড়াষ্টক",
      aspect: {
        Conjunction: "সংযোগ (Conjunction)",
        Opposition: "বিপরীত (Opposition)",
        Trine: "ত্রিকোণ (Trine)",
        Square: "চতুষ্কোণ (Square)",
        Sextile: "ষড়াষ্টক (Sextile)",
      },
      aspectClass: { benefic: "শুভ প্রভাব" },
      house: "ভাব",

      // স্কিল চিপ
      skill: {
        mercury: "বুধের শক্তি",
        venus: "শুক্রের শক্তি",
        sun: "সূর্যের শক্তি",
        saturn: "শনির শক্তি",
        mars: "মঙ্গলের শক্তি",
        jupiter: "বৃহস্পতির শক্তি",
        rahu10or11: "রাহু ১০/১১-এ (সমর্থনসহ)",
        mercuryJupiterTrine: "বুধ–বৃহস্পতি ত্রিকোণ",
        mercurySaturnTrine: "বুধ–শনি ত্রিকোণ",
        mercuryVenusTrine: "বুধ–শুক্র ত্রিকোণ",
        mercuryMoonTrine: "বুধ–চন্দ্র ত্রিকোণ",
        venusMercuryTrine: "শুক্র–বুধ ত্রিকোণ",
        venusMoonTrine: "শুক্র–চন্দ্র ত্রিকোণ",
        venusJupiterTrine: "শুক্র–বৃহস্পতি ত্রিকোণ",
        sunMarsTrine: "সূর্য–মঙ্গল ত্রিকোণ",
        sunJupiterTrine: "সূর্য–বৃহস্পতি ত্রিকোণ",
        saturnMercuryTrine: "শনি–বুধ ত্রিকোণ",
      },
    },

    // স্কিল কার্ড টাইটেল (+ ফfallback এলিয়াস)
    skills: {
      Analytical: "বিশ্লেষণ ক্ষমতা",
      Communication: "যোগাযোগ",
      Leadership: "নেতৃত্ব",
      Creativity: "সৃজনশীলতা",
      Focus: "ফোকাস ও শৃঙ্খলা",
      Entrepreneurial: "উদ্যোক্তা ড্রাইভ",
      mercury: "বুধের শক্তি",
      venus: "শুক্রের শক্তি",
      sun: "সূর্যের শক্তি",
      saturn: "শনির শক্তি",
      mars: "মঙ্গলের শক্তি",
      jupiter: "বৃহস্পতির শক্তি",
      rahu10or11: "রাহু ১০/১১-এ (সমর্থনসহ)",
    },

    aspectClass: { benefic: "শুভ প্রভাব" },
  },

  // রুট-লেভেল এলিয়াস (পূর্বের কলগুলোর সাথে সামঞ্জস্য)
  chip: {
    house_presence: {
      career: "ক্যারিয়ার-ভাবের গ্রহ",
      finance: "ধন-ভাবের গ্রহ",
      health: "স্বাস্থ্য-ভাবের গ্রহ",
      marriage: "বিবাহ-ভাবের গ্রহ",
      education: "শিক্ষা-ভাবের গ্রহ",
    },
    benefic_harmony: "শুভ ত্রিকোণ/ষড়াষ্টক",
    aspect: {
      Conjunction: "সংযোগ (Conjunction)",
      Opposition: "বিপরীত (Opposition)",
      Trine: "ত্রিকোণ (Trine)",
      Square: "চতুষ্কোণ (Square)",
      Sextile: "ষড়াষ্টক (Sextile)",
    },
    aspectClass: { benefic: "শুভ প্রভাব" },
    skill: {
      mercury: "বুধের শক্তি",
      venus: "শুক্রের শক্তি",
      sun: "সূর্যের শক্তি",
      saturn: "শনির শক্তি",
      mars: "মঙ্গলের শক্তি",
      jupiter: "বৃহস্পতির শক্তি",
      rahu10or11: "রাহু ১০/১১-এ (সমর্থনসহ)",
      mercuryJupiterTrine: "বুধ–বৃহস্পতি ত্রিকোণ",
      mercurySaturnTrine: "বুধ–শনি ত্রিকোণ",
      mercuryVenusTrine: "বুধ–শুক্র ত্রিকোণ",
      mercuryMoonTrine: "বুধ–চন্দ্র ত্রিকোণ",
      venusMercuryTrine: "শুক্র–বুধ ত্রিকোণ",
      venusMoonTrine: "শুক্র–চন্দ্র ত্রিকোণ",
      venusJupiterTrine: "শুক্র–বৃহস্পতি ত্রিকোণ",
      sunMarsTrine: "সূর্য–মঙ্গল ত্রিকোণ",
      sunJupiterTrine: "সূর্য–বৃহস্পতি ত্রিকোণ",
      saturnMercuryTrine: "শনি–বুধ ত্রিকোণ",
    },
  },
} as const;

export default bnInsights;
