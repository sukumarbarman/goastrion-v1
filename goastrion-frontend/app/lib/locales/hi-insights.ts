// app/lib/locales/hi-insights.ts
const hiInsights = {
  insights: {
    copy: {
      line1_template: "अभी {domain} {phase} है ({score}/100).",
      phase_by_tier: {
        weak: "निर्माण चरण में",           // a building phase
        moderate: "आकृति-निर्माण चरण में", // a shaping phase
        strong: "मजबूत गति में",           // strong momentum
        excellent: "चरम चरण में",          // a peak phase
        unknown: "विकसित हो रहा है",       // an evolving phase
      },
      houses_intro: "{houseList} {themes} पर प्रकाश डालते हैं।",
      housesWord: "भाव",
      housesWordPlural: "भाव",
      join: { and: "और", comma: ", " },
      planets_intro: "{planetList} आगे हैं—{adviceList} पर ध्यान दें।",
      planet_advice: {
        Sun: "जिम्मेदार नेतृत्व",
        Moon: "निरंतर स्व-देखभाल",
        Mars: "केंद्रित कार्रवाई",
        Mercury: "स्पष्ट संचार",
        Jupiter: "सीखना और मेंटरशिप",
        Venus: "रिश्ते बनाना",
        Saturn: "अनुशासित आदतें",
        Rahu: "महत्त्वाकांक्षी लक्ष्य",
        Ketu: "शांत आत्ममंथन",
      },
      aspects_intro: "उल्लेखनीय युति/दृष्टियाँ: {items}",
      aspect_pair: "{p1}–{p2} ({tone} {name})",
      aspect_item: "{pair} — {hint}",
      aspect_tone: {
        Conjunction: "तीव्र",
        Opposition: "दो ध्रुवों वाली",
        Trine: "सामंजस्यपूर्ण",
        Square: "चुनौतीपूर्ण",
        Sextile: "सहायक",
      },
      aspect_hint_by_name: {
        Conjunction: "तेज़ी लाती है—गति संतुलित रखें",
        Opposition: "दो दिशाओं में खींचती है—संतुलन रखें",
        Trine: "आसान प्रवाह—पूरा लाभ लें",
        Square: "घर्षण जोड़ती है—कदम दर कदम बढ़ें",
        Sextile: "समर्थन देती है—छोटे कदमों से सक्रिय करें",
      },
    },

    housesOrdinal: {
      1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th",
      7: "7th", 8: "8th", 9: "9th", 10: "10th", 11: "11th", 12: "12th",
    },

    // chip tone used by UI & copy
    aspectTone: {
      Conjunction: "तीव्र",
      Opposition: "विपरीत",
      Trine: "सामंजस्यपूर्ण",
      Square: "चुनौतीपूर्ण",
      Sextile: "सहायक",
    },

    housesGloss: {
      1: "स्व, ऊर्जा", 2: "धन, वाणी", 3: "साहस, कौशल", 4: "घर, आधार",
      5: "रचनात्मकता, अध्ययन", 6: "काम, स्वास्थ्य", 7: "भागीदारी",
      8: "गहराई, रूपांतरण", 9: "धर्म, उच्च शिक्षा",
      10: "करियर, प्रतिष्ठा", 11: "लाभ, नेटवर्क", 12: "विराम, व्यय",
    },

    planetsGloss: {
      Sun: "प्रभुत्व, जीवनशक्ति",
      Moon: "मन, प्रवाह",
      Mars: "उत्साह, पहल",
      Mercury: "विश्लेषण, संचार",
      Jupiter: "विकास, ज्ञान",
      Venus: "कला, सामंजस्य",
      Saturn: "अनुशासन, संरचना",
      Rahu: "महत्त्वाकांक्षा, उछाल",
      Ketu: "विरक्ति, अंतर्दृष्टि",
    },

    pages: {
      domainsTitle: "लाइफ़ व्हील",
      domainsSubtitle: "अपना स्कोर, मुख्य बिंदु, और समय-खिड़कियाँ देखने के लिए कोई व्हील चुनें।",
      skillsTitle: "कौशल स्पॉटलाइट",
      skillsSubtitle: "आपके चार्ट से अनुमानित बुनियादी क्षमताएँ।",
      highlightsTitle: "हाइलाइट्स",
      highlightPlanets: "मुख्य ग्रह",
      highlightHouses: "मुख्य भाव",
      timeWindowsTitle: "टाइम विंडोज़",
      noExactYet: "अभी सटीक तिथि नहीं",
      highlightAspects: "मुख्य दृष्टियाँ",
      chartTitle: "चार्ट",
    },

    ui: {
      clearHighlights: "हाइलाइट्स हटाएँ",
      highlightPlanetsBtn: "ग्रह हाइलाइट करें",
      highlightHousesBtn: "भावों के ग्रह हाइलाइट करें",
      highlightAspectsBtn: "दृष्टियाँ हाइलाइट करें",
      notableAspects: "उल्लेखनीय दृष्टियाँ",
      keyHousesLabel: "मुख्य भाव",
      keyPlanetsLabel: "मुख्य ग्रह",
      highlightAll: "सभी हाइलाइट करें",
      house: "भाव",
    },

    aspect: {
      Conjunction: "युति",
      Opposition: "विपरीत",
      Trine: "त्रिकोण",
      Square: "चतुष्कोण",
      Sextile: "षडाष्टक",
    },

    tiers: {
      weak: "कमज़ोर",
      moderate: "मध्यम",
      strong: "मज़बूत",
      excellent: "उत्कृष्ट",
    },

    actions: { highlightAllDomain: "इस डोमेन के सभी हाइलाइट करें" },

    // Domain cards + per-domain housePresence for insights-i18n fallback
    domains: {
      career:    { title: "करियर",    chip10th: "10वाँ भाव", chip6th: "6ठा भाव", chip11th: "11वाँ भाव", housePresence: "करियर भावों में ग्रह" },
      finance:   { title: "वित्त",     chip2nd: "2रा भाव",   chip11th: "11वाँ भाव",                       housePresence: "धन भावों में ग्रह" },
      health:    { title: "स्वास्थ्य",  chipAsc: "लग्न",      chip6th: "6ठा भाव",                          housePresence: "स्वास्थ्य भावों में ग्रह" },
      marriage:  { title: "विवाह",     chip7th: "7वाँ भाव",                                               housePresence: "विवाह भाव में ग्रह" },
      education: { title: "शिक्षा",     chip5th: "5वाँ भाव",                                               housePresence: "शिक्षा भावों में ग्रह" },
    },

    // Backend flat-key aliases
    career:    { chip10th: "10वाँ भाव", chip6th: "6ठा भाव", chip11th: "11वाँ भाव" },
    finance:   { chip2nd: "2रा भाव",    chip11th: "11वाँ भाव" },
    health:    { chipAsc: "लग्न",        chip6th: "6ठा भाव" },
    marriage:  { chip7th: "7वाँ भाव" },
    education: { chip5th: "5वाँ भाव" },

    // centralized chip labels
    chip: {
      house_presence: {
        career: "करियर भावों में ग्रह",
        finance: "धन भावों में ग्रह",
        health: "स्वास्थ्य भावों में ग्रह",
        marriage: "विवाह भाव में ग्रह",
        education: "शिक्षा भावों में ग्रह",
      },
      benefic_harmony: "शुभ त्रिकोण/षडाष्टक",
      aspect: {
        Conjunction: "युति", Opposition: "विपरीत", Trine: "त्रिकोण", Square: "चतुष्कोण", Sextile: "षडाष्टक",
      },
      aspectClass: { benefic: "शुभ प्रभाव" },
      house: "भाव",

      // skills chips
      skill: {
        mercury: "बुध मज़बूती", venus: "शुक्र मज़बूती", sun: "सूर्य मज़बूती",
        saturn: "शनि मज़बूती", mars: "मंगल मज़बूती", jupiter: "बृहस्पति मज़बूती",
        rahu10or11: "राहु 10/11 में (समर्थन के साथ)",
        mercuryJupiterTrine: "बुध–बृहस्पति त्रिकोण", mercurySaturnTrine: "बुध–शनि त्रिकोण",
        mercuryVenusTrine: "बुध–शुक्र त्रिकोण", mercuryMoonTrine: "बुध–चन्द्र त्रिकोण",
        venusMercuryTrine: "शुक्र–बुध त्रिकोण", venusMoonTrine: "शुक्र–चन्द्र त्रिकोण",
        venusJupiterTrine: "शुक्र–बृहस्पति त्रिकोण", sunMarsTrine: "सूर्य–मंगल त्रिकोण",
        sunJupiterTrine: "सूर्य–बृहस्पति त्रिकोण", saturnMercuryTrine: "शनि–बुध त्रिकोण",
      },
    },

    // skill card titles (+ alias so insights-i18n can map)
    skills: {
      Analytical: "विश्लेषण क्षमता",
      Communication: "संचार",
      Leadership: "नेतृत्व",
      Creativity: "रचनात्मकता",
      Focus: "फोकस व अनुशासन",
      Entrepreneurial: "उद्यमशीलता",
      mercury: "बुध मज़बूती", venus: "शुक्र मज़बूती", sun: "सूर्य मज़बूती",
      saturn: "शनि मज़बूती", mars: "मंगल मज़बूती", jupiter: "बृहस्पति मज़बूती",
      rahu10or11: "राहु 10/11 में (समर्थन के साथ)",
    },

    // for insights-i18n fallback
    aspectClass: { benefic: "शुभ प्रभाव" },
  },

  // root-level aliases so existing calls like t("chip.skill.mercury") still work
  chip: {
    house_presence: {
      career: "करियर भावों में ग्रह",
      finance: "धन भावों में ग्रह",
      health: "स्वास्थ्य भावों में ग्रह",
      marriage: "विवाह भाव में ग्रह",
      education: "शिक्षा भावों में ग्रह",
    },
    benefic_harmony: "शुभ त्रिकोण/षडाष्टक",
    aspect: { Conjunction: "युति", Opposition: "विपरीत", Trine: "त्रिकोण", Square: "चतुष्कोण", Sextile: "षडाष्टक" },
    aspectClass: { benefic: "शुभ प्रभाव" },
    skill: {
      mercury: "बुध मज़बूती", venus: "शुक्र मज़बूती", sun: "सूर्य मज़बूती",
      saturn: "शनि मज़बूती", mars: "मंगल मज़बूती", jupiter: "बृहस्पति मज़बूती",
      rahu10or11: "राहु 10/11 में (समर्थन के साथ)",
      mercuryJupiterTrine: "बुध–बृहस्पति त्रिकोण", mercurySaturnTrine: "बुध–शनि त्रिकोण",
      mercuryVenusTrine: "बुध–शुक्र त्रिकोण", mercuryMoonTrine: "बुध–चन्द्र त्रिकोण",
      venusMercuryTrine: "शुक्र–बुध त्रिकोण", venusMoonTrine: "शुक्र–चन्द्र त्रिकोण",
      venusJupiterTrine: "शुक्र–बृहस्पति त्रिकोण", sunMarsTrine: "सूर्य–मंगल त्रिकोण",
      sunJupiterTrine: "सूर्य–बृहस्पति त्रिकोण", saturnMercuryTrine: "शनि–बुध त्रिकोण",
    },
  },

  /**
   * ShubhDin (SD) — Hindi
   */
  goalHelp: {
    job_change: "इंटरव्यू/ऑफ़र की विंडोज़ साधें; रेज़्यूमे निखारें और कॉल शेड्यूल करें।",
    promotion: "वेतन/ज़िम्मेदारी बढ़ाने के प्रस्ताव रखें; परफ़ॉर्मेंस रिव्यू बेहतर बैठते हैं।",
    business_start: "रजिस्ट्रेशन, लॉन्च, या पहले क्लाइंट साइन करने के हरे संकेत।",
    business_expand: "हायरिंग, नई शाखा, नए प्रोडक्ट या क्षमता बढ़ाने की विंडोज़।",
    startup: "प्रोटोटाइप, निवेशकों को पिच, या इनक्यूबेटर/ग्रांट में आवेदन के अच्छे क्षण।",
    property: "साइट विज़िट, बुकिंग, लोन प्रोसेसिंग या रजिस्ट्रेशन के बेहतर दिन।",
    marriage: "सगाई, शादी की योजना और पारिवारिक चर्चा के सहायक दिन।",
    new_relationship: "मिलना-जुलना, डेटिंग और कमिटमेंट वार्ता के लिए गर्मजोशी भरे अवसर।",
  },

  sd: {
    title: "शुभदिन — स्मार्ट विंडोज़",
    join: { comma: ", " },
    view: { label: "व्यू", aria: "व्यू मोड चुनें", all: "सभी लक्ष्य", single: "एकल लक्ष्य" },
    goal: { aria: "लक्ष्य चुनें" },
    goals: {
      job_change: "नौकरी बदलना",
      promotion: "पदोन्नति",
      business_start: "व्यवसाय शुरू",
      business_expand: "व्यवसाय विस्तार",
      startup: "स्टार्टअप",
      property: "संपत्ति / घर",
      marriage: "विवाह",
      new_relationship: "नया संबंध",
    },
    prompt_fill_create: "कृपया पहले Create टैब भरें ताकि हम सेव्ड स्टेट से आपका lat/lon/tz पढ़ सकें।",
    windows: { title: "सर्वोत्तम विंडोज़" },
    topday: { title: "सर्वश्रेष्ठ दिन" },
    why: { title: "क्यों ये दिन?" },

    // ✅ single merged caution object
    caution: {
      title: "सावधानी",
      days: "सावधानी दिवस",
      rahukaal: "{start}-{end} (राहुकाल) से बचें",
      watch_combust: "बुध के दग्ध (कम्बस्ट) दिनों में स्पष्टता रखें",
      skip_rahukaal_gulika: "राहु/गुलिका के समय से बचें",
      no_big_txn: "कृपया बड़े सौदे/लेनदेन न करें: {dates}{more}.",
    },

    score: { label: "स्कोर {score}" },
    headline: {
      prefix: "सर्वोत्तम विंडोज़: ",
      span: "{start} - {end} ({days}द)",
      best_windows: "{spans}",
    },

    aspect: { tag: "{p1} {name} -> {p2}" },
    dasha: { md: "MD:{lord}", ad: "AD:{lord}" },

    generated_at: "उत्पन्न: {ts} • TZ: {tz}",
    empty: { goal: "इस लक्ष्य के लिए कोई उल्लेखनीय विंडो नहीं।" },

    explain: {
      career_houses: "ट्रांजिट + दशा 10वें/6ठे भाव (करियर) को सपोर्ट कर रहे हैं।",
      leverage_date: "{date} के आसपास आकलन/बातचीत को आगे बढ़ाएँ।",
      jobchange_core: "बुध + बृहस्पति ऑफ़र/इंटरव्यू को अनुकूल बनाते हैं; मंगल गति देता है (समर्थक MD/AD के साथ)।",
      startup_green: "आपके नैटल सूर्य/लग्न पर बृहस्पति का त्रिकोण + समर्थक दशा—ग्रीन सिग्नल।",
      incop_near: "{date} के आसपास पंजीकरण/इन्कॉर्प करें (मज़बूत चन्द्र/नक्षत्र)।",
      property_core: "शुक्र + चन्द्र शुभ; कागज़ी कार्य में शनि स्थिरता देता है (जहाँ लागू हो वहाँ दशा-सहयोग)।",
      marriage_core: "शुक्र/चन्द्र मज़बूत; 7वें स्वामी पर शुभ दृष्टि (दशा-संरेखित)।",
      particularly_good: "{date} विशेष रूप से अच्छा है।",
      expand_core: "बृहस्पति (विकास) + बुध (सेल्स/ऑप्स) सहायक; शुक्र ग्राहक अपील बढ़ाता है।",
      use_spans_launches: "इन विंडोज़ का उपयोग लॉन्च, साझेदारी और नई लोकेशन खोलने के लिए करें (दशा-संरेखित)।",
      start_core_typed: "{type}: बृहस्पति (विस्तार) + बुध (ऑप्स/क़ानूनी) सहायक; शुक्र ब्रांड/यूएक्स में मदद करता है (दशा-संरेखित)।",
      incop_commence_near: "मज़बूत चन्द्र/नक्षत्र टोन के लिए {date} के आसपास आरंभ/इन्कॉर्प करें।",
      relationship_core: "शुक्र/चन्द्र के शुभ पैटर्न जुड़ाव और openness बढ़ाते हैं (दशा-संरेखित)।",
      use_spans_social: "पहली मुलाकात, डेट्स और सामाजिक आयोजनों के लिए इन विंडोज़ का प्रयोग करें।",
    },
  },
} as const;

export default hiInsights;
