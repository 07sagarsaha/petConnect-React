import React from "react";

function Button({ type, id, title, isDisabled }) {
  return (
    <button
      type={type}
      id={id}
      disabled={isDisabled}
      className="text-lg m-[7px] flex justify-center items-center rounded-xl btn-primary text-base-100 shadow-lg btn ease-in-out"
    >
      {title}
    </button>
  );
}

export default Button;
