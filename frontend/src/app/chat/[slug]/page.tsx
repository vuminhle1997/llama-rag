'use client';

import React, { useRef, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import {
  useGetChat,
  useDeleteFile,
  usePostFile,
  useDeleteChat,
  useChatStream,
} from '@/frontend/queries/chats';
import { Message, Chat } from '@/frontend/types';
import { useRouter } from 'next/navigation';
import {
  setChat,
  selectProfilePicture,
  selectAppState,
  setAppState,
  selectChats,
  setChats,
} from '@/frontend/store/reducer/app_reducer';
import { useAppDispatch, useAppSelector } from '@/frontend/store/hooks/hooks';
import { useForm } from 'react-hook-form';
import {
  usePostFavourite,
  useDeleteFavourite,
} from '@/frontend/queries/favourites';
import ChatEntryForm from '@/components/form/ChatEntryForm';
import ChatLoadingScreen from '@/components/pages/chat/ChatLoadingScreen';
import PendingMessageLoader from '@/components/form/PendingMessageLoader';
import ChatNotFoundScreen, {
  UserChatNotFoundScreen,
} from '@/components/pages/chat/chat_404';
import ChatAlertDialog from '@/components/pages/chat/components/ChatAlertDialog';
import ChatContainer, {
  ChatContainerProps,
} from '@/components/pages/chat/ChatContainer';
import ChatTextFieldArea, {
  ChatTextFieldAreaProps,
} from '@/components/pages/chat/ChatTextFieldArea';
import { ChatFormData } from '@/frontend/types';
import ChatFileManager, {
  ChatFileManagerProps,
} from '@/components/pages/chat/components/ChatFileManager';
import ChatFavouriteAlertDialog, {
  ChatFavouriteAlertDialogProps,
} from '@/components/pages/chat/components/ChatFavouriteAlertDialog';
import ChatDeleteAlertDialog, {
  ChatDeleteAlertDialogProps,
} from '@/components/pages/chat/components/ChatDeleteAlertDialog';
import ChatEditAlertDialog, {
  ChatEditAlertDialogProps,
} from '@/components/pages/chat/components/ChatEditAlertDialog';
import AuthProvider from '@/components/AuthProvider';
import _ from 'lodash';

/**
 * SlugChatPage component renders the chat page for a specific chat identified by the slug.
 *
 * @param {Object} props - The component props.
 * @param {Promise<{ slug: string }>} props.params - The parameters containing the slug.
 *
 * @returns {JSX.Element} The rendered chat page component.
 *
 * @component
 *
 * @example
 * // Usage example:
 * <SlugChatPage params={params} />
 *
 * @remarks
 * This component handles various states and actions related to chat functionality, including:
 * - Fetching and displaying chat messages.
 * - Handling file uploads and deletions.
 * - Managing chat settings and alerts.
 * - Submitting new messages and handling typing indicators.
 *
 * @requires useRouter - Next.js router hook for navigation.
 * @requires useAppDispatch - Redux dispatch hook for dispatching actions.
 * @requires useAppSelector - Redux selector hook for selecting state.
 * @requires useRef - React hook for creating references.
 * @requires useEffect - React hook for side effects.
 * @requires useForm - React Hook Form hook for managing form state.
 * @requires useGetChat - Custom hook for fetching chat data.
 * @requires useGetAvatar - Custom hook for fetching avatar data.
 * @requires useChat - Custom hook for chat-related mutations.
 * @requires useDeleteFile - Custom hook for deleting files.
 * @requires usePostFile - Custom hook for uploading files.
 * @requires useDeleteChat - Custom hook for deleting chat.
 * @requires usePostFavourite - Custom hook for posting favourite.
 * @requires useDeleteFavourite - Custom hook for deleting favourite.
 *
 * @state {Chat | null} selectedChat - The currently selected chat.
 * @state {Message[]} messages - The list of chat messages.
 * @state {boolean} isDialogOpen - State for managing dialog visibility.
 * @state {boolean} isDeleteDialogOpen - State for managing delete dialog visibility.
 * @state {boolean} isCreateChatDialogOpen - State for managing create chat dialog visibility.
 * @state {boolean} isSubmitting - State for managing form submission.
 * @state {boolean} isFileDialogOpen - State for managing file dialog visibility.
 * @state {boolean} isSettingsDialogOpen - State for managing settings dialog visibility.
 * @state {boolean} isTyping - State for managing typing indicator.
 * @state {boolean} isUploading - State for managing file upload status.
 * @state {string | null} pendingMessage - The pending message being typed.
 * @state {Object | null} alert - The alert state for displaying notifications.
 * @state {Object} favouriteAlert - The alert state for displaying favourite notifications.
 *
 * @function handleDeleteFile - Handles file deletion.
 * @function handleUploadClick - Handles file upload click.
 * @function handleFileChange - Handles file input change.
 * @function scrollToBottom - Scrolls the chat container to the bottom.
 * @function handleSubmit - Handles form submission for sending messages.
 * @function handleMessageLoad - Handles message load event.
 * @function handleDelete - Handles delete action.
 * @function confirmDelete - Confirms chat deletion.
 */
export default function SlugChatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const chats = useAppSelector(selectChats);

  const appState = useAppSelector(selectAppState);
  const profilePicture = useAppSelector(selectProfilePicture);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [selectedChat, setSelectedChat] = React.useState<Chat | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isCreateChatDialogOpen, setIsCreateChatDialogOpen] =
    React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = React.useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [pendingMessage, setPendingMessage] = React.useState<string | null>(
    null
  );
  const [alert, setAlert] = React.useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    description: string;
  } | null>(null);

  const [favouriteAlert, setFavouriteAlert] = React.useState<{
    show: boolean;
    success: boolean;
  }>({ show: false, success: false });

  const { data: chat, refetch: refetchChat } = useGetChat(slug);
  const [response, isStreaming, sendMessageStream] = useChatStream(slug);

  const deleteFileMutation = useDeleteFile(slug);
  const uploadFileMutation = usePostFile(slug);
  const deleteChat = useDeleteChat(slug);
  const postFavourite = usePostFavourite();
  const deleteFavourite = useDeleteFavourite();

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ChatFormData>({
    defaultValues: {
      message: '',
    },
  });

  const messageText = watch('message');

  useEffect(() => {
    dispatch(setAppState('loading'));
    // @eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (chat && !isStreaming) {
      window.document.title = `global CT InsightChat - ${chat?.title}`;
      dispatch(setChat(chat));
      dispatch(setAppState('idle'));
    } else if (isStreaming) {
      if (response.length < 1) {
        window.document.title = `🤔 agentic RAG denkt ...`;
      } else {
        window.document.title = `🤖 agentic RAG chattet ...`;
      }
    }
    // @eslint-disable-next-line
  }, [chat, isStreaming, response]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages, pendingMessage, isTyping]);

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFileMutation.mutateAsync(fileId);
      await refetchChat();
      setAlert({
        show: true,
        type: 'success',
        title: 'Erfolgreich gelöscht',
        description: 'Die Datei wurde erfolgreich gelöscht',
      });
      setTimeout(() => setAlert(null), 5000);
    } catch (error) {
      console.error('Error deleting file:', error);
      setAlert({
        show: true,
        type: 'error',
        title: 'Fehler beim Löschen',
        description:
          'Die Datei konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.',
      });
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log(file);

    const allowedTypes = [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/x-sql',
      'application/sql',
    ];

    if (!allowedTypes.includes(file.type)) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Ungültiger Dateityp',
        description:
          'Bitte laden Sie nur PDF, CSV, Excel, SQL- oder TXT-Dateien hoch',
      });
      setTimeout(() => setAlert(null), 5000);
      event.target.value = '';
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.set('file', file);

      await uploadFileMutation.mutateAsync(formData);

      await refetchChat();
      event.target.value = '';
      setAlert({
        show: true,
        type: 'success',
        title: 'Erfolgreich hochgeladen',
        description: 'Die Datei wurde erfolgreich hochgeladen',
      });
      setTimeout(() => setAlert(null), 5000);
    } catch (error) {
      console.error('Error uploading file:', error);
      setAlert({
        show: true,
        type: 'error',
        title: 'Fehler beim Hochladen',
        description:
          'Die Datei konnte nicht hochgeladen werden. Bitte versuchen Sie es erneut.',
      });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  const handleSubmit = async (data: ChatFormData) => {
    try {
      setIsSubmitting(true);
      setPendingMessage(data.message);
      setIsTyping(true);
      scrollToBottom();
      const userMessage: Message = {
        role: 'user',
        text: data.message,
        block_type: 'text',
        created_at: new Date().toDateString(),
      };
      setMessages([...messages, userMessage]);
      await sendMessageStream.mutateAsync(data.message);

      const newMessage: Message = {
        role: 'assistant',
        text: response,
        block_type: 'text',
        created_at: new Date().toDateString(),
      };

      setMessages(prevMessages => [...prevMessages, newMessage]);
      reset(); // Clear the form after sending

      const updatedChats = _.cloneDeep(chats);
      const chatToUpdate = _.find(updatedChats, { id: slug });

      if (chatToUpdate) {
        chatToUpdate.last_interacted_at = new Date().toISOString();
        const sortedChats = _.orderBy(
          updatedChats,
          ['last_interacted_at'],
          ['desc']
        );
        dispatch(setChats(sortedChats));
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteChat.mutate(undefined, {
      onSuccess: () => {
        router.push('/');
        window.location.reload();
      },
      onError: (error: Error) => {
        console.error('Failed to delete chat:', error);
      },
    });
  };

  const chatProps: ChatContainerProps = {
    reset,
    chat: chat!,
    chatContainerRef,
    messageText,
    pendingMessage,
    profilePicture,
    deleteFavourite,
    handleDelete,
    isSettingsDialogOpen,
    postFavourite,
    setFavouriteAlert,
    setIsDialogOpen,
    setIsSettingsDialogOpen,
    setSelectedChat,
    slug,
    response,
    isStreaming: isStreaming,
    scrollToBottom,
  };

  const chatTextFieldAreaProps: ChatTextFieldAreaProps = {
    deleteFileMutation,
    errors,
    register,
    fileInputRef,
    handleFileChange,
    handleUploadClick,
    handleFormSubmit,
    isSubmitting,
    isTyping,
    messageText,
    setIsFileDialogOpen,
    handleSubmit,
    isUploading,
    uploadFileMutation,
  };

  const fileManagerProps: ChatFileManagerProps = {
    chat: chat!,
    setIsFileDialogOpen,
    isFileDialogOpen,
    handleDeleteFile,
    deleteFileMutation,
  };

  const favouriteAlertProps: ChatFavouriteAlertDialogProps = {
    favouriteAlert,
    setFavouriteAlert,
  };

  const chatEditAlertProps: ChatEditAlertDialogProps = {
    isDialogOpen,
    refetchChat,
    selectedChat,
    setIsDialogOpen,
  };

  const chatDeleteDialogProps: ChatDeleteAlertDialogProps = {
    confirmDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
  };

  return (
    <AuthProvider
      fallback={<ChatLoadingScreen />}
      errorFallback={<ChatNotFoundScreen />}
    >
      {appState === 'idle' && (
        <main className="flex flex-col h-screen w-screen bg-gray-50 dark:bg-accent">
          {alert && <ChatAlertDialog {...alert} />}

          {(isUploading || deleteFileMutation.isPending) && (
            <PendingMessageLoader
              message={
                isUploading
                  ? 'Datei wird hochgeladen...'
                  : 'Datei wird gelöscht...'
              }
            />
          )}
          {!chat ? (
            <UserChatNotFoundScreen />
          ) : (
            <>
              {/* Chat Messages Container */}
              <ChatContainer {...chatProps} />

              {/* Input Area */}
              <ChatTextFieldArea {...chatTextFieldAreaProps} />

              {/* File Management Dialog */}
              <ChatFileManager {...fileManagerProps} />

              {/* Favourite Alert Dialog */}
              <ChatFavouriteAlertDialog {...favouriteAlertProps} />

              {/* Edit Chat Dialog */}
              <ChatEditAlertDialog {...chatEditAlertProps} />

              {/* Delete Confirmation Dialog */}
              <ChatDeleteAlertDialog {...chatDeleteDialogProps} />

              {/* Create Chat Dialog */}
              <Dialog
                open={isCreateChatDialogOpen}
                onOpenChange={setIsCreateChatDialogOpen}
              >
                <ChatEntryForm
                  mode="create"
                  onSuccess={() => {
                    setIsCreateChatDialogOpen(false);
                    router.push('/');
                  }}
                />
              </Dialog>
            </>
          )}
        </main>
      )}
    </AuthProvider>
  );
}
