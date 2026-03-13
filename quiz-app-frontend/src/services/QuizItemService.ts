import api from "../api/axios";
import type { QuestionPayload } from "../types/quizItem";
import type { QuizReturnPayload } from "../types/quiz";

const QuizItemService = {
  async store(
    quizId: number,
    questions: QuestionPayload[],
  ): Promise<QuizReturnPayload> {
    try {
      const { data } = await api.post<QuizReturnPayload>(
        `/api/quizzes/${quizId}/items`,
        questions,
      );
      return data;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: apiErr?.response?.data?.message ?? "Failed to save questions.",
      };
    }
  },

  async getAll(quizId: number): Promise<QuizReturnPayload> {
    try {
      const { data } = await api.get<QuizReturnPayload>(
        `/api/quizzes/${quizId}/items`,
      );
      return data;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message:
          apiErr?.response?.data?.message ?? "Failed to retrieve questions.",
        quizData: [],
      };
    }
  },
};

export default QuizItemService;
