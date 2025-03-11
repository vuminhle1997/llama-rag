"use client";

import { marked} from "marked";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React, { useRef, useEffect } from "react";
import { Upload, Send, FileText, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useGetChat, useDeleteFile, usePostFile, useChat } from "@/frontend/queries/chats";
import { format } from "date-fns";
import { File } from "@/frontend/types";
import { useAuth } from "@/frontend/queries";
import { useRouter } from "next/navigation";
import { setChat } from "@/frontend/store/reducer/app_reducer";
import { useAppDispatch } from "@/frontend/store/hooks/hooks";
import { useForm } from "react-hook-form";

interface ChatFormData {
  message: string;
}

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
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data: user, isLoading, error } = useAuth();
  const { slug } = React.use(params);
  const [isFileDialogOpen, setIsFileDialogOpen] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);
  const [pendingMessage, setPendingMessage] = React.useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { data: chat, refetch: refetchChat } = useGetChat(slug);
  const deleteFileMutation = useDeleteFile(slug);
  const uploadFileMutation = usePostFile(slug);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ChatFormData>({
    defaultValues: {
      message: ""
    }
  });

  const messageText = watch("message");
  const { searchMutation } = useChat(slug);

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFileMutation.mutateAsync(fileId);
      await refetchChat();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Bitte laden Sie nur PDF, CSV, Excel oder TXT-Dateien hoch');
      event.target.value = '';
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.set('file', file);
      
      const response = await uploadFileMutation.mutateAsync(formData);
      
      await refetchChat();
      event.target.value = ''; // Reset the input
      alert('Datei hochgeladen erfolgreich');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleSubmit = async (data: ChatFormData) => {
    try {
      setIsSubmitting(true);
      setPendingMessage(data.message);
      setIsTyping(true);
      scrollToBottom();
      const response = await searchMutation.mutateAsync(data.message);
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

  useEffect(() => {
    if (chat) {
      dispatch(setChat(chat));
    }
  }, [chat]);

  // Add effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages, pendingMessage, isTyping]);

  if (isLoading) {
    return <div>Wird geladen...</div>;
  }

  if (error && !isLoading) {
    router.push('/');
    return;
  }

  return (
    <main className="flex flex-col h-screen w-screen bg-gray-50">
      {(isUploading || deleteFileMutation.isPending) && (
        <LoadingOverlay message={isUploading ? "Datei wird hochgeladen..." : "Datei wird gelöscht..."} />
      )}
      {/* Chat Messages Container */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {chat?.messages?.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-4 ${
                message.role === 'user' ? 'justify-end' : ''
              }`}
            >
              {message.role !== 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                  {message.role === 'assistant' ? 'KI' : 'S'}
                </div>
              )}
              <div className={`flex-1 rounded-lg shadow-sm p-4 ${
                message.role === 'user' ? 'bg-primary' : 'bg-white'
              }`}>
                {message.blocks.map((block, blockIndex) => (
                  <div
                    key={blockIndex}
                    className={message.role === 'user' ? 'text-white' : 'text-gray-800'}
                  >
                    <div dangerouslySetInnerHTML={{ __html: marked(block.text) }}>

                    </div>
                  </div>
                ))}
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                  B
                </div>
              )}
            </div>
          ))}

          {/* Pending Message */}
          {pendingMessage && (
            <div className="flex items-start space-x-4 justify-end">
              <div className="flex-1 bg-primary rounded-lg shadow-sm p-4">
                <p className="text-white">{pendingMessage}</p>
              </div>
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                B
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                KI
              </div>
              <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleFormSubmit(handleSubmit)} className="relative space-y-2">
            <div className="relative">
              <Textarea
                rows={1}
                className={`w-full pr-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary rounded-lg ${
                  errors.message ? 'border-red-500' : ''
                }`}
                placeholder="Geben Sie Ihre Nachricht hier ein..."
                disabled={isSubmitting || isTyping}
                {...register("message", {
                  required: "Nachricht ist erforderlich",
                  minLength: {
                    value: 5,
                    message: "Nachricht muss mindestens 5 Zeichen lang sein"
                  }
                })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !isSubmitting && !isTyping) {
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
                  disabled={isUploading || uploadFileMutation.isPending || isSubmitting || isTyping}
                >
                  {(isUploading || uploadFileMutation.isPending) ? (
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
                  disabled={isUploading || deleteFileMutation.isPending || isSubmitting || isTyping}
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
              {chat?.files?.map((file: File) => (
                <TableRow key={file.id}>
                  <TableCell>{file.file_name}</TableCell>
                  <TableCell>{file.mime_type}</TableCell>
                  <TableCell>{format(new Date(file.created_at), 'PPpp')}</TableCell>
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
                      ) : 'Löschen'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!chat?.files || chat.files.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Noch keine Dateien hochgeladen
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </main>
  );
}
