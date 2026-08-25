import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export function useToggleHighlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isHighlighted }: { id: string; isHighlighted: boolean }) => {
      const { error } = await supabase
        .from("notes")
        .update({ is_highlighted: isHighlighted })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });
}
