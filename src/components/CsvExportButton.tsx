"use client";

import { useState } from "react";
import type { CsvExportResult } from "@/lib/csvExport";
import { Button } from "@/components/ui/Button";

type CsvExportButtonProps = {
  onExport: () => CsvExportResult;
};

export function CsvExportButton({ onExport }: CsvExportButtonProps) {
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function handleExport() {
    const result = onExport();

    if (result.ok) {
      setStatus("success");
      setMessage("CSV exported successfully.");
      return;
    }

    setStatus("error");
    setMessage(result.message);
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-1.5 sm:w-auto sm:items-end">
      <Button
        variant="secondary"
        size="lg"
        className="w-full sm:h-10 sm:w-auto sm:text-sm"
        onClick={handleExport}
      >
        Export CSV
      </Button>
      {message ? (
        <p
          role="status"
          className={`text-xs ${status === "error" ? "text-danger" : "text-secondary"}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
