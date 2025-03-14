'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import React from 'react';

export const UserChatNotFoundScreen = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Chat nicht gefunden
        </h2>
        <p className="text-gray-600">
          Der angeforderte Chat konnte nicht gefunden werden.
        </p>
        <Button
          onClick={() => {
            router.push('/');
          }}
          className="bg-primary text-white"
        >
          Zurück zur Hauptseite
        </Button>
      </div>
    </div>
  );
};

export default function ChatNotFoundScreen() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Chat nicht gefunden</h1>
      <p className="text-gray-600 mb-8">
        Der angeforderte Chat konnte nicht gefunden werden.
      </p>
      <Button
        onClick={() => router.push('/')}
        className="bg-primary text-white"
      >
        Zurück zur Startseite
      </Button>
    </div>
  );
}
