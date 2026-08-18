import { useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useUserSettings } from "../hooks/useUserSettings";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const { data: settings } = useUserSettings();

  // Applied here (rather than in each authenticated page) since this wraps all of
  // them — /app, /settings, /history — and is the one place that already knows the
  // user is logged in. Cleared on unmount so logging out doesn't leak the theme onto
  // the public marketing pages.
  useEffect(() => {
    if (settings?.visual_mode === "stars") {
      document.documentElement.dataset.theme = "stars";
    } else {
      delete document.documentElement.dataset.theme;
    }
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [settings?.visual_mode]);

  if (loading) return <div className="page-loading">Loading…</div>;
  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
