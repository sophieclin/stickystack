import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { ColorPickerModal } from "../features/week/ColorPickerModal";
import { GlobalSearch } from "../features/notes/GlobalSearch";
import { TodoSidebar } from "../features/notes/TodoSidebar";
import { useActiveNotes } from "../hooks/useActiveNotes";
import { useAddNote } from "../hooks/useAddNote";
import { useCompleteNote } from "../hooks/useCompleteNote";
import { useCurrentWeek } from "../hooks/useCurrentWeek";
import { useDeleteNote } from "../hooks/useDeleteNote";
import { useDoneNotes } from "../hooks/useDoneNotes";
import { useUncompleteNote } from "../hooks/useUncompleteNote";
import { useUpdateNoteText } from "../hooks/useUpdateNoteText";
import { useUserSettings } from "../hooks/useUserSettings";
import { useWeeks } from "../hooks/useWeeks";
import { FONT_OPTIONS } from "../lib/fonts";
import { supabase } from "../lib/supabaseClient";
import { JarScene } from "../scene/JarScene";
import { StackScene } from "../scene/StackScene";

const UNDO_TOAST_MS = 6000;

function truncateWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return words.join(" ");
  return words.slice(0, maxWords).join(" ") + "…";
}

export function StackPage() {
  const { session } = useAuth();
  const { week, isLoading: weekLoading, setColor } = useCurrentWeek();
  const { notes: activeNotes } = useActiveNotes();
  const { notes: doneNotes, isLoading: doneNotesLoading } = useDoneNotes();
  const weeksQuery = useWeeks();
  const { data: settings } = useUserSettings();
  const addNote = useAddNote();
  const completeNote = useCompleteNote();
  const uncompleteNote = useUncompleteNote();
  const deleteNote = useDeleteNote();
  const updateNoteText = useUpdateNoteText();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [undoToast, setUndoToast] = useState<{ id: string; text: string } | null>(null);
  const undoTimeoutRef = useRef<number | null>(null);

  function handleMarkDone(id: string, text: string) {
    completeNote.mutate(id);
    if (undoTimeoutRef.current) window.clearTimeout(undoTimeoutRef.current);
    setUndoToast({ id, text: truncateWords(text, 4) });
    undoTimeoutRef.current = window.setTimeout(() => setUndoToast(null), UNDO_TOAST_MS);
  }

  function handleUndo() {
    if (!undoToast) return;
    if (undoTimeoutRef.current) window.clearTimeout(undoTimeoutRef.current);
    uncompleteNote.mutate(undoToast.id);
    setUndoToast(null);
  }

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
        <GlobalSearch />
        <div className="stack-header-right">
          <span className="stack-header-greeting">Hi, {displayName}</span>
          <Link to="/history">History</Link>
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
            onMarkDone={handleMarkDone}
            onDelete={(id) => deleteNote.mutate(id)}
          />
        </div>

        <div className="scene-container">
          {settings?.visual_mode === "stars" ? (
            <JarScene notes={doneNotes} isLoading={doneNotesLoading} weeksById={weeksById} />
          ) : (
            <StackScene notes={doneNotes} isLoading={doneNotesLoading} weeksById={weeksById} fontUrl={fontUrl} />
          )}
          {doneNotesLoading && <p className="scene-loading">Loading stack…</p>}
        </div>
      </div>

      {needsColor && (
        <ColorPickerModal submitting={setColor.isPending} onPick={(color) => setColor.mutate(color)} />
      )}

      {undoToast && (
        <div className="undo-toast">
          <span className="undo-toast-text">Completed "{undoToast.text}"</span>
          <button type="button" onClick={handleUndo}>
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
