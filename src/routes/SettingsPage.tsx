import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FONT_OPTION_LIST } from "../lib/fonts";
import { useUserSettings } from "../hooks/useUserSettings";
import { useUpdateSettings } from "../hooks/useUpdateSettings";
import { supabase } from "../lib/supabaseClient";

const ARCHIVE_MONTH_OPTIONS = [1, 2, 3, 4];

export function SettingsPage() {
  const { data: settings, isLoading } = useUserSettings();
  const updateSettings = useUpdateSettings();
  const [usernameInput, setUsernameInput] = useState("");

  useEffect(() => {
    setUsernameInput(settings?.username ?? "");
  }, [settings?.username]);

  function handleUsernameSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = usernameInput.trim();
    if (trimmed && trimmed !== settings?.username) {
      updateSettings.mutate({ username: trimmed });
    }
  }

  return (
    <div className="settings-page">
      <header className="stack-header">
        <h1>
          <Link to="/" className="stack-header-logo">
            StickyStack
          </Link>
        </h1>
        <div className="stack-header-right">
          <span className="stack-header-greeting">Settings</span>
          <Link to="/app">Back to stack</Link>
          <button type="button" onClick={() => supabase.auth.signOut()}>
            Log out
          </button>
        </div>
      </header>

      {isLoading || !settings ? (
        <p>Loading…</p>
      ) : (
        <>
          <section>
            <h2>Username</h2>
            <p>Shown as your greeting in the app header.</p>
            <form className="username-form" onSubmit={handleUsernameSubmit}>
              <input
                type="text"
                required
                minLength={2}
                maxLength={30}
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                autoComplete="username"
              />
              <button
                type="submit"
                disabled={updateSettings.isPending || !usernameInput.trim() || usernameInput.trim() === settings.username}
              >
                {updateSettings.isPending ? "Saving…" : "Save"}
              </button>
            </form>
          </section>

          <section>
            <h2>Handwriting font</h2>
            <div className="font-picker">
              {FONT_OPTION_LIST.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  className={`font-card${settings.handwriting_font === font.id ? " font-card--selected" : ""}`}
                  style={{ fontFamily: font.cssFamily }}
                  onClick={() => updateSettings.mutate({ handwriting_font: font.id })}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2>Archive old weeks</h2>
            <p>Weeks older than this are hidden from your stack (nothing is deleted).</p>
            <div className="archive-picker">
              {ARCHIVE_MONTH_OPTIONS.map((months) => (
                <button
                  key={months}
                  type="button"
                  className={`archive-option${settings.archive_months === months ? " archive-option--selected" : ""}`}
                  onClick={() => updateSettings.mutate({ archive_months: months })}
                >
                  {months} month{months > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
