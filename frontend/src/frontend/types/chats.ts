import { File } from "./files";
import { Message } from "./message";

export type LLMResponse = {
  id?: string;
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
  temperature: number;
  model: string;
  created_at: string;
  updated_at: string;
  last_interacted_at: string;
  files: File[];
  user_id: string;
  messages: Message[];
  message?: LLMResponse;
};
