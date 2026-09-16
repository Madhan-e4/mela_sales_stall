"use client";

import { useLockApp } from "@/components/AppLockGate";

export function LockControl() {
  const lock = useLockApp();

  if (!lock) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={lock}
      className="inline-flex h-8 items-center rounded-[8px] px-2 text-[11px] font-medium text-secondary hover:bg-background hover:text-foreground"
    >
      Lock
    </button>
  );
}
