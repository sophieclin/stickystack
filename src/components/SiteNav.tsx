import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

/** Top nav shown on the logged-out-reachable pages (home, login, signup). */
export function SiteNav() {
  const { session } = useAuth();

  return (
    <header className="home-nav">
      <Link to="/" className="home-logo">
        StickyStack
      </Link>
      <nav className="home-nav-links">
        {session ? (
          <Link to="/app" className="home-nav-cta">
            Go to your stack
          </Link>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/signup" className="home-nav-cta">
              Sign up for free
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
