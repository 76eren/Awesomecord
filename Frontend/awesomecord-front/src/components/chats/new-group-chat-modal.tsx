import React, {useEffect, useMemo, useState} from "react";
import {useUserStore} from "../../store/user-store.ts";
import type {LimitedUserModel} from "../../models/user/limited-user.model.ts";
import {GetMultipleUsersByIds, getProfilePictureUrlByUserId} from "../../services/user-service.ts";
import {createConversation} from "../../services/conversation-service.ts";

type NewGroupChatModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: (payload: { selectedIds: string[]; title: string }) => void;
};

export default function NewGroupChatModal({isOpen, onClose, onCreated}: NewGroupChatModalProps) {
    const currentUser = useUserStore((s) => s.user);

    const [friends, setFriends] = useState<LimitedUserModel[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(false);
    const [friendsError, setFriendsError] = useState<string | null>(null);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const canSubmit = useMemo(
        () => selectedIds.length > 1 && !submitting && title.trim().length > 0,
        [selectedIds, submitting, title]
    );

    useEffect(() => {
        if (!isOpen) return;
        setSubmitError(null);
        setFriendsError(null);
        setSelectedIds([]);
        setTitle("");

        const loadFriends = async () => {
            const friendIds = currentUser?.friends ?? [];
            if (friendIds.length === 0) {
                setFriends([]);
                return;
            }
            setLoadingFriends(true);
            try {
                const users = await GetMultipleUsersByIds(friendIds);
                setFriends(users);
            } catch (e) {
                setFriendsError("Failed to load friends.");
                setFriends([]);
            } finally {
                setLoadingFriends(false);
            }
        };
        void loadFriends();
    }, [isOpen, currentUser?.friends]);

    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedTitle = title.trim();

        if (selectedIds.length < 1) return;
        if (trimmedTitle.length === 0) {
            setSubmitError("Please enter a group name.");
            return;
        }

        if (submitting) return;

        setSubmitting(true);
        setSubmitError(null);
        try {
            await createConversation(selectedIds, trimmedTitle);
            onClose();
            onCreated?.({selectedIds, title: trimmedTitle});
        } catch (e) {
            setSubmitError("Failed to create group chat. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const titleIsEmpty = title.trim().length === 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose}/>

            <div className="relative bg-white w-full max-w-lg mx-4 rounded-xl shadow-xl border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">New Group Chat</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4" noValidate>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Group name</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a group name"
                            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${titleIsEmpty ? "border-red-300 focus:ring-red-500" : "focus:ring-blue-500"}`}
                            required
                            aria-invalid={titleIsEmpty}
                            aria-describedby="group-name-help"
                        />
                        {titleIsEmpty && (
                            <p id="group-name-help" className="mt-1 text-xs text-red-600">
                                A group name is required.
                            </p>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Select friends</label>
                            <span className="text-xs text-gray-500">{selectedIds.length} selected</span>
                        </div>
                        {loadingFriends ? (
                            <div className="text-sm text-gray-500">Loading friends...</div>
                        ) : friendsError ? (
                            <div className="text-sm text-red-600">{friendsError}</div>
                        ) : friends.length === 0 ? (
                            <div className="text-sm text-gray-500">You have no friends to add yet.</div>
                        ) : (
                            <ul className="max-h-64 overflow-auto divide-y divide-gray-100 border rounded-lg">
                                {friends.map((f) => {
                                    const checked = selectedIds.includes(f.id);
                                    return (
                                        <li key={f.id} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                                            <input
                                                id={`friend-${f.id}`}
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleSelection(f.id)}
                                                className="h-4 w-4"
                                            />
                                            <img
                                                src={getProfilePictureUrlByUserId(f.id)}
                                                alt={f.displayName}
                                                className="w-8 h-8 rounded-full border"
                                            />
                                            <label htmlFor={`friend-${f.id}`} className="flex-1 cursor-pointer">
                                                <div className="font-medium text-gray-800">{f.displayName}</div>
                                                <div className="text-xs text-gray-500">@{f.userHandle}</div>
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {submitError && <div className="text-sm text-red-600">{submitError}</div>}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className={`px-4 py-2 rounded-lg text-white ${canSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"}`}
                        >
                            {submitting ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
