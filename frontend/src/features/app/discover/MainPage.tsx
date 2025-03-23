import React, { useState } from "react";
import { FilterUser } from "./FilterUser.tsx";
import { Grid } from "./Grid.tsx";
import { LocationPopup } from "./LocationPopup.tsx";
import { useLocationPopup } from "./hooks/useLocationPopup.ts";
import { SortUser } from "./SortUser.tsx";

const TABS = [
  { key: "discovery" as const, label: "Discovery" },
  { key: "matched" as const, label: "Matched" },
];

export const MainPage = () => {
  const [tab, setTab] = useState<"discovery" | "matched">("discovery");
  const { showLocationPopup, handleAllowLocation, handleClosePopup } = useLocationPopup(); // use the hook

  const renderTabs = () => {
    return (
      <ul className="flex w-full">
        {TABS.map(({ key, label }) => (
          <li
            key={key}
            className={`cursor-pointer py-1 w-1/2 text-center rounded transition-all duration-200 ${
              tab === key ? "bg-white text-[#191919] shadow-md" : "text-white"
            }`}
            onClick={() => setTab(key)}
          >
            {label}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="relative h-full w-full">
      <div className="mt-10 mx-6">
        <div className="w-full flex items-center justify-between gap-4">
          <div className="rounded bg-[#191919] flex-1 min-w-[150px] py-1 pl-1">
            <ul className="flex space-x-2 font-agbalumo whitespace-nowrap">
              {renderTabs()}
            </ul>
          </div>
          <div className="flex flex-shrink-0">
            <FilterUser />
            <SortUser />
          </div>
        </div>
        <div className="mt-4 z-0">
          <Grid viewMode={tab} />
        </div>
      </div>

      {showLocationPopup && (
        <LocationPopup
          onClose={handleClosePopup}
          onAllow={handleAllowLocation}
        />
      )}
    </div>
  );
};
