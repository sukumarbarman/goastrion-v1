// goastrion-frontend/app/lib/locales/pt.ts
import core from "./pt-core";
import insights from "./pt-insights";
import saturn from "./pt-saturn";
import { deepMerge } from "./_merge";

const pt = deepMerge(deepMerge(core, insights), saturn) as
  typeof core & typeof insights & typeof saturn;

export default pt;
