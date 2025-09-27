// app/lib/locales/hi-insights.ts
// इनसाइट्स / लाइफ़-व्हील
const hiInsights = {
  insights: {
    copy: {
      line1_template: "अभी {domain} {phase} में है ({score}/100)।",
      phase_by_tier: {
        weak: "निर्माण चरण",           // a building phase
        moderate: "शेपिंग चरण",        // a shaping phase
        strong: "मज़बूत गति",          // strong momentum
        excellent: "शिखर चरण",         // a peak phase
        unknown: "विकसित होता चरण",    // an evolving phase
      },
      houses_intro: "{houseList} {themes} पर रोशनी डालते हैं।",
      housesWord: "भाव",
      housesWordPlural: "भाव",
      join: { and: "और", comma: ", " },
      planets_intro: "{planetList} अग्रणी होने पर, ध्यान दें: {adviceList}।",
      planet_advice: {
        Sun: "जिम्मेदार नेतृत्व",
        Moon: "स्थिर आत्म-देखभाल",
        Mars: "केंद्रित कार्रवाई",
        Mercury: "स्पष्ट संचार",
        Jupiter: "सीखना और मेंटरशिप",
        Venus: "रिश्ते-निर्माण",
        Saturn: "अनुशासित आदतें",
        Rahu: "महत्त्वाकांक्षी लक्ष्य",
        Ketu: "शांत आत्मचिंतन",
      },
      aspects_intro: "उल्लेखनीय योग/दृष्टियाँ: {items}।",
      aspect_pair: "{p1}–{p2} ({tone} {name})",
      aspect_item: "{pair} — {hint}",
      aspect_tone: {
        Conjunction: "तीव्र",
        Opposition: "दो ध्रुवों वाला",
        Trine: "सामंजस्यपूर्ण",
        Square: "चुनौतीपूर्ण",
        Sextile: "समर्थनकारी",
      },
      aspect_hint_by_name: {
        Conjunction: "तीव्रता लाता है—गति नियंत्रित रखें",
        Opposition: "दो दिशाओं में खींचता है—दोनों पक्षों का संतुलन रखें",
        Trine: "आसानी से बहता है—इसे अपनाएँ",
        Square: "घर्षण जोड़ता है—कदम-दर-कदम बढ़ें",
        Sextile: "सहारा देता है—छोटे कदमों से सक्रिय करें",
      },
    },

    housesOrdinal: {
      1: "1वाँ", 2: "2रा", 3: "3रा", 4: "4था", 5: "5वाँ", 6: "6ठा",
      7: "7वाँ", 8: "8वाँ", 9: "9वाँ", 10: "10वाँ", 11: "11वाँ", 12: "12वाँ",
    },

    // चिप टोन (UI व कॉपी)
    aspectTone: {
      Conjunction: "तीव्र",
      Opposition: "दो ध्रुवों वाला",
      Trine: "सामंजस्यपूर्ण",
      Square: "चुनौतीपूर्ण",
      Sextile: "समर्थनकारी",
    },

    housesGloss: {
      1: "स्व, जीवनशक्ति",
      2: "धन, वाणी",
      3: "साहस, कौशल",
      4: "घर, नींव",
      5: "रचनात्मकता, अध्ययन",
      6: "कार्य, स्वास्थ्य",
      7: "साझेदारी",
      8: "गहराई, रूपांतरण",
      9: "धर्म, उच्च अध्ययन",
      10: "करियर, प्रतिष्ठा",
      11: "लाभ, नेटवर्क",
      12: "निवृत्ति, व्यय",
    },

    planetsGloss: {
      Sun: "अधिकार, जीवनशक्ति",
      Moon: "मन, प्रवाह",
      Mars: "जोश, पहल",
      Mercury: "विश्लेषण, संचार",
      Jupiter: "विकास, ज्ञान",
      Venus: "कला, सद्भाव",
      Saturn: "अनुशासन, संरचना",
      Rahu: "महत्त्वाकांक्षा, उछाल",
      Ketu: "वैराग्य, अन्तर्दृष्टि",
    },

    pages: {
      domainsTitle: "लाइफ़ व्हील",
      domainsSubtitle: "अपना स्कोर, हाइलाइट्स और टाइमिंग देखने के लिए एक लाइफ़-व्हील चुनें।",
      skillsTitle: "कौशल स्पॉटलाइट",
      skillsSubtitle: "आपकी कुंडली से निष्कर्षित बुनियादी क्षमताएँ।",
      highlightsTitle: "हाइलाइट्स",
      highlightPlanets: "मुख्य ग्रह",
      highlightHouses: "मुख्य भाव",
      timeWindowsTitle: "समय-खिड़कियाँ",
      noExactYet: "अभी सटीक तिथि नहीं",
      highlightAspects: "मुख्य योग/दृष्टियाँ",
      chartTitle: "कुंडली",
    },

    ui: {
      clearHighlights: "हाइलाइट्स हटाएँ",
      highlightPlanetsBtn: "ग्रह हाइलाइट करें",
      highlightHousesBtn: "भावों के ग्रह हाइलाइट करें",
      highlightAspectsBtn: "योग/दृष्टियाँ हाइलाइट करें",
      notableAspects: "उल्लेखनीय योग/दृष्टियाँ",
      keyHousesLabel: "मुख्य भाव",
      keyPlanetsLabel: "मुख्य ग्रह",
      highlightAll: "सब हाइलाइट करें",
      house: "भाव",
    },

    // योग/दृष्टि सूची के लेबल
    aspect: {
      Conjunction: "संयोग (Conjunction)",
      Opposition: "विपरीत (Opposition)",
      Trine: "त्रिकोण (Trine)",
      Square: "चतुष्कोण (Square)",
      Sextile: "षडाष्टक (Sextile)",
    },

    // टियर बैज
    tiers: { weak: "कमज़ोर", moderate: "मध्यम", strong: "मज़बूत", excellent: "उत्कृष्ट" },

    actions: { highlightAllDomain: "इस डोमेन के सभी हाइलाइट करें" },

    // डोमेन कार्ड्स + housePresence
    domains: {
      career:    { title: "करियर",    chip10th: "10वाँ भाव", chip6th: "6ठा भाव",  chip11th: "11वाँ भाव", housePresence: "करियर भावों में ग्रह" },
      finance:   { title: "वित्त",     chip2nd: "2रा भाव",   chip11th: "11वाँ भाव",                          housePresence: "धन भावों में ग्रह" },
      health:    { title: "स्वास्थ्य",  chipAsc: "लग्न",      chip6th: "6ठा भाव",                              housePresence: "स्वास्थ्य भावों में ग्रह" },
      marriage:  { title: "विवाह",     chip7th: "7वाँ भाव",                                                    housePresence: "विवाह भाव में ग्रह" },
      education: { title: "शिक्षा",     chip5th: "5वाँ भाव",                                                    housePresence: "शिक्षा भावों में ग्रह" },
    },

    // बैकएंड फ्लैट-की एलियस
    career:    { chip10th: "10वाँ भाव", chip6th: "6ठा भाव", chip11th: "11वाँ भाव" },
    finance:   { chip2nd: "2रा भाव",    chip11th: "11वाँ भाव" },
    health:    { chipAsc: "लग्न",       chip6th: "6ठा भाव" },
    marriage:  { chip7th: "7वाँ भाव" },
    education: { chip5th: "5वाँ भाव" },

    // केंद्रीकृत चिप लेबल
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
        Conjunction: "संयोग (Conjunction)",
        Opposition: "विपरीत (Opposition)",
        Trine: "त्रिकोण (Trine)",
        Square: "चतुष्कोण (Square)",
        Sextile: "षडाष्टक (Sextile)",
      },
      aspectClass: { benefic: "शुभ प्रभाव" },
      house: "भाव",

      // कौशल चिप्स
      skill: {
        mercury: "बुध की शक्ति",
        venus: "शुक्र की शक्ति",
        sun: "सूर्य की शक्ति",
        saturn: "शनि की शक्ति",
        mars: "मंगल की शक्ति",
        jupiter: "बृहस्पति की शक्ति",
        rahu10or11: "राहु 10/11 में (समर्थन सहित)",
        mercuryJupiterTrine: "बुध–बृहस्पति त्रिकोण",
        mercurySaturnTrine: "बुध–शनि त्रिकोण",
        mercuryVenusTrine: "बुध–शुक्र त्रिकोण",
        mercuryMoonTrine: "बुध–चंद्र त्रिकोण",
        venusMercuryTrine: "शुक्र–बुध त्रिकोण",
        venusMoonTrine: "शुक्र–चंद्र त्रिकोण",
        venusJupiterTrine: "शुक्र–बृहस्पति त्रिकोण",
        sunMarsTrine: "सूर्य–मंगल त्रिकोण",
        sunJupiterTrine: "सूर्य–बृहस्पति त्रिकोण",
        saturnMercuryTrine: "शनि–बुध त्रिकोण",
      },
    },

    // कौशल कार्ड शीर्षक (+ फॉलबैक एलियस)
    skills: {
      Analytical: "विश्लेषण क्षमता",
      Communication: "संचार",
      Leadership: "नेतृत्व",
      Creativity: "रचनात्मकता",
      Focus: "एकाग्रता व अनुशासन",
      Entrepreneurial: "उद्यमी ड्राइव",
      // t('i
