import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ResponseService from "../services/ResponseService";
import type { QuizData } from "../types/response";

export default function QuizRegisterPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [registerError, setRegisterError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await ResponseService.getAll(token!);

        if (!response.success) {
          setError(response.message);
          return;
        }

        // redirect if quiz is closed
        if (response.quizData?.status === "closed") {
          navigate(`/quiz/${token}/closed`, { replace: true });
          return;
        }

        setQuiz(response.quizData!);
      } catch {
        setError("Quiz not found or no longer available.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [token]);

  const handleStart = () => {
    if (!name.trim()) {
      setRegisterError("Name is required.");
      return;
    }
    setRegisterError(null);
    navigate(`/quiz/${token}/take`, {
      state: { name, email, quiz },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/30 text-sm">
          <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
          Loading quiz...
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white/20 text-5xl mb-4">⚠️</p>
          <p className="text-white/60 text-sm">{error ?? "Quiz not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center text-xl mx-auto mb-4">
            ⚡
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-white/40 text-sm">{quiz.description}</p>
          )}
          <p className="text-white/30 text-xs mt-3">
            {quiz.items.length} question{quiz.items.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-white font-medium mb-5">Enter your details</h2>

          {registerError && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {registerError}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs uppercase tracking-widest text-white/40 font-medium mb-2">
              Name *
            </label>
            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              className="w-full px-4 py-3 rounded-xl text-white text-sm border border-white/10 bg-white/5 focus:border-amber-400/50 focus:outline-none placeholder:text-white/20 transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs uppercase tracking-widest text-white/40 font-medium mb-2">
              Email{" "}
              <span className="normal-case text-white/20">(optional)</span>
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              className="w-full px-4 py-3 rounded-xl text-white text-sm border border-white/10 bg-white/5 focus:border-amber-400/50 focus:outline-none placeholder:text-white/20 transition-colors"
            />
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3 rounded-xl text-sm font-medium text-zinc-950 border-none cursor-pointer bg-gradient-to-br from-amber-400 to-red-500 hover:opacity-90 transition-opacity"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
