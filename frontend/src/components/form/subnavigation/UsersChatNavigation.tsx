'use client';

import { Separator } from '@/components/ui/separator';
import { Chat } from '@/frontend/types';
import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/solid';
import React from 'react';

export interface UsersChatNavigationProps   {
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
      <Separator className="my-4" />
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground px-2">
          <div className="flex flex-row gap-2">
            <ChatBubbleOvalLeftIcon className="h-5 w-5" />
            <span>Ihre Chats</span>
          </div>
        </h3>
        {existingChats.map(existingChat => (
          <div
            key={existingChat.id}
            className="p-3 border rounded-lg hover:bg-accent cursor-pointer"
            onClick={() => useAsTemplate(existingChat)}
          >
            <h4 className="font-medium">{existingChat.title}</h4>
            {existingChat.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {existingChat.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </React.Fragment>
  );
}
