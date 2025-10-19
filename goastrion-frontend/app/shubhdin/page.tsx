// app/shubhdin/page.tsx

import Container from "@/app/components/Container";
import ShubhDinClient from "./ShubhDinClient";

export default function Page() {
  return (
    <Container>
      <div className="p-4 md:p-6">
        <ShubhDinClient />
      </div>
    </Container>
  );
}
