'use client';

import { Button } from '@/components/ui/button';
import { DialogHeader } from '@/components/ui/dialog';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Chat, Favourite } from '@/frontend/types';
import { UseMutationResult } from '@tanstack/react-query';
import { Settings, HeartIcon, PencilIcon, TrashIcon } from 'lucide-react';
import React from 'react'

export interface ChatSettingsDialogProps {
    isSettingsDialogOpen: boolean;
    setIsSettingsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    chat: Chat;
    slug: string;
    setFavouriteAlert: React.Dispatch<React.SetStateAction<{
        show: boolean;
        success: boolean;
    }>>
    postFavourite:  UseMutationResult<Favourite, Error, string, unknown>
    deleteFavourite: UseMutationResult<Favourite, Error, string, unknown>;
    setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>;
    setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleDelete: () => void;
}

export default function ChatSettingsDialog({
    isSettingsDialogOpen,
    setIsSettingsDialogOpen,
    chat,
    slug,
    setFavouriteAlert,
    postFavourite,
    deleteFavourite,
    setSelectedChat,
    setIsDialogOpen,
    handleDelete
}: ChatSettingsDialogProps) {
  return (
    <div className="fixed bottom-24 right-4 z-50 mb-5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog
                    open={isSettingsDialogOpen}
                    onOpenChange={setIsSettingsDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-full bg-primary/10 hover:bg-primary/20"
                      >
                        <Settings className="h-6 w-6 text-primary" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Chat Einstellungen</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 space-y-4">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            if (chat.favourite) {
                              deleteFavourite.mutate(slug, {
                                onSuccess: () => {
                                  setFavouriteAlert({
                                    show: true,
                                    success: true,
                                  });
                                  setTimeout(() => {
                                    window.location.reload();
                                  }, 1500);
                                },
                                onError: (error: any) => {
                                  console.error(
                                    'Failed to remove chat from favourites:',
                                    error
                                  );
                                  setFavouriteAlert({
                                    show: true,
                                    success: false,
                                  });
                                },
                              });
                            } else {
                              postFavourite.mutate(slug, {
                                onSuccess: () => {
                                  setFavouriteAlert({
                                    show: true,
                                    success: true,
                                  });
                                  setTimeout(() => {
                                    window.location.reload();
                                  }, 1500);
                                },
                                onError: (error: any) => {
                                  console.error(
                                    'Failed to favourite chat:',
                                    error
                                  );
                                  setFavouriteAlert({
                                    show: true,
                                    success: false,
                                  });
                                },
                              });
                            }
                          }}
                        >
                          <HeartIcon className="h-4 w-4 mr-2" />
                          {chat.favourite
                            ? 'Aus Favoriten entfernen'
                            : 'Zu Favoriten hinzufügen'}
                        </Button>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                              setSelectedChat(chat);
                              setIsDialogOpen(true);
                            }}
                          >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Chat bearbeiten
                          </Button>
                        </DialogTrigger>
                        <Button
                          variant="destructive"
                          className="w-full justify-start"
                          onClick={handleDelete}
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Chat löschen
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Chat Einstellungen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
  )
}
