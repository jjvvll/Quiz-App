import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Redirects unauthenticated users to /login
export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

// Redirects already-authenticated users away from /login or /register
export function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (user) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

function FullPageSpinner() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: "3px solid rgba(255,180,50,0.2)",
          borderTopColor: "#ffb432",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
