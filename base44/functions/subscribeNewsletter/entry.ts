import { createClientFromRequest } from "npm:@base44/sdk@0.8.63";

/**
 * subscribeNewsletter (master prompt 3.8): public. Saves one NewsletterSubscriber per email (lower-cased) with the
 * language, source and consent time. The entity is admin-only, so the list never leaks to visitors; this function
 * writes with the service role and is the only way in.
 * Response: { status: "subscribed" | "duplicate" } (both 200), 400 for an invalid email.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LANGS = ["el", "en", "de", "fr", "es", "it", "pt", "nl"];

Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }
    const language = LANGS.includes(body.language) ? body.language : "el";
    const source = typeof body.source === "string" ? body.source.slice(0, 40) : "homepage";

    const base44 = createClientFromRequest(req);
    const store = base44.asServiceRole.entities.NewsletterSubscriber;
    const existing = await store.filter({ email }, undefined, 1);
    if (existing?.length) return Response.json({ status: "duplicate" });

    await store.create({ email, language, source, consent_at: new Date().toISOString() });
    return Response.json({ status: "subscribed" });
  } catch (error) {
    console.error("subscribeNewsletter failed", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
});
