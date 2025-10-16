import {useCallback, useEffect, useState} from "react";
import Navbar from "../Navbar/Navbar";
import {useUserContext} from "../../lib/user-context";
import type {UserModel} from "../../Models/User/user.model.ts";
import {toast, ToastContainer} from "react-toastify";
import {NotificationCard} from "./NotificationCard";
import {acceptFriendRequest, denyFriendRequest} from "../../services/friendService.ts";
import {useSignalR} from "../../realtime/signalrProvider.tsx";

export default function Notifications() {
    const {user, isLoading, error, fetchData, updateUser} = useUserContext();
    const {ensure, on} = useSignalR();
    const [processing, setProcessing] = useState<Record<string, boolean>>({});

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
                    console.log(payload)
                    updateUser(payload.updatedUserModel);
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
    }, [ensure, on, updateUser]);


    const handleAccept = useCallback(
        async (handle: string) => {
            try {
                setProcessing((p) => ({...p, [handle]: true}));
                await acceptFriendRequest(handle);
                await fetchData();
                toast.success(`Accepted ${handle}`);
            } catch (e) {
                console.error(e);
                toast.error("Failed to accept request.");
            } finally {
                setProcessing((p) => ({...p, [handle]: false}));
            }
        },
        [fetchData]
    );

    const handleDeny = useCallback(
        async (handle: string) => {
            try {
                setProcessing((p) => ({...p, [handle]: true}));
                await denyFriendRequest(handle);
                await fetchData();
                toast.success(`Denied ${handle}`);
            } catch (e) {
                console.error(e);
                toast.error("Failed to deny request.");
            } finally {
                setProcessing((p) => ({...p, [handle]: false}));
            }
        },
        [fetchData]
    );

    if (isLoading) return <h1>Loading</h1>;
    if (error != null) return <h1>An unknown error occured</h1>;


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
                                {user.receivedFriendRequests == undefined ? 0 : user.receivedFriendRequests.length} total
                            </span>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-200">

                            {user.receivedFriendRequests.length === 0 ? (
                                <div className="p-4 text-sm text-gray-500">No incoming requests</div>) : (
                                user.receivedFriendRequests.map((id) => (
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
                                {user.sentFriendRequests.length} total
                            </span>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-200">
                            {user.sentFriendRequests.length === 0 ? (
                                <div className="p-4 text-sm text-gray-500">No outgoing requests</div>) : (
                                user.sentFriendRequests.map((id) => (
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
