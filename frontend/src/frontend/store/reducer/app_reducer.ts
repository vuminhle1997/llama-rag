import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

// Define a type for the slice state
interface AppState {
  isAuthorized: boolean;
}

// Define the initial state using that type
const initialState: AppState = {
  isAuthorized: true,
};

export const appSlice = createSlice({
  name: "app",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setIsAuthorized: (state, action: PayloadAction<boolean>) => {
      state.isAuthorized = action.payload;
    },
  },
});

export const { setIsAuthorized } = appSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectAuthorized = (state: RootState) => state.app.isAuthorized;

export default appSlice.reducer;
