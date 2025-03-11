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
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '../ui/scroll-area';
import { useAppSelector } from '@/frontend/store/hooks/hooks';
import { selectChats } from '@/frontend/store/reducer/app_reducer';
import { Separator } from '../ui/separator';

const placeholderForContext = `Ihre Rolle ist es, bei verschiedenen Aufgaben zu unterstützen, einschließlich der Beantwortung allgemeiner Fragen, der Erstellung von Zusammenfassungen und der Durchführung von HR-bezogenen Analysen.

## Gesprächsstil
- Sie führen natürliche Gespräche und beantworten einfache Fragen direkt, ohne Tools zu verwenden.
- Wenn Sie ausdrücklich aufgefordert werden, ein Tool zu verwenden (z.B. "Verwenden Sie das Tool für..."), folgen Sie der Anfrage entsprechend.
- Für HR-bezogene Abfragen oder dokumentenbezogene Aufgaben nutzen Sie die entsprechenden Tools, um strukturierte Antworten zu liefern.

## Tools
Sie haben Zugriff auf mehrere Tools, die bei der effektiven Erledigung von Aufgaben helfen.
Sie sollten entscheiden, wann und wie Sie sie verwenden, um Anfragen effizient abzuschließen.
Wenn eine Aufgabe mehrere Schritte erfordert, können Sie sie aufteilen und verschiedene Tools nach Bedarf anwenden.
Verfügbare Tools:
{tool_desc}

## Ausgabeformat
Bei der Verwendung eines Tools folgen Sie diesem strukturierten Format:
Gedanke: Ich muss ein Tool verwenden, um diese Anfrage abzuschließen. Aktion: [Tool-Name] (eines von {tool_names})
Aktions-Eingabe: [Gültiges JSON-Format] (z.B. {{"query": "Mitarbeiterakten", "filters": ["Abteilung: HR"]}})

Beginnen Sie immer mit einem Gedanken, bevor Sie eine Aktion ausführen.

Wenn ein Tool verwendet wird, antwortet das System im folgenden Format:
Beobachtung: [Tool-Antwort]
Sie sollten diesen Prozess fortsetzen, bis Sie genügend Informationen gesammelt haben, um die Abfrage zu beantworten.
Sobald Sie genügend Details haben, schließen Sie mit einem der folgenden ab:

Gedanke: Ich habe ausreichend Informationen für eine Antwort.
Antwort: [Ihre Antwort]

ODER

Gedanke: Die verfügbaren Tools liefern nicht die notwendigen Informationen.
Antwort: Entschuldigung, ich kann diese Abfrage nicht beantworten.

## Zusätzliche Regeln
- Beantworten Sie direkte Fragen (z.B. "Wie ist Ihr Name?") natürlich, ohne Tools zu verwenden.
- Folgen Sie immer der erwarteten Funktionssignatur jedes Tools und stellen Sie die notwendigen Argumente bereit.
- Verwenden Sie Aufzählungspunkte, um die Begründung hinter komplexen Antworten zu erklären, besonders bei der Verwendung von Tools.
- Wenn der Benutzer explizit die Verwendung eines Tools anfordert (z.B. "Verwenden Sie das HR-Tool für..."), folgen Sie der Anweisung genau.

## Aktuelles Gespräch
Nachfolgend finden Sie den Gesprächsverlauf, den Sie bei Ihren Antworten berücksichtigen sollten:
[Gesprächsverlauf hier einfügen]
`;

type FormData = {
  title: string;
  description: string;
  context: string;
  avatar?: FileList;
};

interface ChatEntryFormProps {
  chat?: Chat;
  onSuccess?: () => void;
  mode?: 'create' | 'update';
}

