# GoAstrion Backend API — Date/Time Input Format & Usage (Unified)

## Global Date/Time Rules (for every endpoint)
- **All input timestamps:** **UTC ISO-8601**, e.g. `"1990-11-20T17:30:00Z"`.
- **`tz_offset_hours` (optional):** Used **only for local echoes** (labels/UI). Core maths stays in **UTC**.
- **All output timestamps:** UTC ISO-8601. If `tz_offset_hours` is provided, additionally include `*_local` fields (ISO-8601 with the given offset).
- **Lat/Lon:** Decimal degrees. East/North positive; West/South negative.
- **Ranges:** `start` inclusive, `end` exclusive (`[start, end)`).
- **IST → UTC example:** `1990-11-20 23:00 IST (UTC+05:30)` ⇒ send `"1990-11-20T17:30:00Z"` with `"tz_offset_hours": 5.5`.

---

## 1) `/api/chart`

This **single endpoint** returns **both**:
- North Indian style birth chart (SVG + summary)
- Vimśottarī Daśā timeline (Mahādaśā + Antardaśā)

### Request
```http
POST /api/chart
Content-Type: application/json
```

**Body:**
```json
{
  "datetime": "1990-11-20T17:30:00Z",   // UTC ISO-8601 format
  "lat": 22.30,                         // latitude (decimal degrees)
  "lon": 87.92,                         // longitude (decimal degrees)
  "tz_offset_hours": 5.5                // timezone offset used for local echoes/labels
}
```

### Response (abridged)
```json
{
  "svg": "<svg>...</svg>",
  "summary": {
    "lagna_sign": "Cancer",
    "sun_sign": "Scorpio",
    "moon_sign": "Sagittarius",
    "moon_nakshatra": "Mula",
    "lagna_deg": "119.22°",
    "sun_deg": "214.40°",
    "moon_deg": "250.68°"
  },
  "meta": {
    "lagna_deg": 119.22,
    "lagna_sign": "Cancer",
    "planets": { "Sun": 214.4, "Moon": 250.68, "...": "..." },
    "planets_in_houses": { "1": ["Jupiter","Ketu"], "5": ["Sun","Mercury","Venus"], "...": [] },
    "vimshottari": {
      "mahadashas": [
        { "lord": "Ketu", "start": "1990-11-20T17:30:00Z", "end": "1992-04-11T...", "years": 1.39 },
        { "lord": "Venus", "start": "...", "end": "...", "years": 20 }
      ],
      "antardashas": {
        "Ketu@1990-11-20T17:30:00Z": [
          { "lord": "Ketu", "start": "...", "end": "...", "years": 0.23 }
        ]
      }
    },
    "vimshottari_debug": {
      "utc_iso": "1990-11-20T17:30:00Z",
      "moon_lon_deg": 250.68,
      "nakshatra": "Mula (index 18)",
      "start_md_lord": "Ketu",
      "start_md_balance_years": 1.39
    }
  }
}
```

**Notes**
- Calculations are in UTC; `tz_offset_hours` only affects `*_local` echo fields if included elsewhere.

---

## 2) `/api/saturn/sade-sati`

Computes **Sade Sati windows** from natal Moon & Saturn transits, including **retro overlaps** and **station days**.

### Request
```http
POST /api/saturn/sade-sati
Content-Type: application/json
```

**Body**
```json
{
  "datetime": "1990-11-20T17:30:00Z",     // anchor: birth moment (UTC)
  "lat": 22.30,
  "lon": 87.92,
  "tz_offset_hours": 5.5,                 // optional: for *_local echoes
  "horizon_days": 36525,                  // optional, default 36525 (100 years)
  "include_debug": false                  // optional
}
```

