export type DailyArgs = Record<string, string | number | undefined>;

export const formatDaily = (tpl: string, args: DailyArgs = {}) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => (args[k] ?? "").toString());

const hiDaily = {
  // --------------------------
  // प्रोफाइल त्वरित दृश्य (Profile Quick View)
  // --------------------------
  profile: {
    daily: {
      title: "दैनिक त्वरित दृश्य",
      subtitle: "आपके सहेजे गए जन्म विवरण से व्यक्तिगत विंडो।",
      region: "दैनिक त्वरित दृश्य",
      empty: "दैनिक देखने के लिए जन्म विवरण जोड़ें।",
      cta: {
        open: "आज जानें",
        tomorrow: "कल की योजना बनाएं",
      },
    },

    account: {
      actions: {
        editBirth: "जन्म विवरण संपादित करें",
      },
    },
  },

  history: {
    dailyOpened: "दैनिक पेज खोला (प्रोफाइल से)",
  },

  // --------------------------
  // दैनिक पेज (मूल)
  // --------------------------
  daily: {
    optionalAddons: {
      travel: "10 मिनट पहले निकलें; मार्ग की पुष्टि करें",
      detox: "10 मिनट डिजिटल डिटॉक्स करें",
      roadSafety: "सड़क सुरक्षा/कंबल दान का समर्थन करें",
    },

    title: "आपका दिन",
    subtitle: "आज के लिए सहायक समय, मुख्य झलकियाँ और उपाय।",
    changeBirth: "जन्म विवरण बदलें",
    forDate: "तारीख (YYYY-MM-DD) के लिए",
    persona: "व्यक्तित्व",
    get: "दैनिक प्राप्त करें",
    getting: "प्राप्त किया जा रहा है…",

    missingBirth: {
      title: "जन्म विवरण आवश्यक",
      desc: "कृपया पहले अपनी जन्म कुंडली बनाएं ताकि हम आपके दैनिक समयों को व्यक्तिगत बना सकें।",
      cta: "कुंडली बनाएं",
    },

    ui: {
      dobLabel: "जन्म तिथि",
      today: "आज",
      loading: "लोड हो रहा है…",
      tryAgain: "फिर से प्रयास करें",
      headline: "मुख्य शीर्षक",
      windowsToday: "आज के समय",
      best: "सर्वश्रेष्ठ",
      green: "हरा",
      caution: "सावधानी",
      wear: "धारण करें",

      panchang: {
        title: "पंचांग",
        desc:
          "पंचांग पारंपरिक वैदिक कैलेंडर के अनुसार दैनिक शुभ-अशुभ समय बताता है। राहु काल, यमगंड और गुलिक काल नए कार्य या यात्रा प्रारंभ करने के लिए सामान्यतः सावधानी काल माने जाते हैं, जबकि अभिजीत मुहूर्त को शुभ (सौभाग्यशाली) समय माना जाता है।",
        rahuLabel: "राहु काल",
        yamaLabel: "यमगंड",
        gulikaLabel: "गुलिक काल",
        abhijitLabel: "अभिजीत मुहूर्त",
        cautious: "सावधानी",
        auspicious: "शुभ",
      },

      energy: {
        label: "ऊर्जा",
        caption: "आज कार्य करने में सहजता का स्तर",
        sentences: {
          low: "ऊर्जा {val}: शांत रहें; छोटे कार्य करें।",
          solid: "ऊर्जा {val}: स्थिर — महत्वपूर्ण कार्य सर्वश्रेष्ठ समय में करें।",
          strong: "ऊर्जा {val}: मजबूत — बड़े कार्य सर्वश्रेष्ठ समय में करें।",
          peak: "ऊर्जा {val}: चरम — लॉन्च, वार्ता या प्रस्तुति करें; ध्यान केंद्रित रखें।",
        },
      },

      sections: { goodTimes: "शुभ समय", caution: "सावधानी", remedies: "उपाय" },
      remedies: {
        wear: "धारण करें",
        say: "उच्चारण करें",
        puja: "पूजा करें",
        do: "करें",
        alt: "विकल्प",
        optionalPrefix: "वैकल्पिक:",
        disclaimer: "यह केवल मार्गदर्शन है, पेशेवर सलाह का विकल्प नहीं।",
        copyPlan: "योजना कॉपी करें",
      },

      debug: {
        title: "क्यों",
        hide: "छिपाएं",
        show: "दिखाएं",
        tspmsp: "शीर्ष समर्थन (tsp) / शीर्ष तनाव (msp)",
        mdad: "महादशा / अंतर्दशा",
        tagsSupport: "समर्थन टैग",
        tagsStress: "तनाव टैग",
        supportPct: "समर्थन %",
        stressPct: "तनाव %",
      },

      avoidWindows: "इन समयों से बचें",
      avoid: "बचें",
      and: "और",
      sensitiveConversations: "संवेदनशील बातचीत",
      travel: "यात्रा",

      topics: {
        sensitiveConversations: "संवेदनशील बातचीत",
        travel: "यात्रा",
        trading: "जोखिमपूर्ण ट्रेड",
        legal: "कागजी कार्य/अनुबंध",
        creative: "रचनात्मक प्रयोग",
        networking: "नया संपर्क",
        familyKids: "परिवार/बच्चों से संबंधित विषय",
        finance: "बड़े वित्तीय निर्णय",
        health: "कठोर व्यायाम",
        tech: "तकनीकी बदलाव",
        doomscroll: "नकारात्मक पोस्ट और स्क्रॉलिंग",
        msp: "अधिक कार्यभार और देर रात तक काम",
      },

      deities: {
        Shani: "शनि",
        Durga: "दुर्गा",
        Shiva: "शिव",
        Vishnu: "विष्णु",
        Lakshmi: "लक्ष्मी",
        Hanuman: "हनुमान",
        Surya: "सूर्य",
        Ganesha: "गणेश",
      },

      yourDay: "आज",
    },

    phrases: {
      HEADLINE_COMM_GOOD: "बातचीत के लिए अच्छा समय {start}-{end}",
      HEADLINE_TRAVEL_AVOID: "यात्रा से बचें {start}-{end}",
      HEADLINE_REASON: "{planet} {aspect} {target}",
      HEADLINE_REASON_TEXT: "{reason}",

      NOTE_COMM_BEST: "व्यक्तिगत या आधिकारिक बातचीत के लिए सर्वोत्तम समय का उपयोग करें।",
      NOTE_TRAVEL_AVOID: "गैर-जरूरी यात्रा को सावधानी समय में टालें।",
      NOTE_TRADING: "अनुशासित रहें; चिन्हित समयों में ट्रेड न करें।",

      DO_TALK_MEET_WINDOW: "बातचीत या मुलाकात करें {start}-{end}।",
      DO_TRADING_PREFER_WINDOW: "यदि ट्रेड करें, तो {start}-{end} के बीच करें और स्टॉप रखें।",
      DO_CREATIVE_WINDOW: "रचनात्मक कार्य {start}-{end} में करें। पहला ड्राफ्ट बनाएं।",
      DO_PAPERWORK_WINDOW: "कागजी कार्य {start}-{end} में करें। नाम, तारीख, राशि जाँचें।",
      DO_CREATIVE_SHORT: "30–45 मिनट सृजन करें। एक पूर्वावलोकन साझा करें।",
      DO_STUDY_30MIN: "30 मिनट अध्ययन करें। एक कठिन विषय दोहराएं।",
      DO_ADMIN_CLEAR_SMALL: "1–2 छोटे प्रशासनिक कार्य निपटाएं।",
      DO_FOLLOWUP_SHORT: "{time} तक छोटा फॉलो-अप भेजें।",
      DO_WALK_20MIN: "15–20 मिनट टहलें या हल्की एक्सरसाइज करें।",
      DO_CONTRACTS_WINDOW: "अनुबंध {start}-{end} में जाँचें। हस्ताक्षर से पहले पढ़ें।",
      DO_FAMILY_TIME_WINDOW: "परिवार समय {start}-{end}। फ़ोन दूर रखें।",

      DONT_AVOID_SENSITIVE_CONVOS_WINDOW: "संवेदनशील बातचीत से बचें {start}-{end}।",
      DONT_AVOID_TRAVEL_WINDOW: "यात्रा से बचें {start}-{end}।",
      DONT_AVOID_TRADING_WINDOW: "ट्रेडिंग से बचें {start}-{end}।",
      DONT_DRIVE_DEFENSIVE_WINDOW: "सावधानी से ड्राइव करें {start}-{end}। टकराव से बचें।",
      DONT_BLOCK_SPAM: "स्पैम या अज्ञात कॉल को नज़रअंदाज़ करें; ब्लॉक और रिपोर्ट करें।",

      DH_CLIENT_MEETING_TRY_WINDOW_SIMPLE: "क्लाइंट मीटिंग? {start}-{end} में करें। सरल रखें।",
      DH_CLIENT_WARM_NOTE: "एक क्लाइंट को गर्मजोशी भरा संदेश भेजें। अगला कदम पूछें।",
      DH_INVOICES_FOLLOWUP_POLITE:
        "लंच से पहले लंबित इनवॉइस पर फॉलो-अप करें। विनम्र और स्पष्ट रहें।",

      ASPECT_REASON: "{planet} {aspect} {target}",
      ASPECT_REASON_TEXT: "{reason}",
      REMEDY_OPTIONAL_DYNAMIC: "{text}",
    },
  },
};

export type DailyLocale = typeof hiDaily;
export default hiDaily;
