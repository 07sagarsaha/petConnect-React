import React, { useState } from "react";
import {
  Listbox,
  Label,
  Button,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { IoIosArrowDown } from "react-icons/io";

function CustomListBox({
  options,
  value,
  onChange,
  placeholder,
  labelText,
  disabled = false,
}) {
  const [isClicked, setIsClicked] = useState(false);
  return (
    <div className="w-full relative">
      {labelText && (
        <label className="label">
          <span className="label-text text-primary">{labelText}</span>
        </label>
      )}

      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <Listbox.Button
          className={`relative w-full cursor-pointer rounded-md bg-base-100 py-2 pl-3 pr-10 text-left shadow-sm border border-base-300 focus:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary sm:text-sm h-12 flex items-center justify-between
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          onClick={() => {
            setIsClicked(!isClicked);
          }}
        >
          <span className="block truncate">
            {value ? value.label : placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <IoIosArrowDown
              className={`h-5 w-5 text-base-content transition-all ${isClicked && `rotate-180`}`}
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>

        <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-base-100 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {options.length === 0 ? (
            <div className="relative cursor-default select-none py-2 px-4 text-base-content/50 italic">
              No options available
            </div>
          ) : (
            options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option}
                className={({ active, selected }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active
                      ? "bg-primary text-primary-content"
                      : "text-base-content"
                  } ${selected ? "bg-primary text-primary-content" : ""}`
                }
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {option.label}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-content">
                        {/* You can add a checkmark icon here if desired */}
                        {/* <CheckIcon className="h-5 w-5" aria-hidden="true" /> */}
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))
          )}
        </Listbox.Options>
      </Listbox>
    </div>
  );
}

export default CustomListBox;
