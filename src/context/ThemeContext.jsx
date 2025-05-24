import React, { createContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Function to detect system preference
  const getSystemPreference = () => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  };

  // Initialize theme with priority: localStorage > system preference > default
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    const autoMode = localStorage.getItem("autoMode");

    // If auto mode is enabled or no saved theme exists, use system preference
    if (autoMode === "true" || !savedTheme) {
      return getSystemPreference();
    }

    return savedTheme;
  };

  const [theme, setTheme] = useState(getInitialTheme());
  const [autoMode, setAutoMode] = useState(
    localStorage.getItem("autoMode") === "true"
  );

  // Listen for system theme changes
  useEffect(() => {
    if (!autoMode) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      const newTheme = e.matches ? "dark" : "light";
      setTheme(newTheme);
    };

    mediaQuery.addEventListener("change", handleChange);

    // Set initial theme based on current system preference
    const currentSystemTheme = getSystemPreference();
    setTheme(currentSystemTheme);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [autoMode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (!autoMode) {
      localStorage.setItem("theme", theme);
    }
    localStorage.setItem("autoMode", autoMode.toString());
  }, [theme, autoMode]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    setAutoMode(false); // Disable auto mode when manually selecting a theme
  };

  const toggleAutoMode = () => {
    const newAutoMode = !autoMode;
    setAutoMode(newAutoMode);

    if (newAutoMode) {
      // When enabling auto mode, immediately apply system preference
      const systemTheme = getSystemPreference();
      setTheme(systemTheme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        changeTheme,
        autoMode,
        toggleAutoMode,
        systemPreference: getSystemPreference(),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
