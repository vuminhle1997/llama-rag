'use client';

import axios from 'axios';
import { Message, Page } from '../types';

/**
 * Fetches a paginated list of messages for a specific chat.
 *
 * @param {Object} params - The parameters for fetching messages.
 * @param {number} params.size - The number of messages to fetch per page. Defaults to 10.
 * @param {number} params.page - The page number to fetch.
 * @param {string} params.chatId - The ID of the chat to fetch messages for.
 * @returns {Promise<Page<Message>>} A promise that resolves to a paginated list of messages.
 *
 * @throws {Error} Throws an error if the request fails.
 */
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
