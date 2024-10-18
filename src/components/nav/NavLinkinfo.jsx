import React from "react";

function NavLinkinfo({ title, icon }) {
  return (
    <div className="flex flex-row gap-4  items-center">
      <img src={icon} alt="Home" className="w-8 h-8" />
      <p>{title}</p>
    </div>
  );
}

export default NavLinkinfo;
