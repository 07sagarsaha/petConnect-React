import React from "react";

function InputFild({ type, id, placeholder, value, onChange }) {
  return (
    <input
      type={type}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full p-2 border border-base-300 rounded-md"
      required
    />
  );
}

export default InputFild;
