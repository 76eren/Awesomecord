import {apiFetch} from "./http.ts";

export async function deleteMessage(messageId: string): Promise<void> {
    return apiFetch<void>(`message/${messageId}`, {method: "DELETE"});
}