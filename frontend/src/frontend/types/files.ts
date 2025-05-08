import { Chat } from './chats';

export type File = {
  id: string;
  file_name: string;
  mime_type: string;
  path: string;
  indexed: boolean | null;
  tables: string[] | null;
  database_type: string | null;
  database_name: string | null;
  created_at: string;
  updated_at: string;
  chat_id: string;
  chat: Chat;
};
