import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { AzureClaims } from "@/frontend/types";
import { Chat } from "@/frontend/types";
// Define a type for the slice state
interface AppState {
  isAuthorized: boolean;
  user: AzureClaims | null;
  chat: Chat | null;
  chats: Chat[] | null;
}

// Define the initial state using that type
const initialState: AppState = {
  isAuthorized: true,
  user: null,
  chat: null,
  chats: null,
};

export const appSlice = createSlice({
  name: "app",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setIsAuthorized: (state, action: PayloadAction<boolean>) => {
      state.isAuthorized = action.payload;
    },
    setUser: (state, action: PayloadAction<AzureClaims>) => {
      state.user = action.payload;
    },
    setChat: (state, action: PayloadAction<Chat>) => {
      state.chat = action.payload;
    },
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
  },
});

export const { setIsAuthorized, setUser, setChat, setChats } = appSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectAuthorized = (state: RootState) => state.app.isAuthorized;
export const selectUser = (state: RootState) => state.app.user;
export const selectChat = (state: RootState) => state.app.chat;
export const selectChats = (state: RootState) => state.app.chats;

export default appSlice.reducer;
