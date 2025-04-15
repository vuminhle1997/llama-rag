'use client';

import { Chat } from '@/frontend/types';
import Image from 'next/image';
import React from 'react';

export interface UsersChatNavigationProps {
  existingChats: Chat[];
  useAsTemplate: (chat: Chat) => void;
}

/**
 * A React component that renders a navigation menu for user chats.
 *
 * @component
 * @param {UsersChatNavigationProps} props - The props for the component.
 * @param {Array} props.existingChats - An array of existing chat objects to display in the navigation.
 * Each chat object should have an `id`, `title`, and optionally a `description`.
 * @param {Function} props.useAsTemplate - A callback function invoked when a chat is selected.
 * The selected chat object is passed as an argument to this function.
 *
 * @returns {JSX.Element} A JSX element containing the chat navigation menu.
 *
 * @example
 * ```tsx
 * const chats = [
 *   { id: '1', title: 'Chat 1', description: 'Description for Chat 1' },
 *   { id: '2', title: 'Chat 2' },
 * ];
 *
 * function handleChatSelection(chat) {
 *   console.log('Selected chat:', chat);
 * }
 *
 * <UsersChatNavigation
 *   existingChats={chats}
 *   useAsTemplate={handleChatSelection}
 * />
 * ```
 */
export default function UsersChatNavigation({
  existingChats,
  useAsTemplate,
}: UsersChatNavigationProps) {
  return (
    <React.Fragment>
      <div className="space-y-2">
        {existingChats.map(existingChat => (
          <div
            key={existingChat.id}
            className="p-3 border rounded-lg hover:bg-accent cursor-pointer"
            onClick={() => useAsTemplate(existingChat)}
          >
            <div className="grid grid-cols-4">
              <div className="col-span-1 content-center">
                <Image
                  src={`${
                    process.env.NEXT_PUBLIC_BACKEND_URL
                  }/uploads/avatars/${existingChat.avatar_path
                    .split('/')
                    .pop()}`}
                  width={50}
                  height={50}
                  className="rounded-full"
                  alt={`Avatar of ${existingChat.title}`}
                />
              </div>
              <div className="col-span-3">
                <h4 className="font-medium">{existingChat.title}</h4>
                {existingChat.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {existingChat.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
}
