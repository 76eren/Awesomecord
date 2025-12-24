import {useEffect, useState} from "react";
import {isAuthenticated} from "../services/auth-service.ts";


export function useAuth() {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        let active = true;

        (async () => {
            try {
                await isAuthenticated();
                if (active) setAuthenticated(true);
            } catch {
                if (active) setAuthenticated(false);
            } finally {
                if (active) setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    return {loading, authenticated};
}