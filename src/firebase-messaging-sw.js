import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Placeholder for Workbox to inject the precache manifest
self.__WB_MANIFEST;

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "INIT") {
    const firebaseConfig = event.data.payload;
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    onBackgroundMessage(messaging, (payload) => {
      console.log("Received background message ", payload);
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon,
      };

      self.registration.showNotification(
        notificationTitle,
        notificationOptions
      );
    });
  }
});
