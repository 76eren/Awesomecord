import {apiFetch} from "./http.ts";

export async function deleteMessage(messageId: string): Promise<void> {
    return apiFetch<void>(`message/${messageId}`, {method: "DELETE"});
}

export async function editMessage(messageId: string, newContent: string): Promise<void> {
    let body = {"NewMessage": newContent}

    return apiFetch<void>(`message/${messageId}`, {
        method: "PATCH",
        json: body,
    });
}