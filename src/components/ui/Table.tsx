import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Table({
  minWidthClassName = "min-w-[40rem]",
  className,
  children,
}: {
  minWidthClassName?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-border bg-surface">
      <table
        className={cn(
          "w-full border-separate border-spacing-0 text-[13px]",
          minWidthClassName,
          className,
        )}
      >
        {children}
      </table>
    </div>
  );
}

export function THead({
  children,
  className,
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("text-muted", className)}>
      {children}
    </thead>
  );
}

export function TH({
  className,
  align = "left",
  sticky,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "right";
  sticky?: boolean;
}) {
  return (
    <th
      className={cn(
        "border-b border-border bg-[#f8f9fb] px-4 py-3 text-[11px] font-medium uppercase tracking-[0.06em]",
        align === "right" ? "text-right" : "text-left",
        sticky &&
          "sticky right-0 z-10 border-l border-border shadow-[-12px_0_12px_-12px_rgba(20,22,26,0.18)]",
        className,
      )}
      {...props}
    />
  );
}

export function TR({
  className,
  highlight,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { highlight?: boolean }) {
  return (
    <tr
      className={cn(
        "group last:[&>td]:border-b-0 transition-colors duration-150",
        highlight
          ? "[&>td]:bg-warning-soft/70 hover:[&>td]:bg-warning-soft"
          : "[&>td]:bg-surface hover:[&>td]:bg-[#f8f9fb]",
        className,
      )}
      {...props}
    />
  );
}

export function TD({
  className,
  align = "left",
  numeric,
  sticky,
  highlight: _highlight,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "right";
  numeric?: boolean;
  sticky?: boolean;
  highlight?: boolean;
}) {
  return (
    <td
      className={cn(
        "border-b border-border/80 whitespace-nowrap px-4 py-3",
        align === "right" ? "text-right" : "text-left",
        numeric && "tabular-nums",
        sticky &&
          "sticky right-0 z-10 border-l border-border shadow-[-12px_0_12px_-12px_rgba(20,22,26,0.18)]",
        className,
      )}
      {...props}
    />
  );
}
