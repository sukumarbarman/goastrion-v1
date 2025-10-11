# i18n Language Pack — 10‑Locale Starter (India + Global)

This guide captures a pragmatic 10‑language set that covers key Indian audiences plus the biggest global markets, with codes, notes, and implementation tips.

---

## Recommended Locales (BCP‑47)

| # | Language | Code | Notes |
|---:|---|---|---|
| 1 | English | **en** (en-US / en-GB) | Global baseline & fallback |
| 2 | Hindi (India) | **hi-IN** | Devanagari |
| 3 | Bengali (India/Bangladesh) | **bn-IN** / bn-BD | Eastern India + BD |
| 4 | Tamil (India) | **ta-IN** | South India |
| 5 | Telugu (India) | **te-IN** | South India |
| 6 | Spanish | **es-419** / es-ES | Choose LatAm (`es-419`) unless Spain-specific |
| 7 | Chinese (Simplified) | **zh-Hans** (zh-CN) | Use script tag when possible |
| 8 | Arabic (RTL) | **ar** (ar-SA / ar-EG) | **RTL**; set `dir="rtl"` |
| 9 | Portuguese (Brazil) | **pt-BR** | Large market & ad spend |
| 10 | French | **fr-FR** / fr-CA | Europe + Canada |

> Tip: Start with these 10, add `mr-IN`, `gu-IN`, `kn-IN`, `ml-IN`, `pa-IN`, `id-ID`, `de-DE`, `ru-RU` later based on analytics.

---

## Why this set
- Strong India coverage via **hi/bn/ta/te** (North, East, South).
- Global reach via **en/es/zh/ar/pt/fr** (largest online user bases & ad markets).
- Keeps ops complexity manageable while maximizing reach.

---

## Project Layout Suggestion

```
app/
  lib/
    locales/
      en-core.ts
      hi-core.ts
      bn-core.ts
      ta-core.ts
      te-core.ts
      es-core.ts
      zh-Hans-core.ts
      ar-core.ts
      pt-BR-core.ts
      fr-core.ts
      index.ts          # export dictionaries map
    i18n.ts             # helpers: t(), tOr(), tx(), dirByLocale()
  components/
    I18nProvider.tsx    # context + dir handling
```

---

## Fallbacks & Negotiation

1. **Accept-Language** parsing → try full match → language-only match → **fallback to `en`**.
2. Keep **keys identical** across locales. Missing keys surface in telemetry.
3. Consider a **rolling fallback**: `hi-IN → hi → en`.

---

## RTL Support (Arabic, Urdu, Hebrew)

- Add `dir="rtl"` at the document root when `locale` is RTL.
- Mirror layout-aware icons and paddings (e.g., `ml-` vs `mr-`).
- Test all components with long strings and mixed numerals.

Example:
```tsx
<html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"}>
```

---

## Plurals, Numbers, Dates

- Use **ICU MessageFormat** for plurals/gender/select.
- For runtime formatting: **Intl.NumberFormat**, **Intl.DateTimeFormat**.
- Prefer locale-aware libraries only if needed (e.g., `@formatjs/intl`), otherwise native Intl is enough.

Example (plural):
```jsonc
// en-core.ts
"cart.items": "{count, plural, =0 {No items} one {# item} other {# items}}"
```

---

## SEO & Hreflang

Add alternate links per locale:
```html
<link rel="alternate" hrefLang="en" href="https://example.com/" />
<link rel="alternate" hrefLang="hi-IN" href="https://example.com/hi/" />
<link rel="alternate" hrefLang="bn-IN" href="https://example.com/bn/" />
<link rel="alternate" hrefLang="ta-IN" href="https://example.com/ta/" />
<link rel="alternate" hrefLang="te-IN" href="https://example.com/te/" />
<link rel="alternate" hrefLang="es-419" href="https://example.com/es/" />
<link rel="alternate" hrefLang="zh-Hans" href="https://example.com/zh/" />
<link rel="alternate" hrefLang="ar" href="https://example.com/ar/" />
<link rel="alternate" hrefLang="pt-BR" href="https://example.com/pt/" />
<link rel="alternate" hrefLang="fr-FR" href="https://example.com/fr/" />
<link rel="alternate" hrefLang="x-default" href="https://example.com/" />
```

---

## Minimal Dictionary Example

```ts
// en-core.ts
const en = {
  app: { title: "GoAstrion" },
  nav: { home: "Home", about: "About", skills: "Skills" },
  skills: {
    title: "Skill Spotlight",
    list: {
      analytical: { name: "Analytical", blurb: "Pattern‑finding & logic." },
      communication: { name: "Communication", blurb: "Clear writing & speaking." }
    }
  }
};
export default en;
```

```ts
// hi-core.ts
const hi = {
  app: { title: "गोएस्ट्रियन" },
  nav: { home: "होम", about: "परिचय", skills: "कौशल" },
  skills: {
    title: "कौशल स्पॉटलाइट",
    list: {
      analytical: { name: "विश्लेषणात्मक", blurb: "पैटर्न पहचान और तर्क।" },
      communication: { name: "संचार", blurb: "स्पष्ट लेखन और बोलना।" }
    }
  }
};
export default hi;
```

---

## Next.js Hook Sketch

```ts
// lib/i18n.ts
import { dictionaries } from "./locales/dictionaries";

export type Locale = keyof typeof dictionaries;
export const DEFAULT_LOCALE: Locale = "en";

export function isRtl(l: string) {
  return ["ar", "fa", "he", "ur"].some(rtl => l.startsWith(rtl));
}

export function t(locale: Locale, key: string, vars: Record<string, string|number> = {}) {
  const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
  const val = key.split(".").reduce<any>((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), dict) ?? key;
  return typeof val === "string" ? interpolate(val, vars) : val;
}

function interpolate(s: string, vars: Record<string, string|number>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
```

---

## Locale Expansion Playbook

1. Launch with the 10 locales above.
2. Add DeepL/Google translate drafts → human review for top screens.
3. Track **missing keys**, **fallback counts**, **per-locale retention**.
4. Add new locales once ≥3% of traffic or revenue comes from a region.
5. Create a **glossary** (brand & domain terms) to keep consistency.

---

## QA Checklist

- [ ] All pages render in each locale (no 500/404 on route prefixes).  
- [ ] No clipped/colliding text for longer strings (de, fr, ar).  
- [ ] Numbers, dates, currencies are locale-correct.  
- [ ] RTL layout verified (nav, forms, icons, carousels).  
- [ ] Hreflang tags present and correct.  
- [ ] Fallback to `en` works and is logged.  
- [ ] Screenshots taken for store/listings per locale.  

---

**Maintained by:** i18n/Localization owners  
**Last updated:** (fill in when adopted)
