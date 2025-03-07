import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./global.css";
import "@fontsource-variable/inter";
import { ThemeProvider } from "./components/ThemeProvider";
import OpenSettings from "./components/OpenSettings";
import { SettingsProvider } from "./contexts/SettingsContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider defaultTheme="dark">
            <SettingsProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={(
                            <div
                            className="relative rounded-lg shadow-md mt-5 px-5"
                            style={{ zoom: 0.5 }}
                        >
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-background">
                                <div className="wrapper my-[10px] -translate-x-1/2 w-screen h-screen rounded-lg">
                                    <App />
                                </div>
                            </div>
                        </div>
                        )} />
                        <Route path="/open-settings" element={<OpenSettings />} />
                    </Routes>
                </BrowserRouter>
            </SettingsProvider>
        </ThemeProvider>
    </React.StrictMode>
);
