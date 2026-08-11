import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../lib/supabaseClient";
import type { UserSettings } from "../types/domain";

export function useUserSettings() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["user_settings", userId],
    queryFn: async (): Promise<UserSettings> => {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
