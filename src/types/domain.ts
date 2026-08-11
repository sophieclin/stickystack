export type HandwritingFont = "caveat" | "kalam" | "patrick-hand" | "shadows-into-light";

// These are plain `type` aliases (not `interface`) deliberately: @supabase/postgrest-js's
// generic `.insert()`/`.update()` inference (via conditional types checking
// `Relation extends { Insert: unknown }`) silently collapses to `never` when a Database
// table's `Row` is declared as an `interface` instead of a `type` alias.
export type UserSettings = {
  user_id: string;
  archive_months: number;
  handwriting_font: HandwritingFont;
};

export type Week = {
  id: string;
  user_id: string;
  start_date: string; // yyyy-MM-dd, Monday of the week
  color: string | null;
  created_at: string;
};

export type NoteStatus = "active" | "done";

export type Note = {
  id: string;
  user_id: string;
  week_id: string;
  text: string;
  status: NoteStatus;
  stack_position: number;
  created_at: string;
  completed_at: string | null;
};
