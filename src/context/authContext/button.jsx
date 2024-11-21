import React from "react";

function Button({ type, id, title, isDisabled }) {
  return (
    <button
      type={type}
      id={id}
      disabled={isDisabled}
      /*className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-2 px-4 rounded-lg transform hover:scale-105 transition-transform duration-300"
    */ className="text-lg p-3 m-[10px] flex justify-center items rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:shadow-2xl border-4 ease-in-out duration-700">
      {title}
    </button>
  );
}

export default Button;
