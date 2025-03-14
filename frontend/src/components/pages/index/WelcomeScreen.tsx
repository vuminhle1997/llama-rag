'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { PencilSquareIcon } from '@heroicons/react/24/solid';
import ChatEntryForm from '@/components/form/ChatEntryForm';

const suggestions = [
  'Was sind die wichtigsten Funktionen unseres Produkts?',
  'Wie kann ich meinen Workflow verbessern?',
  'Erzählen Sie mir von den neuesten Updates',
  'Helfen Sie mir bei der Fehlerbehebung',
];

export default function WelcomeScreen() {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // TODO: Handle chat submission
    setInput('');
  };

  return (
    <main className="flex-1 overflow-hidden flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6 text-center animate-fade-in delay-200">
          Global CT InsightChat
        </h1>
        <p className="text-lg text-muted-foreground mb-8 text-center animate-fade-in delay-200">
          Willkommen bei Ihrem KI-Assistenten. Starten Sie einen neuen Chat oder
          stellen Sie eine Frage, um zu beginnen.
        </p>

        <div className="flex justify-center mb-8 animate-fade-in delay-300">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-primary text-primary-foreground hover:bg-primary/10"
              >
                <PencilSquareIcon className="h-4 w-4 mr-2" />
                Neuen Chat erstellen
              </Button>
            </DialogTrigger>
            <ChatEntryForm />
          </Dialog>
        </div>

        {/* <div className="space-y-4 animate-fade-in delay-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 text-left justify-start animate-fade-in-up"
                style={{ animationDelay: `${(index + 4) * 100}ms` }}
                onClick={() => setInput(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 animate-fade-in delay-800">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Geben Sie hier Ihre Nachricht ein..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div> */}
      </div>
    </main>
  );
}
