import { File } from "./files";
import { Message } from "./message";
export type Chat = {
  id: string;
  title: string;
  description: string;
  context: string;
  createdAt: string;
  updatedAt: string;
  files: File[];
  user_id: string;
  messages: Message[];
};
