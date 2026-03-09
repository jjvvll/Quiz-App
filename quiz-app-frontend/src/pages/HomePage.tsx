import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .home-root {
          min-height: 100vh;
          background: #0a0a0f;
          font-family: 'DM Sans', sans-serif;
          display: flex; flex-direction: column;
        }
        .home-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 24px 64px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .brand-mark {
          display: flex; align-items: center; gap: 12px; text-decoration: none;
        }
        .brand-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #ffb432, #ff6450);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: #fff;
        }
        .nav-right { display: flex; align-items: center; gap: 16px; }
        .nav-user {
          font-size: 14px; color: rgba(255,255,255,0.45); font-weight: 300;
        }
        .nav-user strong { color: rgba(255,255,255,0.8); font-weight: 500; }
        .logout-btn {
          padding: 9px 20px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: all 0.2s;
        }
        .logout-btn:hover { border-color: rgba(255,80,80,0.4); color: #ff8080; }

        .home-hero {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          padding: 80px 64px;
        }
        .home-hero::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,180,50,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(255,100,80,0.05) 0%, transparent 60%);
        }
        .hero-grid-bg {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 70%);
        }
        .hero-content { position: relative; text-align: center; max-width: 640px; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px;
          background: rgba(255,180,50,0.08);
          border: 1px solid rgba(255,180,50,0.2);
          border-radius: 100px;
          font-size: 13px; font-weight: 500;
          color: rgba(255,180,50,0.9);
          margin-bottom: 32px;
        }
        .hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #ffb432;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(48px, 6vw, 76px);
          font-weight: 900; line-height: 1.0; color: #fff;
          letter-spacing: -1px; margin-bottom: 24px;
        }
        .hero-title span {
          background: linear-gradient(90deg, #ffb432 0%, #ff6450 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-subtitle {
          font-size: 18px; font-weight: 300;
          color: rgba(255,255,255,0.45);
          line-height: 1.7; margin-bottom: 48px;
        }

        @media (max-width: 768px) {
          .home-nav { padding: 20px 24px; }
          .home-hero { padding: 60px 24px; }
          .nav-user { display: none; }
        }
      `}</style>

      <div className="home-root">
        <nav className="home-nav">
          <a href="/home" className="brand-mark">
            <div className="brand-icon">⚡</div>
            <span className="brand-name">QuizApp</span>
          </a>
          <div className="nav-right">
            {user && (
              <span className="nav-user">
                Hello, <strong>{user.name}</strong>
              </span>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </nav>

        <main className="home-hero">
          <div className="hero-grid-bg" />
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Welcome to QuizApp
            </div>
            <h1 className="hero-title">
              Where <span>curiosity</span> meets challenge.
            </h1>
            <p className="hero-subtitle">
              Welcome to QuizApp — your place to learn, compete, and grow
              through the power of quizzes.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
