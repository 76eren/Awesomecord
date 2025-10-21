import * as React from "react";
import {useEffect} from "react";
import {useConversationStore} from "../../store/conversationStore.ts";
import {useUserStore} from "../../store/userStore.ts";
import {getProfilePictureUrlByUserId} from "../../services/userService.ts";

export default function ChatNavigation() {
    const conversations = useConversationStore(s => s.conversations);
    const users = useConversationStore(s => s.users);
    const currentUser = useUserStore(s => s.user); // The user you yourself are

    const isLoadingCurrentUser = useUserStore(s => s.isLoading);
    const fetchUser = useUserStore(s => s.fetchUser);

    const fetchConversations = useConversationStore(s => s.fetchConversations);
    const fetchConversationUsers = useConversationStore(s => s.fetchConversationUsers);

    useEffect(() => {
        const fetchAll = async () => {
            if (!currentUser && !isLoadingCurrentUser) {
                await fetchUser();
            }
            await fetchConversations();
            const participantIds = useConversationStore.getState().conversations.flatMap(c => c.participantIds);
            const uniqueIds = Array.from(new Set(participantIds));
            await fetchConversationUsers(uniqueIds);
        };
        void fetchAll();
    }, [fetchConversations, fetchConversationUsers, currentUser, isLoadingCurrentUser, fetchUser]);

    return (
        <aside
            className="md:sticky md:top-0 md:h-screen md:w-70 bg-white border-r md:border-gray-700 fixed bottom-0 w-full border-t border-gray-700 md:border-t-0 z-50">
            <div className="px-4 py-5 border-b border-gray-200 md:block hidden">
                <div className="text-xl font-semibold tracking-tight">Awesomecord</div>
                <div className="text-xs text-gray-500">Made by Eren</div>
            </div>

            <nav className="py-4 md:py-4">
                <ul className="flex md:flex-col justify-around md:space-y-1 md:space-x-0 space-x-2 px-2 md:px-0">
                    {conversations.map((conversation) => {
                        const recipientId = conversation.participantIds.find(id => id !== currentUser?.id);
                        const recipient = users.find(u => u.id === recipientId);
                        if (!recipient) return null;
                        return (
                            <li key={conversation.id} className="w-full">
                                <div
                                    className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer border border-gray-200 mb-2">
                                    <img
                                        src={getProfilePictureUrlByUserId(recipient.id)}
                                        alt={recipient.displayName}
                                        className="w-15 h-15 rounded-full border-2 border-gray-300 mr-2"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-800">
                                            {recipient.displayName}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            @{recipient.userHandle}
                                        </span>
                                        <span className="text-xs text-gray-400 mt-1">{conversation.title}</span>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}
