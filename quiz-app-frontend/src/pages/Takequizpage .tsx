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

  // stores remaining time per question id
  const [timers, setTimers] = useState<Record<number, number>>({});

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
      // if no saved time for this question yet, use the full time limit
      const initialTime =
        timers[currentQuestion.id] ?? currentQuestion.time_limit;
      setTimeLeft(initialTime);

      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t === null) return null;
          if (t <= 1) {
            clearInterval(timerRef.current!);
            // save 0 for this question so if they come back it stays at 0
            setTimers((prev) => ({ ...prev, [currentQuestion.id]: 0 }));
            goNext();
            return 0;
          }
          // save the current remaining time so it persists when navigating away
          setTimers((prev) => ({ ...prev, [currentQuestion.id]: t - 1 }));
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
      {/* Progress bar */}
      <div className="h-1 bg-white/5 flex-shrink-0">
        <div
          className="h-1 bg-gradient-to-r from-amber-400 to-red-500 transition-all duration-500"
          style={{
            width: `${((currentIndex + 1) / quiz.items.length) * 100}%`,
          }}
        />
      </div>

      {/* Full screen question area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 md:px-12 py-4 md:py-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-white/20 text-xs md:text-sm">
              {currentIndex + 1}
              <span className="text-white/10"> / {quiz.items.length}</span>
            </span>
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
          <span className="text-white/20 text-xs md:text-sm">
            {currentQuestion.points} pt{currentQuestion.points !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 md:mx-12 mb-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex-shrink-0">
            {error}
          </div>
        )}

        {/* Timer */}
        {timeLeft !== null && (
          <div className="px-4 md:px-12 mb-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/40">Time remaining</span>
              <span
                className={`text-sm font-medium tabular-nums ${timerPercent <= 25 ? "text-red-400" : "text-white/60"}`}
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

        {/* Question + answer — centered vertically */}
        <div className="flex-1 flex flex-col justify-center px-4 md:px-12 lg:px-24 xl:px-40 py-6">
          <p className="text-white text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed mb-8 md:mb-10">
            {currentQuestion.question}
          </p>

          {/* Multiple choice */}
          {currentQuestion.type === "multiple_choice" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(currentQuestion.options ?? []).map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentAnswer(opt)}
                  className={`w-full text-left px-5 py-4 rounded-2xl text-sm md:text-base border cursor-pointer transition-all ${
                    currentAnswer === opt
                      ? "border-amber-400/50 bg-amber-400/10 text-white"
                      : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <span className="text-white/30 mr-3 text-xs font-medium">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Identification */}
          {currentQuestion.type === "identification" && (
            <input
              type="text"
              placeholder="Type your answer..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (isLast ? handleSubmit() : goNext())
              }
              className="w-full md:max-w-lg px-5 py-4 rounded-2xl text-white text-sm md:text-base border border-white/10 bg-white/5 focus:border-amber-400/50 focus:outline-none placeholder:text-white/20 transition-colors"
            />
          )}

          {/* Essay */}
          {currentQuestion.type === "essay" && (
            <textarea
              rows={6}
              placeholder="Write your answer..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="w-full md:max-w-2xl px-5 py-4 rounded-2xl text-white text-sm md:text-base border border-white/10 bg-white/5 resize-none focus:border-amber-400/50 focus:outline-none placeholder:text-white/20 transition-colors"
            />
          )}
        </div>

        {/* Bottom nav — always pinned to bottom */}
        <div className="flex-shrink-0 px-4 md:px-12 lg:px-24 xl:px-40 py-4 md:py-6 border-t border-white/5">
          <div className="flex gap-3 max-w-2xl">
            {currentIndex > 0 && (
              <button
                onClick={() => {
                  saveAnswer();
                  setCurrentIndex((i) => i - 1);
                  setQuestionStartTime(Date.now());
                }}
                className="px-6 py-3 rounded-xl text-sm text-white/40 border border-white/10 bg-transparent cursor-pointer hover:text-white/60 transition-colors"
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
    </div>
  );
}
