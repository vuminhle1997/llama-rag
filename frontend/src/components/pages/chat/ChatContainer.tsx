'use client';

import TypewriterEffect from '@/components/ui/typewriter';
import { Chat } from '@/frontend/types';
import React from 'react';
import { marked } from 'marked';

export interface ChatContainerProps {
  chatContainerRef: React.RefObject<HTMLDivElement|null>;
  chat: Chat;
  messageText: string;
  reset: (message: { message: string }) => void;
  avatar?: string | null;
  profilePicture?: string | null;
  pendingMessage: string | null;
  isTyping: boolean;
  lastMessageIsTyping: boolean;
  handleMessageLoad: () => void;
}

export default function ChatContainer({
  chatContainerRef,
  chat,
  messageText,
  reset,
  avatar,
  profilePicture,
  pendingMessage,
  isTyping,
  handleMessageLoad,
  lastMessageIsTyping,
}: ChatContainerProps) {
  return (
    <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {!chat.messages || chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Willkommen im Chat!
              </h2>
              <p className="text-gray-600">
                Ich bin hier, um Ihnen zu helfen. Stelle mir eine Frage!
              </p>
            </div>
            <div className="space-y-4 w-full max-w-md">
              <div
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  if (messageText === '') {
                    reset({ message: 'Hallo, wie heißt du?' });
                  }
                }}
              >
                <p className="text-gray-700">👋 "Hallo, wie heißt du?"</p>
              </div>
              <div
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  if (messageText === '') {
                    reset({
                      message:
                        'Welche Werkzeuge stehen zur Verfügung, um mein Problem zu lösen?',
                    });
                  }
                }}
              >
                <p className="text-gray-700">
                  🛠️ "Welche Werkzeuge stehen zur Verfügung, um mein Problem zu
                  lösen?"
                </p>
              </div>
              <div
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  if (messageText === '') {
                    reset({
                      message: 'Wie kannst du mir bei meiner Aufgabe helfen?',
                    });
                  }
                }}
              >
                <p className="text-gray-700">
                  💡 "Wie kannst du mir bei meiner Aufgabe helfen?"
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {chat.messages.map((message, index) => {
              const isLastAssistantMessage =
                index === chat.messages.length - 1 &&
                message.role === 'assistant';

              return (
                <div
                  key={index}
                  className={`flex items-start space-x-4 ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.role !== 'user' && (
                    <>
                      {message.role === 'assistant' ? (
                        <img
                          src={avatar ? avatar : ''}
                          alt="AI Avatar"
                          className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white object-cover"
                        />
                      ) : (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                          S
                        </div>
                      )}
                    </>
                  )}
                  <div
                    className={`flex-1 rounded-lg shadow-sm p-4 ${
                      message.role === 'user'
                        ? 'bg-primary'
                        : 'bg-white prose py-0'
                    }`}
                  >
                    {message.blocks.map((block, blockIndex) => (
                      <div
                        key={blockIndex}
                        className={
                          message.role === 'user'
                            ? 'text-white'
                            : 'text-gray-800'
                        }
                      >
                        {isLastAssistantMessage && lastMessageIsTyping ? (
                          <TypewriterEffect
                            text={block.text}
                            onLoad={handleMessageLoad}
                          />
                        ) : (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: marked(block.text),
                            }}
                          ></div>
                        )}
                      </div>
                    ))}
                  </div>
                  {message.role === 'user' && (
                    <img
                      src={profilePicture ? profilePicture : ''}
                      alt="User Profile Picture"
                      className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white object-cover"
                    />
                  )}
                </div>
              );
            })}

            {/* Pending Message */}
            {pendingMessage && (
              <div className="flex items-start space-x-4 justify-end">
                <div className="flex-1 bg-primary rounded-lg shadow-sm p-4">
                  <p className="text-white">{pendingMessage}</p>
                </div>

                <img
                  src={profilePicture ? profilePicture : ''}
                  alt="User Profile Picture"
                  className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white object-cover"
                />
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-4">
                <img
                  src={avatar ? avatar : ''}
                  alt="AI Avatar"
                  className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white object-cover"
                />
                <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '200ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '400ms' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
