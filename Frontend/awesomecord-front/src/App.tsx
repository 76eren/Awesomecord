import './App.css'
import {Navigate, Route, Routes} from "react-router-dom";
import Login from "./components/Login/Login.tsx";
import Home from "./components/Home/Home.tsx";
import Register from "./components/Register/Register.tsx";
import {GuestGuard} from "./guards/GuestGuard.tsx";
import {ProtectedGuard} from "./guards/ProtectedGuard.tsx";

function App() {
    return (
        <div className="container">
            <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />

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
                    path="/home"
                    element={
                        <ProtectedGuard>
                            <Home />
                        </ProtectedGuard>
                    }
                />
            </Routes>
        </div>
    );
}

export default App;