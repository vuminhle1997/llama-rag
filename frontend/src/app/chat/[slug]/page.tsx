import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { Upload, Send, FileText } from "lucide-react";

export default async function SlugChatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                title="Manage files"
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
          <Input type="file" className="hidden" id="file-upload" />
        </div>
      </div>
    </main>
  );
}
