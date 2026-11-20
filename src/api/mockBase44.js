/**
 * DEVELOPMENT-ONLY mock of the subset of the Base44 SDK this site uses (auth, entities with filter/list/
 * create/update/delete/subscribe, functions.invoke). Data lives in localStorage ("mv-mock-db") and syncs
 * across tabs with BroadcastChannel, so "admin" replies from another tab arrive live.
 * Loaded only through getBase44() when the mock flag is on in `npm run dev`.
 *
 * Mock sign-in (for /login): any email + 8+ character password ("wrong-password" fails; "admin@…" = admin),
 * register OTP code 123456, "taken@example.com" already exists.
 *
 * Console helpers: __mvMock.signIn("user" | "admin"), __mvMock.signOut(), __mvMock.adminReply("text"),
 * __mvMock.referralFriends(n), __mvMock.referralStatus("earned"), __mvMock.reset(), __mvMock.db()
 *
 * Backend functions are mocked with the same rules as base44/functions/* (getExchangeRates, getMyReferral,
 * trackReferralClick, claimReferral, subscribeNewsletter).
 */
const KEY = "mv-mock-db";
const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("mv-mock") : null;
const listeners = new Map();

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? { user: null, entities: {} };
  } catch {
    return { user: null, entities: {} };
  }
};
const save = (db) => localStorage.setItem(KEY, JSON.stringify(db));
const uid = () => (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).replace(/-/g, "").slice(0, 24);
const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

function emit(entity, event, broadcast = true) {
  listeners.get(entity)?.forEach((cb) => cb(event));
  if (broadcast) channel?.postMessage({ entity, event });
}
channel?.addEventListener("message", (e) => emit(e.data.entity, e.data.event, false));

const matches = (row, query) =>
  Object.entries(query ?? {}).every(([k, v]) => {
    const value = row[k];
    if (v && typeof v === "object" && "$in" in v) return v.$in.includes(value);
    if (v && typeof v === "object" && "$ne" in v) return value !== v.$ne;
    return value === v;
  });

function sortRows(rows, sort) {
  if (!sort) return rows;
  const desc = sort.startsWith("-");
  const field = sort.replace(/^-/, "");
  return [...rows].sort((a, b) => (a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0) * (desc ? -1 : 1));
}

function entity(name) {
  const rows = () => load().entities[name] ?? [];
  const page = (list, opts) => {
    const sorted = sortRows(list, opts?.sort).slice(0, opts?.limit ?? list.length);
    return opts ? { items: sorted, has_more: false, next_cursor: null } : sorted;
  };
  return {
    async filter(query, opts) {
      await delay();
      return page(rows().filter((r) => matches(r, query)), opts);
    },
    async list(opts) {
      await delay();
      return page(rows(), typeof opts === "string" ? { sort: opts } : opts);
    },
    async get(id) {
      await delay();
      const row = rows().find((r) => r.id === id);
      if (!row) throw Object.assign(new Error("Not found"), { status: 404 });
      return row;
    },
    async count(query) {
      return rows().filter((r) => matches(r, query)).length;
    },
    async create(data) {
      await delay();
      const db = load();
      const now = new Date().toISOString();
      const row = {
        ...data,
        id: uid(),
        created_date: now,
        updated_date: now,
        created_by_id: db.user?.id ?? null,
        created_by: db.user?.email ?? null,
      };
      db.entities[name] = [...(db.entities[name] ?? []), row];
      save(db);
      emit(name, { id: row.id, type: "create", data: row });
      return row;
    },
    async update(id, patch) {
      await delay();
      const db = load();
      const list = db.entities[name] ?? [];
      const i = list.findIndex((r) => r.id === id);
      if (i < 0) throw Object.assign(new Error("Not found"), { status: 404 });
      list[i] = { ...list[i], ...patch, updated_date: new Date().toISOString() };
      save(db);
      emit(name, { id, type: "update", data: list[i] });
      return list[i];
    },
    async delete(id) {
      const db = load();
      db.entities[name] = (db.entities[name] ?? []).filter((r) => r.id !== id);
      save(db);
      emit(name, { id, type: "delete", data: { id } });
    },
    subscribe(cb) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(cb);
      return () => listeners.get(name)?.delete(cb);
    },
  };
}

