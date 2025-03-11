// use react-query to post a new chat to the backend and axios, with credentials

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Chat, Page } from "../types";

export const usePostChat = () => {
  return useMutation({
    mutationFn: async (chat: Chat) => {
      const response = await axios.post<Chat>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats`, {
        title: chat.title,
        description: chat.description,
        context: chat.context
      }, {
        withCredentials: true
      });
      return response.data;
    },
  });
};

// use react-query to get all chats from the backend and axios, with credentials, and queries size & page as parameters

export const useGetChats = (size: number, page: number) => {
  return useQuery({
    queryKey: ["chats", size, page],
    queryFn: async () => {
      const response = await axios.get<Page<Chat>>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats`, {
        withCredentials: true,
        params: {
          size,
          page
        }
      });
      return response.data;
    }
  });
};

// use react-query to get a chat from the backend and axios, with credentials, and path params id

export const useGetChat = (id: string) => {
  return useQuery({
    queryKey: ["chats", id],
    queryFn: async () => {
      const response = await axios.get<Chat>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/${id}`, {
        withCredentials: true       
      });
      return response.data;
    }
  });
};

// use react-query to delete a chat from the backend and axios, with credentials, and query id

export const useDeleteChat = (id: string) => {
  return useMutation({
    mutationFn: async () => {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/${id}`, {
        withCredentials: true
      });
      return response.data;
    }
  });
};

// use react-query to update a chat from the backend and axios, with credentials, and query id

export const useUpdateChat = (id: string) => {
  return useMutation({
    mutationFn: async (chat: Chat) => {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/${id}`, {
        title: chat.title,
        description: chat.description,
        context: chat.context
      }, {
        withCredentials: true
      });
      return response.data;
    }
  });
};

// use react-query to post a new file with form "file", with formData to the backend and axios, with credentials, and query id

export const usePostFile = (id: string) => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.post<Chat>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/${id}/upload`, formData, {
        withCredentials: true
      });
      return response.data;
    }
  });
};

// use react-query to delete a file by its id and chat id (bot path params), with credentials and axios

export const useDeleteFile = (chatId: string) => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/${chatId}/delete/${id}`, {
        withCredentials: true
      });
      return response.data;
    }
  });
};

// use react-query to chat with a chat from the backend and axios, with credentials, and path chat id and message from search query parameter "text "
/**
 * Hook to fetch a chat by ID and submit a search query.
 * @param {string} chatId - The ID of the chat.
 */
export const useChat = (chatId: string) => {
  const queryClient = useQueryClient();

  // Fetch chat by ID
  const fetchChat = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/${chatId}`, {
      withCredentials: true,
    });
    return response.data;
  };

  // Query: Fetch chat
  const chatQuery = useQuery({
    queryKey: ["chat", chatId],
    queryFn: fetchChat,
    enabled: !!chatId, // Only fetch if chatId exists
  });

  // Mutation: Submit a search query
  const searchMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await axios.get<Chat>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/${chatId}/chat`, {
        params: { text }, // Attach search text as query param
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", chatId] }); // Refresh chat data
    },
  });

  return { chatQuery, searchMutation };
};