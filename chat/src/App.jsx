import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from 'react';
import LoginPage from './Login';
import MainPage from './MainPage';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/home" element={<MainPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
