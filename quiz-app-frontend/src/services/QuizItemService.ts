import api from "../api/axios";
import type {
  QuestionItem,
  QuizItemListReturnPayload,
} from "../types/quizItem";

const QuizItemService = {
  async store(
    quizId: number,
    questions: QuestionItem[],
  ): Promise<QuizItemListReturnPayload> {
    try {
      const { data } = await api.post<QuizItemListReturnPayload>(
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

  async getAll(quizId: number): Promise<QuizItemListReturnPayload> {
    try {
      const { data } = await api.get<QuizItemListReturnPayload>(
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
