import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { ColorPickerModal } from "../features/week/ColorPickerModal";
import { AddNoteForm } from "../features/notes/AddNoteForm";
import { NoteListPanel } from "../features/notes/NoteListPanel";
import { useAddNote } from "../hooks/useAddNote";
import { useCompleteNote } from "../hooks/useCompleteNote";
import { useCurrentWeek } from "../hooks/useCurrentWeek";
import { useNotes } from "../hooks/useNotes";
import { useUserSettings } from "../hooks/useUserSettings";
import { useWeeks } from "../hooks/useWeeks";
import { FONT_OPTIONS } from "../lib/fonts";
import { supabase } from "../lib/supabaseClient";
import { StackScene } from "../scene/StackScene";

export function StackPage() {
  const { session } = useAuth();
  const { week, isLoading: weekLoading, setColor } = useCurrentWeek();
  const { notes, isLoading: notesLoading } = useNotes();
  const weeksQuery = useWeeks();
  const { data: settings } = useUserSettings();
  const addNote = useAddNote();
  const completeNote = useCompleteNote();

  const weeksById = useMemo(() => {
    const map = new Map(weeksQuery.data?.map((w) => [w.id, w]) ?? []);
    return map;
  }, [weeksQuery.data]);

  const fontUrl = FONT_OPTIONS[settings?.handwriting_font ?? "caveat"].meshFontUrl;

  const needsColor = !weekLoading && week && !week.color;

  return (
    <div className="stack-page">
      <header className="stack-header">
        <h1>StickyStack</h1>
        <div className="stack-header-right">
          <span className="stack-header-email">{session?.user.email}</span>
          <Link to="/settings">Settings</Link>
          <button type="button" onClick={() => supabase.auth.signOut()}>
            Log out
          </button>
        </div>
      </header>

      <div className="scene-container">
        <StackScene
          notes={notes}
          isLoading={notesLoading}
          weeksById={weeksById}
          fontUrl={fontUrl}
          onCompleteNote={(noteId) => completeNote.mutate(noteId)}
        />
        {notesLoading && <p className="scene-loading">Loading stack…</p>}
      </div>

      <AddNoteForm
        disabled={!week || !week.color}
        submitting={addNote.isPending}
        onSubmit={(text) => {
          if (!week) return;
          addNote.mutate({ weekId: week.id, text });
        }}
      />

      <NoteListPanel
        notes={notes}
        weeksById={weeksById}
        onComplete={(noteId) => completeNote.mutate(noteId)}
      />

      {needsColor && (
        <ColorPickerModal submitting={setColor.isPending} onPick={(color) => setColor.mutate(color)} />
      )}
    </div>
  );
}
