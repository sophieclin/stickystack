import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { getCurrentWeekStart } from "../lib/dates";
import { supabase } from "../lib/supabaseClient";
import { useWeeks } from "./useWeeks";

/**
 * Resolves (and lazily creates) this user's current Mon-Sun week row.
 * A missing week for the current period is created on demand, idempotently
 * (unique constraint on (user_id, start_date) + ignoreDuplicates guards races
 * from multiple tabs/devices).
 */
export function useCurrentWeek() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const weeksQuery = useWeeks();
  const weekStart = getCurrentWeekStart();
  const week = weeksQuery.data?.find((w) => w.start_date === weekStart) ?? null;

  const ensureWeek = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const { error } = await supabase
        .from("weeks")
        .upsert(
          { user_id: userId, start_date: weekStart },
          { onConflict: "user_id,start_date", ignoreDuplicates: true },
        );
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["weeks", userId] }),
  });

  const { mutate: triggerEnsureWeek, isPending: isEnsuringWeek } = ensureWeek;
  useEffect(() => {
    if (!userId || weeksQuery.isLoading || week || isEnsuringWeek) return;
    triggerEnsureWeek();
  }, [userId, weeksQuery.isLoading, week, isEnsuringWeek, triggerEnsureWeek]);

  const setColor = useMutation({
    mutationFn: async (color: string) => {
      if (!week) throw new Error("No current week to set a color on");
      const { error } = await supabase.from("weeks").update({ color }).eq("id", week.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["weeks", userId] }),
  });

  return {
    week,
    isLoading: weeksQuery.isLoading || (!week && ensureWeek.isPending),
    setColor,
  };
}
