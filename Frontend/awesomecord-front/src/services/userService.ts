import {apiFetch} from "./http.ts";
import type {LimitedUserModel} from "../Models/User/limitedUser.model.ts";

export async function getUserById(id: string): Promise<LimitedUserModel> {
    return apiFetch<LimitedUserModel>("user/" + id, {method: "GET"});
}