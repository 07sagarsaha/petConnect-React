import React, { useContext } from "react";
import ThemeContext from "../context/ThemeContext";
import { IoLogOut } from "react-icons/io5";
import { doSignOut } from "../firebase/auth";
import { NavLink, useNavigate } from "react-router-dom";
import { AiOutlineInfoCircle } from "react-icons/ai";

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

const handleLogout = () => {
  doSignOut().then(() => {
    navigate("/");
  });
};

function Settings() {
  const { theme, changeTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center p-8 bg-base-200  min-h-screen">
      <div className="w-full bg-base-100 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 text-primary">Settings</h1>
          <button
            className="text-lg p-3 flex justify-center items-center rounded-xl bg-primary text-base-100 shadow-lg hover:bg-base-100 hover:text-primary ease-in-out duration-700 lg:hidden md:hidden"
            onClick={handleLogout}
          >
            <IoLogOut className="size-7 mr-2" />
            Logout
          </button>
        </div>
        <NavLink
          to="/in/about"
          className="text-xl gap-2 w-[50%] text-semibold text-base-100 rounded-2xl self-start my-4 flex items-center justify-center bg-primary p-3 md:hidden lg:hidden">
            <AiOutlineInfoCircle className="text-2xl"/>{"About us"}
        </NavLink>
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
