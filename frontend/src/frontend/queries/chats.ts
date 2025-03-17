'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Chat, Page } from '../types';
import { th } from 'date-fns/locale';

/**
 * Custom hook to post chat data to the backend.
 *
 * This hook uses the `useMutation` hook from React Query to handle the mutation.
 * It sends a POST request to the backend API to create a new chat.
 *
 * @returns {MutationResult<Chat, unknown, FormData, unknown>} The mutation result object.
 *
 * @example
 * const { mutate, isLoading, error } = usePostChat();
 *
 * const handleSubmit = (formData: FormData) => {
 *   mutate(formData);
 * };
 */
export const usePostChat = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.post<Chat>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
  });
};

/**
 * Custom hook to fetch chat data with pagination.
 *
 * @param size - The number of chat items to fetch per page.
 * @param page - The current page number to fetch.
 * @returns The result of the `useQuery` hook, which includes the chat data and query status.
 *
 * @example
 * const { data, error, isLoading } = useGetChats(10, 1);
 *
 * @remarks
 * This hook uses Axios to make a GET request to the backend API endpoint for chats.
 * The backend URL is retrieved from the environment variable `NEXT_PUBLIC_BACKEND_URL`.
 * The request includes credentials and pagination parameters.
 */
export const useGetChats = (size: number, page: number) => {
  return useQuery({
    queryKey: ['chats', size, page],
    queryFn: async () => {
      const response = await axios.get<Page<Chat>>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats`,
        {
          withCredentials: true,
          params: {
            size,
            page,
          },
        }
      );
      return response.data;
    },
  });
};

/**
 * Fetches a paginated list of chats from the backend API.
 *
 * @param size - The number of chats to retrieve per page.
 * @param page - The page number to retrieve.
 * @returns A promise that resolves to a Page object containing Chat objects.
 */
export const getChats = async (size: number, page: number) => {
  const response = await axios.get<Page<Chat>>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats`,
    {
      withCredentials: true,
      params: {
        size,
        page,
      },
    }
  );
  return response.data;
};

/**
 * Custom hook to fetch chat data by ID using React Query.
 *
 * @param {string} id - The ID of the chat to fetch.
 * @returns {UseQueryResult<Chat, Error>} The result of the query, including the chat data or an error.
 *
 * @example
 * const { data, error, isLoading } = useGetChat('chat-id');
 *
 * @remarks
 * This hook uses Axios to make a GET request to the backend API.
 * The backend URL is retrieved from the environment variable `NEXT_PUBLIC_BACKEND_URL`.
 * The request includes credentials (cookies) for authentication.
 */
export const useGetChat = (id: string) => {
  return useQuery({
    queryKey: ['chats', id],
    queryFn: async () => {
      const response = await axios.get<Chat>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/${id}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
  });
};

/**
 * Custom hook to delete a chat by its ID.
 *
 * This hook uses the `useMutation` hook from React Query to perform a DELETE request
 * to the backend API to delete a chat. The backend URL is retrieved from the environment
 * variable `NEXT_PUBLIC_BACKEND_URL`.
 *
 * @param {string} id - The ID of the chat to be deleted.
 * @returns {MutationResult} - The result of the mutation, including status and data.
 */
export const useDeleteChat = (id: string) => {
  return useMutation({
    mutationFn: async () => {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/${id}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
  });
};

/**
 * Custom hook to update a chat by its ID.
 *
 * This hook uses the `useMutation` hook from React Query to handle the mutation.
 * It sends a PUT request to the backend API to update the chat with the provided ID.
 *
 * @param {string} id - The ID of the chat to be updated.
 * @returns {MutationResult} - The result of the mutation, including status and data.
 *
 * @example
 * const { mutate, isLoading, error } = useUpdateChat(chatId);
 *
 * const handleUpdate = (formData) => {
 *   mutate(formData);
 * };
 */
export const useUpdateChat = (id: string) => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/${id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
  });
};

/**
 * Custom hook to handle file upload for a specific chat.
 *
 * @param id - The unique identifier of the chat.
 * @returns A mutation object that can be used to trigger the file upload.
 *
 * The mutation function accepts a FormData object containing the file to be uploaded.
 * It sends a POST request to the backend API to upload the file to the specified chat.
 *
 * The backend URL is retrieved from the environment variable `NEXT_PUBLIC_BACKEND_URL`.
 * The request includes credentials (cookies) for authentication.
 *
 * @example
 * ```typescript
 * const { mutate: uploadFile } = usePostFile(chatId);
 * 
 * const handleFileUpload = (file: File) => {
 *   const formData = new FormData();
 *   formData.append('file', file);
 *   uploadFile(formData);
 * };
 * ```
 */
export const usePostFile = (id: string) => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.post<Chat>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/${id}/upload`,
        formData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
  });
};

/**
 * Custom hook to delete a file associated with a chat.
 *
 * @param {string} chatId - The ID of the chat from which the file will be deleted.
 * @returns {UseMutationResult} - The result of the mutation, including status and data.
 *
 * @example
 * const { mutate: deleteFile } = useDeleteFile(chatId);
 * deleteFile(fileId);
 */
export const useDeleteFile = (chatId: string) => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/${chatId}/delete/${id}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
  });
};

/**
 * Custom hook to manage chat data and search functionality.
 *
 * @param {string} chatId - The ID of the chat to fetch.
 * @returns {object} An object containing the chat query and search mutation.
 * @returns {object.chatQuery} The query object for fetching chat data.
 * @returns {object.searchMutation} The mutation object for submitting a search query.
 *
 * @example
 * const { chatQuery, searchMutation } = useChat('chat-id');
 *
 * // Access chat data
 * const chatData = chatQuery.data;
 *
 * // Submit a search query
 * searchMutation.mutate('search text');
 */
export const useChat = (chatId: string) => {
  const queryClient = useQueryClient();

  // Fetch chat by ID
  const fetchChat = async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/${chatId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  };

  // Query: Fetch chat
  const chatQuery = useQuery({
    queryKey: ['chat', chatId],
    queryFn: fetchChat,
    enabled: !!chatId, // Only fetch if chatId exists
  });

  // Mutation: Submit a search query
  const searchMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await axios.get<Chat>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/${chatId}/chat`,
        {
          params: { text }, // Attach search text as query param
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] }); // Refresh chat data
    },
  });

  return { chatQuery, searchMutation };
};

export const getChatsByTitle = async (title: string) => {
  try {
    const res = await axios.get<Chat[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/search`, {
      withCredentials: true,
      params: {
        title,
      },
      headers: {
        'Accept': 'application/json',
      },
    })
    if (res.status === 200) {
      return res.data;
    }
    return [];
  } catch (error) {
    throw new Error('Failed to fetch chats');
  }
}