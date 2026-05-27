import type { AssignmentDoc } from '../models/Assignment';

export const SYSTEM_PROMPT = `You are an expert exam paper generator for K-12 schools in India.
You always reply with a single valid JSON object — no markdown fences, no commentary, no trailing text.
The JSON must match exactly the schema the user provides. Every field is required unless marked optional.
Difficulty must be one of: "Easy", "Moderate", "Challenging".
Section numbering uses letters (Section A, Section B, ...).
Group the user's requested question types into sections in the listed order. One section per question type.
Question numbering is continuous across sections, starting at 1.
Compute "maxMarks" as the sum of (count × marks) across all requested question types.
Set "timeAllowed" in minutes — a sensible value for the total marks (roughly 1.5 minutes per mark, rounded to the nearest 15).
Provide a concise correct answer in "answerKey" for every question.
Distribute difficulty across each section: roughly 50% Easy, 35% Moderate, 15% Challenging — adjust if additionalInfo says otherwise.`;

export interface PromptInput {
  assignment: Pick<AssignmentDoc, 'title' | 'dueDate' | 'questionTypes' | 'additionalInfo'>;
  sourceText?: string;
}

export function buildUserPrompt({ assignment, sourceText }: PromptInput): string {
  const totalQuestions = assignment.questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = assignment.questionTypes.reduce((s, q) => s + q.count * q.marks, 0);

  const typesBlock = assignment.questionTypes
    .map((q, i) => `${i + 1}. ${q.type} — ${q.count} question(s) × ${q.marks} mark(s) each`)
    .join('\n');

  const sourceBlock = sourceText
    ? `\nSOURCE MATERIAL (base questions on this content):\n"""\n${truncate(sourceText, 8000)}\n"""\n`
    : '';

  return `Generate a question paper with the following specification.

ASSIGNMENT TITLE: ${assignment.title}
DUE DATE: ${new Date(assignment.dueDate).toDateString()}
TOTAL QUESTIONS: ${totalQuestions}
TOTAL MARKS: ${totalMarks}

QUESTION TYPES:
${typesBlock}

ADDITIONAL INSTRUCTIONS FROM TEACHER:
${assignment.additionalInfo?.trim() || '(none)'}
${sourceBlock}
Respond with a single JSON object matching this exact TypeScript shape:

{
  "schoolName": string,        // infer or use a generic name like "Sample School"
  "subject": string,           // infer from title or source
  "className": string,         // e.g. "10th", "12th"
  "timeAllowed": number,       // minutes
  "maxMarks": number,          // must equal ${totalMarks}
  "sections": [
    {
      "title": string,         // "Section A", "Section B", ...
      "type": string,          // the question type for this section
      "instruction": string,   // e.g. "Attempt all questions. Each question carries N marks."
      "questions": [
        {
          "number": number,    // continuous across sections, starting at 1
          "text": string,
          "difficulty": "Easy" | "Moderate" | "Challenging",
          "marks": number
        }
      ]
    }
  ],
  "answerKey": [
    { "number": number, "answer": string }
  ]
}

Return ONLY the JSON object. No prose.`;
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '\n...[truncated]';
}
