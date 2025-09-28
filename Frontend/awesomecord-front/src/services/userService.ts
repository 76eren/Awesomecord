import type {UserModel} from "../Models/User/user.model.ts";
import type {UserCreateModel} from "../Models/User/userCreate.model.ts";


export async function registerUser(userCreateModel: UserCreateModel): Promise<UserModel> {
    // Todo: put URL in config file
    const res = await fetch("http://localhost:5041/api/v1/auth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userCreateModel),
    });

    if (!res.ok) {
        throw new Error("Failed to create user");
    }

    return res.json();
}