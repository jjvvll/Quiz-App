import { createContext, useContext, useEffect, useState } from "react";
import AuthService from "../services/AuthService";
import type { ReactNode } from "react";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth";
import QuizService from "../services/QuizService";
import type { Quiz } from "../types/quiz";

interface AuthContextValue {
  user: User | null;
  quizData: Quiz;
  loading: boolean;
  appendQuiz: (newQuizz: Quiz[]) => void;
  checkAuth: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

interface Props {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quizData, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    checkAuth();
    getQuizzes();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await AuthService.getUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const getQuizzes = async (): Promise<void> => {
    try {
      const response = await QuizService.getAll();
      setQuizzes((response.quizData ?? []).filter(Boolean)); //ensures no undefined elements sneak into your array. Useful if backend could send null items accidentally.
    } catch (error) {
      console.error(error);
      setQuizzes([]);
    }
  };

  const appendQuiz = (newQuizz: Quiz) => {
    console.log("appendQuiz called with", newQuizz);
    setQuizzes((prev) => [newQuizz, ...prev]);
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const { user } = await AuthService.login(credentials);
    setUser(user);
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    const { user } = await AuthService.register(credentials);
    setUser(user);
  };

  const logout = async (): Promise<void> => {
    await AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        quizData,
        loading,
        appendQuiz,
        checkAuth,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
