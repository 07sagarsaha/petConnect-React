import React from "react";
import { NavLink } from "react-router-dom";

function Nav({ title, icon, to }) {
  return (
    <div className="flex flex-col items-center hover:scale-105 transition-transform duration-300">
      <NavLink
        to={to}
        className={({ isActive }) =>
          isActive
            ? "text-white px-5 py-3 border-solid  border-white rounded-2xl shadow-xl"
            : "text-white"
        }
      >
        <div className="flex flex-row  gap-4  items-center">
          <img src={icon} alt="Home" className="w-8 h-8" />
          <p>{title}</p>
        </div>
      </NavLink>
    </div>
  );
}

export default Nav;
