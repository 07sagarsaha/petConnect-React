import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import {
  AiOutlineHome,
  AiOutlineUser,
  AiOutlineRobot,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import {
  IoSettingsOutline,
  IoLogOutOutline,
  IoChatbubbleOutline,
} from "react-icons/io5";
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
      <div
        className={`fixed z-10 max-lg:bottom-0 left-0 max-lg:right-0 w-20 h-full max-lg:h-20 max-lg:w-[95%] flex flex-col max-lg:flex-row justify-evenly items-center rounded-r-xl transition-transform duration-300 bg-gradient-to-br bg-primary bg-opacity-60 min-w-[200px] translate-x-0 backdrop-blur-md max-lg:rounded-xl max-lg:m-2 max-lg:ml-[0.7rem]`}
      >
        <div className="flex w-full flex-col max-lg:flex-row max-lg:justify-evenly max-lg:items-center text-left gap-12 max-lg:gap-5 max-lg:px-2 transition-all ease duration-200">
          <Nav
            title="Home"
            icon={<AiOutlineHome className="w-8 h-8" />}
            to="/in/home"
          />
          <Nav
            title="Profile"
            icon={<AiOutlineUser className="w-8 h-8" />}
            to="/in/profile"
          />
          <Nav
            title="Messages"
            icon={<IoChatbubbleOutline className="w-8 h-8" />}
            to="/in/messages"
          />
          <Nav
            title="Ai Chat"
            icon={<AiOutlineRobot className="w-8 h-8" />}
            to="/in/ai-chat"
          />
          <div className="max-sm:hidden flex w-full flex-col max-lg:flex-row max-lg:justify-evenly max-lg:items-center text-left gap-12 max-lg:gap-5 max-lg:px-2 transition-all ease duration-200">
            <Nav
              title="About"
              icon={<AiOutlineInfoCircle className="w-8 h-8" />}
              to="/in/about"
            />
            <Nav
              title="Settings"
              icon={<IoSettingsOutline className="w-8 h-8" />}
              to="/in/settings"
            />
          </div>
        </div>
        <div
          className="flex flex-row gap-4 text-base-100 hover:scale-105 transition-transform duration-300"
          style={{ display: showLogout ? "flex" : "none" }}
        >
          <IoLogOutOutline
            onClick={handleLogout}
            className="w-8 h-8 max-lg:hidden cursor-pointer"
          />
          <button
            onClick={handleLogout}
            className="max-lg:hidden lg:flex text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default SideNav;
