export interface QuestionPayload {
  quiz_id: number;
  question: string;
  answer: string;
  options: string[];
  type: "multiple_choice" | "identification" | "essay";
  points: number;
  order: number;
}
