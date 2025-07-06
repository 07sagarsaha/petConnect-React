import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { useUser } from "@clerk/clerk-react";
import { IoNotifications, IoTrashOutline } from "react-icons/io5";
import { useToast } from "../context/ToastContext";
import { MdFeedback } from "react-icons/md";
import { BiBroadcast, BiBug } from "react-icons/bi";

// Custom hook for sending notifications
export function useNotification() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [pendingNotification, setPendingNotification] = useState(null);

  // Function to open modal with notification details
  const openNotificationModal = (
    isUserSpecific,
    userId,
    defaultMessage,
    type
  ) => {
    setCustomMessage(defaultMessage);
    setPendingNotification({ isUserSpecific, userId, type });
    setIsModalOpen(true);
    return new Promise((resolve) => {
      // Store the resolve function to be called when notification is sent
      setPendingNotification((prev) => ({ ...prev, resolve }));
    });
  };

  // Function to send a notification
  const sendNotification = async (
    isUserSpecific,
    userId,
    notificationText,
    type
  ) => {
    try {
      if (!isUserSpecific) {
        userId = "all";
      }
      const notificationCollection = collection(db, "notification");
      await addDoc(notificationCollection, {
        userId: userId,
        notifications: notificationText,
        type: type,
      });
      return true;
    } catch (error) {
      console.error("Error adding notification:", error);
      return false;
    }
  };

  // Modal component for custom message
  const NotificationModal = React.memo(function NotificationModal() {
    if (!isModalOpen) return null;

    // Use local state for the textarea to prevent parent re-renders
    const [localMessage, setLocalMessage] = useState(customMessage);

    // Sync local state with parent state when modal opens
    useEffect(() => {
      if (isModalOpen) {
        setLocalMessage(customMessage);
      }
    }, [isModalOpen, customMessage]);

    const handleSend = async () => {
      if (pendingNotification) {
        const result = await sendNotification(
          pendingNotification.isUserSpecific,
          pendingNotification.userId,
          localMessage,
          pendingNotification.type
        );
        pendingNotification.resolve?.(result);
        setIsModalOpen(false);
      }
    };

    const handleCancel = () => {
      pendingNotification.resolve?.(false);
      setIsModalOpen(false);
    };

    return (
      <>
        <div
          className="fixed z-40 left-0 top-0 w-full h-full bg-black/50"
          onClick={handleCancel}
        />
        <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 max-sm:w-2/3 h-fit bg-base-100/50 backdrop-blur-lg border-2 border-base-content/20 p-6 rounded-2xl flex flex-col items-center gap-4">
          <h1 className="font-bold text-center">
            {"Write a message for the notification"}
          </h1>
          <textarea
            className="mt-2 w-full h-52 resize-none rounded-2xl bg-base-300/70 p-4 outline-none"
            placeholder="Write here..."
            value={localMessage}
            onChange={(e) => setLocalMessage(e.target.value)}
            autoFocus
          />
          <div className="flex gap-4">
            <button className="btn btn-error flex-1" onClick={handleCancel}>
              {"Cancel"}
            </button>
            <button
              className="btn btn-primary flex-1"
              onClick={() => {
                // Update parent state only when sending
                setCustomMessage(localMessage);
                handleSend();
              }}
            >
              {"Send"}
            </button>
          </div>
        </div>
      </>
    );
  });

  return {
    sendNotification,
    openNotificationModal,
    NotificationModal,
  };
}

const Notification = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [announcement, setAnnouncement] = useState([]);
  const [showingNotification, setShowingNotification] = useState("normal");
  const { showToast } = useToast();
  const { NotificationModal } = useNotification();

  useEffect(() => {
    const q = query(collection(db, "notification"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(
        notifications.filter((noti) => noti.type !== "announcement")
      );
      setAnnouncement(
        notifications.filter((noti) => noti.type === "announcement")
      );
    });
    return () => unsubscribe();
  }, [user.id]);

  function handleNotiDelete(notification) {
    const notificationRef = doc(db, "notification", notification.id);
    deleteDoc(notificationRef)
      .then(() => {
        setNotifications((prev) =>
          prev.filter((noti) => noti.id !== notification.id)
        );
        showToast("Notification deleted");
      })
      .catch((error) => {
        console.log("Error deleting document." + error);
        showToast("Error deleting notification");
      });
  }

  return (
    <div className="min-h-screen p-6 flex flex-col gap-4 overflow-auto">
      <h1 className="text-2xl font-bold mb-4">{"Notification"}</h1>
      <div className="flex flex-row gap-4">
        <p
          className={`px-4 py-2 border-2 rounded-full cursor-pointer transition-colors duration-300 ${showingNotification === "normal" ? "border-primary bg-primary text-base-100 hover:bg-primary/80" : "border-base-content hover:bg-base-content/30"}`}
          onClick={() => setShowingNotification("normal")}
        >
          {"Normal"}
        </p>
        <p
          className={`px-4 py-2 border-2 rounded-full cursor-pointer transition-colors duration-300 ${showingNotification === "announcement" ? "border-primary bg-primary text-base-100 hover:bg-primary/80" : "border-base-content hover:bg-base-content/30"}`}
          onClick={() => setShowingNotification("announcement")}
        >
          {"Announcement"}
        </p>
      </div>
      {showingNotification === "normal" &&
        notifications.map((notification) => (
          <>
            <div
              key={notification.id}
              className="bg-base-100 p-4 rounded-lg shadow-lg flex justify-between items-center"
            >
              <div className="w-5/6">
                {notification.type === "feedback" ? (
                  <MdFeedback size={20} />
                ) : notification.type === "bug" ? (
                  <BiBug size={20} />
                ) : (
                  <IoNotifications size={20} />
                )}
                <p className="whitespace-pre-wrap mt-2 ml-1">
                  {notification.notifications}
                </p>
              </div>
              <button
                className="btn btn-error btn-sm"
                onClick={() => handleNotiDelete(notification)}
              >
                <IoTrashOutline size={20} />
              </button>
            </div>
          </>
        ))}
      {showingNotification === "announcement" &&
        announcement.map((announcements) => (
          <>
            <div
              key={announcements.id}
              className="bg-base-100 p-4 rounded-lg shadow-lg flex justify-between items-center"
            >
              <div className="w-5/6">
                {announcements.type === "announcement" ? (
                  <BiBroadcast size={20} />
                ) : (
                  <IoNotifications size={20} />
                )}
                <p className="whitespace-pre-wrap mt-2 ml-1">
                  {announcements.notifications}
                </p>
              </div>
            </div>
          </>
        ))}
      {showingNotification === "announcement" && announcement.length === 0 ? (
        <p className="text-base font-medium italic flex py-8 justify-center items-center">
          {"No new announcement"}
        </p>
      ) : (
        showingNotification === "normal" &&
        notifications.length === 0 && (
          <p className="text-base font-medium italic flex py-8 justify-center items-center">
            {"No new notifications"}
          </p>
        )
      )}
      <NotificationModal />
    </div>
  );
};

export default Notification;
