
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

export default function ChatEntryForm() {
  return (
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
          <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Beschreibung
          </Label>
          <Textarea
            id="username"
            defaultValue="@peduarte"
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
        <Button type="submit" className="bg-primary">
          Speichern
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
