import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {MessageModel} from "../../Models/Conversation/message.model.ts";
import {getConversationMessages} from "../../services/conversationService.ts";
import {useUserStore} from "../../store/userStore.ts";
import {useConversationStore} from "../../store/conversationStore.ts";
import {getProfilePictureUrlByUserId} from "../../services/userService.ts";

type ChatWindowProps = {
    conversationId: string;
    title?: string;
};

export default function ChatWindow({conversationId, title}: ChatWindowProps) {
    const currentUserId = useUserStore((s) => s.user?.id ?? "");
    const convUsers = useConversationStore((s) => s.users);
    const conversation = useConversationStore((s) => s.conversations.find(c => c.id === conversationId));

    const [messages, setMessages] = useState<MessageModel[]>([]);
    const [batch, setBatch] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const initialLoadedRef = useRef(false);

    const userById = useCallback((id: string) => convUsers.find((u) => u.id === id), [convUsers]);

    const sortAsc = (list: MessageModel[]) =>
        [...list].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

    const loadBatch = useCallback(async (b: number, {prepend}: { prepend: boolean }) => {
        setIsLoading(true);
        setError(null);
        try {
            const dataRaw = await getConversationMessages(conversationId, b);
            const data = sortAsc(dataRaw ?? []);
            if (!data || data.length === 0) {
                setHasMore(false);
                return;
            }

            if (prepend) {
                const container = containerRef.current;
                const prevHeight = container ? container.scrollHeight : 0;
                setMessages((prev) => {
                    const existing = new Set(prev.map(m => m.id));
                    const incoming = data.filter(m => !existing.has(m.id));
                    return [...incoming, ...prev];
                });
                requestAnimationFrame(() => {
                    if (container) {
                        const newHeight = container.scrollHeight;
                        container.scrollTop = newHeight - prevHeight;
                    }
                });
            } else {
                setMessages(data);
                requestAnimationFrame(() => {
                    const el = containerRef.current;
                    if (el) {
                        el.scrollTop = el.scrollHeight;
                    }
                });
            }
            setBatch(b);
        } catch (e: any) {
            setError(e?.message ?? "Failed to load messages");
        } finally {
            setIsLoading(false);
        }
    }, [conversationId]);

    useEffect(() => {
        // Reset when conversation changes
        setMessages([]);
        setBatch(1);
        setHasMore(true);
        setError(null);
        initialLoadedRef.current = false;
    }, [conversationId]);

    useEffect(() => {
        if (!initialLoadedRef.current && hasMore && !isLoading) {
            initialLoadedRef.current = true;
            loadBatch(1, {prepend: false});
        }
    }, [hasMore, isLoading, loadBatch]);

    const onScroll = useCallback(() => {
        const el = containerRef.current;
        if (!el || isLoading || !hasMore) return;
        if (el.scrollTop <= 0) {
            const next = batch + 1;
            loadBatch(next, {prepend: true});
        }
    }, [batch, hasMore, isLoading, loadBatch]);

    const rendered = useMemo(() => messages.map((m) => {
        const mine = m.senderId === currentUserId;
        const user = userById(m.senderId);
        const displayName = user?.displayName ?? `User ${m.senderId.slice(0, 6)}`;
        const avatarUrl = getProfilePictureUrlByUserId(m.senderId);
        const time = new Date(m.sentAt);
        const timeStr = time.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});

        return (
            <div key={m.id} className={`flex items-end gap-3 ${mine ? "justify-end" : "justify-start"}`}>
                {!mine && (
                    <img src={avatarUrl} alt={displayName}
                         className="h-8 w-8 rounded-full object-cover border border-gray-200"/>
                )}
                <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 shadow-sm ${mine ? "bg-indigo-600 text-white" : "bg-white text-gray-900 border border-gray-200"}`}>
                    <div className="flex items-baseline gap-2">
                        {!mine && <span className="text-xs font-semibold text-gray-700">{displayName}</span>}
                        <span className={`text-[10px] ${mine ? "text-indigo-100" : "text-gray-400"}`}>{timeStr}</span>
                    </div>
                    {m.body && (
                        <div className="mt-0.5 whitespace-pre-wrap break-words text-sm">{m.body}</div>
                    )}
                    {m.attachmentHash && (
                        <div
                            className="mt-2 text-xs italic opacity-80">Attachment: {m.attachmentHash.slice(0, 10)}…</div>
                    )}
                </div>
                {mine && (
                    <img src={avatarUrl} alt="You"
                         className="h-8 w-8 rounded-full object-cover border border-gray-200"/>
                )}
            </div>
        );
    }), [messages, currentUserId, userById]);

    const participants = useMemo(() => {
        const ids = conversation?.participantIds ?? [];
        return ids.map(id => ({id, user: userById(id)}));
    }, [conversation, userById]);

    return (
        <div className="flex h-full w-full">
            <div className="flex-1 flex flex-col bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">

                <div className="px-4 py-3 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold">{title ?? "Conversation"}</div>
                            <div className="text-xs text-gray-500">{messages.length} messages</div>
                        </div>
                        <div className="flex -space-x-2 overflow-hidden">
                            {participants.slice(0, 5).map(p => (
                                <img key={p.id} src={getProfilePictureUrlByUserId(p.id)}
                                     title={p.user?.displayName ?? p.id}
                                     className="inline-block h-7 w-7 rounded-full ring-2 ring-white border border-gray-200"
                                     alt={p.user?.displayName ?? p.id}/>
                            ))}
                            {participants.length > 5 && (
                                <span
                                    className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 text-[10px] text-gray-600 ring-2 ring-white">+{participants.length - 5}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div
                    ref={containerRef}
                    onScroll={onScroll}
                    className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
                    style={{scrollbarWidth: "thin"}}
                >
                    {rendered}
                    {isLoading && (
                        <div className="text-center text-xs text-gray-500 py-2">Loading…</div>
                    )}
                    {!hasMore && (
                        <div className="text-center text-[11px] text-gray-400 py-2">No more messages</div>
                    )}
                    {error && (
                        <div className="text-center text-xs text-red-500 py-2">{error}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
