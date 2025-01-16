import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/authContext/authContext";
import Header from "../../components/auth/header";
import InputFild from "../../components/auth/InputFild";
import Button from "../../context/authContext/button";
import { doCreateUserWithEmailAndPassword } from "../../firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

const Register = () => {
  const { userLoggedIn } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isRegistering) {
      setIsRegistering(true);
      await doCreateUserWithEmailAndPassword(email, password).catch((err) => {
        setIsRegistering(false);
        setErrorMessage(err.message);
      });
    }
    const user = auth.currentUser;
    try {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
          name: name,
          email: email,
          handle: username,
          createdAt: serverTimestamp(),
        });
      } else {
        alert("User not logged in!");
        return;
      }
    } catch (error) {
      console.error("Something went wrong:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      {userLoggedIn && <Navigate to={"/in/home"} replace={true} />}

      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <Header />
        <h1 className="text-4xl font-bold text-center text-primary">
          Register
        </h1>
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
              title={isRegistering ? "Registering..." : "Register"}
            />
          </div>
        </form>
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
