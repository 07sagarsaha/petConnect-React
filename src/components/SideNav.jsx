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
import { useClerk } from "@clerk/clerk-react";
import Header from "./auth/header";
import ThemeToggle from "./ThemeToggle";

function SideNav() {
  const [showLogout, setshowLogout] = useState(true);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Error during sign out:", err);
    }
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <>
      <div
        className="fixed z-50 w-fit top-10 backdrop-blur-md p-4 shadow-lg rounded-r-2xl lg:inline md:hidden max-md:hidden max-sm:hidden"
        onClick={() => navigate("/in/home")}
      >
        <Header />
      </div>
      <div
        className={`fixed z-10 max-lg:bottom-0 left-0 max-lg:right-0 w-20 h-full max-lg:h-20 lg:w-[16.35%] md:w-[96%] max-md:w-[96%] max-sm:w-[95%] flex flex-col max-lg:flex-row justify-evenly items-center rounded-r-xl transition-transform duration-300 bg-gradient-to-br bg-primary lg:bg-base-200 bg-opacity-60 min-w-[200px] translate-x-0 backdrop-blur-md max-lg:rounded-xl max-lg:m-2 max-lg:ml-[0.7rem]`}
      >
        <div className="flex w-full lg:flex-col max-lg:flex-row max-sm:flex-row sm:flex-row md:flex-row max-md:flex-row max-lg:justify-evenly max-lg:items-center text-left gap-12 max-lg:gap-5 max-lg:px-2 transition-all ease duration-200">
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
            title="AI Chat"
            icon={<AiOutlineRobot className="w-8 h-8" />}
            to="/in/ai-chat"
          />
          {/*It is not fitting in medium resolution*/}
          <div className="max-sm:hidden w-full transition-all ease duration-200">
            <Nav
              title="About"
              icon={<AiOutlineInfoCircle className="w-8 h-8" />}
              to="/in/about"
            />
          </div>
          <div className="max-sm:hidden w-full">
            <Nav
              title="Settings"
              icon={<IoSettingsOutline className="w-8 h-8" />}
              to="/in/settings"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default SideNav;
