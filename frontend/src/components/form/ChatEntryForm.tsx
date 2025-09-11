'use client';

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { usePostChat, useUpdateChat } from '@/frontend/queries/chats';
import { useForm } from 'react-hook-form';
import { Chat } from '@/frontend/types';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/frontend/store/hooks/hooks';
import {
  selectChats,
  selectFavouriteChats,
} from '@/frontend/store/reducer/app_reducer';
import { StaticImageData } from 'next/image';
import { useGetAvatar } from '@/frontend/queries/avatar';
import axios from 'axios';
import ChatAlertError from './alerts/ChatAlertError';
import ChatAlertSuccess from './alerts/ChatAlertSuccess';
import FavouritesChatNavigation from './subnavigation/FavouritesChatNavigation';
import TemplatesChatNavigation from './subnavigation/TemplatesChatNavigation';
import UsersChatNavigation from './subnavigation/UsersChatNavigation';
import ChatSettingsForm, { ChatSettingsFormProps } from './ChatSettingsForm';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import {
  ArchiveBoxIcon,
  ChatBubbleOvalLeftIcon,
  HeartIcon,
} from '@heroicons/react/24/solid';

type FormData = {
  title: string;
  description: string;
  context: string;
  avatar?: FileList;
  temperature: number;
  model: string;
};

interface ChatEntryFormProps {
  chat?: Chat;
  onSuccess?: () => void;
  mode?: 'create' | 'update';
}

/**
 * A React component for creating or updating chat entries. This component provides
 * a form interface for managing chat details, including title, description, context,
 * avatar, temperature, and model. It also allows users to use predefined templates
 * or existing chats as a base for creating new chats.
 *
 * @component
 * @param {ChatEntryFormProps} props - The properties for the ChatEntryForm component.
 * @param {Chat | undefined} props.chat - The chat object to edit. If undefined, the form
 * initializes in "create" mode.
 * @param {() => void} [props.onSuccess] - A callback function to execute after a successful
 * form submission.
 * @param {'create' | 'update'} [props.mode] - The mode of the form, either "create" or "update".
 * Defaults to "create" if no chat is provided.
 *
 * @returns {JSX.Element} The rendered ChatEntryForm component.
 *
 * @remarks
 * - The form uses `react-hook-form` for managing form state and validation.
 * - Supports avatar uploads and previews.
 * - Allows users to select predefined templates or existing chats as a base for new chats.
 * - Displays success and error alerts based on the outcome of form submission.
 *
 * @example
 * ```tsx
 * <ChatEntryForm
 *   chat={existingChat}
 *   onSuccess={() => console.log('Chat saved successfully!')}
 * />
 * ```
 *
 * @dependencies
 * - `useForm` from `react-hook-form` for form handling.
 * - `usePostChat` and `useUpdateChat` for API interactions.
 * - `useAppSelector` for accessing Redux state.
 * - `useRouter` from `next/router` for navigation.
 * - `axios` for fetching avatar data.
 *
 * @internal
 * This component is designed to be used within the chat management system and
 * assumes the presence of specific Redux selectors and API hooks.
 */
