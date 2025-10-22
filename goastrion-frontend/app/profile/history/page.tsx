//goastrion-frontend/app/profile/history/page.tsx
"use client";

import Container from "@/app/components/Container";
import { useI18n } from "@/app/lib/i18n";
import { clear, list } from "@/app/lib/history";

type HistoryItem = ReturnType<typeof list>[number];
type Buckets = Record<"Today" | "Yesterday" | "Earlier", HistoryItem[]>;

function group(items: HistoryItem[]): Buckets {
  const today = new Date();
  const yday = new Date();
  yday.setDate(today.getDate() - 1);

  const isSameDate = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const buckets: Buckets = { Today: [], Yesterday: [], Earlier: [] };

  for (const it of items) {
    const d = new Date(it.ts);
    if (isSameDate(d, today)) buckets.Today.push(it);
    else if (isSameDate(d, yday)) buckets.Yesterday.push(it);
    else buckets.Earlier.push(it);
  }
  return buckets;
}

export default function HistoryPage() {
  const { tOr } = useI18n();
  const items = list();
  const buckets = group(items);

  return (
    <Container>
      <div className="py-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          {tOr("history.title", "Recent activity")}
        </h1>
        {items.length ? (
          <button
            onClick={() => {
              if (confirm(tOr("history.clear.confirm", "Clear your local history?"))) {
                clear();
                // Safe on client; we're in a client component
                window.location.reload();
              }
            }}
            className="text-sm rounded-full border border-white/10 px-3 py-1.5 text-slate-200 hover:border-white/20"
          >
            {tOr("history.clear", "Clear history")}
          </button>
        ) : null}
      </div>

      {!items.length ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-slate-400">
          {tOr("history.empty", "No recent activity yet")}
        </div>
      ) : (
        <div className="space-y-6">
          {(["Today", "Yesterday", "Earlier"] as const).map((k) =>
            buckets[k].length ? (
              <section key={k} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-white font-semibold mb-2">
                  {tOr(`history.group.${k.toLowerCase()}`, k)}
                </div>
                <ul className="text-sm divide-y divide-white/5">
                  {buckets[k].map((x) => (
                    <li key={x.id} className="py-2 flex items-center justify-between gap-3">
                      <span className="text-slate-200">{x.title}</span>
                      <span className="text-slate-400 text-xs">
                        {new Date(x.ts).toLocaleTimeString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null
          )}
        </div>
      )}
    </Container>
  );
}
