import React, { useState } from "react";
import Header from "../../components/auth/header";
import InputFild from "../../components/auth/InputFild";
import { useAuth } from "../../context/authContext/authContext";
import Button from "../../context/authContext/button";
import {
  doGoogleSignIn,
  doSignInWithEmailAndPassword,
} from "../../firebase/auth";

import { Navigate, Link } from "react-router-dom";

function Login() {
  const { userLoggedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      await doSignInWithEmailAndPassword(email, password).catch((err) => {
        setIsSigningIn(false);
        setErrorMessage(err.message);
      });
      // doSendEmailVerification()
    }
  };

  const onGoogleSignIn = (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      doGoogleSignIn().catch((err) => {
        setIsSigningIn(false);
      });
    }
  };

  return (
    <div>
      {userLoggedIn && <Navigate to={"/in/home"} replace={true} />}

      <div>
        <Header />
        <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-gray-200 flex-grow">
          <div className="md:w-1/2 p-4">
            <img
              src="Assets/landingPage.jpg"
              alt="Landing Page"
              className="w-full h-auto rounded-lg animation-navigate duration-1000"
            />
          </div>
          <div className="md:w-1/2 p-4">
            <h1 className="text-4xl font-bold mb-4">Login</h1>
            <form className="space-y-4" onSubmit={onSubmit} preventDefault>
              <InputFild
                type="email"
                id="Email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <InputFild
                type="password"
                id="Password"
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errorMessage && (
                <span className="text-red-600 font-bold">{errorMessage}</span>
              )}
              <Button type="submit" title="Login" isDisabled={isSigningIn} />
            </form>
            <Link to="/signup">
              <button className="mt-4 text-gray-700 underline">
                Don't have an account? Sign up
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
