export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type Difficulty = 'Easy' | 'Moderate' | 'Challenging';

export interface QuestionTypeSpec {
  type: string;
  count: number;
  marks: number;
}

export interface GeneratedQuestion {
  number: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
}

export interface GeneratedSection {
  title: string;
  type: string;
  instruction: string;
  questions: GeneratedQuestion[];
}

export interface AnswerKeyEntry {
  number: number;
  answer: string;
}

export interface GeneratedOutput {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: number;
  maxMarks: number;
  sections: GeneratedSection[];
  answerKey: AnswerKeyEntry[];
}

export interface Assignment {
  _id: string;
  title: string;
  dueDate: string;
  questionTypes: QuestionTypeSpec[];
  additionalInfo?: string;
  fileUrl?: string;
  status: AssignmentStatus;
  generatedOutput?: GeneratedOutput;
  createdAt: string;
  updatedAt: string;
}
