'use client'

import React, { useEffect } from 'react';
import {
  selectAuthorized,
  setAppState,
  setChats,
  setFavouriteChats,
  setProfilePicture,
  setUser,
  useAppDispatch,
  useAppSelector,
} from '@/frontend';
import {
  SidebarProvider
} from '@/components/ui/sidebar';
import { useGetChats } from '@/frontend/queries/chats';
import { useGetProfilePicture } from '@/frontend/queries/avatar';
import { useGetFavourites } from '@/frontend/queries/favourites';
import { useAuth } from '@/frontend/queries';
import FavouritesDialog from '../navigations/FavouritesDialog';
import SideBarNavigation from '../navigations/SideBarNavigation';

export default function LayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const isAuthorized = useAppSelector(selectAuthorized);

  const { data: authData, isLoading, error} = useAuth();
  const { profilePicture } = useGetProfilePicture();
  const { data } = useGetChats(50, 1);
  const { data: favouriteChats } = useGetFavourites(50, 1);

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

  useEffect(() => {
    if (favouriteChats) {
      dispatch(setFavouriteChats(favouriteChats.items.map(favorite => favorite.chat)));
    }
  }, [favouriteChats]);

  useEffect(() => {
    if (authData && !isLoading && !error) {
      dispatch(setUser(authData));
      dispatch(setAppState('idle'));
    } else if (error) {
      dispatch(setAppState('failed'));
    }
  }
  , [authData, isLoading, error]);

  return isAuthorized ? (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '20rem',
          '--sidebar-width-icon': '4rem',
        } as React.CSSProperties
      }
    >
      <FavouritesDialog />
      <div className="flex h-screen w-screen">
        
        <SideBarNavigation />
        {children}
      </div>
    </SidebarProvider>
  ) : (
    <>{children}</>
  );
}