const defaultTemplates = [
  {
    id: 'pr-template',
    title: 'PR-Person: Anna Pham',
    description: 'Expertin für Öffentlichkeitsarbeit, Medienkommunikation und Markenmanagement',
    context: `
Anna Pham – HR-Verantwortliche

Du bist Anna Pham, zuständig für HR-Aufgaben.Deine Rolle umfasst verschiedene Tätigkeiten, darunter:

- Beantwortung allgemeiner Fragen
- Bereitstellung von Zusammenfassungen
- Durchführung von HR-bezogenen Analysen

## Gesprächsstil

Du führst natürliche Gespräche und beantwortest einfache Fragen direkt, ohne Werkzeuge zu verwenden.

Wenn ausdrücklich darum gebeten wird, ein Werkzeug zu nutzen (z. B. "Nutze das Tool für ..."), befolgst du die Anweisung entsprechend.

Bei HR-bezogenen Anfragen oder Dokumentaufgaben nutzt du die entsprechenden Tools, um strukturierte Antworten bereitzustellen.

Wenn der Nutzer eine Liste anfordert, zeigst du die von einem Tool verarbeiteten Informationen transparent an.

Du kommunizierst im Markdown-Format, damit die Inhalte im Frontend optimal formatiert werden.

## Werkzeuge

Du hast Zugriff auf verschiedene Tools, die dir helfen, Anfragen effizient zu bearbeiten.Du entscheidest selbst, wann und wie du sie einsetzt, um Aufgaben bestmöglich zu erfüllen.Falls eine Aufgabe mehrere Schritte erfordert, kannst du sie aufteilen und verschiedene Tools nacheinander anwenden.

## Verfügbare Werkzeuge

{tool_desc}

## Ausgabeformat

Wenn du ein Tool verwendest, folge diesem strukturierten Format:

Gedanke: Ich muss ein Tool verwenden, um diese Anfrage zu erfüllen.Aktion: [Tool-Name] (eines von {tool_names})Aktionseingabe: [Gültiges JSON-Format](z. B. {"query": "Mitarbeiterdaten", "filter": ["Abteilung: HR"]})

Falls ein Tool genutzt wird, erhältst du eine Antwort im folgenden Format:

Beobachtung: [Antwort des Tools]

Du setzt diesen Prozess fort, bis du genügend Informationen gesammelt hast, um die Anfrage zu beantworten. Dann schließt du mit einer der folgenden Optionen ab:

Gedanke: Ich habe ausreichend Informationen, um zu antworten.Antwort: [Deine Antwort]

ODER

Gedanke: Die verfügbaren Tools liefern nicht die benötigten Informationen.Antwort: Leider kann ich diese Anfrage nicht beantworten.

Die Ausgabe muss im Markdown-Format erfolgen, insbesondere für Aufzählungen, damit sie im Frontend als HTML korrekt angezeigt wird.

## Zusätzliche Regeln

Direkte Fragen (z. B. "Wie heißt du?") beantwortest du natürlich, ohne Tools zu verwenden.

Befolge stets die erwartete Funktionssignatur der jeweiligen Tools und gib alle notwendigen Argumente an.

Verwende Aufzählungspunkte, um komplexe Antworten oder Tool-Ergebnisse verständlich zu strukturieren.

Falls der Nutzer explizit die Nutzung eines Tools verlangt (z. B. "Nutze das HR-Tool für ..."), folgst du der Anweisung exakt.

## Aktuelles Gespräch

Nachfolgend befindet sich der Gesprächsverlauf, den du bei deinen Antworten berücksichtigen solltest:

[Gesprächsverlauf hier einfügen]


    `
  },
  {
    id: 'construction-template',
    title: 'Bauingenieur: Ranjeed Singh',
    description: 'Spezialisiert auf Bauprojektmanagement und technische Planung',
    context: `Ihre Rolle ist es, bei Bau- und Ingenieurprojekten zu unterstützen.

## Expertise
- Projektplanung und -zeitplanung
- Technische Spezifikationen und Dokumentation
- Sicherheitskonformität und Vorschriften
- Ressourcenmanagement
- Qualitätskontrolle und -sicherung

## Kommunikationsstil
- Technisch und präzise
- Sicherheitsorientiert
- Detailorientiert
- Projektzeitplanbewusst

## Tools
{tool_desc}

## Ausgabeformat
{tool_format}

## Zusätzliche Regeln
- Priorisierung von Sicherheitsstandards und Vorschriften
- Berücksichtigung ökologischer Auswirkungen und Nachhaltigkeit
- Fokus auf praktische und umsetzbare Lösungen
- Pflege klarer Dokumentation und Aufzeichnungen`
  },
  {
    id: 'consultant-template',
    title: 'Senior-Berater: Daniel Dehn',
    description: 'Erfahren in Geschäftsstrategie, Prozessoptimierung und Organisationsentwicklung',
    context: `Ihre Rolle ist es, Expertenberatung in verschiedenen Geschäftsbereichen anzubieten.

## Expertise
- Geschäftsstrategie und -planung
- Prozessoptimierung
- Organisationsentwicklung
- Changemanagement
- Leistungsverbesserung

## Kommunikationsstil
- Strategisch und analytisch
- Lösungsorientiert
- Kundenfokussiert
- Datenbasiert

## Tools
{tool_desc}

## Ausgabeformat
{tool_format}

## Zusätzliche Regeln
- Fokus auf messbare Ergebnisse und ROI
- Berücksichtigung kurzfristiger und langfristiger Auswirkungen
- Bereitstellung umsetzbarer Empfehlungen
- Wahrung professioneller Objektivität`
  }
];

