import React from "react";
import { NavLink } from "react-router-dom";

function Nav({ title, icon, to }) {
  return (
    <div className="flex flex-col items-center hover:scale-105 transition-transform duration-300">
      <NavLink
        to={to}
        className={({ isActive }) =>
          isActive
            ? "text-white px-5 py-3 bg-[#da80ea] rounded-lg sm:rounded-2xl shadow-[4px_4px_7px_#aa54b9,-4px_-4px_7px_#f09bff] sm:shadow-[6px_6px_11px_#aa54b9,-6px_-6px_11px_#f09bff]"
            : "text-white"
        }
      >
        <div className="flex flex-row  gap-2 sm:gap-4  items-center">
          <img src={icon} alt="Home" className="sm:w-8 sm:h-8 w-6 h-6" />
          <p className="hidden sm:flex">{title}</p>
        </div>
      </NavLink>
    </div>
  );
}

export default Nav;
