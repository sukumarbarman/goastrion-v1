import bnCore from "./bn-core";
import bnInsights from "./bn-insights";
import bnSaturn from "./bn-saturn";
import bnDaily from "./bn-daily";
import bnAbout from "./bn-about";
import bnGuides from "./bn-guides";
import bnFaq from "./bn-faq";
import bnResults from "./bn-results-page";
import bnShubhdin from "./bn-shubhdin";
import bnDasha from "./bn-dasha";

import { deepMerge } from "./_merge";

// Final merged Bengali locale
const bn = deepMerge(
  deepMerge(
    deepMerge(
      deepMerge(
        deepMerge(bnCore, bnInsights),
        bnSaturn
      ),
      bnDaily
    ),
    bnAbout
  ),
  deepMerge(
    deepMerge(
      deepMerge(bnGuides, bnFaq),
      bnResults
    ),
    deepMerge(bnShubhdin, bnDasha)
  )
) as typeof bnCore &
  typeof bnInsights &
  typeof bnSaturn &
  typeof bnDaily &
  typeof bnAbout &
  typeof bnGuides &
  typeof bnFaq &
  typeof bnResults &
  typeof bnShubhdin &
  typeof bnDasha;

export default bn;
