// app/ads-test/page.tsx (server component)
import AdSlot from "../components/AdSlot";

export default function AdsTest() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">AdSense Test</h1>

      {/* Top in-article slot (replace with your real slot ID) */}
      <AdSlot slot="YOUR_TOP_SLOT_ID" minHeight={300} />

      <p className="text-slate-300">
        Scroll a bit if you don’t see it—units push when visible.
      </p>

      {/* Another slot to test multiple */}
      <AdSlot slot="YOUR_END_SLOT_ID" minHeight={280} />
    </main>
  );
}
