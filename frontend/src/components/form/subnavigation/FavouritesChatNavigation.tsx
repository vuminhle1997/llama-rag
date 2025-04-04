'use client';

import { Separator } from '@/components/ui/separator';
import { Chat } from '@/frontend/types';
import { HeartIcon } from '@heroicons/react/24/solid';
import React from 'react';

export interface FavouritesChatNavigationProps {
  favouriteChats: Chat[];
  useAsTemplate: (chat: Chat) => void;
}

/**
 * A React component that renders a list of favorite chats with the ability to use them as templates.
 *
 * @component
 * @param {FavouritesChatNavigationProps} props - The props for the component.
 * @param {Array<{ id: string; title: string; description?: string }>} props.favouriteChats - 
 * An array of favorite chat objects, each containing an `id`, `title`, and optional `description`.
 * @param {(chat: { id: string; title: string; description?: string }) => void} props.useAsTemplate - 
 * A callback function that is triggered when a favorite chat is clicked, passing the selected chat as an argument.
 *
 * @returns {JSX.Element} A React fragment containing a styled list of favorite chats.
 *
 * @example
 * ```tsx
 * const favouriteChats = [
 *   { id: '1', title: 'Chat 1', description: 'Description for Chat 1' },
 *   { id: '2', title: 'Chat 2' },
 * ];
 *
 * const handleUseAsTemplate = (chat) => {
 *   console.log('Using chat as template:', chat);
 * };
 *
 * <FavouritesChatNavigation
 *   favouriteChats={favouriteChats}
 *   useAsTemplate={handleUseAsTemplate}
 * />
 * ```
 */
export default function FavouritesChatNavigation({
  favouriteChats,
  useAsTemplate,
}: FavouritesChatNavigationProps) {
  return (
    <React.Fragment>
      <Separator className="my-4" />
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground px-2">
          <div className="flex flex-row gap-2">
            <HeartIcon className="text-sm h-5 w-5" />
            <span>Ihre favorisierten Chats </span>
          </div>
        </h3>
        {favouriteChats.map(existingChat => (
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
