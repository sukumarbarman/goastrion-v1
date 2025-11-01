import core from "./hi-core";
import insights from "./hi-insights";
import saturn from "./hi-saturn";
import daily from "./hi-daily";
import { deepMerge } from "./_merge";

const hi = deepMerge(deepMerge(deepMerge(core, insights), saturn), daily) as
  typeof core & typeof insights & typeof saturn & typeof daily;

export default hi;
