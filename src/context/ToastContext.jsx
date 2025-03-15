import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toastText, setToastText] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const timer = useRef(null);

  const showToast = (message) => {
    setToastText(message);
    setIsFading(false);
    setIsToastVisible(true);

    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => setIsToastVisible(false), 800);
    }, 4200);
  };

  const closeToast = () => {
    clearTimeout(timer.current);
    setIsFading(true);
    setTimeout(() => setIsToastVisible(false), 500);
  };

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {isToastVisible && (
        <div
          className={`fixed z-50 bg-base-100 bottom-10 left-10 max-sm:bottom-20 max-sm:left-0 h-fit w-1/6 max-sm:w-full p-5 shadow-xl rounded-2xl transition-all ${
            isFading ? "opacity-0" : "opacity-100 animate-postAnim3"
          }`}
        >
          {/* Flexbox container for text and close button */}
          <div className="flex flex-row w-full items-center justify-between">
            <h3 className="text-lg overflow-hidden text-start">{toastText}</h3>
            <button
              className="text-lg ml-4"
              onClick={closeToast}
            >
              <IoMdClose />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};