'use client';

import { marked } from 'marked';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import React, { useRef, useEffect, useState } from 'react';
import { Upload, Send, FileText, Loader2, Check, AlertCircle, Settings, HeartIcon, PencilIcon, TrashIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  useGetChat,
  useDeleteFile,
  usePostFile,
  useChat,
  getChats,
  useDeleteChat,
} from '@/frontend/queries/chats';
import { format } from 'date-fns';
import { File, Message, Chat } from '@/frontend/types';
import { useAuth } from '@/frontend/queries';
import { useRouter } from 'next/navigation';
import {
  setChat,
  selectProfilePicture,
} from '@/frontend/store/reducer/app_reducer';
import { useAppDispatch, useAppSelector } from '@/frontend/store/hooks/hooks';
import { useForm } from 'react-hook-form';
import { useGetAvatar } from '@/frontend/queries/avatar';
import { setChats } from '@/frontend/store/reducer/app_reducer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePostFavourite, useDeleteFavourite } from '@/frontend/queries/favourites';
import ChatEntryForm from '@/components/form/ChatEntryForm';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DialogTrigger } from '@/components/ui/dialog';

interface ChatFormData {
  message: string;
}

// Add TypewriterEffect component before the LoadingOverlay component
const TypewriterEffect = ({ text, onLoad: onLoadEnd }: { text: string, onLoad: () => void }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 10); // Adjust speed here (lower number = faster)

      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length) {
      onLoadEnd();
    }
  }, [currentIndex, text, onLoadEnd]);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: marked(displayText + (currentIndex < text.length ? '▋' : '')),
      }}
    ></div>
  );
};

// Add LoadingOverlay component at the top level
const LoadingOverlay = ({ message }: { message: string }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded-lg flex items-center space-x-3">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-gray-800">{message}</span>
    </div>
  </div>
);

