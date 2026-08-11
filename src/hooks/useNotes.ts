import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuth } from "../context/AuthProvider";
import { isWeekArchived } from "../lib/dates";
import { supabase } from "../lib/supabaseClient";
import type { Note } from "../types/domain";
import { useUserSettings } from "./useUserSettings";
import { useWeeks } from "./useWeeks";

/** Active notes across all non-archived weeks, ordered by their global pierce order. */
export function useNotes() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const weeksQuery = useWeeks();
  const settingsQuery = useUserSettings();

  const activeWeekIds = useMemo(() => {
    if (!weeksQuery.data || !settingsQuery.data) return [];
    return weeksQuery.data
      .filter((w) => !isWeekArchived(w.start_date, settingsQuery.data.archive_months))
      .map((w) => w.id);
  }, [weeksQuery.data, settingsQuery.data]);

  const notesQuery = useQuery({
    queryKey: ["notes", userId, activeWeekIds],
    queryFn: async (): Promise<Note[]> => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .in("week_id", activeWeekIds)
        .eq("status", "active")
        .order("stack_position", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!userId && activeWeekIds.length > 0,
  });

  return {
    notes: notesQuery.data ?? [],
    isLoading: weeksQuery.isLoading || settingsQuery.isLoading || notesQuery.isLoading,
  };
}
