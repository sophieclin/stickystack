import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../lib/supabaseClient";

export function useAddNote() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ weekId, text = "New task" }: { weekId: string; text?: string }) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("notes")
        .insert({ user_id: userId, week_id: weekId, text })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });
}
