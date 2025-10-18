import {apiFetch} from "./http.ts";
import type {LimitedUserModel} from "../Models/User/limitedUser.model.ts";

export async function getUserById(id: string): Promise<LimitedUserModel> {
    return apiFetch<LimitedUserModel>("user/" + id, {method: "GET"});
}

// Make these come out of a config file
export function getProfilePictureUrlByUserId(id: string): string {
    return "https://localhost:5041/api/v1/image/profile/?userId=" + id;
}

export function getCoverPictureUrlByUserHandle(handle: string): string {
    return "https://localhost:5041/api/v1/image/cover/?userHandle=" + handle;
}
