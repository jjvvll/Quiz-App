import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QuizItemService from "../services/QuizItemService";
import { useNavigate } from "react-router-dom";
import type { QuestionItem } from "../types/quizItem";

export type QuestionType = "multiple_choice" | "identification" | "essay";

// export interface QuestionPayload {
//   quiz_id: number;
//   question: string;
//   answer: string;
//   options: string[];
//   type: QuestionType;
//   points: number;
//   order: number;
// }

export interface QuestionDraft extends QuestionItem {
  localId: number;
}

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "Multiple choice",
  identification: "Identification",
  essay: "Essay",
};

const TYPE_COLORS: Record<QuestionType, string> = {
  multiple_choice: "bg-violet-400/10 text-violet-400",
  identification: "bg-amber-400/10 text-amber-400",
  essay: "bg-green-400/10 text-green-400",
};

let idCounter = 0;

function createQuestion(type: QuestionType, order: number): QuestionDraft {
  return {
    localId: ++idCounter,
    quiz_id: 0,
    type,
    question: "",
    answer: "",
    options: type === "multiple_choice" ? ["", ""] : [],
    points: 1,
    order,
  };
}

export default function QuestionBuilder() {
  const { quizId } = useParams();
  const parsedQuizId = parseInt(quizId ?? "0");
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const response = await QuizItemService.getAll(parsedQuizId);
      if (!response.success) {
        setError(response.message);
        return;
      }

      setQuestions(
        (response.quizData ?? []).map((item) => ({
          localId: ++idCounter,
          id: item.id,
          quiz_id: item.quiz_id,
          question: item.question,
          answer: item.answer,
          options: item.options ?? [],
          type: item.type,
          points: item.points,
          order: item.order,
        })),
      );
      setLoading(false);
    };

    if (parsedQuizId) fetchItems();
  }, [parsedQuizId]);

  const addQuestion = (type: QuestionType) => {
    setShowTypeMenu(false);
    setQuestions((prev) => [...prev, createQuestion(type, prev.length + 1)]);
  };

  const removeQuestion = (localId: number) => {
    setQuestions((prev) => {
      const filtered = prev.filter((q) => q.localId !== localId);
      return filtered.map((q, i) => ({ ...q, order: i + 1 }));
    });
  };

  const updateQuestion = (localId: number, patch: Partial<QuestionItem>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.localId === localId ? { ...q, ...patch } : q)),
    );
  };

  const addChoice = (localId: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.localId === localId ? { ...q, options: [...q.options, ""] } : q,
      ),
    );
  };

  const updateChoice = (localId: number, idx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.localId !== localId) return q;
        const options = [...q.options];
        const wasAnswer = q.answer === options[idx];
        options[idx] = value;
        return { ...q, options, answer: wasAnswer ? value : q.answer };
      }),
    );
  };

  const removeChoice = (localId: number, idx: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.localId !== localId) return q;
        const options = q.options.filter((_, i) => i !== idx);
        return {
          ...q,
          options,
          answer: q.answer === q.options[idx] ? "" : q.answer,
        };
      }),
    );
  };

  const handleSave = async () => {
    const invalid = questions.find((q) => !q.question.trim());
    if (invalid) {
      setError(`Question ${invalid.order} is missing a question text.`);
      return;
    }

    const mcInvalid = questions.find(
      (q) =>
        q.type === "multiple_choice" &&
        (!q.answer || q.options.some((o) => !o.trim())),
    );
    if (mcInvalid) {
      setError(
        `Question ${mcInvalid.order}: all choices must be filled and one selected as correct.`,
      );
      return;
    }

    const idInvalid = questions.find(
      (q) => q.type === "identification" && !q.answer.trim(),
    );
    if (idInvalid) {
      setError(
        `Question ${idInvalid.order}: identification answer is required.`,
      );
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const payload: QuestionItem[] = questions.map((q) => ({
        ...(q.id ? { id: q.id } : {}), // only include id if it exists
        quiz_id: parsedQuizId,
        question: q.question,
        answer: q.answer,
        options: q.options,
        type: q.type,
        points: q.points,
        order: q.order,
      }));

      console.log(parsedQuizId, payload);
      const response = await QuizItemService.store(parsedQuizId, payload);
      if (!response.success) {
        setError(response.message);
        return;
      }
      navigate("/home");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate("/home");

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <div className="px-4 md:px-8 py-6 md:py-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-white/40 text-xs mb-1">Quiz #{parsedQuizId}</p>
            <h1 className="text-white text-2xl font-bold">Question builder</h1>
          </div>
          <button
            onClick={() => handleCancel()}
            className="px-4 py-2 text-sm text-white/40 border border-white/10 rounded-lg bg-transparent cursor-pointer hover:text-white/60 transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center gap-3 text-white/30 text-sm py-20 justify-center">
            <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
            Loading questions...
          </div>
        ) : (
          <>
            {/* Empty state */}
            {questions.length === 0 && (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                <p className="text-white/20 text-4xl mb-4">❓</p>
                <p className="text-white/40 text-sm">
                  No questions yet. Click "Add question" to get started.
                </p>
              </div>
            )}

            {/* Questions */}
            <div className="grid gap-4">
              {questions.map((q, i) => (
                <div
                  key={q.localId}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
                >
                  {/* Card header */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs text-white/40 font-medium flex-shrink-0">
                      {i + 1}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[q.type]}`}
                    >
                      {TYPE_LABELS[q.type]}
                    </span>
                    <button
                      onClick={() => removeQuestion(q.localId)}
                      className="ml-auto text-white/20 hover:text-red-400 text-lg bg-transparent border-none cursor-pointer leading-none transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  {/* Question text */}
                  <div className="mb-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-medium mb-2">
                      Question *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Enter your question..."
                      value={q.question}
                      onChange={(e) =>
                        updateQuestion(q.localId, { question: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl text-white text-sm border border-white/10 bg-white/5 resize-none focus:border-amber-400/50 focus:outline-none placeholder:text-white/20 transition-colors"
                    />
                  </div>

                  {/* Multiple choice */}
                  {q.type === "multiple_choice" && (
                    <div className="mb-4">
                      <label className="block text-xs uppercase tracking-widest text-white/40 font-medium mb-2">
                        Choices — select the correct answer
                      </label>
                      <div className="grid gap-2">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`answer-${q.localId}`}
                              checked={q.answer === opt && opt !== ""}
                              onChange={() =>
                                updateQuestion(q.localId, { answer: opt })
                              }
                              className="accent-amber-400 flex-shrink-0 cursor-pointer"
                            />
                            <input
                              type="text"
                              placeholder={`Choice ${oi + 1}`}
                              value={opt}
                              onChange={(e) =>
                                updateChoice(q.localId, oi, e.target.value)
                              }
                              className="flex-1 px-3 py-2 rounded-lg text-white text-sm border border-white/10 bg-white/5 focus:border-amber-400/50 focus:outline-none placeholder:text-white/20 transition-colors"
                            />
                            {q.options.length > 2 && (
                              <button
                                onClick={() => removeChoice(q.localId, oi)}
                                className="text-white/20 hover:text-red-400 text-base bg-transparent border-none cursor-pointer transition-colors"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => addChoice(q.localId)}
                        className="mt-2 w-full py-2 rounded-lg text-xs text-white/30 border border-dashed border-white/10 bg-transparent cursor-pointer hover:border-amber-400/30 hover:text-amber-400/60 transition-all"
                      >
                        + Add choice
                      </button>
                    </div>
                  )}

                  {/* Identification */}
                  {q.type === "identification" && (
                    <div className="mb-4">
                      <label className="block text-xs uppercase tracking-widest text-white/40 font-medium mb-2">
                        Correct answer
                      </label>
                      <input
                        type="text"
                        placeholder="Exact answer expected..."
                        value={q.answer}
                        onChange={(e) =>
                          updateQuestion(q.localId, { answer: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl text-white text-sm border border-white/10 bg-white/5 focus:border-amber-400/50 focus:outline-none placeholder:text-white/20 transition-colors"
                      />
                    </div>
                  )}

                  {/* Essay */}
                  {q.type === "essay" && (
                    <p className="text-white/30 text-xs mb-4">
                      Essay answers are graded manually — no predefined answer
                      required.
                    </p>
                  )}

                  {/* Points */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs uppercase tracking-widest text-white/40 font-medium">
                      Points
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={q.points}
                      onChange={(e) =>
                        updateQuestion(q.localId, {
                          points: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-16 px-3 py-1.5 rounded-lg text-white text-sm border border-white/10 bg-white/5 focus:border-amber-400/50 focus:outline-none text-center transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 grid gap-3">
              {/* Add question button */}
              <div className="relative">
                <button
                  onClick={() => setShowTypeMenu((v) => !v)}
                  className="w-full py-3 rounded-xl text-sm text-white/40 border border-dashed border-white/10 bg-transparent cursor-pointer hover:border-amber-400/30 hover:text-amber-400/60 transition-all"
                >
                  + Add question
                </button>
                {showTypeMenu && (
                  <div className="absolute bottom-14 left-0 right-0 rounded-xl border border-white/10 bg-zinc-900 p-1.5 z-20 shadow-xl">
                    {(
                      [
                        "multiple_choice",
                        "identification",
                        "essay",
                      ] as QuestionType[]
                    ).map((type) => (
                      <button
                        key={type}
                        onClick={() => addQuestion(type)}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-white hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none"
                      >
                        <p className="font-medium">{TYPE_LABELS[type]}</p>
                        <p className="text-white/40 text-xs mt-0.5">
                          {type === "multiple_choice" &&
                            "Select one correct answer"}
                          {type === "identification" && "Type the exact answer"}
                          {type === "essay" && "Open-ended, manually graded"}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Save / Cancel */}
              {questions.length > 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCancel()}
                    className="flex-1 py-3 rounded-xl text-sm text-white/40 border border-white/10 bg-transparent cursor-pointer hover:text-white/60 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl text-sm font-medium text-zinc-950 border-none cursor-pointer disabled:opacity-60 transition-all bg-gradient-to-br from-amber-400 to-red-500 hover:opacity-90"
                  >
                    {saving
                      ? "Saving..."
                      : `Save ${questions.length} question${questions.length > 1 ? "s" : ""}`}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
