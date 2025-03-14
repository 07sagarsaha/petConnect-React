import React from "react";
import { NavLink } from "react-router-dom";

function Nav({ title, icon, to }) {
  return (
    <div className="flex flex-col items-center  hover:scale-110 w-[100%] transition-transform duration-300">
      <NavLink
        to={to}
        className={({ isActive }) =>
          isActive
            ? "text-white w-[100%] flex flex-row justify-center py-2 max-lg:px-2 max-lg:py-1 bg-primary rounded-lg max-lg:rounded-xl shadow-md"
            : "text-white w-[100%] flex flex-row justify-center max-lg:px-2 py-2"
        }
      >
        <div className="flex flex-row justify-around w-[60%] gap-2 lg:gap-3  items-center">
          {icon}
          <p className="hidden sm:w-[40%] lg:flex text-sm">{title}</p>
        </div>
      </NavLink>
    </div>
  );
}

export default Nav;
