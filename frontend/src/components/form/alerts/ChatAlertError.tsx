'use client';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import React from 'react';

/**
 * A React component that displays an error alert for chat operations.
 *
 * @param {Object} props - The properties object.
 * @param {'create' | 'update'} [props.mode='create'] - The mode of the alert, 
 * indicating whether the error occurred during the creation or update of a chat.
 *
 * @returns {JSX.Element} A fixed-position alert component with a descriptive 
 * error message based on the provided mode.
 *
 * @example
 * // Render an error alert for chat creation failure
 * <ChatAlertError mode="create" />
 *
 * @example
 * // Render an error alert for chat update failure
 * <ChatAlertError mode="update" />
 */
export default function ChatAlertError(
  { mode }: { mode: 'create' | 'update' } = { mode: 'create' }
) {
  return (
    <div className="fixed top-4 right-4 z-50 w-96">
      <Alert variant="destructive" className="relative">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>
          {mode === 'create'
            ? 'Fehler beim Erstellen'
            : 'Fehler beim Aktualisieren'}
        </AlertTitle>
        <AlertDescription>
          {mode === 'create'
            ? 'Der Chat konnte nicht erstellt werden. Bitte versuchen Sie es erneut.'
            : 'Der Chat konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.'}
        </AlertDescription>
      </Alert>
    </div>
  );
}
