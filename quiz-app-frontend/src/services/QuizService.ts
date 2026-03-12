import api from "../api/axios";
import type {
  Quiz,
  QuizReturnPayload,
  CreateQuizPayload,
  UpdateQuizPayload,
} from "../types/quiz";

const QuizService = {
  async getAll(): Promise<QuizReturnPayload> {
    const { data } = await api.get<QuizReturnPayload>("/api/quizzes");
    return data;
  },

  async get(id: number): Promise<Quiz> {
    const { data } = await api.get<Quiz>(`/api/quizzes/${id}`);
    return data;
  },

  async create(payload: CreateQuizPayload): Promise<QuizReturnPayload> {
    const { data } = await api.post<QuizReturnPayload>("/api/quizzes", payload);
    return data;
  },

  async update(
    id: number,
    payload: UpdateQuizPayload,
  ): Promise<QuizReturnPayload> {
    const { data } = await api.put<QuizReturnPayload>(
      `/api/quizzes/${id}`,
      payload,
    );
    return data;
  },

  async delete(id: number): Promise<QuizReturnPayload> {
    try {
      const response = await api.delete(`/api/quizzes/${id}`);
      return { success: true, message: response.data.message };
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: apiErr?.response?.data?.message ?? "Failed to delete quiz.",
      };
    }
  },
};

export default QuizService;
