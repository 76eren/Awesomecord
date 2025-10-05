import { useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import { useUserContext } from "../../lib/user-context";
import { ensureHubStarted, getNotificationsHub } from "../../realtime/notificationsHub";

export default function Notifications() {
    const { user, isLoading, error } = useUserContext();

    useEffect(() => {
        const baseUrl = "https://localhost:5041";
        let unsub: (() => void) | undefined;

        (async () => {
            const hub = await ensureHubStarted(baseUrl);

            const handler = (payload: {
                requesterHandle: string;
                recipientHandle: string;
                updatedUserModel: any;
            }) => {
                console.log("[FriendRequestReceived]", payload.requesterHandle, "→", payload.recipientHandle);
                console.log("[UpdatedUserModel]", payload.updatedUserModel);
            };

            hub.on("FriendRequestReceived", handler);
            unsub = () => hub.off("FriendRequestReceived", handler);
        })().catch(e => console.error("[SignalR] start failed", e));

        return () => { if (unsub) unsub(); };
    }, []);

    if (isLoading) return <h1>Loading</h1>;
    if (error != null) return <h1>An unknown error occured</h1>;

    return (
        <div className="min-h-screen flex bg-gray-50">
            <Navbar />
            <main className="flex-1 p-6">
                <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
                <p>You have currently {user.receivedFriendRequests.length} incoming requests</p>
                <p>You have currently {user.sentFriendRequests.length} outgoing requests</p>
            </main>
        </div>
    );
}
