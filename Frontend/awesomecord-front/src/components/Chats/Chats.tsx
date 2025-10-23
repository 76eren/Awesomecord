import Navbar from "../Navbar/Navbar.tsx";
import ChatNavigation from "./ChatNavigation.tsx";
import {useConversationStore} from "../../store/conversationStore.ts";
import type {ConversationModel} from "../../Models/Conversation/conversation.model.ts";
import {useEffect, useState} from "react";

function getRouteId(): string {
    if (typeof window === "undefined") return "";
    return window.location.pathname.replace(/^\/chats\/?/, "");
}

export default function Chats() {
    const conversations = useConversationStore((state) => state.conversations);

    const [routeId, setRouteId] = useState<string>(() => getRouteId());
    const [currentConversation, setCurrentConversation] = useState<
        ConversationModel | undefined>(() =>
        conversations.find((c) => c.id === (typeof window !== "undefined" ? getRouteId() : ""))
    );
    const currentUser = useConversationStore((state) => state.users);

    useEffect(() => {
        setCurrentConversation(conversations.find((c) => c.id === routeId));
    }, [routeId, conversations]);

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

    return (
        <div className="min-h-screen flex bg-gray-50">
            <Navbar/>
            <ChatNavigation/>
            {routeId === "" ? null : (
                <main className="flex-1 p-6">
                    {currentConversation && (
                        <div className="chat">
                            {/*actual chat comes in here*/}
                        </div>
                    )}
                </main>
            )}
        </div>
    );
}
