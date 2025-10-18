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

    if (isLoading) return <h1 className="text-center mt-20 text-lg font-medium">Loading...</h1>;
    if (error != null) return <h1 className="text-center mt-20 text-lg font-medium text-red-600">An unknown error
        occurred.</h1>;
    if (user == null) return <h1 className="text-center mt-20 text-lg font-medium">Loading...</h1>;

    return (
        <div className="min-h-screen flex bg-white">
            <Navbar/>
            <main className="flex-1 flex justify-center items-center p-6">
                <div className="w-full max-w-lg bg-white shadow-md rounded-2xl p-8 border border-gray-100">
                    <div className="flex flex-col items-center text-center">
                        <img
                            src={profilePictureUrl}
                            alt="Profile Picture"
                            className="w-32 h-32 rounded-full object-cover mb-4 border border-gray-200"
                        />
                        <h1 className="text-2xl font-semibold">{user.displayName}</h1>
                        <p className="text-gray-500 mb-2">@{user.userHandle}</p>
                        {user.bio && <p className="text-gray-700 text-sm mb-4">{user.bio}</p>}
                    </div>

                    <div className="mt-6 space-y-2 text-gray-800">
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="font-medium">Full Name:</span>
                            <span>{user.firstName} {user.lastName}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="font-medium">Email:</span>
                            <span>{user.email}</span>
                        </div>
                        {user.phone && (
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="font-medium">Phone:</span>
                                <span>{user.phone}</span>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