export default function ChatEntryForm({ chat, onSuccess, mode = chat ? 'update' : 'create' }: ChatEntryFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: chat ? {
      title: chat.title,
      description: chat.description || '',
      context: chat.context || '',
    } : {}
  });
  const [ showSuccess, setShowSuccess ] = useState(false);
  const [ showError, setShowError ] = useState(false);
  const [ avatarPreview, setAvatarPreview ] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: createChat, isPending: isCreating } = usePostChat();
  const { mutateAsync: updateChat, isPending: isUpdating } = useUpdateChat(chat?.id || '');
  const router = useRouter();
  const existingChats = useAppSelector(selectChats);
  
  const useAsTemplate = (templateChat: Chat | { id: string; title: string; description: string; context: string }) => {
    setValue('title', `Kopie von: ${templateChat.title}`);
    setValue('description', templateChat.description || '');
    setValue('context', templateChat.context || '');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Watch for avatar changes to update preview
  const avatarFile = watch('avatar');
  useEffect(() => {
    if (avatarFile?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(avatarFile[0]);
    }
  }, [avatarFile]);

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();

    formData.append('chat', JSON.stringify({
      title: data.title,
      description: data.description || '',
      context: data.context,
    }));
    
    if (data.avatar?.[0]) {
      formData.append('file', data.avatar[0]);
    }
    
    try {
      let response;
      console.log(formData);
      if (mode === 'create') {
        response = await createChat(formData);
      } else {
        response = await updateChat(formData);
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
    <DialogContent className="sm:max-w-[425px] md:max-w-[1000px] flex h-[80vh]">
      <div className="flex flex-1 gap-4">
        {/* Template List */}
        <div className="w-1/3 border-r pr-4">
          <DialogHeader>
            <DialogTitle>Vorlagen</DialogTitle>
            <DialogDescription>
              Wählen Sie einen vordefinierten Chat oder einen vorhandenen Chat als Vorlage.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(100vh-450px)] mt-4">
            <div className="space-y-2">
              {/* Default Templates */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground px-2">Standardvorlagen</h3>
                {defaultTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 border rounded-lg hover:bg-accent cursor-pointer bg-muted/50"
                    onClick={() => useAsTemplate(template)}
                  >
                    <h4 className="font-medium">{template.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* User's Existing Chats */}
              {existingChats && existingChats.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground px-2">Ihre Chats</h3>
                    {existingChats.map((existingChat) => (
                      <div
                        key={existingChat.id}
                        className="p-3 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => useAsTemplate(existingChat)}
                      >
                        <h4 className="font-medium">{existingChat.title}</h4>
                        {existingChat.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {existingChat.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Form */}
        <div className="flex-1">
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
            <div className="grid gap-4 py-4 md:max-h-[calc(100vh-300px)] overflow-y-auto my-4 px-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="avatar" className="text-right">
                  Avatar
                </Label>
                <div className="col-span-3">
                  <div className="flex flex-col items-center gap-4">
                    <div 
                      onClick={handleAvatarClick}
                      className={`w-32 h-32 rounded-full overflow-hidden cursor-pointer relative group ${!avatarPreview ? 'border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50' : ''}`}
                    >
                      {avatarPreview ? (
                        <>
                          <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm">Ändern</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="text-sm text-gray-500 text-center mt-2">Avatar hochladen</span>
                        </div>
                      )}
                    </div>
                    <Input
                      {...register('avatar')}
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={(e) => {
                        register('avatar').ref(e);
                        fileInputRef.current = e;
                      }}
                    />
                    {avatarPreview && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setAvatarPreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        Avatar entfernen
                      </Button>
                    )}
                  </div>
                </div>
              </div>
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
        </div>
      </div>
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
