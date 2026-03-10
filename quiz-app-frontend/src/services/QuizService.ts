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

  async update(id: number, payload: UpdateQuizPayload): Promise<Quiz> {
    const { data } = await api.put<Quiz>(`/api/quizzes/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/quizzes/${id}`);
  },
};

export default QuizService;
