'use client';

import {
  AlertDialogHeader,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import React from 'react';

export interface ChatFavouriteAlertDialogProps {
  favouriteAlert: {
    show: boolean;
    success: boolean;
  };
  setFavouriteAlert: React.Dispatch<
    React.SetStateAction<{ show: boolean; success: boolean }>
  >;
}

export default function ChatFavouriteAlertDialog({
  favouriteAlert,
  setFavouriteAlert,
}: ChatFavouriteAlertDialogProps) {
  return (
    <AlertDialog
      open={favouriteAlert.show}
      onOpenChange={open =>
        !open && setFavouriteAlert({ show: false, success: false })
      }
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {favouriteAlert.success
              ? 'Erfolgreich favorisiert'
              : 'Fehler beim Favorisieren'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {favouriteAlert.success
              ? 'Der Chat wurde erfolgreich zu Ihren Favoriten hinzugefügt.'
              : 'Beim Hinzufügen des Chats zu Ihren Favoriten ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => setFavouriteAlert({ show: false, success: false })}
          >
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
