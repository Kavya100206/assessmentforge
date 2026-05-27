import { Schema, model, Document, Types } from 'mongoose';

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

export interface AssignmentDoc extends Document {
  _id: Types.ObjectId;
  title: string;
  dueDate: Date;
  questionTypes: QuestionTypeSpec[];
  additionalInfo?: string;
  fileUrl?: string;
  status: AssignmentStatus;
  generatedOutput?: GeneratedOutput;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeSchema = new Schema<QuestionTypeSpec>(
  {
    type: { type: String, required: true },
    count: { type: Number, required: true, min: 0 },
    marks: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const GeneratedQuestionSchema = new Schema<GeneratedQuestion>(
  {
    number: { type: Number, required: true },
    text: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging'], required: true },
    marks: { type: Number, required: true },
  },
  { _id: false }
);

const GeneratedSectionSchema = new Schema<GeneratedSection>(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    instruction: { type: String, default: '' },
    questions: { type: [GeneratedQuestionSchema], default: [] },
  },
  { _id: false }
);

const AnswerKeyEntrySchema = new Schema<AnswerKeyEntry>(
  {
    number: { type: Number, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const GeneratedOutputSchema = new Schema<GeneratedOutput>(
  {
    schoolName: { type: String, default: '' },
    subject: { type: String, default: '' },
    className: { type: String, default: '' },
    timeAllowed: { type: Number, default: 0 },
    maxMarks: { type: Number, default: 0 },
    sections: { type: [GeneratedSectionSchema], default: [] },
    answerKey: { type: [AnswerKeyEntrySchema], default: [] },
  },
  { _id: false }
);

const AssignmentSchema = new Schema<AssignmentDoc>(
  {
    title: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    questionTypes: { type: [QuestionTypeSchema], default: [] },
    additionalInfo: { type: String, default: '' },
    fileUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    generatedOutput: { type: GeneratedOutputSchema },
  },
  { timestamps: true }
);

export const Assignment = model<AssignmentDoc>('Assignment', AssignmentSchema);
