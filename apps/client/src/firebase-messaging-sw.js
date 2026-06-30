importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAIVrRmIaMxL2AMsCnsO3Eo7IOPoiXriPg",
  authDomain: "eskhata-merchant-production.firebaseapp.com",
  projectId: "eskhata-merchant-production",
  storageBucket: "eskhata-merchant-production.firebasestorage.app",
  messagingSenderId: "834742183227",
  appId: "1:834742183227:web:640dbdd3e0f1d608af031e",
  measurementId: "G-6NCDVLQ73S",
  vapidKey: 'BMH9X5k6jWWCSsAvufiLGOO5pVot1WfCjxk9TOzbTFRbGjltFXmMr6wxP5lC5FpQSTEWyPXfjDFRRCNwIPS-vj8',
});

const messaging = firebase.messaging();

console.log('[Firebase SW] Firebase инициализирован');

/**
 * Фоновые уведомления (когда вкладка закрыта)
 */
messaging.onBackgroundMessage((payload) => {

  const notificationTitle = payload.notification?.title ;
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/assets/logo.svg',
    data: {url: '/#/food/orders/active'}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Клик по уведомлению
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || '/#/food/orders/active';
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
