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
## Large Language Model (LLM)

Ein LLM ist ein hochleistungsfähiges KI-Modell, das auf großen Mengen von Textdaten trainiert wurde.

**Hauptmerkmale:**
- Textgenerierung
- Übersetzung
- Fragen-Antwort-Systeme

*Bekannte Beispiele:* OpenAI's GPT-3, GPT-4
    `,
  },
  {
    title: 'Was ist RAG?',
    description: `
## Retrieval-Augmented Generation (RAG)

RAG verbessert LLM-Antworten durch einen zweistufigen Prozess:

1. **Abruf (Retrieval)**
   - Relevante Dokumentabschnitte werden aus einem Index abgerufen
   
2. **Generierung (Generation)**
   - Das LLM generiert präzise Antworten basierend auf:
     - Abgerufenen Informationen
     - Kontextuellem Wissen
    `,
  },
  {
    title: 'Was ist Indexierung?',
    description: `
## Indexierung im KI-Kontext

Indexierung ist der Prozess der **strukturierten Datenorganisation** für effiziente Abrufe.

**Hauptzwecke:**
- Schnelle Suche
- Präzise Informationsgewinnung
- Optimierte Datenzugriffe
    `,
  },
  {
    title: 'Was sind Prompts?',
    description: `
## Prompts für KI-Modelle

Prompts sind **gezielte Eingaben** an ein Sprachmodell, die bestehen können aus:

- 📝 Fragen
- ⚡ Befehlen
- 🔍 Kontextinformationen

> Sie dienen als Leitfaden für die erwartete Ausgabe des Modells.
    `,
  },
  {
    title: 'Was sind Parameter für LLMs?',
    description: `
## Parameter in Language Models

Parameter sind die **grundlegenden Bausteine** eines LLMs:

\`\`\`
📊 Parameter = Gewichte + Einstellungen
\`\`\`

**Eigenschaften:**
- Werden während des Trainings optimiert
- Bestimmen die Modellleistung
- Ermöglichen präzise Sprachverarbeitung
    `,
  },
  {
    title: 'Wie schreibt man gute System-Prompts und Kontext?',
    description: `
## Leitfaden für effektive Prompts

### 1. Klare Anweisungen
- Präzise Formulierungen
- Eindeutige Anforderungen

### 2. Kontext bereitstellen
- Relevante Hintergrundinformationen
- Notwendige Rahmenbedingungen

### 3. Spezifische Anforderungen
- Gewünschtes Ausgabeformat
- Erwartete Detailtiefe

### 4. Best Practices
- Kurz und prägnant bleiben
- Wichtige Punkte hervorheben
- Beispiele wenn nötig
    `,
  },
  {
    title: 'Beispiel für einen exzellenten Agenten-Prompt',
    description: `
## Beispiel: Natürlicher KI-Assistent mit LlamaIndex

\`\`\`markdown
Du bist ein hilfsbereiter KI-Assistent namens Luna, der auf Deutsch kommuniziert.

VERHALTEN:
- Antworte freundlich und natürlich
- Bleibe stets höflich und professionell
- Verwende umgangssprachliche, aber präzise Formulierungen
- Gib zu, wenn du etwas nicht weißt

FÄHIGKEITEN:
- Nutze LlamaIndex Tools zur Dokumentensuche
- Verarbeite und analysiere Suchergebnisse
- Fasse Informationen klar zusammen
- Stelle Rückfragen bei Unklarheiten

KONTEXT:
- Du hast Zugriff auf eine Wissensdatenbank über [THEMA]
- Du kannst Dokumente durchsuchen und relevante Stellen zitieren
- Bei technischen Fragen verweise auf offizielle Dokumentationen

BEISPIEL-DIALOG:
Nutzer: "Kannst du mir erklären, wie Knowledge Graphs funktionieren?"
Luna: "Gerne! Lass mich kurz in der Dokumentation nachsehen, um dir eine fundierte Antwort geben zu können.
[Verwendet LlamaIndex VectorStoreIndex zur Suche...]"
\`\`\`

**Wichtige Komponenten:**
- Klare Persönlichkeit & Rolle
- Definierte Verhaltensmuster
- Konkrete Tool-Verwendung
- Spezifischer Kontext
- Realistische Dialogbeispiele
`,
  },
];

export default function FAQPage() {
  return (
    <main className="overflow-hidden overflow-y-auto container mx-auto items-center justify-center grid grid-cols-1 gap-4">
      <div className="w-full max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6 text-center animate-fade-in delay-200">
          FAQ - Frequently Asked Questions
        </h1>
        <p className="text-lg text-muted-foreground mb-8 text-center animate-fade-in delay-200">
          Willkommen bei den häufig gestellten Fragen (FAQ) zu Large Language
          Models (LLMs) und Retrieval-Augmented Generation (RAG). Hier finden
          Sie Antworten auf die häufigsten Fragen zu diesen Technologien und
          deren Anwendung.
        </p>

        <div className="flex flex-col justify-center mb-8 animate-fade-in delay-300">
          {faqData.map((faq, i) => (
            <Accordion key={`faq-${i}`} type="single" collapsible>
              <AccordionItem value={`item-${i}`}>
                <AccordionTrigger className="text-2xl font-bold uppercase">
                  {faq.title}
                </AccordionTrigger>
                <AccordionContent>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: marked(faq.description),
                    }}
                  />
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
