import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseAgentResponse(
  raw: string
): { type: string; content: string }[] {
  const clean = raw.replaceAll('<br>', '\n');

  const blocks: { type: string; content: string }[] = [];
  //@ts-ignore
  const regex =
    /(Thought|Answer|Observation)\s*:?\s*(.*?)(?=\n*(Thought|Answer|Observation)\s*:|\n*$)/gs;

  let match;
  while ((match = regex.exec(clean)) !== null) {
    blocks.push({
      type: match[1].trim(),
      content: match[2].trim(),
    });
  }

  return blocks;
}
