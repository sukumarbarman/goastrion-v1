// app/lib/locales/bn.ts

import core from "./bn-core";
import insights from "./bn-insights";
import saturn from "./bn-saturn";
import daily from "./bn-daily";
import bnAbout from "./bn-about";
import bnGuides from "./bn-guides";
import { deepMerge } from "./_merge";
import bnFaq from "./bn-faq";
import bnResultsPage from "./bn-results-page";

const bn = deepMerge(
  deepMerge(
    deepMerge(
      deepMerge(
        deepMerge(
          core,
          insights
        ),
        saturn
      ),
      daily
    ),
    bnAbout
  ),
  deepMerge(
    deepMerge(bnGuides, bnFaq),
    bnResultsPage
  )
) as typeof core &
  typeof insights &
  typeof saturn &
  typeof daily &
  typeof bnAbout &
  typeof bnGuides &
  typeof bnFaq &
  typeof bnResultsPage;

export default bn;
