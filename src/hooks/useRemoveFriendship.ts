import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../lib/supabaseClient";

/** Deletes a friendships row by id — covers declining, canceling, and unfriending alike. */
export function useRemoveFriendship() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendships", userId] });
      queryClient.invalidateQueries({ queryKey: ["friend_usernames", userId] });
    },
  });
}
