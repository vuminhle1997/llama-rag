'use client';

import ChatEntryForm from '@/components/form/ChatEntryForm';
import { DialogHeader } from '@/components/ui/dialog';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import React from 'react';
import { Chat } from '@/frontend/types';

export interface ChatEditAlertDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedChat: Chat | null;
  refetchChat: () => void;
}

export default function ChatEditAlertDialog({
  isDialogOpen,
  refetchChat,
  selectedChat,
  setIsDialogOpen,
}: ChatEditAlertDialogProps) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Chat bearbeiten</DialogTitle>
        </DialogHeader>
        <ChatEntryForm
          chat={selectedChat || undefined}
          mode="update"
          onSuccess={() => {
            setIsDialogOpen(false);
            refetchChat();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
