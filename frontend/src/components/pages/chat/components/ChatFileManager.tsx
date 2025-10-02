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
import React, { useCallback, useEffect } from 'react';
import { Chat, File } from '@/frontend/types';
import { UseMutationResult } from '@tanstack/react-query';
import { de } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChatParams,
  FileParams,
  selectQueryParams,
  setQueryParams,
  useAppDispatch,
  useAppSelector,
} from '@/frontend';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export interface ChatFileManagerProps {
  isFileDialogOpen: boolean;
  setIsFileDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chat: Chat;
  handleDeleteFile: (fileId: string) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const rawQueryParams = useAppSelector(selectQueryParams);
  const queryParams: ChatParams = React.useMemo(
    () => rawQueryParams[chat.id] || ({} as ChatParams),
    [rawQueryParams, chat.id]
  );

  // Values are now sourced from the central queryParams store instead of local component state
  // Default to true (enabled) when the value is undefined; keep explicit false
  const useWebSearch =
    queryParams?.use_websearch === undefined ? true : queryParams.use_websearch;
  const useLinkScraping =
    queryParams?.use_link_scraping === undefined
      ? true
      : queryParams.use_link_scraping;

  const persistQueryParams = useCallback(
    (next: Partial<ChatParams>) => {
      const merged: ChatParams = {
        text: next.text ?? queryParams.text ?? '',
        use_websearch:
          typeof next.use_websearch === 'boolean'
            ? next.use_websearch
            : useWebSearch,
        use_link_scraping:
          typeof next.use_link_scraping === 'boolean'
            ? next.use_link_scraping
            : useLinkScraping,
        files: {
          ...(queryParams.files || {}),
          ...(next.files || {}),
        },
      };

      // Update Redux
      dispatch(
        setQueryParams({
          [chat.id]: merged,
        })
      );

      // Update localStorage
      const storedQueries = localStorage.getItem('queries');
      const parsed = storedQueries ? JSON.parse(storedQueries) : {};
      parsed[chat.id] = merged;
      localStorage.setItem('queries', JSON.stringify(parsed));
    },
    [chat.id, dispatch, queryParams, useLinkScraping, useWebSearch]
  );

  const toggleWebSearch = useCallback(() => {
    persistQueryParams({ use_websearch: !useWebSearch });
  }, [persistQueryParams, useWebSearch]);

  const toggleLinkScraping = useCallback(() => {
    persistQueryParams({ use_link_scraping: !useLinkScraping });
  }, [persistQueryParams, useLinkScraping]);

  useEffect(() => {
    // Load query parameters from localStorage on component mount (once per chat)
    const storedQueries = localStorage.getItem('queries');
    const parsed = storedQueries ? JSON.parse(storedQueries) : {};
    const chatParam: ChatParams | undefined = parsed[chat.id];

    if (chatParam) {
      const safeFiles = Object.entries(chatParam.files || {}).reduce(
        (acc, [fileId, fileParam]) => {
          acc[fileId] = {
            queried: fileParam?.queried || false,
            query_type: fileParam?.query_type || 'basic',
          };
          return acc;
        },
        {} as Record<string, FileParams>
      );

      dispatch(
        setQueryParams({
          [chat.id]: {
            text: chatParam.text || '',
            use_websearch:
              chatParam.use_websearch === undefined
                ? true
                : chatParam.use_websearch,
            use_link_scraping:
              chatParam.use_link_scraping === undefined
                ? true
                : chatParam.use_link_scraping,
            files: safeFiles,
          },
        })
      );
    } else {
      // Initialize defaults for this chat if none stored (both toggles true)
      persistQueryParams({
        use_websearch: true,
        use_link_scraping: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.id]);

  const handleQueryChange = (
    chat: Chat,
    file: File,
    queryParam: { queried: boolean; query_type: string }
  ) => {
    const updatedFiles = {
      ...(queryParams.files || {}),
      [file.id]: queryParam,
    };
    persistQueryParams({ files: updatedFiles });
  };

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
          <TabsContent value="Übersicht">
            <Table>
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
                      {format(new Date(file.created_at), 'PPpp', {
                        locale: de,
                      })}
                    </TableCell>
                    <TableCell>
                      {file.indexed && 'Ja'}
                      {file.indexed === false && 'Nein'}
                      {file.indexed === null && '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id)}
                        disabled={
                          deleteFileMutation.isPending || file.indexed === false
                        }
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
          <TabsContent value="Abfragen">
            <div className="flex flex-row gap-4 my-4">
              <div className="flex flex-row gap-4">
                <Switch
                  checked={useWebSearch}
                  onCheckedChange={toggleWebSearch}
                />
                <Label>Suchmaschinentool (DuckDuckGo)</Label>
              </div>
              <div className="flex flex-row gap-4">
                <Switch
                  checked={useLinkScraping}
                  onCheckedChange={toggleLinkScraping}
                />
                <Label>Webseiteninhalt über Link scrapen</Label>
              </div>
            </div>
            <Table>
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
                    <TableCell className="w-4">
                      <Checkbox
                        checked={
                          queryParams['files']
                            ? queryParams.files[file.id]?.queried || false
                            : false
                        }
                        onCheckedChange={checked => {
                          const queryParam = {
                            queried: checked as boolean,
                            query_type: queryParams.files
                              ? queryParams.files[file.id]?.query_type ||
                                'basic'
                              : 'basic',
                          };
                          handleQueryChange(chat, file, queryParam);
                        }}
                      />
                    </TableCell>
                    <TableCell>{file.file_name}</TableCell>
                    <TableCell>{file.mime_type}</TableCell>
                    <TableCell>
                      <Select
                        value={
                          queryParams['files']
                            ? queryParams.files[file.id]?.query_type || 'basic'
                            : 'basic'
                        }
                        defaultValue="basic"
                        disabled={
                          queryParams.files
                            ? !queryParams.files[file.id]?.queried
                            : true
                        }
                        onValueChange={value => {
                          const queryParam = {
                            queried: true, // Ensure the file is marked as queried when type is selected
                            query_type: value,
                          };
                          handleQueryChange(chat, file, queryParam);
                        }}
                      >
                        <SelectTrigger className="">
                          <SelectValue placeholder="Tool-Abfrage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">
                            Klassiche Abfrage
                          </SelectItem>
                          {(file.mime_type === 'application/pdf' ||
                            file.mime_type === 'text/plain' ||
                            file.mime_type === 'text/markdown' ||
                            file.mime_type === 'text/x-markdown') && (
                            <SelectItem value="text-extraction">
                              Textextraktion
                            </SelectItem>
                          )}
                          {file.mime_type === 'application/sql' && (
                            <SelectItem value="sql">SQL-Abfrage</SelectItem>
                          )}
                          {file.mime_type ===
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                            (file.mime_type === 'text/csv' && (
                              <SelectItem value="spreadsheet">
                                Spreadsheet-Abfrage
                              </SelectItem>
                            ))}
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
