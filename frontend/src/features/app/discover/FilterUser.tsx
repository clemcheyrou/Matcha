import React, { useState, useEffect } from "react";
import { IoIosOptions } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { updateFilter } from "../../../store/slice/filtersSlice.ts";

const interestsList = [
  "Vegan",
  "Geek",
  "Piercing",
  "Music",
  "Gaming",
  "Fitness",
  "Travel",
  "Books",
  "Movies",
  "Art",
];

export const FilterUser = () => {
  const filters = useSelector((state: RootState) => state.filters);
  const dispatch = useDispatch<AppDispatch>();
  const [tempFilters, setTempFilters] = useState(filters);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleRangeChange = (key: string, min: number, max: number) => {
    setTempFilters((prev) => ({
      ...prev,
      [key]: [min, max],
    }));
  };

  const handleTagClick = (tag: string) => {
    setTempFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleApplyFilters = () => {
    dispatch(updateFilter({ key: "tags", value: tempFilters.tags }));
    dispatch(updateFilter({ key: "age", value: tempFilters.age }));
    dispatch(updateFilter({ key: "location", value: tempFilters.location }));
    dispatch(updateFilter({ key: "fame", value: tempFilters.fame }));
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    dispatch(updateFilter({
      key: "age",
      value: [0, 100],
    }));
    dispatch(updateFilter({
      key: "location",
      value: [0, 1000],
    }));
    dispatch(updateFilter({
      key: "fame",
      value: [0, 100],
    }));
    dispatch(updateFilter({
      key: "tags",
      value: [],
    }));
    setTempFilters({
      age: [0, 100],
      location: [0, 1000],
      fame: [0, 100],
      tags: [],
    });
	setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="cursor-pointer mr-6" onClick={toggleDropdown}>
        <IoIosOptions size={20} className="text-white" />
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-6 w-64 bg-[#191919] rounded shadow-lg z-10 p-4 max-h-102 overflow-auto">
          {["age", "location", "fame"].map((key) => (
            <div key={key} className="mb-2">
              <div className="flex justify-between items-center text-s mb-2">
                <label className="block capitalize text-sm">{key} range</label>
                <span className="opacity-60">
                  {tempFilters[key][0]} - {tempFilters[key][1]}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <input
                  type="number"
                  value={tempFilters[key][0]}
                  onChange={(e) => handleRangeChange(key, parseInt(e.target.value), tempFilters[key][1])}
                  className="w-1/3 p-1 bg-bg border text-xs rounded-md"
                />
                <input
                  type="number"
                  value={tempFilters[key][1]}
                  onChange={(e) => handleRangeChange(key, tempFilters[key][0], parseInt(e.target.value))}
                  className="w-1/3 p-1 bg-bg border text-xs rounded-md"
                />
              </div>
            </div>
          ))}

          <div className="mb-2">
            <label className="block mb-2 text-sm">Interests</label>
            <div className="flex flex-wrap gap-2">
              {interestsList.map((tag) => (
                <button
                  key={tag}
                  className={`px-2 py-1 rounded text-xs ${
                    tempFilters.tags.includes(tag)
                      ? "bg-[#EC4899] text-white"
                      : "border"
                  }`}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleApplyFilters}
              className="mt-4 bg-[#EC4899] text-white rounded px-2 py-1 w-full text-sm"
            >
              Apply Filter
            </button>
            <button
              onClick={handleResetFilters}
              className="mt-4 bg-[#888] text-white rounded px-2 py-1 w-full ml-2 text-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
