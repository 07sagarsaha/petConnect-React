import React from "react";
import { NavLink } from "react-router-dom";

function Nav({ title, icon, to }) {
  return (
    <div className="flex flex-col items-center w-[100%] transition-transform duration-300">
      <NavLink
        to={to}
        className={({ isActive }) =>
          isActive
            ? "text-base-100 w-[100%] flex flex-row justify-center py-2 max-lg:px-2 max-lg:py-1 lg:bg-base-200 lg:border-b-2 lg:border-r-2 lg:border-t-2 lg:border-primary outline-none lg:text-primary bg-primary md:rounded-lg max-md:rounded-lg max-sm:rounded-lg lg:rounded-r-2xl lg:rounded-l-none shadow-xl"
            : "text-base-content max-sm:text-base-100 w-[100%] flex flex-row justify-center max-lg:px-2 py-2 border-base-200 border-2 hover:border-base-content/50 md:rounded-lg max-md:rounded-lg max-sm:rounded-lg lg:rounded-r-2xl lg:rounded-l-none transition-colors"
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
