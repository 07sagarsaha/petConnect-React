import React from "react";
import { NavLink } from "react-router-dom";
import home from "../icons/home.png";
import user from "../icons/user.png";
import ai from "../icons/ai.png";
import info from "../icons/info.png";
import setings from "../icons/settings.png";
import NavLinkinfo from "./nav/NavLinkinfo";

function SideNav() {
  return (
    <div className="w-1/5 h-screen bg-slate-400 flex flex-row justify-center items-center rounded-r-xl bg-gradient-to-b from-purple-500 to-pink-500 max-w-[250px] min-w-[200px]">
      <div className="flex flex-col gap-9">
        <NavLink to="/">
          <NavLinkinfo title="Home" icon={home} />
        </NavLink>
        <NavLink to="/profile">
          <NavLinkinfo title="Profile" icon={user} />
        </NavLink>
        <NavLink to="/ai-chat">
          <NavLinkinfo title="AI Chat" icon={ai} />
        </NavLink>
        <NavLink to="/about">
          <NavLinkinfo title="About" icon={info} />
        </NavLink>
        <NavLink to="/settings">
          <NavLinkinfo title="Settings" icon={setings} />
        </NavLink>
      </div>
    </div>
  );
}

export default SideNav;
