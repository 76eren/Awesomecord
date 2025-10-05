import { useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import { useUserContext } from "../../lib/user-context";
import { ensureHubStarted } from "../../realtime/signalrHub.ts";
import type {UserModel} from "../../Models/User/user.model.ts";
import {toast, ToastContainer} from "react-toastify";

export default function Notifications() {
    const { user, isLoading, error, fetchData, updateUser } = useUserContext();

    useEffect(() => {
        const baseUrl = "https://localhost:5041";
        const hubUrl = "hubs/notifications";
        let unsub: (() => void) | undefined;

        (async () => {
            const hub = await ensureHubStarted(baseUrl, hubUrl);

            const handler = (payload: {
                requesterHandle: string;
                recipientHandle: string;
                updatedUserModel: UserModel;
            }) => {
                console.log("FriendRequestReceived", payload);
                updateUser(payload.updatedUserModel);

                toast.success("New friend request from " + payload.requesterHandle);
            };

            hub.on("FriendRequestReceived", handler);
            unsub = () => hub.off("FriendRequestReceived", handler);
        })().catch(e => console.error("[SignalR] start failed", e));

        return () => { if (unsub) unsub(); };
    }, [fetchData]);

    if (isLoading) return <h1>Loading</h1>;
    if (error != null) return <h1>An unknown error occured</h1>;

    return (
        <>
            <ToastContainer></ToastContainer>
            <div className="min-h-screen flex bg-gray-50">
                <Navbar />
                <main className="flex-1 p-6">
                    <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
                    <p>You have currently {user.receivedFriendRequests.length} incoming requests</p>
                    <p>You have currently {user.sentFriendRequests.length} outgoing requests</p>
                </main>
            </div>
        </>
    );
}
