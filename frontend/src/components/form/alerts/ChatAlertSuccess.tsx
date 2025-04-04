import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Check } from 'lucide-react';
import React from 'react';

export default function ChatAlertSuccess(
  { mode }: { mode: 'create' | 'update' } = { mode: 'create' }
) {
  return (
    <div className="fixed top-4 right-4 z-50 w-96">
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
