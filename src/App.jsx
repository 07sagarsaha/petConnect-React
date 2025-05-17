import React, { useEffect } from "react";
import SideNav from "./components/SideNav";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/authContext/authContext";
import "../src/App.css";
import { ThemeProvider } from "./context/ThemeContext";
import { useTour } from "./context/TourContext";
import InteractiveTour from "./components/InteractiveTour";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase/firebase";

function App() {
  const { userLoggedIn, user } = useAuth();
  const { showTour, tourType, endTour, startTour, hasTourBeenCompleted } =
    useTour();
  const location = useLocation();

  // Check if it's the user's first login
  useEffect(() => {
    const checkFirstTimeUser = async () => {
      if (userLoggedIn && user) {
        try {
          const userRef = doc(db, "users", user.id);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();

            // If the user has never seen the tour, show it
            if (!hasTourBeenCompleted("general")) {
              startTour("general");

              // Update the user document to indicate they've seen the tour
              await setDoc(
                userRef,
                {
                  ...userData,
                  hasSeenTour: true,
                },
                { merge: true }
              );
            }
          }
        } catch (error) {
          console.error("Error checking first-time user:", error);
        }
      }
    };

    checkFirstTimeUser();
  }, [userLoggedIn, user, hasTourBeenCompleted, startTour]);

  // Request notification permissions
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
          <div className="w-full lg:ml-[16%] max-md:ml-0 md:ml-0 max-sm:ml-0 sm:ml-0 max-lg:ml-[14%] lg:pl-10 max-lg:mb-24">
            <Outlet />
          </div>
        </div>
        {showTour && <InteractiveTour onClose={endTour} tourType={tourType} />}
      </div>
    </ThemeProvider>
  );
}

export default App;
