import { Link } from "react-router-dom";
import { FONT_OPTION_LIST } from "../lib/fonts";
import { useUserSettings } from "../hooks/useUserSettings";
import { useUpdateSettings } from "../hooks/useUpdateSettings";

const ARCHIVE_MONTH_OPTIONS = [1, 2, 3, 4];

export function SettingsPage() {
  const { data: settings, isLoading } = useUserSettings();
  const updateSettings = useUpdateSettings();

  return (
    <div className="settings-page">
      <header className="stack-header">
        <h1>Settings</h1>
        <Link to="/app">Back to stack</Link>
      </header>

      {isLoading || !settings ? (
        <p>Loading…</p>
      ) : (
        <>
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
