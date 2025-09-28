import './App.css'
import {Navigate, Route, Routes} from "react-router-dom";
import Login from "./components/Login/Login.tsx";
import ChatsList from "./components/ChatsList/ChatsList.tsx";
import Register from "./components/Register/Register.tsx";
import {GuestGuard} from "./guards/GuestGuard.tsx";
import {ProtectedGuard} from "./guards/ProtectedGuard.tsx";
import NotificationsList from "./components/Notifications/NotificationsList.tsx";
import ServerList from "./components/ServerList/ServerList.tsx";

function App() {
    return (
        <div className="container">
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
                            <NotificationsList />
                        </ProtectedGuard>
                    }
                />

                <Route
                    path="/chats"
                    element={
                        <ProtectedGuard>
                            <ChatsList />
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
            </Routes>
        </div>
    );
}

export default App;