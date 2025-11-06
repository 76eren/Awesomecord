import React from "react";
import type {MessageModel} from "../../Models/Conversation/message.model.ts";
import {getConversationImages} from "../../services/conversationService.ts";
import {getProfilePictureUrlByUserId} from "../../services/userService.ts";

interface MessageItemProps {
    message: MessageModel;
    currentUserId: string;
    displayName: string;
    onDelete: (id: string) => void;
    onEdit: (message: MessageModel) => void;
}

const MessageItem = React.memo(({message: m, currentUserId, displayName, onDelete, onEdit}: MessageItemProps) => {
    const mine = m.senderId === currentUserId;
    const avatarUrl = getProfilePictureUrlByUserId(m.senderId);
    const time = new Date(m.sentAt);

    return (
        <div
            className={`relative group flex items-end gap-3 ${mine ? "justify-end" : "justify-start"}`}
        >
            {mine && (
                <div>
                    <button
                        type="button"
                        onClick={() => onDelete(m.id)}
                        className="absolute -top-6 right-10 invisible group-hover:visible focus:opacity-100
                        pointer-events-none group-hover:pointer-events-auto focus:pointer-events-auto
                        transition-opacity bg-white border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-300
                        shadow-sm rounded-full px-2 py-1 text-xs"
                        title="Delete message"
                        aria-label="Delete message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                             className="h-4 w-4">
                            <path
                                d="M9 3a1 1 0 0 0-1 1v1H5.5a1 1 0 1 0 0 2H6v12a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7h.5a1 1 0 1 0 0-2H16V4a1 1 0 0 0-1-1H9zm2 2h2v1h-2V5zM9 9a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0v-8a1 1 0 0 1 1-1zm5 0a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0v-8a1 1 0 0 1 1-1z"/>
                        </svg>
                    </button>

                    <button
                        type="button"
                        onClick={() => onEdit(m)}
                        className="
                        absolute -top-6 right-20 invisible group-hover:visible focus:opacity-100
                        pointer-events-none group-hover:pointer-events-auto focus:pointer-events-auto
                        transition-opacity bg-white border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-300
                        shadow-sm rounded-full px-2 py-1 text-xs"
                        title="Edit message"
                        aria-label="Edit message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4"
                             fill="currentColor" aria-hidden="true">
                            <path
                                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
                        </svg>
                    </button>
                </div>
            )}

            {!mine && (
                <img src={avatarUrl} alt={displayName}
                     className="h-8 w-8 rounded-full object-cover border border-gray-200"/>
            )}

            <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 shadow-sm ${mine ? "bg-indigo-600 text-white" : "bg-white text-gray-900 border border-gray-200"}`}
            >
                <div className="flex items-baseline gap-2">
                    {!mine && <span className="text-xs font-semibold text-gray-700">{displayName}</span>}
                    <span
                        className={`text-[10px] ${mine ? "text-indigo-100" : "text-gray-400"}`}>{time.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    })}</span>
                </div>

                {m.body && (
                    <>
                        <div className="mt-0.5 whitespace-pre-wrap break-words text-sm">{m.body}</div>
                        {m.editedAt != null && m.editedAt !== "" && (
                            <span
                                className={`text-[10px] ${mine ? "text-indigo-100" : "text-gray-400"}`}>Edited at {new Date(m.editedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                            })}</span>
                        )}
                    </>
                )}

                {m.attachmentHash && (
                    <img
                        src={getConversationImages(m.conversationId, m.attachmentHash)}
                        alt="attachment"
                        className="mt-2 max-w-[300px] max-h-[300px] object-contain rounded"
                    />
                )}
            </div>

            {mine && (
                <img src={avatarUrl} alt="You"
                     className="h-8 w-8 rounded-full object-cover border border-gray-200"/>
            )}
        </div>
    );
});

MessageItem.displayName = "MessageItem";

export default MessageItem;
