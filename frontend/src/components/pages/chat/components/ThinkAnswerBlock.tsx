'use client';
import { marked } from 'marked';
import { parseAgentResponse } from '@/lib/utils';
import React from 'react';

export interface ThinkAnswerBlockProps {
  response: string;
}

export default function ThinkAnswerBlock(props: ThinkAnswerBlockProps) {
  const { response } = props;
  const parsed = parseAgentResponse(response);

  return (
    <div className="space-y-4 my-4">
      {parsed.map((block, index) => {
        return (
          <div key={index}>
            {block.type === 'Thought' ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-500 dark:text-yellow-100 p-4 rounded">
                <p className="font-semibold mb-1">🧠 Gedanke</p>
                <div className="prose prose-sm sm:prose dark:prose-invert whitespace-pre-line"
                    dangerouslySetInnerHTML={{__html: marked(block.content) }}
                ></div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 p-4 rounded shadow">
                <p className="font-semibold text-green-700 dark:text-green-300 mb-1">✅ Antwort</p>
                <div
                  className="prose prose-sm sm:prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: marked(block.content),
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
