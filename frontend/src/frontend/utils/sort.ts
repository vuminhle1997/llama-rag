'use client';

import { Chat } from '../types';
import { format } from 'date-fns';

/**
 * Groups an array of chats by their last interaction date.
 *
 * @param {Chat[]} chats - The array of chat objects to be grouped.
 * @returns {Record<string, Chat[]>} An object where the keys are formatted dates (MM.dd.yyyy) and the values are arrays of chats that were last interacted with on those dates.
 */
export const groupChatsByDate = (chats: Chat[]): Record<string, Chat[]> => {
  return chats.reduce((acc: Record<string, Chat[]>, chat: Chat) => {
    const date = format(new Date(chat.last_interacted_at), 'MM.dd.yyyy');
    if (!acc[date]) acc[date] = [];
    acc[date].push(chat);
    return acc;
  }, {});
};
