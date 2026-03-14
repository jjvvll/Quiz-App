export interface QuestionItem {
  id?: number;
  quiz_id: number;
  question: string;
  answer: string;
  options: string[];
  type: "multiple_choice" | "identification" | "essay";
  points: number;
  order: number;
}

export interface QuizItemListReturnPayload {
  success: boolean;
  message: string;
  quizData?: QuestionItem[];
}
