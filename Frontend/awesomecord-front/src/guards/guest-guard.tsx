import {Navigate} from "react-router-dom";
import {useAuth} from "../hooks/use-auth.ts";
import type {JSX} from "react";

type Props = { children: JSX.Element };

export function GuestGuard({children}: Props) {
    const {authenticated, loading} = useAuth();

    if (loading) return <div>Loading...</div>;
    if (authenticated) return <Navigate to="/chats" replace/>;

    return children;
}
