import React, { useContext, useEffect, useState } from "react";
import { MdAdminPanelSettings } from "react-icons/md";
import ThemeContext from "../context/ThemeContext";
import { IoLogOut } from "react-icons/io5";
import { doSignOut } from "../firebase/auth";
import { NavLink, useNavigate } from "react-router-dom";
import { AiOutlineInfoCircle, AiOutlineUser } from "react-icons/ai";
import { getAuth } from "firebase/auth";
import { useToast } from "../context/ToastContext";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import sad_puppy from "../Assets/sad-puppy.jpg";
import axios from "axios";
import { useClerk, useUser, useSignIn } from "@clerk/clerk-react";
import Feedback from "../components/Feedback";
import InteractiveTour from "../components/InteractiveTour";
import { useTour } from "../context/TourContext";
import { FaComments } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";


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

function Settings() {
  const { signOut } = useClerk();
  const { signIn } = useSignIn();
  const { theme, changeTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { showToast } = useToast(); // Get showToast from context
  const [deleteAccount, setDeleteAccount] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const { user } = useUser();
  const { startTour } = useTour();
  const [showTour, setShowTour] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Error during sign out:", err);
    }
  };

  const handleDeletePrompt = () => {
    setDeleteAccount(!deleteAccount);
  };

  const handleConfirmDelete = () => {
    setConfirmDelete(!confirmDelete);
    setEmail("");
  };
  useEffect(() => {
    if (user) {
      handleIsAdmin();
    }
  }, [user]);

  const handleIsAdmin = async () => {
    try {
      const userRef = doc(db, "users", user.id);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data:", userData.isAdmin);
        setIsAdmin(userData.isAdmin);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error getting document:", error);
    }
  };

  const handleDelete = async () => {
    if (!email) {
      showToast("Please enter your email to confirm deletion.");
      return;
    }

    if (user) {
      try {
        if (user.emailAddresses[0].emailAddress !== email) {
          showToast("Email does not match. Please try again.");
          return;
        }

        const userDoc = doc(db, "users", user.id);
        await deleteDoc(userDoc);

        const postDoc = doc(db, "posts", user.id);
        await deleteDoc(postDoc);

        await user.delete(); // Delete the user account
        showToast("Account deleted successfully"); // Display success toast
        handleLogout(); // Redirect to home page or login page
      } catch (error) {
        console.error("Error deleting account:", error);
        showToast("Error deleting account. Please try again."); // Display error toast
      }
    } else {
      console.error("No user is currently signed in.");
      showToast("No user is currently signed in."); // Display error toast
    }
  };

  const handleStartGeneralTour = () => {
    console.log("Starting general tour");
    showToast("Starting tour...");
    startTour('general');
  };
  
  const handleStartMessagingTour = () => {
    console.log("Starting messaging tour");
    showToast("Starting messaging tour...");
    startTour('messaging');
  };
  
  const handleStartPostingTour = () => {
    console.log("Starting posting tour");
    showToast("Starting posting tour...");
    startTour('posting');
  };
  
  const handleStartProfileTour = () => {
    console.log("Starting profile tour");
    showToast("Starting profile editing tour...");
    startTour('profile');
  };

  useEffect(() => {
    if (showTour) {
      console.log("Tour is now visible");
    }
  }, [showTour]);

  return (
    <div className="flex flex-col justify-center p-4 bg-base-200 min-h-screen">
      <div className="w-full bg-base-100 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 text-primary">Settings</h1>
          <button
            className="text-lg p-3 flex justify-center items-center rounded-xl bg-primary text-base-100 shadow-lg hover:bg-base-100 hover:text-primary ease-in-out duration-700 lg:hidden"
            onClick={handleLogout}
          >
            <IoLogOut className="size-7 mr-2" />
            Logout
          </button>
        </div>
        <div className="flex flex-row max-sm:flex-col max-sm:gap-2 items-center mb-6 gap-2">
          <NavLink
            to="/in/about"
            className="text-xl btn gap-2 w-[50%] max-sm:w-full text-semibold text-base-100 text-start rounded-2xl self-start my-4 max-sm:my-0 flex items-center justify-center bg-primary md:hidden lg:hidden"
          >
            <AiOutlineInfoCircle className="text-2xl" />
            {"About us"}
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              className="text-xl btn gap-2 max-sm:w-full w-fit text-semibold text-base-100 text-start rounded-2xl self-start my-4 max-sm:my-0 flex items-center justify-center bg-primary"
            >
              <MdAdminPanelSettings className="text-2xl" />
              {"Admin"}
            </NavLink>
          )}
          <Feedback />
          <button
            className="text-xl btn gap-2 max-sm:w-full w-fit text-semibold text-base-100 text-start rounded-2xl self-start my-4 max-sm:my-0 flex items-center justify-center bg-secondary"
            onClick={handleStartGeneralTour}
          >
            <AiOutlineInfoCircle className="text-2xl" />
            {"Get a Tour"}
          </button>
        </div>
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
          <h1 className="text-2xl font-semibold mb-2 text-red-500">
            {"Danger Zone"}
          </h1>
          {/*Delete Account Code*/}
          <button
            className="btn btn-error w-1/5 max-sm:w-1/2"
            onClick={handleDeletePrompt}
          >
            {"Delete Account"}
          </button>
          {deleteAccount && !confirmDelete && (
            <div>
              <div
                className="h-full w-full justify-center items-center flex bg-black bg-opacity-50 transition-colors duration-200 fixed z-40 top-0 left-0"
                onClick={handleDeletePrompt}
              ></div>
              <div className="bg-base-100 fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 rounded-lg shadow-lg w-2/5 h-2/5 max-sm:h-3/5 max-sm:w-4/5">
                <div className="flex flex-col justify-evenly items-center h-full w-full">
                  <h1 className="text-2xl font-semibold mb-2 text-primary">
                    {"Delete Account"}
                  </h1>
                  <p className="text-center mb-4">
                    {
                      "Do you really want to delete your account? This action cannot be undone. And this puppy will be sad to see you go :("
                    }
                  </p>
                  <img
                    src={sad_puppy}
                    alt="Sad Puppy"
                    className="w-1/6 h-1/2 mb-4 max-sm:w-1/2"
                  />
                  <div className="flex justify-center w-full gap-6">
                    <button
                      className="btn btn-primary w-1/4 mb-4"
                      onClick={handleConfirmDelete}
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
          {confirmDelete && (
            <div>
              <div
                className="h-full w-full justify-center items-center flex bg-black bg-opacity-50 transition-colors duration-200 fixed z-40 top-0 left-0"
                onClick={handleConfirmDelete}
              ></div>
              <div className="bg-base-100 fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 rounded-lg shadow-lg w-2/5 h-2/5 max-sm:h-3/5 max-sm:w-4/5">
                <div className="flex flex-col justify-evenly items-center h-full w-full">
                  <h1 className="text-2xl font-semibold mb-2 text-primary">
                    {"Confirm Deletion"}
                  </h1>
                  <p className="text-center mb-4">
                    {
                      "Are you sure you want to delete your account? This action cannot be undone. "
                    }
                  </p>
                  <p className="text-center mb-4 text-bold text-primary">
                    {
                      "Please enter your email and password to confirm deletion."
                    }
                  </p>
                  <form className="flex flex-col gap-4 mb-4">
                    <input
                      type="email"
                      placeholder="Email"
                      className="input input-bordered w-full max-w-xs"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </form>
                  <div className="flex justify-center w-full gap-6">
                    <button
                      className="btn btn-primary w-1/4 mb-4 max-sm:w-1/3"
                      onClick={handleDelete}
                    >
                      {"Yes, Delete 💔"}
                    </button>
                    <button
                      className="btn btn-neutral w-1/4 max-sm:w-1/3"
                      onClick={handleConfirmDelete}
                    >
                      {"No, Cancel 👍"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-primary">Tours & Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              className="btn btn-primary gap-2 text-base-100"
              onClick={handleStartGeneralTour}
            >
              <AiOutlineInfoCircle className="text-2xl" />
              Get a General Tour
            </button>
            <button
              className="btn btn-primary gap-2 text-base-100"
              onClick={handleStartMessagingTour}
            >
              <FaComments className="text-2xl" />
              Messaging Tour
            </button>
            <button
              className="btn btn-primary gap-2 text-base-100"
              onClick={handleStartPostingTour}
            >
              <IoMdAddCircleOutline className="text-2xl" />
              Posting Tour
            </button>
            <button
              className="btn btn-primary gap-2 text-base-100"
              onClick={handleStartProfileTour}
            >
              <AiOutlineUser className="text-2xl" />
              Profile Tour
            </button>
          </div>
        </div>
      </div>
      {showTour && (
        <InteractiveTour 
          onClose={() => {
            console.log("Closing tour");
            setShowTour(false);
            showToast("Tour closed");
          }} 
        />
      )}
    </div>
  );
}

export default Settings;
