import Navbar from "../Navbar/Navbar.tsx";
import ChatNavigation from "./ChatNavigation.tsx";
import {useSelectedConversationStore} from "../../store/selectedConversationStore.ts";
import type {ConversationModel} from "../../Models/Conversation/conversation.model.ts";
import type {LimitedUserModel} from "../../Models/User/limitedUser.model.ts";

export default function Chats() {
    const selectedConversation: ConversationModel = useSelectedConversationStore(s => s.selectedConversation);
    const selectedUsers: LimitedUserModel[] = useSelectedConversationStore(s => s.participants);

    const somethingIsSelected = selectedConversation && selectedUsers;

    return (
        <div className="min-h-screen flex bg-gray-50">
            <Navbar/>
            <ChatNavigation/>
            <main className="flex-1 p-6">
                {somethingIsSelected ? (
                    <div className="chats">
                        

                    </div>
                ) : (
                    <h1>No chat selected!</h1>
                )}
            </main>
        </div>
    );
}
