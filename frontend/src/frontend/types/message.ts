export type MessageBlock = {
  block_type: 'text' | 'image' | 'audio' | 'video' | 'file' | 'json';
  text: string;
};

export type Message = {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  additional_kwargs?: Record<string, any>;
  blocks: MessageBlock[];
};
