import { useEffect } from "react";
import api, { setupAxiosInterceptors } from "@/lib/api";

export function useApi() {
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  return api;
}
