import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { setSortOption } from "../../../store/slice/sortSlice.ts";

const sortOptions = {
  pertinent: "Pertinence",
  ageAsc: "Increasing age",
  ageDesc: "Descending age",
  loc: "Nearest location",
  popAsc: "Increasing popularity",
  popDesc: "Descending popularity",
  tag: "Common tag",
};

export const SortUser = () => {
  const [isOpen, setIsOpen] = useState(false);
  const filters = useSelector((state: RootState) => state.filters);
  const selectedOption = useSelector((state: RootState) => state.sort) as keyof typeof sortOptions;
  const dispatch = useDispatch<AppDispatch>();

  const toggleDropdown = () => {
    const defaultFilters = {
      age: [0, 100],
      location: [0, 1000],
      fame: [0, 100],
      tags: [],
    };
  
    const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  
    if (
      isEqual(filters.age, defaultFilters.age) &&
      isEqual(filters.location, defaultFilters.location) &&
      isEqual(filters.fame, defaultFilters.fame) &&
      isEqual(filters.tags, defaultFilters.tags)
    ) {
      setIsOpen(prev => !prev);
    }
  };

  const handleOptionClick = (option: string) => {
    dispatch(setSortOption(option));
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div
        className="flex items-center gap-x-2 cursor-pointer"
        onClick={toggleDropdown}
      >
        <p className="mt-0">{sortOptions[selectedOption]}</p>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 mt-6 w-64 bg-bg rounded shadow-lg z-10 p-4"
        >
          <ul className="font-inter text-normal">
            {Object.entries(sortOptions).map(([key, label]) => (
              <li
                key={key}
                className="cursor-pointer p-2 hover:opacity-60 text-sm"
                onClick={() => handleOptionClick(key)}
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
