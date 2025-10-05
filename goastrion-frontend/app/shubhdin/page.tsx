// app/shubhdin/page.tsx
import ShubhDinResults, { ShubhDinResponse } from "../components/ShubhDinResults";

export const dynamic = "force-dynamic";

async function fetchData(): Promise<ShubhDinResponse> {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  if (!origin) throw new Error("Missing NEXT_PUBLIC_SITE_URL");

  const res = await fetch(`${origin}/api/shubhdin`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      datetime: "1990-11-20T17:30:00Z",
      lat: 22.3,
      lon: 87.92,
      tz: "Asia/Kolkata",
      horizon_months: 18,
    }),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ShubhDin proxy error: ${res.status} ${text}`);
  }
  return (await res.json()) as ShubhDinResponse;
}

export default async function Page() {
  const data = await fetchData();
  return <ShubhDinResults data={data} />;
}
