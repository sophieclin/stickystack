import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Note, VisualMode, Week } from "../types/domain";

/**
 * A friend's completed-task pile, rendered read-only. Notes carry `text: ""` — the
 * server-side RPC never selects the real column, so there's nothing to redact here.
 */
export function useFriendStack(friendId: string | undefined) {
  const visualModeQuery = useQuery({
    queryKey: ["friend_visual_mode", friendId],
    queryFn: async (): Promise<VisualMode> => {
      const { data, error } = await supabase.rpc("get_friend_visual_mode", {
        p_friend_id: friendId!,
      });
      if (error) throw error;
      return data as VisualMode;
    },
    enabled: !!friendId,
  });

  const stackQuery = useQuery({
    queryKey: ["friend_stack", friendId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_friend_stack", {
        p_friend_id: friendId!,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!friendId,
  });

  const notes: Note[] = useMemo(
    () =>
      (stackQuery.data ?? []).map((row) => ({
        id: row.id,
        user_id: friendId ?? "",
        week_id: row.week_id,
        text: "",
        status: "done" as const,
        stack_position: row.stack_position,
        created_at: row.completed_at ?? "",
        completed_at: row.completed_at,
        is_highlighted: false,
      })),
    [stackQuery.data, friendId],
  );

  const weeksById = useMemo(
    () =>
      new Map<string, Week>(
        (stackQuery.data ?? []).map((row) => [
          row.week_id,
          {
            id: row.week_id,
            user_id: friendId ?? "",
            start_date: "",
            color: row.week_color,
            created_at: "",
          },
        ]),
      ),
    [stackQuery.data, friendId],
  );

  return {
    notes,
    weeksById,
    visualMode: visualModeQuery.data ?? "notes",
    isLoading: visualModeQuery.isLoading || stackQuery.isLoading,
    error: visualModeQuery.error ?? stackQuery.error,
  };
}
