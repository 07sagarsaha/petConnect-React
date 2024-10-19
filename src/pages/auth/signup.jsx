import React from "react";
import Header from "../../components/heaer for auth/header";

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* header */}
      <Header />

      {/* register */}
      <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-gray-200 flex-grow">
        <div className="md:w-1/2 p-4">
          <h1 className="text-4xl font-bold mb-4">Register</h1>
          <form className="space-y-4">
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              id="userName"
              placeholder="Enter Your Name"
              required
            />
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              id="handle"
              placeholder="Set a Handle"
              required
            />
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded-md"
              id="email"
              placeholder="Enter Your E-Mail"
              required
            />
            <input
              type="password"
              className="w-full p-2 border border-gray-300 rounded-md"
              id="setPassword"
              placeholder="Set a strong Password"
              required
            />
            <input
              type="password"
              className="w-full p-2 border border-gray-300 rounded-md"
              id="confirmPassword"
              placeholder="Confirm Your Password"
              required
            />
            <input
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-2 px-4 rounded-lg transform hover:scale-105 transition-transform duration-300"
              id="submitRegister"
              value="Register"
            />
          </form>
          <a href="loginPage.html">
            <button className="mt-4 text-gray-700 underline">
              Already A User?
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

export default Register;
