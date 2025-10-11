// app/vimshottari/page.tsx
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/dasha"); // canonical stays /dasha
  return null;
}
