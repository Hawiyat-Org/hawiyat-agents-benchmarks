import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDashboard } from "./use-queries.js";

export function useAutoRefreshDashboard() {
  const queryClient = useQueryClient();
  useDashboard();

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }, 30 * 1000);
    return () => clearInterval(interval);
  }, [queryClient]);
}
