import * as React from "react";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useConversationStore} from "../../store/conversation-store.ts";
import {useUserStore} from "../../store/user-store.ts";
import {getProfilePictureUrlByUserId} from "../../services/user-service.ts";
import type {ConversationModel} from "../../models/conversation/conversation.model.ts";
import NewGroupChatModal from "./new-group-chat-modal.tsx";

export default function ChatNavigation() {
    const navigate = useNavigate();
    const {conversationId} = useParams<{ conversationId?: string }>();

    const conversations = useConversationStore((s) => s.conversations);
    const users = useConversationStore((s) => s.users);

    const currentUser = useUserStore((s) => s.user);
    const isLoadingCurrentUser = useUserStore((s) => s.isLoading);
    const fetchUser = useUserStore((s) => s.fetchUser);

    const fetchConversations = useConversationStore((s) => s.fetchConversations);
    const fetchConversationUsers = useConversationStore((s) => s.fetchConversationUsers);

    const isLoadingConversations = useConversationStore((s) => s.isLoading);
    const conversationsError = useConversationStore((s) => s.error);

    const [selectedConversation, setSelectedConversation] = useState<ConversationModel | null>(null);
    const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            if (!currentUser && !isLoadingCurrentUser) {
                await fetchUser();
            }
            await fetchConversations();
            const participantIds = useConversationStore
                .getState()
                .conversations.flatMap((c) => c.participantIds);
            const uniqueIds = Array.from(new Set(participantIds));
            await fetchConversationUsers(uniqueIds);
        };
        void fetchAll();
    }, [fetchConversations, fetchConversationUsers, currentUser, isLoadingCurrentUser, fetchUser]);

    useEffect(() => {
        if (!conversationId) return;
        const conv = conversations.find((c) => c.id === conversationId);
        if (!conv) return;


        setSelectedConversation(conv);
    }, [conversationId, conversations, users, currentUser]);

    function handleSelect(conversation: ConversationModel) {
        navigate(`/chats/${conversation.id}`);

        setSelectedConversation(conversation);
    }

    const selectedId = conversationId ?? selectedConversation?.id;

    if (isLoadingConversations) {
        return <h1>Loading...</h1>
    }
    if (conversationsError) {
        return <h1>Error loading conversations.</h1>
    }

    const renderAvatar = (conversation: ConversationModel, recipient: any, isSelected: boolean) => {
        const otherIds = conversation.participantIds.filter((id) => id !== currentUser?.id);
        // One person
        if (otherIds.length <= 1) {
            const idToUse = recipient?.id ?? otherIds[0];
            return (
                <img
                    src={getProfilePictureUrlByUserId(idToUse)}
                    alt={recipient?.displayName ?? 'Profile'}
                    className={`w-15 h-15 rounded-full border-2 mr-2 ${
                        isSelected ? "border-blue-400" : "border-gray-300"}`}
                />
            );
        }

        // Group chat yay
        const firstUser = users.find((u) => u.id === otherIds[0]);
        const secondUser = users.find((u) => u.id === otherIds[1]) ?? firstUser;
        const url1 = getProfilePictureUrlByUserId(firstUser?.id ?? otherIds[0]);
        const url2 = getProfilePictureUrlByUserId(secondUser?.id ?? otherIds[1] ?? otherIds[0]);

        return (
            <div className="relative w-12 h-12 mr-2 flex-shrink-0">
                <img
                    src={url1}
                    alt={firstUser?.displayName ?? 'Member 1'}
                    className={`absolute top-0 left-0 w-8 h-8 rounded-full border-2 ${isSelected ? 'border-blue-400' : 'border-gray-300'}`}
                />
                <img
                    src={url2}
                    alt={secondUser?.displayName ?? 'Member 2'}
                    className={`absolute bottom-0 right-0 w-8 h-8 rounded-full border-2 ${isSelected ? 'border-blue-400' : 'border-gray-300'}`}
                />
            </div>
        );
    };

    function createNewGroupChat() {
        setIsNewGroupOpen(true);
    }

    async function handleGroupCreated(payload: { selectedIds: string[]; title?: string }) {
        await fetchConversations();
        const updatedConversations = useConversationStore.getState().conversations;

        const allIds = new Set<string>([
            ...(currentUser?.id ? [currentUser.id] : []),
            ...payload.selectedIds,
        ]);
        const found = updatedConversations.find((c) =>
            c.participantIds.length === allIds.size && c.participantIds.every((id) => allIds.has(id))
        );

        const allParticipantIds = Array.from(new Set(updatedConversations.flatMap((c) => c.participantIds)));
        await fetchConversationUsers(allParticipantIds);

        if (found) {
            navigate(`/chats/${found.id}`);
            setSelectedConversation(found);
        }
    }

    return (
        <>
            <NewGroupChatModal
                isOpen={isNewGroupOpen}
                onClose={() => setIsNewGroupOpen(false)}
                onCreated={async (p) => {
                    setIsNewGroupOpen(false);
                    await handleGroupCreated(p);
                }}
            />
            <aside
                className="md:sticky md:top-0 md:h-screen md:w-70 bg-white border-r md:border-gray-700 fixed bottom-0 w-full border-t border-gray-700 md:border-t-0 z-50">
                <div className="px-4 py-5 border-b border-gray-200 md:block hidden">
                    <div className="text-xl font-semibold tracking-tight">Select a chat</div>
                </div>

                <div className="px-4 py-3 border-b border-gray-200 md:block hidden">
                    <button
                        onClick={() => createNewGroupChat()}
                        className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        New Group Chat
                    </button>
                </div>

                <nav className="py-4 md:py-4">
                    <ul className="flex md:flex-col justify-around md:space-y-1 md:space-x-0 space-x-2 px-2 md:px-0">
                        {conversations.map((conversation) => {
                            const recipientId = conversation.participantIds.find(
                                (id) => id !== currentUser?.id
                            );
                            const recipient = users.find((u) => u.id === recipientId);
                            if (!recipient) return null;

                            const isSelected = selectedId === conversation.id;

                            return (
                                <li key={conversation.id} className="w-full">
                                    <div
                                        onClick={() => handleSelect(conversation)}
                                        className={`flex items-center p-2 rounded-lg transition cursor-pointer border mb-2 
                                    ${isSelected ? "bg-blue-100 border-blue-400" : "hover:bg-gray-100 border-gray-200"}`}>
                                        {renderAvatar(conversation, recipient, isSelected)}
                                        <div className="flex flex-col">
                                            {conversation.participantIds.length > 2 ? (
                                                <span
                                                    className="font-semibold text-gray-800">{conversation.title}</span>
                                            ) : (
                                                <>
                                                    <span
                                                        className="font-semibold text-gray-800">{recipient.displayName}</span>
                                                    <span
                                                        className="text-xs text-gray-500">@{recipient.userHandle}</span>
                                                    <span
                                                        className="text-xs text-gray-400 mt-1">{conversation.title}</span>
                                                </>
                                            )}

                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>
        </>
    );
}
