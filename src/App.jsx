import React, { useEffect } from "react";
import SideNav from "./components/SideNav";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/authContext/authContext";
import "../src/App.css";
import { ThemeProvider } from "./context/ThemeContext";
import { useTour } from "./context/TourContext";
import InteractiveTour from "./components/InteractiveTour";

function App() {
  const { userLoggedIn } = useAuth();
  const { showTour, tourType, endTour } = useTour();

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
        <div className="flex flex-row max-lg:flex-col max-lg:justify-center bg-base-200">
          <div className="">
            <SideNav />
          </div>
          <div className="w-full lg:ml-[16%] max-md:ml-0 md:ml-0 max-sm:ml-0 sm:ml-0 max-lg:ml-[14%] max-lg:mb-24">
            <Outlet />
          </div>
        </div>
        {showTour && <InteractiveTour onClose={endTour} tourType={tourType} />}
      </div>
    </ThemeProvider>
  );
}

export default App;
