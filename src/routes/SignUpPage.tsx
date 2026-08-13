import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { SiteNav } from "../components/SiteNav";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../lib/supabaseClient";

export function SignUpPage() {
  const { session } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (session) return <Navigate to="/app" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (!data.session) {
      setInfo("Check your email to confirm your account, then log in.");
    }
  }

  return (
    <div className="auth-page">
      <SiteNav />
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Sign up</h1>
          <label>
            Username
            <input
              type="text"
              required
              minLength={2}
              maxLength={30}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          {info && <p className="auth-info">{info}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? "Signing up…" : "Sign up"}
          </button>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
