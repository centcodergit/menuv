import { getBase44 } from "@/api/getBase44";

/**
 * Support chat data layer (master prompt 3.6 / 3.13). One SupportConversation per user; SupportMessage
 * records; realtime through Base44 subscriptions with a 5-second polling fallback (in useSupportChat).
 * Access rules live in base44/entities (customers only ever see their own conversation and messages).
 */
const items = (res) => (Array.isArray(res) ? res : (res?.items ?? []));

export async function getConversation(user) {
  const b = await getBase44();
  const res = await b.entities.SupportConversation.filter({ user_email: user.email }, { sort: "-created_date", limit: 1 });
  return items(res)[0] ?? null;
}

export async function createConversation(user, language) {
  const b = await getBase44();
  return b.entities.SupportConversation.create({
    user_email: user.email,
    user_name: user.full_name ?? "",
    status: "open",
    last_message_at: new Date().toISOString(),
    unread_by_admin: false,
    unread_by_user: false,
    language,
  });
}

export async function listMessages(conversationId) {
  const b = await getBase44();
  const res = await b.entities.SupportMessage.filter({ conversation_id: conversationId }, { sort: "created_date", limit: 200 });
  return items(res);
}

export async function sendMessage({ conversation, user, body }) {
  const b = await getBase44();
  const message = await b.entities.SupportMessage.create({
    conversation_id: conversation.id,
    conversation_owner_id: user.id,
    sender_role: "user",
    body,
  });
  await b.entities.SupportConversation.update(conversation.id, {
    status: "open",
    last_message_at: message.created_date ?? new Date().toISOString(),
    last_message_preview: body.slice(0, 200),
    unread_by_admin: true,
  });
  return message;
}

export async function markReadByUser(conversation) {
  if (!conversation?.unread_by_user) return;
  const b = await getBase44();
  await b.entities.SupportConversation.update(conversation.id, { unread_by_user: false });
}

/** Realtime: calls onEvent({ id, type, data }) for every SupportMessage change visible to the user. */
export async function subscribeMessages(onEvent) {
  const b = await getBase44();
  if (typeof b.entities.SupportMessage.subscribe !== "function") return null;
  try {
    return b.entities.SupportMessage.subscribe(onEvent);
  } catch {
    return null;
  }
}

// When the customer last read their conversation (per device), for the unread count.
const readKey = (id) => `mv-chat-read-${id}`;
export const getReadAt = (id) => {
  try {
    return localStorage.getItem(readKey(id)) ?? "";
  } catch {
    return "";
  }
};
export const setReadAt = (id, iso = new Date().toISOString()) => {
  try {
    localStorage.setItem(readKey(id), iso);
  } catch {
    /* storage unavailable */
  }
};
