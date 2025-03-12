import Link from 'next/link';
import { Input } from '../ui/input';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  Dialog,
  DialogTrigger,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import EllipsisHorizontalIcon from '@heroicons/react/24/solid/EllipsisHorizontalIcon';
import HeartIcon from '@heroicons/react/24/solid/HeartIcon';
import PencilIcon from '@heroicons/react/24/solid/PencilIcon';
import TrashIcon from '@heroicons/react/24/solid/TrashIcon';
import { Chat } from '@/frontend/types';
import ChatEntryForm from '../form/ChatEntryForm';
import { useState } from 'react';
import { useDeleteChat } from '@/frontend/queries/chats';
import { useRouter, usePathname } from 'next/navigation';

export default function ChatsNavigation({ chats }: { chats: Chat[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentChatId = pathname.split('/').pop(); // Get the last segment of the URL which is the chat ID
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteChat = useDeleteChat(chatToDelete || '');

  const handleDelete = (chatId: string) => {
    setChatToDelete(chatId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteChat.mutate(undefined, {
      onSuccess: () => {
        router.push("/")
        window.location.reload(); 
      },
      onError: (error) => {
        console.error('Failed to delete chat:', error);
      }
    });
  };

  return (
    <SidebarMenu>
      {chats.map((chat, i) => (
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
          <Dialog open={isDialogOpen && selectedChat?.id === chat.id} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setSelectedChat(null);
          }}>
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <DropdownMenuTrigger className="hover:bg-accent ml-2 w-[30px] h-[30px] flex justify-center items-center rounded-md cursor-pointer mt-1">
                      <EllipsisHorizontalIcon className="h-4 w-4" />
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Chat editieren</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent>
                <DropdownMenuItem disabled>
                  <HeartIcon className="h-4 w-4" /> Favorisieren
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={() => {
                    setSelectedChat(chat);
                    setIsDialogOpen(true);
                  }}>
                    <PencilIcon className="h-4 w-4" /> Editieren
                  </DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuItem className="text-destructive" onSelect={() => handleDelete(chat.id)}>
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
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chat löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diesen Chat löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarMenu>
  );
}
