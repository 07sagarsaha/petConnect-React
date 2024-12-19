import React from "react";

function Button({ type, id, title, isDisabled }) {
  return (
    <button
      type={type}
      id={id}
      disabled={isDisabled}
      className="text-lg p-3 m-[7px] flex justify-center items rounded-xl bg-[#e43d12] text-white shadow-[6px_6px_11px_#c8c6bf,-6px_-6px_11px_#ffffff] hover:bg-[#ebe9e1] hover:text-[#e43d12] border-4 ease-in-out duration-700">
      {title}
    </button>
  );
}

export default Button;
