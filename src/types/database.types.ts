import type { HandwritingFont, Note, NoteStatus, Week } from "./domain";

// Hand-written, minimal Supabase database typing (no supabase CLI codegen in this environment).
// Mirrors supabase/migrations/0001_init.sql. `Relationships`/`Views`/`Functions` are required by
// @supabase/postgrest-js's GenericSchema/GenericTable constraints even though this schema has none.
export type Database = {
  public: {
    Tables: {
      user_settings: {
        Row: {
          user_id: string;
          archive_months: number;
          handwriting_font: HandwritingFont;
          username: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          archive_months?: number;
          handwriting_font?: HandwritingFont;
          username?: string | null;
        };
        Update: {
          archive_months?: number;
          handwriting_font?: HandwritingFont;
          username?: string | null;
        };
        Relationships: [];
      };
      weeks: {
        Row: Week;
        Insert: {
          user_id: string;
          start_date: string;
          color?: string | null;
        };
        Update: {
          color?: string | null;
        };
        Relationships: [];
      };
      notes: {
        Row: Note;
        Insert: {
          user_id: string;
          week_id: string;
          text: string;
        };
        Update: {
          text?: string;
          status?: NoteStatus;
          completed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
