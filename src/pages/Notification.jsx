import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useUser } from "@clerk/clerk-react";
import { IoNotifications, IoTrashOutline } from "react-icons/io5";
import { useToast } from "../context/ToastContext";
import { MdFeedback } from "react-icons/md";

const Notification = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    const q = query(
      collection(db, "notification"),
      where("userId", "==", user.id)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notifications);
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
      <h1 className="text-2xl font-bold">{"Notification"}</h1>
      {notifications.length === 0 && (
        <p className="text-base font-medium italic flex py-8 justify-center items-center">
          {"No new notifications"}
        </p>
      )}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-base-100 p-4 rounded-lg shadow-lg my-4 flex justify-between items-center"
        >
          <div className="w-5/6">
            {notification.type === "feedback" ? (
              <MdFeedback slze={20} />
            ) : (
              <IoNotifications slze={20} />
            )}
            <p>{notification.notifications}</p>
          </div>
          <button
            className="btn btn-error btn-sm"
            onClick={() => handleNotiDelete(notification)}
          >
            <IoTrashOutline size={20} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notification;
