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
import EllipsisHorizontalIcon from '@heroicons/react/24/solid/EllipsisHorizontalIcon';
import HeartIcon from '@heroicons/react/24/solid/HeartIcon';
import PencilIcon from '@heroicons/react/24/solid/PencilIcon';
import TrashIcon from '@heroicons/react/24/solid/TrashIcon';

export default function ChatsNavigation({ chats }: { chats: string[] }) {
  return (
    <SidebarMenu>
      {chats.map((chat, i) => (
        <SidebarMenuItem
          className="flex flex-row items-center justify-center px-4"
          key={`chat-${chat}`}
        >
          <Link href={`/chat/${chat}`} className="flex-1">
            <SidebarMenuButton className="w-full text-center">
              {chat}
            </SidebarMenuButton>
          </Link>
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <DropdownMenuTrigger className="hover:bg-accent ml-2 w-[30px] flex justify-center rounded-md cursor-pointer">
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
              <DropdownMenuItem disabled>
                <PencilIcon className="h-4 w-4" /> Editieren
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-destructive">
                <TrashIcon className="h-4 w-4" /> Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
