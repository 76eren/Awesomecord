import { createContext, useContext } from "react";
import type {UserModel} from "../Models/User/user.model.ts";

type UserCtx = {
    user: UserModel | null;
    fetchData: () => Promise<void>;
    error: unknown;
    isLoading: boolean;
    updateUser: (newUser: UserModel) => void;
}

const userContext = createContext<UserCtx | null>(null)

export const UserProvider = userContext.Provider;

export function useUserContext() {
    const context = useContext(userContext);

    if (!context) {
        throw new Error("useUserContext must be used within a UserProvider");
    }

    return context;
}