import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../lib/supabaseClient";
import type { Week } from "../types/domain";

export function useWeeks() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["weeks", userId],
    queryFn: async (): Promise<Week[]> => {
      const { data, error } = await supabase
        .from("weeks")
        .select("*")
        .eq("user_id", userId!)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
