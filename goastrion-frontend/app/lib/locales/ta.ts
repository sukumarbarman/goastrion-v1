//Tamil (ta)
// goastrion-frontend/app/lib/locales/ta.ts
import core from "./ta-core";
import insights from "./ta-insights";
import saturn from "./ta-saturn";
import { deepMerge } from "./_merge";

const ta = deepMerge(deepMerge(core, insights), saturn) as
  typeof core & typeof insights & typeof saturn;

export default ta;

