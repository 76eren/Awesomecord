import Navbar from "../Navbar/Navbar.tsx";
import ChatNavigation from "./ChatNavigation.tsx";
import {useConversationStore} from "../../store/conversationStore.ts";
import type {ConversationModel} from "../../Models/Conversation/conversation.model.ts";
import {useEffect, useMemo} from "react";
import ChatWindow from "./ChatWindow.tsx";
import {useUserStore} from "../../store/userStore.ts";
import {useParams} from "react-router-dom";

export default function Chats() {
    // Read the id from the route here and pass it down explicitly
    const {id: routeIdParam} = useParams<{ id: string }>();
    const routeId = routeIdParam ?? "";

    const conversations = useConversationStore((state) => state.conversations);
    const users = useConversationStore((state) => state.users);
    const fetchConversationUsers = useConversationStore((s) => s.fetchConversationUsers);
    const currentUserId = useUserStore((s) => s.user?.id);

    // Current conversation derived from route + store
    const currentConversation: ConversationModel | undefined = useMemo(
        () => conversations.find((c) => c.id === routeId),
        [conversations, routeId]
    );

    // Ensure participants are loaded for the current conversation
    useEffect(() => {
        if (!currentConversation) return;
        const missing = currentConversation.participantIds.filter(pid => !users.some(u => u.id === pid));
        if (missing.length > 0) {
            void fetchConversationUsers(missing);
        }
    }, [currentConversation, users, fetchConversationUsers]);

    // Title derived from participants or conversation title
    const title = useMemo(() => {
        if (!currentConversation) return undefined;
        if (!currentUserId) return currentConversation.title;

        const others = currentConversation.participantIds.filter((id) => id !== currentUserId);
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
                            <ChatWindow title={title} conversationId={routeId}/>
                        </div>
                    )}
                </main>
            )}
        </div>
    );
}
