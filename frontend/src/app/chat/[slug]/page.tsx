"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React, { useRef, useEffect } from "react";
import { Upload, Send, FileText, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useGetChat, useDeleteFile, usePostFile } from "@/frontend/queries/chats";
import { format } from "date-fns";
import { File } from "@/frontend/types";
import { useAuth } from "@/frontend/queries";
import { useRouter } from "next/navigation";
import { setChat } from "@/frontend/store/reducer/app_reducer";
import { useAppDispatch } from "@/frontend/store/hooks/hooks";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: chat, refetch: refetchChat } = useGetChat(slug);
  const deleteFileMutation = useDeleteFile(slug);
  const uploadFileMutation = usePostFile(slug);

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
      alert('Please upload only PDF, CSV, Excel or TXT files');
      event.target.value = '';
      return;
    }

    try {
      const formData = new FormData();
      formData.set('file', file);
      console.log(formData);
      const response = await uploadFileMutation.mutateAsync(formData);
      console.log(response);
      await refetchChat();
      event.target.value = ''; // Reset the input
      alert('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  useEffect(() => {
    console.log(chat);
    if (chat) {
      dispatch(setChat(chat));
    }
  }, [chat]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error && !isLoading) {
    router.push('/');
    return;
  }

  return (
    <main className="flex flex-col h-screen w-screen bg-gray-50">
      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {/* System Message */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              AI
            </div>
            <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
              <p className="text-gray-800">Hi, I'm your AI assistant. How can I help you today?</p>
            </div>
          </div>

          {/* User Message */}
          <div className="flex items-start space-x-4 justify-end">
            <div className="flex-1 bg-primary rounded-lg shadow-sm p-4">
              <p className="text-white">I need help with my project.</p>
            </div>
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              U
            </div>
          </div>

          {/* System Message */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              AI
            </div>
            <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
              <p className="text-gray-800">I'd be happy to help! What kind of project are you working on?
                <p><b>Title:</b> {slug}</p>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Textarea
              rows={1}
              className="w-full pr-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
              placeholder="Type your message here..."
            />
            <div className="absolute right-2 bottom-2 flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                title="Upload file"
                onClick={handleUploadClick}
                disabled={uploadFileMutation.isPending}
              >
                {uploadFileMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                title="Manage files"
                onClick={() => setIsFileDialogOpen(true)}
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:text-primary/80"
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
            <DialogTitle>Manage Files</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Uploaded At</TableHead>
                <TableHead>Actions</TableHead>
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
                      ) : 'Delete'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!chat?.files || chat.files.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No files uploaded yet
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
