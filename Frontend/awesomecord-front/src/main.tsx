import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import {BrowserRouter} from "react-router-dom";
import Wrapper from "./Wrapper.tsx";


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Wrapper/>
        </BrowserRouter>
    </StrictMode>,
)
