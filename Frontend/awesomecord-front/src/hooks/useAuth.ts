import { useEffect, useState } from "react";
import { me } from "../services/authService";
import type {UserModel} from "../Models/User/user.model.ts";

export function useAuth() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserModel | null>(null);

    useEffect(() => {
        let active = true;

        me()
            .then((u) => {
                if (active) setUser(u);
            })
            .catch(() => {
                if (active) setUser(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    return { user, loading, authenticated: !!user };
}
