import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../lib/supabaseClient";
import type { HandwritingFont } from "../types/domain";

export function useUpdateSettings() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patch: {
      archive_months?: number;
      handwriting_font?: HandwritingFont;
      username?: string;
    }) => {
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase.from("user_settings").update(patch).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user_settings", userId] }),
  });
}
