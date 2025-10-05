// app/shubhdin/page.tsx
import ShubhDinResults, { ShubhDinResponse } from "../components/ShubhDinResults";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function fetchData(): Promise<ShubhDinResponse> {
  // Build a safe absolute URL for server-side fetch
  const hdrs = await headers();
  const origin =
    hdrs.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

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
  });

  if (!res.ok) {
    throw new Error(`ShubhDin proxy error: ${res.status}`);
  }
  return (await res.json()) as ShubhDinResponse;
}

export default async function Page() {
  const data = await fetchData();
  return <ShubhDinResults data={data} />;
}
