import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../lib/supabaseClient";
import type { Note } from "../types/domain";

/**
 * Every note for the user — active or done, archived week or not. Powers the
 * quick search on the stack page, which needs to surface tasks that other
 * queries deliberately hide (e.g. an unfinished task whose week aged past
 * the archive cutoff, which `useActiveNotes` excludes entirely).
 */
export function useSearchNotes() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const query = useQuery({
    queryKey: ["notes", "search", userId],
    queryFn: async (): Promise<Note[]> => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
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
