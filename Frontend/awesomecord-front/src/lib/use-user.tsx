import { useEffect, useState } from "react";
import type {UserModel} from "../Models/User/user.model.ts";
import {me} from "../services/authService.ts";

export function useUser() {
    const [user, setUser] = useState<UserModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const model = await me();
            setUser(model);
        } catch (e) {
            setError(e);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { user, isLoading, error, fetchData };
}
