import {apiFetch} from "./http.ts";
import type {ConversationModel} from "../Models/Conversation/conversation.model.ts";
import type {MessageModel} from "../Models/Conversation/message.model.ts";
import {API_BASE_URL} from "../schema/constants.ts";

export async function getConversations() {
    return apiFetch<ConversationModel[]>("conversation", {method: "GET"});
}

export async function createConversation(targetUserId: string) {
    return apiFetch<void>("conversation/user/" + targetUserId, {method: "POST"});
}

export async function getConversationMessages(conversationId: string, batch: number) {
    return apiFetch<MessageModel[]>(`conversation/${conversationId}/messages/${batch}`, {method: "GET"});
}

export function getConversationImages(conversationId: string, imageHash: string) {
    return API_BASE_URL + "image/conversation/" + conversationId + "/image/" + imageHash;
}

export function SendMessageInConversation(conversationId: string, content?: string, image?: File) {
    const formData = new FormData();
    if (content) {
        formData.append("message", content);
    }
    if (image) {
        formData.append("image", image);
    }

    return apiFetch<void>(`conversation/${conversationId}/chat`, {method: "POST", body: formData});
}