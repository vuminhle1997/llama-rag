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
import { ScrollArea } from '../ui/scroll-area';
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
 * ChatEntryForm component allows users to create or update chat entries with customizable settings.
 * It provides a form interface for managing chat details, including title, description, context, 
 * temperature, model, and avatar. The component also supports using predefined templates or 
 * existing chats as a base for new entries.
 *
 * @param {ChatEntryFormProps} props - The properties for the ChatEntryForm component.
 * @param {Chat | undefined} props.chat - The chat object to edit, or undefined for creating a new chat.
 * @param {() => void} props.onSuccess - Callback function to execute upon successful form submission.
 * @param {'create' | 'update'} [props.mode] - The mode of the form, either 'create' or 'update'. Defaults to 'create' if no chat is provided.
 *
 * @returns {JSX.Element} The rendered ChatEntryForm component.
 *
 * @remarks
 * - The form uses `react-hook-form` for managing form state and validation.
 * - Avatar handling includes preview generation and file input management.
 * - Templates can be used to pre-fill form fields with data from predefined or existing chats.
 * - The component integrates with backend APIs for creating or updating chat entries.
 *
 * @example
 * ```tsx
 * <ChatEntryForm
 *   chat={existingChat}
 *   onSuccess={() => console.log('Chat saved successfully!')}
 * />
 * ```
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
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: chat
      ? {
          title: chat.title,
          description: chat.description || '',
          context: chat.context || '',
          avatar: undefined,
          temperature: chat.temperature || 0.75,
          model: chat.model || 'llama3.1',
        }
      : {
          model: 'llama3.1',
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
    setValue('model', templateChat.model || 'llama3.1');

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
  }

  return (
    <>
      <DialogContent className="sm:max-w-[425px] md:max-w-[1000px] flex h-[80vh]">
        <div className="flex flex-1 gap-4">
          {/* Template List */}
          <div className="w-1/3 border-r flex flex-col pr-4">
            <DialogHeader>
              <DialogTitle>Vorlagen</DialogTitle>
              <DialogDescription>
                Wählen Sie einen vordefinierten Chat oder einen vorhandenen Chat
                als Vorlage.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="items-stretch flex-1 overflow-auto">
              <div className="space-y-2 py-4">
                {/* Default Templates */}
                <TemplatesChatNavigation useAsTemplate={useAsTemplate} />

                {/* User's Favourite Chats */}
                {favouriteChats && favouriteChats.length > 0 && (
                  <FavouritesChatNavigation favouriteChats={favouriteChats} useAsTemplate={useAsTemplate} />
                )}

                {/* User's Existing Chats */}
                {existingChats && existingChats.length > 0 && (
                  <UsersChatNavigation 
                    existingChats={existingChats}
                    useAsTemplate={useAsTemplate}
                  />
                )}
              </div>
            </ScrollArea>
          </div>

  
          {/* Form */}
          <ChatSettingsForm {...chatSettingsFormProps} />
        </div>
      </DialogContent>
      {showSuccess && (
        <ChatAlertSuccess mode={mode} />
      )}
      {showError && <ChatAlertError mode={mode} />}
    </>
  );
}
