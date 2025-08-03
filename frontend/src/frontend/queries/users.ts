'use client';

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface RegisterUserParams {
  name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface LoginUserParams {
  email: string;
  password: string;
}

/**
 * A custom hook that provides a mutation for logging in a user.
 *
 * This hook uses `useMutation` from React Query to handle the login process.
 * It sends a POST request to the backend API with the provided login data.
 *
 * @returns A mutation object from React Query, which includes methods and state
 *          for managing the login mutation.
 *
 * @example
 * ```typescript
 * const { mutate: loginUser, isLoading, isError } = useLoginUser();
 *
 * const handleLogin = () => {
 *   loginUser({ username: 'example', password: 'password123' });
 * };
 * ```
 *
 * @remarks
 * Ensure that the `NEXT_PUBLIC_BACKEND_URL` environment variable is set to the
 * correct backend URL. The request includes credentials and expects a JSON
 * response.
 *
 * @see https://react-query-v3.tanstack.com/reference/useMutation
 */
export const useLoginUser = () => {
  return useMutation({
    mutationFn: async (data: LoginUserParams) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/login`,
        data,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response;
    },
  });
};

/**
 * Custom hook to register a new user using a mutation.
 *
 * This hook utilizes `useMutation` from React Query to send a POST request
 * to the backend API for user registration. The API endpoint is determined
 * by the `NEXT_PUBLIC_BACKEND_URL` environment variable.
 *
 * @returns A mutation object from React Query, which includes methods and
 *          state for managing the mutation lifecycle.
 *
 * @example
 * const mutation = useRegisterUser();
 * mutation.mutate({ username: 'example', password: 'password123' });
 *
 * @remarks
 * - The request includes credentials (`withCredentials: true`) to handle
 *   cookies or authentication tokens.
 * - Ensure the `NEXT_PUBLIC_BACKEND_URL` environment variable is correctly
 *   configured in your environment.
 *
 * @see {@link https://react-query.tanstack.com/reference/useMutation | React Query useMutation Documentation}
 */
export const useRegisterUser = () => {
  return useMutation({
    mutationFn: async (data: RegisterUserParams) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`,
        data,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response;
    },
  });
};
