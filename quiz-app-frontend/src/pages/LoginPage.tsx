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
  const { login } = useAuth();
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0f;
        }
        .login-left {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px 72px;
          overflow: hidden;
        }
        .login-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 50%, rgba(255,180,50,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 60% 80% at 80% 80%, rgba(255,100,80,0.08) 0%, transparent 60%);
        }
        .brand { position: relative; margin-bottom: 64px; }
        .brand-mark { display: inline-flex; align-items: center; gap: 12px; text-decoration: none; }
        .brand-icon {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #ffb432, #ff6450);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }
        .brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700; color: #fff;
        }
        .login-headline { position: relative; }
        .login-headline h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(42px, 4vw, 58px);
          font-weight: 900; line-height: 1.05; color: #fff; margin-bottom: 20px;
        }
        .login-headline h1 span {
          background: linear-gradient(90deg, #ffb432, #ff6450);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .login-headline p {
          font-size: 16px; color: rgba(255,255,255,0.45);
          font-weight: 300; line-height: 1.7; max-width: 320px;
        }
        .decorative-line {
          position: absolute; bottom: 80px; left: 72px; right: 72px;
          height: 1px;
          background: linear-gradient(90deg, rgba(255,180,50,0.3), transparent);
        }
        .decorative-dots { position: absolute; bottom: 48px; left: 72px; display: flex; gap: 8px; }
        .decorative-dots span { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,180,50,0.4); }
        .decorative-dots span:first-child { background: rgba(255,180,50,0.8); }

        .login-right {
          display: flex; align-items: center; justify-content: center;
          padding: 60px 72px;
          background: #0f0f18;
          border-left: 1px solid rgba(255,255,255,0.06);
        }
        .login-card { width: 100%; max-width: 400px; }
        .login-card-header { margin-bottom: 40px; }
        .login-card-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 8px;
        }
        .login-card-header p { font-size: 14px; color: rgba(255,255,255,0.4); font-weight: 300; }

        .form-group { margin-bottom: 20px; }
        .form-label {
          display: block; font-size: 12px; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.5); margin-bottom: 8px;
        }
        .form-input {
          width: 100%; padding: 14px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 15px; color: #fff;
          outline: none; transition: border-color 0.2s, background 0.2s;
        }
        .form-input::placeholder { color: rgba(255,255,255,0.2); }
        .form-input:focus { border-color: rgba(255,180,50,0.5); background: rgba(255,180,50,0.04); }
        .form-input.has-error { border-color: rgba(255,80,80,0.5); }
        .form-error { font-size: 12px; color: #ff6464; margin-top: 6px; }

        .form-options { display: flex; justify-content: flex-end; margin-bottom: 28px; }
        .forgot-link { font-size: 13px; color: rgba(255,180,50,0.7); text-decoration: none; transition: color 0.2s; }
        .forgot-link:hover { color: #ffb432; }

        .general-error {
          padding: 12px 16px;
          background: rgba(255,80,80,0.08);
          border: 1px solid rgba(255,80,80,0.2);
          border-radius: 8px;
          font-size: 13px; color: #ff8080; margin-bottom: 20px;
        }

        .submit-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #ffb432, #ff6450);
          border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
          color: #0a0a0f; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
        }
        .submit-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .submit-btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(10,10,15,0.3); border-top-color: #0a0a0f;
          border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-footer { text-align: center; margin-top: 28px; font-size: 14px; color: rgba(255,255,255,0.3); }
        .login-footer a { color: rgba(255,180,50,0.8); text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .login-footer a:hover { color: #ffb432; }

        @media (max-width: 768px) {
          .login-root { grid-template-columns: 1fr; }
          .login-left { display: none; }
          .login-right { padding: 40px 24px; background: #0a0a0f; border-left: none; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-left">
          <div className="brand">
            <a href="/" className="brand-mark">
              <div className="brand-icon">⚡</div>
              <span className="brand-name">QuizApp</span>
            </a>
          </div>
          <div className="login-headline">
            <h1>
              Test your <span>knowledge</span> every day.
            </h1>
            <p>
              Challenge yourself with curated quizzes, track your progress, and
              climb the leaderboard.
            </p>
          </div>
          <div className="decorative-line" />
          <div className="decorative-dots">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="login-card-header">
              <h2>Welcome back</h2>
              <p>Sign in to continue your journey</p>
            </div>

            {errors.general && (
              <div className="general-error">{errors.general}</div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`form-input${errors.email ? " has-error" : ""}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className={`form-input${errors.password ? " has-error" : ""}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="form-error">{errors.password}</p>
                )}
              </div>

              <div className="form-options">
                <a href="#" className="forgot-link">
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                <span className="submit-btn-inner">
                  {loading && <span className="spinner" />}
                  {loading ? "Signing in..." : "Sign in"}
                </span>
              </button>
            </form>

            <p className="login-footer">
              Don't have an account? <a href="/register">Create one</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
