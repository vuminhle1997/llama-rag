import React, { useEffect } from 'react';
import {
  selectAuthorized,
  setChats,
  setProfilePicture,
  useAppDispatch,
  useAppSelector,
} from '@/frontend';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import Logo from '@/static/globalLogo.png';
import Image from 'next/image';
import {
  HeartIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  StarIcon,
} from '@heroicons/react/24/solid';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import FooterNavigation from '../navigations/FooterNavigation';
import ChatEntryForm from '../form/ChatEntryForm';
import ChatsNavigation from '../navigations/ChatsNavigation';
import { useGetChats } from '@/frontend/queries/chats';
import { useGetProfilePicture } from '@/frontend/queries/avatar';
import { useGetFavourites } from '@/frontend/queries/favourites';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function LayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profilePicture } = useGetProfilePicture();
  const { data } = useGetChats(50, 1);
  const { data: favoritesData } = useGetFavourites(50, 1);
  const dispatch = useAppDispatch();
  const isAuthorized = useAppSelector(selectAuthorized);

  useEffect(() => {
    if (profilePicture) {
      dispatch(setProfilePicture(profilePicture));
    }
  }, [profilePicture]);

  useEffect(() => {
    if (data) {
      dispatch(setChats(data.items));
    }
  }, [data]);

  return isAuthorized ? (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '20rem',
          '--sidebar-width-icon': '4rem',
        } as React.CSSProperties
      }
    >
      <div className="flex h-screen w-screen">
        <div className="absolute top-4 right-4 z-50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-15 w-15 rounded-full bg-primary/10 hover:bg-primary/20"
                    >
                      <HeartIcon className="h-10 w-10 text-primary text-4xl" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Favorisierte Chats</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-2">
                      {favoritesData?.items.map(favorite => (
                        <Link
                          key={favorite.id}
                          href={`/chat/${favorite.chat.id}`}
                          className="block p-3 border rounded-lg hover:bg-accent cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <HeartIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{favorite.chat.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {format(
                                  new Date(favorite.chat.last_interacted_at),
                                  'dd.MM.yyyy',
                                  { locale: de }
                                )}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                      {(!favoritesData?.items ||
                        favoritesData.items.length === 0) && (
                        <p className="text-center text-muted-foreground py-4">
                          Keine favorisierten Chats vorhanden
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>Favorisierte Chats</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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

        {children}
      </div>
    </SidebarProvider>
  ) : (
    <>{children}</>
  );
}
