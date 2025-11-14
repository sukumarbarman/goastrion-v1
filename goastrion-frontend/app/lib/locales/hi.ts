import hiCore from "./hi-core";
import hiInsights from "./hi-insights";
import hiSaturn from "./hi-saturn";
import hiDaily from "./hi-daily";
import hiAbout from "./hi-about";
import hiGuides from "./hi-guides";
import hiFaq from "./hi-faq";
import hiResults from "./hi-results-page";
import hiShubhdin from "./hi-shubhdin";
import hiDasha from "./hi-dasha";
import { deepMerge } from "./_merge";

// Final merged Hindi locale
const hi = deepMerge(
  deepMerge(
    deepMerge(
      deepMerge(
        deepMerge(hiCore, hiInsights),
        hiSaturn
      ),
      hiDaily
    ),
    hiAbout
  ),
  deepMerge(
    deepMerge(
      deepMerge(hiGuides, hiFaq),
      hiResults
    ),
    deepMerge(hiShubhdin, hiDasha)
  )
) as typeof hiCore &
  typeof hiInsights &
  typeof hiSaturn &
  typeof hiDaily &
  typeof hiAbout &
  typeof hiGuides &
  typeof hiFaq &
  typeof hiResults &
  typeof hiShubhdin &
  typeof hiDasha;

export default hi;
