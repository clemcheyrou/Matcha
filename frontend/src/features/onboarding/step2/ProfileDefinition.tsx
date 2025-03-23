import React from "react";
import { BreadcrumbSteps } from "../BreadcrumbSteps.tsx";
import { GenderCheckbox } from "./GenderCheckbox.tsx";
import { BioDefinition } from "./BioDefinition.tsx";
import { useProfileForm } from "./hooks/useProfileForm.ts";

export const ProfileDefinition = () => {
  const steps = ["Images", "Identity", "Orientation", "Interest"];
  const currentStep = 2;

  const {
    selected,
    setSelected,
    bio,
    age,
    message,
    handleAgeChange,
    handleChange,
    handleSubmit,
  } = useProfileForm();

  const isNextDisabled = !(selected && bio && age);

  return (
    <div className="mb-16 h-screen w-screen text-white px-6 md:px-28 lg:px-96 pb-16">
      <div className="mt-12">
        <BreadcrumbSteps steps={steps} currentStep={currentStep} />
        <div className="px-6 mt-4">
          <h1 className="text-center mt-10">Who I am?</h1>
          <h2 className="mt-10">Select your gender</h2>
          <GenderCheckbox selected={selected} setSelected={setSelected} />

          <div className="mt-4">
            <h2 className="mt-10">Age</h2>
            <input
              id="age"
              type="number"
              value={age}
              onChange={handleAgeChange}
              className="w-full py-2 px-3 mt-2 text-sm text-black rounded-md"
              placeholder="Enter your age"
            />
          </div>

          <BioDefinition bio={bio} handleChange={handleChange} />

          {message && (
            <div className="mt-2 text-xs text-red-500">{message}</div>
          )}

          <div className="mt-36">
            <button
              onClick={handleSubmit}
              disabled={isNextDisabled}
              className={`w-full px-4 font-agbalumo py-2 bg-pink text-white rounded-md ${isNextDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
