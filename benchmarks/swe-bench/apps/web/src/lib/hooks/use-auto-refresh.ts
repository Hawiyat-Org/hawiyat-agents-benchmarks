import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDashboard } from "./use-queries.js";

export function useAutoRefreshDashboard() {
  const queryClient = useQueryClient();
  const { data } = useDashboard();

  useEffect(() => {
    if (data) {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  }, [data, queryClient]);
}
