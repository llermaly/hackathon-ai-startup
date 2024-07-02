import { useMutation } from "@tanstack/react-query";
import { fetchRunQuery, fetchRunQueryWithScenario } from "../services/query";

export const useMutationRunQuery = () => {
  return useMutation({
    mutationFn: fetchRunQuery,
  });
};

export const useMutationRunQueryWithScenario = () => {
  return useMutation({
    mutationFn: fetchRunQueryWithScenario,
  });
};
