import api from "../api/axios";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../types/auth";

const AuthService = {
  async getCsrfCookie(): Promise<void> {
    await api.get("/sanctum/csrf-cookie");
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await this.getCsrfCookie();
    const { data } = await api.post<AuthResponse>(
      "/api/auth/login",
      credentials,
    );
    return data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    await this.getCsrfCookie();
    const { data } = await api.post<AuthResponse>(
      "/api/auth/register",
      credentials,
    );
    return data;
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post("/api/auth/logout");
    return data;
  },

  async getUser(): Promise<{ success: boolean; user: User }> {
    const { data } = await api.get<{ success: boolean; user: User }>(
      "/api/user",
    );
    return data;
  },
};

export default AuthService;
