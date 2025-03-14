import { Chat } from './';

export type Favourite = {
  id: string;
  chat_id: string;
  user_id: string;
  created_at: string;
  chat: Chat;
};
