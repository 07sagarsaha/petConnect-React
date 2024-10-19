import React from "react";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";

function Header() {
  return (
    <div className="flex items-center justify-start p-4 bg-white shadow-md">
      <img src={logo} alt="Logo" className="h-20" id="logoImg" />
      <Link to="/" className="font-bold text-xl">
        Pet Connect
      </Link>
    </div>
  );
}

export default Header;
