import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import QuizService from "../services/QuizService";
import type { Quiz } from "../types/quiz";
import QuizModal from "../components/QuizModal";

export default function HomePage() {
  const { quizData, quizzesLoading, removeQuiz, user, logout } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const [editQuiz, setEditQuiz] = useState<Quiz | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setQuizzes(quizData);
  }, [quizData]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const response = await QuizService.delete(deleteId);
      if (!response.success) {
        console.error(response.message);
        return;
      }
      removeQuiz(deleteId);
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  const stats = {
    total: quizzes.length,
    published: quizzes.filter((q) => q.status === "published").length,
    drafts: quizzes.filter((q) => q.status === "draft").length,
  };

  return (
    <>
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
        {/* Nav */}
        <nav className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 border-b border-white/5 sticky top-0 z-40 bg-zinc-950">
          <a href="/home" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center text-sm md:text-base flex-shrink-0 bg-gradient-to-br from-amber-400 to-red-500">
              ⚡
            </div>
            <span className="text-white text-base md:text-lg font-bold">
              QuizApp
            </span>
          </a>

          {/* Desktop nav right */}
          <div className="hidden md:flex items-center gap-4">
            {user && <span className="text-sm text-white/40">{user.name}</span>}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-white/40 border border-white/10 rounded-lg bg-transparent cursor-pointer transition-all hover:text-red-400 hover:border-red-500/30"
            >
              Sign out
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1 p-2 bg-transparent border-none cursor-pointer"
          >
            <span
              className={`block w-5 h-0.5 bg-white/50 transition-all ${menuOpen ? "rotate-45 translate-x-0.5 translate-y-0.5" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-white/50 transition-all ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-white/50 transition-all ${menuOpen ? "-rotate-45 translate-x-0.5 -translate-y-0.5" : ""}`}
            />
          </button>
        </nav>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden border-b border-white/5 px-4 py-3 flex flex-col gap-3 bg-zinc-900">
            {user && <p className="text-sm text-white/40">{user.name}</p>}
            <button
              onClick={handleLogout}
              className="w-full py-2.5 text-sm text-red-400/80 border border-red-500/20 rounded-lg bg-transparent cursor-pointer text-left px-4"
            >
              Sign out
            </button>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 px-4 md:px-8 py-6 md:py-10 w-full max-w-6xl mx-auto">
          {/* Header row */}
          <div className="flex items-start justify-between mb-6 md:mb-10 gap-4">
            <div>
              <p className="text-white/40 text-xs md:text-sm mb-0.5 md:mb-1">
                Good to see you,
              </p>
              <h1 className="text-white text-2xl md:text-3xl font-bold">
                {user?.name}
              </h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-zinc-950 text-xs md:text-sm font-medium border-none cursor-pointer transition-all duration-200 flex-shrink-0 bg-gradient-to-br from-amber-400 to-red-500 hover:opacity-90 hover:-translate-y-px"
            >
              <span className="text-base md:text-lg leading-none">+</span>
              <span className="hidden sm:inline">Add Quiz</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-10">
            <div className="rounded-xl md:rounded-2xl p-3 md:p-5 border border-white/10 bg-amber-400/10">
              <p className="text-xs uppercase tracking-wider md:tracking-widest font-medium mb-2 md:mb-3 truncate text-amber-400">
                <span className="hidden sm:inline">Total Quizzes</span>
                <span className="sm:hidden">Total</span>
              </p>
              <p className="text-2xl md:text-4xl font-bold text-white">
                {stats.total}
              </p>
            </div>
            <div className="rounded-xl md:rounded-2xl p-3 md:p-5 border border-white/10 bg-green-400/10">
              <p className="text-xs uppercase tracking-wider md:tracking-widest font-medium mb-2 md:mb-3 truncate text-green-400">
                <span className="hidden sm:inline">Published</span>
                <span className="sm:hidden">Published</span>
              </p>
              <p className="text-2xl md:text-4xl font-bold text-white">
                {stats.published}
              </p>
            </div>
            <div className="rounded-xl md:rounded-2xl p-3 md:p-5 border border-white/10 bg-white/5">
              <p className="text-xs uppercase tracking-wider md:tracking-widest font-medium mb-2 md:mb-3 truncate text-white/40">
                <span className="hidden sm:inline">Drafts</span>
                <span className="sm:hidden">Drafts</span>
              </p>
              <p className="text-2xl md:text-4xl font-bold text-white">
                {stats.drafts}
              </p>
            </div>
          </div>

          {/* Quizzes list */}
          <div>
            <h2 className="text-white/60 text-xs uppercase tracking-widest font-medium mb-3 md:mb-4">
              Your Quizzes
            </h2>

            {quizzesLoading ? (
              <div className="flex items-center gap-3 text-white/30 text-sm py-12 justify-center">
                <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                Loading...
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-16 md:py-20 border border-dashed border-white/10 rounded-2xl">
                <p className="text-white/20 text-3xl md:text-4xl mb-3 md:mb-4">
                  📋
                </p>
                <p className="text-white/40 text-sm px-4">
                  No quizzes yet. Create your first one!
                </p>
              </div>
            ) : (
              <div className="grid gap-2 md:gap-3">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    onClick={() => navigate(`/quiz/${quiz.id}/questions`)}
                    className="flex items-center justify-between px-3 md:px-5 py-3 md:py-4 rounded-xl border border-white/10 transition-all duration-200 cursor-pointer gap-3 bg-white/[0.02] hover:border-amber-400/20 hover:bg-white/[0.04]"
                  >
                    {/* Left */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-white/5 flex items-center justify-center text-sm flex-shrink-0">
                        📝
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {quiz.title}
                        </p>
                        {quiz.description && (
                          <p className="text-white/35 text-xs mt-0.5 truncate hidden sm:block">
                            {quiz.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                      <span
                        className={`px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-xs font-medium capitalize ${
                          quiz.status === "published"
                            ? "bg-green-400/10 text-green-400"
                            : "bg-white/10 text-white/40"
                        }`}
                      >
                        {quiz.status}
                      </span>
                      <span className="text-white/20 text-xs hidden sm:block">
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(quiz.id);
                        }}
                        className="px-2 py-1 text-xs text-red-400/60 border border-red-500/20 rounded-lg bg-transparent cursor-pointer hover:text-red-400 hover:border-red-500/40 transition-all"
                      >
                        Delete
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditQuiz(quiz);
                          setShowModal(true);
                        }}
                        className="px-2 py-1 text-xs text-amber-400/60 border border-amber-400/20 rounded-lg bg-transparent cursor-pointer hover:text-amber-400 hover:border-amber-400/40 transition-all"
                      >
                        Edit
                      </button>
                      {quiz.status === "published" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/quiz/${quiz.token}`);
                          }}
                          className="px-2 py-1 text-xs text-blue-400/60 border border-blue-400/20 rounded-lg bg-transparent cursor-pointer hover:text-blue-400 hover:border-blue-400/40 transition-all"
                        >
                          Take
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/quiz/${quiz.id}/responses`);
                        }}
                        className="px-2 py-1 text-xs text-white/40 border border-white/10 rounded-lg bg-transparent cursor-pointer hover:text-white/60 hover:border-white/20 transition-all"
                      >
                        Responses
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Quiz Modal */}
      {showModal && (
        <QuizModal
          changeModalStatus={(status) => {
            setShowModal(status);
            if (!status) setEditQuiz(null); // clear edit state when modal closes
          }}
          quiz={editQuiz ?? undefined}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setDeleteId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/10 p-6 bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mx-auto mb-4">
              <span className="text-red-400 text-xl">🗑️</span>
            </div>
            <h2 className="text-white text-lg font-bold text-center mb-2">
              Delete Quiz
            </h2>
            <p className="text-white/40 text-sm text-center mb-6">
              Are you sure you want to delete this quiz? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-xl text-sm text-white/40 border border-white/10 bg-transparent cursor-pointer hover:text-white/60 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-white border-none cursor-pointer bg-red-500 hover:bg-red-600 transition-colors"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
