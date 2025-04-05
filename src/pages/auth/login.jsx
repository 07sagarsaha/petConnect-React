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
