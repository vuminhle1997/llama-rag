'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { UserProfile } from '@/frontend/types';
import { Chat } from '@/frontend/types';

// Define a type for the slice state
interface AppState {
  isAuthorized: boolean;
  user: UserProfile | null;
  chats: Chat[] | null;
  favouriteChats: Chat[] | null;
  profilePicture: string | null;
  appState: 'idle' | 'loading' | 'failed';
  showCommands: boolean;
  theme: 'system' | 'dark' | 'light';
}

// Define the initial state using that type
const initialState: AppState = {
  isAuthorized: true,
  user: null,
  chats: null,
  profilePicture: null,
  favouriteChats: null,
  appState: 'loading',
  showCommands: false,
  theme: 'system',
};

/**
 * A slice for the app state management.
 *
 * @remarks
 * This slice contains reducers to manage the state of the application, including authorization status, user information, chat data, profile picture, favourite chats, and the overall app state.
 *
 * @public
 *
 * @param {string} name - The name of the slice.
 * @param {object} initialState - The initial state of the slice.
 * @param {object} reducers - The reducers to handle state changes.
 *
 * @property {function} setIsAuthorized - Sets the authorization status of the user.
 * @property {function} setUser - Sets the user information.
 * @property {function} setChats - Sets the list of chats.
 * @property {function} setProfilePicture - Sets the profile picture URL.
 * @property {function} setFavouriteChats - Sets the list of favourite chats.
 * @property {function} setAppState - Sets the overall app state.
 * @property {function} setAppTheme - Sets the theming state.
 */
export const appSlice = createSlice({
  name: 'app',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setIsAuthorized: (state, action: PayloadAction<boolean>) => {
      state.isAuthorized = action.payload;
    },
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
    },
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    setProfilePicture: (state, action: PayloadAction<string>) => {
      state.profilePicture = action.payload;
    },
    setFavouriteChats: (state, action: PayloadAction<Chat[]>) => {
      state.favouriteChats = action.payload;
    },
    setAppState: (state, action: PayloadAction<AppState['appState']>) => {
      state.appState = action.payload;
    },
    setShowCommands: (state, action: PayloadAction<boolean>) => {
      state.showCommands = action.payload;
    },
    setAppTheme: (state, action: PayloadAction<AppState['theme']>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
  },
});

export const {
  setIsAuthorized,
  setUser,
  setChats,
  setProfilePicture,
  setFavouriteChats,
  setAppState,
  setShowCommands,
  setAppTheme,
} = appSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectAuthorized = (state: RootState) => state.app.isAuthorized;
export const selectUser = (state: RootState) => state.app.user;
export const selectChats = (state: RootState) => state.app.chats;
export const selectProfilePicture = (state: RootState) =>
  state.app.profilePicture;
export const selectFavouriteChats = (state: RootState) =>
  state.app.favouriteChats;
export const selectAppState = (state: RootState) => state.app.appState;
export const selectShowCommands = (state: RootState) => state.app.showCommands;
export const selectAppTheme = (state: RootState) => state.app.theme;

export default appSlice.reducer;
