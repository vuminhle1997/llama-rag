import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import React from 'react';

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
