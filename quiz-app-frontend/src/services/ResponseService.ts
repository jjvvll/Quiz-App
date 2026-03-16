import api from "../api/axios";
import type {
  ResponsePayload,
  Response,
  ResultPayload,
} from "../types/response";

const ResponseService = {
  async getAll(token: string): Promise<ResponsePayload> {
    try {
      const { data } = await api.get<ResponsePayload>(
        `/api/quiz/${token}/start`,
      );
      return data;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: apiErr?.response?.data?.message ?? "Failed to retrieve Quiz.",
      };
    }
  },

  async store(token: string, payload: Response): Promise<ResultPayload> {
    try {
      const { data } = await api.post<ResultPayload>(
        `/api/quiz/${token}/submit`,
        payload,
      );
      return data;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: apiErr?.response?.data?.message ?? "Failed to save answers.",
      };
    }
  },
};

export default ResponseService;
