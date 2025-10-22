// app/profile/page.tsx
import BirthDetailsCard from "./_components/BirthDetailsCard";
import ChartSummaryPreview from "./_components/ChartSummaryPreview";
import DailyQuickView from "./_components/DailyQuickView";
import SavedChartsPreview from "./_components/SavedChartsPreview";
import ProfileAutoSelect from "./_components/ProfileAutoSelect";

export default function ProfileOverviewPage() {
  // Auto-pick a default chart (most recent server chart if logged in,
  // else first local chart) **only if** nothing is active yet.
  return (
    <>
      <ProfileAutoSelect />
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="py-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-white">Overview</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <BirthDetailsCard />
          <DailyQuickView />
          <ChartSummaryPreview />
          <SavedChartsPreview />
        </div>
      </div>
    </>
  );
}
