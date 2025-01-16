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
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      {userLoggedIn && <Navigate to={"/in/home"} replace={true} />}

      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <Header />
        <h1 className="text-4xl flex items-center justify-center font-bold text-center text-primary">
          Login
        </h1>
        <form className="space-y-4" onSubmit={onSubmit}>
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
            <span className="text-error font-bold">{errorMessage}</span>
          )}
          <div className="flex justify-center">
            <Button type="submit" title="Login" isDisabled={isSigningIn} />
          </div>
        </form>
        <div className="flex justify-center mt-4">
          <button
            onClick={onGoogleSignIn}
            className="text-lg p-3 flex justify-center items-center rounded-xl bg-primary text-base-100 shadow-lg hover:bg-base-100 hover:text-primary border-4 ease-in-out duration-700"
          >
            Sign in with Google
          </button>
        </div>
        <div className="text-center mt-4">
          <Link to="/signup">
            <button className="text-primary underline">
              Don't have an account? Sign up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
