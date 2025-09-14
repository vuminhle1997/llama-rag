'use client';
import { marked } from 'marked';
import { parseAgentResponse } from '@/lib/utils';
import React from 'react';
import { Label } from '@/components/ui/label';
import classnames from 'classnames';

export interface ThinkAnswerBlockProps {
  response: string;
}

/**
 * Renders a block displaying the agent's thought process and final answer.
 *
 * This component takes a response string, parses it into separate blocks (e.g., "Thought" and "Answer"),
 * and displays each block with distinct styling. "Thought" blocks are highlighted with a yellow background,
 * while "Answer" blocks use a white or dark background. Markdown content is rendered as HTML.
 *
 * @param props - The properties for the ThinkAnswerBlock component.
 * @param props.response - The agent's response string to be parsed and displayed.
 * @returns A React element displaying the parsed thought and answer blocks.
 */
export default function ThinkAnswerBlock(props: ThinkAnswerBlockProps) {
  const { response } = props;
  const parsed = parseAgentResponse(response);

  const [showTrajectories, setShowTrajectories] = React.useState(true);

  const handleToggle = () => {
    setShowTrajectories(!showTrajectories);
  };

  return (
    <div className="space-y-4 my-4">
      <div
        className="my-4 cursor-pointer flex flex-row justify-between items-center"
        onClick={handleToggle}
      >
        <Label>Gedankenprozess</Label>
        <div>
          {' '}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`ml-2 transition-transform duration-200 ${
              showTrajectories ? 'rotate-180' : ''
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
      {parsed.map((block, index) => {
        return (
          <div key={index}>
            {/* Animated Thought block */}
            <div
              className={`transition-all duration-500 ease-in-out transform ${
                showTrajectories && block.type === 'Thought'
                  ? 'opacity-100 translate-y-0 max-h-[500px] my-2'
                  : 'opacity-0 -translate-y-4 max-h-0 overflow-hidden my-0 pointer-events-none'
              }`}
            >
              {block.type === 'Thought' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-500 dark:text-yellow-100 p-4 rounded">
                  <p className="font-semibold mb-1">🧠 Gedanke</p>
                  <div
                    className="prose prose-sm sm:prose dark:prose-invert whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                      __html: marked(block.content),
                    }}
                  ></div>
                </div>
              )}
            </div>
            {/* Animated Observation block */}
            <div
              className={`transition-all duration-500 ease-in-out transform ${
                showTrajectories && block.type === 'Observation'
                  ? 'opacity-100 translate-y-0 max-h-[500px] my-2'
                  : 'opacity-0 -translate-y-4 max-h-0 overflow-hidden my-0 pointer-events-none'
              }`}
            >
              {block.type === 'Observation' && (
                <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 dark:bg-blue-900 dark:border-blue-500 dark:text-blue-100 p-4 rounded">
                  <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                    🔎 Beobachtung
                  </p>
                  <div
                    className="prose prose-sm sm:prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: marked(block.content),
                    }}
                  />
                </div>
              )}
            </div>
            {/* Answer block always visible */}
            {block.type === 'Answer' && (
              <div
                className={classnames(
                  'bg-white border border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 p-4 rounded shadow',
                  {
                    'translate-y-[-1.5rem]': !showTrajectories,
                  }
                )}
              >
                <p className="font-semibold text-green-700 dark:text-green-300 mb-1">
                  ✅ Antwort
                </p>
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
