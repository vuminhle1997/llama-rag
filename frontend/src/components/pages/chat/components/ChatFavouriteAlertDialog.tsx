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

/**
 * ChatFavouriteAlertDialog component displays an alert dialog to inform the user
 * about the success or failure of adding a chat to their favourites.
 *
 * @param {Object} props - The properties object.
 * @param {Object} props.favouriteAlert - The state object containing the alert visibility and success status.
 * @param {boolean} props.favouriteAlert.show - Indicates whether the alert dialog should be shown.
 * @param {boolean} props.favouriteAlert.success - Indicates whether the favourite action was successful.
 * @param {Function} props.setFavouriteAlert - Function to update the favourite alert state.
 *
 * @returns {JSX.Element} The rendered ChatFavouriteAlertDialog component.
 */
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
