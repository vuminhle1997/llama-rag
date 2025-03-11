// use react-query to post a new chat to the backend and axios, with credentials

import { useMutation, useQuery } from "@tanstack/react-query";
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
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/${id}`, {
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