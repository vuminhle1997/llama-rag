'use client';

import Link from 'next/link';
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
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '../ui/scroll-area';
import { useAppSelector } from '@/frontend/store/hooks/hooks';
import {
  selectChats,
  selectFavouriteChats,
} from '@/frontend/store/reducer/app_reducer';
import { Separator } from '../ui/separator';
import hrImage from '@/static/templates/hr.jpeg';
import engineerImage from '@/static/templates/engineer.webp';
import softwareEngineerImage from '@/static/templates/software_engineer.webp';
import consultantImage from '@/static/templates/consultant.jpeg';
import aiImage from '@/static/templates/helper.webp';
import { StaticImageData } from 'next/image';
import { useGetAvatar } from '@/frontend/queries/avatar';
import { Check, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Slider } from '../ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { ArchiveBoxIcon, ChatBubbleOvalLeftIcon, HeartIcon } from '@heroicons/react/24/solid';

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
  temperature: number;
  model: string;
};

interface ChatEntryFormProps {
  chat?: Chat;
  onSuccess?: () => void;
  mode?: 'create' | 'update';
}

const defaultTemplates = [
  {
    title: 'KI-Assistent',
    description:
      'Ein hilfreicher KI-Begleiter für all Ihre Anfragen und Aufgaben',
    avatar_path: aiImage,
    temperature: 0.75,
    context: `Du bist ein hilfreicher KI-Assistent, der den Benutzer bei verschiedenen Aufgaben unterstützt.

## Persönlichkeit
- Freundlich und zuvorkommend
- Geduldig und verständnisvoll
- Professionell und kompetent
- Hilfsbereit und lösungsorientiert

## Kommunikationsstil
- Natürlich und gesprächig
- Klar und präzise
- Anpassungsfähig an den Kontext
- Empathisch und verständnisvoll

## Fähigkeiten
- Beantwortung von Fragen
- Erklärung komplexer Themen
- Hilfestellung bei Aufgaben
- Recherche und Informationsbeschaffung
- Analyse und Problemlösung
- Kreative Vorschläge und Ideen

## Tools
{tool_desc}

## Ausgabeformat
{tool_format}

## Zusätzliche Regeln
- Antworte in natürlicher, verständlicher Sprache
- Strukturiere komplexe Antworten übersichtlich
- Gib bei Unsicherheiten ehrlich zu, wenn du etwas nicht weißt
- Biete alternative Lösungen an, wenn möglich
- Berücksichtige den Kontext und die Bedürfnisse des Benutzers

## Aktuelles Gespräch
Nachfolgend findest du den Gesprächsverlauf, den du bei deinen Antworten berücksichtigen solltest:
[Gesprächsverlauf hier einfügen]`,
  },
  {
    // TODO: Add template, computer engineer Denis Kunz, specialising in software development and system architecture SPRING BOOT
    title: 'Computer-Ingenieur: Denis Kunz',
    description:
      'Spezialisiert auf Softwareentwicklung und Systemarchitektur mit Spring Boot',
    avatar_path: softwareEngineerImage,
    temperature: 0.75,
    model: 'llama3.1',
    context: `
    Denis Kunz – Computer-Ingenieur

    Du bist Denis Kunz, ein Computer-Ingenieur mit Schwerpunkt auf Softwareentwicklung und Systemarchitektur mit Spring Boot.

    ## Expertise
    - Softwareentwicklung mit Spring Boot
    - Systemarchitektur und -design

    ## Kommunikationsstil
    - Technisch und präzise
    - Detailorientiert
    - Klar und verständlich

    ## Tools
    - Spring Boot

    ## Ausgabeformat
    - Markdown-Format für klare Strukturierung
    - Verwende Aufzählungspunkte für komplexe Antworten
    - Beantworte Fragen in natürlicher Sprache
    - Stelle alternative Lösungen vor, wenn möglich

    ## Zusätzliche Regeln
    - Beantworte Fragen in natürlicher Sprache
    
    ## Aktuelles Gespräch
    [Gesprächsverlauf hier einfügen]
    `,
  },
  {
    title: 'PR-Person: Anna Pham',
    description:
      'Expertin für Öffentlichkeitsarbeit, Medienkommunikation und Markenmanagement',
    avatar_path: hrImage,
    model: 'llama3.1',
    temperature: 0.75,
    context: `
**Anna Pham - HR-Verantwortliche**

Ich bin Anna Pham, zuständig für HR-Aufgaben. Meine Rolle umfasst verschiedene Tätigkeiten, darunter:

* Beantwortung allgemeiner Fragen
* Bereitstellung von Zusammenfassungen
* Durchführung von HR-bezogenen Analysen

**Gesprächsstil**

Ich führe natürliche Gespräche und beantworte einfache Fragen direkt, ohne Werkzeuge zu verwenden.

Wenn ausdrücklich darum gebeten wird, ein Werkzeug zu nutzen (z. B. "Nutze das Tool für ..."), befolge ich die Anweisung entsprechend.

Bei HR-bezogenen Anfragen oder Dokumentaufgaben nutze ich die entsprechenden Tools, um strukturierte Antworten bereitzustellen.

Wenn der Nutzer eine Liste anfordert, zeige ich die von einem Tool verarbeiteten Informationen transparent an.

Ich kommuniziere im Markdown-Format, damit die Inhalte im Frontend optimal formatiert werden.

**Werkzeuge**

Ich habe Zugriff auf verschiedene Tools, die mir helfen, Anfragen effizient zu bearbeiten. Ich entscheide selbst, wann und wie ich sie einsetze, um Aufgaben bestmöglich zu erfüllen.

Falls eine Aufgabe mehrere Schritte erfordert, kann ich sie aufteilen und verschiedene Tools nacheinander anwenden.

**Verfügbare Werkzeuge**

{tool_desc}

**Ausgabeformat**

Wenn ich ein Tool verwende, folge diesem strukturierten Format:

Gedanke: Ich muss ein Tool verwenden, um diese Anfrage zu erfüllen.
Aktion: [Tool-Name] (eines von {tool_names})
Aktionseingabe: [Gültiges JSON-Format](z. B. {"query": "Mitarbeiterdaten", "filter": ["Abteilung: HR"]})

Falls ein Tool genutzt wird, erhältst du eine Antwort im folgenden Format:

Beobachtung: [Antwort des Tools]

Ich setze diesen Prozess fort, bis ich genügend Informationen gesammelt habe, um die Anfrage zu beantworten. Dann schließe ich mit einer der folgenden Optionen ab:

Gedanke: Ich habe ausreichend Informationen, um zu antworten.
Antwort: [Deine Antwort]

ODER

Gedanke: Die verfügbaren Tools liefern nicht die benötigten Informationen.
Antwort: Leider kann ich diese Anfrage nicht beantworten.

Die Ausgabe muss im Markdown-Format erfolgen, insbesondere für Aufzählungen, damit sie im Frontend als HTML korrekt angezeigt wird.

**Zusätzliche Regeln**

Direkte Fragen (z. B. "Wie heißt du?") beantworte ich natürlich, ohne Tools zu verwenden.

Befolge stets die erwartete Funktionssignatur der jeweiligen Tools und gib alle notwendigen Argumente an.

Verwende Aufzählungspunkte, um komplexe Antworten oder Tool-Ergebnisse verständlich zu strukturieren.

Falls der Nutzer explizit die Nutzung eines Tools verlangt (z. B. "Nutze das HR-Tool für ..."), folge ich der Anweisung exakt.

**Aktuelles Gespräch**

Nachfolgend befindet sich der Gesprächsverlauf, den du bei deinen Antworten berücksichtigen solltest:

[Gesprächsverlauf hier einfügen]
    `,
  },
  {
    title: 'Bauingenieur: Ranjeed Singh',
    description:
      'Spezialisiert auf Bauprojektmanagement und technische Planung',
    avatar_path: engineerImage,
    temperature: 0.75,
    model: 'llama3.1',
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
- Pflege klarer Dokumentation und Aufzeichnungen`,
  },
  {
    title: 'Senior-Berater: Daniel Dehn',
    description:
      'Erfahren in Geschäftsstrategie, Prozessoptimierung und Organisationsentwicklung',
    avatar_path: consultantImage,
    temperature: 0.75,
    model: 'llama3.1',
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
- Wahrung professioneller Objektivität`,
  },
];

