export type QuizStatus = "draft" | "published" | "closed";

export type QuestionType = "multiple_choice" | "identification" | "essay";

export interface Quiz {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: QuizStatus;
  token: string;
  quiz_items_count?: number;
  created_at: string;
  updated_at: string;
}

export interface QuizReturnPayload {
  success: boolean;
  message: string;
  quizData?: Quiz;
}

export interface QuizListReturnPayload {
  success: boolean;
  message: string;
  quizData?: Quiz[];
}

export interface CreateQuizPayload {
  title: string;
  description?: string;
  status?: QuizStatus;
}

export interface UpdateQuizPayload extends Partial<CreateQuizPayload> {}
