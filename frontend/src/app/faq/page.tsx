'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { marked } from 'marked';

const faqData = [
  {
    title: 'Was ist ein LLM?',
    description: `
        LLM steht für Large Language Model und bezieht sich auf hochleistungsfähige künstliche Intelligenz-Modelle, die auf großen Mengen von Textdaten trainiert wurden. Diese Modelle können komplexe sprachliche Aufgaben wie Textgenerierung, Übersetzung, Fragen-Antwort-Systeme und mehr ausführen. Beispiele für LLMs sind OpenAI's GPT-3 oder GPT-4.
      `,
  },
  {
    title: 'Was ist RAG?',
    description: `
        RAG steht für Retrieval-Augmented Generation. Es ist ein Ansatz zur Verbesserung der Antworten von großen Sprachmodellen, indem sie nicht nur generieren, sondern auch relevante Informationen aus einem Index abrufen. Der Prozess besteht in zwei Schritten:
        1. Abruf (Retrieval): Das System ruft relevante Dokumentabschnitte oder Informationen aus einem vorbereiteten Index ab.
        2. Generierung (Generation): Das LLM nutzt die abgerufenen Informationen, um eine präzisere und kontextbezogene Antwort zu generieren.
      `,
  },
  {
    title: 'Was ist Indexierung?',
    description: `
        Indexierung bezieht sich auf den Prozess des Vorbereitens und Organisierens von Daten in einer Struktur (Index), die es ermöglicht, diese effizient abzurufen. In der Kontext von LLMs und KI-Anwendungen dient die Indexierung dazu, große Mengen von Dokumenten oder Informationen zu strukturieren, sodass sie schnell und präzise durchsucht werden können.
      `,
  },
  {
    title: 'Was sind Prompts?',
    description: `
        Prompts sind Eingaben oder Anweisungen, die an ein Sprachmodell gesendet werden, um eine bestimmte Antwort oder Aktion zu erhalten. Ein Prompt kann eine Frage, einen Befehl oder einen Kontext sein, der das Modell darauf hinweist, welche Art von Informationen oder Aktionen erwartet wird.
      `,
  },
  {
    title: 'Was sind Parameter für LLMs?',
    description: `
        Parameter sind die internen Werte oder Gewichte, die ein LLM während seines Trainings lernt und anhand derer es Texte generiert oder Aufgaben ausführt. Ein großer Teil des Trainings eines LLMs besteht darin, diese Parameter so zu optimieren, dass das Modell präzise auf verschiedene sprachliche Aufgaben antworten kann.
      `,
  },
  {
    title: 'Wie schreibt man gute System-Prompts und Kontext?',
    description: `
        Das Schreiben guter System-Prompts und Kontext ist entscheidend für die Effektivität und Genauigkeit der Antworten eines LLMs. Hier sind einige Tipps:
        - **Klare Anweisungen**: Stellen Sie sicher, dass Ihre Prompts klar und präzise sind.
        - **Kontext bereitstellen**: Bereiten Sie genügend Kontext vor, damit das Modell die Frage oder Aufgabe verstehen kann.
        - **Spezifische Anforderungen**: Geben Sie spezifische Anforderungen oder Formate an, in denen die Antwort erwartet wird.
        - **Kürze und Prägnanz**: Halten Sie Ihre Prompts kurz und prägnant.
      `,
  },
];

export default function FAQPage() {
  return (
    <main className="flex-1 overflow-hidden flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6 text-center animate-fade-in delay-200">
          FAQ
        </h1>
        {/* <p className="text-lg text-muted-foreground mb-8 text-center animate-fade-in delay-200">
          Willkommen bei Ihrem KI-Assistenten. Starten Sie einen neuen Chat oder
          stellen Sie eine Frage, um zu beginnen.
        </p> */}

        <div className="flex flex-col justify-center mb-8 animate-fade-in delay-300">
          {faqData.map((faq, i) => (
            <Accordion key={`faq-${i}`} type="single" collapsible>
              <AccordionItem value={`item-${i}`}>
                <AccordionTrigger className="">{faq.title}</AccordionTrigger>
                <AccordionContent>
                  <div className="prose">{faq.description}</div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>

        {/* <div className="space-y-4 animate-fade-in delay-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 text-left justify-start animate-fade-in-up"
                style={{ animationDelay: `${(index + 4) * 100}ms` }}
                onClick={() => setInput(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 animate-fade-in delay-800">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Geben Sie hier Ihre Nachricht ein..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div> */}
      </div>
    </main>
  );
}
