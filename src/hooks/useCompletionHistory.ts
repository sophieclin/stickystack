import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../lib/supabaseClient";
import type { Note } from "../types/domain";

/** Every done note for the user, regardless of whether its week is archived. */
export function useCompletionHistory() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const query = useQuery({
    queryKey: ["notes", "history", userId],
    queryFn: async (): Promise<Note[]> => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId!)
        .eq("status", "done")
        .order("completed_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  return {
    notes: query.data ?? [],
    isLoading: query.isLoading,
  };
}
