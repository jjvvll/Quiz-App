import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import QuestionBuilder from "./pages/QuizBuilder";
import QuizRegisterPage from "./pages/Quizregisterpage ";
import TakeQuizPage from "./pages/Takequizpage ";
import QuizResultPage from "./pages/Quizresultpage";
import QuizResponsesPage from "./pages/QuizResponsesPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Guest-only routes (redirect to /home if already logged in) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          {/* <Route path="/register" element={<RegisterPage />} /> */}
        </Route>

        {/* Protected routes (redirect to /login if not authenticated) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePage />} />
          {/* Future routes: */}
          {/* <Route path="/quiz/:id" element={<QuizPage />} /> */}
          {/* <Route path="/results" element={<ResultsPage />} /> */}
        </Route>

        <Route path="/quiz/:quizId/questions" element={<QuestionBuilder />} />

        <Route path="/quiz/:token" element={<QuizRegisterPage />} />
        <Route path="/quiz/:token/take" element={<TakeQuizPage />} />
        <Route path="/quiz/:token/result" element={<QuizResultPage />} />

        <Route path="/quiz/:quizId/responses" element={<QuizResponsesPage />} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
