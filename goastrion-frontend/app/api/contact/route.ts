
// ================================================
// app/api/contact/route.ts  (Forwarder → backend or webhook)
// ================================================
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ContactKind = "general" | "feedback" | "bug" | "feature";

interface ContactBody {
  kind?: ContactKind;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  path?: string;
}

interface ForwardPayload {
  kind: ContactKind;
  name: string;
  email: string;
  subject: string;
  message: string;
  path: string;
  userAgent: string;
  ts: string;
}

function getBackendBase(): string {
  const raw = process.env.BACKEND_URL || "http://127.0.0.1:8001";
  return raw.replace(/\/+$/, "");
}

export async function POST(req: Request) {
  try {
    const raw = (await req.json()) as ContactBody;

    const kind: ContactKind = raw.kind ?? "general";
    const name = raw.name?.trim() ?? "";
    const email = (raw.email ?? "").trim();
    const subject = (raw.subject ?? "").trim();
    const message = (raw.message ?? "").trim();
    const path = (raw.path ?? "").trim();

    if (!email || !message) {
      return new Response(JSON.stringify({ error: "Email and message are required." }), { status: 400 });
    }

    const payload: ForwardPayload = {
      kind,
      name,
      email,
      subject: subject || defaultSubject(kind),
      message,
      path,
      userAgent: req.headers.get("user-agent") || "",
      ts: new Date().toISOString(),
    };

    const webhook = process.env.CONTACT_FORWARD_URL;
    const bearer = process.env.CONTACT_FORWARD_BEARER;

    if (webhook) {
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), 8000);
      try {
        const r = await fetch(webhook, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
          },
          body: JSON.stringify(payload),
          signal: ac.signal,
        });
        clearTimeout(timer);
        if (!r.ok) throw new Error(`Forward failed: ${r.status}`);
      } catch {
        // Fall back to backend if webhook fails
        await forwardToBackend(payload);
      }
    } else {
      // Otherwise forward to Django if reachable
      await forwardToBackend(payload);
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unhandled error";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}

function defaultSubject(k: ContactKind) {
  switch (k) {
    case "feedback": return "Product feedback";
    case "bug": return "Bug report";
    case "feature": return "Feature request";
    default: return "General inquiry";
  }
}

async function forwardToBackend(payload: ForwardPayload): Promise<void> {
  const url = `${getBackendBase()}/api/contact/submit`;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ac.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      // Log for observability; do not crash user.
      console.warn("/api/contact: backend forward failed", res.status);
    }
  } catch (e) {
    console.warn("/api/contact: backend forward exception", e);
  }
}
