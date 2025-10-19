// goastrion-frontend/app/lib/locales/bn.ts
import core from "./bn-core";
import insights from "./bn-insights";
import saturn from "./bn-saturn";
import daily from "./bn-daily";
import { deepMerge } from "./_merge";

const bn = deepMerge(deepMerge(deepMerge(core, insights), saturn), daily) as
  typeof core & typeof insights & typeof saturn & typeof daily;

export default bn;
