import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthService from "../services/AuthService";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async () => {
    setError(null);
    setFieldErrors({});

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("All fields are required.");
      return;
    }
    if (form.password !== form.password_confirmation) {
      setFieldErrors({ password_confirmation: ["Passwords do not match."] });
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.register(form);
      if (!response.success) {
        setError(response.message);
        if (response.errors) setFieldErrors(response.errors);
        return;
      }
      // log them in after successful registration
      await login({ email: form.email, password: form.password });
      navigate("/home");
    } catch (err: unknown) {
      const apiErr = err as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      const data = apiErr?.response?.data;
      if (data?.errors) setFieldErrors(data.errors);
      setError(data?.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form) => fieldErrors[key]?.[0] ?? null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 bg-gradient-to-br from-amber-400 to-red-500">
            ⚡
          </div>
          <span className="text-white text-lg font-bold">QuizApp</span>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            Create an account
          </h1>
          <p className="text-white/40 text-sm">
            Start building your quizzes today
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
          {/* Global error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="mb-4">
            <label className="block text-xs uppercase tracking-widest text-white/40 font-medium mb-2">
              Full name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={`w-full px-4 py-3 rounded-xl text-white text-sm border bg-white/5 focus:outline-none placeholder:text-white/20 transition-colors ${
                field("name")
                  ? "border-red-500/40 focus:border-red-500/60"
                  : "border-white/10 focus:border-amber-400/50"
              }`}
            />
            {field("name") && (
              <p className="mt-1.5 text-xs text-red-400">{field("name")}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs uppercase tracking-widest text-white/40 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={`w-full px-4 py-3 rounded-xl text-white text-sm border bg-white/5 focus:outline-none placeholder:text-white/20 transition-colors ${
                field("email")
                  ? "border-red-500/40 focus:border-red-500/60"
                  : "border-white/10 focus:border-amber-400/50"
              }`}
            />
            {field("email") && (
              <p className="mt-1.5 text-xs text-red-400">{field("email")}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-xs uppercase tracking-widest text-white/40 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={`w-full px-4 py-3 rounded-xl text-white text-sm border bg-white/5 focus:outline-none placeholder:text-white/20 transition-colors ${
                field("password")
                  ? "border-red-500/40 focus:border-red-500/60"
                  : "border-white/10 focus:border-amber-400/50"
              }`}
            />
            {field("password") && (
              <p className="mt-1.5 text-xs text-red-400">{field("password")}</p>
            )}
          </div>

          {/* Confirm password */}
          <div className="mb-6">
            <label className="block text-xs uppercase tracking-widest text-white/40 font-medium mb-2">
              Confirm password
            </label>
            <input
              type="password"
              placeholder="Repeat your password"
              value={form.password_confirmation}
              onChange={(e) =>
                setForm({ ...form, password_confirmation: e.target.value })
              }
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={`w-full px-4 py-3 rounded-xl text-white text-sm border bg-white/5 focus:outline-none placeholder:text-white/20 transition-colors ${
                field("password_confirmation")
                  ? "border-red-500/40 focus:border-red-500/60"
                  : "border-white/10 focus:border-amber-400/50"
              }`}
            />
            {field("password_confirmation") && (
              <p className="mt-1.5 text-xs text-red-400">
                {field("password_confirmation")}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium text-zinc-950 border-none cursor-pointer disabled:opacity-60 transition-all duration-200 bg-gradient-to-br from-amber-400 to-red-500 hover:opacity-90 hover:-translate-y-px"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>

        {/* Login link */}
        <p className="text-center text-white/30 text-sm mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-amber-400/80 hover:text-amber-400 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
