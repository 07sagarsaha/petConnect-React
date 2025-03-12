import React from "react";
import { NavLink } from "react-router-dom";

function Nav({ title, icon, to }) {
  return (
    <div className="flex flex-col items-center hover:scale-110 transition-transform duration-300">
      <NavLink
        to={to}
        className={({ isActive }) =>
          isActive
            ? "text-white px-4 py-2 max-sm:px-2 max-sm:py-1 bg-primary rounded-lg max-sm:rounded-xl shadow-md"
            : "text-white max-sm:px-2 py-2"
        }
      >
        <div className="flex flex-row gap-2 sm:gap-3 items-center">
          {icon}
          <p className="hidden sm:flex text-sm">{title}</p>
        </div>
      </NavLink>
    </div>
  );
}

export default Nav;
