// goastrion-frontend/app/lib/locales/dictionaries.ts
import en from "./en";
import hi from "./hi";
import bn from "./bn";
import ta from "./ta";
import te from "./te";
import kn from "./kn";

export const dictionaries = { en, hi, bn, ta, te, kn };
export type Dictionaries = typeof dictionaries;
export type Locale = keyof Dictionaries; // "en" | "hi" | "bn" | "ta" | "te" | "kn"
