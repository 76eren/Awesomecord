import Navbar from "../Navbar/Navbar.tsx";
import ChatNavigation from "./ChatNavigation.tsx";
import {useConversationStore} from "../../store/conversationStore.ts";
import type {ConversationModel} from "../../Models/Conversation/conversation.model.ts";
import {useEffect, useMemo, useState} from "react";
import ChatWindow from "./ChatWindow.tsx";
import {useUserStore} from "../../store/userStore.ts";

function getRouteId(): string {
    if (typeof window === "undefined") return "";
    return window.location.pathname.replace(/^\/chats\/?/, "");
}

export default function Chats() {
    const conversations = useConversationStore((state) => state.conversations);
    const users = useConversationStore((state) => state.users);
    const fetchConversationUsers = useConversationStore((s) => s.fetchConversationUsers);
    const currentUserId = useUserStore((s) => s.user?.id);

    const [routeId, setRouteId] = useState<string>(() => getRouteId());
    const [currentConversation, setCurrentConversation] = useState<
        ConversationModel | undefined>(() =>
        conversations.find((c) => c.id === (typeof window !== "undefined" ? getRouteId() : ""))
    );

    useEffect(() => {
        setCurrentConversation(conversations.find((c) => c.id === routeId));
    }, [routeId, conversations]);

    useEffect(() => {
        if (!currentConversation) return;
        const missing = currentConversation.participantIds.filter(pid => !users.some(u => u.id === pid));
        if (missing.length > 0) {
            void fetchConversationUsers(missing);
        }
    }, [currentConversation, users, fetchConversationUsers]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const updateFromLocation = () => {
            setRouteId(getRouteId());
        };

        updateFromLocation();
        window.addEventListener("popstate", updateFromLocation);
        const {history} = window;
        const origPushState = history.pushState.bind(history);
        const origReplaceState = history.replaceState.bind(history);

        const dispatchNavEvent = () => {
            window.dispatchEvent(new Event("popstate"));
        };

        history.pushState = function pushState(
            data: any,
            unused: string,
            url?: string | URL | null
        ) {
            origPushState(data, unused, url as any);
            dispatchNavEvent();
        };

        history.replaceState = function replaceState(
            data: any,
            unused: string,
            url?: string | URL | null
        ) {
            origReplaceState(data, unused, url as any);
            dispatchNavEvent();
        };

        return () => {
            window.removeEventListener("popstate", updateFromLocation);
            history.pushState = origPushState;
            history.replaceState = origReplaceState;
        };
    }, []);

    const title = useMemo(() => {
        if (!currentConversation) return undefined;
        if (!currentUserId) return currentConversation.title;

        const others = currentConversation.participantIds.filter(
            (id) => id !== currentUserId
        );
        const recipient = users.find((u) => others.includes(u.id));
        return recipient?.displayName ?? currentConversation.title;
    }, [currentConversation, users, currentUserId]);

    return (
        <div className="min-h-screen flex bg-gray-50">
            <Navbar/>
            <ChatNavigation/>
            {routeId === "" ? null : (
                <main className="flex-1 p-6">
                    {currentConversation && (
                        <div className="h-[calc(100vh-3rem)]">
                            <ChatWindow title={title}/>
                        </div>
                    )}
                </main>
            )}
        </div>
    );
}
