import type {UserModel} from "../Models/User/user.model.ts";
import type {UserCreateModel} from "../Models/User/userCreate.model.ts";
import {apiFetch} from "./http.ts";


export async function registerUser(userCreateModel: UserCreateModel) {
    return apiFetch<UserModel>("", {json: userCreateModel, method: "POST"});
}