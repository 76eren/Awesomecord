import {apiFetch} from "./http.ts";
import type {LimitedUserModel} from "../Models/User/limitedUser.model.ts";
import {API_BASE_URL} from "../schema/constants.ts";

export async function getUserById(id: string): Promise<LimitedUserModel> {
    return apiFetch<LimitedUserModel>("user/" + id, {method: "GET"});
}

export function getProfilePictureUrlByUserId(id: string): string {
    return API_BASE_URL + "image/profile/?userId=" + id;
}

export function getCoverPictureUrlByUserHandle(handle: string): string {
    return API_BASE_URL + "image/cover/?userHandle=" + handle;
}
