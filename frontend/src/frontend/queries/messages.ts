'use client';

import axios from 'axios';
import { Message, Page } from '../types';

export const getMessages = async ({
  size = 10,
  page,
  chatId,
}: {
  size: number;
  page: number;
  chatId: string;
}) => {
  const response = await axios.get<Page<Message>>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/${chatId}`,
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
