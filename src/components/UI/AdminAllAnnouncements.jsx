import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { BiBroadcast, BiCheck, BiCopy, BiTrash } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import pfp from "../../icons/pfp.png";
import { useToast } from "../../context/ToastContext";
import { useNotification } from "../../pages/Notification";
import { useNavigate } from "react-router-dom";

const AdminAllAnouncements = () => {
  const [isannouncementTableOpen, setIsannouncementTableOpen] = useState(false);
  const { showToast } = useToast();
  const [announcementCount, setannouncementCount] = useState(0);
  const [announcements, setannouncement] = useState([]);

  useEffect(() => {
    setannouncementCount(announcements.length);
  }, [announcements]);

  useEffect(() => {
    const fetchannouncement = async () => {
      try {
        const announcementCollection = collection(db, "notification");
        const announcementSnapshot = await getDocs(announcementCollection);

        const announcementList = announcementSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setannouncement(
          announcementList.filter(
            (announcement) => announcement.type === "announcement"
          )
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchannouncement();
  }, []);

  useEffect(() => {
    setIsannouncementTableOpen(announcementCount > 0);
  }, [announcementCount]);

  const handleDeleteAnnouncement = async (announcement) => {
    try {
      await deleteDoc(doc(db, "notification", announcement.id));
      showToast("Announcement deleted successfully!");
      setannouncement((prev) =>
        prev.filter((ann) => ann.id !== announcement.id)
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mt-8">
      <div
        className="flex items-center cursor-pointer bg-base-100 text-base-content py-4 rounded-t border-b-2 border-base-300"
        onClick={() => setIsannouncementTableOpen(!isannouncementTableOpen)}
      >
        <div className="flex flex-row gap-3 items-center">
          <h2 className="text-2xl font-bold">{"Announcements"}</h2>
          {announcementCount !== 0 && (
            <span className="font-medium text-base flex flex-row gap-2 text-center px-4 py-2 rounded-full bg-base-300">
              <span>{"Pending: "}</span>
              <span>{announcementCount}</span>
            </span>
          )}
        </div>
        <span className="ml-2">
          <IoIosArrowDown
            size={20}
            className={`transition-all ${isannouncementTableOpen ? `-rotate-180` : `rotate-0`}`}
          />
        </span>
      </div>
      <div
        className={`transition-all duration-300 flex flex-col max-sm:flex-col gap-3 mt-4 overflow-auto p-4 ${isannouncementTableOpen ? ` inline` : `hidden`}`}
      >
        {announcementCount === 0 && (
          <span className="font-light italic">{"No Announcements!"}</span>
        )}
        {announcements.map((announcement) => (
          <>
            <div
              key={announcement.id}
              className="w-full min-w-[30%] h-fit p-4 shadow-Uni shadow-base-300 rounded-lg bg-base-100 flex flex-row items-center justify-between gap-3"
            >
              <div className="flex flex-col">
                <div className="flex flex-row gap-2">
                  <BiBroadcast size={20} />
                  <p>{new Date(announcement.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="py-4 px-2 rounded-lg bg-base-100 flex flex-row gap-3 items-center whitespace-pre-wrap">
                  {announcement.notifications}
                </span>
              </div>
              <button
                className="btn btn-error btn-sm"
                onClick={() => handleDeleteAnnouncement(announcement)}
              >
                <BiTrash size={20} />
              </button>
            </div>
          </>
        ))}
      </div>
    </div>
  );
};

export default AdminAllAnouncements;
