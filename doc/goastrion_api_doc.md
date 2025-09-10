# GoAstrion Backend API — Date/Time Input Format & Usage

## 1. `/api/chart`

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
  "tz_offset_hours": 5.5                 // timezone offset used for chart
}
```

### Response
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
    "planets": { "Sun": 214.4, "Moon": 250.68, ... },
    "planets_in_houses": { "1": ["Jupiter","Ketu"], "5": ["Sun","Mercury","Venus"], ... },
    "vimshottari": {
      "mahadashas": [
        { "lord": "Ketu", "start": "1990-11-20T17:30:00+00:00", "end": "1992-04-11T...", "years": 1.39 },
        { "lord": "Venus", "start": "...", "end": "...", "years": 20 },
        ...
      ],
      "antardashas": {
        "Ketu@1990-11-20T17:30:00+00:00": [
          { "lord": "Ketu", "start": "...", "end": "...", "years": 0.23 },
          ...
        ]
      }
    },
    "vimshottari_debug": {
      "utc_iso": "1990-11-20T17:30:00+00:00",
      "moon_lon_deg": 250.68,
      "nakshatra": "Mula (index 18)",
      "start_md_lord": "Ketu",
      "start_md_balance_years": 1.39
    }
  }
}
```

---

## Quick Notes
- **Datetime format**: Always send **UTC ISO-8601** (e.g. `"1990-11-20T17:30:00Z"`).
- **tz_offset_hours**: Used for charting (Lagna/houses). Daśā calculation always uses **UTC** internally.
- No need for a separate API — **`/api/chart` covers both chart + Vimśottarī timeline**.