export default function ChatEntryForm({
  chat,
  onSuccess,
  mode = chat ? 'update' : 'create',
}: ChatEntryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: chat
      ? {
          title: chat.title,
          description: chat.description,
          context: chat.context,
          avatar: undefined,
          temperature: chat.temperature,
          model: chat.model || 'llama3.3:70b',
        }
      : {
          model: 'llama3.3:70b',
        },
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: createChat, isPending: isCreating } = usePostChat();
  const { mutateAsync: updateChat, isPending: isUpdating } = useUpdateChat(
    chat?.id || ''
  );
  const router = useRouter();
  const existingChats = useAppSelector(selectChats);
  const favouriteChats = useAppSelector(selectFavouriteChats);
  const { avatar } = useGetAvatar(chat?.id || '');

  const useAsTemplate = async (
    templateChat:
      | Chat
      | {
          id?: string;
          temperature?: number;
          title: string;
          description: string;
          context: string;
          avatar_path?: StaticImageData;
          model?: string;
        }
  ) => {
    setValue('title', `Kopie von: ${templateChat.title}`);
    setValue('description', templateChat.description || '');
    setValue('context', templateChat.context || '');
    setValue('temperature', templateChat.temperature || 0.75);
    setValue('model', templateChat.model || 'llama3.3:70b');

    // Handle avatar based on template type
    if ('id' in templateChat) {
      // Handle existing chat avatar by fetching directly
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/avatar/${templateChat.id}`,
          {
            withCredentials: true,
            responseType: 'blob',
          }
        );
        const blob = response.data;
        const file = new File([blob], 'avatar.jpg', { type: blob.type });

        // Create a DataTransfer object to get a FileList
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        setValue('avatar', dataTransfer.files);
        setAvatarPreview(URL.createObjectURL(blob));
      } catch (error) {
        console.error('Error loading existing chat avatar:', error);
      }
    } else if ('avatar_path' in templateChat && templateChat.avatar_path) {
      // Handle default template with static avatar
      try {
        const response = await fetch(templateChat.avatar_path.src);
        const blob = await response.blob();
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

        // Create a DataTransfer object to get a FileList
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        setValue('avatar', dataTransfer.files);
        setAvatarPreview(URL.createObjectURL(blob));
      } catch (error) {
        console.error('Error loading template avatar:', error);
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Watch for avatar changes to update preview
  const avatarFile = watch('avatar');
  useEffect(() => {
    if (avatarFile?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(avatarFile[0]);
    }
  }, [avatarFile]);

  // Load existing avatar when editing
  useEffect(() => {
    if (mode === 'update' && chat?.id && avatar) {
      setAvatarPreview(avatar);
    }
  }, [mode, chat?.id, avatar]);

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();

    formData.append(
      'chat',
      JSON.stringify({
        title: data.title,
        description: data.description || '',
        context: data.context,
        temperature: data.temperature,
        model: data.model,
      })
    );

    if (data.avatar?.[0]) {
      formData.append('file', data.avatar[0]);
    }

    try {
      let response;
      if (mode === 'create') {
        response = await createChat(formData);
      } else {
        response = await updateChat(formData);
      }

      setShowSuccess(true);
      setShowError(false);
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          router.push(`/chat/${response.id}`);
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      setShowError(true);
      setShowSuccess(false);
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    }
  };

  const chatSettingsFormProps: ChatSettingsFormProps = {
    chat,
    setValue,
    register,
    watch,
    errors,
    handleSubmit,
    onSubmit,
    mode,
    avatarPreview,
    setAvatarPreview,
    fileInputRef,
    handleAvatarClick,
    isCreating,
    isUpdating,
    getValues,
  };

  return (
    <>
      <DialogContent className="sm:max-w-[425px] md:max-w-[1000px] flex h-[95vh] lg:h-[80vh]">
        <div className="md:flex md:flex-1 md:flex-row gap-4 overflow-y-auto">
          {/* Template List */}
          <div className="md:w-1/3 lg:border-r block lg:flex flex-col pr-4">
            <DialogHeader>
              <DialogTitle>Vorlagen</DialogTitle>
              <DialogDescription>
                Wählen Sie einen vordefinierten Chat oder einen vorhandenen Chat
                als Vorlage.
              </DialogDescription>
            </DialogHeader>
            <div className="items-stretch flex-1 overflow-y-auto">
              <div className="space-y-2 py-4">
                <Accordion
                  type="single"
                  collapsible
                  defaultValue={mode === 'create' ? 'templates' : ''}
                >
                  {/* Default Templates */}
                  <AccordionItem value="templates">
                    <AccordionTrigger className="text-sm font-medium text-muted-foreground px-2">
                      <div className="flex flex-row gap-2">
                        <ArchiveBoxIcon className="h-5 w-5" />
                        <span>Standardvorlagen</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <TemplatesChatNavigation useAsTemplate={useAsTemplate} />
                    </AccordionContent>
                  </AccordionItem>

                  {/* User's Favourite Chats */}
                  <AccordionItem value="favourites">
                    <AccordionTrigger className="text-sm font-medium text-muted-foreground px-2">
                      <div className="flex flex-row gap-2">
                        <HeartIcon className="text-sm h-5 w-5" />
                        <span>Ihre favorisierten Chats </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {favouriteChats && favouriteChats.length > 0 && (
                        <FavouritesChatNavigation
                          favouriteChats={favouriteChats}
                          useAsTemplate={useAsTemplate}
                        />
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* User's Existing Chats */}
                  <AccordionItem value="users">
                    <AccordionTrigger className="text-sm font-medium text-muted-foreground px-2">
                      <div className="flex flex-row gap-2">
                        <ChatBubbleOvalLeftIcon className="h-5 w-5" />
                        <span>Ihre Chats</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {existingChats && existingChats.length > 0 && (
                        <UsersChatNavigation
                          existingChats={existingChats}
                          useAsTemplate={useAsTemplate}
                        />
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
          {/* Form */}
          <ChatSettingsForm {...chatSettingsFormProps} />
        </div>
      </DialogContent>
      {showSuccess && <ChatAlertSuccess mode={mode} />}
      {showError && <ChatAlertError mode={mode} />}
    </>
  );
}
