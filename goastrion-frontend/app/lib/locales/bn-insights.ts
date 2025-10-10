// app/lib/locales/bn-insights.ts
const bnInsights = {
  insights: {
    copy: {
      line1_template: "এই মুহূর্তে {domain} রয়েছে {phase} পর্যায়ে ({score}/100)।",
      phase_by_tier: {
        weak: "গঠনের প্রাথমিক ধাপে",
        moderate: "আকৃতি নিচ্ছে",
        strong: "মজবুত গতি",
        excellent: "শীর্ষ পর্যায়",
        unknown: "পরিবর্তনশীল পর্যায়",
      },
      houses_intro: "{houseList} ঘরসমূহে আলোকপাত পড়ছে—{themes}।",
      housesWord: "ঘর",
      housesWordPlural: "ঘরসমূহ",
      join: { and: "ও", comma: ", " },
      planets_intro: "{planetList} প্রাধান্য দিচ্ছে—মনোযোগ দিন {adviceList}-এ।",
      planet_advice: {
        Sun: "দায়িত্বশীল নেতৃত্বে",
        Moon: "নিয়মিত দেখভালে",
        Mars: "কেন্দ্রীভূত পদক্ষেপে",
        Mercury: "পরিষ্কার যোগাযোগে",
        Jupiter: "শেখা ও মেন্টরশিপে",
        Venus: "সম্পর্ক ও সমন্বয়ে",
        Saturn: "শৃঙ্খলা ও অভ্যাসে",
        Rahu: "উচ্চাকাঙ্ক্ষী টার্গেটে",
        Ketu: "নির্জন চিন্তন ও পরিশোধনে",
      },
      aspects_intro: "উল্লেখযোগ্য অ্যাসপেক্ট: {items}।",
      aspect_pair: "{p1}–{p2} ({tone} {name})",
      aspect_item: "{pair} — {hint}",
      aspect_tone: {
        Conjunction: "তীব্র",
        Opposition: "দ্বিমুখী",
        Trine: "সুসংগত",
        Square: "চ্যালেঞ্জিং",
        Sextile: "সহায়ক",
      },
      aspect_hint_by_name: {
        Conjunction: "তীব্রতা আনে—গতি সামলে চলুন",
        Opposition: "দুই দিকে টানে—সমতা রাখুন",
        Trine: "সহজে প্রবাহিত—ভরসা করুন",
        Square: "ঘষা-মাজা লাগবে—ধাপে ধাপে এগোন",
        Sextile: "সহায়তা মেলে—ছোট পদক্ষেপ নিন",
      },
    },

    housesOrdinal: {
      1: "১ম",
      2: "২য়",
      3: "৩য়",
      4: "৪র্থ",
      5: "৫ম",
      6: "৬ষ্ঠ",
      7: "৭ম",
      8: "৮ম",
      9: "৯ম",
      10: "১০ম",
      11: "১১তম",
      12: "১২তম",
    },

    aspectTone: {
      Conjunction: "তীব্র",
      Opposition: "দ্বিমুখী",
      Trine: "সুসংগত",
      Square: "চ্যালেঞ্জিং",
      Sextile: "সহায়ক",
    },

    housesGloss: {
      1: "স্ব, প্রাণশক্তি",
      2: "ধন, বাক্‌শক্তি",
      3: "সাহস, দক্ষতা",
      4: "বাসস্থান, ভিত্তি",
      5: "সৃজন, শিক্ষা",
      6: "কর্ম, স্বাস্থ্য",
      7: "সম্পর্ক, দাম্পত্য",
      8: "গভীরতা, রূপান্তর",
      9: "ধর্ম, উচ্চশিক্ষা",
      10: "পেশা, মর্যাদা",
      11: "লাভ, নেটওয়ার্ক",
      12: "বিরতি, ব্যয়",
    },

    planetsGloss: {
      Sun: "কর্তৃত্ব, প্রাণশক্তি",
      Moon: "মন, প্রবাহ",
      Mars: "উদ্যম, উদ্যোগ",
      Mercury: "বিশ্লেষণ, যোগাযোগ",
      Jupiter: "বৃদ্ধি, প্রজ্ঞা",
      Venus: "রুচি, সমন্বয়",
      Saturn: "শৃঙ্খলা, কাঠামো",
      Rahu: "আকাঙ্ক্ষা, বিস্তার",
      Ketu: "বিচ্ছেদ, অন্তর্দৃষ্টি",
    },

    pages: {
      domainsTitle: "লাইফ হুইল",
      domainsSubtitle: "আপনার স্কোর, হাইলাইট ও টাইমিং দেখতে একটি লাইফ হুইল বেছে নিন।",
      skillsTitle: "দক্ষতার আলোকপাত",
      skillsSubtitle: "আপনার কুণ্ডলী থেকে অনুমিত ভিত্তিগত সক্ষমতা।",
      highlightsTitle: "হাইলাইটস",
      highlightPlanets: "মূল গ্রহসমূহ",
      highlightHouses: "মূল ঘরসমূহ",
      timeWindowsTitle: "সময়ের জানালা",
      noExactYet: "এখনো নির্দিষ্ট তারিখ নেই",
      highlightAspects: "মূল অ্যাসপেক্ট",
      chartTitle: "চার্ট",
    },

    ui: {
      clearHighlights: "হাইলাইট মুছুন",
      highlightPlanetsBtn: "গ্রহ হাইলাইট করুন",
      highlightHousesBtn: "ঘরের গ্রহ হাইলাইট",
      highlightAspectsBtn: "অ্যাসপেক্ট হাইলাইট",
      notableAspects: "উল্লেখযোগ্য অ্যাসপেক্ট",
      keyHousesLabel: "মূল ঘর",
      keyPlanetsLabel: "মূল গ্রহ",
      highlightAll: "সব হাইলাইট করুন",
      house: "ঘর",
    },

    aspect: {
      Conjunction: "কনজাংশন",
      Opposition: "অপোজিশন",
      Trine: "ট্রাইন",
      Square: "স্কোয়ার",
      Sextile: "সেক্সটাইল",
    },

    tiers: {
      weak: "দুর্বল",
      moderate: "মাঝারি",
      strong: "মজবুত",
      excellent: "অসাধারণ",
    },

    actions: { highlightAllDomain: "এই ডোমেইনের সব হাইলাইট করুন" },

    domains: {
      career: {
        title: "ক্যারিয়ার",
        chip10th: "১০ম ঘর",
        chip6th: "৬ষ্ঠ ঘর",
        chip11th: "১১তম ঘর",
        housePresence: "ক্যারিয়ার ঘরে গ্রহস্থিতি",
      },
      finance: {
        title: "অর্থ",
        chip2nd: "২য় ঘর",
        chip11th: "১১তম ঘর",
        housePresence: "সম্পদ ঘরে গ্রহস্থিতি",
      },
      health: {
        title: "স্বাস্থ্য",
        chipAsc: "লগ্ন",
        chip6th: "৬ষ্ঠ ঘর",
        housePresence: "স্বাস্থ্য ঘরে গ্রহস্থিতি",
      },
      marriage: {
        title: "বিবাহ",
        chip7th: "৭ম ঘর",
        housePresence: "বিবাহ ঘরে গ্রহস্থিতি",
      },
      education: {
        title: "শিক্ষা",
        chip5th: "৫ম ঘর",
        housePresence: "শিক্ষা ঘরে গ্রহস্থিতি",
      },
    },

    career: { chip10th: "১০ম ঘর", chip6th: "৬ষ্ঠ ঘর", chip11th: "১১তম ঘর" },
    finance: { chip2nd: "২য় ঘর", chip11th: "১১তম ঘর" },
    health: { chipAsc: "লগ্ন", chip6th: "৬ষ্ঠ ঘর" },
    marriage: { chip7th: "৭ম ঘর" },
    education: { chip5th: "৫ম ঘর" },

    chip: {
      house_presence: {
        career: "ক্যারিয়ার ঘরে গ্রহস্থিতি",
        finance: "সম্পদ ঘরে গ্রহস্থিতি",
        health: "স্বাস্থ্য ঘরে গ্রহস্থিতি",
        marriage: "বিবাহ ঘরে গ্রহস্থিতি",
        education: "শিক্ষা ঘরে গ্রহস্থিতি",
      },
      benefic_harmony: "শুভ ট্রাইন/সেক্সটাইল",
      aspect: {
        Conjunction: "কনজাংশন",
        Opposition: "অপোজিশন",
        Trine: "ট্রাইন",
        Square: "স্কোয়ার",
        Sextile: "সেক্সটাইল",
      },
      aspectClass: { benefic: "শুভ প্রভাব" },
      house: "ঘর",

      skill: {
        mercury: "বুধ শক্তি",
        venus: "শুক্র শক্তি",
        sun: "সূর্য শক্তি",
        saturn: "শনির শৃঙ্খলা",
        mars: "মঙ্গল শক্তি",
        jupiter: "বৃহস্পতি শক্তি",
        rahu10or11: "রাহু ১০ম/১১তম (সহযোগে)",
        mercuryJupiterTrine: "বুধ–বৃহস্পতি ট্রাইন",
        mercurySaturnTrine: "বুধ–শনি ট্রাইন",
        mercuryVenusTrine: "বুধ–শুক্র ট্রাইন",
        mercuryMoonTrine: "বুধ–চন্দ্র ট্রাইন",
        venusMercuryTrine: "শুক্র–বুধ ট্রাইন",
        venusMoonTrine: "শুক্র–চন্দ্র ট্রাইন",
        venusJupiterTrine: "শুক্র–বৃহস্পতি ট্রাইন",
        sunMarsTrine: "সূর্য–মঙ্গল ট্রাইন",
        sunJupiterTrine: "সূর্য–বৃহস্পতি ট্রাইন",
        saturnMercuryTrine: "শনি–বুধ ট্রাইন",
      },
    },

    skills: {
      Analytical: "বিশ্লেষণী দক্ষতা",
      Communication: "যোগাযোগ",
      Leadership: "নেতৃত্ব",
      Creativity: "সৃজনশীলতা",
      Focus: "মনোযোগ ও শৃঙ্খলা",
      Entrepreneurial: "উদ্যোক্তা মনোভাব",
      mercury: "বুধ শক্তি",
      venus: "শুক্র শক্তি",
      sun: "সূর্য শক্তি",
      saturn: "শনির শৃঙ্খলা",
      mars: "মঙ্গল শক্তি",
      jupiter: "বৃহস্পতি শক্তি",
      rahu10or11: "রাহু ১০ম/১১তম (সহযোগে)",
    },

    aspectClass: { benefic: "শুভ প্রভাব" },
  },

  // root aliases so t("chip.*") keeps working
  chip: {
    house_presence: {
      career: "ক্যারিয়ার ঘরে গ্রহস্থিতি",
      finance: "সম্পদ ঘরে গ্রহস্থিতি",
      health: "স্বাস্থ্য ঘরে গ্রহস্থিতি",
      marriage: "বিবাহ ঘরে গ্রহস্থিতি",
      education: "শিক্ষা ঘরে গ্রহস্থিতি",
    },
    benefic_harmony: "শুভ ট্রাইন/সেক্সটাইল",
    aspect: {
      Conjunction: "কনজাংশন",
      Opposition: "অপোজিশন",
      Trine: "ট্রাইন",
      Square: "স্কোয়ার",
      Sextile: "সেক্সটাইল",
    },
    aspectClass: { benefic: "শুভ প্রভাব" },
    skill: {
      mercury: "বুধ শক্তি",
      venus: "শুক্র শক্তি",
      sun: "সূর্য শক্তি",
      saturn: "শনির শৃঙ্খলা",
      mars: "মঙ্গল শক্তি",
      jupiter: "বৃহস্পতি শক্তি",
      rahu10or11: "রাহু ১০ম/১১তম (সহযোগে)",
      mercuryJupiterTrine: "বুধ–বৃহস্পতি ট্রাইন",
      mercurySaturnTrine: "বুধ–শনি ট্রাইন",
      mercuryVenusTrine: "বুধ–শুক্র ট্রাইন",
      mercuryMoonTrine: "বুধ–চন্দ্র ট্রাইন",
      venusMercuryTrine: "শুক্র–বুধ ট্রাইন",
      venusMoonTrine: "শুক্র–চন্দ্র ট্রাইন",
      venusJupiterTrine: "শুক্র–বৃহস্পতি ট্রাইন",
      sunMarsTrine: "সূর্য–মঙ্গল ট্রাইন",
      sunJupiterTrine: "সূর্য–বৃহস্পতি ট্রাইন",
      saturnMercuryTrine: "শনি–বুধ ট্রাইন",
    },
  },

  // ----- ShubhDin (SD)
  sd: {
    title: "শুভদিন — স্মার্ট উইন্ডোজ",
    join: { comma: ", " },
    view: { label: "ভিউ", aria: "ভিউ মোড নির্বাচন করুন", all: "সব লক্ষ্য", single: "একটি লক্ষ্য" },
    goal: { aria: "লক্ষ্য নির্বাচন করুন" },
    goals: {
      job_change: "চাকরি বদল",
      promotion: "প্রমোশন",
      business_start: "ব্যবসা শুরু",
      business_expand: "ব্যবসা বৃদ্ধি",
      startup: "স্টার্টআপ",
      property: "সম্পত্তি / বাসা",
      marriage: "বিবাহ",
      new_relationship: "নতুন সম্পর্ক",
    },
    prompt_fill_create:
      "দয়া করে আগে Create ট্যাবে তথ্য দিন—সংরক্ষিত অবস্থা থেকে আমরা আপনার lat/lon/tz পড়ব।",
    windows: { title: "সেরা উইন্ডো" },
    topday: { title: "শ্রেষ্ঠ দিন" },
    why: { title: "কেন এই দিনগুলো?" },

    // merged caution
    caution: {
      title: "সতর্কতা",
      days: "সতর্কতার দিন(গুলি)",
      rahukaal: "এড়িয়ে চলুন {start}-{end} (রাহুকাল)",
      watch_combust: "বুধ দগ্ধ (কম্বাস্ট) দিনে স্পষ্টতা বজায় রাখুন",
      skip_rahukaal_gulika: "রাহু/গুলিকা সময় এড়িয়ে চলুন",
      no_big_txn:
        "অনুগ্রহ করে বড় কোনো চুক্তি বা লেনদেন করবেন না: {dates}{more}.",
    },

    score: { label: "স্কোর {score}" },
    headline: {
      prefix: "সেরা উইন্ডো: ",
      span: "{start} - {end} ({days} দিন)",
      best_windows: "{spans}",
    },

    aspect: { tag: "{p1} {name} -> {p2}" },

    generated_at: "উৎপন্ন {dt} • TZ: {tz}",
    empty: { goal: "এই লক্ষ্যটির জন্য বিশেষ কোনো উইন্ডো নেই।" },

    explain: {
      career_houses: "ট্রানজিট + দশা ১০ম/৬ষ্ঠ ঘরকে সহায়তা করছে।",
      leverage_date: "{date} এর কাছাকাছি রিভিউ/কথাবার্তা কাজে লাগান।",
      jobchange_core:
        "বুধ + বৃহস্পতি অফার/ইন্টারভিউ সহায়ক; মঙ্গল গতি দেয় (সহায়ক এমডি/এডি হলে)।",
      startup_green:
        "জুপিটার ট্রাইন (সূর্য/লগ্ন) + সহায়ক দশা—সবুজ সংকেত।",
      incop_near: "{date} এর কাছাকাছি নিবন্ধন/শুরু করুন (শক্তিশালী চন্দ্র/নক্ষত্র)।",
      property_core:
        "শুক্র + চন্দ্র শুভ; কাগজপত্রে শনি স্থিরতা দেয় (দশা-সহায়ক হলে)।",
      marriage_core:
        "শুক্র/চন্দ্র শক্তিশালী; ৭ম অধিপতির উপর শুভ দৃষ্টি (দশা-সামঞ্জস্যপূর্ণ)।",
      particularly_good: "{date} বিশেষভাবে অনুকূল।",
      expand_core:
        "বৃহস্পতি (বৃদ্ধি) + বুধ (বিক্রি/অপারেশন) সহায়ক; শুক্র গ্রাহক-আকর্ষণ বাড়ায়।",
      use_spans_launches:
        "লঞ্চ, পার্টনারশিপ, নতুন শাখা—এই স্প্যান কাজে লাগান (দশা-সামঞ্জস্যপূর্ণ)।",
      start_core_typed:
        "{type}: বৃহস্পতি (বিস্তার) + বুধ (অপারেশন/আইন) সহায়ক; ব্র্যান্ড/ইউএক্সে শুক্র সহায়।",
      incop_commence_near:
        "{date} এর কাছাকাছি ইনকর্পোরেট/কমেন্স করুন—শক্তিশালী চন্দ্র/নক্ষত্র টোনে।",
      relationship_core:
        "শুক্র/চন্দ্রের শুভ প্যাটার্ন—যোগাযোগ ও সংযোগে খোলা মন (দশা-সামঞ্জস্যপূর্ণ)।",
      use_spans_social:
        "প্রথম দেখা, ডেট, সামাজিক আয়োজন—এই স্প্যান ব্যবহার করুন।",
    },

    dasha: {
      sectionTitle: "বিমশোত্তরী — টাইমলাইন",
      titleFullTimeline: "বিমশোত্তরী মহাদশা — পূর্ণ টাইমলাইন",
      colLord: "অধিপতি",
      colStart: "শুরু",
      colEnd: "শেষ",
      colDuration: "অবধি",
      colADLord: "অন্তর্দশা অধিপতি",
      noAntardasha: "অন্তর্দশার তথ্য নেই",
      prevADTitle: "পূর্ববর্তী AD",
      curADTitle: "বর্তমান AD",
      nextADTitle: "পরবর্তী AD",
      mdLabel: "MD",
      adLabel: "AD",
      noCurrentAD: "বর্তমান AD পাওয়া যায়নি",
      nextADShort: "পরবর্তী AD",

      // Narrative summaries
      summary: {
        currentTitle: "বর্তমান AD — {lord}",
        nextTitle: "পরবর্তী AD — {lord}",
        meta: "{start} → {end} ({duration})",
        mdChip: "MD: {lord}",
        adChip: "AD: {lord}",
        lead: "{lord} AD, {md} MD-এর অধীনে।",
        themesLabel: "থিম",
        adviceLabel: "পরামর্শ",
        join: { comma: ", " },
        planet: {
          Sun: {
            themes: "দৃশ্যমানতা, নেতৃত্ব, কর্তৃত্ব",
            advice: "দায়িত্ব নিন; আত্মবিশ্বাসে উপস্থিত হন",
          },
          Moon: {
            themes: "যত্ন, রুটিন, সুষমতা",
            advice: "বিশ্রামকে অগ্রাধিকার দিন; ছন্দ রাখুন",
          },
          Mars: {
            themes: "উদ্যম, উদ্যোগ, সাহস",
            advice: "শক্তিকে লক্ষ্যভিত্তিক কাজে দিন",
          },
          Mercury: {
            themes: "পড়া-লেখা, নথি, আলোচনাসভা",
            advice: "বিবরণ পরিষ্কার করুন; সিদ্ধান্ত লিখিত রাখুন",
          },
          Jupiter: {
            themes: "বৃদ্ধি, শিক্ষা, দিকনির্দেশ",
            advice: "শিখুন, মেন্টর করুন, বিবেচনায় প্রসার করুন",
          },
          Venus: {
            themes: "সম্পর্ক, সুর, নান্দনিকতা",
            advice: "সম্পর্কে বিনিয়োগ করুন; সুনাম গড়ুন",
          },
          Saturn: {
            themes: "কাঠামো, কর্তব্য, অধ্যবসায়",
            advice: "নিয়মিত উপস্থিত থাকুন; অভ্যাস গড়ুন",
          },
          Rahu: {
            themes: "উদ্যমী উচ্চাকাঙ্ক্ষা, আউটরিচ, ব্যতিক্রম",
            advice: "উঁচু লক্ষ্য ধরুন; ঝুঁকি ও ইমেজ সামলান",
          },
          Ketu: {
            themes: "কেন্দ্রীভবন, বিচ্ছেদ, অন্তর্দৃষ্টি",
            advice: "সরল করুন; মনের ভেতর দেখুন ও পরিশোধন করুন",
          },
        },

        // domain guidance (Good for / Go-slow)
        domains: {
          goodForLabel: "ভালো সময়",
          goSlowLabel: "ধীরে চলুন",
          byLord: {
            Sun: {
              good: ["ক্যারিয়ার", "নেতৃত্ব", "জনসম্মুখ"],
              slow: ["অপত্যাশিত দ্বন্দ্ব"],
            },
            Moon: {
              good: ["সম্পর্ক", "পরিবার", "সামাজিকতা"],
              slow: ["কঠোর পরিশ্রমের রুটিন"],
            },
            Mars: {
              good: ["প্রোজেক্ট শুরু", "ফিটনেস", "দ্রুত সিদ্ধান্ত"],
              slow: ["ঝোঁকের লড়াই"],
            },
            Mercury: {
              good: ["ইন্টারভিউ", "চুক্তি", "অফিস কাজ"],
              slow: ["অতিরিক্ত বিশ্লেষণ"],
            },
            Jupiter: {
              good: ["শিক্ষা", "ব্যবসা", "মেন্টরশিপ"],
              slow: ["অতিরিক্ত আশাবাদ"],
            },
            Venus: {
              good: ["সম্পর্ক", "ব্র্যান্ডিং", "গ্রাহকসেবা"],
              slow: ["ব্যয়"],
            },
            Saturn: {
              good: ["দীর্ঘমেয়াদি কাজ", "অভ্যাস", "কাঠামো"],
              slow: ["তাৎক্ষণিক ফলের আশা"],
            },
            Rahu: {
              good: ["ক্যারিয়ার", "ব্যবসা", "আউটরিচ"],
              slow: ["স্থিতিশীল রুটিন"],
            },
            Ketu: {
              good: ["গবেষণা", "ধ্যান", "পরিশোধন"],
              slow: ["পাবলিক রোল"],
            },
          },
        },
      },
    },
  },
};

export default bnInsights;
