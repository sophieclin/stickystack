import { Link } from "react-router-dom";
import { SiteNav } from "../components/SiteNav";

export function NotFoundPage() {
  return (
    <div className="auth-page">
      <SiteNav />
      <div className="auth-form-wrap">
        <div className="not-found">
          <h1>404</h1>
          <p>That page doesn't exist — it may have been moved or the link is off.</p>
          <Link to="/" className="home-cta-button">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
