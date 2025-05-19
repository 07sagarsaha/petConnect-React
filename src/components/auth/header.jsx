import React from "react";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";

function Header() {
  return (
    <div className="flex items-center justify-start overflow-hidden">
      <Link to="/" className="font-bold text-xl flex flex-row items-center">
        <img
          src={logo}
          alt="Logo"
          className="h-16 mr-8 rounded-lg bg-base-content/15"
          id="logoImg"
        />
        {"Pet Connect"}
      </Link>
    </div>
  );
}

export default Header;
