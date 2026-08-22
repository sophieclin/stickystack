import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../lib/supabaseClient";
import type { Friendship } from "../types/domain";

export type FriendshipView = Friendship & {
  friendId: string;
  friendUsername: string | null;
};

/** Every friendship the caller is part of, split by status/direction, with the other party's username resolved. */
export function useFriendships() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const friendshipsQuery = useQuery({
    queryKey: ["friendships", userId],
    queryFn: async (): Promise<Friendship[]> => {
      const { data, error } = await supabase.from("friendships").select("*");
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const usernamesQuery = useQuery({
    queryKey: ["friend_usernames", userId],
    queryFn: async (): Promise<Map<string, string>> => {
      const { data, error } = await supabase.rpc("get_friend_usernames");
      if (error) throw error;
      return new Map(data.map((row) => [row.user_id, row.username]));
    },
    enabled: !!userId,
  });

  const usernames = usernamesQuery.data;

  const withFriend = useMemo((): FriendshipView[] => {
    if (!usernames) return [];
    return (friendshipsQuery.data ?? []).map((f) => {
      const friendId = f.requester_id === userId ? f.addressee_id : f.requester_id;
      return { ...f, friendId, friendUsername: usernames.get(friendId) ?? null };
    });
  }, [friendshipsQuery.data, usernames, userId]);

  return {
    accepted: withFriend.filter((f) => f.status === "accepted"),
    incomingPending: withFriend.filter((f) => f.status === "pending" && f.addressee_id === userId),
    outgoingPending: withFriend.filter((f) => f.status === "pending" && f.requester_id === userId),
    isLoading: friendshipsQuery.isLoading || usernamesQuery.isLoading,
  };
}
