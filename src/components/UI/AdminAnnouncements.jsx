import React, { useState } from "react";
import { BiBroadcast } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import { useToast } from "../../context/ToastContext";
import { useNotification } from "../../pages/Notification";

const AdminAnnouncements = () => {
  const [isClicked, setIsClicked] = useState(false);
  const [accouncement, setAnnouncement] = useState("");
  const { showToast } = useToast();
  const { sendNotification } = useNotification();

  const handleSubmit = async () => {
    if (!accouncement.trim()) {
      showToast("Please enter an announcement!");
      return;
    }
    await sendNotification(false, "", accouncement, "announcement").then(() => {
      showToast("Announcement sent successfully!");
    });

    setIsClicked(false);
    setAnnouncement("");
  };

  return (
    <>
      <div
        className={`fixed transition-all duration-500 ease-out p-4 ${isClicked ? `top-1/2 right-1/2 z-50 translate-x-1/2 -translate-y-1/2 flex flex-col gap-3 h-96 justify-between items-center bg-base-100 rounded-xl max-sm:w-4/5 w-2/5` : `lg:top-5 sm:bottom-5 max-sm:bottom-5 right-5 z-20 h-12 w-fit bg-primary rounded-xl text-base-200 cursor-pointer hover:bg-primary/80 transition-colors flex flex-row gap-2 items-center`}`}
        onClick={() => {
          setIsClicked(true);
        }}
      >
        <BiBroadcast size={isClicked ? 35 : 20} />
        <p className={isClicked ? `text-center` : `max-sm:hidden`}>
          {"Announce Something"}
        </p>
        {isClicked && (
          <>
            <textarea
              className="w-full h-48 resize-none rounded-xl bg-base-300 p-4 outline-none"
              placeholder="Give a message to all the users..."
              onChange={(e) => setAnnouncement(e.target.value)}
              value={accouncement}
            />
            <div className="flex flex-row gap-2 items-center">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setIsClicked(false);
                }}
              >
                {"Cancel"}
              </button>
              <button className="btn btn-primary btn-md" onClick={handleSubmit}>
                {"Submit"}
              </button>
            </div>
          </>
        )}
      </div>
      {isClicked && (
        <div
          className={`fixed z-40 top-0 left-0 w-full h-full ${isClicked ? `bg-black/50` : `bg-transparent`} transition-all`}
          onClick={() => {
            setIsClicked(!isClicked);
          }}
        />
      )}
    </>
  );
};

export default AdminAnnouncements;
