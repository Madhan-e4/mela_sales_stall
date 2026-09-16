import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { ButtonLink } from "./Button";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
};

export function PageHeader({
  title,
  description,
  action,
  backHref,
  backLabel = "Back",
  onBack,
}: PageHeaderProps) {
  return (
    <header className="space-y-3">
      {backHref ? (
        <ButtonLink
          href={backHref}
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 px-2 text-secondary"
        >
          <ChevronLeft size={16} strokeWidth={1.75} />
          {backLabel}
        </ButtonLink>
      ) : null}
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="-ml-2 inline-flex h-8 items-center gap-1 rounded-[8px] px-2 text-sm font-medium text-secondary transition-colors hover:bg-background hover:text-foreground"
        >
          <ChevronLeft size={16} strokeWidth={1.75} />
          {backLabel}
        </button>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-secondary">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0 sm:pt-0.5">{action}</div> : null}
      </div>
    </header>
  );
}
