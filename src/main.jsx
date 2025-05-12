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
import UserProfile from "./pages/UserProfile.jsx";
import Admin from "./pages/Admin.jsx";
import { AuthProvider } from "./context/authContext/authContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ClerkProvider } from "@clerk/clerk-react";
import ErrorBoundary from "./components/auth/ErrorBoundary.jsx";
import Chat from "./pages/Chat.jsx";
import ChatList from "./pages/ChatList.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { TourProvider } from "./context/TourContext.jsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Clerk publishable key not found");
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/in" element={<App />}>
        <Route path="/in/home" element={<Home />} />
        <Route path="/in/profile" element={<Profile />} />
        <Route path="/in/messages" element={<ChatList />} />
        <Route path="/in/chat/:userId" element={<Chat />} />
        <Route path="/in/ai-chat" element={<AiChat />} />
        <Route path="/in/about" element={<About />} />
        <Route path="/in/settings" element={<Settings />} />
        <Route path="/in/profile/:userId" element={<UserProfile />} />
      </Route>
      <Route path="/signup" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Landing />} />
      <Route path="/admin" element={<Admin />} />
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        appearance={{
          elements: {
            formButtonPrimary: "primary-button",
            card: "clerk-card",
          },
        }}
        signInUrl="/login"
        signUpUrl="/signup"
        signInFallbackRedirectUrl={"/in/home"}
        signUpFallbackRedirectUrl={"/in/home"}
      >
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <TourProvider>
                <RouterProvider router={router} />
              </TourProvider>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </ClerkProvider>
    </ErrorBoundary>
  </StrictMode>
);
