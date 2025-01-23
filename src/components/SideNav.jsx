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
      {/* <div className="sm:hidden fixed top-4 left-3 z-50">
        <button
          onClick={toggleNav}
          className="text-3xl py-2 px-3 rounded-xl bg-primary text-base-100"
        >
          {isNavOpen ? <IoMdClose /> : <IoMdMenu />}
        </button>
      </div> */}
      <div
        className={`fixed max-sm:bottom-0 left-0 max-sm:right-0 w-20 h-full max-sm:h-20 max-sm:w-[95%] flex flex-col max-sm:flex-row justify-evenly items-center rounded-r-xl transition-transform duration-300 z-20 bg-gradient-to-br bg-primary bg-opacity-60 min-w-[200px] translate-x-0 backdrop-blur-md max-sm:rounded-xl max-sm:m-2 max-sm:ml-[0.7rem]`}
      >
        <div className="flex w-full flex-col max-sm:flex-row max-sm:justify-evenly max-sm:items-center text-left gap-12 max-sm:gap-5 max-sm:px-2 transition-all ease duration-200">
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
            className="w-8 h-8 max-sm:hidden"
            alt="logout"
          />
          <button onClick={handleLogout} className="max-sm:hidden sm:flex text-white">
            Logout
          </button>
        </div>
      </div>
      {/* {isNavOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30"
          onClick={toggleNav}
        ></div>
      )} */}
    </>
  );
}

export default SideNav;
