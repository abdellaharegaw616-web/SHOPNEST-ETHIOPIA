/**
 * Service Worker registration for ShopNest Ethiopia PWA
 */

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Register once the window has fully loaded
  window.addEventListener('load', () => {
    const swUrl = '/sw.js';

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('[ShopNest-PWA] Service Worker registered successfully with scope:', registration.scope);

        // Check for updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('[ShopNest-PWA] New content is available and will be used when all tabs are closed.');
              } else {
                console.log('[ShopNest-PWA] Content is cached for offline use.');
              }
            }
          };
        };
      })
      .catch((error) => {
        console.warn('[ShopNest-PWA] Service Worker registration failed:', error);
      });
  });
}
