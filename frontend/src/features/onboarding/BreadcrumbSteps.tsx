import React from 'react';
import { Link } from 'react-router-dom';

export const BreadcrumbSteps = ({ steps, currentStep }) => {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-between w-full mb-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex-1 text-center cursor-pointer"
          >
            <Link
              to={`/step${index + 1}`} 
              className={`text-sm ${
                index + 1 === currentStep
                  ? "text-white font-semibold"
                  : "text-white opacity-50"
              }`}
            >
              {step}
            </Link>
          </div>
        ))}
      </div>

      <div className="relative w-full flex items-center">
        {steps.map((_, index) => (
          <React.Fragment key={index}>
            <div
              className={`h-1 flex-1 ${
                index + 1 === currentStep
                  ? "bg-white"
                  : "bg-white opacity-50"
              }`}
              style={{
                marginLeft: index === 0 ? "12px" : "10px",
                marginRight: index === steps.length - 1 ? "12px" : "10px",
              }}
            ></div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
