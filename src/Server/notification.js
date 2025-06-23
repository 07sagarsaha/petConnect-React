import { addDoc, collection } from "firebase/firestore";
import { useEffect } from "react";
import { db } from "../firebase/firebase";

// Custom hook for sending notifications
export function useNotification() {
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

  return { sendNotification };
}

// Keep the original function for backward compatibility
export async function NotificationSystem({
  isUserSpecific,
  userId,
  notifications,
}) {
  try {
    if (!isUserSpecific) {
      userId = "all";
    }

    const notificationCollection = collection(db, "notification");
    await addDoc(notificationCollection, {
      userId,
      notifications,
    });

    return true;
  } catch (error) {
    console.error("Error adding notification:", error);
    return false;
  }
}
