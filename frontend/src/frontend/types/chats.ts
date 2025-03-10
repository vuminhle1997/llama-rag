import { File } from "./files";

export type Chat = {
  id: string;
  title: string;
  description: string;
  context: string;
  createdAt: string;
  updatedAt: string;
  files: File[];
  user_id: string;
};
