//goastrion-frontend/app/lib/locales/en.ts
import core from "./en-core";
import insights from "./en-insights";
import saturn from "./en-saturn";
import { deepMerge } from "./_merge";

const en = deepMerge(deepMerge(core, insights), saturn) as
  typeof core & typeof insights & typeof saturn;

export default en;
