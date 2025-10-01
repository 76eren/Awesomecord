import './App.css'
import {Navigate, Route, Routes} from "react-router-dom";
import Login from "./components/Login/Login.tsx";
import Chats from "./components/Chats/Chats.tsx";
import Register from "./components/Register/Register.tsx";
import {GuestGuard} from "./guards/GuestGuard.tsx";
import {ProtectedGuard} from "./guards/ProtectedGuard.tsx";
import Notifications from "./components/Notifications/Notifications.tsx";
import ServerList from "./components/ServerList/ServerList.tsx";
import Friends from "./components/Friends/Friends.tsx";

function App() {
    return (
        <div className="min-h-screen w-full bg-gray-50">
            <Routes>
                <Route path="/" element={<Navigate to="/chats" replace />} />

                <Route
                    path="/login"
                    element={
                        <GuestGuard>
                            <Login />
                        </GuestGuard>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <GuestGuard>
                            <Register />
                        </GuestGuard>
                    }
                />
                <Route
                    path="/notifications"
                    element={
                        <ProtectedGuard>
                            <Notifications />
                        </ProtectedGuard>
                    }
                />

                <Route
                    path="/chats"
                    element={
                        <ProtectedGuard>
                            <Chats />
                        </ProtectedGuard>
                    }
                />

                <Route
                    path="/servers"
                    element={
                        <ProtectedGuard>
                            <ServerList />
                        </ProtectedGuard>
                    }
                />

                <Route
                    path="/add-friend"
                    element={
                        <ProtectedGuard>
                            <Friends />
                        </ProtectedGuard>
                    }
                />
            </Routes>
        </div>
    );
}

export default App;