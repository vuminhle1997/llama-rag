// use react-query to get all favourites from the backend and axios, with credentials, and queries size & page as parameters

import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Page } from "../types/page";
import { Favourite } from "../types/favourites";

export const useGetFavourites = (size: number, page: number) => {
  return useQuery({
    queryKey: ["favourites", size, page],
    queryFn: async () => {
      const response = await axios.get<Page<Favourite>>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/favourites`, {
        withCredentials: true,
        params: { size, page }
      });
      return response.data;
    }
  });
};

export const getFavourites = async (size: number, page: number) => {
  const response = await axios.get<Page<Favourite>>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/favourites`, {
    withCredentials: true,
    params: { size, page }
  });
  return response.data;
};

export const useGetFavourite = (id: string) => {
  return useQuery({
    queryKey: ["favourites", id],
    queryFn: async () => {
      const response = await axios.get<Favourite>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/favourites/${id}`);
      return response.data;
    }
  });
};

export const usePostFavourite = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post<Favourite>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/favourites/${id}`, {
        
      }, { withCredentials: true });
      return response.data;
    }
  });
};

export const useDeleteFavourite = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete<Favourite>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/favourites/${id}`, {
        withCredentials: true
      });
      return response.data;
    }
  });
};