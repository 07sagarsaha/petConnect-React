import React from "react";

function Button({ type, id, title, isDisabled }) {
  return (
    <button
      type={type}
      id={id}
      disabled={isDisabled}
      className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-2 px-4 rounded-lg transform hover:scale-105 transition-transform duration-300"
    >
      {title}
    </button>
  );
}

export default Button;
