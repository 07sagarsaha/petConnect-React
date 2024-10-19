import React from "react";
import { Navigate, NavLink } from "react-router-dom";
import { useAuth } from "../../context/authContext/authContext";
import landingimg from "../../assets/landingPage.jpeg";
import Header from "../../components/auth/header";
const Landing = () => {
  const { userLoggedIn } = useAuth();
  return (
    <div>
      {userLoggedIn && <Navigate to={"/in/home"} replace={true} />}
      <div className="min-h-screen  flex flex-col">
        {/* header */}
        <Header />
        {/* landingPage */}
        <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-gray-200 flex-grow">
          <div className="md:w-1/2 p-4">
            <h1 className="text-4xl font-bold mb-4">Welcome to Pet Connect</h1>
            <p className="text-lg mb-4">
              As a platform to help you figure out any problem, any question,
              from a wide range of pet lovers, pet owners, and pet parents just
              like you. We aim to build a community of like-minded pet lovers,
              which you can be a part of today, whether new or veteran!
            </p>
            <NavLink to="/signup">
              <button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-2 px-6 rounded-lg transform hover:scale-105 transition-transform duration-300">
                Join the community
              </button>
            </NavLink>
          </div>
          <div className="md:w-1/2 p-4">
            <img
              src={landingimg}
              alt="Landing Page"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
