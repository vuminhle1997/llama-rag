'use client';
import { marked } from 'marked';
import { parseAgentResponse } from '@/lib/utils';
import React from 'react';

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

    return (
        <div className="space-y-4 my-4">
            {parsed.map((block, index) => {
                return (
                    <div key={index}>
                        {block.type === 'Thought' ? (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-500 dark:text-yellow-100 p-4 rounded">
                                <p className="font-semibold mb-1">🧠 Gedanke</p>
                                <div className="prose prose-sm sm:prose dark:prose-invert whitespace-pre-line"
                                    dangerouslySetInnerHTML={{ __html: marked(block.content) }}
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
