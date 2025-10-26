// goastrion-frontend/app/shubhdin/page.tsx
import Container from "@/app/components/Container";
import ShubhDinClient from "./ShubhDinClient";
import { Suspense } from "react";

export default function Page() {
  return (
    <Container>
      <div className="px-4 md:px-6 pt-6">
        <Suspense fallback={<div className="text-slate-300">Loading…</div>}>
          <ShubhDinClient showTitle />
        </Suspense>
      </div>
    </Container>
  );
}
