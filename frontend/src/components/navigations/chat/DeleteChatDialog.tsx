'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';

export interface ChatsNavigationProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  confirmDelete: () => void;
}

/**
 * DeleteChatDialog component renders a dialog to confirm the deletion of a chat.
 *
 * @param {boolean} isDeleteDialogOpen - Indicates whether the delete dialog is open.
 * @param {function} setIsDeleteDialogOpen - Function to set the state of the delete dialog.
 * @param {function} confirmDelete - Function to confirm the deletion of the chat.
 *
 * @returns {JSX.Element} The rendered DeleteChatDialog component.
 */
export default function DeleteChatDialog({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  confirmDelete,
}: ChatsNavigationProps) {
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
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
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
