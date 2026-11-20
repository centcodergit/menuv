import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as api from "@/api/admin";

const byLatest = (a, b) => ((a.last_message_at ?? a.created_date ?? "") < (b.last_message_at ?? b.created_date ?? "") ? 1 : -1);
const byDate = (a, b) => (a.created_date > b.created_date ? 1 : a.created_date < b.created_date ? -1 : 0);
const upsert = (list, row, sort) =>
  (list.some((r) => r.id === row.id) ? list.map((r) => (r.id === row.id ? { ...r, ...row } : r)) : [...list, row]).sort(sort);

/**
 * Admin inbox: every SupportConversation (newest activity first) and the selected thread's messages.
 * Realtime through Base44 subscriptions; when the SDK can't subscribe, a 5-second poll (same as the
 * customer chat). Also refreshes when the tab becomes visible again. Opening a thread while it is on
 * screen (`active`) clears its unread_by_admin flag; a new customer message in the open thread does too.
 */
export function useAdminInbox({ active }) {
  const [conversations, setConversations] = useState([]);
  const [status, setStatus] = useState("loading");
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [threadStatus, setThreadStatus] = useState("idle");
  const selectedRef = useRef(null);
  selectedRef.current = selectedId;
  const threadToken = useRef(0);

  const loadList = useCallback(async () => {
    const list = await api.listConversations();
    setConversations(list.sort(byLatest));
    setStatus("ready");
  }, []);

  const loadThread = useCallback(async (id, { quiet = false } = {}) => {
    if (!id) return;
    const token = ++threadToken.current;
    if (!quiet) setThreadStatus("loading");
    try {
      const list = await api.listThread(id);
      if (token !== threadToken.current) return;
      setMessages(list.sort(byDate));
      setThreadStatus("ready");
    } catch {
      if (token === threadToken.current && !quiet) setThreadStatus("error");
    }
  }, []);

  const retry = useCallback(() => {
    setStatus("loading");
    loadList().catch(() => setStatus("error"));
  }, [loadList]);

  // First load, realtime, polling fallback, refresh on return to the tab.
  useEffect(() => {
    let cancelled = false;
    let poll = 0;
    const offs = [];
    const refresh = () => {
      loadList().catch(() => {});
      if (selectedRef.current) loadThread(selectedRef.current, { quiet: true });
    };

    (async () => {
      try {
        await loadList();
      } catch {
        if (!cancelled) setStatus("error");
      }
      const offConv = await api.subscribe("SupportConversation", (event) => {
        if (event?.type === "delete") setConversations((list) => list.filter((c) => c.id !== event.id));
        else if (event?.data?.id) setConversations((list) => upsert(list, event.data, byLatest));
      });
      const offMsg = await api.subscribe("SupportMessage", (event) => {
        const row = event?.data;
        if (event?.type === "delete") setMessages((list) => list.filter((m) => m.id !== event.id));
        else if (row?.id && row.conversation_id === selectedRef.current) setMessages((list) => upsert(list, row, byDate));
      });
      if (cancelled) {
        offConv?.();
        offMsg?.();
        return;
      }
      offs.push(offConv, offMsg);
      if (!offConv || !offMsg) poll = window.setInterval(refresh, 5000);
    })();

    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      offs.forEach((off) => off?.());
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadList, loadThread]);

  // Thread for the selected conversation.
  useEffect(() => {
    setMessages([]);
    if (!selectedId) {
      setThreadStatus("idle");
      return;
    }
    loadThread(selectedId);
  }, [selectedId, loadThread]);

  const selected = useMemo(() => conversations.find((c) => c.id === selectedId) ?? null, [conversations, selectedId]);

  // Reading the thread clears the admin's unread flag.
  const marking = useRef(null);
  useEffect(() => {
    if (!active || !selected?.unread_by_admin || marking.current === selected.id) return;
    if (document.visibilityState === "hidden") return;
    const id = selected.id;
    marking.current = id;
    setConversations((list) => list.map((c) => (c.id === id ? { ...c, unread_by_admin: false } : c)));
    api
      .updateConversation(id, { unread_by_admin: false })
      .catch(() => {})
      .finally(() => {
        marking.current = null;
      });
  }, [active, selected]);

  const send = useCallback(
    async (body) => {
      const text = body.trim();
      const conv = conversations.find((c) => c.id === selectedRef.current);
      if (!text || !conv) return false;
      const { message, conversation } = await api.sendAdminReply(conv, text);
      if (message.conversation_id === selectedRef.current) setMessages((list) => upsert(list, message, byDate));
      setConversations((list) => upsert(list, conversation, byLatest));
      return true;
    },
    [conversations],
  );

  const setConversationStatus = useCallback(async (id, next) => {
    let previous;
    setConversations((list) =>
      list.map((c) => {
        if (c.id !== id) return c;
        previous = c.status;
        return { ...c, status: next };
      }),
    );
    try {
      const row = await api.updateConversation(id, { status: next });
      if (row?.id) setConversations((list) => upsert(list, row, byLatest));
    } catch (err) {
      setConversations((list) => list.map((c) => (c.id === id ? { ...c, status: previous } : c)));
      throw err;
    }
  }, []);

  const unreadCount = conversations.filter((c) => c.unread_by_admin).length;

  return {
    conversations,
    status,
    retry,
    selected,
    selectedId,
    select: setSelectedId,
    messages,
    threadStatus,
    retryThread: () => loadThread(selectedRef.current),
    send,
    setConversationStatus,
    unreadCount,
  };
}
