'use client';

import { v4 as uuid, v4 } from 'uuid';
import { SidebarMenu } from '../ui/sidebar';
import { Chat } from '@/frontend/types';
import { useState } from 'react';
import { useDeleteChat } from '@/frontend/queries/chats';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/frontend/store/hooks/hooks';
import { selectChats } from '@/frontend/store/reducer/app_reducer';
import { groupChatsByDate } from '@/frontend/utils';
import DeleteChatDialog from './chat/DeleteChatDialog';
import ChatsCollectionElement from './chat/ChatsCollectionElement';

/**
 * ChatsNavigation component handles the display and management of chat navigation.
 * It allows users to view, sort, and delete chats.
 *
 * @component
 * @returns {JSX.Element} The rendered ChatsNavigation component.
 *
 * @remarks
 * - Uses `useRouter` to navigate between routes.
 * - Uses `usePathname` to get the current URL path.
 * - Uses `useAppSelector` to select chats from the Redux store.
 * - Uses `useState` to manage the state of the chat to be deleted and the delete dialog.
 * - Uses `useDeleteChat` to handle chat deletion.
 *
 * @example
 * ```tsx
 * <ChatsNavigation />
 * ```
 */
export default function ChatsNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const currentChatId = pathname.split('/').pop(); // Get the last segment of the URL which is the chat ID
  const chats = useAppSelector(selectChats);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteChat = useDeleteChat(chatToDelete || '');

  /**
   * Handles the deletion of a chat by setting the chat ID to be deleted
   * and opening the delete confirmation dialog.
   *
   * @param chatId - The ID of the chat to be deleted.
   */
  const handleDelete = (chatId: string) => {
    setChatToDelete(chatId);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Confirms the deletion of a chat and performs the delete operation.
   * On successful deletion, it navigates to the home page and reloads the window.
   * If an error occurs during deletion, it logs the error to the console.
   */
  const confirmDelete = () => {
    deleteChat.mutate(undefined, {
      onSuccess: () => {
        router.push('/');
        window.location.reload();
      },
      onError: error => {
        console.error('Failed to delete chat:', error);
      },
    });
  };

  /**
   * Sorts the chats array based on the last interaction date in descending order.
   * If the chats array is not provided, returns an empty array.
   *
   * @param {Array} chats - The array of chat objects to be sorted.
   * @returns {Array} - The sorted array of chat objects.
   */
  const sortedChats = chats
    ? [...chats].sort(
        (a, b) =>
          new Date(b.last_interacted_at).getTime() -
          new Date(a.last_interacted_at).getTime()
      )
    : [];

  const groupedChats = groupChatsByDate(sortedChats as Chat[]);

  return (
    <SidebarMenu>
      {Object.entries(groupedChats).map(([date, chats]) => (
        <ChatsCollectionElement
          key={v4()}
          date={date}
          chats={chats}
          currentChatId={currentChatId}
          handleDelete={handleDelete}
        />
      ))}
      <DeleteChatDialog
        confirmDelete={confirmDelete}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
      />
    </SidebarMenu>
  );
}
