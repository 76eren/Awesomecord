import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {MessageModel} from "../../Models/Conversation/message.model.ts";
import {
    getConversationImages,
    getConversationMessages,
    SendMessageInConversation
} from "../../services/conversationService.ts";
import {useUserStore} from "../../store/userStore.ts";
import {useConversationStore} from "../../store/conversationStore.ts";
import {getProfilePictureUrlByUserId} from "../../services/userService.ts";
import {useSignalRStore} from "../../store/signalrStore.ts";

import {useAnimaleseSpriteAuto} from "../../hooks/useAnimalCrosssing.tsx";
import {deleteMessage} from "../../services/messageService.ts";

type ChatWindowProps = {
    conversationId: string;
    title?: string;
};

export default function ChatWindow({conversationId, title}: ChatWindowProps) {
    const currentUserId = useUserStore((s) => s.user?.id ?? "");
    const convUsers = useConversationStore((s) => s.users);
    const conversation = useConversationStore((s) => s.conversations.find(c => c.id === conversationId));

    const [messages, setMessages] = useState<MessageModel[]>([]);
    const [batch, setBatch] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const initialLoadedRef = useRef(false);
    const userById = useCallback((id: string) => convUsers.find((u) => u.id === id), [convUsers]);

    const [inputValue, setInputValue] = useState("");
    const [attachedImage, setAttachedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const maxMessageLength = 2000;

    const ensure = useSignalRStore((s) => s.ensure);
    const on = useSignalRStore((s) => s.on);
    const {speak, stop, ready} = useAnimaleseSpriteAuto({
        url: "/assets/animalCrossing/m1.ogg",
        letters: "abcdefghijklmnopqrstuvwxyz",

    });

    const voiceSetting = localStorage.getItem("chatVoiceEnabled");
    const [voiceEnabled, setVoiceEnabled] = useState(voiceSetting === "true");

    useEffect(() => {
        let canceled = false;
        let unsub: (() => void) | undefined;

        (async () => {
            try {
                await ensure("messages");
                if (canceled) return;

                const handler = async (payload: any) => {
                    const msg: MessageModel = payload?.messageModel ?? payload;
                    if (!msg) return;
                    if (msg.conversationId !== conversationId) return;

                    setMessages((prev) => {
                        if (prev.some(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });

                    requestAnimationFrame(() => {
                        const el = containerRef.current;
                        if (el) el.scrollTop = el.scrollHeight;
                    });

                    if (voiceEnabled && ready && msg.senderId !== currentUserId && msg.body) {
                        stop();
                        speak(msg.body);
                    }
                };

                unsub = on("messages", "messages", handler);
            } catch (e) {
                console.error("[SignalR] start failed", e);
            }
        })();

        return () => {
            canceled = true;
            if (unsub) unsub();
        };
    }, [ensure, on, conversationId, currentUserId, speak, voiceEnabled, ready]);

    const handleSendMessage = useCallback(async (body: string, image?: File) => {
        try {
            await SendMessageInConversation(conversationId, body, image);
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    }, [conversationId]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!inputValue.trim() && !attachedImage) return;
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (!inputValue.trim() && !attachedImage) return;

        const toSend = inputValue.trim();
        await handleSendMessage(toSend, attachedImage ?? undefined);

        setInputValue("");
        setAttachedImage(null);
        setPreviewUrl(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Only image files are allowed.");
            return;
        }

        setAttachedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

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
        setMessages([]);
        setBatch(0);
        setHasMore(true);
        setError(null);
        initialLoadedRef.current = false;
        stop();
    }, [conversationId, stop]);

    useEffect(() => {
        if (!initialLoadedRef.current && hasMore && !isLoading) {
            initialLoadedRef.current = true;
            loadBatch(0, {prepend: false});
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

    const participants = useMemo(() => {
        const ids = conversation?.participantIds ?? [];
        return ids.map(id => ({id, user: userById(id)}));
    }, [conversation, userById]);

    function switchVoice(enabled: Boolean) {
        const next: boolean = typeof enabled === "boolean" ? enabled : !voiceEnabled;
        setVoiceEnabled(next);
        localStorage.setItem("chatVoiceEnabled", next.toString());
    }

    async function handleDeleteMessage(id: string) {
        await deleteMessage(id);
    }

    const rendered = useMemo(() => messages.map((m) => {
        const mine = m.senderId === currentUserId;
        const user = userById(m.senderId);
        const displayName = user?.displayName ?? `User ${m.senderId.slice(0, 6)}`;
        const avatarUrl = getProfilePictureUrlByUserId(m.senderId);
        const time = new Date(m.sentAt);
        const timeStr = time.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});

        return (
            <div
                key={m.id}
                className={`relative group flex items-end gap-3 ${mine ? "justify-end" : "justify-start"}`}
            >
                {mine && (
                    <button
                        type="button"
                        onClick={() => handleDeleteMessage(m.id)}
                        className="absolute -top-6 right-10 invisible group-hover:visible focus:opacity-100
                        pointer-events-none group-hover:pointer-events-auto focus:pointer-events-auto
                        transition-opacity bg-white border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-300
                        shadow-sm rounded-full px-2 py-1 text-xs"
                        title="Delete message"
                        aria-label="Delete message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                             className="h-4 w-4">
                            <path
                                d="M9 3a1 1 0 0 0-1 1v1H5.5a1 1 0 1 0 0 2H6v12a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7h.5a1 1 0 1 0 0-2H16V4a1 1 0 0 0-1-1H9zm2 2h2v1h-2V5zM9 9a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0v-8a1 1 0 0 1 1-1zm5 0a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0v-8a1 1 0 0 1 1-1z"/>
                        </svg>
                    </button>
                )}

                {!mine && (
                    <img src={avatarUrl} alt={displayName}
                         className="h-8 w-8 rounded-full object-cover border border-gray-200"/>
                )}

                <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 shadow-sm ${mine ? "bg-indigo-600 text-white" : "bg-white text-gray-900 border border-gray-200"}`}
                >
                    <div className="flex items-baseline gap-2">
                        {!mine && <span className="text-xs font-semibold text-gray-700">{displayName}</span>}
                        <span className={`text-[10px] ${mine ? "text-indigo-100" : "text-gray-400"}`}>{timeStr}</span>
                    </div>

                    {m.body && (
                        <div className="mt-0.5 whitespace-pre-wrap break-words text-sm">{m.body}</div>
                    )}

                    {m.attachmentHash && (
                        <img
                            src={getConversationImages(m.conversationId, m.attachmentHash)}
                            alt="attachment"
                            className="mt-2 max-w-[300px] max-h-[300px] object-contain rounded"
                        />
                    )}
                </div>

                {mine && (
                    <img src={avatarUrl} alt="You"
                         className="h-8 w-8 rounded-full object-cover border border-gray-200"/>
                )}
            </div>
        );
    }), [messages, currentUserId, userById]);

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
                    style={{scrollbarWidth: "thin"}}>
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

                <div className="px-4 py-3 border-t border-gray-200 bg-white">
                    <form
                        className="flex flex-col gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit();
                        }}
                    >
                        {previewUrl && (
                            <div className="relative w-fit">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-h-40 rounded-lg border border-gray-300 object-contain"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAttachedImage(null);
                                        setPreviewUrl(null);
                                    }}
                                    className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        <div className="flex items-end gap-2">
                            <label
                                htmlFor="chat-image-upload"
                                className="cursor-pointer p-2 text-gray-500 hover:text-indigo-600"
                            >
                                📎
                                <input
                                    id="chat-image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>

                            <button
                                type="button"
                                onClick={() => switchVoice(!voiceEnabled)}
                                className="p-2 text-gray-500 hover:text-indigo-600"
                            >
                                {voiceEnabled ? "🔊" : "🔈"}
                            </button>

                            <textarea
                                value={inputValue}
                                onChange={(e) => {
                                    if (e.target.value.length <= maxMessageLength) {
                                        setInputValue(e.target.value);
                                    }
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message… (Shift+Enter for new line)"
                                rows={1}
                                className="flex-1 resize-none px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm max-h-40 overflow-y-auto"
                            />

                            <button
                                type="submit"
                                disabled={!inputValue.trim() && !attachedImage}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
