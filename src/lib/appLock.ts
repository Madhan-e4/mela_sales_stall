const UNLOCKED_KEY = "stall-sales-unlocked";
const UNLOCKED_VALUE = "1";
const APP_PASSWORD = "0507";

export function isAppUnlocked(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(UNLOCKED_KEY) === UNLOCKED_VALUE;
  } catch {
    return false;
  }
}

export function unlockApp(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(UNLOCKED_KEY, UNLOCKED_VALUE);
  } catch {
    // Ignore quota and private-mode write failures.
  }
}

export function lockApp(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(UNLOCKED_KEY);
  } catch {
    // Ignore storage access failures.
  }
}

export function isCorrectPassword(value: string): boolean {
  return value === APP_PASSWORD;
}
