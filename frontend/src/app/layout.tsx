'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import AppProvider from '@/components/provider/AppProvider';
import { ThemeProvider } from '@/components/theme-provider';
import { use, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/**
 * RootLayout component that sets up the basic HTML structure for the application.
 *
 * @param {Readonly<{ children: React.ReactNode }>} props - The props object containing children.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 *
 * @returns {JSX.Element} The root layout component.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setTheme, theme } = useTheme();
  useEffect(() => {

    setTheme('dark');
  }, [])

  useEffect(() => {
    console.log(theme)
  }, [theme]);
  return (
    <html lang="de-DE" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          <ThemeProvider
            attribute="class"
             defaultTheme="dark"
            themes={['light', 'dark']}
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}
