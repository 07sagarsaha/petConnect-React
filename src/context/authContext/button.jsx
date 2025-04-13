import React from "react";

function Button({ type, id, title, isDisabled }) {
  return (
    <button
      type={type}
      id={id}
      disabled={isDisabled}
      className="text-lg m-[7px] flex justify-center items-center rounded-xl bg-primary text-base-100 shadow-lg btn hover:bg-primary ease-in-out duration-700"
    >
      {title}
    </button>
  );
}

export default Button;
