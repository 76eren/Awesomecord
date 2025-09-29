import Navbar from "../Navbar/Navbar.tsx";

export default function NotificationsList() {
    return (
        <div className="min-h-screen flex bg-gray-50">
            <Navbar />
            <main className="flex-1 p-6">
                <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
                {/* ... */}
            </main>
        </div>
    );
}