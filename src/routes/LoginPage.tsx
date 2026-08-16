import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { SiteNav } from "../components/SiteNav";
import { Turnstile } from "../components/Turnstile";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../lib/supabaseClient";

export function LoginPage() {
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (session) return <Navigate to="/app" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    });
    setSubmitting(false);
    if (error) setError(error.message);
  }

  return (
    <div className="auth-page">
      <SiteNav />
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Log in</h1>
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
          <label>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <Turnstile onVerify={setCaptchaToken} />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </button>
          <p className="auth-switch">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
          <p className="auth-switch">
            No account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
