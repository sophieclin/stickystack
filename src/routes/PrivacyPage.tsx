import { SiteNav } from "../components/SiteNav";

export function PrivacyPage() {
  return (
    <div className="legal-page">
      <SiteNav />
      <div className="legal-content">
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated August 14, 2026</p>

        <p>
          This explains what StickyStack collects, how it's used, and how you can control it.
          StickyStack is a small, independently-run project — there's no ad network or data
          broker involved.
        </p>

        <h2>What we collect</h2>
        <p>
          <strong>Account info:</strong> the email and password you sign up with (your password is
          never stored in readable form — it's handled by our authentication provider,
          Supabase), and the username you choose.
        </p>
        <p>
          <strong>Content you create:</strong> your task text, the color you pick for each week,
          and preferences like your handwriting font and archive settings.
        </p>
        <p>
          We don't collect payment information, and we don't run any third-party analytics or
          advertising trackers on the app.
        </p>

        <h2>How it's used</h2>
        <p>
          Your data is used only to run the app: to show you your tasks, keep you signed in, and
          apply your saved preferences. We don't sell it, share it with third parties, or use it
          for advertising.
        </p>

        <h2>Where it's stored</h2>
        <p>
          Data is stored in a Supabase-hosted Postgres database. Supabase also handles
          authentication (sign-up, login, password reset) on our behalf.
        </p>

        <h2>Local storage</h2>
        <p>
          Your browser stores an authentication session token in local storage so you stay logged
          in between visits. It's cleared when you log out.
        </p>

        <h2>Data retention & deletion</h2>
        <p>
          Your data is kept for as long as your account is active. To delete your account and all
          associated data, email{" "}
          <a href="mailto:sophielinscl@gmail.com">sophielinscl@gmail.com</a> — we don't yet have a
          self-serve deletion button, but we'll act on requests promptly.
        </p>

        <h2>Your rights</h2>
        <p>
          You can ask to access, correct, or delete your data at any time by reaching out at the
          email above.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          If this policy changes in a meaningful way, we'll update the date at the top of this
          page.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? Email{" "}
          <a href="mailto:sophielinscl@gmail.com">sophielinscl@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}
