import "./App.css";
import {Navigate, Route, Routes} from "react-router-dom";
import Login from "./components/login/login.tsx";
import Chats from "./components/chats/chats.tsx";
import Register from "./components/register/register.tsx";
import {GuestGuard} from "./guards/guest-guard.tsx";
import {ProtectedGuard} from "./guards/protected-guard.tsx";
import Notifications from "./components/notifications/notifications.tsx";
import ServerList from "./components/serverlist/server-list.tsx";
import Friends from "./components/friends/friends.tsx";
import {useAuth} from "./hooks/use-auth.ts";
import {useMemo} from "react";
import {UserUpdatesListener} from "./realtime/listeners/user-updates-listener.tsx";
import Profile from "./components/profile/profile.tsx";
import {SignalRRuntime} from "./realtime/signalrRuntime.tsx";
import {API_URL} from "./schema/constants.ts";
import {ConversationUpdateListener} from "./realtime/listeners/conversation-update-listener.tsx";

function App() {
    const {authenticated} = useAuth();

    const hubs = useMemo(
        () => [
            {key: "userupdates", path: "hubs/userupdates"},
            {key: "conversationupdate", path: "hubs/conversationupdates"},
            {key: "messages", path: "hubs/messages"},
            {key: "messageDeleted", path: "hubs/messages"},
            {key: "messageEdited", path: "hubs/messages"},
        ],
        []
    );

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <SignalRRuntime
                baseUrl={API_URL}
                hubs={hubs}
                autoConnect={authenticated}
            />
            {authenticated && <UserUpdatesListener/>}
            {authenticated && <ConversationUpdateListener/>}

            <Routes>
                <Route path="/" element={<Navigate to="/chats" replace/>}/>

                <Route
                    path="/login"
                    element={
                        <GuestGuard>
                            <Login/>
                        </GuestGuard>
                    }
                />

                <Route
                    path="/register"
                    element={
                        <GuestGuard>
                            <Register/>
                        </GuestGuard>
                    }
                />

                <Route
                    path="/notifications"
                    element={
                        <ProtectedGuard>
                            <Notifications/>
                        </ProtectedGuard>
                    }
                />

                <Route
                    path="/chats/:id"
                    element={
                        <ProtectedGuard>
                            <Chats/>
                        </ProtectedGuard>
                    }
                />

                <Route
                    path="/chats"
                    element={
                        <ProtectedGuard>
                            <Chats/>
                        </ProtectedGuard>
                    }
                />

                <Route
                    path="/servers"
                    element={
                        <ProtectedGuard>
                            <ServerList/>
                        </ProtectedGuard>
                    }
                />

                <Route
                    path="/add-friend"
                    element={
                        <ProtectedGuard>
                            <Friends/>
                        </ProtectedGuard>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedGuard>
                            <Profile/>
                        </ProtectedGuard>
                    }
                />
            </Routes>
        </div>
    );
}

export default App;
