// app/profile/layout.tsx
import Container from "@/app/components/Container";
import ProfileNav from "./ProfileNav";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      <div className="py-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          Profile
        </h1>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <ProfileNav />
        </aside>

        {/* Main */}
        <main className="min-w-0">
          {children}
        </main>
      </div>
    </Container>
  );
}
