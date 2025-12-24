import Navbar from "../navbar/navbar.tsx";

export default function ServerList() {
    return (
        <div className="min-h-screen flex bg-gray-50">
            <Navbar/>
            <main className="flex-1 p-6">
                <h1 className="text-2xl font-semibold mb-4">Servers</h1>
            </main>
        </div>
    );
}