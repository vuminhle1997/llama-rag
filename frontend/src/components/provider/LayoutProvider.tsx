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

/**
 * LayoutProvider component is responsible for providing layout context and managing
 * application state based on user authorization and fetched data.
 *
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 *
 * @returns {JSX.Element} The rendered layout component.
 *
 * @remarks
 * This component uses several hooks to fetch data and update the application state:
 * - `useAppDispatch` to dispatch actions to the Redux store.
 * - `useAppSelector` to select the authorization state from the Redux store.
 * - `useAuth` to fetch authentication data.
 * - `useGetProfilePicture` to fetch the user's profile picture.
 * - `useGetChats` to fetch chat data.
 * - `useGetFavourites` to fetch favourite chats data.
 *
 * The component uses `useEffect` hooks to dispatch actions when the fetched data changes:
 * - Sets the profile picture when `profilePicture` changes.
 * - Sets the chat data when `data` changes.
 * - Sets the favourite chats when `favouriteChats` changes.
 * - Sets the user data and application state based on authentication data.
 *
 * If the user is authorized, the component renders the `SidebarProvider` with a sidebar
 * and the child components. Otherwise, it only renders the child components.
 */
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
