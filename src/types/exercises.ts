export type QuestionType =
  | "multiple_choice"
  | "multiple_select"
  | "true_false"
  | "numeric_input"
  | "text_input"
  | "fill_blank"
  | "ordering"
  | "matching";

export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  options?: string[];
  correctAnswer?: unknown;
  explanation?: string;
  hints?: string[];
  points?: number;
}
