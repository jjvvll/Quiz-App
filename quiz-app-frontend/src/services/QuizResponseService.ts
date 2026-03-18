// QuizResponseService.ts
import api from "../api/axios";
import type {
  QuizResponseListPayload,
  QuizResponsePayload,
} from "../types/quizResponse";

const QuizResponseService = {
  async getAll(quizId: number): Promise<QuizResponseListPayload> {
    try {
      const { data } = await api.get<QuizResponseListPayload>(
        `/api/quizzes/${quizId}/responses`,
      );
      return data;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message:
          apiErr?.response?.data?.message ?? "Failed to retrieve responses.",
      };
    }
  },

  async getOne(
    quizId: number,
    responseId: number,
  ): Promise<QuizResponsePayload> {
    try {
      const { data } = await api.get<QuizResponsePayload>(
        `/api/quizzes/${quizId}/responses/${responseId}`,
      );
      return data;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message:
          apiErr?.response?.data?.message ?? "Failed to retrieve response.",
      };
    }
  },
};

export default QuizResponseService;
