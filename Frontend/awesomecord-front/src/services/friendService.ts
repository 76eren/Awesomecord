import {apiFetch} from "./http.ts";
import type {CreateFriendRequestModel} from "../Models/friend/createFriendRequest.model.ts";

export async function initiateFriendRequest(createFriendRequestModel: CreateFriendRequestModel) {
    return apiFetch<void>("friend", {json: createFriendRequestModel, method: "POST"});
}