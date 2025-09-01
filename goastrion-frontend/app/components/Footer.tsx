import Container from "./Container";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 py-10">
      <Container>
        <div className="grid md:grid-cols-4 gap-6 text-sm text-slate-300">
          <div>
            <div className="text-white font-semibold">GoAstrion</div>
            <div className="text-slate-400 text-xs mt-2">
              © {new Date().getFullYear()} GoAstrion. All rights reserved.
            </div>
          </div>

          <div>
            <div className="text-white font-semibold">Product</div>
            <ul className="mt-2 space-y-1 text-slate-400">
              <li>Skills</li>
              <li>Pricing</li>
              <li>Guides</li>
            </ul>
          </div>

          <div>
            <div className="text-white font-semibold">Company</div>
            <ul className="mt-2 space-y-1 text-slate-400">
              <li>About</li>
              <li>Contact</li>
              <li>Privacy</li>
            </ul>
          </div>

          <div>
            <div className="text-white font-semibold">Language</div>
            <div className="mt-2 flex items-center gap-2 text-slate-400">
              <span className="px-2 py-1 rounded-full border border-white/10">EN</span>
              <span className="px-2 py-1 rounded-full border border-white/10">HI</span>
              <span className="px-2 py-1 rounded-full border border-white/10">BN</span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
