import React, { useEffect } from 'react';
import { selectAuthorized, setChats, setProfilePicture, useAppDispatch, useAppSelector } from '@/frontend';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import Logo from '@/static/globalLogo.png';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/solid';
import {
  Dialog,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
} from '@/components/ui/sidebar';
import FooterNavigation from '../navigations/FooterNavigation';
import ChatEntryForm from '../form/ChatEntryForm';
import ChatsNavigation from '../navigations/ChatsNavigation';
import { useGetChats } from '@/frontend/queries/chats';
import { useGetProfilePicture } from '@/frontend/queries/avatar';
export default function LayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profilePicture } = useGetProfilePicture();
  const { data } = useGetChats(50, 1);
  const dispatch = useAppDispatch();
  const isAuthorized= useAppSelector(selectAuthorized);

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
        <Sidebar>
          <SidebarHeader>
            <Link href="/">
              <Image className="p-4" alt="global CT Logo" src={Logo} />
            </Link>
            <div className="search-bar p-4">
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  className="bg-white"
                  type="text"
                  placeholder="Chat suchen . . ."
                />
                <Button type="submit" className="bg-primary">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SidebarHeader>

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
