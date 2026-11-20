import { createClientFromRequest } from "npm:@base44/sdk@0.8.63";

/**
 * trackReferralClick (master prompt 3.10): counts one visit through `?ref=CODE`. Public (anonymous visitors
 * arrive through shared links). The site calls it at most once per code per browser; the count is a guide for
 * the referrer, not something rewards depend on.
 */
const CODE_RE = /^[A-Z0-9]{8}$/;

Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });
  try {
    const { code } = await req.json().catch(() => ({}));
    const normalized = typeof code === "string" ? code.trim().toUpperCase() : "";
    if (!CODE_RE.test(normalized)) return Response.json({ error: "Invalid code" }, { status: 400 });

    const base44 = createClientFromRequest(req);
    const store = base44.asServiceRole.entities.Referral;
    const [referral] = (await store.filter({ code: normalized }, undefined, 1)) ?? [];
    if (!referral) return Response.json({ ok: false }, { status: 404 });

    await store.update(referral.id, { clicks: Number(referral.clicks ?? 0) + 1 });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("trackReferralClick failed", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
});
