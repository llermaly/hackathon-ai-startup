import React from "react";
import { useQueryPing } from "../hooks/ping";

const Header = () => {
  const ping = useQueryPing();

  const getStatusText = () => {
    if (ping.isLoading) {
      return "Loading...";
    }

    if (ping.isError) {
      return "Offline";
    }

    if (ping.data?.ok) {
      return "Online";
    }
  };

  const getStatusColor = () => {
    if (ping.isLoading) {
      return "bg-blue-400";
    }

    if (ping.isError) {
      return "bg-red-400";
    }

    if (ping.data?.ok) {
      return "bg-green-400";
    }
  };

  return (
    <div className="flex flex-row px-1 py-4 flex-2">
      <h1 className="text-lg font-semibold text-gray-800">Agile Loop</h1>
      <div className="items-center flex-1 text-right">
        <span className="inline-block font-light text-gray2">
          <div className="flex items-center gap-2">
            <b>{getStatusText()}</b>
            <span
              className={
                "inline-block w-4 h-4 align-text-bottom  rounded-full " +
                getStatusColor()
              }
            ></span>{" "}
          </div>
        </span>
      </div>
    </div>
  );
};

export default Header;
