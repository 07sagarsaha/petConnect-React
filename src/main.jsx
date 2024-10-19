import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import {
  BrowserRouter,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Routes,
} from "react-router-dom";
import Home from "./pages/home.jsx";
import Profile from "./pages/profile.jsx";
import AiChat from "./pages/AiChat.jsx";
import About from "./pages/About.jsx";
import Settings from "./pages/Settings.jsx";
import Register from "./pages/auth/signup.jsx";
import Landing from "./pages/landing/landing.jsx";
import Login from "./pages/auth/login.jsx";
import { AuthProvider } from "./context/authContext/authContext.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/in" element={<App />}>
        <Route path="/in/home" element={<Home />} />
        <Route path="/in/profile" element={<Profile />} />
        <Route path="/in/ai-chat" element={<AiChat />} />
        <Route path="/in/about" element={<About />} />
        <Route path="/in/settings" element={<Settings />} />
      </Route>
      <Route path="/signup" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Landing />} />
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
