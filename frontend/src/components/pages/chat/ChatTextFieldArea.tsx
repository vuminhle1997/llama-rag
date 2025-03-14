'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Chat } from '@/frontend/types';
import { UseMutationResult } from '@tanstack/react-query';
import { FileText, Loader2, Send, Upload } from 'lucide-react';
import React from 'react';
import {
  UseFormHandleSubmit,
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form';
import { ChatFormData } from '@/frontend/types';

export interface ChatTextFieldAreaProps {
  handleFormSubmit: UseFormHandleSubmit<ChatFormData, undefined>;
  handleSubmit: (data: ChatFormData) => Promise<void>;
  errors: FieldErrors<ChatFormData>;
  isSubmitting: boolean;
  isTyping: boolean;
  register: UseFormRegister<ChatFormData>;
  setIsFileDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isUploading: boolean;
  uploadFileMutation: UseMutationResult<Chat, Error, FormData, unknown>;
  deleteFileMutation: UseMutationResult<any, Error, string, unknown>;
  messageText: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleUploadClick: () => void;
  handleFileChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
}

export default function ChatTextFieldArea({
  deleteFileMutation,
  errors,
  fileInputRef,
  handleFileChange,
  handleFormSubmit,
  handleSubmit,
  handleUploadClick,
  isSubmitting,
  isTyping,
  isUploading,
  messageText,
  register,
  setIsFileDialogOpen,
  uploadFileMutation,
}: ChatTextFieldAreaProps) {
  return (
    <div className="border-t bg-white p-4">
      <div className="max-w-3xl mx-auto">
        <form
          onSubmit={handleFormSubmit(handleSubmit)}
          className="relative space-y-2"
        >
          <div className="relative">
            <Textarea
              rows={1}
              className={`w-full pr-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary rounded-lg ${
                errors.message ? 'border-red-500' : ''
              }`}
              placeholder="Geben Sie Ihre Nachricht hier ein..."
              disabled={isSubmitting || isTyping}
              {...register('message', {
                required: 'Nachricht ist erforderlich',
                minLength: {
                  value: 5,
                  message: 'Nachricht muss mindestens 5 Zeichen lang sein',
                },
              })}
              onKeyDown={e => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  !isSubmitting &&
                  !isTyping
                ) {
                  e.preventDefault();
                  handleFormSubmit(handleSubmit)();
                }
              }}
            />
            <div className="absolute right-2 bottom-2 flex space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                title="Datei hochladen"
                onClick={handleUploadClick}
                disabled={
                  isUploading ||
                  uploadFileMutation.isPending ||
                  isSubmitting ||
                  isTyping
                }
              >
                {isUploading || uploadFileMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                title="Dateien verwalten"
                onClick={() => setIsFileDialogOpen(true)}
                disabled={
                  isUploading ||
                  deleteFileMutation.isPending ||
                  isSubmitting ||
                  isTyping
                }
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:text-primary/80"
                title="Nachricht senden"
                disabled={!messageText?.trim() || isSubmitting || isTyping}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          {errors.message && (
            <div className="flex items-center space-x-2 text-red-500 text-sm">
              <span className="flex-1">{errors.message.message}</span>
            </div>
          )}
        </form>
        <Input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="*/*"
        />
      </div>
    </div>
  );
}
