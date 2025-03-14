'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import Logo from '@/static/globalLogo.png';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
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

/**
 * SideBarNavigation component renders the sidebar navigation for the application.
 * It includes a header with a logo and a search bar, content with a button to create a new chat,
 * and a footer navigation.
 *
 * @returns {JSX.Element} The rendered sidebar navigation component.
 */
export default function SideBarNavigation() {
  return (
    <Sidebar>
      <div className="sticky top-0 z-10 bg-background">
        <SidebarHeader>
          <div className="relative">
            <Link href="/">
              <Image className="p-4" alt="global CT Logo" src={Logo} />
            </Link>
          </div>
          <div className="search-bar p-4">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                className="bg-white"
                type="text"
                placeholder="//TODO: Chat suchen . . ."
                disabled
              />
              <Button disabled type="submit" className="bg-primary">
                <MagnifyingGlassIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SidebarHeader>
      </div>

      <SidebarContent>
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

        <ChatsNavigation />
      </SidebarContent>

      <FooterNavigation />
    </Sidebar>
  );
}
