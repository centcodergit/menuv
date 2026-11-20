import { createClientFromRequest } from "npm:@base44/sdk@0.8.63";

/**
 * getMyReferral (master prompt 3.10 / 8.3): returns the signed-in user's referral, creating it on first call
 * with a unique 8-character code. Writes use the service role because the Referral entity is read-own /
 * write-admin, which keeps codes unique and counts tamper-proof.
 * Response: { code, clicks, signups, reward_status } (signups is a count; friends' emails stay private).
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I: codes get read aloud and typed

function newCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

const view = (r: Record<string, unknown>) => ({
  code: r.code,
  clicks: Number(r.clicks ?? 0),
  signups: Array.isArray(r.signups) ? r.signups.length : 0,
  reward_status: r.reward_status ?? "pending",
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user;
    try {
      user = await base44.auth.me();
    } catch {
      user = null;
    }
    if (!user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const store = base44.asServiceRole.entities.Referral;
    const existing = await store.filter({ referrer_id: user.id }, "created_date", 1);
    if (existing?.[0]) return Response.json(view(existing[0]));

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const code = newCode();
      const clash = await store.filter({ code }, undefined, 1);
      if (clash?.length) continue;
      const created = await store.create({
        referrer_id: user.id,
        referrer_email: user.email,
        referrer_name: user.full_name ?? "",
        code,
        clicks: 0,
        signups: [],
        reward_status: "pending",
      });
      return Response.json(view(created));
    }
    return Response.json({ error: "Could not allocate a code" }, { status: 503 });
  } catch (error) {
    console.error("getMyReferral failed", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
});
