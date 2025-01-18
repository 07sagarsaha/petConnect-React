export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        {
          scope: "/",
        }
      );

      // Wait for the service worker to be active
      await navigator.serviceWorker.ready;

      // Pass environment variables to the service worker
      navigator.serviceWorker.controller.postMessage({
        type: "INIT",
        payload: {
          apiKey: import.meta.env.VITE_API_KEY,
          authDomain: import.meta.env.VITE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_APP_ID,
          measurementId: import.meta.env.VITE_MEASUREMENT_ID,
        },
      });

      console.log("Service worker registered successfully:", registration);
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  }
};
