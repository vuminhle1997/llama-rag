'use client';

import { Button } from '@/components/ui/button';
import { DialogHeader } from '@/components/ui/dialog';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Table, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import React from 'react';
import { Chat, File } from '@/frontend/types';
import { UseMutationResult } from '@tanstack/react-query';

export interface ChatFileManagerProps {
  isFileDialogOpen: boolean;
  setIsFileDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chat: Chat;
  handleDeleteFile: (fileId: string) => Promise<void>;
  deleteFileMutation: UseMutationResult<any, Error, string, unknown>;
}

export default function ChatFileManager({
  isFileDialogOpen,
  setIsFileDialogOpen,
  chat,
  handleDeleteFile,
  deleteFileMutation,
}: ChatFileManagerProps) {
  return (
    <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Dateien verwalten</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dateiname</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Hochgeladen am</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chat.files?.map((file: File) => (
              <TableRow key={file.id}>
                <TableCell>{file.file_name}</TableCell>
                <TableCell>{file.mime_type}</TableCell>
                <TableCell>
                  {format(new Date(file.created_at), 'PPpp')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteFile(file.id)}
                    disabled={deleteFileMutation.isPending}
                    className="h-8"
                  >
                    {deleteFileMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      'Löschen'
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!chat.files || chat.files.length === 0) && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  Noch keine Dateien hochgeladen
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
