import { Chat } from "../types";
import { format } from "date-fns";

export const groupChatsByDate = (chats: Chat[]): Record<string, Chat[]> => {
    return chats.reduce((acc: Record<string, Chat[]>, chat: Chat) => {
      const date = format(new Date(chat.last_interacted_at), 'MM.dd.yyyy');
      if (!acc[date]) acc[date] = [];
      acc[date].push(chat);
      return acc;
    }, {});
  };