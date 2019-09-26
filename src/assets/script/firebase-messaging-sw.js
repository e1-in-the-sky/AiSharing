importScripts('https://www.gstatic.com/firebasejs/6.3.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/6.3.1/firebase-messaging.js');

firebase.initializeApp({
    'messagingSenderId': '7764789708'
});

const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.icon,
      // click_action: 'https://aisharing-ac6cc.firebaseapp.com' + payload.url
    };
  return self.registration.showNotification(notificationTitle,notificationOptions);
});
