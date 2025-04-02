import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useUser } from "@clerk/clerk-react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const { user, isSignedIn, isLoaded } = useUser();

  const value = {
    currentUser: user,
    userLoggedIn: isSignedIn,
    loading: !isLoaded,
  };

  return (
    <AuthContext.Provider value={value}>
      {!value.loading && children}
    </AuthContext.Provider>
  );
}