export default function SlugChatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error } = useAuth();
  const { slug } = React.use(params);
  const [isFileDialogOpen, setIsFileDialogOpen] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);
  const [pendingMessage, setPendingMessage] = React.useState<string | null>(null);
  const [alert, setAlert] = React.useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    description: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { data: chat, refetch: refetchChat } = useGetChat(slug);
  const deleteFileMutation = useDeleteFile(slug);
  const uploadFileMutation = usePostFile(slug);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [lastMessageIsTyping, setLastMessageIsTyping] = React.useState(false);
  const { avatar } = useGetAvatar(slug);
  const profilePicture = useAppSelector(selectProfilePicture);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = React.useState(false);
  const [favouriteAlert, setFavouriteAlert] = React.useState<{
    show: boolean;
    success: boolean;
  }>({ show: false, success: false });
  const deleteChat = useDeleteChat(slug);
  const postFavourite = usePostFavourite();
  const deleteFavourite = useDeleteFavourite();
  const [selectedChat, setSelectedChat] = React.useState<Chat | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isCreateChatDialogOpen, setIsCreateChatDialogOpen] = React.useState(false);

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
  const { searchMutation } = useChat(slug);

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
        description: 'Die Datei konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.',
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

    const allowedTypes = [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Ungültiger Dateityp',
        description: 'Bitte laden Sie nur PDF, CSV, Excel oder TXT-Dateien hoch',
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
        description: 'Die Datei konnte nicht hochgeladen werden. Bitte versuchen Sie es erneut.',
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
        blocks: [{ block_type: 'text', text: data.message }],
      };
      setMessages([...messages, userMessage]);
      const response = await searchMutation.mutateAsync(data.message);
      const newMessage: Message = {
        role: 'assistant',
        blocks: [{ block_type: 'text', text: response.message!.response }],
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setLastMessageIsTyping(true);

      await refetchChat(); // Refresh chat data to show new messages
      reset(); // Clear the form after sending
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
      setIsTyping(false);
      setPendingMessage(null);
      scrollToBottom();
    }
  };

  const handleMessageLoad = () => {
    setLastMessageIsTyping(false);
  };

  useEffect(() => {     
    getChats(50, 1).then((chats) => {
      dispatch(setChats(chats.items));
    });
  }, [handleFormSubmit]);

  useEffect(() => {

    if (chat) {
      window.document.title = `global CT InsightChat - ${chat?.title}`
      dispatch(setChat(chat));
    }
  }, [chat]);

  // Add effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages, pendingMessage, isTyping]);

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteChat.mutate(undefined, {
      onSuccess: () => {
        router.push("/");
        window.location.reload();
      },
      onError: (error: Error) => {
        console.error('Failed to delete chat:', error);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen">
        <div className="w-[20rem] border-r animate-pulse">
          <div className="p-4">
            <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-10 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t">
            <div className="max-w-3xl mx-auto">
              <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-4">Chat nicht gefunden</h1>
        <p className="text-gray-600 mb-8">Der angeforderte Chat konnte nicht gefunden werden.</p>
        <Button
          onClick={() => router.push('/')}
          className="bg-primary text-white"
        >
          Zurück zur Startseite
        </Button>
      </div>
    )
  }

  return (
    <main className="flex flex-col h-screen w-screen bg-gray-50">
      {alert && (
        <div className="fixed top-4 right-4 z-50 w-96">
          <Alert variant={alert.type === 'success' ? 'default' : 'destructive'} className="relative">
            {alert.type === 'success' ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </Alert>
        </div>
      )}

      {(isUploading || deleteFileMutation.isPending) && (
        <LoadingOverlay
          message={
            isUploading ? 'Datei wird hochgeladen...' : 'Datei wird gelöscht...'
          }
        />
      )}
      {!chat ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Chat nicht gefunden
            </h2>
            <p className="text-gray-600">
              Der angeforderte Chat konnte nicht gefunden werden.
            </p>
            <Button
              onClick={() => {
                router.push("/")
              }}
              className="bg-primary text-white"
            >
              Zurück zur Hauptseite
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Chat Messages Container */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {!chat.messages || chat.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-8">
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Willkommen im Chat!
                    </h2>
                    <p className="text-gray-600">
                      Ich bin hier, um Ihnen zu helfen. Stelle mir eine Frage!
                    </p>
                  </div>
                  <div className="space-y-4 w-full max-w-md">
                    <div
                      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        if (messageText === '') {
                          reset({ message: 'Hallo, wie heißt du?' });
                        }
                      }}
                    >
                      <p className="text-gray-700">👋 "Hallo, wie heißt du?"</p>
                    </div>
                    <div
                      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        if (messageText === '') {
                          reset({
                            message:
                              'Welche Werkzeuge stehen zur Verfügung, um mein Problem zu lösen?',
                          });
                        }
                      }}
                    >
                      <p className="text-gray-700">
                        🛠️ "Welche Werkzeuge stehen zur Verfügung, um mein Problem
                        zu lösen?"
                      </p>
                    </div>
                    <div
                      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        if (messageText === '') {
                          reset({
                            message: 'Wie kannst du mir bei meiner Aufgabe helfen?',
                          });
                        }
                      }}
                    >
                      <p className="text-gray-700">
                        💡 "Wie kannst du mir bei meiner Aufgabe helfen?"
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {chat.messages.map((message, index) => {
                    const isLastAssistantMessage = index === chat.messages.length - 1 && message.role === 'assistant';
                    
                    return (
                      <div
                        key={index}
                        className={`flex items-start space-x-4 ${
                          message.role === 'user' ? 'justify-end' : ''
                        }`}
                      >
                        {message.role !== 'user' && (
                          <>
                            {message.role === 'assistant' ? (
                              <img
                                src={avatar ? avatar : ''}
                                alt="AI Avatar"
                                className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white object-cover"
                              />
                            ) : (
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                                S
                              </div>
                            )}
                          </>
                        )}
                        <div
                          className={`flex-1 rounded-lg shadow-sm p-4 ${
                            message.role === 'user' ? 'bg-primary' : 'bg-white prose py-0'
                          }`}
                        >
                          {message.blocks.map((block, blockIndex) => (
                            <div
                              key={blockIndex}
                              className={
                                message.role === 'user'
                                  ? 'text-white'
                                  : 'text-gray-800'
                              }
                            >
                              {isLastAssistantMessage && lastMessageIsTyping ? (
                                <TypewriterEffect text={block.text} onLoad={handleMessageLoad} />
                              ) : (
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: marked(block.text),
                                  }}
                                ></div>
                              )}
                            </div>
                          ))}
                        </div>
                        {message.role === 'user' && (
                          <img
                            src={profilePicture ? profilePicture : ''}
                            alt="User Profile Picture"
                            className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white object-cover"
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* Pending Message */}
                  {pendingMessage && (
                    <div className="flex items-start space-x-4 justify-end">
                      <div className="flex-1 bg-primary rounded-lg shadow-sm p-4">
                        <p className="text-white">{pendingMessage}</p>
                      </div>

                      <img
                        src={profilePicture ? profilePicture : ''}
                        alt="User Profile Picture"
                        className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white object-cover"
                      />
                    </div>
                  )}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-start space-x-4">
                      <img
                        src={avatar ? avatar : ''}
                        alt="AI Avatar"
                        className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white object-cover"
                      />
                      <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
                        <div className="flex space-x-2">
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '200ms' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '400ms' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Input Area */}
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

          {/* File Management Dialog */}
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

          {/* Settings Button */}
          <div className="fixed bottom-24 right-4 z-50 mb-5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
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
                                  setFavouriteAlert({ show: true, success: true });
                                  setTimeout(() => {
                                    window.location.reload();
                                  }, 1500);
                                },
                                onError: error => {
                                  console.error('Failed to remove chat from favourites:', error);
                                  setFavouriteAlert({ show: true, success: false });
                                },
                              });
                            } else {
                              postFavourite.mutate(slug, {
                                onSuccess: () => {
                                  setFavouriteAlert({ show: true, success: true });
                                  setTimeout(() => {
                                    window.location.reload();
                                  }, 1500);
                                },
                                onError: error => {
                                  console.error('Failed to favourite chat:', error);
                                  setFavouriteAlert({ show: true, success: false });
                                },
                              });
                            }
                          }}
                        >
                          <HeartIcon className="h-4 w-4 mr-2" />
                          {chat.favourite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
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

          {/* Favourite Alert Dialog */}
          <AlertDialog
            open={favouriteAlert.show}
            onOpenChange={open =>
              !open && setFavouriteAlert({ show: false, success: false })
            }
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {favouriteAlert.success
                    ? 'Erfolgreich favorisiert'
                    : 'Fehler beim Favorisieren'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {favouriteAlert.success
                    ? 'Der Chat wurde erfolgreich zu Ihren Favoriten hinzugefügt.'
                    : 'Beim Hinzufügen des Chats zu Ihren Favoriten ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction
                  onClick={() => setFavouriteAlert({ show: false, success: false })}
                >
                  OK
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Edit Chat Dialog */}
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

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Chat löschen</AlertDialogTitle>
                <AlertDialogDescription>
                  Sind Sie sicher, dass Sie diesen Chat löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setIsDeleteDialogOpen(false)}>
                  Abbrechen
                </AlertDialogAction>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Create Chat Dialog */}
          <Dialog open={isCreateChatDialogOpen} onOpenChange={setIsCreateChatDialogOpen}>
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
  );
}
