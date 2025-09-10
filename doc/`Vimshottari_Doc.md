# GoAstrion Backend — Vimśottarī Daśā Module

This document explains how to use the **Vimśottarī Mahādaśā & Antardaśā** engine in the GoAstrion backend, including the timezone fix, Lahiri ayanāṁśa setting, CLI usage, and debug outputs.

---

## ✅ What this module provides

- Compute **Mahādaśā** sequence with correct **starting balance** from birth Moon’s nakṣatra.
- Compute **Antardaśā (Bhukti)** split within any Mahādaśā.
- **Two printers**:
  - `print_mahadashas_only(...)` — quick view of MDs.
  - `print_mahadasha_with_antardasha(...)` — detailed view (MD + AD).
- **Debug header** for at-a-glance verification (Moon°, nakṣatra, fraction, start lord, balance).
- CLI flags for fast terminal use.

---

## 📁 Files touched

- `astro/dasha/vimshottari.py` — new/updated module (MD + AD + printers + CLI).
- `astro/ephem/swiss.py` — **Lahiri ayanāṁśa** is forced via `swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)`.

> Your `swiss.py` must set the sidereal mode to **Lahiri** to match standard Vedic outputs.

```python
# astro/ephem/swiss.py (excerpt)
import swisseph as swe
swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)  # ✅ Force Lahiri ayanāṁśa



@dataclass
class Period:
    lord: str
    start: datetime
    end: datetime
    years: float  # duration in years

@dataclass
class DashaTimeline:
    mahadashas: List[Period]
    antardashas: Dict[str, List[Period]]  # key = "<MD_lord>@<start_iso>"

def compute_vimshottari_mahadasha(dt_utc, lat, lon, tz_offset_hours=0.0, horizon_years=120.0) -> List[Period]
def compute_antardashas_for_mahadasha(md: Period) -> List[Period]
def compute_vimshottari_full(dt_utc, lat, lon, tz_offset_hours=0.0, horizon_years=120.0) -> DashaTimeline

# Printers
def print_mahadashas_only(timeline: DashaTimeline, limit_md: Optional[int] = None, debug_header: Optional[Dict[str, str]] = None) -> None
def print_mahadasha_with_antardasha(timeline: DashaTimeline, limit_md: Optional[int] = None) -> None

# Optional debug
def build_debug_context(dt_utc, lat, lon, tz_offset_hours=0.0) -> Dict[str, str]
def debug_birth_moon(dt_utc, lat, lon, tz_offset_hours=0.0) -> None

🖥️ CLI usage

From the backend root:

python -m astro.dasha.vimshottari \
  --date 1990-11-20 \
  --time 23:00:00 \
  --lat 22.30 \
  --lon 87.92 \
  --tz 5.5 \
  --years 40 \
  --md-only \
  --debug



🧾 Example output (with debug header)

---- DEBUG (Birth Context) ----
UTC datetime     : 1990-11-20T17:30:00+00:00  (tz_offset_hours used: 0.0)
Moon longitude   : 250.68573°
Nakshatra        : Mula (index 18)
Fraction elapsed : 80.143%
Start MD lord    : Ketu
Start MD balance : 1.39746 years (~16.77 months)
-------------------------------
===== Vimshottari Mahadasha (Quick View) =====
Ketu     | 1990-11-20 → 1992-03-xx |  1.397y
Venus    | 1992-03-xx → 2012-03-xx | 20.000y
Sun      | 2012-03-xx → 2018-03-xx |  6.000y
Moon     | 2018-03-xx → 2028-03-xx | 10.000y
Mars     | 2028-03-xx → 2035-03-xx |  7.000y
Rahu     | 2035-03-xx → 2053-03-xx | 18.000y
Jupiter  | 2053-03-xx → 2069-03-xx | 16.000y
Saturn   | 2069-03-xx → 2088-03-xx | 19.000y
Mercury  | 2088-03-xx → 2105-03-xx | 17.000y

