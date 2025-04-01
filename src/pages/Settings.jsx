import React, { useContext, useState } from "react";
import ThemeContext from "../context/ThemeContext";
import { IoLogOut } from "react-icons/io5";
import { doSignOut } from "../firebase/auth";
import { NavLink, useNavigate } from "react-router-dom";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { getAuth } from "firebase/auth";
import { useToast } from "../context/ToastContext";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import axios from "axios";

const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
];

const handleLogout = () => {
  doSignOut().then(() => {
    navigate("/");
  });
};

function Settings() {
  const { theme, changeTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { showToast } = useToast(); // Get showToast from context
  const [ deleteAccount, setDeleteAccount ] = useState(false);

  const handleDeletePrompt = () => {
    setDeleteAccount(!deleteAccount);
  };

  const handleDelete = async () => {
    // Handle account deletion logic here
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        const userDoc = doc(db, "users", user.uid); // Reference to the user's document in Firestore
        await deleteDoc(userDoc); // Delete the user's document from Firestore

        // const clerkApiKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY; // Get Clerk API key from environment variables
        // const userEmail = user.email; // Get the user's email from Firebase auth

        // const searchResponse = await axios.get(
        //   `https://api.clerk.dev/v1/users?email_address=${userEmail}`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${clerkApiKey}`,
        //     },
        //   }
        // );
  
        // const clerkUser = searchResponse.data[0]; // Assuming the first result is the correct user
  
        // if (clerkUser && clerkUser.id) {
        //   // Delete the Clerk user account
        //   await axios.delete(`https://api.clerk.dev/v1/users/${clerkUser.id}`, {
        //     headers: {
        //       Authorization: `Bearer ${clerkApiKey}`,
        //     },
        //   });
        // }

        await user.delete(); // Delete the user account
        showToast("Account deleted successfully"); // Display success toast
        handleLogout();// Redirect to home page or login page

      } catch (error) {
        console.error("Error deleting account:", error);
        showToast("Error deleting account. Please try again."); // Display error toast

      }
    } else {

      console.error("No user is currently signed in.");
      showToast("No user is currently signed in."); // Display error toast

    }
  }

  return (
    <div className="flex flex-col justify-center p-8 bg-base-200  min-h-screen">
      <div className="w-full bg-base-100 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 text-primary">Settings</h1>
          <button
            className="text-lg p-3 flex justify-center items-center rounded-xl bg-primary text-base-100 shadow-lg hover:bg-base-100 hover:text-primary ease-in-out duration-700 lg:hidden md:hidden"
            onClick={handleLogout}
          >
            <IoLogOut className="size-7 mr-2" />
            Logout
          </button>
        </div>
        <NavLink
          to="/in/about"
          className="text-xl gap-2 w-[50%] text-semibold text-base-100 rounded-2xl self-start my-4 flex items-center justify-center bg-primary p-3 md:hidden lg:hidden">
            <AiOutlineInfoCircle className="text-2xl"/>{"About us"}
        </NavLink>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-primary">
            Theme Switcher
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((themeName) => (
              <div
                key={themeName}
                className={`p-4 border rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300 ${
                  theme === themeName ? "border-4 border-primary" : ""
                }`}
                data-theme={themeName}
                onClick={() => changeTheme(themeName)}
              >
                <h3 className="text-lg font-semibold mb-2 capitalize">
                  {themeName}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <div className="w-8 h-8 bg-primary rounded"></div>
                  <div className="w-8 h-8 bg-secondary rounded"></div>
                  <div className="w-8 h-8 bg-accent rounded"></div>
                  <div className="w-8 h-8 bg-neutral rounded"></div>
                  <div className="w-8 h-8 bg-base-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <div className="flex flex-col justtify-center items-center mb-6">
          <h1 className="text-2xl font-semibold mb-2 text-red-500">{"Danger Zone"}</h1>
          {/*Delete Account Code*/}
          <button className="btn btn-error w-1/5 max-sm:w-1/2" onClick={handleDeletePrompt}>
            {"Delete Account"}
          </button>
          {deleteAccount && (
            <div>
              <div
                className="h-full w-full justify-center items-center flex bg-black bg-opacity-50 transition-colors duration-200 fixed z-40 top-0 left-0"
                onClick={handleDeletePrompt}
              ></div>
              <div className="bg-base-100 fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 rounded-lg shadow-lg w-2/5 h-2/5 max-sm:h-3/5 max-sm:w-4/5">
                <div className="flex flex-col justify-evenly items-center h-full w-full">
                  <h1 className="text-2xl font-semibold mb-2 text-primary">{"Delete Account"}</h1>
                  <p className="text-center mb-4">
                    {"Do you really want to delete your account? This action cannot be undone. And this puppy will be sad to see you go :("} 
                  </p>
                  <img src="/src/Assets/sad-puppy.jpg" alt="Sad Puppy" className="w-1/6 h-1/2 mb-4 max-sm:w-1/2"/>
                  <div className="flex justify-center w-full gap-6">
                    <button
                      className="btn btn-primary w-1/4 mb-4"
                      onClick={() => {
                        // Handle account deletion logic here
                        console.log("Account deleted");
                        handleDelete();
                      }}
                    >
                      {"Confirm 💔"}
                    </button>
                    <button
                      className="btn btn-neutral w-1/4"
                      onClick={handleDeletePrompt}
                    >
                      {"Cancel 👍"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
