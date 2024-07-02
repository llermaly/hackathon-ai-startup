import { useQuery } from "@tanstack/react-query";
import { fetchPing } from "../services/ping";

export const useQueryPing = () => {
  return useQuery({
    queryFn: fetchPing,
    queryKey: ["ping"],
  });
};
