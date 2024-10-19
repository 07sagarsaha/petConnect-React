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
} from "react-router-dom";
import Home from "./pages/home.jsx";
import Profile from "./pages/profile.jsx";
import AiChat from "./pages/AiChat.jsx";
import About from "./pages/About.jsx";
import Settings from "./pages/Settings.jsx";
import Register from "./pages/auth/signup.jsx";
import Landing from "./pages/landing/landing.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/ai-chat" element={<AiChat />} />
      <Route path="/about" element={<About />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/register" element={<Register />} />
      <Route path="/landing" element={<Landing />} />
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
