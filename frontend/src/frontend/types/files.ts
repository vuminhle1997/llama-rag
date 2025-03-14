import { Chat } from './chats';

export type File = {
  id: string;
  file_name: string;
  mime_type: string;
  path: string;
  created_at: string;
  updated_at: string;
  chat_id: string;
  chat: Chat;
};