const USERS = {
  user: { id: "mock-user-1", email: "demo.user@example.com", full_name: "Demo User", role: "user" },
  admin: { id: "mock-admin-1", email: "menuverse.gr@gmail.com", full_name: "Menuverse Team", role: "admin" },
};

export const mockBase44 = {
  auth: {
    async isAuthenticated() {
      await delay(60);
      return Boolean(load().user);
    },
    async me() {
      await delay(60);
      const { user } = load();
      if (!user) throw Object.assign(new Error("Unauthorized"), { status: 401 });
      return user;
    },
    async updateMe(data) {
      const db = load();
      db.user = { ...db.user, ...data };
      save(db);
      return db.user;
    },
    /** Mock rules: any email + a password of 8+ characters signs in ("wrong-password" fails); "admin@…" signs in as admin. */
    async loginViaEmailPassword(email, password) {
      await delay(300);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || password === "wrong-password" || String(password).length < 8)
        throw Object.assign(new Error("Invalid credentials"), { status: 401, response: { status: 401 } });
      const db = load();
      db.user = email.startsWith("admin@") ? USERS.admin : { ...USERS.user, email, full_name: email.split("@")[0] };
      save(db);
      return { access_token: "mock-token", user: db.user };
    },
    /** "taken@example.com" already exists; any other email gets an OTP (the mock code is 123456). */
    async register({ email }) {
      await delay(300);
      if (email === "taken@example.com") throw Object.assign(new Error("User already exists"), { status: 409, response: { status: 409 } });
      return { ok: true };
    },
    async verifyOtp({ otpCode }) {
      await delay(250);
      if (otpCode !== "123456") throw Object.assign(new Error("Invalid code"), { status: 400, response: { status: 400 } });
      return { ok: true };
    },
    async resendOtp() {
      await delay(200);
      return { ok: true };
    },
    async resetPasswordRequest() {
      await delay(250);
      return { ok: true };
    },
    /** Provider sign-in: signs the mock user in and goes to `fromUrl`, like the real redirect round trip. */
    loginWithProvider(provider, fromUrl = "/") {
      const db = load();
      db.user = { ...USERS.user, full_name: `Demo ${provider}` };
      save(db);
      window.location.href = new URL(fromUrl, window.location.origin).toString();
    },
    redirectToLogin(next = window.location.href) {
      const db = load();
      db.user = USERS.user;
      save(db);
      window.location.href = next;
    },
    logout(redirect) {
      const db = load();
      db.user = null;
      save(db);
      if (redirect) window.location.href = redirect;
      else window.location.reload();
    },
  },
  entities: new Proxy({}, { get: (_, name) => entity(String(name)) }),
  functions: {
    async invoke(name, payload = {}) {
      await delay();
      console.info(`[mock] functions.invoke("${name}")`, payload);
      const handler = MOCK_FUNCTIONS[name];
      if (!handler) return { data: null };
      return { data: await handler(payload) };
    },
  },
};

const httpError = (status, message) => Object.assign(new Error(message), { status, response: { status } });
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const referralView = (r) => ({ code: r.code, clicks: r.clicks ?? 0, signups: (r.signups ?? []).length, reward_status: r.reward_status ?? "pending" });

