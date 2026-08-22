import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { UserSearchResult } from "../types/domain";

/** Searches other users by username. Empty/whitespace-only queries are not run. */
export function useSearchUsers(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["search_users", trimmed],
    queryFn: async (): Promise<UserSearchResult[]> => {
      const { data, error } = await supabase.rpc("search_users", { query: trimmed });
      if (error) throw error;
      return data;
    },
    enabled: trimmed.length > 0,
  });
}
