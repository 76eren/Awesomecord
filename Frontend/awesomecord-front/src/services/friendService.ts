import {apiFetch} from "./http.ts";
import type {CreateFriendRequestModel} from "../Models/friend/createFriendRequest.model.ts";

export async function initiateFriendRequest(createFriendRequestModel: CreateFriendRequestModel) {
    return apiFetch<void>("friend", {json: createFriendRequestModel, method: "POST"});
}

export async function acceptFriendRequest(requesterHandle: string) {
    let body ={
        "Action" : "accept"
    }
    return apiFetch<void>("friend/"+requesterHandle, {method: "POST", body: JSON.stringify(body)});
}

export async function denyFriendRequest(requesterHandle: string) {
    let body = {
        "Action" : "deny"
    }
    return apiFetch<void>("friend/"+requesterHandle, {method: "POST", body: JSON.stringify(body)});
}