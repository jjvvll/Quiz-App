export default function QuizClosedPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-400/10 flex items-center justify-center text-3xl mx-auto mb-6">
          🔒
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Quiz closed</h1>
        <p className="text-white/40 text-sm">
          This quiz is no longer accepting responses.
        </p>
      </div>
    </div>
  );
}
