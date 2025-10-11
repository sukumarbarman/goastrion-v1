import core from "./bn-core";
import insights from "./bn-insights";
import saturn from "./bn-saturn";
import { deepMerge } from "./_merge";

const bn = deepMerge(deepMerge(core, insights), saturn) as
  typeof core & typeof insights & typeof saturn;

export default bn;
