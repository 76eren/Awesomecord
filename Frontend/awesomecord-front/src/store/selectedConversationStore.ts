import type {ConversationModel} from "../Models/Conversation/conversation.model.ts";
import type {LimitedUserModel} from "../Models/User/limitedUser.model.ts";
import {create} from "zustand";

type selectedConversationStore = {
    selectedConversation: ConversationModel | null;
    participants: LimitedUserModel[] | null;
}

type actions = {
    setSelectedConversation: (c: ConversationModel) => void;
    setParticipants: (u: LimitedUserModel[]) => void;
}

export const useSelectedConversationStore = create<selectedConversationStore & actions>((set) => ({
    selectedConversation: null,
    participants: null,
    setSelectedConversation: (c) => set({selectedConversation: c}),
    setParticipants: (u) => set({participants: u}),
}));