/** Same contracts as base44/functions/<name>/entry.ts. */
const MOCK_FUNCTIONS = {
  async getExchangeRates() {
    // Mock "live" rates: the fallback table nudged by 1%, so a switch from fallback to live is visible.
    const { FALLBACK_RATES } = await import("@/lib/pricing");
    const rates = Object.fromEntries(Object.entries(FALLBACK_RATES).map(([k, v]) => [k, k === "JPY" ? Math.round(v * 1.01) : Math.round(v * 1.01 * 10000) / 10000]));
    return { base: "EUR", rates, fetched_at: new Date().toISOString(), source: "mock" };
  },
  async getMyReferral() {
    const { user } = load();
    if (!user) throw httpError(401, "Unauthorized");
    const store = entity("Referral");
    const [mine] = await store.filter({ referrer_id: user.id });
    if (mine) return referralView(mine);
    const code = Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
    const created = await store.create({ referrer_id: user.id, referrer_email: user.email, referrer_name: user.full_name, code, clicks: 0, signups: [], reward_status: "pending" });
    return referralView(created);
  },
  async trackReferralClick({ code }) {
    const store = entity("Referral");
    const [ref] = await store.filter({ code });
    if (!ref) throw httpError(404, "Unknown code");
    await store.update(ref.id, { clicks: (ref.clicks ?? 0) + 1 });
    return { ok: true };
  },
  async subscribeNewsletter({ email, language, source }) {
    const clean = String(email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) throw httpError(400, "Invalid email");
    const store = entity("NewsletterSubscriber");
    const [existing] = await store.filter({ email: clean });
    if (existing) return { status: "duplicate" };
    await store.create({ email: clean, language: language ?? "el", source: source ?? "homepage", consent_at: new Date().toISOString() });
    return { status: "subscribed" };
  },
  async claimReferral({ code }) {
    const { user } = load();
    if (!user) throw httpError(401, "Unauthorized");
    const store = entity("Referral");
    const [ref] = await store.filter({ code });
    if (!ref) throw httpError(404, "Unknown code");
    if (ref.referrer_id === user.id) throw httpError(409, "Own code");
    const all = await store.list();
    if (all.some((r) => (r.signups ?? []).some((s) => s.email === user.email))) return { ok: true, reason: "already-counted" };
    await store.update(ref.id, { signups: [...(ref.signups ?? []), { email: user.email, name: user.full_name, signed_up_at: new Date().toISOString(), has_purchased: false }] });
    return { ok: true };
  },
};

if (typeof window !== "undefined") {
  window.__mvMock = {
    db: load,
    reset: () => localStorage.removeItem(KEY),
    signIn: (role = "user") => {
      const db = load();
      db.user = USERS[role];
      save(db);
      window.location.reload();
    },
    signOut: () => mockBase44.auth.logout(),
    /** Adds n fake friends to the signed-in user's referral (as if they signed up with the code). */
    async referralFriends(n = 1) {
      const { user } = load();
      const [ref] = await entity("Referral").filter({ referrer_id: user?.id });
      if (!ref) return "no referral yet (open /referrals or press Ξεκινήστε first)";
      const signups = [...(ref.signups ?? [])];
      for (let i = 0; i < n; i += 1) signups.push({ email: `friend${signups.length + 1}@example.com`, name: `Friend ${signups.length + 1}`, signed_up_at: new Date().toISOString(), has_purchased: false });
      await entity("Referral").update(ref.id, { signups });
      return `${signups.length} signups`;
    },
    /** Sets the signed-in user's reward status (pending | earned | redeemed), as the team would from /admin. */
    async referralStatus(status = "earned") {
      const { user } = load();
      const [ref] = await entity("Referral").filter({ referrer_id: user?.id });
      if (!ref) return "no referral yet";
      await entity("Referral").update(ref.id, { reward_status: status });
      return status;
    },
    /** Simulates the team replying in the signed-in user's conversation (as if from /admin). */
    async adminReply(body = "Γεια σας! Πώς μπορούμε να βοηθήσουμε;") {
      const db = load();
      const conv = (db.entities.SupportConversation ?? []).find((c) => c.user_email === db.user?.email);
      if (!conv) return "no conversation yet";
      await entity("SupportMessage").create({ conversation_id: conv.id, conversation_owner_id: conv.created_by_id, sender_role: "admin", body });
      await entity("SupportConversation").update(conv.id, { unread_by_user: true, last_message_at: new Date().toISOString(), last_message_preview: body.slice(0, 200) });
      return "sent";
    },
  };
  console.info("%c[Menuverse] mock backend ON (dev only). Helpers: __mvMock", "color:#A78BFA");
}
