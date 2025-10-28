import App from "./App.tsx";
import {ToastContainer} from "react-toastify";

export default function Wrapper() {

    return (
        <>
            <App/>
            <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} newestOnTop closeOnClick
                            rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" limit={3}/>
        </>
    )
}