import { Link } from "react-router-dom";
import { SiteNav } from "../components/SiteNav";

export function TermsPage() {
  return (
    <div className="legal-page">
      <SiteNav />
      <div className="legal-content">
        <h1>Terms of Service</h1>
        <p className="legal-updated">Last updated August 14, 2026</p>

        <p>
          These terms govern your use of StickyStack. By creating an account or using the app,
          you agree to them.
        </p>

        <h2>The service</h2>
        <p>
          StickyStack is a task tracker: you add tasks to a weekly to-do list, and marking one
          done spears it onto a 3D "receipt spike" as a record of what you finished. It's a small,
          independently-run project, not a company product.
        </p>

        <h2>Your account</h2>
        <p>
          You're responsible for the accuracy of the information you provide and for keeping your
          password secure. Let us know if you suspect unauthorized access to your account.
        </p>

        <h2>Acceptable use</h2>
        <p>
          Use StickyStack for its intended purpose — tracking your own tasks. Don't use it to
          store or share unlawful content, attempt to disrupt the service, or access other users'
          data without permission.
        </p>

        <h2>Your content</h2>
        <p>
          You own the task text and other content you create in StickyStack. We store and display
          it back to you solely to provide the service — we don't claim ownership of it, sell it,
          or use it for anything else.
        </p>

        <h2>Availability</h2>
        <p>
          StickyStack is provided "as is," without uptime or availability guarantees. Features may
          change, and the service may be modified or discontinued at any time.
        </p>

        <h2>Termination</h2>
        <p>
          You can stop using StickyStack and request account deletion at any time (see the{" "}
          <Link to="/privacy">Privacy Policy</Link> for how). We may suspend or terminate accounts
          that violate these terms.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          StickyStack is offered without warranties of any kind. To the extent permitted by law,
          we aren't liable for any damages or data loss arising from your use of the service —
          keep your own backups of anything important.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          We may update these terms as the app evolves. Continued use after a change means you
          accept the updated terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms? Email{" "}
          <a href="mailto:sophielinscl@gmail.com">sophielinscl@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}
