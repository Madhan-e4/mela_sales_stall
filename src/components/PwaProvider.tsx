"use client";

import { useEffect, type ReactNode } from "react";

const SHELL_CACHE_PREFIX = "stall-sales-shell-";

export function PwaProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      void unregisterDevelopmentWorkers();
      return;
    }

    const register = () => {
      void navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") {
        return;
      }

      void navigator.serviceWorker.getRegistration().then((registration) => {
        void registration?.update();
      });
    }

    function handleOfflineLinkClick(event: MouseEvent) {
      if (navigator.onLine || event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");
      if (!anchor || !anchor.href) {
        return;
      }

      if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) {
        return;
      }

      event.preventDefault();
      window.location.assign(url.href);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("click", handleOfflineLinkClick, true);

    return () => {
      window.removeEventListener("load", register);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("click", handleOfflineLinkClick, true);
    };
  }, []);

  return children;
}

async function unregisterDevelopmentWorkers() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations.map((registration) => registration.unregister()),
  );

  if (!("caches" in window)) {
    return;
  }

  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => key.startsWith(SHELL_CACHE_PREFIX))
      .map((key) => caches.delete(key)),
  );
}
