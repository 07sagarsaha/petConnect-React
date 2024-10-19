import React from "react";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* header */}
      <header className="flex items-center justify-between p-4 bg-white shadow-md">
        <img src="Assets/logo.png" alt="Logo" className="h-12" id="logoImg" />
        <a href="#default" className="text-lg font-bold">
          Pet Connect
        </a>
        <img
          src="Assets/profile pic.jpeg"
          alt="Profile"
          className="h-12 rounded-full"
          id="profileImg"
        />
      </header>

      {/* landingPage */}
      <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-gray-200 flex-grow">
        <div className="md:w-1/2 p-4">
          <h1 className="text-4xl font-bold mb-4">Welcome to Pet Connect</h1>
          <p className="text-lg mb-4">
            As a platform to help you figure out any problem, any question, from
            a wide range of pet lovers, pet owners, and pet parents just like
            you. We aim to build a community of like-minded pet lovers, which
            you can be a part of today, whether new or veteran!
          </p>
          <a href="register.html">
            <button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-2 px-6 rounded-lg transform hover:scale-105 transition-transform duration-300">
              Join the community
            </button>
          </a>
        </div>
        <div className="md:w-1/2 p-4">
          <img
            src="Assets/landingPage.jpg"
            alt="Landing Page"
            className="w-full h-auto rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Landing;
