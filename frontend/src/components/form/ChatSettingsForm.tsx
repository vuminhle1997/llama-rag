'use client';

import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

import { Slider } from '../ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import { placeholderForContext } from './templates';
import {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { Chat } from '@/frontend/types';
import { defaultModels } from './templates';
import { RefObject } from 'react';
import { ScrollArea } from '../ui/scroll-area';

type FormData = {
  title: string;
  description: string;
  context: string;
  avatar?: FileList;
  temperature: number;
  model: string;
};

export interface ChatSettingsFormProps {
  handleSubmit: UseFormHandleSubmit<FormData, undefined>;
  onSubmit: (data: FormData) => Promise<void>;
  register: UseFormRegister<FormData>;
  watch: UseFormWatch<FormData>;
  setValue: UseFormSetValue<FormData>;
  errors: FieldErrors<FormData>;
  chat?: Chat | null;
  handleAvatarClick: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  avatarPreview: string | null;
  mode: 'create' | 'update';
  setAvatarPreview: React.Dispatch<React.SetStateAction<string | null>>;
  isCreating: boolean;
  isUpdating: boolean;
}

/**
 * A React component for rendering a chat settings form. This form allows users to create or edit chat configurations,
 * including uploading an avatar, setting a title, description, context, selecting a language model, and adjusting the temperature.
 *
 * @param {ChatSettingsFormProps} props - The properties passed to the component.
 * @param {function} props.handleSubmit - Function to handle form submission.
 * @param {function} props.handleAvatarClick - Function to handle avatar click events.
 * @param {function} props.onSubmit - Callback function triggered on form submission.
 * @param {function} props.register - Function from `react-hook-form` to register form inputs.
 * @param {function} props.watch - Function from `react-hook-form` to watch form values.
 * @param {function} props.setValue - Function from `react-hook-form` to set form values.
 * @param {object} props.errors - Object containing validation errors for form fields.
 * @param {object} props.chat - The current chat object containing existing settings.
 * @param {React.RefObject<HTMLInputElement>} props.fileInputRef - Ref for the file input element.
 * @param {string | null} props.avatarPreview - URL or data URI for the avatar preview image.
 * @param {string} props.mode - The mode of the form, either 'create' or 'edit'.
 * @param {function} props.setAvatarPreview - Function to update the avatar preview state.
 * @param {boolean} props.isCreating - Indicates if a chat is being created.
 * @param {boolean} props.isUpdating - Indicates if a chat is being updated.
 *
 * @returns {JSX.Element} The rendered chat settings form component.
 */
export default function ChatSettingsForm({
  handleSubmit,
  handleAvatarClick,
  onSubmit,
  register,
  watch,
  setValue,
  errors,
  chat,
  fileInputRef,
  avatarPreview,
  mode,
  setAvatarPreview,
  isCreating,
  isUpdating,
}: ChatSettingsFormProps) {
  const isPending = mode === 'create' ? isCreating : isUpdating;
  return (
    <ScrollArea className="flex-1 overflow-auto">
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
                <p className="text-red-500 text-sm">{errors.context.message}</p>
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
                defaultValue={chat?.temperature ? [chat.temperature] : [0.75]}
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
                  Die Temperatur beeinflusst die Kreativität der Antworten. Ein
                  höherer Wert führt zu kreativeren, aber weniger vorhersehbaren
                  Antworten, während ein niedrigerer Wert zu präziseren und
                  fokussierteren Antworten führt.
                </span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className="grid grid-cols-2 gap-4">
            <Button type="reset" className="bg-gray-400" disabled={isPending}>
              Zurücksetzen
            </Button>
            <Button type="submit" className="bg-primary" disabled={isPending}>
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
  );
}
