import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    // Whether a service worker was already controlling this page on load.
    // Used to avoid an unnecessary reload on the very first install.
    const hadController = !!navigator.serviceWorker.controller;
    let refreshing = false;

    // When a new service worker activates and takes control, reload once so the
    // page runs the latest code instead of a stale cached bundle.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing || !hadController) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        // Proactively check for an updated service worker on each load.
        registration.update();
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
