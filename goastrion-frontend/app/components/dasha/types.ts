//goastrion-frontend/app/components/dasha/types.ts
export type Period = {
  lord: string;
  start: string;
  end: string;
  years: number;
  // optional metadata if your generator adds them (doesn't break anything)
  mdLord?: string;
  parent?: string;
};

export type DashaTimeline = {
  mahadashas: Period[];
  antardashas: Record<string, Period[]>;
};

// helpers
const normLord = (s: string): string => (s || "").trim().toLowerCase();
const ymd = (iso: string): string => (iso ? iso.slice(0, 10) : iso);

/** Normalized canonical key */
export function keyFor(md: Period): string {
  return `${normLord(md.lord)}@${ymd(md.start)}`;
}

/** Alternate legacy keys we might encounter */
export function altKeysFor(md: Period): string[] {
  const L = normLord(md.lord);
  const S = md.start;
  const Sd = ymd(md.start);
  const Ed = ymd(md.end);
  return [
    `${md.lord}@${md.start}`, // original raw
    `${md.lord}@${Sd}`,
    `${L}@${S}`,
    `${L}@${Sd}`,
    `${L}_${Sd}`,             // underscore legacy
    `${L}_${Sd}_${Ed}`,       // legacy with end
  ];
}

/** Robust AD resolver: try keys first, then range-match as fallback */
export function adsForMD(v: DashaTimeline, md: Period): Period[] {
  const map: Record<string, Period[]> = v?.antardashas ?? ({} as Record<string, Period[]>);

  // 1) direct/alt key hit
  const candidates = [keyFor(md), ...altKeysFor(md)];
  for (const k of candidates) {
    const hit = map[k];
    if (hit && hit.length) return hit;
  }

  // 2) range-based fallback (and optional strict lord via mdLord/parent)
  const ms = new Date(md.start).getTime();
  const me = new Date(md.end).getTime();
  const all: Period[] = Object.values(map).flat();

  return all.filter((ad) => {
    const s = new Date(ad.start).getTime();
    const e = new Date(ad.end).getTime();
    const inRange = s >= ms && e <= me;

    const sameLord =
      ad.mdLord
        ? normLord(ad.mdLord) === normLord(md.lord)
        : ad.parent
          ? normLord(ad.parent) === normLord(md.lord)
          : true;

    return inRange && sameLord;
  });
}

export function findCurrentPrevNextMD(
  mds: Period[],
  refDate: Date = new Date()
): { prev: number; cur: number; next: number } {
  const now = refDate.getTime();
  if (!mds || mds.length === 0) return { prev: -1, cur: -1, next: -1 };

  // If we're before the very first MD, show that MD as "next"
  const firstStart = new Date(mds[0].start).getTime();
  if (now < firstStart) {
    return { prev: -1, cur: -1, next: 0 };
  }

  // Scan for current; if not found but we're within the list, also derive prev/next
  let cur = -1;
  for (let i = 0; i < mds.length; i++) {
    const s = new Date(mds[i].start).getTime();
    const e = new Date(mds[i].end).getTime();
    if (now >= s && now < e) {
      cur = i;
      const prev = i > 0 ? i - 1 : -1;
      const next = i + 1 < mds.length ? i + 1 : -1;
      return { prev, cur, next };
    }
    // If we're between MD i-1 and i (strictly before i starts), show i as "next"
    if (now < s) {
      const prev = i - 1 >= 0 ? i - 1 : -1;
      return { prev, cur: -1, next: i };
    }
  }

  // If we're after the last MD, only prev exists
  return { prev: mds.length - 1, cur: -1, next: -1 };
}
