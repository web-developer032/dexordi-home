import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { AuthStateProvider } from "./context/AuthContext";

import "./App.css";
import "./styles/main.scss";
import App from "./App";

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthStateProvider>
                <App />
            </AuthStateProvider>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
);
