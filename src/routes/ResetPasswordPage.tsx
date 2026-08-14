import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiteNav } from "../components/SiteNav";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../lib/supabaseClient";

/**
 * Reached via the link in a Supabase password-recovery email, which lands
 * here with tokens in the URL fragment that supabase-js parses into a
 * session automatically — so `session` being set is what proves the link is
 * valid, not `RequireAuth` (a signed-out visitor with no link has no
 * session, and an expired/reused link never gets one either).
 */
export function ResetPasswordPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate("/app", { replace: true });
  }

  return (
    <div className="auth-page">
      <SiteNav />
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Set a new password</h1>
          {loading ? (
            <p>Loading…</p>
          ) : !session ? (
            <p className="auth-error">
              This reset link is invalid or has expired. <Link to="/forgot-password">Request a new one</Link>.
            </p>
          ) : (
            <>
              <label>
                New password
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </label>
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : "Save new password"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
