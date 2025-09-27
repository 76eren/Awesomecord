import './App.css'
import {Route, Routes} from "react-router-dom";
import Login from "./components/Login/Login.tsx";
import Home from "./components/Home/Home.tsx";
import Register from "./components/Register/Register.tsx";

function App() {
    return (
        <>
            <div className="container">
                <Routes>
                    <Route path="/" element={<Home /> }/>
                    <Route path="/login" element={<Login /> }/>
                    <Route path="/register" element={<Register /> }/>
                </Routes>
            </div>
        </>
    )

}

export default App
