'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  MagnifyingGlassCircleIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  useSidebar,
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

  const { toggleSidebar } = useSidebar();

  /**
   * Toggles the visibility of the command dialog by dispatching an action
   * to update the `showCommands` state.
   *
   * @remarks
   * This function uses the `useCallback` hook to memoize the callback,
   * ensuring it only changes when `showCommands` or `dispatch` changes.
   *
   * @dependencies
   * - `showCommands`: The current state of the command dialog visibility.
   * - `dispatch`: The Redux dispatch function to trigger state updates.
   */
  const handleShowCommandDialog = useCallback(() => {
    dispatch(setShowCommands(!showCommands));
  }, [showCommands, dispatch]);

  /**
   * Toggles the state of the sidebar.
   * This function is memoized using `useCallback` to prevent unnecessary re-renders.
   * It depends on the `toggleSidebar` function provided as a dependency.
   */
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
                    className="bg-primary dark:bg-background hover:bg-primary/10"
                    onClick={() => handleSideBarToggle()}
                  >
                    <XMarkIcon className="h-4 w-4 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="dark:bg-accent bg-primary border-2 border-white shadow-sm">
                  <p>Seitenleiste minimieren</p>
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
                        className="mx-4 bg-primary dark:bg-background hover:bg-primary/10"
                      >
                        <PencilSquareIcon className="h-4 w-4 text-white" />
                      </Button>
                    </DialogTrigger>
                    <ChatEntryForm />
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent className="dark:bg-accent bg-primary border-2 border-white shadow-sm">
                  <p>Neuen Chat erstellen</p>
                  <div className="flex items-center justify-center text-center"></div>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    onClick={handleShowCommandDialog}
                    variant="outline"
                    className="bg-primary dark:bg-background hover:bg-primary/10"
                  >
                    <MagnifyingGlassCircleIcon className="h-4 w-4 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="dark:bg-accent bg-primary border-2 border-white shadow-sm">
                  <p>Bisherigen Chat suchen.</p>
                  <div className="flex items-center justify-center text-center">
                    <p>
                      Drücke <br /> ⌘+K (macOS) <br /> Strg+K (Windows/Linux){' '}
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
