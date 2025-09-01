import Container from "./Container";
export default function SkillSpotlight() {
  return (
    <Container>
      <h2 className="text-2xl text-white font-semibold mb-4">Skill spotlight</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {["Analytical","Communication","Leadership"].map(s => (
          <div key={s} className="p-4 border border-white/10 rounded-2xl">{s}</div>
        ))}
      </div>
    </Container>
  );
}
