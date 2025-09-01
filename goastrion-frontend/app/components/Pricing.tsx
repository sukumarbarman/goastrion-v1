import Container from "./Container";
export default function Pricing() {
  return (
    <Container>
      <h2 className="text-2xl text-white font-semibold mb-4">Simple pricing</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-6 border border-white/10 rounded-2xl">Free plan</div>
        <div className="p-6 border border-white/10 rounded-2xl">Pro plan</div>
      </div>
    </Container>
  );
}
