// app/components/DomainsTeaser.tsx
"use client";

import Link from "next/link";
import Container from "./Container";
import { useI18n } from "../lib/i18n";

export default function DomainsTeaser() {
  const { t } = useI18n();
  const tf = (k: string, fb: string) => (t(k) === k ? fb : t(k));

  return (
    <section className="py-10">
      <Container>
        <div className="rounded-2xl border border-white/10 bg-[#11162A] p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 text-slate-200 px-3 py-1 text-xs font-medium">
              {tf("home.domains.badge", "Life Wheel")}
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold text-white">
              {tf("home.domains.title", "See where to focus first")}
            </h2>
          </div>

          <p className="mt-2 text-slate-300 max-w-3xl">
            {tf(
              "home.domains.sub",
              "Your Life Wheel highlights Career, Finance, Marriage, and Health from house strengths and planetary aspects—so you know where small efforts pay off big."
            )}
          </p>

          <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-slate-300">
            <li className="rounded-lg bg-black/20 border border-white/10 p-3">
              <b>{tf("home.domains.career", "Career")}</b>
              <div className="text-slate-400 mt-1">{tf("home.domains.careerSub", "strengths & learning path")}</div>
            </li>
            <li className="rounded-lg bg-black/20 border border-white/10 p-3">
              <b>{tf("home.domains.finance", "Finance")}</b>
              <div className="text-slate-400 mt-1">{tf("home.domains.financeSub", "habits & money decisions")}</div>
            </li>
            <li className="rounded-lg bg-black/20 border border-white/10 p-3">
              <b>{tf("home.domains.marriage", "Marriage")}</b>
              <div className="text-slate-400 mt-1">{tf("home.domains.marriageSub", "compatibility patterns")}</div>
            </li>
            <li className="rounded-lg bg-black/20 border border-white/10 p-3">
              <b>{tf("home.domains.health", "Health")}</b>
              <div className="text-slate-400 mt-1">{tf("home.domains.healthSub", "sustainable routines")}</div>
            </li>
          </ul>

          <div className="mt-5">
            <Link
              href="/domains"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-400/60 bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            >
              ✨ {tf("home.domains.cta", "Explore Life Wheel")}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
