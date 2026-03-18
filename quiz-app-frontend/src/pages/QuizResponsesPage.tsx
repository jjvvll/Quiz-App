import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import type { QuizResponse, QuizResponseAnswer } from "../types/quizResponse";
import QuizResponseService from "../services/QuizResponseService";

export type Tab = "overview" | "graph" | "individual";

function formatTime(seconds: number | null) {
  if (!seconds) return "—";
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getGrade(percentage: number) {
  if (percentage >= 90)
    return {
      label: "Excellent",
      color: "text-green-400",
      bg: "bg-green-400/10",
    };
  if (percentage >= 75)
    return { label: "Good", color: "text-amber-400", bg: "bg-amber-400/10" };
  if (percentage >= 50)
    return {
      label: "Passed",
      color: "text-amber-400/70",
      bg: "bg-amber-400/5",
    };
  return { label: "Failed", color: "text-red-400", bg: "bg-red-400/10" };
}

export default function QuizResponsesPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const parsedQuizId = parseInt(quizId!);
  const navigate = useNavigate();

  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<QuizResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const response = await QuizResponseService.getAll(parsedQuizId);
        if (!response.success) {
          setError(response.message);
          return;
        }
        setResponses(response.responses ?? []);
      } catch {
        setError("Failed to load responses.");
      } finally {
        setLoading(false);
      }
    };
    fetchResponses();
  }, [parsedQuizId]);

  // stats
  const total = responses.length;
  const avgScore = total
    ? responses.reduce((s, r) => s + r.percentage, 0) / total
    : 0;
  const passed = responses.filter((r) => r.percentage >= 50).length;
  const avgTime = total
    ? responses.reduce((s, r) => s + (r.time_taken ?? 0), 0) / total
    : 0;
  const highest = total ? Math.max(...responses.map((r) => r.percentage)) : 0;
  const lowest = total ? Math.min(...responses.map((r) => r.percentage)) : 0;

  // score distribution for graph
  const buckets = [
    { label: "0–20%", min: 0, max: 20 },
    { label: "21–40%", min: 21, max: 40 },
    { label: "41–60%", min: 41, max: 60 },
    { label: "61–80%", min: 61, max: 80 },
    { label: "81–100%", min: 81, max: 100 },
  ].map((b) => ({
    ...b,
    count: responses.filter(
      (r) => r.percentage >= b.min && r.percentage <= b.max,
    ).length,
  }));
  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/30 text-sm">
          <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
          Loading responses...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white/20 text-5xl mb-4">⚠️</p>
          <p className="text-white/60 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Individual response detail view
  if (selectedResponse) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-sans px-4 md:px-8 py-6 max-w-3xl mx-auto">
        <button
          onClick={() => setSelectedResponse(null)}
          className="text-white/40 text-sm hover:text-white/60 transition-colors mb-6 flex items-center gap-2 bg-transparent border-none cursor-pointer"
        >
          ← Back to responses
        </button>

        {/* Respondent header */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-white font-medium text-lg">
                {selectedResponse.respondent_name}
              </p>
              {selectedResponse.respondent_email && (
                <p className="text-white/40 text-sm">
                  {selectedResponse.respondent_email}
                </p>
              )}
              <p className="text-white/20 text-xs mt-1">
                {formatDate(selectedResponse.created_at)}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-3xl font-bold text-white">
                {selectedResponse.percentage.toFixed(0)}%
              </p>
              <p className="text-white/40 text-xs">
                {selectedResponse.score} / {selectedResponse.total_points} pts
              </p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-white/10">
            <div
              className={`h-1.5 rounded-full ${selectedResponse.percentage >= 50 ? "bg-green-400" : "bg-red-400"}`}
              style={{ width: `${selectedResponse.percentage}%` }}
            />
          </div>
          <div className="flex gap-4 mt-3">
            <span className="text-white/30 text-xs">
              Time: {formatTime(selectedResponse.time_taken)}
            </span>
            <span
              className={`text-xs font-medium ${getGrade(selectedResponse.percentage).color}`}
            >
              {getGrade(selectedResponse.percentage).label}
            </span>
          </div>
        </div>

        {/* Answers */}
        <div className="grid gap-3">
          {selectedResponse.response_answers.map((ans, i) => (
            <div
              key={ans.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs text-white/40 flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm mb-2">
                    {ans.quiz_item?.question}
                  </p>

                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-white/30 text-xs flex-shrink-0 mt-0.5">
                      Answer:
                    </span>
                    <span className="text-white text-sm">
                      {ans.answer || (
                        <span className="text-white/20 italic">No answer</span>
                      )}
                    </span>
                  </div>

                  {ans.is_correct !== null && (
                    <div className="flex items-start gap-2">
                      <span className="text-white/30 text-xs flex-shrink-0 mt-0.5">
                        Correct:
                      </span>
                      <span className="text-white/60 text-sm">
                        {ans.quiz_item?.answer}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 text-right">
                  {ans.is_correct === null ? (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/40">
                      Manual
                    </span>
                  ) : ans.is_correct ? (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-400/10 text-green-400">
                      ✓ Correct
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-red-400/10 text-red-400">
                      ✗ Wrong
                    </span>
                  )}
                  <p className="text-white/30 text-xs mt-1">
                    {ans.points_awarded} / {ans.quiz_item?.points} pts
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans px-4 md:px-8 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <button
            onClick={() => navigate("/home")}
            className="text-white/40 text-xs hover:text-white/60 transition-colors mb-1 flex items-center gap-1.5 bg-transparent border-none cursor-pointer"
          >
            ← Back
          </button>
          <h1 className="text-white text-2xl font-bold">Responses</h1>
        </div>
        <span className="text-white/30 text-sm">
          {total} response{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 mb-6 w-fit">
        {(["overview", "graph", "individual"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize cursor-pointer border-none transition-all ${
              activeTab === tab
                ? "bg-white/10 text-white"
                : "bg-transparent text-white/40 hover:text-white/60"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {total === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
          <p className="text-white/20 text-4xl mb-4">📭</p>
          <p className="text-white/40 text-sm">No responses yet.</p>
        </div>
      ) : (
        <>
          {/* Overview tab */}
          {activeTab === "overview" && total > 0 && (
            <div className="grid gap-4">
              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Avg score", value: `${avgScore.toFixed(0)}%` },
                  {
                    label: "Pass rate",
                    value: `${((passed / total) * 100).toFixed(0)}%`,
                  },
                  { label: "Highest", value: `${highest.toFixed(0)}%` },
                  { label: "Avg time", value: formatTime(Math.floor(avgTime)) },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center"
                  >
                    <p className="text-white text-2xl font-bold">
                      {stat.value}
                    </p>
                    <p className="text-white/40 text-xs mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Score range */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">Score range</span>
                  <span className="text-white/40 text-xs">
                    {lowest.toFixed(0)}% — {highest.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/10 relative">
                  <div
                    className="absolute h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-green-400"
                    style={{
                      left: `${lowest}%`,
                      width: `${highest - lowest}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Graph tab */}
          {activeTab === "graph" && total > 0 && (
            <div className="grid gap-4">
              {/* Score distribution bar chart */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-6">
                  Score distribution
                </p>
                <div className="flex items-end gap-3 h-40">
                  {buckets.map((b) => (
                    <div
                      key={b.label}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <span className="text-white/40 text-xs">{b.count}</span>
                      <div
                        className="w-full flex items-end justify-center"
                        style={{ height: "100px" }}
                      >
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-amber-400/40 to-amber-400/80 transition-all"
                          style={{
                            height: `${(b.count / maxCount) * 100}%`,
                            minHeight: b.count > 0 ? "4px" : "0",
                          }}
                        />
                      </div>
                      <span className="text-white/30 text-xs text-center leading-tight">
                        {b.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pass vs fail */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-green-400/20 bg-green-400/5 p-4 text-center">
                  <p className="text-green-400 text-3xl font-bold">{passed}</p>
                  <p className="text-green-400/60 text-xs mt-1">
                    Passed (≥50%)
                  </p>
                </div>
                <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-center">
                  <p className="text-red-400 text-3xl font-bold">
                    {total - passed}
                  </p>
                  <p className="text-red-400/60 text-xs mt-1">
                    Failed (&lt;50%)
                  </p>
                </div>
              </div>

              {/* Score over time */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-4">
                  Score over time
                </p>
                <div className="flex items-end gap-1 h-24">
                  {responses
                    .slice()
                    .reverse()
                    .map((r, i) => (
                      <div
                        key={r.id}
                        title={`${r.respondent_name}: ${r.percentage.toFixed(0)}%`}
                        className={`flex-1 rounded-t cursor-pointer transition-opacity hover:opacity-80 ${r.percentage >= 50 ? "bg-green-400/60" : "bg-red-400/60"}`}
                        style={{ height: `${r.percentage}%`, minHeight: "2px" }}
                        onClick={() => {
                          setActiveTab("individual");
                          setSelectedResponse(r);
                        }}
                      />
                    ))}
                </div>
                <p className="text-white/20 text-xs mt-2">
                  Each bar = one response. Click to view.
                </p>
              </div>
            </div>
          )}

          {/* Individual tab */}
          {activeTab === "individual" && total > 0 && (
            <div className="grid gap-3">
              {responses.map((r) => {
                const grade = getGrade(r.percentage);
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedResponse(r)}
                    className="w-full text-left rounded-xl border border-white/10 bg-white/[0.02] px-4 md:px-5 py-4 hover:border-amber-400/20 hover:bg-white/[0.04] transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs text-white/40 flex-shrink-0 font-medium">
                          {r.respondent_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {r.respondent_name}
                          </p>
                          {r.respondent_email && (
                            <p className="text-white/30 text-xs truncate hidden sm:block">
                              {r.respondent_email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-white/20 text-xs hidden md:block">
                          {formatTime(r.time_taken)}
                        </span>
                        <span className="text-white/20 text-xs hidden sm:block">
                          {formatDate(r.created_at)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${grade.bg} ${grade.color}`}
                        >
                          {grade.label}
                        </span>
                        <span className="text-white font-bold text-sm">
                          {r.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Mini score bar */}
                    <div className="mt-3 h-1 rounded-full bg-white/5">
                      <div
                        className={`h-1 rounded-full ${r.percentage >= 50 ? "bg-green-400/50" : "bg-red-400/50"}`}
                        style={{ width: `${r.percentage}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
