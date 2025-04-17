import { configureStore } from '@reduxjs/toolkit';
import { appSlice } from './reducer';

/**
 * Configures and exports the Redux store for the application.
 *
 * The store is created using `configureStore` from Redux Toolkit.
 * It includes a single reducer, `app`, which is managed by `appSlice.reducer`.
 *
 * @see {@link https://redux-toolkit.js.org/api/configureStore configureStore}
 * @see {@link https://redux-toolkit.js.org/api/createSlice createSlice}
 */
export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
