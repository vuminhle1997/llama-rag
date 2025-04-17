'use client';

import { Chat, Favourite } from '@/frontend/types';
import React, { useCallback, useEffect, useState } from 'react';
import { marked } from 'marked';
import { v4 } from 'uuid';
import { Message } from '@/frontend/types';
import { getMessages } from '@/frontend/queries/messages';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery, UseMutationResult } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { Bars3Icon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useIsMobile } from '@/hooks/use-mobile';
import ChatSettingsDialog, {
  ChatSettingsDialogProps,
} from './components/ChatSettingsDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface ChatContainerProps {
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  chat: Chat;
  messageText: string;
  reset: (message: { message: string }) => void;
  profilePicture?: string | null;
  pendingMessage: string | null;
  isSettingsDialogOpen: boolean;
  setIsSettingsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  slug: string;
  setFavouriteAlert: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      success: boolean;
    }>
  >;
  postFavourite: UseMutationResult<Favourite, Error, string, unknown>;
  deleteFavourite: UseMutationResult<Favourite, Error, string, unknown>;
  setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDelete: () => void;

  response: string;
  isStreaming: boolean;
  scrollToBottom: () => void;
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
 *
 * @returns {JSX.Element} The rendered chat container component.
 */
export default function ChatContainer({
  chatContainerRef,
  chat,
  messageText,
  reset,
  profilePicture,
  pendingMessage,
  deleteFavourite,
  handleDelete,
  isSettingsDialogOpen,
  postFavourite,
  setFavouriteAlert,
  setIsDialogOpen,
  setIsSettingsDialogOpen,
  setSelectedChat,
  slug,
  isStreaming,
  response,
  scrollToBottom,
}: ChatContainerProps) {
  const isMobile = useIsMobile();
  const { ref, inView } = useInView();
  const { open, toggleSidebar } = useSidebar();

  const [submittedMessages, setSubmittedMessages] = useState<Message[]>([]);

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

  useEffect(() => {
    if (!isStreaming && response.length > 0) {
      if (pendingMessage) {
        const userMessage: Message = {
          id: v4(),
          role: 'user',
          text: pendingMessage,
          created_at: new Date().toISOString(),
          block_type: 'text',
        };
        const assistantMessage: Message = {
          id: v4(),
          role: 'assistant',
          text: response,
          created_at: new Date().toISOString(),
          block_type: 'text',
        };
        setSubmittedMessages(prev => [assistantMessage, userMessage, ...prev]);
        setTimeout(() => {
          scrollToBottom();
        }, 750);
      }
    }
  }, [isStreaming, response]);

  const handleSideBarToggle = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  const chatSettingsProps: ChatSettingsDialogProps = {
    chat: chat!,
    deleteFavourite,
    handleDelete,
    isSettingsDialogOpen,
    postFavourite,
    setFavouriteAlert,
    setIsDialogOpen,
    setIsSettingsDialogOpen,
    setSelectedChat,
    slug,
  };

  return (
    <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
      <div className="py-2 px-4 bg-background sticky top-0 left-0 w-full z-10 border-b">
        <div className="flex justify-between items-center">
          {(!open || isMobile) && (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  className="bg-primary dark:bg-background hover:bg-background/10 top-4 left-4"
                  onClick={() => handleSideBarToggle()}
                >
                  <Bars3Icon className="h-4 w-4 text-white" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="dark:bg-accent bg-primary border-2 border border-white shadow-sm">
                <p className="text-m">Seitenleiste öffnen</p>
              </TooltipContent>
            </Tooltip>
          )}
          <h1 className="lg:text-2xl text-xl" aria-label={chat.title}>
            {chat.title}
          </h1>
          <ChatSettingsDialog {...chatSettingsProps} />
        </div>
      </div>
      {!chat.messages ||
        (chat.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Willkommen im Chat!
              </h2>
              <p className="text-gray-600">
                Ich bin hier, um Ihnen zu helfen. Stelle mir eine Frage!
              </p>
            </div>
            <div className="space-y-4 w-full max-w-md">
              <div
                className="bg-background rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  if (messageText === '') {
                    reset({ message: 'Hallo, wie heißt du?' });
                  }
                }}
              >
                <p className="text-gray-700 dark:text-white">
                  👋 "Hallo, wie heißt du?"
                </p>
              </div>
              <div
                className="bg-background rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  if (messageText === '') {
                    reset({
                      message:
                        'Welche Werkzeuge stehen zur Verfügung, um mein Problem zu lösen?',
                    });
                  }
                }}
              >
                <p className="text-gray-700 dark:text-white">
                  🛠️ "Welche Werkzeuge stehen zur Verfügung, um mein Problem zu
                  lösen?"
                </p>
              </div>
              <div
                className="bg-background rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  if (messageText === '') {
                    reset({
                      message: 'Wie kannst du mir bei meiner Aufgabe helfen?',
                    });
                  }
                }}
              >
                <p className="text-gray-700 dark:text-white">
                  💡 "Wie kannst du mir bei meiner Aufgabe helfen?"
                </p>
              </div>
            </div>
          </div>
        ))}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 flex flex-col-reverse">
        {isStreaming && response.length < 1 && (
          <div className="flex items-start space-x-4">
            <Image
              src={
                chat.avatar_path
                  ? `${
                      process.env.NEXT_PUBLIC_BACKEND_URL
                    }/uploads/avatars/${chat.avatar_path.split('/').pop()}`
                  : '/ai.jpeg'
              }
              alt="The AI assistant's avatar typing indicator"
              className="flex-shrink-0 w-12 h-12 rounded-full bg-background flex items-center justify-center object-cover"
              width={40}
              height={40}
            />
            <div className="flex-1 bg-background rounded-lg shadow-sm p-4">
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
        {/* Assistant Response */}
        {isStreaming && response.length > 0 && (
          <div className="flex items-start space-x-4">
            <Image
              src={
                chat.avatar_path
                  ? `${
                      process.env.NEXT_PUBLIC_BACKEND_URL
                    }/uploads/avatars/${chat.avatar_path.split('/').pop()}`
                  : '/ai.jpeg'
              }
              alt="The AI assistant's avatar typing indicator"
              className="flex-shrink-0 w-12 h-12 rounded-full bg-background flex items-center justify-center object-cover"
              width={40}
              height={40}
            />
            <div
              className={`flex-1 rounded-lg shadow-sm p-4 bg-background dark:prose-invert dark:[&_strong]:text-white py-0`}
            >
              {
                <div key={v4()} className={'text-gray-800 dark:text-white'}>
                  {response && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: marked(response.replaceAll('\n', '<br />')),
                      }}
                    ></div>
                  )}
                </div>
              }
            </div>
          </div>
        )}
        {/* Pending Message */}
        {isStreaming && pendingMessage && (
          <div className="flex items-start space-x-4 justify-end">
            <div className="flex-1 bg-background rounded-lg shadow-sm p-4">
              <p>{pendingMessage}</p>
            </div>

            <img
              src={profilePicture ? profilePicture : ''}
              alt="User Profile Picture"
              className="flex-shrink-0 w-12 h-12 rounded-full bg-background flex items-center justify-center object-cover"
            />
          </div>
        )}

        {/**
         * Consists of messages:
         * - user submitted messages
         * - assistant responses after submissions
         */}
        {submittedMessages.map((message, index) => {
          return (
            <div
              key={index}
              className={`flex items-start gap-4 w-full mb-4 ${
                message.role === 'user' ? 'justify-end' : ''
              }`}
            >
              {message.role !== 'user' && (
                <>
                  {message.role === 'assistant' ? (
                    <Image
                      src={
                        chat.avatar_path
                          ? `${
                              process.env.NEXT_PUBLIC_BACKEND_URL
                            }/uploads/avatars/${chat.avatar_path
                              .split('/')
                              .pop()}`
                          : '/ai.jpeg'
                      }
                      alt="The avatar of the AI assistant chat partner"
                      className="flex-shrink-0 w-12 h-12 rounded-full bg-background flex items-center justify-center object-cover"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background flex items-center justify-center ">
                      S
                    </div>
                  )}
                </>
              )}
              <div
                className={`flex-1 rounded-lg shadow-sm p-4 ${
                  message.role === 'user'
                    ? 'bg-background'
                    : 'bg-background dark:prose-invert dark:[&_strong]:text-white  py-0'
                }`}
              >
                {
                  <div
                    key={v4()}
                    className={
                      message.role === 'user'
                        ? ''
                        : 'text-gray-800 dark:text-white'
                    }
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: marked(message.text.replaceAll('\n', '<br />')),
                      }}
                    ></div>
                  </div>
                }
              </div>
              {message.role === 'user' && (
                <img
                  src={profilePicture ? profilePicture : ''}
                  alt="User Profile Picture"
                  className="flex-shrink-0 w-12 h-12 rounded-full bg-background flex items-center justify-center object-cover"
                />
              )}
            </div>
          );
        })}

        {messagesFetched && messagesFetched.pages[0].items.length > 0 && (
          <>
            {messagesFetched.pages.map(page => {
              return page.items.map((message, index) => {
                const isLastPage = page.items.length === index + 1;
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-4 w-full mb-4 ${
                      message.role === 'user' ? 'justify-end' : ''
                    }`}
                    ref={isLastPage ? ref : null}
                  >
                    {message.role !== 'user' && (
                      <>
                        {message.role === 'assistant' ? (
                          <Image
                            src={
                              chat.avatar_path
                                ? `${
                                    process.env.NEXT_PUBLIC_BACKEND_URL
                                  }/uploads/avatars/${chat.avatar_path
                                    .split('/')
                                    .pop()}`
                                : '/ai.jpeg'
                            }
                            alt="The avatar of the AI assistant chat partner"
                            className="flex-shrink-0 w-12 h-12 rounded-full bg-background flex items-center justify-center object-cover"
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background flex items-center justify-center ">
                            S
                          </div>
                        )}
                      </>
                    )}
                    <div
                      className={`flex-1 rounded-lg shadow-sm p-4 ${
                        message.role === 'user'
                          ? 'bg-background'
                          : 'bg-background prose py-0'
                      }`}
                    >
                      {
                        <div
                          key={v4()}
                          className={
                            message.role === 'user'
                              ? ''
                              : 'text-gray-800 dark:text-white'
                          }
                        >
                          {message.text && (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: marked(
                                  message.text.replaceAll('\n', '<br />')
                                ),
                              }}
                            ></div>
                          )}
                        </div>
                      }
                    </div>
                    {message.role === 'user' && (
                      <img
                        src={profilePicture ? profilePicture : ''}
                        alt="User Profile Picture"
                        className="flex-shrink-0 w-12 h-12 rounded-full bg-background flex items-center justify-center object-cover"
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
