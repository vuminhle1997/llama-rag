'use client';
import { useAuth } from '@/frontend/queries';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Geist, Geist_Mono } from 'next/font/google';
import {
  PencilSquareIcon,
} from '@heroicons/react/24/solid';
import {
  Dialog,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Send } from 'lucide-react';
import { useState } from 'react';
import ChatEntryForm from '@/components/form/ChatEntryForm';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const suggestions = [
  'Was sind die wichtigsten Funktionen unseres Produkts?',
  'Wie kann ich meinen Workflow verbessern?',
  'Erzählen Sie mir von den neuesten Updates',
  'Helfen Sie mir bei der Fehlerbehebung',
];

export default function Home() {
  const { data, isLoading, error } = useAuth();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // TODO: Handle chat submission
    setInput('');
  };

  if (isLoading)
    return (
      <div className="flex h-screen">
        {/* Sidebar Skeleton */}
        <div className="w-1/3 border-r border-border bg-card p-6">
          <div className="space-y-6">
            {/* New Chat Button Skeleton */}
            <Skeleton className="h-12 w-full" />

            {/* Chat History Skeletons */}
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area Skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages Area */}
          <div className="flex-1 p-8 space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-6">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Input Area Skeleton */}
          <div className="border-t border-border p-6">
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );

  if (!isLoading && error) {
    return (
      <div className="relative flex min-h-screen flex-col">
        <main className="flex flex-grow">
          {/* Left Section */}
          <div className="flex w-1/2 flex-col items-center justify-center bg-gray-400/10">
            <div className="text-center">
              <img
                src="/globalLogo.png"
                alt="Login illustration"
                className="mx-auto w-2/3 animate-fade-in-up"
              />
              <div className="mt-8">
                <h1 className="mb-3 text-4xl font-bold text-foreground animate-fade-in">
                  Global CT InsightChat
                </h1>
                <p className="mb-6 text-xl text-muted-foreground animate-fade-in">
                  Intelligenz durch datengestützte Gespräche
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex w-1/2 items-center justify-center bg-card px-8">
            <div className="w-full max-w-md space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Anmelden
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Bitte melden Sie sich mit Ihrem Microsoft-Konto an, um fortzufahren
                </p>
              </div>
              <div className="mt-8">
                <a
                  href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/signin/`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 23 23"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fill="#F25022" d="M1 1h10v10H1z" />
                    <path fill="#00A4EF" d="M1 12h10v10H1z" />
                    <path fill="#7FBA00" d="M12 1h10v10H12z" />
                    <path fill="#FFB900" d="M12 12h10v10H12z" />
                  </svg>
                  Mit Microsoft anmelden
                </a>
              </div>
            </div>
          </div>
        </main>

        {/* Footer Section */}
        <footer className="w-full border-t border-border bg-background py-4">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
              <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} LlamaRAG. Alle Rechte vorbehalten.
              </div>
              <div className="flex space-x-6">
                <a
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Datenschutzerklärung
                </a>
                <a
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Nutzungsbedingungen
                </a>
                <a
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Kontakt
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-hidden flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6 text-center">Global CT InsightChat</h1>
        <p className="text-lg text-muted-foreground mb-8 text-center">
          Willkommen bei Ihrem KI-Assistenten. Starten Sie einen neuen Chat oder stellen Sie eine Frage, um zu beginnen.
        </p>
        
        <div className="flex justify-center mb-8">
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

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 text-left justify-start"
                onClick={() => setInput(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Geben Sie hier Ihre Nachricht ein..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
