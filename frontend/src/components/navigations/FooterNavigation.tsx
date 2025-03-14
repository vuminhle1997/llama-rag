'use client';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { SidebarSeparator } from '../ui/sidebar';
import { Settings2Icon, LogOutIcon } from 'lucide-react';
import { useAppSelector } from '@/frontend/store/hooks/hooks';
import {
  selectUser,
  selectProfilePicture,
} from '@/frontend/store/reducer/app_reducer';
import Link from 'next/link';

/**
 * FooterNavigation component renders the footer section of the application.
 * It displays the user's profile picture, name, and email, along with a settings dropdown menu.
 *
 * @component
 * @returns {JSX.Element} The rendered footer navigation component.
 *
 * @example
 * // Usage example:
 * <FooterNavigation />
 *
 * @remarks
 * This component uses the `useAppSelector` hook to retrieve the user and profile picture from the Redux store.
 * It also includes a logout link that redirects to the backend logout URL.
 *
 * @dependencies
 * - Avatar
 * - AvatarImage
 * - AvatarFallback
 * - SidebarSeparator
 * - DropdownMenu
 * - DropdownMenuTrigger
 * - DropdownMenuContent
 * - DropdownMenuItem
 * - Button
 * - Link
 * - Settings2Icon
 * - LogOutIcon
 *
 * @hooks
 * - useAppSelector
 */
export default function FooterNavigation() {
  const user = useAppSelector(selectUser);
  const profilePicture = useAppSelector(selectProfilePicture);
  
  return (
    <div className="mt-auto">
      <SidebarSeparator className="mx-0" />
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={profilePicture ? profilePicture : ''} />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {user?.given_name || ''}
            </span>
            <span className="text-xs text-muted-foreground">
              {user?.unique_name || 'john.doe@example.com'}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings2Icon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-destructive">
              <Link href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/logout`}>
                <div className="flex flex-row">
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>Ausloggen</span>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
