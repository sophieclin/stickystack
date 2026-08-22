import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../lib/supabaseClient";

export function useSendFriendRequest() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addresseeId: string) => {
      const { data, error } = await supabase.rpc("send_friend_request", {
        p_addressee_id: addresseeId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friendships", userId] }),
  });
}
