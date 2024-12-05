import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/authContext/authContext";
import Header from "../../components/auth/header";
import InputFild from "../../components/auth/InputFild";
import Button from "../../context/authContext/button";
import { doCreateUserWithEmailAndPassword } from "../../firebase/auth";
import regimg from "../../assets/reg.jpg";
import { auth, db } from "../../firebase/firebase";
import { collection } from "firebase/firestore/lite";
import { addDoc, doc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Register = () => {
  const { userLoggedIn } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMassage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isRegistering) {
      setIsRegistering(true);
      await doCreateUserWithEmailAndPassword(email, password);
    }
    const user = auth.currentUser;
    try{
      if(user){
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          name: name,
          email: email,
          handle: username,
          createdAt: serverTimestamp()
        })
      }
      else{
        alert("User not logged in!");
        return;
      }
    }
    catch(error){
      console.error("Somnething went wrong:", error);
    }
  };

  return (
    <>
      {userLoggedIn && <Navigate to={"/in/home"} replace={true} />}
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-gray-200 flex-grow">
          <div className="md:w-1/2 p-4">
            <h1 className="text-4xl font-bold mb-4">Register</h1>
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
              {errorMassage && <p className="text-red-500">{errorMassage}</p>}
              <Button
                type="submit"
                isDisabled={false}
                id="register"
                title={isRegistering ? "Registering..." : "Register"}
              />
            </form>
            <Link to="/login">
              <button className="mt-4 text-gray-700 underline">
                Already A User?
              </button>
            </Link>
          </div>
          <div className="w-1/2 p-4">
            <img
              src={regimg}
              alt="Landing Page"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
