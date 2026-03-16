import type { QuestionType } from "./quiz";

export interface QuizItem {
  id: number;
  question: string;
  type: QuestionType;
  options: string[] | null;
  points: number;
  time_limit: number | null;
  order: number;
}

export interface QuizData {
  id: number;
  title: string;
  description: string | null;
  items: QuizItem[];
}

export interface ResponsePayload {
  success: boolean;
  message: string;
  quizData?: QuizData;
}

export interface Result {
  score: number;
  total_points: number;
  percentage: number;
}

export interface ResultPayload {
  success: boolean;
  message: string;
  result?: Result;
}

export interface Answer {
  quiz_item_id: number;
  answer: string;
  time_taken: number;
}

export interface Response {
  respondent_name: string;
  respondent_email: string | null;
  time_taken: number;
  answers: Answer[];
}
