"use client";

import { useEffect, useState } from "react";
import { isStandaloneDisplay } from "@/lib/pwa";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaControls() {
  const [isOffline, setIsOffline] = useState(false);
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function syncOnlineStatus() {
      setIsOffline(!navigator.onLine);
    }

    syncOnlineStatus();
    window.addEventListener("online", syncOnlineStatus);
    window.addEventListener("offline", syncOnlineStatus);

    return () => {
      window.removeEventListener("online", syncOnlineStatus);
      window.removeEventListener("offline", syncOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (isStandaloneDisplay()) {
      return;
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setInstallEvent(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  return (
    <div className="ml-auto flex shrink-0 items-center gap-2">
      {installEvent ? (
        <button
          type="button"
          onClick={handleInstall}
          className="inline-flex h-8 items-center rounded-[8px] px-2 text-[11px] font-medium text-primary hover:bg-primary-soft"
        >
          Install App
        </button>
      ) : null}
      <p
        role="status"
        aria-live="polite"
        className={`text-[11px] font-medium ${
          isOffline ? "text-warning" : "text-muted"
        }`}
      >
        {isOffline ? "Offline" : "Online"}
      </p>
    </div>
  );
}
