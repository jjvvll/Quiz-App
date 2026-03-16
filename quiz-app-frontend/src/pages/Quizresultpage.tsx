import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { Result } from "../types/response";

interface LocationState {
  result: Result;
  quizTitle: string;
  respondentName: string;
}

export default function QuizResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useParams();
  const state = location.state as LocationState | null;

  if (!state?.result) {
    navigate(`/quiz/${token}`, { replace: true });
    return null;
  }

  const { result, quizTitle, respondentName } = state;
  const passed = result.percentage >= 50;

  const getGrade = (percentage: number) => {
    if (percentage >= 90)
      return { label: "Excellent", color: "text-green-400" };
    if (percentage >= 75) return { label: "Good", color: "text-amber-400" };
    if (percentage >= 50)
      return { label: "Passed", color: "text-amber-400/70" };
    return { label: "Needs improvement", color: "text-red-400" };
  };

  const grade = getGrade(result.percentage);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-4xl ${passed ? "bg-green-400/10" : "bg-red-400/10"}`}
          >
            {passed ? "🎉" : "📋"}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {passed ? "Well done!" : "Quiz complete"}
          </h1>
          <p className="text-white/40 text-sm">{quizTitle}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-4">
          <div className="text-center mb-5">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
              Your score
            </p>
            <p className="text-6xl font-bold text-white mb-1">
              {result.percentage.toFixed(0)}%
            </p>
            <p className={`text-sm font-medium ${grade.color}`}>
              {grade.label}
            </p>
          </div>

          <div className="h-2 rounded-full bg-white/10 mb-5">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${passed ? "bg-gradient-to-r from-amber-400 to-green-400" : "bg-gradient-to-r from-red-500 to-amber-400"}`}
              style={{ width: `${result.percentage}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-white/5">
              <p className="text-white text-lg font-bold">{result.score}</p>
              <p className="text-white/40 text-xs mt-0.5">Points</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5">
              <p className="text-white text-lg font-bold">
                {result.total_points}
              </p>
              <p className="text-white/40 text-xs mt-0.5">Total</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5">
              <p className={`text-lg font-bold ${grade.color}`}>
                {result.percentage.toFixed(0)}%
              </p>
              <p className="text-white/40 text-xs mt-0.5">Score</p>
            </div>
          </div>
        </div>

        <p className="text-white/20 text-xs text-center mb-6">
          Submitted by <span className="text-white/40">{respondentName}</span>
        </p>

        <div className="grid gap-3">
          <button
            onClick={() => navigate(`/quiz/${token}`)}
            className="w-full py-3 rounded-xl text-sm font-medium text-zinc-950 border-none cursor-pointer bg-gradient-to-br from-amber-400 to-red-500 hover:opacity-90 transition-opacity"
          >
            Retake Quiz
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-xl text-sm text-white/40 border border-white/10 bg-transparent cursor-pointer hover:text-white/60 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
