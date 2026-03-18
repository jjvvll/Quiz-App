export interface QuizResponseAnswer {
  id: number;
  quiz_item_id: number;
  answer: string | null;
  is_correct: boolean | null;
  points_awarded: number;
  time_taken: number | null;
  quiz_item: {
    question: string;
    type: string;
    points: number;
    answer: string | null;
  };
}

export interface QuizResponse {
  id: number;
  respondent_name: string;
  respondent_email: string | null;
  score: number;
  total_points: number;
  percentage: number;
  time_taken: number | null;
  status: string;
  created_at: string;
  response_answers: QuizResponseAnswer[];
}

export interface QuizResponseListPayload {
  success: boolean;
  message: string;
  responses?: QuizResponse[];
}

export interface QuizResponsePayload {
  success: boolean;
  message: string;
  response?: QuizResponse;
}
