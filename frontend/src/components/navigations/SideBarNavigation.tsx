'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Logo from '@/static/globalLogo.png';
import Image from 'next/image';
import {
  MagnifyingGlassCircleIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/solid';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
} from '@/components/ui/sidebar';
import FooterNavigation from './FooterNavigation';
import ChatEntryForm from '../form/ChatEntryForm';
import ChatsNavigation from './ChatsNavigation';
import {
  selectShowCommands,
  setShowCommands,
  useAppDispatch,
  useAppSelector,
} from '@/frontend';
import { Tooltip, TooltipProvider } from '@radix-ui/react-tooltip';
import { TooltipContent, TooltipTrigger } from '../ui/tooltip';

/**
 * SideBarNavigation component renders the sidebar navigation for the application.
 * It includes a header with a logo and a search bar, content with a button to create a new chat,
 * and a footer navigation.
 *
 * @returns {JSX.Element} The rendered sidebar navigation component.
 */
export default function SideBarNavigation() {
  const dispatch = useAppDispatch();
  const showCommands = useAppSelector(selectShowCommands);

  const handleShowCommandDialog = useCallback(() => {
    dispatch(setShowCommands(!showCommands));
  }, [showCommands, dispatch]);

  return (
    <Sidebar>
      <div className="sticky top-0 z-10 bg-background">
        <SidebarHeader>
          <div className="relative">
            <Link href="/">
              <Image className="p-4" alt="global CT Logo" src={Logo} />
            </Link>
          </div>
        </SidebarHeader>
      </div>

      <SidebarContent>
        <div className="row col-span-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="mx-4 bg-primary text-primary-foreground hover:bg-primary/10"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Neuen Chat erstellen
              </Button>
            </DialogTrigger>
            <ChatEntryForm />
          </Dialog>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleShowCommandDialog}
                  className="bg-primary text-primary-foreground hover:bg-primary/50"
                >
                  <MagnifyingGlassCircleIcon className="h-4 w-4" />
                  Suchen
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bisherigen Chat suchen.</p>
                <div className="flex items-center justify-center text-center">
                  <p>
                    Drücke <br /> ⌘+J (macOS) <br /> Strg+J (Windows/Linux){' '}
                    <br />
                    um die Suche zu öffnen.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <ChatsNavigation />
      </SidebarContent>

      <FooterNavigation />
    </Sidebar>
  );
}
