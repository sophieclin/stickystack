import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { ColorPickerModal } from "../features/week/ColorPickerModal";
import { TodoSidebar } from "../features/notes/TodoSidebar";
import { useActiveNotes } from "../hooks/useActiveNotes";
import { useAddNote } from "../hooks/useAddNote";
import { useCompleteNote } from "../hooks/useCompleteNote";
import { useCurrentWeek } from "../hooks/useCurrentWeek";
import { useDoneNotes } from "../hooks/useDoneNotes";
import { useUpdateNoteText } from "../hooks/useUpdateNoteText";
import { useUserSettings } from "../hooks/useUserSettings";
import { useWeeks } from "../hooks/useWeeks";
import { FONT_OPTIONS } from "../lib/fonts";
import { supabase } from "../lib/supabaseClient";
import { StackScene } from "../scene/StackScene";

export function StackPage() {
  const { session } = useAuth();
  const { week, isLoading: weekLoading, setColor } = useCurrentWeek();
  const { notes: activeNotes } = useActiveNotes();
  const { notes: doneNotes, isLoading: doneNotesLoading } = useDoneNotes();
  const weeksQuery = useWeeks();
  const { data: settings } = useUserSettings();
  const addNote = useAddNote();
  const completeNote = useCompleteNote();
  const updateNoteText = useUpdateNoteText();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const weeksById = useMemo(() => {
    const map = new Map(weeksQuery.data?.map((w) => [w.id, w]) ?? []);
    return map;
  }, [weeksQuery.data]);

  const fontUrl = FONT_OPTIONS[settings?.handwriting_font ?? "caveat"].meshFontUrl;
  const displayName = settings?.username || session?.user.email;

  const needsColor = !weekLoading && week && !week.color;
  const canAdd = !!week && !!week.color;

  return (
    <div className="stack-page">
      <header className="stack-header">
        <h1>
          <Link to="/" className="stack-header-logo">
            StickyStack
          </Link>
        </h1>
        <div className="stack-header-right">
          <span className="stack-header-greeting">Hi, {displayName}</span>
          <Link to="/settings">Settings</Link>
          <button type="button" onClick={() => supabase.auth.signOut()}>
            Log out
          </button>
        </div>
      </header>

      <div className="stack-body" onClick={() => setSelectedId(null)}>
        <div onClick={(e) => e.stopPropagation()}>
          <TodoSidebar
            notes={activeNotes}
            weeksById={weeksById}
            disabled={!canAdd}
            addDisabled={!canAdd || addNote.isPending}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAdd={() => {
              if (!week) return;
              addNote.mutate(
                { weekId: week.id },
                { onSuccess: (created) => setSelectedId(created.id) },
              );
            }}
            onTextChange={(id, text) => updateNoteText.mutate({ id, text })}
            onMarkDone={(id) => completeNote.mutate(id)}
          />
        </div>

        <div className="scene-container">
          <StackScene notes={doneNotes} isLoading={doneNotesLoading} weeksById={weeksById} fontUrl={fontUrl} />
          {doneNotesLoading && <p className="scene-loading">Loading stack…</p>}
        </div>
      </div>

      {needsColor && (
        <ColorPickerModal submitting={setColor.isPending} onPick={(color) => setColor.mutate(color)} />
      )}
    </div>
  );
}
