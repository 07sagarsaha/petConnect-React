importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js");

let firebaseConfig = {};

// Listen for messages from the registration script
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "INIT") {
    firebaseConfig = event.data.payload;
    firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
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
