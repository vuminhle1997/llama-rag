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

/**
 * ChatFileManager component is responsible for managing and displaying the list of files
 * associated with a chat. It provides functionalities to delete files and shows a dialog
 * with a table listing the files.
 *
 * @param {Object} props - The properties object.
 * @param {boolean} props.isFileDialogOpen - A boolean indicating whether the file dialog is open.
 * @param {function} props.setIsFileDialogOpen - A function to set the state of the file dialog.
 * @param {Object} props.chat - The chat object containing the files.
 * @param {function} props.handleDeleteFile - A function to handle the deletion of a file.
 * @param {Object} props.deleteFileMutation - An object representing the state of the delete file mutation.
 *
 * @returns {JSX.Element} The ChatFileManager component.
 */
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
