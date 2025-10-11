//Telugu (te)
// goastrion-frontend/app/lib/locales/te.ts
import core from "./te-core";
import insights from "./te-insights";
import saturn from "./te-saturn";
import { deepMerge } from "./_merge";

const te = deepMerge(deepMerge(core, insights), saturn) as
  typeof core & typeof insights & typeof saturn;

export default te;
