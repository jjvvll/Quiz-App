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
  quizData: Quiz[];
  quizzesLoading: boolean;
  appendQuiz: (newQuizz: Quiz[]) => void;
  updateQuiz: (newQuizz: Quiz) => void;
  removeQuiz: (id: number) => void;
  checkAuth: () => Promise<boolean>;
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
  const [quizzesLoading, setQuizzesLoading] = useState(true);

  const [quizData, setQuizzes] = useState<Quiz[]>([]);

  const checkAuth = async () => {
    setQuizzesLoading(true);
    try {
      const userData = await AuthService.getUser();
      setUser(userData);
      return true;
    } catch (error) {
      setUser(null);
      return false;
    } finally {
      setQuizzesLoading(false);
    }
  };

  const getQuizzes = async (): Promise<void> => {
    setQuizzesLoading(true);
    try {
      const response = await QuizService.getAll();
      setQuizzes((response.quizData ?? []).filter(Boolean)); //ensures no undefined elements sneak into your array. Useful if backend could send null items accidentally.
    } catch (error) {
      console.error(error);
      setQuizzes([]);
    } finally {
      setQuizzesLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const authenticated = await checkAuth();
      if (authenticated) await getQuizzes();
    };
    init();
  }, []);

  const appendQuiz = (newQuizz: Quiz | Quiz[]) => {
    const items = Array.isArray(newQuizz) ? newQuizz : [newQuizz];
    setQuizzes((prev) => [...items, ...prev]);
  };

  const updateQuiz = (updated: Quiz) => {
    setQuizzes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
  };

  const removeQuiz = (id: number) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const { user } = await AuthService.login(credentials);
    setUser(user);
    await getQuizzes(); //get quizzes right after login
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
        quizzesLoading,
        appendQuiz,
        updateQuiz,
        removeQuiz,
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
