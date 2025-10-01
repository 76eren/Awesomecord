import type {UserModel} from "../Models/User/user.model.ts";
import type {UserCreateModel} from "../Models/User/userCreate.model.ts";
import {apiFetch} from "./http.ts";
import type {UserLoginModel} from "../Models/User/userLogin.model.ts";
import type {LimitedUserModel} from "../Models/User/limitedUser.model.ts";

export async function registerUser(userCreateModel: UserCreateModel) {
    return apiFetch<LimitedUserModel>("auth", {json: userCreateModel, method: "POST"});
}

export async function loginUser(userLoginModel: UserLoginModel) {
    return apiFetch<LimitedUserModel>("auth/login", {json: userLoginModel, method: "POST"});
}

export async function me() {
    return apiFetch<UserModel>("auth/me", {method: "GET"});
}

export async function logout() {
    return apiFetch<void>("auth/logout", {method: "POST"});
}
