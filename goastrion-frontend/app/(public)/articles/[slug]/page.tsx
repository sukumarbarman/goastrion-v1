// app/(public)/articles/[slug]/page.tsx
import AdSlot from "../../../components/AdSlot";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// ---- Replace this with your real data loader (CMS/API/MDX, etc.)
type Article = {
  slug: string;
  title: string;
  description?: string;
  coverImage?: string;
  html?: string; // or use MDX
  publishedAt?: string;
  updatedAt?: string;
  author?: { name: string };
};

async function fetchArticle(slug: string): Promise<Article | null> {
  // Example: from your backend
  // const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/articles/${slug}`, { cache: "force-cache" });
  // if (!res.ok) return null;
  // return (await res.json()) as Article;

  // TEMP stub so the page compiles:
  if (slug === "example") {
    return {
      slug,
      title: "How Next 2 yrs plan help Your Career",
      description:
        "Understand auspicious-day windows and how to plan interviews, offers, and transitions.",
      html: `<p>Intro content…</p><p>More detailed content…</p><p>Conclusion…</p>`,
      publishedAt: "2025-10-01",
      author: { name: "GoAstrion" },
    };
  }
  return null;
}

// ---- SEO
export async function generateMetadata({
  params,
}: {
  // NOTE: Next 15 may type `params` as a Promise — await it:
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  if (!article) return {};

  const title = article.title ?? "Article";
  const description =
    article.description ??
    "Read insights on Vedic timing, ShubhDin, Saturn phases, and career planning.";
  const canonical = `/articles/${article.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      siteName: "GoAstrion",
      images: [
        {
          url: "/og/og-default.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/og-default.jpg"],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  // NOTE: same here — await the params
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  if (!article) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 md:px-6 py-8 space-y-8">
      {/* Title + meta */}
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {article.title}
        </h1>
        {article.description && (
          <p className="text-slate-400">{article.description}</p>
        )}
        {article.publishedAt && (
          <p className="text-xs text-slate-500">
            Published {new Date(article.publishedAt).toLocaleDateString()}
          </p>
        )}
      </header>

      {/* Ad: after title (above-the-fold, keep only 1 here) */}
      <AdSlot slot="YOUR_TOP_IN_ARTICLE_SLOT_ID" minHeight={280} />

      {/* Article body */}
      <article
        className="prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:scroll-mt-20"
        dangerouslySetInnerHTML={{ __html: article.html ?? "" }}
      />

      {/* Ad: mid-article (safe second placement) */}
      <AdSlot slot="YOUR_MID_IN_ARTICLE_SLOT_ID" minHeight={250} />

      {/* Related / Footer area */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Related reads</h2>
        <ul className="list-disc list-inside text-slate-300">
          <li>ShubhDin: Job Change Windows</li>
          <li>Saturn Phases & Career Timing</li>
          <li>Beginner’s Guide to Vimśottarī Daśā</li>
        </ul>
      </section>

      {/* Ad: end-of-article (below content) */}
      <AdSlot slot="YOUR_END_OF_ARTICLE_SLOT_ID" minHeight={250} />
    </main>
  );
}
