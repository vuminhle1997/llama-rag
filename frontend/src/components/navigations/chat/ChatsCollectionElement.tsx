'use client';

import React from 'react';
import Link from 'next/link';
import { SidebarMenuButton, SidebarMenuItem } from '../../ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';
import { Dialog, DialogTrigger } from '../../ui/dialog';
import EllipsisHorizontalIcon from '@heroicons/react/24/solid/EllipsisHorizontalIcon';
import PencilIcon from '@heroicons/react/24/solid/PencilIcon';
import TrashIcon from '@heroicons/react/24/solid/TrashIcon';
import { Chat } from '@/frontend/types';
import ChatEntryForm from '../../form/ChatEntryForm';
import { getRelativeDate } from '@/frontend/utils';
import aiHelper from '@/static/templates/ai.jpeg';
import Image from 'next/image';

export interface ChatsCollectionElementProps {
  date: string;
  chats: Chat[];
  currentChatId?: string;
  handleDelete: (chatId: string) => void;
}

/**
 * ChatsCollectionElement component renders a collection of chat items grouped by date.
 * Each chat item includes options to edit or delete the chat.
 *
 * @param {ChatsCollectionElementProps} props - The properties for the component.
 * @param {string} props.date - The date for the chat collection.
 * @param {Chat[]} props.chats - The list of chat items.
 * @param {string} props.currentChatId - The ID of the currently active chat.
 * @param {function} props.handleDelete - The function to handle the deletion of a chat.
 *
 * @returns {JSX.Element} The rendered ChatsCollectionElement component.
 */
export default function ChatsCollectionElement({
  date,
  chats,
  currentChatId,
  handleDelete,
}: ChatsCollectionElementProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedChat, setSelectedChat] = React.useState<Chat | null>(null);
  return (
    <div key={date}>
      <div className="date-separator font-bold text-center py-4">
        {getRelativeDate(date)}
      </div>
      {chats.map(chat => (
        <SidebarMenuItem
          className={`flex flex-row items-start justify-center px-4 py-2 min-h-[50px] ${
            chat.id === currentChatId ? 'bg-primary/10 dark:bg-accent/50' : ''
          }`}
          key={`chat-${chat.id}`}
        >
          <Link
            href={`/chat/${chat.id}`}
            className="flex-1 flex justify-center items-center"
          >
            <Image
              src={
                `${
                  process.env.NEXT_PUBLIC_BACKEND_URL
                }/uploads/avatars/${chat.avatar_path.split('/').pop()}` ||
                aiHelper.src
              }
              alt={`Avatar of ${chat.title}`}
              className="h-10 w-10 rounded-full mr-2 border-2 dark:border-0 border-primary"
              width={40}
              height={40}
            />
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
                    <DropdownMenuTrigger
                      className="hover:bg-accent ml-2 w-[30px] h-[30px] 
                        flex justify-center items-center rounded-md cursor-pointer mt-1"
                    >
                      <EllipsisHorizontalIcon className="h-4 w-4" />
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="dark:bg-accent bg-primary border border-white shadow-sm">
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
                  onSelect={() => handleDelete(chat.id)}
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
      ))}
    </div>
  );
}
