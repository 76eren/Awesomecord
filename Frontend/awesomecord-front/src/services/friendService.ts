import {apiFetch} from "./http.ts";
import type {CreateFriendRequestModel} from "../Models/friend/createFriendRequest.model.ts";

export async function initiateFriendRequest(createFriendRequestModel: CreateFriendRequestModel) {
    return apiFetch<void>("friend", {json: createFriendRequestModel, method: "POST"});
}

export async function acceptFriendRequest(requesterHandle: string) {
    let body = {
        "Action": "accept"
    }
    return apiFetch<void>("friend/" + requesterHandle, {method: "POST", json: body});
}

export async function denyFriendRequest(requesterHandle: string) {
    let body = {
        "Action": "deny"
    }
    let headers = {
        "Content-Type": "application/json"
    }
    return apiFetch<void>("friend/" + requesterHandle, {method: "POST", json: body, headers: headers});
}

export async function deleteFriendFromFriendslist(friendId: string) {
    return apiFetch<void>("friend/" + friendId, {method: "DELETE"});
}