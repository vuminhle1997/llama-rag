import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { AzureClaims } from "@/frontend/types";

// Define a type for the slice state
interface AppState {
  isAuthorized: boolean;
  user: AzureClaims | null;
}

// Define the initial state using that type
const initialState: AppState = {
  isAuthorized: true,
  user: null,
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
  },
});

export const { setIsAuthorized, setUser } = appSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectAuthorized = (state: RootState) => state.app.isAuthorized;
export const selectUser = (state: RootState) => state.app.user;

export default appSlice.reducer;