const defaultModels = [
  {
    id: 'llama3.1',
    name: 'LLama 3.1',
    description:
      'LLama 3.1 von Meta ist ein ausgewogenes Sprachmodell, das eine hervorragende Balance zwischen Leistung und Effizienz bietet. Es ist ideal für allgemeine Anwendungen wie Textgenerierung, Übersetzungen und einfache Konversationsaufgaben. Benutzer können es für die Erstellung präziser und effizienter Kommunikation nutzen.',
    isDefault: true,
  },
  {
    id: 'deepseek-r1',
    name: 'Deepseek-r1',
    description:
      'Deepseek-r1 von Deepseek ist ein spezialisiertes Modell für technische und wissenschaftliche Aufgaben. Es bietet verbesserte Präzision und ist besonders nützlich für Benutzer, die in der Forschung, Datenanalyse und technischen Dokumentation tätig sind.',
    isDefault: false,
  },
  // {
  //   id: 'phi4',
  //   name: 'Phi 4',
  //   description:
  //     'Phi 4 von Microsoft ist ein kompaktes und effizientes Modell, das für schnelle Antworten und alltägliche Konversationen optimiert ist. Es eignet sich hervorragend für den Einsatz in Chatbots und Kundenservice-Anwendungen, wo schnelle und präzise Antworten erforderlich sind.',
  //   isDefault: false,
  // },
  // {
  //   id: 'qwen2.5-coder:32b',
  //   name: 'Qwen 2.5 Coder 32B',
  //   description:
  //     'Qwen 2.5 Coder 32B von Alibaba ist spezialisiert auf Softwareentwicklung und technische Dokumentation. Es bietet hervorragende Coding-Fähigkeiten und ist ideal für Entwickler, die Unterstützung bei der Codegenerierung und -überprüfung benötigen.',
  //   isDefault: false,
  // },
  // {
  //   id: 'qwq',
  //   name: 'QwQ',
  //   description:
  //     'QwQ von Anthropic ist ein experimentelles Modell mit einem Fokus auf kreative und innovative Lösungsansätze. Es unterstützt Benutzer bei der Entwicklung neuer und unkonventioneller Strategien, insbesondere in den Bereichen Marketing und Produktentwicklung.',
  //   isDefault: false,
  // },
  // {
  //   id: 'gemma3:27b',
  //   name: 'Gemma 3 27B',
  //   description:
  //     'Gemma 3 27B von Google ist ein fortschrittliches Allzweckmodell mit besonderer Stärke in der Verarbeitung komplexer Zusammenhänge. Es ist ideal für Benutzer, die mit komplexen Daten und Analysen arbeiten, wie z.B. in der Finanzanalyse und strategischen Planung.',
  //   isDefault: false,
  // },
  // {
  //   id: 'codellama:34b',
  //   name: 'CodeLLama 34B',
  //   description:
  //     'CodeLLama 34B von Meta ist ein leistungsstarkes Entwicklermodell, das für Programmierung und technische Problemlösung optimiert ist. Es unterstützt Benutzer bei der Entwicklung und Implementierung technischer Lösungen, insbesondere in der Softwareentwicklung und IT-Beratung.',
  //   isDefault: false,
  // },
];

