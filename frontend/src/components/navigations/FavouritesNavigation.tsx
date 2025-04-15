'use client';
import React, { useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
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
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  EllipsisHorizontalIcon,
  HeartIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import { selectFavouriteChats, useAppSelector } from '@/frontend';
import Link from 'next/link';
import { Chat } from '@/frontend/types';
import { Dialog, DialogTrigger } from '../ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import ChatEntryForm from '../form/ChatEntryForm';
import { useDeleteChat } from '@/frontend/queries/chats';
import {
  useParams,
  useRouter,
} from 'next/navigation';
import DeleteChatDialog from './chat/DeleteChatDialog';
import Image from 'next/image';

export default function FavouritesNavigation() {
  const { slug } = useParams();
  const router = useRouter();
  const favouriteChats = useAppSelector(selectFavouriteChats);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedChat, setSelectedChat] = React.useState<Chat | null>(null);
  const [chatToDelete, setChatToDelete] = React.useState<string | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const deleteChat = useDeleteChat(chatToDelete || '');
  const handleDelete = useCallback((chatId: string) => {
    setChatToDelete(chatId);
    setIsDeleteDialogOpen(true);
  }, []);
  const confirmDelete = () => {
    deleteChat.mutate(undefined, {
      onSuccess: () => {
        router.push('/');
        window.location.reload();
      },
      onError: error => {
        console.error('Failed to delete chat:', error);
      },
    });
  };

  return (
    <>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger>
              <div className="flex gap-2">
                <HeartIcon className="h-4 w-4 text-primary" />
                <span className="text-md">Ihre favorisierten Chats</span>
              </div>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {favouriteChats &&
                  favouriteChats.map((chat, index) => {
                    return (
                      <SidebarMenuItem
                        className={`flex flex-row items-start justify-center px-4 py-2 min-h-[50px] ${
                          chat.id === slug ? 'bg-primary/20' : ''
                        }`}
                        key={`favourite-${index}`}
                      >
                        <Link
                          href={`/chat/${chat.id}`}
                          className="flex-1 flex justify-center items-center"
                        >
                          <Image
                            src={`${
                              process.env.NEXT_PUBLIC_BACKEND_URL
                            }/uploads/avatars/${chat.avatar_path
                              .split('/')
                              .pop()}`}
                            alt={`Avatar of ${chat.title}`}
                            className="h-10 w-10 rounded-full mr-2 border-2 border-primary"
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
                                <TooltipContent>
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
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
      <DeleteChatDialog
        confirmDelete={confirmDelete}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
      />
    </>
  );
}
