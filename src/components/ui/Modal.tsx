"use client";

import { useEffect, useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type ModalProps = {
  title: string;
  titleHidden?: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  closeOnOverlay?: boolean;
  zIndexClassName?: string;
};

export function Modal({
  title,
  titleHidden = false,
  onClose,
  children,
  maxWidth = "max-w-md",
  closeOnOverlay = true,
  zIndexClassName = "z-50",
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className={cn(
        "ui-overlay fixed inset-0 flex items-end justify-center bg-[var(--overlay)] p-4 pb-[calc(1rem+3.75rem+env(safe-area-inset-bottom))] sm:items-center sm:pb-4",
        zIndexClassName,
      )}
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "ui-panel max-h-[min(90dvh,44rem)] w-full overflow-y-auto rounded-[16px] border border-border bg-surface p-5",
          maxWidth,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id={titleId}
          className={
            titleHidden
              ? "sr-only"
              : "text-[17px] font-semibold tracking-tight text-foreground"
          }
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
