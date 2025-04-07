import React, { useState } from "react";
import Header from "../../components/auth/header";
import InputFild from "../../components/auth/InputFild";
import { useAuth } from "../../context/authContext/authContext";
import Button from "../../context/authContext/button";
import { useSignIn } from "@clerk/clerk-react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { useToast } from "../../context/ToastContext";

function Login() {
  const { userLoggedIn } = useAuth();
  const { isLoaded, signIn } = useSignIn();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [active, setActive] = useState({ session: "" });

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!isSigningIn && isLoaded) {
      setIsSigningIn(true);
      setErrorMessage("");

      try {
        await signIn.create({
          identifier: email,
          password,
        });
        
        window.location.reload();
      } catch (err) {
        console.error("Error during sign-in:", err);
        setErrorMessage(err.message || "Something went wrong during sign-in");
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  const handleForgotPasswordEmail = async () => {
    setIsResettingPassword(true);
    setErrorMessage("");
    try {
      await signIn.create({
        identifier: email,
        strategy: "reset_password_email_code",
      });

      showToast("Password reset link sent to your email");
    } catch (err) {
      console.error("Error sending password reset link:", err);
      setErrorMessage(err.message || "Something went wrong");
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!isResetting && isLoaded) {
      setIsResetting(true);
      setErrorMessage("");

      if (newPassword !== confirmPassword) {
        setErrorMessage("Passwords do not match");
        setIsResetting(false);
        return;
      }

      try {
        const result = await signIn.attemptFirstFactor({
          strategy: "reset_password_email_code",
          code: resetCode,
          password: newPassword,
        });

        await setActive({ session: result.createdSessionId });
        setIsComplete(true);
      } catch (err) {
        console.error("Error resetting password:", err);
        setErrorMessage(err.message || "Failed to reset password");
      } finally {
        setIsResetting(false);
      }
    }
  };

  if (isComplete) {
    showToast("Password reset successfully");
    window.location.reload();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      {userLoggedIn && <Navigate to={"/in/home"} replace={true} />}

      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <Header />
        {!isResettingPassword && <h1 className="text-4xl flex items-center justify-center font-bold text-center text-primary">
          Login
        </h1>}

        {isResettingPassword && <p className="text-center text-gray-600">
          Reset Password
        </p>}

        {!isResettingPassword && 
        <form className="space-y-4" onSubmit={onSubmit}>
          <InputFild
            type="email"
            id="Email"
            placeholder="Enter Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          {errorMessage && (
            <span className="text-error font-bold">{errorMessage}</span>
          )}
          <div className="flex justify-center">
            <Button type="submit" title="Login" isDisabled={isSigningIn} />
          </div>
        </form>}
        {/*         
        <div className="flex justify-center mt-4">
          <button
            onClick={onGoogleSignIn}
            className="text-lg p-3 flex justify-center items-center rounded-xl bg-primary text-base-100 shadow-lg hover:bg-base-100 hover:text-primary border-4 ease-in-out duration-700"
          >
            Sign in with Google
          </button>
        </div>
         */}

         {isResettingPassword && (
          <form className="space-y-4" onSubmit={handleForgotPassword}>
            <InputFild
             type="reset-code"
             id="reset-code"
             placeholder={"Enter the reset code sent to your email"}
             value={resetCode}
             onChange={(e) => setResetCode(e.target.value)}/>
            <InputFild
              type="password"
              id="new-password"
              placeholder={"Enter your new password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}/>

            <InputFild
              type="password"
              id="confirm-password"
              placeholder={"Confirm your new password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}/>

            {errorMessage && (
              <span className="text-error font-bold">{errorMessage}</span>
            )}

             <div className="flex justify-center">
               <Button
                type="submit"
                title={isResetting ? "Resetting..." : "Reset Password"}
                isDisabled={isResetting}/>
             </div>
          </form>
        )}

          {/* Forgot password */}
          <div className="text-center mt-4">
              <button className="text-primary underline" onClick={handleForgotPasswordEmail}>
                Forgot Password?
              </button>
          </div>
        {/* Sign up link */}

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
