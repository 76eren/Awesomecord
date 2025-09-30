import React from "react";
import Navbar from "../Navbar/Navbar.tsx";
import FriendCard from "./FriendCard";

type Friend = {
    id: string;
    userhandle: string;
    displayName: string;
    avatar: string;
    bio?: string;
};

export default function Friends() {
    // Mock data to be loaded dynamically later
    const mockFriends: Friend[] = [
        {
            id: "1",
            userhandle: "@johnny",
            displayName: "Johnny Silver",
            avatar: "https://w7.pngwing.com/pngs/223/244/png-transparent-computer-icons-avatar-user-profile-avatar-heroes-rectangle-black-thumbnail.png",
            bio: "Keyboard warrior. Coffee enthusiast.",
        },
        {
            id: "2",
            userhandle: "@sara",
            displayName: "Sara Frost",
            avatar: "https://w7.pngwing.com/pngs/223/244/png-transparent-computer-icons-avatar-user-profile-avatar-heroes-rectangle-black-thumbnail.png",
            bio: "Loves TypeScript and climbing.",
        },
        {
            id: "3",
            userhandle: "@marston",
            displayName: "John Marston",
            avatar:
                "https://w7.pngwing.com/pngs/223/244/png-transparent-computer-icons-avatar-user-profile-avatar-heroes-rectangle-black-thumbnail.png",
            bio: "Outlaw turned rancher.",
        },
        {
            id: "4",
            userhandle: "@pixelpete",
            displayName: "Pixel Pete",
            avatar: "https://w7.pngwing.com/pngs/223/244/png-transparent-computer-icons-avatar-user-profile-avatar-heroes-rectangle-black-thumbnail.png",
            bio: "Game dev, midnight commits.",
        }
    ];

    const handleMessage = (friend: Friend) => () => {
        alert(`Start chat with ${friend.displayName}`);
    };


    return (
        <>
            <div className="min-h-screen flex bg-gray-50">
                <Navbar />
                <main className="flex-1 p-6 flex flex-col h-screen max-h-screen">
                    <section>
                        <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-black">
                            Add friends
                        </h1>

                        <div className="mb-6">
                            <form className="flex">
                                <input
                                    type="text"
                                    placeholder="Enter a @userhandle"
                                    className="flex-1 p-2 border border-gray-500 rounded-l-md focus:outline-none focus:ring-2 focus:ring-black/20"
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

                        <div
                            className="flex-1 overflow-y-auto rounded-lg border border-gray-200 dark:border-neutral-800
                       bg-white divide-y divide-gray-200 dark:divide-neutral-800"
                        >
                            {mockFriends.map((f) => (
                                <FriendCard
                                    key={f.id}
                                    userhandle={f.userhandle}
                                    displayName={f.displayName}
                                    avatar={f.avatar}
                                    bio={f.bio}
                                    onMessage={handleMessage(f)}
                                />
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
