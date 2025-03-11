import { File } from "./files";
import { Message } from "./message";

export type LLMResponse = {
  response: string;
  sources: any[];
  source_nodes: any[];
  is_dummy_stream: boolean;
  metadata: any;
};


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
  message?: LLMResponse;
};
