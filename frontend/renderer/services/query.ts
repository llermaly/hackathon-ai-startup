import axiosInstance from "./axios";

interface RunQueryProps {
  query: string;
}

export const fetchRunQuery = async (props: RunQueryProps) => {
  const { data } = await axiosInstance.post("/query", props);

  return data;
};

interface RunQueryWithScenarioProps {
  query: string;
  scenario: string;
}

export const fetchRunQueryWithScenario = async (
  props: RunQueryWithScenarioProps
) => {
  const { data } = await axiosInstance.post("/query_with_scenario", props);

  return data;
};
