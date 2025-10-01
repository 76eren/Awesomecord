import Navbar from "../Navbar/Navbar.tsx";
import {useUserContext} from "../../lib/user-context.tsx";

export default function Notifications() {
    const { user, isLoading, error } = useUserContext();
    if (isLoading) {
        return (
            <>
                <h1>Loading</h1>
            </>
        )
    }

    if (error != null) {
        return (
            <h1>An unknown error occured</h1>
            )
    }



    return (
        <div className="min-h-screen flex bg-gray-50">
            <Navbar />
            <main className="flex-1 p-6">
                <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
            </main>
        </div>
    );
}