import Navbar from "../Navbar/Navbar.tsx";
import {useUserStore} from "../../store/userStore.ts";
import {useEffect} from "react";

export default function Profile() {
    const user = useUserStore((s) => s.user);
    const isLoading = useUserStore((s) => s.isLoading);
    const error = useUserStore((s) => s.error);
    const fetchUser = useUserStore((s) => s.fetchUser);
    const profilePictureUrl = useUserStore((s) => s.profilePictureUrl);

    useEffect(() => {
        if (!user && !isLoading) {
            void fetchUser();
        }
    }, [user, isLoading, fetchUser]);

    if (isLoading) return <h1>Loading</h1>;
    if (error != null) return <h1>An unknown error occured</h1>;
    if (user == null) return <h1>Loading</h1>;


    return (
        <div className="min-h-screen flex bg-gray-50">
            <Navbar/>
            <main className="flex-1 p-6">
                <h1 className="text-2xl font-semibold mb-4">Profile</h1>
                <p>Userhandle is: {user.userHandle}</p>
                <img src={profilePictureUrl} alt="Profile Picture"
                     className="w-32 h-32 rounded-full mt-4"/>
            </main>
        </div>
    );
}