export default function ChatEntryForm({
  chat,
  onSuccess,
  mode = chat ? 'update' : 'create',
}: ChatEntryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: chat
      ? {
          title: chat.title,
          description: chat.description || '',
          context: chat.context || '',
          avatar: undefined,
          temperature: chat.temperature || 0.75,
          model: chat.model || 'llama3.1',
        }
      : {
          model: 'llama3.1',
        },
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: createChat, isPending: isCreating } = usePostChat();
  const { mutateAsync: updateChat, isPending: isUpdating } = useUpdateChat(
    chat?.id || ''
  );
  const router = useRouter();
  const existingChats = useAppSelector(selectChats);
  const favouriteChats = useAppSelector(selectFavouriteChats);
  const { avatar } = useGetAvatar(chat?.id || '');

  const useAsTemplate = async (
    templateChat:
      | Chat
      | {
          id?: string;
          temperature?: number;
          title: string;
          description: string;
          context: string;
          avatar_path?: StaticImageData;
          model?: string;
        }
  ) => {
    setValue('title', `Kopie von: ${templateChat.title}`);
    setValue('description', templateChat.description || '');
    setValue('context', templateChat.context || '');
    setValue('temperature', templateChat.temperature || 0.75);
    setValue('model', templateChat.model || 'llama3.1');

    // Handle avatar based on template type
    if ('id' in templateChat) {
      // Handle existing chat avatar by fetching directly
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/avatar/${templateChat.id}`,
          {
            withCredentials: true,
            responseType: 'blob',
          }
        );
        const blob = response.data;
        const file = new File([blob], 'avatar.jpg', { type: blob.type });

        // Create a DataTransfer object to get a FileList
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        setValue('avatar', dataTransfer.files);
        setAvatarPreview(URL.createObjectURL(blob));
      } catch (error) {
        console.error('Error loading existing chat avatar:', error);
      }
    } else if ('avatar_path' in templateChat && templateChat.avatar_path) {
      // Handle default template with static avatar
      try {
        const response = await fetch(templateChat.avatar_path.src);
        const blob = await response.blob();
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

        // Create a DataTransfer object to get a FileList
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        setValue('avatar', dataTransfer.files);
        setAvatarPreview(URL.createObjectURL(blob));
      } catch (error) {
        console.error('Error loading template avatar:', error);
      }
    }
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

  // Load existing avatar when editing
  useEffect(() => {
    if (mode === 'update' && chat?.id && avatar) {
      setAvatarPreview(avatar);
    }
  }, [mode, chat?.id, avatar]);

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();

    formData.append(
      'chat',
      JSON.stringify({
        title: data.title,
        description: data.description || '',
        context: data.context,
        temperature: data.temperature,
        model: data.model,
      })
    );

    if (data.avatar?.[0]) {
      formData.append('file', data.avatar[0]);
    }

    try {
      let response;
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
                Wählen Sie einen vordefinierten Chat oder einen vorhandenen Chat
                als Vorlage.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[calc(100vh-450px)] mt-4">
              <div className="space-y-2">
                {/* Default Templates */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground px-2">
                    <div className="flex flex-row gap-2">
                      <ArchiveBoxIcon className="h-5 w-5" />
                      <span>Standardvorlagen</span>
                    </div>
                  </h3>
                  {defaultTemplates.map(template => (
                    <div
                      key={uuidv4()}
                      className="p-3 border rounded-lg hover:bg-accent cursor-pointer bg-muted/50"
                      onClick={() => useAsTemplate(template)}
                    >
                      <div className="flex items-center gap-3">
                        {template.avatar_path && (
                          <img
                            src={template.avatar_path.src}
                            alt={template.title}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h4 className="font-medium">{template.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* User's Favourite Chats */}
                {favouriteChats && favouriteChats.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground px-2">
                        <div className="flex flex-row gap-2">
                          <HeartIcon className="text-sm h-5 w-5" />
                          <span>Ihre favorisierten Chats </span>
                        </div>
                      </h3>
                      {favouriteChats.map(existingChat => (
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

                {/* User's Existing Chats */}
                {existingChats && existingChats.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground px-2">
                        <div className="flex flex-row gap-2">
                          <ChatBubbleOvalLeftIcon className="h-5 w-5" />
                          <span>Ihre Chats</span>
                        </div>
                      </h3>
                      {existingChats.map(existingChat => (
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
          <ScrollArea className="flex-1">
            <DialogHeader>
              <DialogTitle>
                {mode === 'create' ? 'Chat erstellen' : 'Chat bearbeiten'}
              </DialogTitle>
              <DialogDescription>
                {mode === 'create'
                  ? 'Erstelle einen neuen Chat mit kontextbezogenen Inhalten. Füllen Sie alle erforderlichen Felder aus, um fortzufahren. Der Titel sollte prägnant sein, die Beschreibung kann zusätzliche Details enthalten, und der Kontext sollte die Rolle und den Kommunikationsstil des Chats definieren.'
                  : 'Bearbeite die Einstellungen des bestehenden Chats. Stellen Sie sicher, dass alle Felder korrekt ausgefüllt sind, um die Änderungen zu speichern. Der Titel, die Beschreibung und der Kontext sind entscheidend für die Definition der Chat-Parameter.'}
                <p className="text-gray-400 mt-4">
                  Markierte Felder mit * sind verpflichtend.
                </p>
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
                        className={`w-32 h-32 rounded-full overflow-hidden cursor-pointer relative group ${
                          !avatarPreview
                            ? 'border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50'
                            : ''
                        }`}
                      >
                        {avatarPreview ? (
                          <>
                            <img
                              src={avatarPreview}
                              alt="Avatar preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-white text-sm">Ändern</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full p-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            <span className="text-sm text-gray-500 text-center mt-2">
                              Avatar hochladen
                            </span>
                          </div>
                        )}
                      </div>
                      <Input
                        {...register('avatar')}
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={e => {
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
                    Titel *
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <Input
                      id="title"
                      className={errors.title ? 'border-red-500' : ''}
                      {...register('title', {
                        required: 'Titel ist erforderlich',
                      })}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm">
                        {errors.title.message}
                      </p>
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
                    Kontext *
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <Textarea
                      id="context"
                      className={errors.context ? 'border-red-500' : ''}
                      placeholder={placeholderForContext}
                      rows={10}
                      {...register('context', {
                        required: 'Kontext ist erforderlich',
                      })}
                    />
                    {errors.context && (
                      <p className="text-red-500 text-sm">
                        {errors.context.message}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Der Kontext muss die folgenden Elemente enthalten:
                      <br />- Persönlichkeit und Rolle des KI-Assistenten
                      <br />- Kommunikationsstil und Verhaltensmuster
                      <br />- Spezifische Fähigkeiten und Expertise
                      <br />- Umgang mit verfügbaren Tools
                      <br />- Ausgabeformat und zusätzliche Regeln
                      <p className="text-black mt-2">
                        Wenn Sie sich unsicher sind, besuchen Sie bitte{' '}
                        <a href="/faq" className="text-blue-500 underline">
                          unsere FAQ-Seite
                        </a>
                        , um mehr darüber zu erfahren, wie Sie gute
                        Eingabeaufforderungen schreiben können.
                      </p>
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="model" className="text-right">
                    Sprachmodell *
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <Select
                      defaultValue={watch('model')}
                      onValueChange={value => setValue('model', value)}
                    >
                      <SelectTrigger className="w-full h-[60px]">
                        <SelectValue placeholder="Wählen Sie ein Sprachmodell" />
                      </SelectTrigger>
                      <SelectContent className="w-[var(--radix-select-trigger-width)] max-h-[300px]">
                        {defaultModels.map(model => (
                          <SelectItem
                            key={model.id}
                            value={model.id}
                            className="flex flex-col items-start py-3"
                          >
                            <div className="flex flex-col justify-start items-start">
                              <div className="font-medium text-base text-left">
                                {model.name}
                              </div>
                              <div className="text-sm text-muted-foreground leading-snug text-left mt-1">
                                {model.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-2">
                      Das ausgewählte Sprachmodell bestimmt die Fähigkeiten und
                      Charakteristiken des Chats.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4 mt-8">
                  <Label htmlFor="temperature" className="text-right">
                    Temperatur
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <Slider
                      id="temperature"
                      className={errors.temperature ? 'border-red-500' : ''}
                      defaultValue={
                        chat?.temperature ? [chat.temperature] : [0.75]
                      }
                      // @ts-ignore
                      min={0}
                      // @ts-ignore
                      max={1}
                      step={0.01}
                      {...register('temperature')}
                    />
                    <div className="flex flex-col justify-center items-center">
                      <p className="text-center">{watch('temperature')}</p>
                      <span className="text-sm text-muted-foreground">
                        0 = keine Kreativität, 1 = sehr kreativ
                      </span>
                      <span className="text-sm text-muted-foreground">
                        0.75 = Standard
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Die Temperatur beeinflusst die Kreativität der
                        Antworten. Ein höherer Wert führt zu kreativeren, aber
                        weniger vorhersehbaren Antworten, während ein
                        niedrigerer Wert zu präziseren und fokussierteren
                        Antworten führt.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="reset"
                    className="bg-gray-400"
                    disabled={isPending}
                  >
                    Zurücksetzen
                  </Button>
                  {/* TODO: Add cancel button */}
                  {/* <Button type="submit" className="bg-red-500" disabled={isPending}>
                Abbrechen
              </Button> */}
                  <Button
                    type="submit"
                    className="bg-primary"
                    disabled={isPending}
                  >
                    {isPending
                      ? mode === 'create'
                        ? 'Erstellen...'
                        : 'Speichern...'
                      : mode === 'create'
                      ? 'Erstellen'
                      : 'Speichern'}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </ScrollArea>
        </div>
      </DialogContent>
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 w-96">
          <Alert variant="default" className="relative">
            <Check className="h-4 w-4" />
            <AlertTitle>
              {mode === 'create' ? 'Chat erstellt' : 'Chat aktualisiert'}
            </AlertTitle>
            <AlertDescription>
              {mode === 'create'
                ? 'Der Chat wurde erfolgreich erstellt.'
                : 'Der Chat wurde erfolgreich aktualisiert.'}
            </AlertDescription>
          </Alert>
        </div>
      )}
      {showError && (
        <div className="fixed top-4 right-4 z-50 w-96">
          <Alert variant="destructive" className="relative">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {mode === 'create'
                ? 'Fehler beim Erstellen'
                : 'Fehler beim Aktualisieren'}
            </AlertTitle>
            <AlertDescription>
              {mode === 'create'
                ? 'Der Chat konnte nicht erstellt werden. Bitte versuchen Sie es erneut.'
                : 'Der Chat konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.'}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
}
