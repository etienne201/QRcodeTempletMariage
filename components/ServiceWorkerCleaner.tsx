"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerCleaner - Robust solution to wipe residual Vite/PWA artifacts.
 * This runs on the client and clears service workers, caches, and storage
 * that might have been left over from previous projects on the same port.
 */
export function ServiceWorkerCleaner() {
  useEffect(() => {
    const cleanup = async () => {
      let cleaned = false;

      // 1. Unregister all Service Workers
      if ("serviceWorker" in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
            console.log("Cleanup: Service Worker unregistered.");
            cleaned = true;
          }
        } catch (error) {
          console.error("Cleanup: Error unregistering SW:", error);
        }
      }

      // 2. Clear all Cache Storage
      if ("caches" in window) {
        try {
          const names = await caches.keys();
          for (const name of names) {
            await caches.delete(name);
            console.log(`Cleanup: Cache "${name}" deleted.`);
            cleaned = true;
          }
        } catch (error) {
          console.error("Cleanup: Error deleting caches:", error);
        }
      }

      // 3. Clear relevant LocalStorage/SessionStorage
      try {
        const keysToClear = Object.keys(localStorage).filter(
          (k) =>
            k.toLowerCase().includes("vite") ||
            k.toLowerCase().includes("sw") ||
            k.toLowerCase().includes("workbox") ||
            k.toLowerCase().includes("pwa")
        );
        keysToClear.forEach((k) => {
          localStorage.removeItem(k);
          cleaned = true;
        });
      } catch (e) {
        // storage might be blocked
      }

      // 4. Force reload ONLY if we actually found and removed something
      // This prevents infinite reload loops while ensuring the browser 
      // picks up the clean state.
      if (cleaned) {
        console.log("Cleanup: System wiped, reloading for a clean state...");
        window.location.reload();
      }
    };

    cleanup();
  }, []);

  return null;
}

