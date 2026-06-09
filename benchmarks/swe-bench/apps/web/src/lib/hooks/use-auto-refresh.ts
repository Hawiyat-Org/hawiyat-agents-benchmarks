import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useAutoRefreshDashboard() {
  const queryClient = useQueryClient();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }, 30000);
    return () => clearInterval(intervalRef.current);
  }, [queryClient]);
}
