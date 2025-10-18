import React, {useEffect} from "react";
import Navbar from "../Navbar/Navbar.tsx";
import FriendCard from "./FriendCard";
import type {CreateFriendRequestModel} from "../../Models/friend/createFriendRequest.model.ts";
import {initiateFriendRequest} from "../../services/friendService.ts";
import {toast, ToastContainer} from "react-toastify";
import {useUserStore} from "../../store/userStore.ts";

type Friend = {
    id: string;
    userhandle: string;
    displayName: string;
    avatar: string;
    bio?: string;
};

export default function Friends() {
    const user = useUserStore((s) => s.user);
    const isLoading = useUserStore((s) => s.isLoading);
    const error = useUserStore((s) => s.error);
    const fetchUser = useUserStore((s) => s.fetchUser);

    useEffect(() => {
        if (!user && !isLoading) {
            void fetchUser();
        }
    }, [user, isLoading, fetchUser]);


    const handleMessage = (friend: Friend) => () => {
        alert(`Start chat with ${friend.displayName}`);
    };

    const [input, setInput] = React.useState<string>("");
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value ?? "");
    };

    async function sendFriendRequest(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        let model: CreateFriendRequestModel;
        model = {
            ReceiverHandle: input
        };

        try {
            await initiateFriendRequest(model);
            toast.success("Friend successfully!");
            setInput("");
        } catch (error) {
            toast.error("Failed to send friend request.");
        }
    }

    if (isLoading) return <h1 className="text-center mt-20 text-lg font-medium">Loading...</h1>;
    if (error != null) return <h1 className="text-center mt-20 text-lg font-medium text-red-600">An unknown error
        occurred.</h1>;
    if (user == null) return <h1 className="text-center mt-20 text-lg font-medium">Loading...</h1>;

    return (
        <>
            <ToastContainer/>
            <div className="min-h-screen flex bg-gray-50">
                <Navbar/>
                <main className="flex-1 p-6 flex flex-col h-screen max-h-screen">
                    <section>
                        <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-black">
                            Add friends
                        </h1>

                        <div className="mb-6">
                            <form className="flex" onSubmit={sendFriendRequest}>
                                <input
                                    type="text"
                                    placeholder="Enter a @userhandle"
                                    className="flex-1 p-2 border border-gray-500 rounded-l-md focus:outline-none focus:ring-2 focus:ring-black/20"
                                    onChange={handleChange}
                                    value={input}
                                    required

                                />
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Send Friend Request
                                </button>
                            </form>
                        </div>
                    </section>

                    <section className="flex-1 flex flex-col min-h-0">
                        <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-2">
                            Your friends
                        </h2>

                        {user.friends.length !== 0 && (
                            <div
                                className="overflow-y-auto max-h-[75vh] rounded-lg border border-gray-200 dark:border-neutral-800 bg-white divide-y divide-gray-200 dark:divide-neutral-800">
                                {user.friends.map((friendId) => (
                                    <FriendCard key={friendId} friendId={friendId}/>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </>
    );
}
