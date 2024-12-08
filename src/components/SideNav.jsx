import React from "react";
import home from "../icons/home.png";
import user from "../icons/user.png";
import ai from "../icons/ai.png";
import info from "../icons/info.png";
import setings from "../icons/settings.png";
import Nav from "./nav/Nav";
import logout from "../icons/logout.png";
import { doSignOut } from "../firebase/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function SideNav() {
  const [showLogout, setshowLogout] = useState(true);
  const navigate = useNavigate();
  const handleLogout = () => {
    doSignOut().then(() => {
      navigate("/");
    });
  };
  return (
    <div className="w-auto sm:p-4 p-[7px] h-[100vh] sticky  flex flex-col justify-evenly items-center rounded-r-xl bg-gradient-to-b bg-[#da80ea] max-w-[250px] sm:min-w-[200px]">
      <div className="flex flex-col text-left gap-12">
        <Nav title="Home" icon={home} to="/in/home" />
        <Nav title="Profile" icon={user} to="/in/profile" />
        <Nav title="Ai Chat" icon={ai} to="/in/ai-chat" />
        <Nav title="About" icon={info} to="/in/about" />
        <Nav title="Settings" icon={setings} to="/in/settings" />
      </div>
      <div
        className="flex flex-row gap-4 text-white hover:scale-105 transition-transform duration-300"
        style={{ display: showLogout ? "flex" : "none" }}
      >
        <img src={logout} className="w-8 h-8" alt="logout" />
        <button onClick={handleLogout} className="hidden sm:flex">Logout</button>
      </div>
    </div>
  );
}

export default SideNav;
