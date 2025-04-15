'use client';

import React from 'react';
import Logo from '@/static/globalLogo.png';
import Image from 'next/image';

/**
 * SignInPage component renders a sign-in page with two sections:
 * - Left Section: Displays a logo and a brief description.
 * - Right Section: Provides a sign-in button for Microsoft account authentication.
 *
 * The page is divided into two halves:
 * - The left half contains an illustration, a title, and a description.
 * - The right half contains a sign-in prompt and a button to sign in with a Microsoft account.
 *
 * The footer includes links to the privacy policy, terms of service, and contact information.
 *
 * @returns {JSX.Element} The rendered sign-in page component.
 */
export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <main className="flex flex-grow flex-col md:flex-row items-center justify-center md:items-stretch">
        {/* Left Section */}
        <div className="flex w-full md:w-1/2 flex-col items-center justify-center md:bg-gray-400/10 p-4 md:p-0">
          <div className="text-center">
            <Image
              src={Logo}
              alt="Login illustration"
              className="mx-auto w-2/3 md:w-1/2 animate-fade-in-up"
            />
            <div className="mt-8">
              <h1 className="mb-3 text-2xl md:text-4xl font-bold text-foreground animate-fade-in">
                Global CT InsightChat
              </h1>
              <p className="mb-6 text-lg md:text-xl text-muted-foreground animate-fade-in">
                Intelligenz durch datengestützte Gespräche
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex w-full md:w-1/2 items-center justify-center bg-card px-4 md:px-8 py-8 md:py-0">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                Anmelden
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Bitte melden Sie sich mit Ihrem Microsoft-Konto an, um
                fortzufahren
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
      <footer className="w-full border-t border-border bg-background py-4 text-center md:text-left">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <div className="text-sm text-muted-foreground flex items-center justify-center text-center">
              © 2014 - {new Date().getFullYear()} global CT Services &
              Consulting GmbH. <br /> Alle Rechte vorbehalten.
            </div>
            <div className="flex flex-wrap justify-center lg:gap-4 gap-2 w-full lg:w-auto">
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
