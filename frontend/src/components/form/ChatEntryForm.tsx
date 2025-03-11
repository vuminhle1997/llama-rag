import { Button } from '../ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { usePostChat, useUpdateChat } from '@/frontend/queries/chats';
import { useForm } from 'react-hook-form';
import { Chat } from '@/frontend/types';
import { toast } from 'sonner';
import { Alert } from '../ui/alert';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

type FormData = {
  title: string;
  description: string;
  context: string;
};

interface ChatEntryFormProps {
  chat?: Chat;
  onSuccess?: () => void;
  mode?: 'create' | 'update';
}

export default function ChatEntryForm({ chat, onSuccess, mode = chat ? 'update' : 'create' }: ChatEntryFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: chat ? {
      title: chat.title,
      description: chat.description || '',
      context: chat.context || '',
    } : {}
  });
  const [ showSuccess, setShowSuccess ] = useState(false);
  const [ showError, setShowError ] = useState(false);
  const { mutateAsync: createChat, isPending: isCreating } = usePostChat();
  const { mutateAsync: updateChat, isPending: isUpdating } = useUpdateChat(chat?.id || '');
  const router = useRouter();
  
  const onSubmit = async (data: FormData) => {
    const chatData: Partial<Chat> = {
      ...chat,
      title: data.title,
      description: data.description,
      context: data.context,
    };
    
    try {
      let response;
      if (mode === 'create') {
        response = await createChat(chatData as Chat);
      } else {
        response = await updateChat(chatData as Chat);
      }
      
      setShowSuccess(true);
      setShowError(false);
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          router.push(`/chat/${response.id}`);
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      setShowError(true);
      setShowSuccess(false);
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    }
  };

  const isPending = mode === 'create' ? isCreating : isUpdating;

  return (
    <>
    <DialogContent className="sm:max-w-[425px] md:max-w-[800px]">
      <DialogHeader>
        <DialogTitle>
          {mode === 'create' ? 'Chat erstellen' : 'Chat bearbeiten'}
        </DialogTitle>
        <DialogDescription>
          {mode === 'create' 
            ? 'Erstelle einen neuen Chat mit kontextbezogenen Inhalten.'
            : 'Bearbeite die Einstellungen des bestehenden Chats.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 py-4 md:max-h-[500px] overflow-y-scroll my-4 px-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Titel
            </Label>
            <div className="col-span-3 space-y-2">
              <Input 
                id="title"
                className={errors.title ? "border-red-500" : ""}
                {...register('title', { 
                  required: "Titel ist erforderlich" 
                })}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Beschreibung
            </Label>
            <Textarea
              id="description"
              className="col-span-3"
              {...register('description')}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="context" className="text-right">
              Kontext
            </Label>
            <div className="col-span-3 space-y-2">
              <Textarea
                id="context"
                className={errors.context ? "border-red-500" : ""}
                placeholder={placeholderForContext}
                rows={10}
                {...register('context', { 
                  required: "Kontext ist erforderlich" 
                })}
              />
              {errors.context && (
                <p className="text-red-500 text-sm">{errors.context.message}</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" className="bg-primary" disabled={isPending}>
            {isPending 
              ? (mode === 'create' ? 'Erstellen...' : 'Speichern...') 
              : (mode === 'create' ? 'Erstellen' : 'Speichern')}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
    { showSuccess && (
      <Alert>
        {mode === 'create' 
          ? 'Chat erfolgreich erstellt.' 
          : 'Chat erfolgreich aktualisiert.'}
      </Alert>
    )}
    { showError && (
      <Alert variant="destructive">
        {mode === 'create'
          ? 'Fehler beim Erstellen des Chats. Bitte versuchen Sie es erneut.'
          : 'Fehler beim Aktualisieren des Chats. Bitte versuchen Sie es erneut.'}
      </Alert>
    )}
    </>
  );
}
