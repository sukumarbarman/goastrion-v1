export type Period = { lord: string; start: string; end: string; years: number };
export type DashaTimeline = {
  mahadashas: Period[];
  antardashas: Record<string, Period[]>;
};

export function keyFor(md: Period) {
  return `${md.lord}@${md.start}`;
}

export function findCurrentPrevNextMD(mds: Period[], refDate = new Date()) {
  const now = refDate.getTime();
  let cur = -1;
  for (let i = 0; i < mds.length; i++) {
    const s = new Date(mds[i].start).getTime();
    const e = new Date(mds[i].end).getTime();
    if (now >= s && now < e) { cur = i; break; }
  }
  return {
    prev: cur > 0 ? cur - 1 : -1,
    cur,
    next: cur >= 0 && cur + 1 < mds.length ? cur + 1 : -1,
  };
}
