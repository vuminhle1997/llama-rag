import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

/**
 * A custom hook that returns the `dispatch` function from the Redux store.
 * This hook is typed with `AppDispatch` to ensure that the correct dispatch type is used.
 *
 * @returns {AppDispatch} The dispatch function from the Redux store.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * A custom hook that wraps the `useSelector` hook with the `RootState` type.
 * This ensures that the state selected by the hook is correctly typed according to the application's root state.
 *
 * @returns The selected state from the Redux store, typed as `RootState`.
 */
export const useAppSelector = useSelector.withTypes<RootState>();
