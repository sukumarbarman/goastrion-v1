// app/shubhdin/page.tsx
import ShubhDinResults, { ShubhDinResponse } from "../components/ShubhDinResults";

async function fetchData(): Promise<ShubhDinResponse> {
  const API =
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:8000";
  const res = await fetch(`${API}/api/v1/shubhdin/run`, {
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
    throw new Error(`ShubhDin API error: ${res.status}`);
  }
  return (await res.json()) as ShubhDinResponse;
}

export default async function Page() {
  const data = await fetchData();
  return <ShubhDinResults data={data} />;
}
