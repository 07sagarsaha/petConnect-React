import React from "react";
import { NavLink } from "react-router-dom";

function Nav({ title, icon, to }) {
  return (
    <div className="flex flex-col items-center hover:scale-111 transition-transform duration-300">
      <NavLink
        to={to}
        className={({ isActive }) =>
          isActive
            ? "text-white px-5 py-3 max-sm:px-3 bg-primary rounded-lg max-sm:rounded-2xl shadow-md"
            : "text-white max-sm:px-3 py-3"
        }
      >
        <div className="flex flex-row gap-2 sm:gap-4 items-center">
          {icon}
          <p className="hidden sm:flex">{title}</p>
        </div>
      </NavLink>
    </div>
  );
}

export default Nav;
