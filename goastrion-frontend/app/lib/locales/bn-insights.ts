// app/lib/locales/bn-insights.ts
const bnInsights = {
  insights: {
    copy: {
      line1_template: "এখন {domain} {phase} রয়েছে ({score}/100)।",
      phase_by_tier: {
        weak: "গঠনের পর্যায়ে",
        moderate: "রূপায়ণের পর্যায়ে",
        strong: "মজবুত গতিতে",
        excellent: "চূড়ান্ত পর্যায়ে",
        unknown: "বিকাশমান",
      },
      houses_intro: "{houseList} {themes} ওপর আলোকপাত করে।",
      housesWord: "ভাব",
      housesWordPlural: "ভাব",
      join: { and: "এবং", comma: ", " },
      planets_intro: "{planetList} নেতৃত্ব দিচ্ছে—{adviceList}–এ ফোকাস করুন।",
      planet_advice: {
        Sun: "দায়িত্বশীল নেতৃত্ব",
        Moon: "নিয়মিত স্ব-যত্ন",
        Mars: "কেন্দ্রিত পদক্ষেপ",
        Mercury: "পরিষ্কার যোগাযোগ",
        Jupiter: "শেখা ও মেন্টরশিপ",
        Venus: "সম্পর্ক গড়া",
        Saturn: "শৃঙ্খলিত অভ্যাস",
        Rahu: "মহৎ লক্ষ্য",
        Ketu: "নিঃশব্দ আত্মমনন",
      },
      aspects_intro: "উল্লেখযোগ্য দৃষ্টি: {items}",
      aspect_pair: "{p1}–{p2} ({tone} {name})",
      aspect_item: "{pair} — {hint}",
      aspect_tone: {
        Conjunction: "তীব্র",
        Opposition: "দ্বিমুখী",
        Trine: "সামঞ্জস্যপূর্ণ",
        Square: "চ্যালেঞ্জিং",
        Sextile: "সহায়ক",
      },
      aspect_hint_by_name: {
        Conjunction: "তীব্রতা বাড়ায়—গতি সামলে চলুন",
        Opposition: "দুই দিকে টানে—সমতা আনুন",
        Trine: "সহজ প্রবাহ—সুযোগ নিন",
        Square: "ঘর্ষণ আনতে পারে—ধাপে ধাপে এগোন",
        Sextile: "সহায়তা দেয়—ছোট পদক্ষেপে সক্রিয় করুন",
      },
    },

    housesOrdinal: {
      1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th",
      7: "7th", 8: "8th", 9: "9th", 10: "10th", 11: "11th", 12: "12th",
    },

    aspectTone: {
      Conjunction: "তীব্র",
      Opposition: "বিপরীত",
      Trine: "সামঞ্জস্যপূর্ণ",
      Square: "চ্যালেঞ্জিং",
      Sextile: "সহায়ক",
    },

    housesGloss: {
      1: "স্ব, প্রাণশক্তি",
      2: "সম্পদ, বাক্‌শক্তি",
      3: "সাহস, দক্ষতা",
      4: "ঘর, ভিত্তি",
      5: "সৃজনশীলতা, অধ্যয়ন",
      6: "কর্ম, স্বাস্থ্য",
      7: "সহযোগিতা/সঙ্গ",
      8: "গভীরতা, রূপান্তর",
      9: "ধর্ম, উচ্চ শিক্ষা",
      10: "কর্মজীবন, মর্যাদা",
      11: "লাভ, নেটওয়ার্ক",
      12: "নিবৃত্তি, ব্যয়",
    },

    planetsGloss: {
      Sun: "কর্তৃত্ব, প্রাণশক্তি",
      Moon: "মন, প্রবাহ",
      Mars: "উদ্যম, উদ্যোগ",
      Mercury: "বিশ্লেষণ, যোগাযোগ",
      Jupiter: "বৃদ্ধি, প্রজ্ঞা",
      Venus: "কলা, সুর",
      Saturn: "শৃঙ্খলা, কাঠামো",
      Rahu: "আকাঙ্ক্ষা, উত্থান",
      Ketu: "বিরাগ, অন্তর্দৃষ্টি",
    },

    pages: {
      domainsTitle: "লাইফ হুইল",
      domainsSubtitle: "স্কোর, হাইলাইট ও টাইমিং দেখতে একটি হুইল বেছে নিন।",
      skillsTitle: "দক্ষতার স্পটলাইট",
      skillsSubtitle: "আপনার চার্ট থেকে অনুমিত ভিত্তিমূলক সক্ষমতা।",
      highlightsTitle: "হাইলাইটস",
      highlightPlanets: "মূল গ্রহ",
      highlightHouses: "মূল ভাব",
      timeWindowsTitle: "টাইম উইন্ডোজ",
      noExactYet: "এখনও নির্দিষ্ট তারিখ নেই",
      highlightAspects: "মূল দৃষ্টি",
      chartTitle: "চার্ট",
    },

    ui: {
      clearHighlights: "হাইলাইটস মুছুন",
      highlightPlanetsBtn: "গ্রহ হাইলাইট করুন",
      highlightHousesBtn: "ভাবের গ্রহ হাইলাইট করুন",
      highlightAspectsBtn: "দৃষ্টি হাইলাইট করুন",
      notableAspects: "উল্লেখযোগ্য দৃষ্টি",
      keyHousesLabel: "মূল ভাব",
      keyPlanetsLabel: "মূল গ্রহ",
      highlightAll: "সব হাইলাইট করুন",
      house: "ভাব",
    },

    aspect: {
      Conjunction: "যুতি",
      Opposition: "বিপরীত",
      Trine: "ত্রিকোণ",
      Square: "চতুষ্কোণ",
      Sextile: "ষড়াষ্টক",
    },

    tiers: {
      weak: "দুর্বল",
      moderate: "মাঝারি",
      strong: "মজবুত",
      excellent: "অসাধারণ",
    },

    actions: { highlightAllDomain: "এই ডোমেইনের সব হাইলাইট করুন" },

    domains: {
      career:    { title: "কর্মজীবন", chip10th: "১০ম ভাব", chip6th: "৬ষ্ঠ ভাব", chip11th: "১১তম ভাব", housePresence: "কর্মজীবনের ভাবে গ্রহ" },
      finance:   { title: "অর্থ",      chip2nd: "২য় ভাব",  chip11th: "১১তম ভাব",                      housePresence: "ধনের ভাবগুলোতে গ্রহ" },
      health:    { title: "স্বাস্থ্য",   chipAsc: "লগ্ন",    chip6th: "৬ষ্ঠ ভাব",                       housePresence: "স্বাস্থ্য ভাবে গ্রহ" },
      marriage:  { title: "বিবাহ",      chip7th: "৭ম ভাব",                                         housePresence: "বিবাহ ভাবে গ্রহ" },
      education: { title: "শিক্ষা",     chip5th: "৫ম ভাব",                                          housePresence: "শিক্ষার ভাবগুলোতে গ্রহ" },
    },

    // Backend flat-key aliases
    career:    { chip10th: "১০ম ভাব", chip6th: "৬ষ্ঠ ভাব", chip11th: "১১তম ভাব" },
    finance:   { chip2nd: "২য় ভাব",   chip11th: "১১তম ভাব" },
    health:    { chipAsc: "লগ্ন",      chip6th: "৬ষ্ঠ ভাব" },
    marriage:  { chip7th: "৭ম ভাব" },
    education: { chip5th: "৫ম ভাব" },

    chip: {
      house_presence: {
        career: "কর্মজীবনের ভাবে গ্রহ",
        finance: "ধনের ভাবগুলোতে গ্রহ",
        health: "স্বাস্থ্য ভাবে গ্রহ",
        marriage: "বিবাহ ভাবে গ্রহ",
        education: "শিক্ষার ভাবগুলোতে গ্রহ",
      },
      benefic_harmony: "শুভ ত্রিকোণ/ষড়াষ্টক",
      aspect: { Conjunction: "যুতি", Opposition: "বিপরীত", Trine: "ত্রিকোণ", Square: "চতুষ্কোণ", Sextile: "ষড়াষ্টক" },
      aspectClass: { benefic: "শুভ প্রভাব" },
      house: "ভাব",

      // skills chips
      skill: {
        mercury: "বুধের শক্তি", venus: "শুক্রের শক্তি", sun: "সূর্যের শক্তি",
        saturn: "শনির শক্তি", mars: "মঙ্গলের শক্তি", jupiter: "বৃহস্পতির শক্তি",
        rahu10or11: "রাহু ১০/১১–এ (সহায়তাসহ)",
        mercuryJupiterTrine: "বুধ–বৃহস্পতি ত্রিকোণ", mercurySaturnTrine: "বুধ–শনি ত্রিকোণ",
        mercuryVenusTrine: "বুধ–শুক্র ত্রিকোণ", mercuryMoonTrine: "বুধ–চন্দ্র ত্রিকোণ",
        venusMercuryTrine: "শুক্র–বুধ ত্রিকোণ", venusMoonTrine: "শুক্র–চন্দ্র ত্রিকোণ",
        venusJupiterTrine: "শুক্র–বৃহস্পতি ত্রিকোণ", sunMarsTrine: "সূর্য–মঙ্গল ত্রিকোণ",
        sunJupiterTrine: "সূর্য–বৃহস্পতি ত্রিকোণ", saturnMercuryTrine: "শনি–বুধ ত্রিকোণ",
      },
    },

    skills: {
      Analytical: "বিশ্লেষণ ক্ষমতা",
      Communication: "যোগাযোগ",
      Leadership: "নেতৃত্ব",
      Creativity: "সৃজনশীলতা",
      Focus: "মনোযোগ ও শৃঙ্খলা",
      Entrepreneurial: "উদ্যোগী মানসিকতা",
      mercury: "বুধের শক্তি", venus: "শুক্রের শক্তি", sun: "সূর্যের শক্তি",
      saturn: "শনির শক্তি", mars: "মঙ্গলের শক্তি", jupiter: "বৃহস্পতির শক্তি",
      rahu10or11: "রাহু ১০/১১–এ (সহায়তাসহ)",
    },

    aspectClass: { benefic: "শুভ প্রভাব" },
  },

  // root-level chip aliases
  chip: {
    house_presence: {
      career: "কর্মজীবনের ভাবে গ্রহ",
      finance: "ধনের ভাবগুলোতে গ্রহ",
      health: "স্বাস্থ্য ভাবে গ্রহ",
      marriage: "বিবাহ ভাবে গ্রহ",
      education: "শিক্ষার ভাবগুলোতে গ্রহ",
    },
    benefic_harmony: "শুভ ত্রিকোণ/ষড়াষ্টক",
    aspect: { Conjunction: "যুতি", Opposition: "বিপরীত", Trine: "ত্রিকোণ", Square: "চতুষ্কোণ", Sextile: "ষড়াষ্টক" },
    aspectClass: { benefic: "শুভ প্রভাব" },
    skill: {
      mercury: "বুধের শক্তি", venus: "শুক্রের শক্তি", sun: "সূর্যের শক্তি",
      saturn: "শনির শক্তি", mars: "মঙ্গলের শক্তি", jupiter: "বৃহস্পতির শক্তি",
      rahu10or11: "রাহু ১০/১১–এ (সহায়তাসহ)",
      mercuryJupiterTrine: "বুধ–বৃহস্পতি ত্রিকোণ", mercurySaturnTrine: "বুধ–শনি ত্রিকোণ",
      mercuryVenusTrine: "বুধ–শুক্র ত্রিকোণ", mercuryMoonTrine: "বুধ–চন্দ্র ত্রিকোণ",
      venusMercuryTrine: "শুক্র–বুধ ত্রিকোণ", venusMoonTrine: "শুক্র–চন্দ্র ত্রিকোণ",
      venusJupiterTrine: "শুক্র–বৃহস্পতি ত্রিকোণ", sunMarsTrine: "সূর্য–মঙ্গল ত্রিকোণ",
      sunJupiterTrine: "সূর্য–বৃহস্পতি ত্রিকোণ", saturnMercuryTrine: "শনি–বুধ ত্রিকোণ",
    },
  },

  // ShubhDin (SD) — Bengali
  goalHelp: {
    job_change: "ইন্টারভিউ/অফার উইন্ডো লক্ষ্য করুন; রেজ়্যুমে ঝালিয়ে নিন ও কল শিডিউল করুন।",
    promotion: "বেতন/দায়িত্ব বাড়ানোর প্রস্তাব দিন; পারফর্ম্যান্স রিভিউ ভালো বসে।",
    business_start: "রেজিস্ট্রেশন, লঞ্চ বা প্রথম ক্লায়েন্ট সইয়ের সবুজ সংকেত।",
    business_expand: "নিয়োগ, নতুন শাখা, নতুন পণ্য বা সক্ষমতা বাড়ানোর উইন্ডো।",
    startup: "প্রোটোটাইপ, ইনভেস্টর পিচ বা ইনকিউবেটর/গ্রান্টে আবেদনের অনুকূল সময়।",
    property: "সাইট ভিজিট, বুকিং, ঋণ প্রক্রিয়া বা রেজিস্ট্রেশনের ভালো দিন।",
    marriage: "বাগদান, বিয়ের পরিকল্পনা ও পারিবারিক আলোচনার সহায়ক দিন।",
    new_relationship: "পরিচয়, ডেটিং ও কমিটমেন্ট কথোপকথনের উষ্ণ সুযোগ।",
  },

  sd: {
    title: "শুভদিন — স্মার্ট উইন্ডোজ",
    join: { comma: ", " },
    view: { label: "ভিউ", aria: "ভিউ মোড বাছুন", all: "সব লক্ষ্য", single: "একটি লক্ষ্য" },
    goal: { aria: "লক্ষ্য বাছুন" },
    goals: {
      job_change: "চাকরি পরিবর্তন",
      promotion: "পদোন্নতি",
      business_start: "ব্যবসা শুরু",
      business_expand: "ব্যবসা সম্প্রসারণ",
      startup: "স্টার্টআপ",
      property: "সম্পত্তি / বাড়ি",
      marriage: "বিবাহ",
      new_relationship: "নতুন সম্পর্ক",
    },
    prompt_fill_create: "দয়া করে আগে Create ট্যাব পূরণ করুন যাতে সেভড স্টেট থেকে lat/lon/tz পড়া যায়।",
    windows: { title: "সেরা সময়কাল" },
    topday: { title: "সেরা দিন" },
    why: { title: "কেন এই দিনগুলো?" },

    // merged caution object
    caution: {
      title: "সতর্কতা",
      days: "সতর্কতার দিন(গুলি)",
      rahukaal: "{start}-{end} (রাহুকাল) এড়িয়ে চলুন",
      watch_combust: "বুধ দগ্ধ (কম্বাস্ট) দিনে স্পষ্টতা বজায় রাখুন",
      skip_rahukaal_gulika: "রাহু/গুলিকা সময় এড়িয়ে চলুন",
      no_big_txn: "দয়া করে বড় চুক্তি/লেনদেন করবেন না: {dates}{more}.",
    },

    score: { label: "স্কোর {score}" },
    headline: {
      prefix: "সেরা সময়কাল: ",
      span: "{start} - {end} ({days}দিন)",
      best_windows: "{spans}",
    },

    aspect: { tag: "{p1} {name} -> {p2}" },
    dasha: { md: "MD:{lord}", ad: "AD:{lord}" },

    generated_at: "তৈরি হয়েছে: {ts} • TZ: {tz}",
    empty: { goal: "এই লক্ষ্যের জন্য উল্লেখযোগ্য সময়কাল নেই।" },

    explain: {
      career_houses: "ট্রানজিট + দশা কর্মক্ষেত্রের (১০/৬) ভাবকে সহায়তা করছে।",
      leverage_date: "{date}–এর আশপাশে মূল্যায়ন/আলোচনা এগিয়ে নিন।",
      jobchange_core: "বুধ + বৃহস্পতি অফার/ইন্টারভিউ অনুকূল করে; মঙ্গল গতি দেয় (সহায়ক MD/AD থাকলে)।",
      startup_green: "আপনার ন্যাটাল সূর্য/লগ্নে বৃহস্পতির ত্রিকোণ + সহায়ক দশা—সবুজ সংকেত।",
      incop_near: "শক্তিশালী চন্দ্র/নক্ষত্রের জন্য {date}–এর কাছে নিবন্ধন/ইনকর্প করুন।",
      property_core: "শুক্র + চন্দ্র শুভ; কাগজপত্রে শনি স্থিতি দেয় (যেখানে প্রযোজ্য সেখানে দশা-সহায়তা)।",
      marriage_core: "শুক্র/চন্দ্র শক্তিশালী; সপ্তম অধিপতির উপর শুভ দৃষ্টি (দশা-সমলয়)।",
      particularly_good: "{date} বিশেষ অনুকূল।",
      expand_core: "বৃহস্পতি (বৃদ্ধি) + বুধ (সেলস/অপস) সহায়ক; শুক্র গ্রাহক আকর্ষণ বাড়ায়।",
      use_spans_launches: "এই সময়গুলো লঞ্চ, পার্টনারশিপ ও নতুন লোকেশন খোলার জন্য ব্যবহার করুন (দশা-সমলয়)।",
      start_core_typed: "{type}: বৃহস্পতি (বিস্তার) + বুধ (অপস/আইনি) সহায়ক; শুক্র ব্র্যান্ড/UX–এ সাহায্য করে (দশা-সমলয়)।",
      incop_commence_near: "শক্তিশালী চন্দ্র/নক্ষত্র টোনের জন্য {date}–এর কাছাকাছি শুরু/ইনকর্প করুন।",
      relationship_core: "শুক্র/চন্দ্রের শুভ প্যাটার্ন সংযোগ ও উন্মুক্ততা বাড়ায় (দশা-সমলয়)।",
      use_spans_social: "প্রথম দেখা, ডেট ও সামাজিক অনুষ্ঠানের জন্য এই সময়গুলো ব্যবহার করুন।",
    },
  },
} as const;

export default bnInsights;
