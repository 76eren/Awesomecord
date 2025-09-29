import Navbar from "../Navbar/Navbar.tsx";
import ChatNavigation from "./SelectableChats/ChatNavigation/ChatNavigation.tsx";

export default function Chats() {
    return (
        <div className="min-h-screen flex bg-gray-50">
            <Navbar />
            <main className="flex-1 p-6">
                <h1 className="text-2xl font-semibold mb-4">Chats</h1>
            </main>
        </div>
    );
}
