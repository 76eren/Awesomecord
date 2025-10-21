// Todo: update this to load chats dynamically

import * as React from "react";
import {useEffect, useState} from "react";
import type {ConversationModel} from "../../Models/Conversation/conversation.model.ts";
import {getConversations} from "../../services/conversationService.ts";
import type {LimitedUserModel} from "../../Models/User/limitedUser.model.ts";
import {GetMultipleUsersByIds} from "../../services/userService.ts";

export default function ChatNavigation() {
    const [conversation, setConversation] = useState<ConversationModel[]>([]);
    const [individualUsers, setIndividualUsers] = useState<LimitedUserModel[]>([]);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                const data = await getConversations();
                if (!mounted) return;
                setConversation(data);

                const participants = Array.from(
                    new Set(data.flatMap((c) => c.participantIds))
                );

                if (participants.length === 0) return;

                const users = await GetMultipleUsersByIds(participants);
                if (!mounted) return;
                setIndividualUsers(users);
            } catch (err) {
                console.error(err);
            }
        };

        void load();

        return () => {
            mounted = false;
        };
    }, []);

    console.log(conversation);
    console.log(individualUsers);


    return (
        <aside
            className="md:sticky md:top-0 md:h-screen md:w-56 bg-white border-r md:border-gray-700 fixed bottom-0 w-full border-t border-gray-700 md:border-t-0 z-50">
            <div className="px-4 py-5 border-b border-gray-200 md:block hidden">
                <div className="text-xl font-semibold tracking-tight">Awesomecord</div>
                <div className="text-xs text-gray-500">Made by Eren</div>
            </div>

            <nav className="py-4 md:py-4">
                <ul className="flex md:flex-col justify-around md:space-y-1 md:space-x-0 space-x-2 px-2 md:px-0">
                    {conversation.map((item) => {
                        return <h1>{item.participantIds}</h1>
                    })}
                </ul>
            </nav>
        </aside>
    );
}
