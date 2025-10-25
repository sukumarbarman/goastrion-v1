// ================================================
// app/contact/page.tsx
// ================================================
import Container from "../components/Container";
import ContactForm from "../components/ContactForm";

export const metadata = {
  title: "Contact Us | GoAstrion",
};

export default function ContactPage() {
  return (
    <Container>
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-cyan-300">Contact Us</h1>
        <p className="text-slate-300 mt-2">
          Have a question, suggestion, or found a bug? Send us a quick note below.
        </p>
        <div className="mt-6">
          <ContactForm />
        </div>
      </div>
    </Container>
  );
}