import {useCallback, useEffect, useState} from "react";
import Navbar from "../Navbar/Navbar";
import type {UserModel} from "../../Models/User/user.model.ts";
import {toast, ToastContainer} from "react-toastify";
import {NotificationCard} from "./NotificationCard";
import {acceptFriendRequest, denyFriendRequest} from "../../services/friendService.ts";
import {useSignalR} from "../../realtime/signalrProvider.tsx";
import {useUserStore} from "../../store/userStore";

export default function Notifications() {
    const user = useUserStore((s) => s.user);
    const isLoading = useUserStore((s) => s.isLoading);
    const error = useUserStore((s) => s.error);
    const fetchUser = useUserStore((s) => s.fetchUser);
    const setUser = useUserStore((s) => s.setUser);

    const {ensure, on} = useSignalR();
    const [processing, setProcessing] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!user && !isLoading) {
            void fetchUser();
        }
    }, [user, isLoading, fetchUser]);

    useEffect(() => {
        let canceled = false;
        let unsub: (() => void) | undefined;

        (async () => {
            try {
                await ensure("notifications");
                if (canceled) return;

                const handler = (payload: {
                    requesterHandle: string;
                    recipientHandle: string;
                    updatedUserModel: UserModel;
                }) => {
                    console.log(payload);
                    setUser(payload.updatedUserModel);
                    toast.success("New friend request from " + payload.requesterHandle);
                };

                unsub = on("notifications", "FriendRequestReceived", handler);
            } catch (e) {
                console.error("[SignalR] start failed", e);
            }
        })();

        return () => {
            canceled = true;
            if (unsub) unsub();
        };
    }, [ensure, on, setUser]);

    const handleAccept = useCallback(
        async (handle: string) => {
            try {
                setProcessing((p) => ({...p, [handle]: true}));
                await acceptFriendRequest(handle);
                await fetchUser();
                toast.success(`Accepted ${handle}`);
            } catch (e) {
                console.error(e);
                toast.error("Failed to accept request.");
            } finally {
                setProcessing((p) => ({...p, [handle]: false}));
            }
        },
        [fetchUser]
    );

    const handleDeny = useCallback(
        async (handle: string) => {
            try {
                setProcessing((p) => ({...p, [handle]: true}));
                await denyFriendRequest(handle);
                await fetchUser();
                toast.success(`Denied ${handle}`);
            } catch (e) {
                console.error(e);
                toast.error("Failed to deny request.");
            } finally {
                setProcessing((p) => ({...p, [handle]: false}));
            }
        },
        [fetchUser]
    );

    if (isLoading) return <h1>Loading</h1>;
    if (error != null) return <h1>An unknown error occured</h1>;

    const incoming = user?.receivedFriendRequests ?? [];
    const outgoing = user?.sentFriendRequests ?? [];

    return (
        <>
            <ToastContainer/>
            <div className="min-h-screen flex bg-gray-50">
                <Navbar/>
                <main className="flex-1 p-6">
                    <h1 className="text-2xl font-semibold mb-4">Notifications</h1>

                    <section className="mb-8">
                        <div className="flex items-baseline justify-between mb-2">
                            <h2 className="text-sm uppercase tracking-wide text-gray-500">
                                Incoming requests
                            </h2>
                            <span className="text-xs text-gray-500">
                                {incoming.length} total
                            </span>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-200">
                            {incoming.length === 0 ? (
                                <div className="p-4 text-sm text-gray-500">No incoming requests</div>
                            ) : (
                                incoming.map((id) => (
                                    <NotificationCard
                                        key={id}
                                        isIncoming={true}
                                        userId={id}
                                        onAccept={() => handleAccept(id)}
                                        onDeny={() => handleDeny(id)}
                                        loading={!!processing[id]}
                                    />
                                ))
                            )}
                        </div>
                    </section>

                    <section>
                        <div className="flex items-baseline justify-between mb-2">
                            <h2 className="text-sm uppercase tracking-wide text-gray-500">
                                Outgoing requests
                            </h2>
                            <span className="text-xs text-gray-500">
                                {outgoing.length} total
                            </span>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-200">
                            {outgoing.length === 0 ? (
                                <div className="p-4 text-sm text-gray-500">No outgoing requests</div>
                            ) : (
                                outgoing.map((id) => (
                                    <NotificationCard
                                        key={id}
                                        isIncoming={false}
                                        userId={id}
                                        onAccept={() => handleAccept(id)}
                                        onDeny={() => handleDeny(id)}
                                        loading={!!processing[id]}
                                    />
                                ))
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
