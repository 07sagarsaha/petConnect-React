import React from "react";

function Header() {
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-md">
      <img src="Assets/logo.png" alt="Logo" className="h-12" id="logoImg" />
      <a href="landingPage.html" className="text-lg font-bold">
        Pet Connect
      </a>
      <img
        src="Assets/profile pic.jpeg"
        alt="Profile"
        className="h-12 rounded-full"
        id="profileImg"
      />
    </div>
  );
}

export default Header;
