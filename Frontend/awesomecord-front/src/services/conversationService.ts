import {apiFetch} from "./http.ts";
import type {ConversationModel} from "../Models/Conversation/conversation.model.ts";

export async function getConversations() {
    return apiFetch<ConversationModel[]>("conversation", {method: "GET"});
}