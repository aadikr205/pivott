// Service Worker Registration for Pivott PWA with Update Management
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('[Pivott PWA] Service Worker active with scope:', registration.scope);

          // Check for updates on page load and periodically
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[Pivott PWA] New update available.');
                  // Dispatch global event for UI banner
                  window.dispatchEvent(
                    new CustomEvent('pivott:sw-update-available', {
                      detail: { registration }
                    })
                  );
                }
              });
            }
          });

          // Check for SW updates every 30 minutes
          setInterval(() => {
            registration.update().catch(() => {});
          }, 30 * 60 * 1000);
        })
        .catch(error => {
          console.warn('[Pivott PWA] Service Worker registration failed:', error);
        });

      // Reload smoothly when a new service worker takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log('[Pivott PWA] New service worker took control. Reloading...');
          window.location.reload();
        }
      });
    });
  }
}
