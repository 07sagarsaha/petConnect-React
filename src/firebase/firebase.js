import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

// Request permission to send notifications
const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_VAPID_KEY,
      });
      console.log("FCM Token:", token);
    } else {
      console.log("Notification permission denied.");
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
  }
};

// Handle incoming messages
onMessage(messaging, (payload) => {
  console.log("Message received. ", payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
    data: { url: payload.notification.click_action }, // Add URL to notification data
  };

  const notification = new Notification(notificationTitle, notificationOptions);

  notification.onclick = (event) => {
    event.preventDefault(); // Prevent the browser from focusing the Notification's tab
    window.open(notificationOptions.data.url, "_blank");
  };
});

export { app, auth, db, requestNotificationPermission };
