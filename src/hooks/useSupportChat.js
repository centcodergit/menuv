import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import * as api from "@/api/supportChat";

const byDate = (a, b) => (a.created_date > b.created_date ? 1 : a.created_date < b.created_date ? -1 : 0);
const upsert = (list, row) => (list.some((m) => m.id === row.id) ? list.map((m) => (m.id === row.id ? row : m)) : [...list, row].sort(byDate));

/**
 * The signed-in customer's support conversation: messages (realtime, 5s polling fallback),
 * unread count (team replies newer than the last time this device read the thread), send().
 * The conversation is created on the first message, not on opening the chat.
 */
export function useSupportChat({ open, lang }) {
  const { user, isAuthenticated } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("idle");
  const [readAt, setReadAtState] = useState("");
  const convRef = useRef(null);
  convRef.current = conversation;

  const refresh = useCallback(async () => {
    const conv = convRef.current;
    if (!conv) return;
    const list = await api.listMessages(conv.id);
    setMessages(list.sort(byDate));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setConversation(null);
      setMessages([]);
      setStatus("idle");
      return undefined;
    }
    let cancelled = false;
    let unsubscribe = null;
    let poll = 0;

    (async () => {
      setStatus("loading");
      try {
        const conv = await api.getConversation(user);
        if (cancelled) return;
        setConversation(conv);
        convRef.current = conv;
        if (conv) {
          setReadAtState(api.getReadAt(conv.id));
          setMessages((await api.listMessages(conv.id)).sort(byDate));
        }
        setStatus("ready");
        unsubscribe = await api.subscribeMessages((event) => {
          const row = event?.data;
          if (!row || row.conversation_id !== convRef.current?.id) return;
          if (event.type === "delete") setMessages((list) => list.filter((m) => m.id !== event.id));
          else setMessages((list) => upsert(list, row));
          if (event.type === "create" && row.sender_role === "admin") {
            setConversation((c) => (c ? { ...c, unread_by_user: true } : c));
          }
        });
      } catch {
        if (!cancelled) setStatus("error");
      }
      if (!unsubscribe && !cancelled) poll = window.setInterval(() => refresh().catch(() => {}), 5000);
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
      window.clearInterval(poll);
    };
  }, [isAuthenticated, user, refresh]);

  // Reading the thread while the panel is open marks it read (this device + the admin's flag).
  useEffect(() => {
    if (!open || !conversation) return;
    const latest = messages.at(-1)?.created_date ?? new Date().toISOString();
    api.setReadAt(conversation.id, latest);
    setReadAtState(latest);
    if (conversation.unread_by_user) {
      api.markReadByUser(conversation).catch(() => {});
      setConversation((c) => (c ? { ...c, unread_by_user: false } : c));
    }
  }, [open, conversation, messages]);

  const unread = messages.filter((m) => m.sender_role === "admin" && m.created_date > readAt).length;

  const send = useCallback(
    async (body) => {
      const text = body.trim();
      if (!text || !user) return false;
      let conv = convRef.current;
      if (!conv) {
        conv = await api.createConversation(user, lang);
        convRef.current = conv;
        setConversation(conv);
      }
      const message = await api.sendMessage({ conversation: conv, user, body: text });
      setMessages((list) => upsert(list, message));
      setConversation((c) => (c ? { ...c, unread_by_admin: true } : c));
      return true;
    },
    [user, lang],
  );

  return { user, isAuthenticated, conversation, messages, status, unread, send };
}
