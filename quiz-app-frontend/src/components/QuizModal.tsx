import QuizService from "../services/QuizService";
import { useEffect, useState } from "react";
import type { Quiz, CreateQuizPayload } from "../types/quiz";
import { useAuth } from "../context/AuthContext";

interface QuizModalProps {
  changeModalStatus: (status: boolean) => void;
  quiz?: Quiz;
}

export default function QuizModal({ changeModalStatus, quiz }: QuizModalProps) {
  const { appendQuiz, updateQuiz } = useAuth();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);

  const isEditing = !!quiz;

  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateQuizPayload>({
    title: "",
    description: "",
    status: "draft",
  });

  useEffect(() => {
    if (quiz) {
      setForm({
        title: quiz.title,
        description: quiz.description ?? "",
        status: quiz.status,
      });
    }
  }, [quiz]);

  const resetForm = () => {
    setForm({ title: "", description: "", status: "draft" });
    setFormError(null);
  };

  const handleCreate = async () => {
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    setCreating(true);
    setFormError(null);
    try {
      const response = await QuizService.create(form);
      if (!response.success) {
        setFormError(response.message);
        return;
      }
      changeModalStatus(false);
      appendQuiz(response.quizData ?? []);
      resetForm();
      changeModalStatus(false);
    } catch (err: unknown) {
      const apiErr = err as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      const data = apiErr?.response?.data;

      if (data?.errors) {
        // validation error — show the first error message
        const first = Object.values(data.errors)[0]?.[0];
        setFormError(first ?? "Validation failed.");
      } else {
        setFormError(
          data?.message ?? "Failed to create quiz. Please try again.",
        );
      }
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async () => {
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    setEditing(true);
    setFormError(null);
    try {
      const response = await QuizService.update(quiz!.id, form);
      if (!response.success) {
        setFormError(response.message);
        return;
      }
      updateQuiz(response.quizData as Quiz);
      resetForm();
      changeModalStatus(false);
    } catch (err: unknown) {
      const apiErr = err as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      const data = apiErr?.response?.data;

      if (data?.errors) {
        // validation error — show the first error message
        const first = Object.values(data.errors)[0]?.[0];
        setFormError(first ?? "Validation failed.");
      } else {
        setFormError(data?.message ?? "Failed to edit quiz. Please try again.");
      }
    } finally {
      setEditing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center z-50 px-0 sm:px-4 bg-black/75 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && changeModalStatus(false)}
    >
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-white/10 p-5 md:p-6 bg-zinc-900">
        {/* Mobile drag handle */}
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="flex items-center justify-between mb-5 md:mb-6">
          <h2 className="text-white text-xl font-bold">New Quiz</h2>
          <button
            onClick={() => changeModalStatus(false)}
            className="text-white/30 hover:text-white/60 text-2xl bg-transparent border-none cursor-pointer leading-none w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {formError && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
            {formError}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs uppercase tracking-widest text-white/40 font-medium mb-2">
            Title *
          </label>
          <input
            type="text"
            placeholder="e.g. World Capitals Quiz"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-white text-sm border border-white/10 bg-white/5 transition-all duration-200 focus:border-amber-400/50 focus:outline-none placeholder:text-white/20"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs uppercase tracking-widest text-white/40 font-medium mb-2">
            Description
          </label>
          <textarea
            placeholder="What's this quiz about?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-white text-sm border border-white/10 bg-white/5 resize-none transition-all duration-200 focus:border-amber-400/50 focus:outline-none placeholder:text-white/20"
          />
        </div>

        <div className="mb-5 md:mb-6">
          <label className="block text-xs uppercase tracking-widest text-white/40 font-medium mb-2">
            Status
          </label>
          <div className="flex gap-2">
            {(["draft", "published"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setForm({ ...form, status: s })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border cursor-pointer transition-all duration-150 capitalize ${
                  form.status === s
                    ? "bg-amber-400/15 border-amber-400/40 text-amber-400"
                    : "bg-transparent border-white/10 text-white/30"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              resetForm();
              changeModalStatus(false);
            }}
            className="flex-1 py-3 rounded-xl text-sm text-white/40 border border-white/10 bg-transparent cursor-pointer hover:text-white/60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={isEditing ? handleEdit : handleCreate}
            disabled={creating}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-zinc-950 border-none cursor-pointer disabled:opacity-60 transition-all duration-200 bg-gradient-to-br from-amber-400 to-red-500"
          >
            {isEditing
              ? editing
                ? "Editing..."
                : "Edit Quiz"
              : creating
                ? "Creating..."
                : "Create Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}
