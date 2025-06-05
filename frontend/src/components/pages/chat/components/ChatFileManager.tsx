'use client';

import { Button } from '@/components/ui/button';
import { DialogHeader } from '@/components/ui/dialog';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import React, { useEffect } from 'react';
import { Chat, File } from '@/frontend/types';
import { UseMutationResult } from '@tanstack/react-query';
import { de } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { selectQueryParams, setQueryParams, useAppDispatch, useAppSelector } from '@/frontend';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const dispatch = useAppDispatch();
  const queryParams = useAppSelector(selectQueryParams)[chat.id] || {};

  useEffect(() => {
    // Load query parameters from localStorage on component mount
    const storedQueries = localStorage.getItem('queries');
    if (storedQueries) {
      const parsedQueries = JSON.parse(storedQueries)[chat.id] || [];
      const queryParamsObject: { [fileId: string]: { queried: boolean; query_type?: string } } = {};

      for (const query of parsedQueries) {
        queryParamsObject[query.id] = {
          queried: query.params.queried || false,
          query_type: query.params.query_type || 'basic',
        };
      }
      dispatch(setQueryParams({
        [chat.id]: queryParamsObject,
      }));
    }
  }, [dispatch]);

  const handleQueryChange = (chat: Chat, file: File, queryParam: { queried: boolean; query_type: string }) => {
    // Update Redux store
    dispatch(setQueryParams({
      [chat.id]: {
        ...queryParams,
        [file.id]: queryParam,
      },
    }));

    // Update localStorage
    const storedQueries = localStorage.getItem('queries');
    const parsedQueries = storedQueries ? JSON.parse(storedQueries) : {};

    // Convert current state to array format for storage
    const queryArray = Object.entries(queryParams).map(([fileId, params]) => ({
      id: fileId,
      params: params
    }));

    // Add or update the current file's query params
    const fileIndex = queryArray.findIndex(q => q.id === file.id);
    if (fileIndex !== -1) {
      queryArray[fileIndex] = { id: file.id, params: queryParam };
    } else {
      queryArray.push({ id: file.id, params: queryParam });
    }

    // Update localStorage with the new state
    parsedQueries[chat.id] = queryArray;
    localStorage.setItem('queries', JSON.stringify(parsedQueries));
  }

  return (
    <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
      <DialogContent className="sm:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Dokumente verwalten</DialogTitle>
          <span>PDFs, Excel, CSVs und SQL-Dateien</span>

        </DialogHeader>
        <Tabs defaultValue="Übersicht">
          <TabsList>
            <TabsTrigger value="Übersicht">Übersicht</TabsTrigger>
            <TabsTrigger value="Abfragen">Abfragen</TabsTrigger>
          </TabsList>
          <TabsContent value="Übersicht"><Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dateiname</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Datenbankname</TableHead>
                <TableHead>Tabellen</TableHead>
                <TableHead>Datenbanktyp</TableHead>
                <TableHead>Hochgeladen am</TableHead>
                <TableHead>Indexiert</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chat.files?.map((file: File) => (
                <TableRow key={file.id}>
                  <TableCell>{file.file_name}</TableCell>
                  <TableCell>{file.mime_type}</TableCell>
                  <TableCell>{file.database_name || '-'}</TableCell>
                  <TableCell>
                    {file.tables ? file.tables.join(', ') : '-'}
                  </TableCell>
                  <TableCell>{file.database_type || '-'}</TableCell>
                  <TableCell>
                    {format(new Date(file.created_at), 'PPpp', { locale: de })}
                  </TableCell>
                  <TableCell>
                    {
                      file.indexed && 'Ja'
                    }
                    {
                      file.indexed === false && 'Nein'
                    }
                    {
                      file.indexed === null && '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      disabled={deleteFileMutation.isPending || file.indexed === false}
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
          </TabsContent>
          <TabsContent value="Abfragen"><Table>
            <TableHeader>
              <TableRow>
                <TableHead>Abfragen?</TableHead>
                <TableHead>Dateiname</TableHead>
                <TableHead>Daten-Typ</TableHead>
                <TableHead>Abfrage-Typ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chat.files?.map((file: File) => (
                <TableRow key={file.id}>
                  <TableCell className='w-4'>
                    <Checkbox
                      checked={queryParams[file.id]?.queried || false}
                      onCheckedChange={(checked) => {
                        const queryParam = {
                          queried: checked as boolean,
                          query_type: queryParams[file.id]?.query_type || 'basic',
                        };
                        handleQueryChange(chat, file, queryParam);
                      }}
                    />
                  </TableCell>
                  <TableCell>{file.file_name}</TableCell>
                  <TableCell>{file.mime_type}</TableCell>
                  <TableCell>
                    <Select
                      value={queryParams[file.id]?.query_type || 'basic'}
                      defaultValue="basic"
                      disabled={!queryParams[file.id]?.queried}
                      onValueChange={(value) => {
                        const queryParam = {
                          queried: true, // Ensure the file is marked as queried when type is selected
                          query_type: value,
                        };
                        handleQueryChange(chat, file, queryParam);
                      }
                      }>
                      <SelectTrigger className=''>
                        <SelectValue placeholder="Tool-Abfrage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Klassiche Abfrage</SelectItem>
                        {
                          (
                            file.mime_type === 'application/pdf' ||
                            file.mime_type === 'text/plain' ||
                            file.mime_type === 'text/markdown' ||
                            file.mime_type === 'text/x-markdown'
                          ) && (
                            <SelectItem value="text-extraction">Textextraktion</SelectItem>
                          )
                        }
                        {
                          file.mime_type === 'application/sql' && (
                            <SelectItem value="sql">SQL-Abfrage</SelectItem>
                          )
                        }
                        {
                          file.mime_type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mime_type === 'text/csv' && (
                            <SelectItem value="spreadsheet">Spreadsheet-Abfrage</SelectItem>
                          )
                        }
                      </SelectContent>
                    </Select>
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
          </TabsContent>
        </Tabs>

      </DialogContent>
    </Dialog>
  );
}
