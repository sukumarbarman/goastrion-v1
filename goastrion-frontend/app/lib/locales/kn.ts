//Kannada (kn)
// goastrion-frontend/app/lib/locales/kn.ts
import core from "./kn-core";
import insights from "./kn-insights";
import saturn from "./kn-saturn";
import { deepMerge } from "./_merge";

const kn = deepMerge(deepMerge(core, insights), saturn) as
  typeof core & typeof insights & typeof saturn;

export default kn;

