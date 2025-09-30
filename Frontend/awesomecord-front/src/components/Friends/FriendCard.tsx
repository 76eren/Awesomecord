import React from "react";

type FriendCardProps = {
    userhandle: string;
    displayName: string;
    avatar: string;
    bio?: string;
    onMessage?: () => void;
    onRemove?: () => void;
};

export default function FriendCard({
                                       userhandle,
                                       displayName,
                                       avatar,
                                       bio,
                                       onMessage,
                                   }: FriendCardProps) {
    return (
        <div
            className="group flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-100  transition-colors cursor-pointer"
            role="button"
            tabIndex={0}
        >

            <div className="flex items-center gap-3 min-w-0">
                <img
                    src={avatar}
                    alt={`${displayName} avatar`}
                    className="h-10 w-10 rounded-full object-cover ring-1 ring-black/5"
                />
                <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                        <span className="font-medium truncate">{displayName}</span>
                        <span className="text-xs text-gray-500 truncate">{userhandle}</span>
                    </div>
                    {bio ? (
                        <p className="text-sm text-gray-500 truncate">{bio}</p>
                    ) : null}
                </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                    type="button"
                    onClick={onMessage}
                    className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-black/20"
                >
                    Message
                </button>
            </div>
        </div>
    );
}
