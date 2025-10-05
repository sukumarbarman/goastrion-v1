# Sade Sati — A Practical Reference

## What it is (in one line)
**Sade Sati** is when **Saturn** transits the **12th, 1st, and 2nd sidereal signs** from your **natal Moon’s sign**.

---

## Astronomy (how we define it)
- Geocentric, ecliptic **sidereal** longitudes (Lahiri).
- Signs are 30° spans (Aries 0–30°, ... Pisces 330–360°).
- Let the natal Moon’s sign index be **m** (0=Aries…11=Pisces).  
  Sade Sati days occur when Saturn’s sign index **s** is in:
  - **m−1 (12th)** → *First Dhaiyya / start*
  - **m   (1st)** → *Second Dhaiyya / peak (on Moon sign)*
  - **m+1 (2nd)** → *Third Dhaiyya / end*

---

## Why it matters (practical lens)
- Periods of **discipline, restructuring, and realism** around habits, finances, and responsibilities.
- Best used for **streamlining, paying down, renegotiating, committing** to sustainable routines.
- **Retro overlaps** → great for **audits/refactors/renegotiations**.
- **Station days** → decisions have extra weight; go slow; avoid rushed brand-new contracts.

---

## Phases & best use
1. **First Dhaiyya (12th)**: preparing/letting go → declutter, close loops, create buffers.
2. **Second Dhaiyya (1st / peak)**: gravity of duties → prioritize essentials, consistent routines.
3. **Third Dhaiyya (2nd)**: resources/values → rebuild reserves, codify boundaries.

---

## Our app’s method (transparent)
1. Compute **natal Moon** sidereal sign (m).
2. Daily: compute **Saturn** sidereal sign (s). If `s ∈ {m−1, m, m+1}`, mark as Sade Sati.
3. Merge consecutive days into windows and label: **start/peak/end**.
4. Detect **stations** (near-zero speed & direction flip) and **retrograde spans**.
5. For each window add: `moon_sign`, `saturn_sign`, `stations`, `retro_overlaps`.

---

## UI reading tips
- **Badges**
  - **Caution day(s)** → station inside window.
  - **Review/Revise** → retro overlap inside window.
  - **Clear flow** → no station/retro overlap.
- **Stations column** shows first 1–2 dates (+“+N more”).
- **Retro overlaps** show clipped date ranges.

---

## Notes
- Daily label sampled at **local noon** (stable daily marker). Ingress/edge cases: use higher-res scan if needed.
- **Ayanāṁśa**: Lahiri (sidereal).  
- Full Sade Sati ≈ **7.5 years** (with retro loops causing sub-windows).
