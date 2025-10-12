// goastrion-frontend/app/lib/locales/dictionaries.ts
import en from "./en";
import hi from "./hi";
import bn from "./bn";
import ta from "./ta";
import te from "./te";
import kn from "./kn";
import es from "./es";
import pt from "./pt";
import fr from "./fr";

export const dictionaries = { en, hi, bn, ta, te, kn, es, pt, fr };
export type Dictionaries = typeof dictionaries;
export type Locale = keyof Dictionaries; // "en" | "hi" | "bn" | "ta" | "te" | "kn" | "es" | "pt" | "fr"

