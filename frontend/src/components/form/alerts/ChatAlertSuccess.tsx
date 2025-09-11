'use client';

import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Check } from 'lucide-react';

/**
 * A React functional component that displays a success alert for chat operations.
 * The alert can indicate either the creation or update of a chat, based on the provided mode.
 *
 * @param {Object} props - The props object.
 * @param {'create' | 'update'} props.mode - Determines the type of success message to display.
 *                                           Defaults to 'create'.
 *                                           - 'create': Displays a success message for chat creation.
 *                                           - 'update': Displays a success message for chat update.
 *
 * @returns {JSX.Element} A fixed-position alert component with a success message.
 */
export default function ChatAlertSuccess(
  { mode }: { mode: 'create' | 'update' } = { mode: 'create' }
) {
  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Alert variant="default" className="relative">
        <Check className="h-4 w-4" />
        <AlertTitle>
          {mode === 'create' ? 'Chat erstellt' : 'Chat aktualisiert'}
        </AlertTitle>
        <AlertDescription>
          {mode === 'create'
            ? 'Der Chat wurde erfolgreich erstellt.'
            : 'Der Chat wurde erfolgreich aktualisiert.'}
        </AlertDescription>
      </Alert>
    </div>
  );
}
