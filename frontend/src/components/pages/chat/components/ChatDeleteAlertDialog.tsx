'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import React from 'react';

export interface ChatDeleteAlertDialogProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  confirmDelete: () => void;
}

/**
 * ChatDeleteAlertDialog component renders a dialog to confirm the deletion of a chat.
 *
 * @param {boolean} isDeleteDialogOpen - Indicates whether the delete dialog is open.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setIsDeleteDialogOpen - Function to set the state of the delete dialog.
 * @param {() => void} confirmDelete - Function to confirm the deletion of the chat.
 *
 * @returns {JSX.Element} The rendered ChatDeleteAlertDialog component.
 */
export default function ChatDeleteAlertDialog({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  confirmDelete,
}: ChatDeleteAlertDialogProps) {
  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Chat löschen</AlertDialogTitle>
          <AlertDialogDescription>
            Sind Sie sicher, dass Sie diesen Chat löschen möchten? Diese Aktion
            kann nicht rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            className="dark:bg-accent"
            onClick={() => setIsDeleteDialogOpen(false)}
          >
            Abbrechen
          </AlertDialogAction>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
