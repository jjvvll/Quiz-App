import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ApiError } from "../types/auth";
import { useState } from "react";

interface LoginForm {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email address";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Minimum 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await login(form);
      navigate("/home");
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: ApiError } };
      const message =
        apiErr?.response?.data?.message ??
        "Invalid credentials. Please try again.";
      const fieldErrors = apiErr?.response?.data?.errors ?? {};
      setErrors({
        general: !Object.keys(fieldErrors).length ? message : undefined,
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-zinc-950 font-sans">
      {/* Left panel */}
      <div className="relative hidden md:flex flex-col justify-center px-18 py-20 overflow-hidden px-[72px]">
        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_20%_50%,rgba(255,180,50,0.12),transparent_70%)]" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_80%_at_80%_80%,rgba(255,100,80,0.08),transparent_60%)]" />

        {/* Brand */}
        <div className="relative mb-16">
          <a href="/" className="inline-flex items-center gap-3 no-underline">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br from-amber-400 to-red-500">
              ⚡
            </div>
            <span className="text-white text-2xl font-bold">QuizApp</span>
          </a>
        </div>

        {/* Headline */}
        <div className="relative">
          <h1 className="text-white font-black leading-tight mb-5 text-5xl">
            Test your{" "}
            <span className="bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">
              knowledge
            </span>{" "}
            every day.
          </h1>
          <p className="text-white/45 font-light leading-relaxed max-w-xs text-base">
            Challenge yourself with curated quizzes, track your progress, and
            climb the leaderboard.
          </p>
        </div>

        {/* Decorative line */}
        <div className="absolute bottom-20 left-[72px] right-[72px] h-px bg-gradient-to-r from-amber-400/30 to-transparent" />

        {/* Dots */}
        <div className="absolute bottom-12 left-[72px] flex gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/40" />
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center border-l border-white/5 bg-zinc-900 px-6 md:px-[72px] py-[60px]">
        <div className="w-full max-w-sm">
          {/* Card header */}
          <div className="mb-10">
            <h2 className="text-white text-3xl font-bold mb-2">Welcome back</h2>
            <p className="text-white/40 text-sm font-light">
              Sign in to continue your journey
            </p>
            {/* Debug — remove after testing */}
            {user && (
              <p className="mt-2 text-xs text-amber-400/60">
                Already logged in as: {user.name}
              </p>
            )}
          </div>

          {/* General error */}
          {errors.general && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-xs font-medium uppercase tracking-widest text-white/50 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
                className={`w-full px-4 py-3.5 rounded-xl text-white text-[15px] outline-none border transition-all duration-200 bg-white/5 placeholder:text-white/20 focus:border-amber-400/50 focus:bg-amber-400/[0.04] ${
                  errors.email ? "border-red-500/50" : "border-white/10"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-5">
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-widest text-white/50 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                className={`w-full px-4 py-3.5 rounded-xl text-white text-[15px] outline-none border transition-all duration-200 bg-white/5 placeholder:text-white/20 focus:border-amber-400/50 focus:bg-amber-400/[0.04] ${
                  errors.password ? "border-red-500/50" : "border-white/10"
                }`}
              />
              {errors.password && (
                <p className="text-xs text-red-400 mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Forgot */}
            <div className="flex justify-end mb-7">
              <a
                href="#"
                className="text-sm text-amber-400/70 no-underline transition-colors hover:text-amber-400"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-zinc-950 text-[15px] font-medium border-none cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-br from-amber-400 to-red-500 hover:opacity-90 hover:-translate-y-px"
            >
              <span className="flex items-center justify-center gap-2">
                {loading && (
                  <span className="w-4 h-4 rounded-full border-2 border-zinc-950/30 border-t-zinc-950 animate-spin" />
                )}
                {loading ? "Signing in..." : "Sign in"}
              </span>
            </button>
          </form>

          <p className="text-center mt-7 text-sm text-white/30">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-amber-400/80 font-medium no-underline transition-colors hover:text-amber-400"
            >
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
