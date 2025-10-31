// app/profile/layout.tsx
import Container from "@/app/components/Container";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      {/* Page Heading */}
      <div className="py-4 md:py-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          Profile
        </h1>
      </div>

      {/* Main Content */}
      <main
        className="
          mx-auto
          w-full
          max-w-5xl
          rounded-2xl
          border border-white/10
          bg-black/20
          p-4 sm:p-6 md:p-8
        "
      >
        {children}
      </main>
    </Container>
  );
}
