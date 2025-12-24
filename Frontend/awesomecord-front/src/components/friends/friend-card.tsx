import {useEffect, useState} from "react";
import type {LimitedUserModel} from "../../models/user/limited-user.model.ts";
import {getProfilePictureUrlByUserId, getUserById} from "../../services/user-service.ts";
import {toast} from "react-toastify";
import {deleteFriendFromFriendslist} from "../../services/friend-service.ts";
import {createConversation} from "../../services/conversation-service.ts";

type FriendCardProps = {
    friendId: string
};

export default function FriendCard(props: FriendCardProps) {
    const [friend, setFriend] = useState<LimitedUserModel>(null);

    useEffect(() => {
        const fetchFriend = async () => {
            const friend = await getUserById(props.friendId);
            setFriend(friend);
        };
        void fetchFriend();
    }, [props.friendId]);

    if (friend == null) {
        return (
            <>
                <h1>Loading</h1>
            </>
        )
    }

    async function deleteFriend(friendId: string) {
        try {
            await deleteFriendFromFriendslist(friendId);
            toast.success("Friend deleted");
        } catch (e) {
            console.error(e);
        }
    }

    async function startConversation() {
        let id = [props.friendId];
        createConversation(id).then(() => {
            window.location.href = `/chats`;
        }).catch((e) => {
            console.error(e);
        });
    }


    return (
        <>
            <div
                className="group flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-100  transition-colors cursor-pointer"
                role="button"
                tabIndex={0}
            >

                <div className="flex items-center gap-3 min-w-0">
                    <img
                        src={getProfilePictureUrlByUserId(friend.userHandle)}
                        alt={`${friend.displayName} avatar`}
                        className="h-15 w-15 rounded-full object-cover ring-1 ring-black/5"
                    />
                    <div className="min-w-0">
                        <div className="flex items-baseline gap-2">
                            <span className="font-medium truncate">{friend.displayName}</span>
                            <span className="text-xs text-gray-500 truncate">@{friend.userHandle}</span>
                        </div>
                        {friend.bio ? (
                            <p className="text-sm text-gray-500 truncate">{friend.bio}</p>
                        ) : null}
                    </div>
                </div>

                <div
                    className="flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button
                        onClick={() => {
                            startConversation();
                        }}
                        type="button"
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 hover:bg-gray-300"
                    >
                        Message
                    </button>
                    <button
                        type="button"
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 bg-red-600 text-white hover:bg-red-800"
                        onClick={() => {
                            void deleteFriend(friend.id)
                        }}
                    >
                        Remove friend
                    </button>
                </div>
            </div>
        </>

    );
}
