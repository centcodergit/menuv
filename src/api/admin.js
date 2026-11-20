import { getBase44 } from "@/api/getBase44";

/**
 * Admin data layer (/admin, master prompt 8.4). Every call runs as the signed-in admin; RLS in
 * base44/entities gives the admin role read/update on all rows. Lists are read page by page
 * (cursor pagination) so the inbox and tables are complete, up to MAX_ROWS per entity.
 */
const PAGE = 500;
const MAX_ROWS = 5000;

const items = (res) => (Array.isArray(res) ? res : (res?.items ?? []));

async function readAll(entity, query, sort) {
  const b = await getBase44();
  const handler = b.entities[entity];
  const rows = [];
  let cursor;
  do {
    const opts = { sort, limit: PAGE, ...(cursor ? { cursor } : {}) };
    const res = query ? await handler.filter(query, opts) : await handler.list(opts);
    rows.push(...items(res));
    cursor = !Array.isArray(res) && res?.has_more ? res.next_cursor : null;
  } while (cursor && rows.length < MAX_ROWS);
  return rows;
}

/* ---------- Inbox ---------- */

export const listConversations = () => readAll("SupportConversation", null, "-last_message_at");

export const listThread = (conversationId) => readAll("SupportMessage", { conversation_id: conversationId }, "created_date");

/** Admin reply: the message (owned by the customer's conversation so they can read it), then the conversation flags. */
export async function sendAdminReply(conversation, body) {
  const b = await getBase44();
  const message = await b.entities.SupportMessage.create({
    conversation_id: conversation.id,
    conversation_owner_id: conversation.created_by_id,
    sender_role: "admin",
    body,
  });
  const patch = {
    unread_by_user: true,
    unread_by_admin: false,
    last_message_at: message.created_date ?? new Date().toISOString(),
    last_message_preview: body.slice(0, 200),
    status: "open",
  };
  const updated = await b.entities.SupportConversation.update(conversation.id, patch);
  return { message, conversation: updated ?? { ...conversation, ...patch } };
}

export async function updateConversation(id, patch) {
  const b = await getBase44();
  return b.entities.SupportConversation.update(id, patch);
}

/* ---------- Tables ---------- */

export const listFeedback = () => readAll("Feedback", null, "-created_date");
export const listSubscribers = () => readAll("NewsletterSubscriber", null, "-created_date");
export const listReferrals = () => readAll("Referral", null, "-created_date");

export async function updateReferral(id, patch) {
  const b = await getBase44();
  return b.entities.Referral.update(id, patch);
}

/** Realtime: onEvent({ id, type, data }) for every change of `entity`. Resolves to an unsubscribe function, or null. */
export async function subscribe(entity, onEvent) {
  const b = await getBase44();
  const handler = b.entities[entity];
  if (typeof handler?.subscribe !== "function") return null;
  try {
    const off = handler.subscribe(onEvent);
    return typeof off === "function" ? off : null;
  } catch {
    return null;
  }
}
