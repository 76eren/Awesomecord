import {create} from "zustand";
import type {UserModel} from "../Models/User/user.model";
import {me} from "../services/authService";

type UserState = {
    user: UserModel | null;
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
        }
    },
}));