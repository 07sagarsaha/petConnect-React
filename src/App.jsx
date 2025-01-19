import React, { useEffect } from "react";
import SideNav from "./components/SideNav";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/authContext/authContext";
import "../src/App.css";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const { userLoggedIn } = useAuth();

  useEffect(() => {
    if (
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission();
    }
  }, []);

  return (
    <ThemeProvider>
      <div>
        {!userLoggedIn && <Navigate to={"/"} replace={true} />}
        <div className="flex flex-row sm:justify-start">
          <div className="fixed">
            <SideNav />
          </div>
          <div className="w-full ml-20 sm:ml-[200px]">
            <Outlet />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
