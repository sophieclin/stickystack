import type {
  Friendship,
  FriendshipStatus,
  HandwritingFont,
  Note,
  NoteStatus,
  UserSearchResult,
  VisualMode,
  Week,
} from "./domain";

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
          visual_mode: VisualMode;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          archive_months?: number;
          handwriting_font?: HandwritingFont;
          username?: string | null;
          visual_mode?: VisualMode;
        };
        Update: {
          archive_months?: number;
          handwriting_font?: HandwritingFont;
          username?: string | null;
          visual_mode?: VisualMode;
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
      friendships: {
        Row: Friendship;
        Insert: {
          requester_id: string;
          addressee_id: string;
          status?: FriendshipStatus;
        };
        Update: {
          status?: FriendshipStatus;
          responded_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_users: {
        Args: { query: string };
        Returns: UserSearchResult[];
      };
      send_friend_request: {
        Args: { p_addressee_id: string };
        Returns: Friendship;
      };
    };
  };
};
