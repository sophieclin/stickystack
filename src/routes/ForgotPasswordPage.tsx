import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { SiteNav } from "../components/SiteNav";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../lib/supabaseClient";

export function ForgotPasswordPage() {
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (session) return <Navigate to="/app" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="auth-page">
      <SiteNav />
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Reset your password</h1>
          {sent ? (
            <p className="auth-info">
              If an account exists for {email}, we've sent a link to reset your password.
            </p>
          ) : (
            <>
              <label>
                Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </label>
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" disabled={submitting}>
                {submitting ? "Sending…" : "Send reset link"}
              </button>
            </>
          )}
          <p className="auth-switch">
            <Link to="/login">Back to log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
