'use client';
import React from 'react';

import { DialogTrigger } from '../ui/dialog';

import { Link, TrashIcon } from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { SidebarMenuButton } from '../ui/sidebar';
import { TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Tooltip } from '../ui/tooltip';

import { SidebarMenuItem } from '../ui/sidebar';
import { DropdownMenu } from '../ui/dropdown-menu';
import { TooltipProvider } from '../ui/tooltip';
import { Chat } from '@/frontend/types/chats';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { DropdownMenuTrigger } from '../ui/dropdown-menu';
import { DropdownMenuContent } from '../ui/dropdown-menu';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { PencilIcon } from '@heroicons/react/24/solid';
import ChatEntryForm from '../form/ChatEntryForm';
import { useState } from 'react';
import { useDeleteChat } from '@/frontend/queries/chats';
import {
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { AlertDialog } from '../ui/alert-dialog';

/**
 * ChatNavigationItem component renders a navigation item for a chat.
 * It includes functionality for editing and deleting the chat, as well as displaying alerts.
 *
 * @param {Object} props - The properties object.
 * @param {Chat} props.chat - The chat object.
 * @param {string} props.currentChatId - The ID of the current chat.
 * @param {boolean} props.isDialogOpen - Indicates if the dialog is open.
 * @param {Function} props.setIsDialogOpen - Function to set the dialog open state.
 * @param {Chat | null} props.selectedChat - The currently selected chat.
 * @param {Function} props.setSelectedChat - Function to set the selected chat.
 *
 * @returns {JSX.Element} The rendered ChatNavigationItem component.
 */
export const ChatNavigationItem = ({
  chat,
  currentChatId,
  isDialogOpen,
  setIsDialogOpen,
  selectedChat,
  setSelectedChat,
}: {
  chat: Chat;
  currentChatId: string;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat | null) => void;
}) => {
  const [favouriteAlert, setFavouriteAlert] = useState<{
    show: boolean;
    success: boolean;
  }>({ show: false, success: false });
  const deleteChat = useDeleteChat(chat.id);
  const handleDelete = () => {
    deleteChat.mutate(undefined, {
      onSuccess: () => {
        window.location.reload();
      },
      onError: error => {
        console.error('Failed to delete chat:', error);
      },
    });
  };
  return (
    <>
      <SidebarMenuItem
        className={`flex flex-row items-start justify-center px-4 py-2 min-h-[50px] ${
          chat.id === currentChatId ? 'bg-primary/20' : ''
        }`}
        key={`chat-${chat.id}`}
      >
        <Link href={`/chat/${chat.id}`} className="flex-1">
          <SidebarMenuButton className="w-full text-left fit-content h-full break-words whitespace-normal py-1">
            {chat.title}
          </SidebarMenuButton>
        </Link>
        <Dialog
          open={isDialogOpen && selectedChat?.id === chat.id}
          onOpenChange={open => {
            setIsDialogOpen(open);
            if (!open) setSelectedChat(null);
          }}
        >
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <DropdownMenuTrigger className="hover:bg-accent ml-2 w-[30px] h-[30px] flex justify-center items-center rounded-md cursor-pointer mt-1">
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent className="dark:bg-accent bg-primary border-2 border border-white shadow-sm">
                  <p>Chat editieren</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={() => {
                    setSelectedChat(chat);
                    setIsDialogOpen(true);
                  }}
                >
                  <PencilIcon className="h-4 w-4" /> Editieren
                </DropdownMenuItem>
              </DialogTrigger>
              <DropdownMenuItem
                className="text-destructive"
                onSelect={() => handleDelete()}
              >
                <TrashIcon className="h-4 w-4" /> Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {selectedChat && (
            <ChatEntryForm
              chat={selectedChat}
              onSuccess={() => {
                setIsDialogOpen(false);
                setSelectedChat(null);
                window.location.reload();
              }}
            />
          )}
        </Dialog>
      </SidebarMenuItem>
      <AlertDialog
        open={favouriteAlert.show}
        onOpenChange={open =>
          !open && setFavouriteAlert({ show: false, success: false })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {favouriteAlert.success
                ? 'Erfolgreich favorisiert'
                : 'Fehler beim Favorisieren'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {favouriteAlert.success
                ? 'Der Chat wurde erfolgreich zu Ihren Favoriten hinzugefügt.'
                : 'Beim Hinzufügen des Chats zu Ihren Favoriten ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setFavouriteAlert({ show: false, success: false })}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
