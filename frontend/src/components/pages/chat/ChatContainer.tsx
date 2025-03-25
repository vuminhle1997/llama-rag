'use client';

import TypewriterEffect from '@/components/ui/typewriter';
import { Chat } from '@/frontend/types';
import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import AIPlaceholder from '@/static/templates/helper.webp';
import { v4 } from 'uuid';
import { Message } from '@/frontend/types';
import { getMessages } from '@/frontend/queries/messages';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/frontend/store/hooks';
import { useDispatch } from 'react-redux';
import {
  selectSubmittedMessages,
  setMessages,
} from '@/frontend/store/reducer/app_reducer';

export interface ChatContainerProps {
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  chat: Chat;
  messageText: string;
  reset: (message: { message: string }) => void;
  avatar?: string | null;
  profilePicture?: string | null;
  pendingMessage: string | null;
  isTyping: boolean;
  lastMessageIsTyping: boolean;
  handleMessageLoad: () => void;
  submittedMessages: Message[];
}

{
  /* Typing Indicator */
}

/**
 * ChatContainer component renders the chat interface.
 *
 * @param {Object} props - The properties object.
 * @param {React.RefObject<HTMLDivElement>} props.chatContainerRef - Reference to the chat container div.
 * @param {Object} props.chat - The chat object containing messages.
 * @param {string} props.messageText - The current message text.
 * @param {Function} props.reset - Function to reset the chat input.
 * @param {string} props.avatar - URL of the assistant's avatar image.
 * @param {string} props.profilePicture - URL of the user's profile picture.
 * @param {string} props.pendingMessage - The pending message text.
 * @param {boolean} props.isTyping - Indicates if the assistant is typing.
 * @param {Function} props.handleMessageLoad - Function to handle message load.
 * @param {boolean} props.lastMessageIsTyping - Indicates if the last message is being typed.
 *
 * @returns {JSX.Element} The rendered chat container component.
 */
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
  submittedMessages,
}: ChatContainerProps) {
  const { ref, inView } = useInView();

  const {
    data: messagesFetched,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['messages', chat.id],
    queryFn: ({ pageParam = 1 }) =>
      getMessages({ size: 10, page: pageParam, chatId: chat.id }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.page >= lastPage.pages) return undefined;
      return lastPage.page + 1;
    },
    initialPageParam: 1,
    enabled: !!chat.id,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (messagesFetched && chatContainerRef.current) {
      // Only scroll to bottom if we're on the first page (most recent messages)
      if (messagesFetched.pages.length === 1) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }
  }, [messagesFetched, chatContainerRef]);

  return (
    <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
      {!chat.messages ||
        (chat.messages.length === 0 && (
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
        ))}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 flex flex-col-reverse">
        {isTyping && (
          <div className="flex items-start space-x-4">
            <img
              src={avatar ? avatar : AIPlaceholder.src}
              alt="The AI assistant's avatar typing indicator"
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
        {/* Pending Message */}
        {pendingMessage && (
          <div className="flex items-start space-x-4 justify-end">
            <div className="flex-1 bg-primary rounded-lg shadow-sm p-4">
              <p className="text-white">{pendingMessage}</p>
            </div>

            <img
              src={profilePicture ? profilePicture : AIPlaceholder.src}
              alt="User Profile Picture"
              className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white object-cover"
            />
          </div>
        )}
        {submittedMessages.map((message, index) => {
          const isLastAssistantMessage =
            index === submittedMessages.length - 1 &&
            message.role === 'assistant';

          return (
            <div
              key={index}
              className={`flex items-start space-x-4 w-full ${
                message.role === 'user' ? 'justify-end' : ''
              }`}
            >
              {message.role !== 'user' && (
                <>
                  {message.role === 'assistant' ? (
                    <img
                      src={avatar ? avatar : AIPlaceholder.src}
                      alt="The avatar of the AI assistant chat partner"
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
                  message.role === 'user' ? 'bg-primary' : 'bg-white prose py-0'
                }`}
              >
                {
                  <div
                    key={v4()}
                    className={
                      message.role === 'user' ? 'text-white' : 'text-gray-800'
                    }
                  >
                    {isLastAssistantMessage && lastMessageIsTyping ? (
                      <TypewriterEffect
                        text={message.text}
                        onLoad={handleMessageLoad}
                      />
                    ) : (
                      message.text && (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: marked(
                              message.text.replaceAll('\n', '<br />')
                            ),
                          }}
                        ></div>
                      )
                    )}
                  </div>
                }
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

        {messagesFetched && messagesFetched.pages[0].items.length > 0 && (
          <>
            {messagesFetched.pages.map(page => {
              return page.items.map((message, index) => {
                const isLastAssistantMessage =
                  index === messagesFetched.pages[0].items.length - 1 &&
                  message.role === 'assistant';

                const isLastPage = page.items.length === index + 1;
                return (
                  <div
                    key={index}
                    className={`flex items-start space-x-4 w-full ${
                      message.role === 'user' ? 'justify-end' : ''
                    }`}
                    ref={isLastPage ? ref : null}
                  >
                    {message.role !== 'user' && (
                      <>
                        {message.role === 'assistant' ? (
                          <img
                            src={avatar ? avatar : AIPlaceholder.src}
                            alt="The avatar of the AI assistant chat partner"
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
                      {
                        <div
                          key={v4()}
                          className={
                            message.role === 'user'
                              ? 'text-white'
                              : 'text-gray-800'
                          }
                        >
                          {isLastAssistantMessage && lastMessageIsTyping ? (
                            <TypewriterEffect
                              text={message.text}
                              onLoad={handleMessageLoad}
                            />
                          ) : (
                            message.text && (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: marked(
                                    message.text.replaceAll('\n', '<br />')
                                  ),
                                }}
                              ></div>
                            )
                          )}
                        </div>
                      }
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
              });
            })}
          </>
        )}
      </div>
    </div>
  );
}
