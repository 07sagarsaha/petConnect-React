import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/authContext/authContext";
import Header from "../../components/auth/header";
import InputFild from "../../components/auth/InputFild";
import Button from "../../context/authContext/button";
import { doCreateUserWithEmailAndPassword } from "../../firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useClerk, useSignUp } from "@clerk/clerk-react";

const Register = () => {
  const { signOut } = useClerk();
  const { userLoggedIn } = useAuth();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      setIsRegistering(true);
      setErrorMessage("");

      // Sign out any existing session before creating new one
      try {
        await signOut();
      } catch (signOutErr) {
        console.log("No active session to sign out");
      }

      // Start Clerk signup
      await signUp.create({
        emailAddress: email,
        password,
      });

      // Start email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);

    } catch (err) {
      console.error("Error during signup:", err);
      setErrorMessage(err.message || "Something went wrong during signup");
      setIsRegistering(false);
    }
  };

  const onVerifyEmail = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      setVerifying(true);
      
      // Attempt verification
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code
      });

      if (completeSignUp.status !== "complete") {
        // Investigation needed if status is not complete
        console.log(JSON.stringify(completeSignUp, null, 2));
        throw new Error("Unable to verify email");
      }

      // Email is verified, now create Firebase user
      const firebaseUser = await doCreateUserWithEmailAndPassword(email, password);
      
      // Create user document in Firestore
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.user.uid);
        await setDoc(userRef, {
          name,
          email,
          handle: username,
          createdAt: serverTimestamp(),
        });
      }

      // Set active session
      await setActive({ session: completeSignUp.createdSessionId });

    } catch (err) {
      console.error("Error during verification:", err);
      setErrorMessage(err.message || "Error during verification");
    } finally {
      setVerifying(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      {userLoggedIn && <Navigate to={"/in/home"} replace={true} />}

      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <Header />
        <h1 className="text-4xl font-bold text-center text-primary">
          Register
        </h1>
        
        {!pendingVerification ? (
          <form className="space-y-4" onSubmit={onSubmit}>
            <InputFild
              type="text"
              id="name"
              placeholder="Enter Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <InputFild
              type="text"
              id="username"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <InputFild
              type="email"
              id="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputFild
              type="password"
              id="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errorMessage && (
              <span className="text-error font-bold">{errorMessage}</span>
            )}
            <div className="flex justify-center">
              <Button
                type="submit"
                isDisabled={isRegistering}
                id="register"
                title={isRegistering ? "Sending verification..." : "Register"}
              />
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={onVerifyEmail}>
            <p className="text-center">
              Please check your email for a verification code.
            </p>
            <InputFild
              type="text"
              id="code"
              placeholder="Enter Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            {errorMessage && (
              <span className="text-error font-bold">{errorMessage}</span>
            )}
            <div className="flex justify-center">
              <Button
                type="submit"
                isDisabled={verifying}
                id="verify"
                title={verifying ? "Verifying..." : "Verify Email"}
              />
            </div>
          </form>
        )}

        <div className="text-center mt-4">
          <Link to="/login">
            <button className="text-primary underline">
              Already A User? Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;