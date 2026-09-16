export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    ("standalone" in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function navigateWithRouter(
  href: string,
  push: (href: string) => void,
): void {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    window.location.assign(href);
    return;
  }

  push(href);
}
