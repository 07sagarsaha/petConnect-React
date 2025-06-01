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
import { City, Country, State } from "country-state-city";
import Select from "react-select";
import CustomListBox from "../../components/UI/CustomListbox";

const Register = () => {
  const { userLoggedIn } = useAuth();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [rnum, setRnum] = useState("");
  const [isVet, setIsVet] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const countryOptions = Country.getAllCountries().map((country) => ({
    label: country.name,
    value: country.isoCode,
  }));

  const stateOptions = selectedCountry
    ? State.getStatesOfCountry(selectedCountry.value).map((state) => ({
        label: state.name,
        value: state.isoCode,
      }))
    : [];

  const cityOptions = selectedState
    ? City.getCitiesOfState(selectedCountry.value, selectedState.value).map(
        (city) => ({
          label: city.name,
          value: city.name,
        })
      )
    : [];

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      setIsRegistering(true);
      setErrorMessage("");

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
        code,
      });

      if (completeSignUp.status !== "complete") {
        // Investigation needed if status is not complete
        console.log(JSON.stringify(completeSignUp, null, 2));
        throw new Error("Unable to verify email");
      }

      const userId = completeSignUp.createdUserId;

      // Create user document in Firestore
      if (userId) {
        const userRef = doc(db, "users", userId);
        await setDoc(userRef, {
          name,
          email,
          handle: username,
          isVet,
          address,
          pincode,
          rnum,
          selectedCountry,
          selectedState,
          selectedCity,
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
      Navigate("/in/home", { replace: true });
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  const handleCheckboxChange = () => {
    setIsVet(!isVet);
  };

  return (
    <div className="rounded-xl flex flex-col items-center justify-center">
      {userLoggedIn && <Navigate to={"/in/home"} replace={true} />}

      <h1 className="text-4xl font-bold text-center text-primary sticky top-0 z-20 bg-base-100 w-full pb-4 backdrop-blur-lg">
        {"Register"}
      </h1>

      <div className="w-full p-4 space-y-8 rounded-lg max-h-[50vh] overflow-auto">
        {!pendingVerification ? (
          <form
            className="space-y-4 transition-all rounded-xl"
            onSubmit={onSubmit}
          >
            <InputFild
              type="text"
              id="name"
              placeholder="Enter Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <InputFild
              type="email"
              id="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputFild
              type="text"
              id="handle"
              placeholder="Enter Handle"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <div className="relative">
              <InputFild
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                )}
              </button>
            </div>
            <CustomListBox
              options={countryOptions}
              value={selectedCountry}
              onChange={setSelectedCountry}
              placeholder="Select Country"
              labelText={"Country"}
              required
            />

            {selectedCountry && (
              <CustomListBox
                options={stateOptions}
                value={selectedState}
                onChange={setSelectedState}
                placeholder="Select State"
                labelText={"State"}
                required
              />
            )}

            {selectedCountry && selectedState && (
              <CustomListBox
                options={cityOptions}
                value={selectedCity}
                onChange={setSelectedCity}
                placeholder="Select City"
                labelText={"City"}
                required
              />
            )}

            {selectedCountry && selectedState && selectedCity && (
              <InputFild
                type="text"
                id="address"
                placeholder="Enter Your Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            )}

            {selectedCountry && selectedState && selectedCity && (
              <InputFild
                type="number"
                id="pincode"
                placeholder="Enter Your Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            )}

            {isVet && (
              <>
                <InputFild
                  type="rnum"
                  id="rnum"
                  placeholder="Enter Vet Registration Number"
                  value={rnum}
                  onChange={(e) => setRnum(e.target.value)}
                />
              </>
            )}
            {errorMessage && (
              <span className="text-error font-bold">{errorMessage}</span>
            )}
            <div className="flex justify-center">
              <Button
                type="submit"
                isDisabled={isRegistering}
                id="register"
                title={
                  isRegistering
                    ? "Sending verification..."
                    : "Send Verification Email"
                }
              />
            </div>
            <div className="flex items-center justify-center mt-4">
              <input
                type="checkbox"
                className=""
                id="isVet"
                onChange={handleCheckboxChange}
              />
              <label htmlFor="isVet" className="ml-3">
                {"I am a vet"}
              </label>
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
                title={verifying ? "Verifying..." : "Verify Email and Register"}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
