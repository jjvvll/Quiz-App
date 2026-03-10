export type QuizStatus = "draft" | "published";

export interface Quiz {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: QuizStatus;
  created_at: string;
  updated_at: string;
}

export interface QuizReturnPayload {
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
