"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppProvider from "@/components/provider/AppProvider";
import { selectAuthorized, useAppSelector } from "@/frontend";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import Logo from "@/static/globalLogo.png";
import Image from "next/image";
import {
  EllipsisHorizontalIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const chats = ["Finanzexperte Niklas", "Jurist Marcel", "People Manager Rabea"];

const placeholderForContext = `Your role is to assist with a variety of tasks, including answering general questions, providing summaries, and performing HR-related analyses.

## Conversation Style
- You engage in natural conversations and answer simple questions directly, without using tools.
- When explicitly asked to use a tool (e.g., "Use the tool for..."), you follow the request accordingly.
- For HR-related queries or document-related tasks, you utilize the appropriate tools to provide structured responses.

## Tools
You have access to several tools that help accomplish tasks effectively. 
You should determine when and how to use them to complete requests efficiently.
If a task requires multiple steps, you can break it down and apply different tools as needed.
Available tools:
{tool_desc}

## Output Format
When using a tool, follow this structured format:
Thought: I need to use a tool to complete this request. Action: [Tool name] (one of {tool_names}) 
Action Input: [Valid JSON format input] (e.g., {{"query": "employee records", "filters": ["department: HR"]}})

Always start with a Thought before taking action.

If a tool is used, the system will respond in the following format:
Observation: [Tool response]
You should continue this process until you have gathered enough information to respond to the query. 
Once you have enough details, conclude with one of the following:

Thought: I have sufficient information to answer. 
Answer: [Your answer]

OR

Thought: The available tools do not provide the necessary information.
Answer: Sorry, I cannot answer this query.

## Additional Rules
- When answering a direct question (e.g., "What is your name?"), respond naturally without invoking tools.
- Always follow the expected function signature of each tool and provide the necessary arguments.
- Use bullet points to explain the reasoning behind complex responses, especially when using tools.
- If the user explicitly requests tool usage (e.g., "Use the HR tool for..."), follow the instruction exactly.

## Current Conversation
Below is the conversation history, which you should consider when providing responses:
[Include conversation history here]
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-row">
          <div className="w-1/8 sidebar bg-gray-100">
            <div className="nav-header p-4">
              <Link href="/">
                <Image className="p-4" alt="global CT Logo" src={Logo}></Image>
              </Link>
            </div>
            <div className="search-bar p-4">
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  className="bg-white"
                  type="text"
                  placeholder="Chat suchen . . ."
                />
                <Button type="submit" className="bg-blue-400">
                  <MagnifyingGlassIcon />
                </Button>
              </div>
            </div>
            <div className="flex flex-col p-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-blue-400 text-white hover:bg-gray-300"
                  >
                    <PencilSquareIcon />
                    Neuen Chat erstellen
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] md:max-w-[800px]">
                  <DialogHeader>
                    <DialogTitle>Chat erstellen</DialogTitle>
                    <DialogDescription>
                      Erstelle ein neuen Chat mit kontextbezogenen Inhalten.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 md:max-h-[500px] overflow-y-scroll my-4 px-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Titel
                      </Label>
                      <Input
                        id="name"
                        value="Pedro Duarte"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="username" className="text-right">
                        Beschreibung
                      </Label>
                      <Textarea
                        id="username"
                        value="@peduarte"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="context" className="text-right">
                        Kontext
                      </Label>
                      <Textarea
                        id="context"
                        className="col-span-3"
                        placeholder={placeholderForContext}
                        rows={10}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-blue-400 text-white">
                      Speichern
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <div className="chat-menu flex flex-col mt-4">
                {chats.map((chat, i) => (
                  <div
                    key={`chat-${chat}`}
                    className="text-left py-2 px-4 flex justify-between hover:bg-gray-200 transition-all cursor-pointer"
                  >
                    <Link href={`/chat/${chat}`} className="text-md">
                      {chat}
                    </Link>
                    <DropdownMenu>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <DropdownMenuTrigger
                              className="hover:bg-gray-300 w-[30px] flex justify-center rounded-md cursor-pointer"
                              aria-label="Edit"
                            >
                              <EllipsisHorizontalIcon />
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Chat editieren</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DropdownMenuContent>
                        <DropdownMenuItem disabled>
                          <HeartIcon /> Favorisieren
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>
                          <PencilIcon /> Editieren
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled className="text-red-500">
                          <TrashIcon className="text-red-500" /> Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-7/8 bg-white relative h-screen flex flex-col justify-end">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
