import type { ReactNode } from "react";
import { Card } from "./Card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="px-5 py-10 text-center">
      <p className="text-[15px] font-medium text-foreground">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-secondary">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </Card>
  );
}
