import React from "react";
import { NavLink } from "react-router-dom";

function SideNav() {
  return (
    <div className="w-1/5 h-screen bg-slate-400 flex flex-col justify-center ">
      <NavLink to="/">Home</NavLink>
      <NavLink to="/profile">Profile</NavLink>
      <NavLink to="/ai-chat">AiChat</NavLink>
    </div>
  );
}

export default SideNav;
