import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import * as serviceWorker from './service-worker'; // Закомментируйте импорт сервис-воркера, чтобы отключить его регистрацию

// Get the container
const container = document.getElementById('root');
const root = createRoot(container);

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below.  Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// serviceWorker.register({  // Закомментируйте регистрацию сервис-воркера
//   onUpdate: registration => {
//     // When a new version is available, show an update notification
//     const updateAvailable = window.confirm(
//       'A new version of this app is available. Reload to update?'
//     );

//     if (updateAvailable) {
//       if (registration.waiting) {
//         // Send a message to the waiting service worker
//         registration.waiting.postMessage({ type: 'SKIP_WAITING' });
//       }

//       // Reload the page to get the latest version
//       window.location.reload();
//     }
//   },
//   onSuccess: registration => {
//     console.log('Service Worker registered successfully.');
//   }
// });

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();