### Response (example shape)
```json
{
  "anchor": {
    "utc_iso": "1990-11-20T17:30:00Z",
    "local_iso": "1990-11-20T23:00:00+05:30"
  },
  "horizon_days": 36525,
  "phases": [
    {
      "phase": "First Dhaiyya",
      "start_utc": "2014-11-03T00:00:00Z",
      "end_utc":   "2017-01-26T00:00:00Z",
      "start_local": "2014-11-03T05:30:00+05:30",
      "end_local":   "2017-01-26T05:30:00+05:30",
      "duration_days": 816,
      "moon_sign": "Sagittarius",
      "saturn_sign": "Scorpio",
      "stations": [
        { "type": "SRx", "utc": "2015-03-14T04:00:00Z", "local": "2015-03-14T09:30:00+05:30" },
        { "type": "SD",  "utc": "2015-08-02T18:00:00Z", "local": "2015-08-02T23:30:00+05:30" }
      ],
      "retro_overlaps": [
        {
          "start_utc": "2015-03-14T00:00:00Z",
          "end_utc":   "2015-08-03T00:00:00Z",
          "start_local": "2015-03-14T05:30:00+05:30",
          "end_local":   "2015-08-03T05:30:00+05:30"
        }
      ],
      "caution": true,
      "note": "Caution day(s) in this span. Prefer a clearer day for major commitments."
    }
  ],
  "meta": {
    "moon_longitude_deg": 250.68,
    "saturn_motion_spans": [
      { "kind": "retro", "start_utc": "...", "end_utc": "..." },
      { "kind": "direct", "start_utc": "...", "end_utc": "..." }
    ],
    "sidereal_ayanamsa": "Lahiri"
  },
  "debug": null
}
```

**Rules**
- Anchor is **birth UTC** (`datetime`), ensuring a unique natal Moon.
- All boundaries and instants computed in **UTC**; `*_local` added only if `tz_offset_hours` provided.
- `duration_days` = `(end_utc - start_utc)` in days; `end` is exclusive.

---

## 3) `/api/saturn/retro-stations` (helper)

Returns **Saturn retrograde windows** and **station timestamps** for a given horizon; helpful for UI overlays.

### Request
```http
POST /api/saturn/retro-stations
Content-Type: application/json
```

**Body**
```json
{
  "start_utc": "2000-01-01T00:00:00Z",
  "end_utc":   "2050-01-01T00:00:00Z",
  "tz_offset_hours": 5.5
}
```

### Response
```json
{
  "windows": [
    {
      "kind": "retro",
      "start_utc": "2015-03-14T00:00:00Z",
      "end_utc":   "2015-08-03T00:00:00Z",
      "start_local": "2015-03-14T05:30:00+05:30",
      "end_local":   "2015-08-03T05:30:00+05:30"
    }
  ],
  "stations": [
    { "type": "SRx", "utc": "2015-03-14T04:00:00Z", "local": "2015-03-14T09:30:00+05:30" },
    { "type": "SD",  "utc": "2015-08-02T18:00:00Z", "local": "2015-08-02T23:30:00+05:30" }
  ]
}
```

---

## Implementation Checklist
- Accept `datetime` (UTC) + optional `tz_offset_hours` in Saturn endpoints (parity with `/api/chart`).
- Perform **all** core calculations in **UTC**.
- Emit `*_local` only if `tz_offset_hours` was provided.
- Keep all ranges `[start, end)` to avoid off-by-one at midnight.
- Default `horizon_days` for Sade Sati to **100 years (36525 days)**.

---

## (Optional) Pydantic Models (to keep FE/BE type-aligned)
```python
from pydantic import BaseModel
from typing import Optional, List, Literal

class Anchor(BaseModel):
  utc_iso: str
  local_iso: Optional[str] = None

class Station(BaseModel):
  type: Literal["SRx","SD"]
  utc: str
  local: Optional[str] = None

class RetroWindow(BaseModel):
  kind: Literal["retro","direct"]
  start_utc: str
  end_utc: str
  start_local: Optional[str] = None
  end_local: Optional[str] = None

class SadeSatiPhase(BaseModel):
  phase: str
  start_utc: str
  end_utc: str
  start_local: Optional[str] = None
  end_local: Optional[str] = None
  duration_days: int
  moon_sign: str
  saturn_sign: str
  stations: List[Station] = []
  retro_overlaps: List[RetroWindow] = []
  caution: bool = False
  note: Optional[str] = None

class SadeSatiResponse(BaseModel):
  anchor: Anchor
  horizon_days: int
  phases: List[SadeSatiPhase]
  meta: dict
  debug: Optional[dict] = None

class RetroStationsRequest(BaseModel):
  start_utc: str
  end_utc: str
  tz_offset_hours: Optional[float] = None

class RetroStationsResponse(BaseModel):
  windows: List[RetroWindow]
  stations: List[Station]
```
