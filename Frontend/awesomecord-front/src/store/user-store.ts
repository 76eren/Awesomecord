import {create} from "zustand";
import type {UserModel} from "../models/user/user.model";
import {me} from "../services/auth-service.ts";
import {getProfilePictureUrlByUserId} from "../services/user-service.ts";

type UserState = {
    user: UserModel | null;
    profilePictureUrl: string | null;
    isLoading: boolean;
    error: unknown;
};

type UserActions = {
    setUser: (u: UserModel | null) => void;
    setLoading: (v: boolean) => void;
    setError: (e: unknown) => void;
    fetchUser: () => Promise<void>;
};

export const useUserStore = create<UserState & UserActions>((set) => ({
    user: null,
    profilePictureUrl: null,
    isLoading: false,
    error: null,
    setUser: (u) => set({user: u}),
    setLoading: (v) => set({isLoading: v}),
    setError: (e) => set({error: e}),

    fetchUser: async () => {
        set({isLoading: true, error: null});
        try {
            const model = await me();
            set({user: model});
        } catch (e) {
            set({error: e, user: null});
        } finally {
            set({isLoading: false});
            set({profilePictureUrl: getProfilePictureUrlByUserId((useUserStore.getState().user?.id ?? ""))});
        }
    },


}));