import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { SiteNav } from "../components/SiteNav";
import { DEMO_FONT_URL, DEMO_NOTES, DEMO_WEEKS_BY_ID } from "../features/home/demoStack";
import { FlyingNotes } from "../features/home/FlyingNotes";
import { ScrollSpikeSection } from "../features/home/ScrollSpikeSection";
import { StackScene } from "../scene/StackScene";

const PERSONAS = [
  {
    title: "Freelancers & solo makers",
    body: "Keep momentum visible when there's no manager checking in on you.",
  },
  {
    title: "Students",
    body: "Turn a week of assignments into a satisfying pile instead of a forgotten checklist.",
  },
  {
    title: "Remote workers",
    body: "Show yourself what a week of async, heads-down work actually looked like.",
  },
  {
    title: "Visual, tactile thinkers",
    body: "For people who need to see progress, not just read a checkmark.",
  },
];

const PROBLEMS = [
  {
    label: "Forgettable",
    body: "Check a box, and the task is gone. No record, no feeling of progress.",
  },
  {
    label: "Overwhelming",
    body: "Backlogs pile up forever. There's no natural reset, so old tasks just guilt you.",
  },
  {
    label: "Flat",
    body: "A list is a list. Nothing about it feels like an actual week of work.",
  },
];

export function HomePage() {
  const { session } = useAuth();

  return (
    <div className="home-page">
      <FlyingNotes />
      <SiteNav />

      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-badge">for people who like crossing things off</span>
          <h1 className="home-hero-title">Finish it. Spike it. Watch your week stack up.</h1>
          <p className="home-hero-sub">
            StickyStack turns every completed task into a sticky note speared onto a growing 3D
            pile — one color per week, so you can actually see your progress instead of just
            deleting it.
          </p>
          <div className="home-hero-actions">
            <Link to={session ? "/app" : "/signup"} className="home-cta-button">
              Start your week
            </Link>
            {!session && <Link to="/login">Log in</Link>}
          </div>
          <ul className="home-hero-chips">
            <li>🔁 Reload-safe pile</li>
            <li>🎨 One color per week</li>
            <li>🖱️ Drag to spin</li>
          </ul>
        </div>
        <div className="home-hero-scene">
          <StackScene
            notes={DEMO_NOTES}
            isLoading={false}
            weeksById={DEMO_WEEKS_BY_ID}
            fontUrl={DEMO_FONT_URL}
            autoRotate
          />
        </div>
      </section>

      <ScrollSpikeSection />

      <p className="home-divider-line">Weekly resets. Zero backlog guilt. Just a pile that grows.</p>

      <section className="home-testimonial">
        <div className="home-testimonial-stars">★★★★★</div>
        <p className="home-testimonial-quote">
          "I finally feel like my finished tasks mean something. Watching the pile grow is weirdly
          satisfying."
        </p>
        {/* Placeholder quote — swap for a real user testimonial before launch. */}
        <p className="home-testimonial-attr">— early user (placeholder)</p>
      </section>

      <section className="home-section">
        <span className="home-eyebrow">who's this for</span>
        <h2 className="home-section-title">We designed StickyStack for people who need to see a week's work</h2>
        <div className="home-persona-grid">
          {PERSONAS.map((p) => (
            <div key={p.title} className="home-card">
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section">
        <h2 className="home-section-title">Most to-do apps are a quiet, forgettable way to work</h2>
        <div className="home-problem-grid">
          {PROBLEMS.map((p) => (
            <div key={p.label} className="home-problem-card">
              <span className="home-problem-label">{p.label}</span>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-final-cta">
        <h2>Ready to see your week stack up?</h2>
        <Link to={session ? "/app" : "/signup"} className="home-cta-button">
          Start your week
        </Link>
      </section>

      <footer className="home-footer">
        <span>StickyStack — a receipt-spike for your to-do list</span>
        <div className="home-footer-links">
          {session ? (
            <Link to="/app">Go to your stack</Link>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/signup">Sign up</Link>
            </>
          )}
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
