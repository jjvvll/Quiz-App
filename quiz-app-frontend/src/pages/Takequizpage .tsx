import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ResponseService from "../services/ResponseService";
import type { QuizData, Answer } from "../types/response";

interface LocationState {
  name: string;
  email: string;
  quiz: QuizData;
}

export default function TakeQuizPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [quiz] = useState<QuizData | null>(state?.quiz ?? null);
  const name = state?.name ?? "";
  const email = state?.email ?? "";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(
    Date.now(),
  );
  const [totalStartTime] = useState<number>(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!state?.quiz) {
      navigate(`/quiz/${token}`, { replace: true });
    }
  }, []);

  const currentQuestion = quiz?.items[currentIndex];

  const saveAnswer = useCallback(() => {
    if (!currentQuestion) return;
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    setAnswers((prev) => {
      const existing = prev.findIndex(
        (a) => a.quiz_item_id === currentQuestion.id,
      );
      const updated = {
        quiz_item_id: currentQuestion.id,
        answer: currentAnswer,
        time_taken: timeTaken,
      };
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = updated;
        return next;
      }
      return [...prev, updated];
    });
  }, [currentQuestion, currentAnswer, questionStartTime]);

  const goNext = useCallback(() => {
    saveAnswer();
    if (!quiz) return;
    if (currentIndex < quiz.items.length - 1) {
      setCurrentIndex((i) => i + 1);
      setCurrentAnswer("");
      setQuestionStartTime(Date.now());
    }
  }, [saveAnswer, quiz, currentIndex]);

  useEffect(() => {
    if (!currentQuestion) return;
    if (timerRef.current) clearInterval(timerRef.current);

    if (currentQuestion.time_limit) {
      setTimeLeft(currentQuestion.time_limit);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t === null) return null;
          if (t <= 1) {
            clearInterval(timerRef.current!);
            goNext();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(null);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex]);

  useEffect(() => {
    if (!currentQuestion) return;
    const saved = answers.find((a) => a.quiz_item_id === currentQuestion.id);
    setCurrentAnswer(saved?.answer ?? "");
  }, [currentIndex]);

  const handleSubmit = async () => {
    saveAnswer();
    setSubmitting(true);
    try {
      const totalTimeTaken = Math.floor((Date.now() - totalStartTime) / 1000);
      const finalAnswers = [...answers];
      if (currentQuestion) {
        const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
        const existing = finalAnswers.findIndex(
          (a) => a.quiz_item_id === currentQuestion.id,
        );
        const updated = {
          quiz_item_id: currentQuestion.id,
          answer: currentAnswer,
          time_taken: timeTaken,
        };
        if (existing >= 0) finalAnswers[existing] = updated;
        else finalAnswers.push(updated);
      }

      const response = await ResponseService.store(token!, {
        respondent_name: name,
        respondent_email: email || null,
        time_taken: totalTimeTaken,
        answers: finalAnswers,
      });

      if (!response.success) {
        setError(response.message);
        return;
      }

      navigate(`/quiz/${token}/result`, {
        state: {
          result: response.result,
          quizTitle: quiz?.title,
          respondentName: name,
        },
      });
    } catch {
      setError("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s: number) => {
    if (s >= 60)
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    return `${s}s`;
  };

  const timerPercent = currentQuestion?.time_limit
    ? ((timeLeft ?? 0) / currentQuestion.time_limit) * 100
    : 100;

  const timerColor =
    timerPercent > 50
      ? "bg-green-400"
      : timerPercent > 25
        ? "bg-amber-400"
        : "bg-red-400";

  if (!quiz || !currentQuestion) return null;

  const isLast = currentIndex === quiz.items.length - 1;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col">
      <div className="h-1 bg-white/5">
        <div
          className="h-1 bg-gradient-to-r from-amber-400 to-red-500 transition-all duration-500"
          style={{
            width: `${((currentIndex + 1) / quiz.items.length) * 100}%`,
          }}
        />
      </div>

      <div className="flex-1 flex flex-col px-4 md:px-8 py-6 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <span className="text-white/30 text-xs">
            {currentIndex + 1} / {quiz.items.length}
          </span>
          <span className="text-white/30 text-xs">
            {currentQuestion.points} pt{currentQuestion.points !== 1 ? "s" : ""}
          </span>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {timeLeft !== null && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/40">Time remaining</span>
              <span
                className={`text-sm font-medium ${timerPercent <= 25 ? "text-red-400" : "text-white/60"}`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10">
              <div
                className={`h-1.5 rounded-full transition-all duration-1000 ${timerColor}`}
                style={{ width: `${timerPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1">
          <div className="mb-2">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                currentQuestion.type === "multiple_choice"
                  ? "bg-violet-400/10 text-violet-400"
                  : currentQuestion.type === "identification"
                    ? "bg-amber-400/10 text-amber-400"
                    : "bg-green-400/10 text-green-400"
              }`}
            >
              {currentQuestion.type.replace("_", " ")}
            </span>
          </div>

          <p className="text-white text-lg font-medium leading-relaxed mb-6">
            {currentQuestion.question}
          </p>

          {currentQuestion.type === "multiple_choice" && (
            <div className="grid gap-2">
              {(currentQuestion.options ?? []).map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentAnswer(opt)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm border cursor-pointer transition-all ${
                    currentAnswer === opt
                      ? "border-amber-400/50 bg-amber-400/10 text-white"
                      : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span className="text-white/30 mr-3 text-xs">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === "identification" && (
            <input
              type="text"
              placeholder="Type your answer..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (isLast ? handleSubmit() : goNext())
              }
              className="w-full px-4 py-3 rounded-xl text-white text-sm border border-white/10 bg-white/5 focus:border-amber-400/50 focus:outline-none placeholder:text-white/20 transition-colors"
            />
          )}

          {currentQuestion.type === "essay" && (
            <textarea
              rows={5}
              placeholder="Write your answer..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-white text-sm border border-white/10 bg-white/5 resize-none focus:border-amber-400/50 focus:outline-none placeholder:text-white/20 transition-colors"
            />
          )}
        </div>

        <div className="flex gap-3 mt-6">
          {currentIndex > 0 && (
            <button
              onClick={() => {
                saveAnswer();
                setCurrentIndex((i) => i - 1);
                setQuestionStartTime(Date.now());
              }}
              className="px-5 py-3 rounded-xl text-sm text-white/40 border border-white/10 bg-transparent cursor-pointer hover:text-white/60 transition-colors"
            >
              ← Back
            </button>
          )}
          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-zinc-950 border-none cursor-pointer disabled:opacity-60 transition-all bg-gradient-to-br from-amber-400 to-red-500 hover:opacity-90"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          ) : (
            <button
              onClick={goNext}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-white border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
