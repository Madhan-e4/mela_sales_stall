"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type DiscardChangesDialogProps = {
  onKeepEditing: () => void;
  onDiscard: () => void;
};

export function DiscardChangesDialog({
  onKeepEditing,
  onDiscard,
}: DiscardChangesDialogProps) {
  return (
    <Modal title="Discard changes?" onClose={onKeepEditing}>
      <p className="mt-2 text-sm text-secondary">Your edits will not be saved.</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onKeepEditing}>
          Keep Editing
        </Button>
        <Button variant="danger" onClick={onDiscard}>
          Discard
        </Button>
      </div>
    </Modal>
  );
}
