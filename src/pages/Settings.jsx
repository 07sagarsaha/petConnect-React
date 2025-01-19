import React, { useContext } from "react";
import ThemeContext from "../context/ThemeContext";

const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
];

function Settings() {
  const { theme, changeTheme } = useContext(ThemeContext);

  return (
    <div className="flex flex-col justify-center p-8 bg-base-100 text-gray-800 min-h-screen">
      <div className="w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4 text-primary">Settings</h1>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-primary">
            Theme Switcher
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((themeName) => (
              <div
                key={themeName}
                className={`p-4 border rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300 ${
                  theme === themeName ? "border-4 border-primary" : ""
                }`}
                data-theme={themeName}
                onClick={() => changeTheme(themeName)}
              >
                <h3 className="text-lg font-semibold mb-2 capitalize">
                  {themeName}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <div className="w-8 h-8 bg-primary rounded"></div>
                  <div className="w-8 h-8 bg-secondary rounded"></div>
                  <div className="w-8 h-8 bg-accent rounded"></div>
                  <div className="w-8 h-8 bg-neutral rounded"></div>
                  <div className="w-8 h-8 bg-base-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;
