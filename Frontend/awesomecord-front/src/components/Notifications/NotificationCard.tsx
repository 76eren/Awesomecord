import React, {useEffect, useState} from "react";
import type {LimitedUserModel} from "../../Models/User/limitedUser.model.ts";
import {getProfilePictureUrlByUserId, getUserById} from "../../services/userService.ts";

type NotificationCardProps = {
    userId: string;
    isIncoming: boolean;
    onAccept: () => Promise<void> | void;
    onDeny: () => Promise<void> | void;
    loading?: boolean;
};

export function NotificationCard({
                                     userId,
                                     onAccept,
                                     onDeny,
                                     loading = false,
                                     isIncoming = false
                                 }: NotificationCardProps) {
    const [user, setUser] = useState<LimitedUserModel | null>(null);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        let mounted = true;
        setIsFetching(true);
        getUserById(userId)
            .then((u) => {
                if (mounted) setUser(u ?? null);
            })
            .finally(() => {
                if (mounted) setIsFetching(false);
            });
        return () => {
            mounted = false;
        };
    }, [userId]);


    if (isFetching) {
        return (
            <h1>Loading</h1>
        )
    }

    return (
        <div
            className="group flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            role="group"
            aria-label={`Request from ${user?.displayName ?? ""}`}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-12 w-12 shrink-0">
                    <img
                        src={getProfilePictureUrlByUserId(userId)}
                        alt={`${user?.displayName ?? "User"} avatar`}
                        className="h-12 w-12 rounded-full object-cover ring-1 ring-black/5"
                    />
                </div>

                <div className="min-w-0">
                    <div className="flex items-baseline gap-2 min-w-0">
                        <span className="font-medium truncate">{user.displayName}</span>
                        <span className="text-xs text-gray-500 truncate">@{user.userHandle}</span>
                    </div>

                    <div className="mt-0.5 min-h-[1.25rem]">
                        <p className="text-sm text-gray-500 truncate">{user.bio}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {isIncoming ? (
                    <button
                        type="button"
                        onClick={onDeny}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-60 disabled:cursor-not-allowed"
                        aria-label={`Deny request from ${user?.displayName ?? ""}`}>
                        <span className="inline-flex items-center gap-2">
                            <span>Decline</span>
                        </span>
                    </button>) : null}


                {isIncoming ? (
                    <button
                        type="button"
                        onClick={onAccept}
                        disabled={loading}
                        className="rounded-md border border-transparent bg-gray-900 text-white px-3 py-1.5 text-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-60 disabled:cursor-not-allowed"
                        aria-label={`Accept request from ${user?.displayName ?? ""}`}
                    >
                        <span className="inline-flex items-center gap-2">
                            <span>Accept</span>
                        </span>
                    </button>
                ) : null}

            </div>
        </div>
    );
}

