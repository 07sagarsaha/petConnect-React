import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import home from "../icons/home.png";
import user from "../icons/user.png";
import ai from "../icons/ai.png";
import info from "../icons/info.png";
import setings from "../icons/settings.png";
import logout from "../icons/logout.png";
import Nav from "./nav/Nav";
import { doSignOut } from "../firebase/auth";

function SideNav() {
  const [showLogout, setshowLogout] = useState(true);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    doSignOut().then(() => {
      navigate("/");
    });
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <>
      <div className="sm:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleNav}
          className="text-3xl p-2 rounded-full bg-primary text-base-100"
        >
          {isNavOpen ? <IoMdClose /> : <IoMdMenu />}
        </button>
      </div>
      <div
        className={`fixed top-0 left-0 w-40 sm:p-4 h-screen flex flex-col justify-evenly items-center rounded-r-xl transition-transform duration-300 z-40 bg-primary  sm:min-w-[200px] ${
          isNavOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
      >
        <div className="flex w-full flex-col text-left gap-12 transition-all ease duration-200">
          <Nav title="Home" icon={home} to="/in/home" />
          <Nav title="Profile" icon={user} to="/in/profile" />
          <Nav title="Ai Chat" icon={ai} to="/in/ai-chat" />
          <Nav title="About" icon={info} to="/in/about" />
          <Nav title="Settings" icon={setings} to="/in/settings" />
        </div>
        <div
          className="flex flex-row gap-4 text-base-100 hover:scale-105 transition-transform duration-300"
          style={{ display: showLogout ? "flex" : "none" }}
        >
          <img
            src={logout}
            onClick={handleLogout}
            className="w-8 h-8"
            alt="logout"
          />
          <button onClick={handleLogout} className="hidden sm:flex text-neutral">
            Logout
          </button>
        </div>
      </div>
      {isNavOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30"
          onClick={toggleNav}
        ></div>
      )}
    </>
  );
}

export default SideNav;
