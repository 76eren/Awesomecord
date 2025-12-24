// This listener is meant for handling updates to conversations in real-time when the user is already on the conversations page.
// Each time the conversations page gets loaded the conversations list is fetched again, but this is solely for updates while on the page.

import {useConversationStore} from "../../store/conversationStore.ts";
import {useSignalRStore} from "../../store/signalrStore.ts";
import {useEffect} from "react";
import type {ConversationModel} from "../../Models/Conversation/conversation.model.ts";

export function ConversationUpdateListener() {
    const ensure = useSignalRStore((s) => s.ensure);
    const on = useSignalRStore((s) => s.on);

    useEffect(() => {
        let canceled = false;
        let unsub: (() => void) | undefined;

        (async () => {
            try {
                await ensure("conversationupdate");
                if (canceled) return;

                const handler = async (payload: {
                    // Currently the payload is not used, should probably be removed from the server side as well
                    updatedConversationsModels: ConversationModel[];
                }) => {
                    await useConversationStore.getState().fetchConversations();
                    const participantIds = useConversationStore
                        .getState()
                        .conversations.flatMap((c) => c.participantIds);
                    const uniqueIds = Array.from(new Set(participantIds));
                    await useConversationStore.getState().fetchConversationUsers(uniqueIds);
                };

                unsub = on("conversationupdate", "ConversationsUpdate", handler);
            } catch (e) {
                console.error("[SignalR] start failed", e);
            }
        })();

        return () => {
            canceled = true;
            if (unsub) unsub();
        };
    }, [ensure, on]);

    return null;

}