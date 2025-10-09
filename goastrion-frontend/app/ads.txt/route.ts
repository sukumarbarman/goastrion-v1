// app/ads.txt/route.ts
export async function GET() {
  const body = `google.com, ${process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
