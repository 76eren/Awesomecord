import type {ConversationModel} from "../Models/Conversation/conversation.model.ts";
import type {LimitedUserModel} from "../Models/User/limitedUser.model.ts";
import {create} from "zustand";
import {getConversations} from "../services/conversationService.ts";
import {GetMultipleUsersByIds} from "../services/userService.ts";

type conversationStore = {
    conversations: ConversationModel[];
    users: LimitedUserModel[];
    isLoading: boolean;
    error: unknown;
}

type UserActions = {
    setConversations: (c: ConversationModel[]) => void;
    setUsers: (u: LimitedUserModel[]) => void;
    setLoading: (v: boolean) => void;
    setError: (e: unknown) => void;
    fetchConversations: () => Promise<void>;
    fetchConversationUsers: (ids: string[]) => Promise<void>;
}

export const useConversationStore = create<conversationStore & UserActions>((set) => ({
    conversations: [],
    users: [],
    isLoading: false,
    error: null,
    setConversations: (c) => set({conversations: c}),
    setUsers: (u) => set({users: u}),
    setLoading: (v) => set({isLoading: v}),
    setError: (e) => set({error: e}),

    fetchConversations: async () => {
        set({isLoading: true, error: null});
        try {
            const data = await getConversations();
            set({conversations: data});
        } catch (e) {
            set({error: e, conversations: []});
        } finally {
            set({isLoading: false});
        }
    },

    fetchConversationUsers: async (ids: string[]) => {
        set({isLoading: true, error: null});
        try {
            const users = await GetMultipleUsersByIds(ids);
            set({users: users});
        } catch (e) {
            set({error: e, users: []});
        } finally {
            set({isLoading: false});
        }
    }
}));
