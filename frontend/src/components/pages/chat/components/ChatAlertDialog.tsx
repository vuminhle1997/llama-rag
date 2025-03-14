'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';

export interface ChatAlertDialogProps {
  type: 'error' | 'success';
  title: string;
  description: string;
  show: boolean;
}

/**
 * ChatAlertDialog component displays an alert dialog with a title, description, and an icon
 * indicating the type of alert (success or destructive).
 *
 * @param {ChatAlertDialogProps} alert - The properties for the alert dialog.
 * @param {string} alert.type - The type of the alert, either 'success' or 'destructive'.
 * @param {string} alert.title - The title of the alert.
 * @param {string} alert.description - The description of the alert.
 *
 * @returns {JSX.Element} The rendered alert dialog component.
 */
export default function ChatAlertDialog(alert: ChatAlertDialogProps) {
  return (
    <div className="fixed top-4 right-4 z-50 w-96">
      <Alert
        variant={alert.type === 'success' ? 'default' : 'destructive'}
        className="relative"
      >
        {alert.type === 'success' ? (
          <Check className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertTitle>{alert.title}</AlertTitle>
        <AlertDescription>{alert.description}</AlertDescription>
      </Alert>
    </div>
  );
}
