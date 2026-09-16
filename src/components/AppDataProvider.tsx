"use client";

import { useEffect, useState, type ReactNode } from "react";
import { hydrateAppData } from "@/data/store";
import { PageSkeleton } from "@/components/ui/Skeleton";

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrateAppData();
    setReady(true);
  }, []);

  if (!ready) {
    return <PageSkeleton />;
  }

  return children;
}
