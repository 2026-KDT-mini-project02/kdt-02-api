import { Navigate, Outlet, useLocation } from "react-router-dom";

function hasLoggedInUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.userid);
  } catch {
    return false;
  }
}

export default function ProtectedRoute() {
  const location = useLocation();

  if (!hasLoggedInUser()) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
