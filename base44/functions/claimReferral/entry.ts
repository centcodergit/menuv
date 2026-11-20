import { createClientFromRequest } from "npm:@base44/sdk@0.8.63";

/**
 * claimReferral (master prompt 3.10): attaches a stored `?ref=` code to the signed-in user's first sign-in.
 * Rules: the code must exist, it cannot be your own, an account is counted once across all referrals, and only
 * new accounts count (created within NEW_ACCOUNT_DAYS), so existing customers cannot be "referred".
 * Rewards are not set here: the team marks friends' purchases and the reward status from /admin.
 */
const CODE_RE = /^[A-Z0-9]{8}$/;
const NEW_ACCOUNT_DAYS = 7;

Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });
  try {
    const base44 = createClientFromRequest(req);
    let user;
    try {
      user = await base44.auth.me();
    } catch {
      user = null;
    }
    if (!user?.id || !user.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { code } = await req.json().catch(() => ({}));
    const normalized = typeof code === "string" ? code.trim().toUpperCase() : "";
    if (!CODE_RE.test(normalized)) return Response.json({ error: "Invalid code" }, { status: 400 });

    const created = Date.parse(user.created_date ?? "");
    if (Number.isFinite(created) && Date.now() - created > NEW_ACCOUNT_DAYS * 24 * 60 * 60 * 1000) {
      return Response.json({ ok: false, reason: "existing-account" }, { status: 409 });
    }

    const store = base44.asServiceRole.entities.Referral;
    const [referral] = (await store.filter({ code: normalized }, undefined, 1)) ?? [];
    if (!referral) return Response.json({ ok: false, reason: "unknown-code" }, { status: 404 });
    if (referral.referrer_id === user.id) return Response.json({ ok: false, reason: "own-code" }, { status: 409 });

    // One referral per account, across every referrer.
    const email = String(user.email).toLowerCase();
    const all = (await store.filter({}, undefined, 5000)) ?? [];
    const already = all.some((r: { signups?: { email?: string }[] }) =>
      (r.signups ?? []).some((s) => String(s.email ?? "").toLowerCase() === email),
    );
    if (already) return Response.json({ ok: true, reason: "already-counted" });

    const signups = [
      ...(referral.signups ?? []),
      { email, name: user.full_name ?? "", signed_up_at: new Date().toISOString(), has_purchased: false },
    ];
    await store.update(referral.id, { signups });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("claimReferral failed", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
});
