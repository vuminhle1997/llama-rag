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
