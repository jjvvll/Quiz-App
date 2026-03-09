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

  async logout(): Promise<void> {
    await api.post("/api/auth/logout");
  },

  async getUser(): Promise<User> {
    const { data } = await api.get<User>("/api/user");
    return data;
  },
};

export default AuthService;
