import React from "react";
import logo from "../../assets/logo (1).jpg";
import { Link } from "react-router-dom";

function Header() {
  return (
    <div className="flex items-center justify-start p-4 bg-base-100 shadow-md overflow-hidden">
      <img src={logo} alt="Logo" className="h-20" id="logoImg" />
      <Link to="/" className="font-bold text-xl">
        Pet Connect
      </Link>
    </div>
  );
}

export default Header;
