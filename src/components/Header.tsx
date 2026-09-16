import Link from "next/link";
import { PwaControls } from "@/components/PwaControls";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-primary text-[11px] font-semibold tracking-tight text-white">
            S
          </span>
          <span className="truncate text-[15px] font-semibold tracking-tight text-foreground">
            Stall Sales
          </span>
        </Link>
        <PwaControls />
      </div>
    </header>
  );
}
