import axiosInstance from "./axios";

export const fetchPing = async () => {
  const { data } = await axiosInstance.get("/ping");

  return data;
};
