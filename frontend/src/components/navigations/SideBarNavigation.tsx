'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Logo from '@/static/globalLogo.png';
import Image from 'next/image';
import {
  HeartIcon,
  MagnifyingGlassCircleIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from '@/components/ui/sidebar';
import FooterNavigation from './FooterNavigation';
import ChatEntryForm from '../form/ChatEntryForm';
import ChatsNavigation from './ChatsNavigation';
import {
  selectFavouriteChats,
  selectShowCommands,
  setShowCommands,
  useAppDispatch,
  useAppSelector,
} from '@/frontend';
import { Tooltip, TooltipProvider } from '@radix-ui/react-tooltip';
import { TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import FavouritesNavigation from './FavouritesNavigation';

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
  const favouriteChats = useAppSelector(selectFavouriteChats);

  const { open, toggleSidebar } = useSidebar();

  const handleShowCommandDialog = useCallback(() => {
    dispatch(setShowCommands(!showCommands));
  }, [showCommands, dispatch]);

  const handleSideBarToggle = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex justify-between">
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    className="bg-primary text-primary-foreground hover:bg-primary/10"
                    onClick={() => handleSideBarToggle()}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Neuen Chat erstellen</p>
                  <div className="flex items-center justify-center text-center"></div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Dialog>
                    <DialogTrigger>
                      <Button
                        variant="outline"
                        className="mx-4 bg-primary text-primary-foreground hover:bg-primary/10"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <ChatEntryForm />
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Neuen Chat erstellen</p>
                  <div className="flex items-center justify-center text-center"></div>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    onClick={handleShowCommandDialog}
                    className="bg-primary text-primary-foreground hover:bg-primary/50"
                  >
                    <MagnifyingGlassCircleIcon className="h-4 w-4" />
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
        </div>
      </SidebarHeader>

      <SidebarContent>
        <FavouritesNavigation />
        <ChatsNavigation />
      </SidebarContent>

      <FooterNavigation />
    </Sidebar>
  );
}
